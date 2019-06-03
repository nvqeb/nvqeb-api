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
import * as users from "../users";

// MARK: Create
export async function createCommentary(ctx: types.Context, commentary: types.NewCommentary): Promise<types.Commentary> {
    const user = await users.getCurrentUser(ctx);

    return await _createCommentary(user.id, commentary);
}

export async function _createCommentary(userId: string, commentary: types.NewCommentary): Promise<types.Commentary> {
    return await r.table("commentaries").insert(
        {
            ...commentary,
            userId: userId,
            createdAt: r.now(),
            editedAt: r.now(),
            deletedAt: null,
        },
        { returnChanges: true },
    )("changes")(0)("new_val").do(format.commentary);
}

// MARK: Get
export async function getCommentariesForProfessor(ctx: types.Context, professorId: string): Promise<types.Commentary[]> {
    return await r.table("commentaries")
        .getAll(professorId, {
            index: "professorId",
        })
        .filter({ deletedAt: null })
        .orderBy(r.desc("createdAt"))
        .map(format.commentary)
        .coerceTo("array");
}

export async function getCommentariesForSchoolClass(ctx: types.Context, schoolClassId: string): Promise<types.Commentary[]> {
    return await r.table("commentaries")
        .getAll(schoolClassId, {
            index: "schoolClassId",
        })
        .filter({ deletedAt: null })
        .orderBy(r.desc("createdAt"))
        .map(format.commentary)
        .coerceTo("array");
}
