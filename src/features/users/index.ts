// MARK: Database
import r from "../../rethinkdb";

// MARK: Libraries
import * as bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import moment = require("moment");

// MARK: Shared
import strings from "../../shared/strings";
import * as format from "./format";

// MARK: Types
import { err } from "./error";
import * as types from "../../types";

// MARK: Features
import * as cdn from "../cdn";

// MARK: Validation
export async function emailAvailable(ctx: types.Context, email: string): Promise<void> {
    await _emailAvailable(email, await _tryGetCurrentId(ctx));
}

// MARK: Auth
export async function getCurrentUser(ctx: types.Context): Promise<types.User> {
    const user = await _getDbUser({ ctx });

    return await r.expr(user).do(format.user);
}

export async function login(ctx: types.Context, email: string, password: string): Promise<types.User> {
    email = email.toLowerCase().trim();

    const user: DBUser = await r.table("users").getAll(email, {
        index: "email",
    })(0).default(null) || err.WrongLoginOrPassword(strings.error.wrongLoginOrPassword);

    if (!user.password || !bcrypt.compareSync(password, user.password)) {
        throw err.WrongLoginOrPassword(strings.error.wrongLoginOrPassword);
    }

    await r.table("devices").get(ctx.device.id).update({ userId: user.id });

    return await r.expr(user).do(format.user);
}

export async function logout(ctx: types.Context): Promise<void> {
    await r.table("devices").get(ctx.device.id).update({ userId: null });
}

// User Create and Edit
export async function createUser(ctx: types.Context, newUser: types.NewUser): Promise<types.User> {
    return await _createUser(newUser, ctx.device.id);
}

export async function editUser(ctx: types.Context, editUser: types.EditUser): Promise<types.User> {
    return await _editUser(await _getCurrentId(ctx), editUser);
}

export async function setAvatar(ctx: types.Context, avatar: types.UncertainImage): Promise<types.User> {
    return await _setAvatar(await _getCurrentId(ctx), avatar);
}

// MARK: Internals
interface CurrentUserOptions {
    ctx?: types.Context | null;
    userId?: string | null;
    email?: string | null;
    nick?: string | null;
}
export async function _getDbUser(options?: CurrentUserOptions | null): Promise<DBUser> {
    return await _tryGetDbUser(options) || err.WrongLoginOrPassword(strings.error.wrongLoginOrPassword);
}

export async function _tryGetDbUser(options?: CurrentUserOptions | null): Promise<DBUser | null> {
    let user: DBUser | null = null;

    if (options) {
        if (options.email) {
            user = await r.table("users").getAll(options.email, {
                index: "email",
            })(0).default(null) || null;
        }

        if (options.nick) {
            user = await r.table("users").getAll(options.nick, {
                index: "nick",
            })(0).default(null) || null;
        }

        if (options.ctx) {
            user = await r.table("users").get(await _getCurrentId(options.ctx)) || null;
        }

        if (options.userId) {
            user = await r.table("users").get(options.userId) || null;
        }
    }

    if (user && user.deletedAt !== null) {
        user = null;
    }

    return user;
}

// Current UserId
export async function _getCurrentId(ctx: types.Context): Promise<string> {
    return await _tryGetCurrentId(ctx) || err.NotLoggedIn(strings.error.notLoggedIn);
}

export async function _tryGetCurrentId(ctx: types.Context): Promise<string | null> {
    let userId = await r.table("devices").get(ctx.device.id)("userId").default(null);

    if (userId) {
        if (await r.table("users").get(userId).do((u) => u("deletedAt").ne(null))) {
            await r.table("devices").get(ctx.device.id).update({ userId: null });
            userId = null;
        }
    }

    return userId;
}

// Users
export async function _getUser(userId: string): Promise<types.User> {
    return await r.table("users").get(userId).do(format.user) || err.WrongLoginOrPassword(strings.error.notFound.user);
}

export async function _getUsers(pageOffset: number): Promise<types.User[]> {
    const itemsPerPage = 20;

    return await r.table("users")
        .filter({ deletedAt: null })
        .orderBy(r.desc("name"))
        .skip(pageOffset ? pageOffset * itemsPerPage : 0)
        .limit(itemsPerPage)
        .map(format.user);
}

// Create Or Edit
export async function _createUser(newUser: types.NewUser, deviceId?: string): Promise<types.User> {
    newUser = await validateNewUser(newUser);

    const user = await r.table("users").insert(
        {
            ...newUser,
            password: bcrypt.hashSync(newUser.password, bcrypt.genSaltSync()),
            avatar: newUser.avatar ? await cdn._uploadUncertainImage(newUser.avatar, types.ImageFormat.jpeg) : null,
            createdAt: r.now(),
            editedAt: r.now(),
            deletedAt: null,
        },
        { returnChanges: true },
    )("changes")(0)("new_val").do(format.user);

    if (deviceId) {
        await r.table("devices").get(deviceId).update({ userId: user.id });
    }

    return user;
}

export async function _editUser(userId: string, user: types.EditUser): Promise<types.User> {
    user = await validateEditUser(user, userId);

    return await r.table("users").get(userId).update(
        {
            ...editUser,
            avatar: user.avatar ? await cdn._uploadUncertainImage(user.avatar, types.ImageFormat.jpeg) : null,
            editedAt: r.now(),
        },
        { returnChanges: true },
    )("changes")(0)("new_val").do(format.user);
}

export async function _setAvatar(userId: string, avatar: types.UncertainImage): Promise<types.User> {
    return await r.table("users").get(userId).update(
        {
            avatar: avatar ? await cdn._uploadUncertainImage(avatar, types.ImageFormat.jpeg) : null,
            editedAt: r.now(),
        },
        { returnChanges: true },
    )("changes")(0)("new_val").do(format.user);
}

// MARK: Validation
async function validateNewUser(user: types.NewUser): Promise<types.NewUser> {
    user.password = validatePassword(user.password);

    return await validateUser(user);
}

async function validateEditUser(user: types.EditUser, userId: string): Promise<types.EditUser> {
    return await validateUser(user, userId);
}

async function validateUser<T extends types.NewUser | types.EditUser>(user: T, userId: string | null = null): Promise<T> {
    // Profile
    user.name = validateName(user.name);
    user.email = await _emailAvailable(user.email, userId);

    return user;
}

function validateName(name: string): string {
    name = name.trim();

    if (name.length < 3) {
        throw err.InvalidArgument(strings.error.invalidArgument);
    }

    if (name.length > 70) {
        throw err.InvalidArgument(strings.error.invalidArgument);
    }

    return name;
}

function validateEmail(email: string): string {
    email = email.replace(/\s/g, "").toLowerCase().trim();

    if (email.length < 3) {
        throw err.InvalidEmail(strings.error.invalidEmail);
    }

    if (email.length > 260) {
        throw err.InvalidEmail(strings.error.invalidEmail);
    }

    if (!(/.+\@.+\..+/.test(email))) {
        throw err.InvalidEmail(strings.error.invalidEmail);
    }

    return email;
}

function validatePassword(password: string): string {
    if (password.length < 6) {
        throw err.PasswordTooSmall(strings.error.passwordTooSmall);
    }

    return password;
}

// MARK: Availability
async function _emailAvailable(email: string, userId?: string | null): Promise<string> {
    email = validateEmail(email);

    const emailOwner = await _tryGetDbUser({ email });
    if (emailOwner && emailOwner.id !== userId) {
        throw err.EmailAlreadyInUse(strings.error.emailAlreadyInUse);
    }

    return email;
}
