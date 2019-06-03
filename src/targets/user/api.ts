import * as http from "http";
import * as crypto from "crypto";
import * as os from "os";
import * as url from "url";
const Raven = require("raven");

let captureError: (e: Error, req?: http.IncomingMessage, extra?: any) => void = () => {};
export function setCaptureErrorFn(fn: (e: Error, req?: http.IncomingMessage, extra?: any) => void) {
    captureError = fn;
}

let sentryUrl: string | null = null
export function setSentryUrl(url: string) {
    sentryUrl = url;
}

function typeCheckerError(e: Error, ctx: Context) {
    throw e;
}

function padNumber(value: number, length: number) {
    return value.toString().padStart(length, "0");
}

function toDateTimeString(date: Date) {
    return `${
        padNumber(date.getFullYear(), 4)
    }-${
        padNumber(date.getMonth() + 1, 2)
    }-${
        padNumber(date.getDate(), 2)
    } ${
        padNumber(date.getHours(), 2)
    }:${
        padNumber(date.getMinutes(), 2)
    }:${
        padNumber(date.getSeconds(), 2)
    }`;
}
export const cacheConfig: {
    uploadImage?: (ctx: Context, image: Buffer, format: ImageFormat | null, crop: Crop | null) => Promise<{key: any, expirationSeconds: number | null, version: number}>;
    cropImage?: (ctx: Context, src: string, crop: Crop) => Promise<{key: any, expirationSeconds: number | null, version: number}>;
    uploadFile?: (ctx: Context, file: UploadFile) => Promise<{key: any, expirationSeconds: number | null, version: number}>;
    emailAvailable?: (ctx: Context, email: string) => Promise<{key: any, expirationSeconds: number | null, version: number}>;
    getCurrentUser?: (ctx: Context) => Promise<{key: any, expirationSeconds: number | null, version: number}>;
    login?: (ctx: Context, email: string, password: string) => Promise<{key: any, expirationSeconds: number | null, version: number}>;
    logout?: (ctx: Context) => Promise<{key: any, expirationSeconds: number | null, version: number}>;
    createUser?: (ctx: Context, user: NewUser) => Promise<{key: any, expirationSeconds: number | null, version: number}>;
    editUser?: (ctx: Context, user: EditUser) => Promise<{key: any, expirationSeconds: number | null, version: number}>;
    setAvatar?: (ctx: Context, avatar: UncertainImage) => Promise<{key: any, expirationSeconds: number | null, version: number}>;
    getSchoolClass?: (ctx: Context, schoolClassId: string) => Promise<{key: any, expirationSeconds: number | null, version: number}>;
    getSchoolClassesFor?: (ctx: Context, schoolClassIds: string[]) => Promise<{key: any, expirationSeconds: number | null, version: number}>;
    createSchoolClass?: (ctx: Context, schoolClass: NewSchoolClass) => Promise<{key: any, expirationSeconds: number | null, version: number}>;
    editSchoolClass?: (ctx: Context, schoolClassId: string, schoolClass: NewSchoolClass) => Promise<{key: any, expirationSeconds: number | null, version: number}>;
    getProfessor?: (ctx: Context, professorId: string) => Promise<{key: any, expirationSeconds: number | null, version: number}>;
    getProfessors?: (ctx: Context, pageOffset: number) => Promise<{key: any, expirationSeconds: number | null, version: number}>;
    createProfessor?: (ctx: Context, professor: NewProfessor) => Promise<{key: any, expirationSeconds: number | null, version: number}>;
    editProfessor?: (ctx: Context, professorId: string, professor: NewProfessor) => Promise<{key: any, expirationSeconds: number | null, version: number}>;
    getProfessorsFor?: (ctx: Context, schoolClassId: string) => Promise<{key: any, expirationSeconds: number | null, version: number}>;
    createCommentary?: (ctx: Context, commentary: NewCommentary) => Promise<{key: any, expirationSeconds: number | null, version: number}>;
    getCommentariesForProfessor?: (ctx: Context, professorId: string) => Promise<{key: any, expirationSeconds: number | null, version: number}>;
    getCommentariesForSchoolClass?: (ctx: Context, schoolClassId: string) => Promise<{key: any, expirationSeconds: number | null, version: number}>;
    ping?: (ctx: Context) => Promise<{key: any, expirationSeconds: number | null, version: number}>;
    setPushToken?: (ctx: Context, token: string) => Promise<{key: any, expirationSeconds: number | null, version: number}>;
} = {};

export interface LatLng {
    lat: number;
    lng: number;
}

export interface Image {
    thumb: SimpleImage;
    width: number;
    height: number;
    url: string;
}

export interface SimpleImage {
    width: number;
    height: number;
    url: string;
}

export interface File {
    name: string;
    url: string;
}

export interface Crop {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface UncertainImage {
    bytes: Buffer | null;
    image: Image | null;
    crop: Crop | null;
}

export interface UncertainFile {
    fileData: UploadFile | null;
    file: File | null;
}

export interface UploadFile {
    bytes: Buffer;
    name: string;
}

export interface User {
    id: string;
    avatar: Image | null;
    name: string;
    email: string;
    course: string;
}

export interface NewUser {
    password: string;
    avatar: UncertainImage | null;
    name: string;
    email: string;
    course: string;
}

export interface EditUser {
    avatar: UncertainImage | null;
    name: string;
    email: string;
    course: string;
}

export interface UserDetails {
    name: string;
    email: string;
    course: string;
}

export interface SchoolClass {
    id: string;
    description: string;
    name: string;
}

export interface SchoolClassDetails {
    id: string;
    description: string;
    name: string;
}

export interface NewSchoolClass {
    id: string;
    description: string;
    name: string;
}

export interface Professor {
    id: string;
    schoolClasses: SchoolClass[];
    avatar: Image | null;
    name: string;
    tags: string[];
    hardness: number;
}

export interface ProfessorDetails {
    avatar: Image | null;
    name: string;
    tags: string[];
    hardness: number;
}

export interface NewProfessor {
    avatar: UncertainImage | null;
    schoolClassIds: string[];
    name: string;
    tags: string[];
    hardness: number;
}

export interface Commentary {
    id: string;
    user: User;
    schoolClass: SchoolClass | null;
    professor: Professor | null;
    createdAt: Date;
    text: string;
}

export interface CommentaryDetails {
    text: string;
}

export interface NewCommentary {
    professorId: string | null;
    schoolClassId: string | null;
    text: string;
}

export enum ImageFormat {
    png = "png",
    jpeg = "jpeg",
}

export enum ErrorType {
    NotFound = "NotFound",
    InvalidArgument = "InvalidArgument",
    MissingArgument = "MissingArgument",
    WrongLoginOrPassword = "WrongLoginOrPassword",
    NotLoggedIn = "NotLoggedIn",
    PasswordTooSmall = "PasswordTooSmall",
    EmailAlreadyInUse = "EmailAlreadyInUse",
    InvalidEmail = "InvalidEmail",
    Fatal = "Fatal",
    Connection = "Connection",
}

export const fn: {
    uploadImage: (ctx: Context, image: Buffer, format: ImageFormat | null, crop: Crop | null) => Promise<Image>;
    cropImage: (ctx: Context, src: string, crop: Crop) => Promise<Image>;
    uploadFile: (ctx: Context, file: UploadFile) => Promise<File>;
    emailAvailable: (ctx: Context, email: string) => Promise<void>;
    getCurrentUser: (ctx: Context) => Promise<User>;
    login: (ctx: Context, email: string, password: string) => Promise<User>;
    logout: (ctx: Context) => Promise<void>;
    createUser: (ctx: Context, user: NewUser) => Promise<User>;
    editUser: (ctx: Context, user: EditUser) => Promise<User>;
    setAvatar: (ctx: Context, avatar: UncertainImage) => Promise<User>;
    getSchoolClass: (ctx: Context, schoolClassId: string) => Promise<SchoolClass>;
    getSchoolClassesFor: (ctx: Context, schoolClassIds: string[]) => Promise<SchoolClass[]>;
    createSchoolClass: (ctx: Context, schoolClass: NewSchoolClass) => Promise<SchoolClass>;
    editSchoolClass: (ctx: Context, schoolClassId: string, schoolClass: NewSchoolClass) => Promise<SchoolClass>;
    getProfessor: (ctx: Context, professorId: string) => Promise<Professor>;
    getProfessors: (ctx: Context, pageOffset: number) => Promise<Professor[]>;
    createProfessor: (ctx: Context, professor: NewProfessor) => Promise<Professor>;
    editProfessor: (ctx: Context, professorId: string, professor: NewProfessor) => Promise<Professor>;
    getProfessorsFor: (ctx: Context, schoolClassId: string) => Promise<Professor[]>;
    createCommentary: (ctx: Context, commentary: NewCommentary) => Promise<Commentary>;
    getCommentariesForProfessor: (ctx: Context, professorId: string) => Promise<Commentary[]>;
    getCommentariesForSchoolClass: (ctx: Context, schoolClassId: string) => Promise<Commentary[]>;
    ping: (ctx: Context) => Promise<string>;
    setPushToken: (ctx: Context, token: string) => Promise<void>;
} = {
    uploadImage: () => { throw "not implemented"; },
    cropImage: () => { throw "not implemented"; },
    uploadFile: () => { throw "not implemented"; },
    emailAvailable: () => { throw "not implemented"; },
    getCurrentUser: () => { throw "not implemented"; },
    login: () => { throw "not implemented"; },
    logout: () => { throw "not implemented"; },
    createUser: () => { throw "not implemented"; },
    editUser: () => { throw "not implemented"; },
    setAvatar: () => { throw "not implemented"; },
    getSchoolClass: () => { throw "not implemented"; },
    getSchoolClassesFor: () => { throw "not implemented"; },
    createSchoolClass: () => { throw "not implemented"; },
    editSchoolClass: () => { throw "not implemented"; },
    getProfessor: () => { throw "not implemented"; },
    getProfessors: () => { throw "not implemented"; },
    createProfessor: () => { throw "not implemented"; },
    editProfessor: () => { throw "not implemented"; },
    getProfessorsFor: () => { throw "not implemented"; },
    createCommentary: () => { throw "not implemented"; },
    getCommentariesForProfessor: () => { throw "not implemented"; },
    getCommentariesForSchoolClass: () => { throw "not implemented"; },
    ping: () => { throw "not implemented"; },
    setPushToken: () => { throw "not implemented"; },
};

const fnExec: {[name: string]: (ctx: Context, args: any) => Promise<any>} = {
    uploadImage: async (ctx: Context, args: any) => {
        const image = Buffer.from(args.image, "base64");
        const x3605107503 = args.format;
        if (x3605107503 !== null && x3605107503 !== undefined) {
            if (x3605107503 === null || x3605107503 === undefined || typeof x3605107503 !== "string" || !["png", "jpeg"].includes(x3605107503)) {
                const err = new Error("Invalid Type at '" + "uploadImage.args.format" + "', expected AST::EnumType, got '" + x3605107503 + "'");
                typeCheckerError(err, ctx);
            }
        }
        const format = args.format === null || args.format === undefined ? null : args.format;
        const x2220082954 = args.crop;
        if (x2220082954 !== null && x2220082954 !== undefined) {
            if (x2220082954 === null || x2220082954 === undefined) {
                const err = new Error("Invalid Type at '" + "uploadImage.args.crop" + "', expected AST::StructType, got '" + x2220082954 + "'");
                typeCheckerError(err, ctx);
            }
            if (x2220082954.x === null || x2220082954.x === undefined || typeof x2220082954.x !== "number" || (x2220082954.x || 0) !== x2220082954.x || x2220082954.x < 0) {
                const err = new Error("Invalid Type at '" + "uploadImage.args.crop" + ".x" + "', expected AST::UIntPrimitiveType, got '" + x2220082954.x + "'");
                typeCheckerError(err, ctx);
            }
            if (x2220082954.y === null || x2220082954.y === undefined || typeof x2220082954.y !== "number" || (x2220082954.y || 0) !== x2220082954.y || x2220082954.y < 0) {
                const err = new Error("Invalid Type at '" + "uploadImage.args.crop" + ".y" + "', expected AST::UIntPrimitiveType, got '" + x2220082954.y + "'");
                typeCheckerError(err, ctx);
            }
            if (x2220082954.width === null || x2220082954.width === undefined || typeof x2220082954.width !== "number" || (x2220082954.width || 0) !== x2220082954.width || x2220082954.width < 0) {
                const err = new Error("Invalid Type at '" + "uploadImage.args.crop" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x2220082954.width + "'");
                typeCheckerError(err, ctx);
            }
            if (x2220082954.height === null || x2220082954.height === undefined || typeof x2220082954.height !== "number" || (x2220082954.height || 0) !== x2220082954.height || x2220082954.height < 0) {
                const err = new Error("Invalid Type at '" + "uploadImage.args.crop" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x2220082954.height + "'");
                typeCheckerError(err, ctx);
            }
        }
        const crop = args.crop === null || args.crop === undefined ? null : {
            x: args.crop.x || 0,
            y: args.crop.y || 0,
            width: args.crop.width || 0,
            height: args.crop.height || 0,
        };

        let cacheKey: string | null = null, decodedKey: string | null = null, cacheExpirationSeconds: number | null = null, cacheVersion: number | null = null;
        if (cacheConfig.uploadImage) {
            try {
                const {key, expirationSeconds, version} = await cacheConfig.uploadImage(ctx, image, format, crop);
                if (!key) throw "";
                cacheKey = crypto.createHash("sha256").update(JSON.stringify(key)+ "-uploadImage").digest("hex").substr(0, 100); decodedKey = JSON.stringify(key); cacheExpirationSeconds = expirationSeconds; cacheVersion = version;
                const cache = await hook.getCache(cacheKey, version);console.log(JSON.stringify(cache));
                if (cache && (!cache.expirationDate || cache.expirationDate > new Date())) return cache.ret;
            } catch(e) {console.log(JSON.stringify(e));}
        }
        const ret = await fn.uploadImage(ctx, image, format, crop);
        if (ret === null || ret === undefined) {
            const err = new Error("Invalid Type at '" + "uploadImage.ret" + "', expected AST::StructType, got '" + ret + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.thumb === null || ret.thumb === undefined) {
            const err = new Error("Invalid Type at '" + "uploadImage.ret" + ".thumb" + "', expected AST::StructType, got '" + ret.thumb + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.thumb.width === null || ret.thumb.width === undefined || typeof ret.thumb.width !== "number" || (ret.thumb.width || 0) !== ret.thumb.width || ret.thumb.width < 0) {
            const err = new Error("Invalid Type at '" + "uploadImage.ret" + ".thumb" + ".width" + "', expected AST::UIntPrimitiveType, got '" + ret.thumb.width + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.thumb.height === null || ret.thumb.height === undefined || typeof ret.thumb.height !== "number" || (ret.thumb.height || 0) !== ret.thumb.height || ret.thumb.height < 0) {
            const err = new Error("Invalid Type at '" + "uploadImage.ret" + ".thumb" + ".height" + "', expected AST::UIntPrimitiveType, got '" + ret.thumb.height + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.thumb.url === null || ret.thumb.url === undefined || typeof ret.thumb.url !== "string") {
            const err = new Error("Invalid Type at '" + "uploadImage.ret" + ".thumb" + ".url" + "', expected AST::StringPrimitiveType, got '" + ret.thumb.url + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.width === null || ret.width === undefined || typeof ret.width !== "number" || (ret.width || 0) !== ret.width || ret.width < 0) {
            const err = new Error("Invalid Type at '" + "uploadImage.ret" + ".width" + "', expected AST::UIntPrimitiveType, got '" + ret.width + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.height === null || ret.height === undefined || typeof ret.height !== "number" || (ret.height || 0) !== ret.height || ret.height < 0) {
            const err = new Error("Invalid Type at '" + "uploadImage.ret" + ".height" + "', expected AST::UIntPrimitiveType, got '" + ret.height + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.url === null || ret.url === undefined || typeof ret.url !== "string") {
            const err = new Error("Invalid Type at '" + "uploadImage.ret" + ".url" + "', expected AST::StringPrimitiveType, got '" + ret.url + "'");
            typeCheckerError(err, ctx);
        }
        const encodedRet = {
            thumb: {
                width: ret.thumb.width || 0,
                height: ret.thumb.height || 0,
                url: ret.thumb.url,
            },
            width: ret.width || 0,
            height: ret.height || 0,
            url: ret.url,
        };
        if (cacheKey !== null && cacheVersion !== null) hook.setCache(cacheKey, cacheExpirationSeconds ? new Date(new Date().getTime() + (cacheExpirationSeconds * 1000)) : null, cacheVersion, decodedKey!, "uploadImage", encodedRet);
        return encodedRet    },
    cropImage: async (ctx: Context, args: any) => {
        if (args.src === null || args.src === undefined || typeof args.src !== "string") {
            const err = new Error("Invalid Type at '" + "cropImage.args.src" + "', expected AST::StringPrimitiveType, got '" + args.src + "'");
            typeCheckerError(err, ctx);
        }
        const src = args.src;
        if (args.crop === null || args.crop === undefined) {
            const err = new Error("Invalid Type at '" + "cropImage.args.crop" + "', expected AST::StructType, got '" + args.crop + "'");
            typeCheckerError(err, ctx);
        }
        if (args.crop.x === null || args.crop.x === undefined || typeof args.crop.x !== "number" || (args.crop.x || 0) !== args.crop.x || args.crop.x < 0) {
            const err = new Error("Invalid Type at '" + "cropImage.args.crop" + ".x" + "', expected AST::UIntPrimitiveType, got '" + args.crop.x + "'");
            typeCheckerError(err, ctx);
        }
        if (args.crop.y === null || args.crop.y === undefined || typeof args.crop.y !== "number" || (args.crop.y || 0) !== args.crop.y || args.crop.y < 0) {
            const err = new Error("Invalid Type at '" + "cropImage.args.crop" + ".y" + "', expected AST::UIntPrimitiveType, got '" + args.crop.y + "'");
            typeCheckerError(err, ctx);
        }
        if (args.crop.width === null || args.crop.width === undefined || typeof args.crop.width !== "number" || (args.crop.width || 0) !== args.crop.width || args.crop.width < 0) {
            const err = new Error("Invalid Type at '" + "cropImage.args.crop" + ".width" + "', expected AST::UIntPrimitiveType, got '" + args.crop.width + "'");
            typeCheckerError(err, ctx);
        }
        if (args.crop.height === null || args.crop.height === undefined || typeof args.crop.height !== "number" || (args.crop.height || 0) !== args.crop.height || args.crop.height < 0) {
            const err = new Error("Invalid Type at '" + "cropImage.args.crop" + ".height" + "', expected AST::UIntPrimitiveType, got '" + args.crop.height + "'");
            typeCheckerError(err, ctx);
        }
        const crop = {
            x: args.crop.x || 0,
            y: args.crop.y || 0,
            width: args.crop.width || 0,
            height: args.crop.height || 0,
        };

        let cacheKey: string | null = null, decodedKey: string | null = null, cacheExpirationSeconds: number | null = null, cacheVersion: number | null = null;
        if (cacheConfig.cropImage) {
            try {
                const {key, expirationSeconds, version} = await cacheConfig.cropImage(ctx, src, crop);
                if (!key) throw "";
                cacheKey = crypto.createHash("sha256").update(JSON.stringify(key)+ "-cropImage").digest("hex").substr(0, 100); decodedKey = JSON.stringify(key); cacheExpirationSeconds = expirationSeconds; cacheVersion = version;
                const cache = await hook.getCache(cacheKey, version);console.log(JSON.stringify(cache));
                if (cache && (!cache.expirationDate || cache.expirationDate > new Date())) return cache.ret;
            } catch(e) {console.log(JSON.stringify(e));}
        }
        const ret = await fn.cropImage(ctx, src, crop);
        if (ret === null || ret === undefined) {
            const err = new Error("Invalid Type at '" + "cropImage.ret" + "', expected AST::StructType, got '" + ret + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.thumb === null || ret.thumb === undefined) {
            const err = new Error("Invalid Type at '" + "cropImage.ret" + ".thumb" + "', expected AST::StructType, got '" + ret.thumb + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.thumb.width === null || ret.thumb.width === undefined || typeof ret.thumb.width !== "number" || (ret.thumb.width || 0) !== ret.thumb.width || ret.thumb.width < 0) {
            const err = new Error("Invalid Type at '" + "cropImage.ret" + ".thumb" + ".width" + "', expected AST::UIntPrimitiveType, got '" + ret.thumb.width + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.thumb.height === null || ret.thumb.height === undefined || typeof ret.thumb.height !== "number" || (ret.thumb.height || 0) !== ret.thumb.height || ret.thumb.height < 0) {
            const err = new Error("Invalid Type at '" + "cropImage.ret" + ".thumb" + ".height" + "', expected AST::UIntPrimitiveType, got '" + ret.thumb.height + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.thumb.url === null || ret.thumb.url === undefined || typeof ret.thumb.url !== "string") {
            const err = new Error("Invalid Type at '" + "cropImage.ret" + ".thumb" + ".url" + "', expected AST::StringPrimitiveType, got '" + ret.thumb.url + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.width === null || ret.width === undefined || typeof ret.width !== "number" || (ret.width || 0) !== ret.width || ret.width < 0) {
            const err = new Error("Invalid Type at '" + "cropImage.ret" + ".width" + "', expected AST::UIntPrimitiveType, got '" + ret.width + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.height === null || ret.height === undefined || typeof ret.height !== "number" || (ret.height || 0) !== ret.height || ret.height < 0) {
            const err = new Error("Invalid Type at '" + "cropImage.ret" + ".height" + "', expected AST::UIntPrimitiveType, got '" + ret.height + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.url === null || ret.url === undefined || typeof ret.url !== "string") {
            const err = new Error("Invalid Type at '" + "cropImage.ret" + ".url" + "', expected AST::StringPrimitiveType, got '" + ret.url + "'");
            typeCheckerError(err, ctx);
        }
        const encodedRet = {
            thumb: {
                width: ret.thumb.width || 0,
                height: ret.thumb.height || 0,
                url: ret.thumb.url,
            },
            width: ret.width || 0,
            height: ret.height || 0,
            url: ret.url,
        };
        if (cacheKey !== null && cacheVersion !== null) hook.setCache(cacheKey, cacheExpirationSeconds ? new Date(new Date().getTime() + (cacheExpirationSeconds * 1000)) : null, cacheVersion, decodedKey!, "cropImage", encodedRet);
        return encodedRet    },
    uploadFile: async (ctx: Context, args: any) => {
        if (args.file === null || args.file === undefined) {
            const err = new Error("Invalid Type at '" + "uploadFile.args.file" + "', expected AST::StructType, got '" + args.file + "'");
            typeCheckerError(err, ctx);
        }
        if (args.file.name === null || args.file.name === undefined || typeof args.file.name !== "string") {
            const err = new Error("Invalid Type at '" + "uploadFile.args.file" + ".name" + "', expected AST::StringPrimitiveType, got '" + args.file.name + "'");
            typeCheckerError(err, ctx);
        }
        const file = {
            bytes: Buffer.from(args.file.bytes, "base64"),
            name: args.file.name,
        };

        let cacheKey: string | null = null, decodedKey: string | null = null, cacheExpirationSeconds: number | null = null, cacheVersion: number | null = null;
        if (cacheConfig.uploadFile) {
            try {
                const {key, expirationSeconds, version} = await cacheConfig.uploadFile(ctx, file);
                if (!key) throw "";
                cacheKey = crypto.createHash("sha256").update(JSON.stringify(key)+ "-uploadFile").digest("hex").substr(0, 100); decodedKey = JSON.stringify(key); cacheExpirationSeconds = expirationSeconds; cacheVersion = version;
                const cache = await hook.getCache(cacheKey, version);console.log(JSON.stringify(cache));
                if (cache && (!cache.expirationDate || cache.expirationDate > new Date())) return cache.ret;
            } catch(e) {console.log(JSON.stringify(e));}
        }
        const ret = await fn.uploadFile(ctx, file);
        if (ret === null || ret === undefined) {
            const err = new Error("Invalid Type at '" + "uploadFile.ret" + "', expected AST::StructType, got '" + ret + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.name === null || ret.name === undefined || typeof ret.name !== "string") {
            const err = new Error("Invalid Type at '" + "uploadFile.ret" + ".name" + "', expected AST::StringPrimitiveType, got '" + ret.name + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.url === null || ret.url === undefined || typeof ret.url !== "string") {
            const err = new Error("Invalid Type at '" + "uploadFile.ret" + ".url" + "', expected AST::StringPrimitiveType, got '" + ret.url + "'");
            typeCheckerError(err, ctx);
        }
        const encodedRet = {
            name: ret.name,
            url: ret.url,
        };
        if (cacheKey !== null && cacheVersion !== null) hook.setCache(cacheKey, cacheExpirationSeconds ? new Date(new Date().getTime() + (cacheExpirationSeconds * 1000)) : null, cacheVersion, decodedKey!, "uploadFile", encodedRet);
        return encodedRet    },
    emailAvailable: async (ctx: Context, args: any) => {
        if (args.email === null || args.email === undefined || typeof args.email !== "string") {
            const err = new Error("Invalid Type at '" + "emailAvailable.args.email" + "', expected AST::StringPrimitiveType, got '" + args.email + "'");
            typeCheckerError(err, ctx);
        }
        const email = args.email;

        let cacheKey: string | null = null, decodedKey: string | null = null, cacheExpirationSeconds: number | null = null, cacheVersion: number | null = null;
        if (cacheConfig.emailAvailable) {
            try {
                const {key, expirationSeconds, version} = await cacheConfig.emailAvailable(ctx, email);
                if (!key) throw "";
                cacheKey = crypto.createHash("sha256").update(JSON.stringify(key)+ "-emailAvailable").digest("hex").substr(0, 100); decodedKey = JSON.stringify(key); cacheExpirationSeconds = expirationSeconds; cacheVersion = version;
                const cache = await hook.getCache(cacheKey, version);console.log(JSON.stringify(cache));
                if (cache && (!cache.expirationDate || cache.expirationDate > new Date())) return cache.ret;
            } catch(e) {console.log(JSON.stringify(e));}
        }
        const ret = await fn.emailAvailable(ctx, email);
        const encodedRet = null;
        if (cacheKey !== null && cacheVersion !== null) hook.setCache(cacheKey, cacheExpirationSeconds ? new Date(new Date().getTime() + (cacheExpirationSeconds * 1000)) : null, cacheVersion, decodedKey!, "emailAvailable", encodedRet);
        return encodedRet    },
    getCurrentUser: async (ctx: Context, args: any) => {

        let cacheKey: string | null = null, decodedKey: string | null = null, cacheExpirationSeconds: number | null = null, cacheVersion: number | null = null;
        if (cacheConfig.getCurrentUser) {
            try {
                const {key, expirationSeconds, version} = await cacheConfig.getCurrentUser(ctx);
                if (!key) throw "";
                cacheKey = crypto.createHash("sha256").update(JSON.stringify(key)+ "-getCurrentUser").digest("hex").substr(0, 100); decodedKey = JSON.stringify(key); cacheExpirationSeconds = expirationSeconds; cacheVersion = version;
                const cache = await hook.getCache(cacheKey, version);console.log(JSON.stringify(cache));
                if (cache && (!cache.expirationDate || cache.expirationDate > new Date())) return cache.ret;
            } catch(e) {console.log(JSON.stringify(e));}
        }
        const ret = await fn.getCurrentUser(ctx);
        if (ret === null || ret === undefined) {
            const err = new Error("Invalid Type at '" + "getCurrentUser.ret" + "', expected AST::StructType, got '" + ret + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.id === null || ret.id === undefined || typeof ret.id !== "string") {
            const err = new Error("Invalid Type at '" + "getCurrentUser.ret" + ".id" + "', expected AST::StringPrimitiveType, got '" + ret.id + "'");
            typeCheckerError(err, ctx);
        }
        const x3717062682 = ret.avatar;
        if (x3717062682 !== null && x3717062682 !== undefined) {
            if (x3717062682 === null || x3717062682 === undefined) {
                const err = new Error("Invalid Type at '" + "getCurrentUser.ret" + ".avatar" + "', expected AST::StructType, got '" + x3717062682 + "'");
                typeCheckerError(err, ctx);
            }
            if (x3717062682.thumb === null || x3717062682.thumb === undefined) {
                const err = new Error("Invalid Type at '" + "getCurrentUser.ret" + ".avatar" + ".thumb" + "', expected AST::StructType, got '" + x3717062682.thumb + "'");
                typeCheckerError(err, ctx);
            }
            if (x3717062682.thumb.width === null || x3717062682.thumb.width === undefined || typeof x3717062682.thumb.width !== "number" || (x3717062682.thumb.width || 0) !== x3717062682.thumb.width || x3717062682.thumb.width < 0) {
                const err = new Error("Invalid Type at '" + "getCurrentUser.ret" + ".avatar" + ".thumb" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x3717062682.thumb.width + "'");
                typeCheckerError(err, ctx);
            }
            if (x3717062682.thumb.height === null || x3717062682.thumb.height === undefined || typeof x3717062682.thumb.height !== "number" || (x3717062682.thumb.height || 0) !== x3717062682.thumb.height || x3717062682.thumb.height < 0) {
                const err = new Error("Invalid Type at '" + "getCurrentUser.ret" + ".avatar" + ".thumb" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x3717062682.thumb.height + "'");
                typeCheckerError(err, ctx);
            }
            if (x3717062682.thumb.url === null || x3717062682.thumb.url === undefined || typeof x3717062682.thumb.url !== "string") {
                const err = new Error("Invalid Type at '" + "getCurrentUser.ret" + ".avatar" + ".thumb" + ".url" + "', expected AST::StringPrimitiveType, got '" + x3717062682.thumb.url + "'");
                typeCheckerError(err, ctx);
            }
            if (x3717062682.width === null || x3717062682.width === undefined || typeof x3717062682.width !== "number" || (x3717062682.width || 0) !== x3717062682.width || x3717062682.width < 0) {
                const err = new Error("Invalid Type at '" + "getCurrentUser.ret" + ".avatar" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x3717062682.width + "'");
                typeCheckerError(err, ctx);
            }
            if (x3717062682.height === null || x3717062682.height === undefined || typeof x3717062682.height !== "number" || (x3717062682.height || 0) !== x3717062682.height || x3717062682.height < 0) {
                const err = new Error("Invalid Type at '" + "getCurrentUser.ret" + ".avatar" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x3717062682.height + "'");
                typeCheckerError(err, ctx);
            }
            if (x3717062682.url === null || x3717062682.url === undefined || typeof x3717062682.url !== "string") {
                const err = new Error("Invalid Type at '" + "getCurrentUser.ret" + ".avatar" + ".url" + "', expected AST::StringPrimitiveType, got '" + x3717062682.url + "'");
                typeCheckerError(err, ctx);
            }
        }
        if (ret.name === null || ret.name === undefined || typeof ret.name !== "string") {
            const err = new Error("Invalid Type at '" + "getCurrentUser.ret" + ".name" + "', expected AST::StringPrimitiveType, got '" + ret.name + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.email === null || ret.email === undefined || typeof ret.email !== "string") {
            const err = new Error("Invalid Type at '" + "getCurrentUser.ret" + ".email" + "', expected AST::StringPrimitiveType, got '" + ret.email + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.course === null || ret.course === undefined || typeof ret.course !== "string") {
            const err = new Error("Invalid Type at '" + "getCurrentUser.ret" + ".course" + "', expected AST::StringPrimitiveType, got '" + ret.course + "'");
            typeCheckerError(err, ctx);
        }
        const encodedRet = {
            id: ret.id,
            avatar: ret.avatar === null || ret.avatar === undefined ? null : {
                thumb: {
                    width: ret.avatar.thumb.width || 0,
                    height: ret.avatar.thumb.height || 0,
                    url: ret.avatar.thumb.url,
                },
                width: ret.avatar.width || 0,
                height: ret.avatar.height || 0,
                url: ret.avatar.url,
            },
            name: ret.name,
            email: ret.email,
            course: ret.course,
        };
        if (cacheKey !== null && cacheVersion !== null) hook.setCache(cacheKey, cacheExpirationSeconds ? new Date(new Date().getTime() + (cacheExpirationSeconds * 1000)) : null, cacheVersion, decodedKey!, "getCurrentUser", encodedRet);
        return encodedRet    },
    login: async (ctx: Context, args: any) => {
        if (args.email === null || args.email === undefined || typeof args.email !== "string") {
            const err = new Error("Invalid Type at '" + "login.args.email" + "', expected AST::StringPrimitiveType, got '" + args.email + "'");
            typeCheckerError(err, ctx);
        }
        const email = args.email;
        if (args.password === null || args.password === undefined || typeof args.password !== "string") {
            const err = new Error("Invalid Type at '" + "login.args.password" + "', expected AST::StringPrimitiveType, got '" + args.password + "'");
            typeCheckerError(err, ctx);
        }
        const password = args.password;

        let cacheKey: string | null = null, decodedKey: string | null = null, cacheExpirationSeconds: number | null = null, cacheVersion: number | null = null;
        if (cacheConfig.login) {
            try {
                const {key, expirationSeconds, version} = await cacheConfig.login(ctx, email, password);
                if (!key) throw "";
                cacheKey = crypto.createHash("sha256").update(JSON.stringify(key)+ "-login").digest("hex").substr(0, 100); decodedKey = JSON.stringify(key); cacheExpirationSeconds = expirationSeconds; cacheVersion = version;
                const cache = await hook.getCache(cacheKey, version);console.log(JSON.stringify(cache));
                if (cache && (!cache.expirationDate || cache.expirationDate > new Date())) return cache.ret;
            } catch(e) {console.log(JSON.stringify(e));}
        }
        const ret = await fn.login(ctx, email, password);
        if (ret === null || ret === undefined) {
            const err = new Error("Invalid Type at '" + "login.ret" + "', expected AST::StructType, got '" + ret + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.id === null || ret.id === undefined || typeof ret.id !== "string") {
            const err = new Error("Invalid Type at '" + "login.ret" + ".id" + "', expected AST::StringPrimitiveType, got '" + ret.id + "'");
            typeCheckerError(err, ctx);
        }
        const x3351745027 = ret.avatar;
        if (x3351745027 !== null && x3351745027 !== undefined) {
            if (x3351745027 === null || x3351745027 === undefined) {
                const err = new Error("Invalid Type at '" + "login.ret" + ".avatar" + "', expected AST::StructType, got '" + x3351745027 + "'");
                typeCheckerError(err, ctx);
            }
            if (x3351745027.thumb === null || x3351745027.thumb === undefined) {
                const err = new Error("Invalid Type at '" + "login.ret" + ".avatar" + ".thumb" + "', expected AST::StructType, got '" + x3351745027.thumb + "'");
                typeCheckerError(err, ctx);
            }
            if (x3351745027.thumb.width === null || x3351745027.thumb.width === undefined || typeof x3351745027.thumb.width !== "number" || (x3351745027.thumb.width || 0) !== x3351745027.thumb.width || x3351745027.thumb.width < 0) {
                const err = new Error("Invalid Type at '" + "login.ret" + ".avatar" + ".thumb" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x3351745027.thumb.width + "'");
                typeCheckerError(err, ctx);
            }
            if (x3351745027.thumb.height === null || x3351745027.thumb.height === undefined || typeof x3351745027.thumb.height !== "number" || (x3351745027.thumb.height || 0) !== x3351745027.thumb.height || x3351745027.thumb.height < 0) {
                const err = new Error("Invalid Type at '" + "login.ret" + ".avatar" + ".thumb" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x3351745027.thumb.height + "'");
                typeCheckerError(err, ctx);
            }
            if (x3351745027.thumb.url === null || x3351745027.thumb.url === undefined || typeof x3351745027.thumb.url !== "string") {
                const err = new Error("Invalid Type at '" + "login.ret" + ".avatar" + ".thumb" + ".url" + "', expected AST::StringPrimitiveType, got '" + x3351745027.thumb.url + "'");
                typeCheckerError(err, ctx);
            }
            if (x3351745027.width === null || x3351745027.width === undefined || typeof x3351745027.width !== "number" || (x3351745027.width || 0) !== x3351745027.width || x3351745027.width < 0) {
                const err = new Error("Invalid Type at '" + "login.ret" + ".avatar" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x3351745027.width + "'");
                typeCheckerError(err, ctx);
            }
            if (x3351745027.height === null || x3351745027.height === undefined || typeof x3351745027.height !== "number" || (x3351745027.height || 0) !== x3351745027.height || x3351745027.height < 0) {
                const err = new Error("Invalid Type at '" + "login.ret" + ".avatar" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x3351745027.height + "'");
                typeCheckerError(err, ctx);
            }
            if (x3351745027.url === null || x3351745027.url === undefined || typeof x3351745027.url !== "string") {
                const err = new Error("Invalid Type at '" + "login.ret" + ".avatar" + ".url" + "', expected AST::StringPrimitiveType, got '" + x3351745027.url + "'");
                typeCheckerError(err, ctx);
            }
        }
        if (ret.name === null || ret.name === undefined || typeof ret.name !== "string") {
            const err = new Error("Invalid Type at '" + "login.ret" + ".name" + "', expected AST::StringPrimitiveType, got '" + ret.name + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.email === null || ret.email === undefined || typeof ret.email !== "string") {
            const err = new Error("Invalid Type at '" + "login.ret" + ".email" + "', expected AST::StringPrimitiveType, got '" + ret.email + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.course === null || ret.course === undefined || typeof ret.course !== "string") {
            const err = new Error("Invalid Type at '" + "login.ret" + ".course" + "', expected AST::StringPrimitiveType, got '" + ret.course + "'");
            typeCheckerError(err, ctx);
        }
        const encodedRet = {
            id: ret.id,
            avatar: ret.avatar === null || ret.avatar === undefined ? null : {
                thumb: {
                    width: ret.avatar.thumb.width || 0,
                    height: ret.avatar.thumb.height || 0,
                    url: ret.avatar.thumb.url,
                },
                width: ret.avatar.width || 0,
                height: ret.avatar.height || 0,
                url: ret.avatar.url,
            },
            name: ret.name,
            email: ret.email,
            course: ret.course,
        };
        if (cacheKey !== null && cacheVersion !== null) hook.setCache(cacheKey, cacheExpirationSeconds ? new Date(new Date().getTime() + (cacheExpirationSeconds * 1000)) : null, cacheVersion, decodedKey!, "login", encodedRet);
        return encodedRet    },
    logout: async (ctx: Context, args: any) => {

        let cacheKey: string | null = null, decodedKey: string | null = null, cacheExpirationSeconds: number | null = null, cacheVersion: number | null = null;
        if (cacheConfig.logout) {
            try {
                const {key, expirationSeconds, version} = await cacheConfig.logout(ctx);
                if (!key) throw "";
                cacheKey = crypto.createHash("sha256").update(JSON.stringify(key)+ "-logout").digest("hex").substr(0, 100); decodedKey = JSON.stringify(key); cacheExpirationSeconds = expirationSeconds; cacheVersion = version;
                const cache = await hook.getCache(cacheKey, version);console.log(JSON.stringify(cache));
                if (cache && (!cache.expirationDate || cache.expirationDate > new Date())) return cache.ret;
            } catch(e) {console.log(JSON.stringify(e));}
        }
        const ret = await fn.logout(ctx);
        const encodedRet = null;
        if (cacheKey !== null && cacheVersion !== null) hook.setCache(cacheKey, cacheExpirationSeconds ? new Date(new Date().getTime() + (cacheExpirationSeconds * 1000)) : null, cacheVersion, decodedKey!, "logout", encodedRet);
        return encodedRet    },
    createUser: async (ctx: Context, args: any) => {
        if (args.user === null || args.user === undefined) {
            const err = new Error("Invalid Type at '" + "createUser.args.user" + "', expected AST::StructType, got '" + args.user + "'");
            typeCheckerError(err, ctx);
        }
        if (args.user.password === null || args.user.password === undefined || typeof args.user.password !== "string") {
            const err = new Error("Invalid Type at '" + "createUser.args.user" + ".password" + "', expected AST::StringPrimitiveType, got '" + args.user.password + "'");
            typeCheckerError(err, ctx);
        }
        const x4099413847 = args.user.avatar;
        if (x4099413847 !== null && x4099413847 !== undefined) {
            if (x4099413847 === null || x4099413847 === undefined) {
                const err = new Error("Invalid Type at '" + "createUser.args.user" + ".avatar" + "', expected AST::StructType, got '" + x4099413847 + "'");
                typeCheckerError(err, ctx);
            }
            const x157956047 = x4099413847.bytes;
            if (x157956047 !== null && x157956047 !== undefined) {
            }
            const x2528744699 = x4099413847.image;
            if (x2528744699 !== null && x2528744699 !== undefined) {
                if (x2528744699 === null || x2528744699 === undefined) {
                    const err = new Error("Invalid Type at '" + "createUser.args.user" + ".avatar" + ".image" + "', expected AST::StructType, got '" + x2528744699 + "'");
                    typeCheckerError(err, ctx);
                }
                if (x2528744699.thumb === null || x2528744699.thumb === undefined) {
                    const err = new Error("Invalid Type at '" + "createUser.args.user" + ".avatar" + ".image" + ".thumb" + "', expected AST::StructType, got '" + x2528744699.thumb + "'");
                    typeCheckerError(err, ctx);
                }
                if (x2528744699.thumb.width === null || x2528744699.thumb.width === undefined || typeof x2528744699.thumb.width !== "number" || (x2528744699.thumb.width || 0) !== x2528744699.thumb.width || x2528744699.thumb.width < 0) {
                    const err = new Error("Invalid Type at '" + "createUser.args.user" + ".avatar" + ".image" + ".thumb" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x2528744699.thumb.width + "'");
                    typeCheckerError(err, ctx);
                }
                if (x2528744699.thumb.height === null || x2528744699.thumb.height === undefined || typeof x2528744699.thumb.height !== "number" || (x2528744699.thumb.height || 0) !== x2528744699.thumb.height || x2528744699.thumb.height < 0) {
                    const err = new Error("Invalid Type at '" + "createUser.args.user" + ".avatar" + ".image" + ".thumb" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x2528744699.thumb.height + "'");
                    typeCheckerError(err, ctx);
                }
                if (x2528744699.thumb.url === null || x2528744699.thumb.url === undefined || typeof x2528744699.thumb.url !== "string") {
                    const err = new Error("Invalid Type at '" + "createUser.args.user" + ".avatar" + ".image" + ".thumb" + ".url" + "', expected AST::StringPrimitiveType, got '" + x2528744699.thumb.url + "'");
                    typeCheckerError(err, ctx);
                }
                if (x2528744699.width === null || x2528744699.width === undefined || typeof x2528744699.width !== "number" || (x2528744699.width || 0) !== x2528744699.width || x2528744699.width < 0) {
                    const err = new Error("Invalid Type at '" + "createUser.args.user" + ".avatar" + ".image" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x2528744699.width + "'");
                    typeCheckerError(err, ctx);
                }
                if (x2528744699.height === null || x2528744699.height === undefined || typeof x2528744699.height !== "number" || (x2528744699.height || 0) !== x2528744699.height || x2528744699.height < 0) {
                    const err = new Error("Invalid Type at '" + "createUser.args.user" + ".avatar" + ".image" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x2528744699.height + "'");
                    typeCheckerError(err, ctx);
                }
                if (x2528744699.url === null || x2528744699.url === undefined || typeof x2528744699.url !== "string") {
                    const err = new Error("Invalid Type at '" + "createUser.args.user" + ".avatar" + ".image" + ".url" + "', expected AST::StringPrimitiveType, got '" + x2528744699.url + "'");
                    typeCheckerError(err, ctx);
                }
            }
            const x268342071 = x4099413847.crop;
            if (x268342071 !== null && x268342071 !== undefined) {
                if (x268342071 === null || x268342071 === undefined) {
                    const err = new Error("Invalid Type at '" + "createUser.args.user" + ".avatar" + ".crop" + "', expected AST::StructType, got '" + x268342071 + "'");
                    typeCheckerError(err, ctx);
                }
                if (x268342071.x === null || x268342071.x === undefined || typeof x268342071.x !== "number" || (x268342071.x || 0) !== x268342071.x || x268342071.x < 0) {
                    const err = new Error("Invalid Type at '" + "createUser.args.user" + ".avatar" + ".crop" + ".x" + "', expected AST::UIntPrimitiveType, got '" + x268342071.x + "'");
                    typeCheckerError(err, ctx);
                }
                if (x268342071.y === null || x268342071.y === undefined || typeof x268342071.y !== "number" || (x268342071.y || 0) !== x268342071.y || x268342071.y < 0) {
                    const err = new Error("Invalid Type at '" + "createUser.args.user" + ".avatar" + ".crop" + ".y" + "', expected AST::UIntPrimitiveType, got '" + x268342071.y + "'");
                    typeCheckerError(err, ctx);
                }
                if (x268342071.width === null || x268342071.width === undefined || typeof x268342071.width !== "number" || (x268342071.width || 0) !== x268342071.width || x268342071.width < 0) {
                    const err = new Error("Invalid Type at '" + "createUser.args.user" + ".avatar" + ".crop" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x268342071.width + "'");
                    typeCheckerError(err, ctx);
                }
                if (x268342071.height === null || x268342071.height === undefined || typeof x268342071.height !== "number" || (x268342071.height || 0) !== x268342071.height || x268342071.height < 0) {
                    const err = new Error("Invalid Type at '" + "createUser.args.user" + ".avatar" + ".crop" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x268342071.height + "'");
                    typeCheckerError(err, ctx);
                }
            }
        }
        if (args.user.name === null || args.user.name === undefined || typeof args.user.name !== "string") {
            const err = new Error("Invalid Type at '" + "createUser.args.user" + ".name" + "', expected AST::StringPrimitiveType, got '" + args.user.name + "'");
            typeCheckerError(err, ctx);
        }
        if (args.user.email === null || args.user.email === undefined || typeof args.user.email !== "string") {
            const err = new Error("Invalid Type at '" + "createUser.args.user" + ".email" + "', expected AST::StringPrimitiveType, got '" + args.user.email + "'");
            typeCheckerError(err, ctx);
        }
        if (args.user.course === null || args.user.course === undefined || typeof args.user.course !== "string") {
            const err = new Error("Invalid Type at '" + "createUser.args.user" + ".course" + "', expected AST::StringPrimitiveType, got '" + args.user.course + "'");
            typeCheckerError(err, ctx);
        }
        const user = {
            password: args.user.password,
            avatar: args.user.avatar === null || args.user.avatar === undefined ? null : {
                bytes: args.user.avatar.bytes === null || args.user.avatar.bytes === undefined ? null : Buffer.from(args.user.avatar.bytes, "base64"),
                image: args.user.avatar.image === null || args.user.avatar.image === undefined ? null : {
                    thumb: {
                        width: args.user.avatar.image.thumb.width || 0,
                        height: args.user.avatar.image.thumb.height || 0,
                        url: args.user.avatar.image.thumb.url,
                    },
                    width: args.user.avatar.image.width || 0,
                    height: args.user.avatar.image.height || 0,
                    url: args.user.avatar.image.url,
                },
                crop: args.user.avatar.crop === null || args.user.avatar.crop === undefined ? null : {
                    x: args.user.avatar.crop.x || 0,
                    y: args.user.avatar.crop.y || 0,
                    width: args.user.avatar.crop.width || 0,
                    height: args.user.avatar.crop.height || 0,
                },
            },
            name: args.user.name,
            email: args.user.email,
            course: args.user.course,
        };

        let cacheKey: string | null = null, decodedKey: string | null = null, cacheExpirationSeconds: number | null = null, cacheVersion: number | null = null;
        if (cacheConfig.createUser) {
            try {
                const {key, expirationSeconds, version} = await cacheConfig.createUser(ctx, user);
                if (!key) throw "";
                cacheKey = crypto.createHash("sha256").update(JSON.stringify(key)+ "-createUser").digest("hex").substr(0, 100); decodedKey = JSON.stringify(key); cacheExpirationSeconds = expirationSeconds; cacheVersion = version;
                const cache = await hook.getCache(cacheKey, version);console.log(JSON.stringify(cache));
                if (cache && (!cache.expirationDate || cache.expirationDate > new Date())) return cache.ret;
            } catch(e) {console.log(JSON.stringify(e));}
        }
        const ret = await fn.createUser(ctx, user);
        if (ret === null || ret === undefined) {
            const err = new Error("Invalid Type at '" + "createUser.ret" + "', expected AST::StructType, got '" + ret + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.id === null || ret.id === undefined || typeof ret.id !== "string") {
            const err = new Error("Invalid Type at '" + "createUser.ret" + ".id" + "', expected AST::StringPrimitiveType, got '" + ret.id + "'");
            typeCheckerError(err, ctx);
        }
        const x63855418 = ret.avatar;
        if (x63855418 !== null && x63855418 !== undefined) {
            if (x63855418 === null || x63855418 === undefined) {
                const err = new Error("Invalid Type at '" + "createUser.ret" + ".avatar" + "', expected AST::StructType, got '" + x63855418 + "'");
                typeCheckerError(err, ctx);
            }
            if (x63855418.thumb === null || x63855418.thumb === undefined) {
                const err = new Error("Invalid Type at '" + "createUser.ret" + ".avatar" + ".thumb" + "', expected AST::StructType, got '" + x63855418.thumb + "'");
                typeCheckerError(err, ctx);
            }
            if (x63855418.thumb.width === null || x63855418.thumb.width === undefined || typeof x63855418.thumb.width !== "number" || (x63855418.thumb.width || 0) !== x63855418.thumb.width || x63855418.thumb.width < 0) {
                const err = new Error("Invalid Type at '" + "createUser.ret" + ".avatar" + ".thumb" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x63855418.thumb.width + "'");
                typeCheckerError(err, ctx);
            }
            if (x63855418.thumb.height === null || x63855418.thumb.height === undefined || typeof x63855418.thumb.height !== "number" || (x63855418.thumb.height || 0) !== x63855418.thumb.height || x63855418.thumb.height < 0) {
                const err = new Error("Invalid Type at '" + "createUser.ret" + ".avatar" + ".thumb" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x63855418.thumb.height + "'");
                typeCheckerError(err, ctx);
            }
            if (x63855418.thumb.url === null || x63855418.thumb.url === undefined || typeof x63855418.thumb.url !== "string") {
                const err = new Error("Invalid Type at '" + "createUser.ret" + ".avatar" + ".thumb" + ".url" + "', expected AST::StringPrimitiveType, got '" + x63855418.thumb.url + "'");
                typeCheckerError(err, ctx);
            }
            if (x63855418.width === null || x63855418.width === undefined || typeof x63855418.width !== "number" || (x63855418.width || 0) !== x63855418.width || x63855418.width < 0) {
                const err = new Error("Invalid Type at '" + "createUser.ret" + ".avatar" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x63855418.width + "'");
                typeCheckerError(err, ctx);
            }
            if (x63855418.height === null || x63855418.height === undefined || typeof x63855418.height !== "number" || (x63855418.height || 0) !== x63855418.height || x63855418.height < 0) {
                const err = new Error("Invalid Type at '" + "createUser.ret" + ".avatar" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x63855418.height + "'");
                typeCheckerError(err, ctx);
            }
            if (x63855418.url === null || x63855418.url === undefined || typeof x63855418.url !== "string") {
                const err = new Error("Invalid Type at '" + "createUser.ret" + ".avatar" + ".url" + "', expected AST::StringPrimitiveType, got '" + x63855418.url + "'");
                typeCheckerError(err, ctx);
            }
        }
        if (ret.name === null || ret.name === undefined || typeof ret.name !== "string") {
            const err = new Error("Invalid Type at '" + "createUser.ret" + ".name" + "', expected AST::StringPrimitiveType, got '" + ret.name + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.email === null || ret.email === undefined || typeof ret.email !== "string") {
            const err = new Error("Invalid Type at '" + "createUser.ret" + ".email" + "', expected AST::StringPrimitiveType, got '" + ret.email + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.course === null || ret.course === undefined || typeof ret.course !== "string") {
            const err = new Error("Invalid Type at '" + "createUser.ret" + ".course" + "', expected AST::StringPrimitiveType, got '" + ret.course + "'");
            typeCheckerError(err, ctx);
        }
        const encodedRet = {
            id: ret.id,
            avatar: ret.avatar === null || ret.avatar === undefined ? null : {
                thumb: {
                    width: ret.avatar.thumb.width || 0,
                    height: ret.avatar.thumb.height || 0,
                    url: ret.avatar.thumb.url,
                },
                width: ret.avatar.width || 0,
                height: ret.avatar.height || 0,
                url: ret.avatar.url,
            },
            name: ret.name,
            email: ret.email,
            course: ret.course,
        };
        if (cacheKey !== null && cacheVersion !== null) hook.setCache(cacheKey, cacheExpirationSeconds ? new Date(new Date().getTime() + (cacheExpirationSeconds * 1000)) : null, cacheVersion, decodedKey!, "createUser", encodedRet);
        return encodedRet    },
    editUser: async (ctx: Context, args: any) => {
        if (args.user === null || args.user === undefined) {
            const err = new Error("Invalid Type at '" + "editUser.args.user" + "', expected AST::StructType, got '" + args.user + "'");
            typeCheckerError(err, ctx);
        }
        const x2718900964 = args.user.avatar;
        if (x2718900964 !== null && x2718900964 !== undefined) {
            if (x2718900964 === null || x2718900964 === undefined) {
                const err = new Error("Invalid Type at '" + "editUser.args.user" + ".avatar" + "', expected AST::StructType, got '" + x2718900964 + "'");
                typeCheckerError(err, ctx);
            }
            const x736698137 = x2718900964.bytes;
            if (x736698137 !== null && x736698137 !== undefined) {
            }
            const x1221118734 = x2718900964.image;
            if (x1221118734 !== null && x1221118734 !== undefined) {
                if (x1221118734 === null || x1221118734 === undefined) {
                    const err = new Error("Invalid Type at '" + "editUser.args.user" + ".avatar" + ".image" + "', expected AST::StructType, got '" + x1221118734 + "'");
                    typeCheckerError(err, ctx);
                }
                if (x1221118734.thumb === null || x1221118734.thumb === undefined) {
                    const err = new Error("Invalid Type at '" + "editUser.args.user" + ".avatar" + ".image" + ".thumb" + "', expected AST::StructType, got '" + x1221118734.thumb + "'");
                    typeCheckerError(err, ctx);
                }
                if (x1221118734.thumb.width === null || x1221118734.thumb.width === undefined || typeof x1221118734.thumb.width !== "number" || (x1221118734.thumb.width || 0) !== x1221118734.thumb.width || x1221118734.thumb.width < 0) {
                    const err = new Error("Invalid Type at '" + "editUser.args.user" + ".avatar" + ".image" + ".thumb" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x1221118734.thumb.width + "'");
                    typeCheckerError(err, ctx);
                }
                if (x1221118734.thumb.height === null || x1221118734.thumb.height === undefined || typeof x1221118734.thumb.height !== "number" || (x1221118734.thumb.height || 0) !== x1221118734.thumb.height || x1221118734.thumb.height < 0) {
                    const err = new Error("Invalid Type at '" + "editUser.args.user" + ".avatar" + ".image" + ".thumb" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x1221118734.thumb.height + "'");
                    typeCheckerError(err, ctx);
                }
                if (x1221118734.thumb.url === null || x1221118734.thumb.url === undefined || typeof x1221118734.thumb.url !== "string") {
                    const err = new Error("Invalid Type at '" + "editUser.args.user" + ".avatar" + ".image" + ".thumb" + ".url" + "', expected AST::StringPrimitiveType, got '" + x1221118734.thumb.url + "'");
                    typeCheckerError(err, ctx);
                }
                if (x1221118734.width === null || x1221118734.width === undefined || typeof x1221118734.width !== "number" || (x1221118734.width || 0) !== x1221118734.width || x1221118734.width < 0) {
                    const err = new Error("Invalid Type at '" + "editUser.args.user" + ".avatar" + ".image" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x1221118734.width + "'");
                    typeCheckerError(err, ctx);
                }
                if (x1221118734.height === null || x1221118734.height === undefined || typeof x1221118734.height !== "number" || (x1221118734.height || 0) !== x1221118734.height || x1221118734.height < 0) {
                    const err = new Error("Invalid Type at '" + "editUser.args.user" + ".avatar" + ".image" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x1221118734.height + "'");
                    typeCheckerError(err, ctx);
                }
                if (x1221118734.url === null || x1221118734.url === undefined || typeof x1221118734.url !== "string") {
                    const err = new Error("Invalid Type at '" + "editUser.args.user" + ".avatar" + ".image" + ".url" + "', expected AST::StringPrimitiveType, got '" + x1221118734.url + "'");
                    typeCheckerError(err, ctx);
                }
            }
            const x2361341439 = x2718900964.crop;
            if (x2361341439 !== null && x2361341439 !== undefined) {
                if (x2361341439 === null || x2361341439 === undefined) {
                    const err = new Error("Invalid Type at '" + "editUser.args.user" + ".avatar" + ".crop" + "', expected AST::StructType, got '" + x2361341439 + "'");
                    typeCheckerError(err, ctx);
                }
                if (x2361341439.x === null || x2361341439.x === undefined || typeof x2361341439.x !== "number" || (x2361341439.x || 0) !== x2361341439.x || x2361341439.x < 0) {
                    const err = new Error("Invalid Type at '" + "editUser.args.user" + ".avatar" + ".crop" + ".x" + "', expected AST::UIntPrimitiveType, got '" + x2361341439.x + "'");
                    typeCheckerError(err, ctx);
                }
                if (x2361341439.y === null || x2361341439.y === undefined || typeof x2361341439.y !== "number" || (x2361341439.y || 0) !== x2361341439.y || x2361341439.y < 0) {
                    const err = new Error("Invalid Type at '" + "editUser.args.user" + ".avatar" + ".crop" + ".y" + "', expected AST::UIntPrimitiveType, got '" + x2361341439.y + "'");
                    typeCheckerError(err, ctx);
                }
                if (x2361341439.width === null || x2361341439.width === undefined || typeof x2361341439.width !== "number" || (x2361341439.width || 0) !== x2361341439.width || x2361341439.width < 0) {
                    const err = new Error("Invalid Type at '" + "editUser.args.user" + ".avatar" + ".crop" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x2361341439.width + "'");
                    typeCheckerError(err, ctx);
                }
                if (x2361341439.height === null || x2361341439.height === undefined || typeof x2361341439.height !== "number" || (x2361341439.height || 0) !== x2361341439.height || x2361341439.height < 0) {
                    const err = new Error("Invalid Type at '" + "editUser.args.user" + ".avatar" + ".crop" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x2361341439.height + "'");
                    typeCheckerError(err, ctx);
                }
            }
        }
        if (args.user.name === null || args.user.name === undefined || typeof args.user.name !== "string") {
            const err = new Error("Invalid Type at '" + "editUser.args.user" + ".name" + "', expected AST::StringPrimitiveType, got '" + args.user.name + "'");
            typeCheckerError(err, ctx);
        }
        if (args.user.email === null || args.user.email === undefined || typeof args.user.email !== "string") {
            const err = new Error("Invalid Type at '" + "editUser.args.user" + ".email" + "', expected AST::StringPrimitiveType, got '" + args.user.email + "'");
            typeCheckerError(err, ctx);
        }
        if (args.user.course === null || args.user.course === undefined || typeof args.user.course !== "string") {
            const err = new Error("Invalid Type at '" + "editUser.args.user" + ".course" + "', expected AST::StringPrimitiveType, got '" + args.user.course + "'");
            typeCheckerError(err, ctx);
        }
        const user = {
            avatar: args.user.avatar === null || args.user.avatar === undefined ? null : {
                bytes: args.user.avatar.bytes === null || args.user.avatar.bytes === undefined ? null : Buffer.from(args.user.avatar.bytes, "base64"),
                image: args.user.avatar.image === null || args.user.avatar.image === undefined ? null : {
                    thumb: {
                        width: args.user.avatar.image.thumb.width || 0,
                        height: args.user.avatar.image.thumb.height || 0,
                        url: args.user.avatar.image.thumb.url,
                    },
                    width: args.user.avatar.image.width || 0,
                    height: args.user.avatar.image.height || 0,
                    url: args.user.avatar.image.url,
                },
                crop: args.user.avatar.crop === null || args.user.avatar.crop === undefined ? null : {
                    x: args.user.avatar.crop.x || 0,
                    y: args.user.avatar.crop.y || 0,
                    width: args.user.avatar.crop.width || 0,
                    height: args.user.avatar.crop.height || 0,
                },
            },
            name: args.user.name,
            email: args.user.email,
            course: args.user.course,
        };

        let cacheKey: string | null = null, decodedKey: string | null = null, cacheExpirationSeconds: number | null = null, cacheVersion: number | null = null;
        if (cacheConfig.editUser) {
            try {
                const {key, expirationSeconds, version} = await cacheConfig.editUser(ctx, user);
                if (!key) throw "";
                cacheKey = crypto.createHash("sha256").update(JSON.stringify(key)+ "-editUser").digest("hex").substr(0, 100); decodedKey = JSON.stringify(key); cacheExpirationSeconds = expirationSeconds; cacheVersion = version;
                const cache = await hook.getCache(cacheKey, version);console.log(JSON.stringify(cache));
                if (cache && (!cache.expirationDate || cache.expirationDate > new Date())) return cache.ret;
            } catch(e) {console.log(JSON.stringify(e));}
        }
        const ret = await fn.editUser(ctx, user);
        if (ret === null || ret === undefined) {
            const err = new Error("Invalid Type at '" + "editUser.ret" + "', expected AST::StructType, got '" + ret + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.id === null || ret.id === undefined || typeof ret.id !== "string") {
            const err = new Error("Invalid Type at '" + "editUser.ret" + ".id" + "', expected AST::StringPrimitiveType, got '" + ret.id + "'");
            typeCheckerError(err, ctx);
        }
        const x2238344808 = ret.avatar;
        if (x2238344808 !== null && x2238344808 !== undefined) {
            if (x2238344808 === null || x2238344808 === undefined) {
                const err = new Error("Invalid Type at '" + "editUser.ret" + ".avatar" + "', expected AST::StructType, got '" + x2238344808 + "'");
                typeCheckerError(err, ctx);
            }
            if (x2238344808.thumb === null || x2238344808.thumb === undefined) {
                const err = new Error("Invalid Type at '" + "editUser.ret" + ".avatar" + ".thumb" + "', expected AST::StructType, got '" + x2238344808.thumb + "'");
                typeCheckerError(err, ctx);
            }
            if (x2238344808.thumb.width === null || x2238344808.thumb.width === undefined || typeof x2238344808.thumb.width !== "number" || (x2238344808.thumb.width || 0) !== x2238344808.thumb.width || x2238344808.thumb.width < 0) {
                const err = new Error("Invalid Type at '" + "editUser.ret" + ".avatar" + ".thumb" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x2238344808.thumb.width + "'");
                typeCheckerError(err, ctx);
            }
            if (x2238344808.thumb.height === null || x2238344808.thumb.height === undefined || typeof x2238344808.thumb.height !== "number" || (x2238344808.thumb.height || 0) !== x2238344808.thumb.height || x2238344808.thumb.height < 0) {
                const err = new Error("Invalid Type at '" + "editUser.ret" + ".avatar" + ".thumb" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x2238344808.thumb.height + "'");
                typeCheckerError(err, ctx);
            }
            if (x2238344808.thumb.url === null || x2238344808.thumb.url === undefined || typeof x2238344808.thumb.url !== "string") {
                const err = new Error("Invalid Type at '" + "editUser.ret" + ".avatar" + ".thumb" + ".url" + "', expected AST::StringPrimitiveType, got '" + x2238344808.thumb.url + "'");
                typeCheckerError(err, ctx);
            }
            if (x2238344808.width === null || x2238344808.width === undefined || typeof x2238344808.width !== "number" || (x2238344808.width || 0) !== x2238344808.width || x2238344808.width < 0) {
                const err = new Error("Invalid Type at '" + "editUser.ret" + ".avatar" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x2238344808.width + "'");
                typeCheckerError(err, ctx);
            }
            if (x2238344808.height === null || x2238344808.height === undefined || typeof x2238344808.height !== "number" || (x2238344808.height || 0) !== x2238344808.height || x2238344808.height < 0) {
                const err = new Error("Invalid Type at '" + "editUser.ret" + ".avatar" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x2238344808.height + "'");
                typeCheckerError(err, ctx);
            }
            if (x2238344808.url === null || x2238344808.url === undefined || typeof x2238344808.url !== "string") {
                const err = new Error("Invalid Type at '" + "editUser.ret" + ".avatar" + ".url" + "', expected AST::StringPrimitiveType, got '" + x2238344808.url + "'");
                typeCheckerError(err, ctx);
            }
        }
        if (ret.name === null || ret.name === undefined || typeof ret.name !== "string") {
            const err = new Error("Invalid Type at '" + "editUser.ret" + ".name" + "', expected AST::StringPrimitiveType, got '" + ret.name + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.email === null || ret.email === undefined || typeof ret.email !== "string") {
            const err = new Error("Invalid Type at '" + "editUser.ret" + ".email" + "', expected AST::StringPrimitiveType, got '" + ret.email + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.course === null || ret.course === undefined || typeof ret.course !== "string") {
            const err = new Error("Invalid Type at '" + "editUser.ret" + ".course" + "', expected AST::StringPrimitiveType, got '" + ret.course + "'");
            typeCheckerError(err, ctx);
        }
        const encodedRet = {
            id: ret.id,
            avatar: ret.avatar === null || ret.avatar === undefined ? null : {
                thumb: {
                    width: ret.avatar.thumb.width || 0,
                    height: ret.avatar.thumb.height || 0,
                    url: ret.avatar.thumb.url,
                },
                width: ret.avatar.width || 0,
                height: ret.avatar.height || 0,
                url: ret.avatar.url,
            },
            name: ret.name,
            email: ret.email,
            course: ret.course,
        };
        if (cacheKey !== null && cacheVersion !== null) hook.setCache(cacheKey, cacheExpirationSeconds ? new Date(new Date().getTime() + (cacheExpirationSeconds * 1000)) : null, cacheVersion, decodedKey!, "editUser", encodedRet);
        return encodedRet    },
    setAvatar: async (ctx: Context, args: any) => {
        if (args.avatar === null || args.avatar === undefined) {
            const err = new Error("Invalid Type at '" + "setAvatar.args.avatar" + "', expected AST::StructType, got '" + args.avatar + "'");
            typeCheckerError(err, ctx);
        }
        const x2065543208 = args.avatar.bytes;
        if (x2065543208 !== null && x2065543208 !== undefined) {
        }
        const x574682654 = args.avatar.image;
        if (x574682654 !== null && x574682654 !== undefined) {
            if (x574682654 === null || x574682654 === undefined) {
                const err = new Error("Invalid Type at '" + "setAvatar.args.avatar" + ".image" + "', expected AST::StructType, got '" + x574682654 + "'");
                typeCheckerError(err, ctx);
            }
            if (x574682654.thumb === null || x574682654.thumb === undefined) {
                const err = new Error("Invalid Type at '" + "setAvatar.args.avatar" + ".image" + ".thumb" + "', expected AST::StructType, got '" + x574682654.thumb + "'");
                typeCheckerError(err, ctx);
            }
            if (x574682654.thumb.width === null || x574682654.thumb.width === undefined || typeof x574682654.thumb.width !== "number" || (x574682654.thumb.width || 0) !== x574682654.thumb.width || x574682654.thumb.width < 0) {
                const err = new Error("Invalid Type at '" + "setAvatar.args.avatar" + ".image" + ".thumb" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x574682654.thumb.width + "'");
                typeCheckerError(err, ctx);
            }
            if (x574682654.thumb.height === null || x574682654.thumb.height === undefined || typeof x574682654.thumb.height !== "number" || (x574682654.thumb.height || 0) !== x574682654.thumb.height || x574682654.thumb.height < 0) {
                const err = new Error("Invalid Type at '" + "setAvatar.args.avatar" + ".image" + ".thumb" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x574682654.thumb.height + "'");
                typeCheckerError(err, ctx);
            }
            if (x574682654.thumb.url === null || x574682654.thumb.url === undefined || typeof x574682654.thumb.url !== "string") {
                const err = new Error("Invalid Type at '" + "setAvatar.args.avatar" + ".image" + ".thumb" + ".url" + "', expected AST::StringPrimitiveType, got '" + x574682654.thumb.url + "'");
                typeCheckerError(err, ctx);
            }
            if (x574682654.width === null || x574682654.width === undefined || typeof x574682654.width !== "number" || (x574682654.width || 0) !== x574682654.width || x574682654.width < 0) {
                const err = new Error("Invalid Type at '" + "setAvatar.args.avatar" + ".image" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x574682654.width + "'");
                typeCheckerError(err, ctx);
            }
            if (x574682654.height === null || x574682654.height === undefined || typeof x574682654.height !== "number" || (x574682654.height || 0) !== x574682654.height || x574682654.height < 0) {
                const err = new Error("Invalid Type at '" + "setAvatar.args.avatar" + ".image" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x574682654.height + "'");
                typeCheckerError(err, ctx);
            }
            if (x574682654.url === null || x574682654.url === undefined || typeof x574682654.url !== "string") {
                const err = new Error("Invalid Type at '" + "setAvatar.args.avatar" + ".image" + ".url" + "', expected AST::StringPrimitiveType, got '" + x574682654.url + "'");
                typeCheckerError(err, ctx);
            }
        }
        const x443208177 = args.avatar.crop;
        if (x443208177 !== null && x443208177 !== undefined) {
            if (x443208177 === null || x443208177 === undefined) {
                const err = new Error("Invalid Type at '" + "setAvatar.args.avatar" + ".crop" + "', expected AST::StructType, got '" + x443208177 + "'");
                typeCheckerError(err, ctx);
            }
            if (x443208177.x === null || x443208177.x === undefined || typeof x443208177.x !== "number" || (x443208177.x || 0) !== x443208177.x || x443208177.x < 0) {
                const err = new Error("Invalid Type at '" + "setAvatar.args.avatar" + ".crop" + ".x" + "', expected AST::UIntPrimitiveType, got '" + x443208177.x + "'");
                typeCheckerError(err, ctx);
            }
            if (x443208177.y === null || x443208177.y === undefined || typeof x443208177.y !== "number" || (x443208177.y || 0) !== x443208177.y || x443208177.y < 0) {
                const err = new Error("Invalid Type at '" + "setAvatar.args.avatar" + ".crop" + ".y" + "', expected AST::UIntPrimitiveType, got '" + x443208177.y + "'");
                typeCheckerError(err, ctx);
            }
            if (x443208177.width === null || x443208177.width === undefined || typeof x443208177.width !== "number" || (x443208177.width || 0) !== x443208177.width || x443208177.width < 0) {
                const err = new Error("Invalid Type at '" + "setAvatar.args.avatar" + ".crop" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x443208177.width + "'");
                typeCheckerError(err, ctx);
            }
            if (x443208177.height === null || x443208177.height === undefined || typeof x443208177.height !== "number" || (x443208177.height || 0) !== x443208177.height || x443208177.height < 0) {
                const err = new Error("Invalid Type at '" + "setAvatar.args.avatar" + ".crop" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x443208177.height + "'");
                typeCheckerError(err, ctx);
            }
        }
        const avatar = {
            bytes: args.avatar.bytes === null || args.avatar.bytes === undefined ? null : Buffer.from(args.avatar.bytes, "base64"),
            image: args.avatar.image === null || args.avatar.image === undefined ? null : {
                thumb: {
                    width: args.avatar.image.thumb.width || 0,
                    height: args.avatar.image.thumb.height || 0,
                    url: args.avatar.image.thumb.url,
                },
                width: args.avatar.image.width || 0,
                height: args.avatar.image.height || 0,
                url: args.avatar.image.url,
            },
            crop: args.avatar.crop === null || args.avatar.crop === undefined ? null : {
                x: args.avatar.crop.x || 0,
                y: args.avatar.crop.y || 0,
                width: args.avatar.crop.width || 0,
                height: args.avatar.crop.height || 0,
            },
        };

        let cacheKey: string | null = null, decodedKey: string | null = null, cacheExpirationSeconds: number | null = null, cacheVersion: number | null = null;
        if (cacheConfig.setAvatar) {
            try {
                const {key, expirationSeconds, version} = await cacheConfig.setAvatar(ctx, avatar);
                if (!key) throw "";
                cacheKey = crypto.createHash("sha256").update(JSON.stringify(key)+ "-setAvatar").digest("hex").substr(0, 100); decodedKey = JSON.stringify(key); cacheExpirationSeconds = expirationSeconds; cacheVersion = version;
                const cache = await hook.getCache(cacheKey, version);console.log(JSON.stringify(cache));
                if (cache && (!cache.expirationDate || cache.expirationDate > new Date())) return cache.ret;
            } catch(e) {console.log(JSON.stringify(e));}
        }
        const ret = await fn.setAvatar(ctx, avatar);
        if (ret === null || ret === undefined) {
            const err = new Error("Invalid Type at '" + "setAvatar.ret" + "', expected AST::StructType, got '" + ret + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.id === null || ret.id === undefined || typeof ret.id !== "string") {
            const err = new Error("Invalid Type at '" + "setAvatar.ret" + ".id" + "', expected AST::StringPrimitiveType, got '" + ret.id + "'");
            typeCheckerError(err, ctx);
        }
        const x3667342877 = ret.avatar;
        if (x3667342877 !== null && x3667342877 !== undefined) {
            if (x3667342877 === null || x3667342877 === undefined) {
                const err = new Error("Invalid Type at '" + "setAvatar.ret" + ".avatar" + "', expected AST::StructType, got '" + x3667342877 + "'");
                typeCheckerError(err, ctx);
            }
            if (x3667342877.thumb === null || x3667342877.thumb === undefined) {
                const err = new Error("Invalid Type at '" + "setAvatar.ret" + ".avatar" + ".thumb" + "', expected AST::StructType, got '" + x3667342877.thumb + "'");
                typeCheckerError(err, ctx);
            }
            if (x3667342877.thumb.width === null || x3667342877.thumb.width === undefined || typeof x3667342877.thumb.width !== "number" || (x3667342877.thumb.width || 0) !== x3667342877.thumb.width || x3667342877.thumb.width < 0) {
                const err = new Error("Invalid Type at '" + "setAvatar.ret" + ".avatar" + ".thumb" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x3667342877.thumb.width + "'");
                typeCheckerError(err, ctx);
            }
            if (x3667342877.thumb.height === null || x3667342877.thumb.height === undefined || typeof x3667342877.thumb.height !== "number" || (x3667342877.thumb.height || 0) !== x3667342877.thumb.height || x3667342877.thumb.height < 0) {
                const err = new Error("Invalid Type at '" + "setAvatar.ret" + ".avatar" + ".thumb" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x3667342877.thumb.height + "'");
                typeCheckerError(err, ctx);
            }
            if (x3667342877.thumb.url === null || x3667342877.thumb.url === undefined || typeof x3667342877.thumb.url !== "string") {
                const err = new Error("Invalid Type at '" + "setAvatar.ret" + ".avatar" + ".thumb" + ".url" + "', expected AST::StringPrimitiveType, got '" + x3667342877.thumb.url + "'");
                typeCheckerError(err, ctx);
            }
            if (x3667342877.width === null || x3667342877.width === undefined || typeof x3667342877.width !== "number" || (x3667342877.width || 0) !== x3667342877.width || x3667342877.width < 0) {
                const err = new Error("Invalid Type at '" + "setAvatar.ret" + ".avatar" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x3667342877.width + "'");
                typeCheckerError(err, ctx);
            }
            if (x3667342877.height === null || x3667342877.height === undefined || typeof x3667342877.height !== "number" || (x3667342877.height || 0) !== x3667342877.height || x3667342877.height < 0) {
                const err = new Error("Invalid Type at '" + "setAvatar.ret" + ".avatar" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x3667342877.height + "'");
                typeCheckerError(err, ctx);
            }
            if (x3667342877.url === null || x3667342877.url === undefined || typeof x3667342877.url !== "string") {
                const err = new Error("Invalid Type at '" + "setAvatar.ret" + ".avatar" + ".url" + "', expected AST::StringPrimitiveType, got '" + x3667342877.url + "'");
                typeCheckerError(err, ctx);
            }
        }
        if (ret.name === null || ret.name === undefined || typeof ret.name !== "string") {
            const err = new Error("Invalid Type at '" + "setAvatar.ret" + ".name" + "', expected AST::StringPrimitiveType, got '" + ret.name + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.email === null || ret.email === undefined || typeof ret.email !== "string") {
            const err = new Error("Invalid Type at '" + "setAvatar.ret" + ".email" + "', expected AST::StringPrimitiveType, got '" + ret.email + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.course === null || ret.course === undefined || typeof ret.course !== "string") {
            const err = new Error("Invalid Type at '" + "setAvatar.ret" + ".course" + "', expected AST::StringPrimitiveType, got '" + ret.course + "'");
            typeCheckerError(err, ctx);
        }
        const encodedRet = {
            id: ret.id,
            avatar: ret.avatar === null || ret.avatar === undefined ? null : {
                thumb: {
                    width: ret.avatar.thumb.width || 0,
                    height: ret.avatar.thumb.height || 0,
                    url: ret.avatar.thumb.url,
                },
                width: ret.avatar.width || 0,
                height: ret.avatar.height || 0,
                url: ret.avatar.url,
            },
            name: ret.name,
            email: ret.email,
            course: ret.course,
        };
        if (cacheKey !== null && cacheVersion !== null) hook.setCache(cacheKey, cacheExpirationSeconds ? new Date(new Date().getTime() + (cacheExpirationSeconds * 1000)) : null, cacheVersion, decodedKey!, "setAvatar", encodedRet);
        return encodedRet    },
    getSchoolClass: async (ctx: Context, args: any) => {
        if (args.schoolClassId === null || args.schoolClassId === undefined || typeof args.schoolClassId !== "string") {
            const err = new Error("Invalid Type at '" + "getSchoolClass.args.schoolClassId" + "', expected AST::StringPrimitiveType, got '" + args.schoolClassId + "'");
            typeCheckerError(err, ctx);
        }
        const schoolClassId = args.schoolClassId;

        let cacheKey: string | null = null, decodedKey: string | null = null, cacheExpirationSeconds: number | null = null, cacheVersion: number | null = null;
        if (cacheConfig.getSchoolClass) {
            try {
                const {key, expirationSeconds, version} = await cacheConfig.getSchoolClass(ctx, schoolClassId);
                if (!key) throw "";
                cacheKey = crypto.createHash("sha256").update(JSON.stringify(key)+ "-getSchoolClass").digest("hex").substr(0, 100); decodedKey = JSON.stringify(key); cacheExpirationSeconds = expirationSeconds; cacheVersion = version;
                const cache = await hook.getCache(cacheKey, version);console.log(JSON.stringify(cache));
                if (cache && (!cache.expirationDate || cache.expirationDate > new Date())) return cache.ret;
            } catch(e) {console.log(JSON.stringify(e));}
        }
        const ret = await fn.getSchoolClass(ctx, schoolClassId);
        if (ret === null || ret === undefined) {
            const err = new Error("Invalid Type at '" + "getSchoolClass.ret" + "', expected AST::StructType, got '" + ret + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.id === null || ret.id === undefined || typeof ret.id !== "string") {
            const err = new Error("Invalid Type at '" + "getSchoolClass.ret" + ".id" + "', expected AST::StringPrimitiveType, got '" + ret.id + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.description === null || ret.description === undefined || typeof ret.description !== "string") {
            const err = new Error("Invalid Type at '" + "getSchoolClass.ret" + ".description" + "', expected AST::StringPrimitiveType, got '" + ret.description + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.name === null || ret.name === undefined || typeof ret.name !== "string") {
            const err = new Error("Invalid Type at '" + "getSchoolClass.ret" + ".name" + "', expected AST::StringPrimitiveType, got '" + ret.name + "'");
            typeCheckerError(err, ctx);
        }
        const encodedRet = {
            id: ret.id,
            description: ret.description,
            name: ret.name,
        };
        if (cacheKey !== null && cacheVersion !== null) hook.setCache(cacheKey, cacheExpirationSeconds ? new Date(new Date().getTime() + (cacheExpirationSeconds * 1000)) : null, cacheVersion, decodedKey!, "getSchoolClass", encodedRet);
        return encodedRet    },
    getSchoolClassesFor: async (ctx: Context, args: any) => {
        if (args.schoolClassIds === null || args.schoolClassIds === undefined || !(args.schoolClassIds instanceof Array)) {
            const err = new Error("Invalid Type at '" + "getSchoolClassesFor.args.schoolClassIds" + "', expected AST::ArrayType, got '" + args.schoolClassIds + "'");
            typeCheckerError(err, ctx);
        } else {
            for (let x4019006720 = 0; x4019006720 < args.schoolClassIds.length; ++x4019006720) {
                if (args.schoolClassIds[x4019006720] === null || args.schoolClassIds[x4019006720] === undefined || typeof args.schoolClassIds[x4019006720] !== "string") {
                    const err = new Error("Invalid Type at '" + "getSchoolClassesFor.args.schoolClassIds" + "[" + x4019006720 + "]" + "', expected AST::StringPrimitiveType, got '" + args.schoolClassIds[x4019006720] + "'");
                    typeCheckerError(err, ctx);
                }
            }
        }
        const schoolClassIds = args.schoolClassIds.map((e: any) => e);

        let cacheKey: string | null = null, decodedKey: string | null = null, cacheExpirationSeconds: number | null = null, cacheVersion: number | null = null;
        if (cacheConfig.getSchoolClassesFor) {
            try {
                const {key, expirationSeconds, version} = await cacheConfig.getSchoolClassesFor(ctx, schoolClassIds);
                if (!key) throw "";
                cacheKey = crypto.createHash("sha256").update(JSON.stringify(key)+ "-getSchoolClassesFor").digest("hex").substr(0, 100); decodedKey = JSON.stringify(key); cacheExpirationSeconds = expirationSeconds; cacheVersion = version;
                const cache = await hook.getCache(cacheKey, version);console.log(JSON.stringify(cache));
                if (cache && (!cache.expirationDate || cache.expirationDate > new Date())) return cache.ret;
            } catch(e) {console.log(JSON.stringify(e));}
        }
        const ret = await fn.getSchoolClassesFor(ctx, schoolClassIds);
        if (ret === null || ret === undefined || !(ret instanceof Array)) {
            const err = new Error("Invalid Type at '" + "getSchoolClassesFor.ret" + "', expected AST::ArrayType, got '" + ret + "'");
            typeCheckerError(err, ctx);
        } else {
            for (let x580008651 = 0; x580008651 < ret.length; ++x580008651) {
                if (ret[x580008651] === null || ret[x580008651] === undefined) {
                    const err = new Error("Invalid Type at '" + "getSchoolClassesFor.ret" + "[" + x580008651 + "]" + "', expected AST::StructType, got '" + ret[x580008651] + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret[x580008651].id === null || ret[x580008651].id === undefined || typeof ret[x580008651].id !== "string") {
                    const err = new Error("Invalid Type at '" + "getSchoolClassesFor.ret" + "[" + x580008651 + "]" + ".id" + "', expected AST::StringPrimitiveType, got '" + ret[x580008651].id + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret[x580008651].description === null || ret[x580008651].description === undefined || typeof ret[x580008651].description !== "string") {
                    const err = new Error("Invalid Type at '" + "getSchoolClassesFor.ret" + "[" + x580008651 + "]" + ".description" + "', expected AST::StringPrimitiveType, got '" + ret[x580008651].description + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret[x580008651].name === null || ret[x580008651].name === undefined || typeof ret[x580008651].name !== "string") {
                    const err = new Error("Invalid Type at '" + "getSchoolClassesFor.ret" + "[" + x580008651 + "]" + ".name" + "', expected AST::StringPrimitiveType, got '" + ret[x580008651].name + "'");
                    typeCheckerError(err, ctx);
                }
            }
        }
        const encodedRet = ret.map(e => ({
            id: e.id,
            description: e.description,
            name: e.name,
        }));
        if (cacheKey !== null && cacheVersion !== null) hook.setCache(cacheKey, cacheExpirationSeconds ? new Date(new Date().getTime() + (cacheExpirationSeconds * 1000)) : null, cacheVersion, decodedKey!, "getSchoolClassesFor", encodedRet);
        return encodedRet    },
    createSchoolClass: async (ctx: Context, args: any) => {
        if (args.schoolClass === null || args.schoolClass === undefined) {
            const err = new Error("Invalid Type at '" + "createSchoolClass.args.schoolClass" + "', expected AST::StructType, got '" + args.schoolClass + "'");
            typeCheckerError(err, ctx);
        }
        if (args.schoolClass.id === null || args.schoolClass.id === undefined || typeof args.schoolClass.id !== "string") {
            const err = new Error("Invalid Type at '" + "createSchoolClass.args.schoolClass" + ".id" + "', expected AST::StringPrimitiveType, got '" + args.schoolClass.id + "'");
            typeCheckerError(err, ctx);
        }
        if (args.schoolClass.description === null || args.schoolClass.description === undefined || typeof args.schoolClass.description !== "string") {
            const err = new Error("Invalid Type at '" + "createSchoolClass.args.schoolClass" + ".description" + "', expected AST::StringPrimitiveType, got '" + args.schoolClass.description + "'");
            typeCheckerError(err, ctx);
        }
        if (args.schoolClass.name === null || args.schoolClass.name === undefined || typeof args.schoolClass.name !== "string") {
            const err = new Error("Invalid Type at '" + "createSchoolClass.args.schoolClass" + ".name" + "', expected AST::StringPrimitiveType, got '" + args.schoolClass.name + "'");
            typeCheckerError(err, ctx);
        }
        const schoolClass = {
            id: args.schoolClass.id,
            description: args.schoolClass.description,
            name: args.schoolClass.name,
        };

        let cacheKey: string | null = null, decodedKey: string | null = null, cacheExpirationSeconds: number | null = null, cacheVersion: number | null = null;
        if (cacheConfig.createSchoolClass) {
            try {
                const {key, expirationSeconds, version} = await cacheConfig.createSchoolClass(ctx, schoolClass);
                if (!key) throw "";
                cacheKey = crypto.createHash("sha256").update(JSON.stringify(key)+ "-createSchoolClass").digest("hex").substr(0, 100); decodedKey = JSON.stringify(key); cacheExpirationSeconds = expirationSeconds; cacheVersion = version;
                const cache = await hook.getCache(cacheKey, version);console.log(JSON.stringify(cache));
                if (cache && (!cache.expirationDate || cache.expirationDate > new Date())) return cache.ret;
            } catch(e) {console.log(JSON.stringify(e));}
        }
        const ret = await fn.createSchoolClass(ctx, schoolClass);
        if (ret === null || ret === undefined) {
            const err = new Error("Invalid Type at '" + "createSchoolClass.ret" + "', expected AST::StructType, got '" + ret + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.id === null || ret.id === undefined || typeof ret.id !== "string") {
            const err = new Error("Invalid Type at '" + "createSchoolClass.ret" + ".id" + "', expected AST::StringPrimitiveType, got '" + ret.id + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.description === null || ret.description === undefined || typeof ret.description !== "string") {
            const err = new Error("Invalid Type at '" + "createSchoolClass.ret" + ".description" + "', expected AST::StringPrimitiveType, got '" + ret.description + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.name === null || ret.name === undefined || typeof ret.name !== "string") {
            const err = new Error("Invalid Type at '" + "createSchoolClass.ret" + ".name" + "', expected AST::StringPrimitiveType, got '" + ret.name + "'");
            typeCheckerError(err, ctx);
        }
        const encodedRet = {
            id: ret.id,
            description: ret.description,
            name: ret.name,
        };
        if (cacheKey !== null && cacheVersion !== null) hook.setCache(cacheKey, cacheExpirationSeconds ? new Date(new Date().getTime() + (cacheExpirationSeconds * 1000)) : null, cacheVersion, decodedKey!, "createSchoolClass", encodedRet);
        return encodedRet    },
    editSchoolClass: async (ctx: Context, args: any) => {
        if (args.schoolClassId === null || args.schoolClassId === undefined || typeof args.schoolClassId !== "string") {
            const err = new Error("Invalid Type at '" + "editSchoolClass.args.schoolClassId" + "', expected AST::StringPrimitiveType, got '" + args.schoolClassId + "'");
            typeCheckerError(err, ctx);
        }
        const schoolClassId = args.schoolClassId;
        if (args.schoolClass === null || args.schoolClass === undefined) {
            const err = new Error("Invalid Type at '" + "editSchoolClass.args.schoolClass" + "', expected AST::StructType, got '" + args.schoolClass + "'");
            typeCheckerError(err, ctx);
        }
        if (args.schoolClass.id === null || args.schoolClass.id === undefined || typeof args.schoolClass.id !== "string") {
            const err = new Error("Invalid Type at '" + "editSchoolClass.args.schoolClass" + ".id" + "', expected AST::StringPrimitiveType, got '" + args.schoolClass.id + "'");
            typeCheckerError(err, ctx);
        }
        if (args.schoolClass.description === null || args.schoolClass.description === undefined || typeof args.schoolClass.description !== "string") {
            const err = new Error("Invalid Type at '" + "editSchoolClass.args.schoolClass" + ".description" + "', expected AST::StringPrimitiveType, got '" + args.schoolClass.description + "'");
            typeCheckerError(err, ctx);
        }
        if (args.schoolClass.name === null || args.schoolClass.name === undefined || typeof args.schoolClass.name !== "string") {
            const err = new Error("Invalid Type at '" + "editSchoolClass.args.schoolClass" + ".name" + "', expected AST::StringPrimitiveType, got '" + args.schoolClass.name + "'");
            typeCheckerError(err, ctx);
        }
        const schoolClass = {
            id: args.schoolClass.id,
            description: args.schoolClass.description,
            name: args.schoolClass.name,
        };

        let cacheKey: string | null = null, decodedKey: string | null = null, cacheExpirationSeconds: number | null = null, cacheVersion: number | null = null;
        if (cacheConfig.editSchoolClass) {
            try {
                const {key, expirationSeconds, version} = await cacheConfig.editSchoolClass(ctx, schoolClassId, schoolClass);
                if (!key) throw "";
                cacheKey = crypto.createHash("sha256").update(JSON.stringify(key)+ "-editSchoolClass").digest("hex").substr(0, 100); decodedKey = JSON.stringify(key); cacheExpirationSeconds = expirationSeconds; cacheVersion = version;
                const cache = await hook.getCache(cacheKey, version);console.log(JSON.stringify(cache));
                if (cache && (!cache.expirationDate || cache.expirationDate > new Date())) return cache.ret;
            } catch(e) {console.log(JSON.stringify(e));}
        }
        const ret = await fn.editSchoolClass(ctx, schoolClassId, schoolClass);
        if (ret === null || ret === undefined) {
            const err = new Error("Invalid Type at '" + "editSchoolClass.ret" + "', expected AST::StructType, got '" + ret + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.id === null || ret.id === undefined || typeof ret.id !== "string") {
            const err = new Error("Invalid Type at '" + "editSchoolClass.ret" + ".id" + "', expected AST::StringPrimitiveType, got '" + ret.id + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.description === null || ret.description === undefined || typeof ret.description !== "string") {
            const err = new Error("Invalid Type at '" + "editSchoolClass.ret" + ".description" + "', expected AST::StringPrimitiveType, got '" + ret.description + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.name === null || ret.name === undefined || typeof ret.name !== "string") {
            const err = new Error("Invalid Type at '" + "editSchoolClass.ret" + ".name" + "', expected AST::StringPrimitiveType, got '" + ret.name + "'");
            typeCheckerError(err, ctx);
        }
        const encodedRet = {
            id: ret.id,
            description: ret.description,
            name: ret.name,
        };
        if (cacheKey !== null && cacheVersion !== null) hook.setCache(cacheKey, cacheExpirationSeconds ? new Date(new Date().getTime() + (cacheExpirationSeconds * 1000)) : null, cacheVersion, decodedKey!, "editSchoolClass", encodedRet);
        return encodedRet    },
    getProfessor: async (ctx: Context, args: any) => {
        if (args.professorId === null || args.professorId === undefined || typeof args.professorId !== "string") {
            const err = new Error("Invalid Type at '" + "getProfessor.args.professorId" + "', expected AST::StringPrimitiveType, got '" + args.professorId + "'");
            typeCheckerError(err, ctx);
        }
        const professorId = args.professorId;

        let cacheKey: string | null = null, decodedKey: string | null = null, cacheExpirationSeconds: number | null = null, cacheVersion: number | null = null;
        if (cacheConfig.getProfessor) {
            try {
                const {key, expirationSeconds, version} = await cacheConfig.getProfessor(ctx, professorId);
                if (!key) throw "";
                cacheKey = crypto.createHash("sha256").update(JSON.stringify(key)+ "-getProfessor").digest("hex").substr(0, 100); decodedKey = JSON.stringify(key); cacheExpirationSeconds = expirationSeconds; cacheVersion = version;
                const cache = await hook.getCache(cacheKey, version);console.log(JSON.stringify(cache));
                if (cache && (!cache.expirationDate || cache.expirationDate > new Date())) return cache.ret;
            } catch(e) {console.log(JSON.stringify(e));}
        }
        const ret = await fn.getProfessor(ctx, professorId);
        if (ret === null || ret === undefined) {
            const err = new Error("Invalid Type at '" + "getProfessor.ret" + "', expected AST::StructType, got '" + ret + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.id === null || ret.id === undefined || typeof ret.id !== "string") {
            const err = new Error("Invalid Type at '" + "getProfessor.ret" + ".id" + "', expected AST::StringPrimitiveType, got '" + ret.id + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.schoolClasses === null || ret.schoolClasses === undefined || !(ret.schoolClasses instanceof Array)) {
            const err = new Error("Invalid Type at '" + "getProfessor.ret" + ".schoolClasses" + "', expected AST::ArrayType, got '" + ret.schoolClasses + "'");
            typeCheckerError(err, ctx);
        } else {
            for (let x787289385 = 0; x787289385 < ret.schoolClasses.length; ++x787289385) {
                if (ret.schoolClasses[x787289385] === null || ret.schoolClasses[x787289385] === undefined) {
                    const err = new Error("Invalid Type at '" + "getProfessor.ret" + ".schoolClasses" + "[" + x787289385 + "]" + "', expected AST::StructType, got '" + ret.schoolClasses[x787289385] + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret.schoolClasses[x787289385].id === null || ret.schoolClasses[x787289385].id === undefined || typeof ret.schoolClasses[x787289385].id !== "string") {
                    const err = new Error("Invalid Type at '" + "getProfessor.ret" + ".schoolClasses" + "[" + x787289385 + "]" + ".id" + "', expected AST::StringPrimitiveType, got '" + ret.schoolClasses[x787289385].id + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret.schoolClasses[x787289385].description === null || ret.schoolClasses[x787289385].description === undefined || typeof ret.schoolClasses[x787289385].description !== "string") {
                    const err = new Error("Invalid Type at '" + "getProfessor.ret" + ".schoolClasses" + "[" + x787289385 + "]" + ".description" + "', expected AST::StringPrimitiveType, got '" + ret.schoolClasses[x787289385].description + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret.schoolClasses[x787289385].name === null || ret.schoolClasses[x787289385].name === undefined || typeof ret.schoolClasses[x787289385].name !== "string") {
                    const err = new Error("Invalid Type at '" + "getProfessor.ret" + ".schoolClasses" + "[" + x787289385 + "]" + ".name" + "', expected AST::StringPrimitiveType, got '" + ret.schoolClasses[x787289385].name + "'");
                    typeCheckerError(err, ctx);
                }
            }
        }
        const x599698900 = ret.avatar;
        if (x599698900 !== null && x599698900 !== undefined) {
            if (x599698900 === null || x599698900 === undefined) {
                const err = new Error("Invalid Type at '" + "getProfessor.ret" + ".avatar" + "', expected AST::StructType, got '" + x599698900 + "'");
                typeCheckerError(err, ctx);
            }
            if (x599698900.thumb === null || x599698900.thumb === undefined) {
                const err = new Error("Invalid Type at '" + "getProfessor.ret" + ".avatar" + ".thumb" + "', expected AST::StructType, got '" + x599698900.thumb + "'");
                typeCheckerError(err, ctx);
            }
            if (x599698900.thumb.width === null || x599698900.thumb.width === undefined || typeof x599698900.thumb.width !== "number" || (x599698900.thumb.width || 0) !== x599698900.thumb.width || x599698900.thumb.width < 0) {
                const err = new Error("Invalid Type at '" + "getProfessor.ret" + ".avatar" + ".thumb" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x599698900.thumb.width + "'");
                typeCheckerError(err, ctx);
            }
            if (x599698900.thumb.height === null || x599698900.thumb.height === undefined || typeof x599698900.thumb.height !== "number" || (x599698900.thumb.height || 0) !== x599698900.thumb.height || x599698900.thumb.height < 0) {
                const err = new Error("Invalid Type at '" + "getProfessor.ret" + ".avatar" + ".thumb" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x599698900.thumb.height + "'");
                typeCheckerError(err, ctx);
            }
            if (x599698900.thumb.url === null || x599698900.thumb.url === undefined || typeof x599698900.thumb.url !== "string") {
                const err = new Error("Invalid Type at '" + "getProfessor.ret" + ".avatar" + ".thumb" + ".url" + "', expected AST::StringPrimitiveType, got '" + x599698900.thumb.url + "'");
                typeCheckerError(err, ctx);
            }
            if (x599698900.width === null || x599698900.width === undefined || typeof x599698900.width !== "number" || (x599698900.width || 0) !== x599698900.width || x599698900.width < 0) {
                const err = new Error("Invalid Type at '" + "getProfessor.ret" + ".avatar" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x599698900.width + "'");
                typeCheckerError(err, ctx);
            }
            if (x599698900.height === null || x599698900.height === undefined || typeof x599698900.height !== "number" || (x599698900.height || 0) !== x599698900.height || x599698900.height < 0) {
                const err = new Error("Invalid Type at '" + "getProfessor.ret" + ".avatar" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x599698900.height + "'");
                typeCheckerError(err, ctx);
            }
            if (x599698900.url === null || x599698900.url === undefined || typeof x599698900.url !== "string") {
                const err = new Error("Invalid Type at '" + "getProfessor.ret" + ".avatar" + ".url" + "', expected AST::StringPrimitiveType, got '" + x599698900.url + "'");
                typeCheckerError(err, ctx);
            }
        }
        if (ret.name === null || ret.name === undefined || typeof ret.name !== "string") {
            const err = new Error("Invalid Type at '" + "getProfessor.ret" + ".name" + "', expected AST::StringPrimitiveType, got '" + ret.name + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.tags === null || ret.tags === undefined || !(ret.tags instanceof Array)) {
            const err = new Error("Invalid Type at '" + "getProfessor.ret" + ".tags" + "', expected AST::ArrayType, got '" + ret.tags + "'");
            typeCheckerError(err, ctx);
        } else {
            for (let x1187896636 = 0; x1187896636 < ret.tags.length; ++x1187896636) {
                if (ret.tags[x1187896636] === null || ret.tags[x1187896636] === undefined || typeof ret.tags[x1187896636] !== "string") {
                    const err = new Error("Invalid Type at '" + "getProfessor.ret" + ".tags" + "[" + x1187896636 + "]" + "', expected AST::StringPrimitiveType, got '" + ret.tags[x1187896636] + "'");
                    typeCheckerError(err, ctx);
                }
            }
        }
        if (ret.hardness === null || ret.hardness === undefined || typeof ret.hardness !== "number" || (ret.hardness || 0) !== ret.hardness || ret.hardness < 0) {
            const err = new Error("Invalid Type at '" + "getProfessor.ret" + ".hardness" + "', expected AST::UIntPrimitiveType, got '" + ret.hardness + "'");
            typeCheckerError(err, ctx);
        }
        const encodedRet = {
            id: ret.id,
            schoolClasses: ret.schoolClasses.map(e => ({
                id: e.id,
                description: e.description,
                name: e.name,
            })),
            avatar: ret.avatar === null || ret.avatar === undefined ? null : {
                thumb: {
                    width: ret.avatar.thumb.width || 0,
                    height: ret.avatar.thumb.height || 0,
                    url: ret.avatar.thumb.url,
                },
                width: ret.avatar.width || 0,
                height: ret.avatar.height || 0,
                url: ret.avatar.url,
            },
            name: ret.name,
            tags: ret.tags.map(e => e),
            hardness: ret.hardness || 0,
        };
        if (cacheKey !== null && cacheVersion !== null) hook.setCache(cacheKey, cacheExpirationSeconds ? new Date(new Date().getTime() + (cacheExpirationSeconds * 1000)) : null, cacheVersion, decodedKey!, "getProfessor", encodedRet);
        return encodedRet    },
    getProfessors: async (ctx: Context, args: any) => {
        if (args.pageOffset === null || args.pageOffset === undefined || typeof args.pageOffset !== "number" || (args.pageOffset || 0) !== args.pageOffset || args.pageOffset < 0) {
            const err = new Error("Invalid Type at '" + "getProfessors.args.pageOffset" + "', expected AST::UIntPrimitiveType, got '" + args.pageOffset + "'");
            typeCheckerError(err, ctx);
        }
        const pageOffset = args.pageOffset || 0;

        let cacheKey: string | null = null, decodedKey: string | null = null, cacheExpirationSeconds: number | null = null, cacheVersion: number | null = null;
        if (cacheConfig.getProfessors) {
            try {
                const {key, expirationSeconds, version} = await cacheConfig.getProfessors(ctx, pageOffset);
                if (!key) throw "";
                cacheKey = crypto.createHash("sha256").update(JSON.stringify(key)+ "-getProfessors").digest("hex").substr(0, 100); decodedKey = JSON.stringify(key); cacheExpirationSeconds = expirationSeconds; cacheVersion = version;
                const cache = await hook.getCache(cacheKey, version);console.log(JSON.stringify(cache));
                if (cache && (!cache.expirationDate || cache.expirationDate > new Date())) return cache.ret;
            } catch(e) {console.log(JSON.stringify(e));}
        }
        const ret = await fn.getProfessors(ctx, pageOffset);
        if (ret === null || ret === undefined || !(ret instanceof Array)) {
            const err = new Error("Invalid Type at '" + "getProfessors.ret" + "', expected AST::ArrayType, got '" + ret + "'");
            typeCheckerError(err, ctx);
        } else {
            for (let x3507150049 = 0; x3507150049 < ret.length; ++x3507150049) {
                if (ret[x3507150049] === null || ret[x3507150049] === undefined) {
                    const err = new Error("Invalid Type at '" + "getProfessors.ret" + "[" + x3507150049 + "]" + "', expected AST::StructType, got '" + ret[x3507150049] + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret[x3507150049].id === null || ret[x3507150049].id === undefined || typeof ret[x3507150049].id !== "string") {
                    const err = new Error("Invalid Type at '" + "getProfessors.ret" + "[" + x3507150049 + "]" + ".id" + "', expected AST::StringPrimitiveType, got '" + ret[x3507150049].id + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret[x3507150049].schoolClasses === null || ret[x3507150049].schoolClasses === undefined || !(ret[x3507150049].schoolClasses instanceof Array)) {
                    const err = new Error("Invalid Type at '" + "getProfessors.ret" + "[" + x3507150049 + "]" + ".schoolClasses" + "', expected AST::ArrayType, got '" + ret[x3507150049].schoolClasses + "'");
                    typeCheckerError(err, ctx);
                } else {
                    for (let x3187780444 = 0; x3187780444 < ret[x3507150049].schoolClasses.length; ++x3187780444) {
                        if (ret[x3507150049].schoolClasses[x3187780444] === null || ret[x3507150049].schoolClasses[x3187780444] === undefined) {
                            const err = new Error("Invalid Type at '" + "getProfessors.ret" + "[" + x3507150049 + "]" + ".schoolClasses" + "[" + x3187780444 + "]" + "', expected AST::StructType, got '" + ret[x3507150049].schoolClasses[x3187780444] + "'");
                            typeCheckerError(err, ctx);
                        }
                        if (ret[x3507150049].schoolClasses[x3187780444].id === null || ret[x3507150049].schoolClasses[x3187780444].id === undefined || typeof ret[x3507150049].schoolClasses[x3187780444].id !== "string") {
                            const err = new Error("Invalid Type at '" + "getProfessors.ret" + "[" + x3507150049 + "]" + ".schoolClasses" + "[" + x3187780444 + "]" + ".id" + "', expected AST::StringPrimitiveType, got '" + ret[x3507150049].schoolClasses[x3187780444].id + "'");
                            typeCheckerError(err, ctx);
                        }
                        if (ret[x3507150049].schoolClasses[x3187780444].description === null || ret[x3507150049].schoolClasses[x3187780444].description === undefined || typeof ret[x3507150049].schoolClasses[x3187780444].description !== "string") {
                            const err = new Error("Invalid Type at '" + "getProfessors.ret" + "[" + x3507150049 + "]" + ".schoolClasses" + "[" + x3187780444 + "]" + ".description" + "', expected AST::StringPrimitiveType, got '" + ret[x3507150049].schoolClasses[x3187780444].description + "'");
                            typeCheckerError(err, ctx);
                        }
                        if (ret[x3507150049].schoolClasses[x3187780444].name === null || ret[x3507150049].schoolClasses[x3187780444].name === undefined || typeof ret[x3507150049].schoolClasses[x3187780444].name !== "string") {
                            const err = new Error("Invalid Type at '" + "getProfessors.ret" + "[" + x3507150049 + "]" + ".schoolClasses" + "[" + x3187780444 + "]" + ".name" + "', expected AST::StringPrimitiveType, got '" + ret[x3507150049].schoolClasses[x3187780444].name + "'");
                            typeCheckerError(err, ctx);
                        }
                    }
                }
                const x3462854423 = ret[x3507150049].avatar;
                if (x3462854423 !== null && x3462854423 !== undefined) {
                    if (x3462854423 === null || x3462854423 === undefined) {
                        const err = new Error("Invalid Type at '" + "getProfessors.ret" + "[" + x3507150049 + "]" + ".avatar" + "', expected AST::StructType, got '" + x3462854423 + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x3462854423.thumb === null || x3462854423.thumb === undefined) {
                        const err = new Error("Invalid Type at '" + "getProfessors.ret" + "[" + x3507150049 + "]" + ".avatar" + ".thumb" + "', expected AST::StructType, got '" + x3462854423.thumb + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x3462854423.thumb.width === null || x3462854423.thumb.width === undefined || typeof x3462854423.thumb.width !== "number" || (x3462854423.thumb.width || 0) !== x3462854423.thumb.width || x3462854423.thumb.width < 0) {
                        const err = new Error("Invalid Type at '" + "getProfessors.ret" + "[" + x3507150049 + "]" + ".avatar" + ".thumb" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x3462854423.thumb.width + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x3462854423.thumb.height === null || x3462854423.thumb.height === undefined || typeof x3462854423.thumb.height !== "number" || (x3462854423.thumb.height || 0) !== x3462854423.thumb.height || x3462854423.thumb.height < 0) {
                        const err = new Error("Invalid Type at '" + "getProfessors.ret" + "[" + x3507150049 + "]" + ".avatar" + ".thumb" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x3462854423.thumb.height + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x3462854423.thumb.url === null || x3462854423.thumb.url === undefined || typeof x3462854423.thumb.url !== "string") {
                        const err = new Error("Invalid Type at '" + "getProfessors.ret" + "[" + x3507150049 + "]" + ".avatar" + ".thumb" + ".url" + "', expected AST::StringPrimitiveType, got '" + x3462854423.thumb.url + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x3462854423.width === null || x3462854423.width === undefined || typeof x3462854423.width !== "number" || (x3462854423.width || 0) !== x3462854423.width || x3462854423.width < 0) {
                        const err = new Error("Invalid Type at '" + "getProfessors.ret" + "[" + x3507150049 + "]" + ".avatar" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x3462854423.width + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x3462854423.height === null || x3462854423.height === undefined || typeof x3462854423.height !== "number" || (x3462854423.height || 0) !== x3462854423.height || x3462854423.height < 0) {
                        const err = new Error("Invalid Type at '" + "getProfessors.ret" + "[" + x3507150049 + "]" + ".avatar" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x3462854423.height + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x3462854423.url === null || x3462854423.url === undefined || typeof x3462854423.url !== "string") {
                        const err = new Error("Invalid Type at '" + "getProfessors.ret" + "[" + x3507150049 + "]" + ".avatar" + ".url" + "', expected AST::StringPrimitiveType, got '" + x3462854423.url + "'");
                        typeCheckerError(err, ctx);
                    }
                }
                if (ret[x3507150049].name === null || ret[x3507150049].name === undefined || typeof ret[x3507150049].name !== "string") {
                    const err = new Error("Invalid Type at '" + "getProfessors.ret" + "[" + x3507150049 + "]" + ".name" + "', expected AST::StringPrimitiveType, got '" + ret[x3507150049].name + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret[x3507150049].tags === null || ret[x3507150049].tags === undefined || !(ret[x3507150049].tags instanceof Array)) {
                    const err = new Error("Invalid Type at '" + "getProfessors.ret" + "[" + x3507150049 + "]" + ".tags" + "', expected AST::ArrayType, got '" + ret[x3507150049].tags + "'");
                    typeCheckerError(err, ctx);
                } else {
                    for (let x4172427778 = 0; x4172427778 < ret[x3507150049].tags.length; ++x4172427778) {
                        if (ret[x3507150049].tags[x4172427778] === null || ret[x3507150049].tags[x4172427778] === undefined || typeof ret[x3507150049].tags[x4172427778] !== "string") {
                            const err = new Error("Invalid Type at '" + "getProfessors.ret" + "[" + x3507150049 + "]" + ".tags" + "[" + x4172427778 + "]" + "', expected AST::StringPrimitiveType, got '" + ret[x3507150049].tags[x4172427778] + "'");
                            typeCheckerError(err, ctx);
                        }
                    }
                }
                if (ret[x3507150049].hardness === null || ret[x3507150049].hardness === undefined || typeof ret[x3507150049].hardness !== "number" || (ret[x3507150049].hardness || 0) !== ret[x3507150049].hardness || ret[x3507150049].hardness < 0) {
                    const err = new Error("Invalid Type at '" + "getProfessors.ret" + "[" + x3507150049 + "]" + ".hardness" + "', expected AST::UIntPrimitiveType, got '" + ret[x3507150049].hardness + "'");
                    typeCheckerError(err, ctx);
                }
            }
        }
        const encodedRet = ret.map(e => ({
            id: e.id,
            schoolClasses: e.schoolClasses.map(e => ({
                id: e.id,
                description: e.description,
                name: e.name,
            })),
            avatar: e.avatar === null || e.avatar === undefined ? null : {
                thumb: {
                    width: e.avatar.thumb.width || 0,
                    height: e.avatar.thumb.height || 0,
                    url: e.avatar.thumb.url,
                },
                width: e.avatar.width || 0,
                height: e.avatar.height || 0,
                url: e.avatar.url,
            },
            name: e.name,
            tags: e.tags.map(e => e),
            hardness: e.hardness || 0,
        }));
        if (cacheKey !== null && cacheVersion !== null) hook.setCache(cacheKey, cacheExpirationSeconds ? new Date(new Date().getTime() + (cacheExpirationSeconds * 1000)) : null, cacheVersion, decodedKey!, "getProfessors", encodedRet);
        return encodedRet    },
    createProfessor: async (ctx: Context, args: any) => {
        if (args.professor === null || args.professor === undefined) {
            const err = new Error("Invalid Type at '" + "createProfessor.args.professor" + "', expected AST::StructType, got '" + args.professor + "'");
            typeCheckerError(err, ctx);
        }
        const x1283719044 = args.professor.avatar;
        if (x1283719044 !== null && x1283719044 !== undefined) {
            if (x1283719044 === null || x1283719044 === undefined) {
                const err = new Error("Invalid Type at '" + "createProfessor.args.professor" + ".avatar" + "', expected AST::StructType, got '" + x1283719044 + "'");
                typeCheckerError(err, ctx);
            }
            const x3589879975 = x1283719044.bytes;
            if (x3589879975 !== null && x3589879975 !== undefined) {
            }
            const x3032455473 = x1283719044.image;
            if (x3032455473 !== null && x3032455473 !== undefined) {
                if (x3032455473 === null || x3032455473 === undefined) {
                    const err = new Error("Invalid Type at '" + "createProfessor.args.professor" + ".avatar" + ".image" + "', expected AST::StructType, got '" + x3032455473 + "'");
                    typeCheckerError(err, ctx);
                }
                if (x3032455473.thumb === null || x3032455473.thumb === undefined) {
                    const err = new Error("Invalid Type at '" + "createProfessor.args.professor" + ".avatar" + ".image" + ".thumb" + "', expected AST::StructType, got '" + x3032455473.thumb + "'");
                    typeCheckerError(err, ctx);
                }
                if (x3032455473.thumb.width === null || x3032455473.thumb.width === undefined || typeof x3032455473.thumb.width !== "number" || (x3032455473.thumb.width || 0) !== x3032455473.thumb.width || x3032455473.thumb.width < 0) {
                    const err = new Error("Invalid Type at '" + "createProfessor.args.professor" + ".avatar" + ".image" + ".thumb" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x3032455473.thumb.width + "'");
                    typeCheckerError(err, ctx);
                }
                if (x3032455473.thumb.height === null || x3032455473.thumb.height === undefined || typeof x3032455473.thumb.height !== "number" || (x3032455473.thumb.height || 0) !== x3032455473.thumb.height || x3032455473.thumb.height < 0) {
                    const err = new Error("Invalid Type at '" + "createProfessor.args.professor" + ".avatar" + ".image" + ".thumb" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x3032455473.thumb.height + "'");
                    typeCheckerError(err, ctx);
                }
                if (x3032455473.thumb.url === null || x3032455473.thumb.url === undefined || typeof x3032455473.thumb.url !== "string") {
                    const err = new Error("Invalid Type at '" + "createProfessor.args.professor" + ".avatar" + ".image" + ".thumb" + ".url" + "', expected AST::StringPrimitiveType, got '" + x3032455473.thumb.url + "'");
                    typeCheckerError(err, ctx);
                }
                if (x3032455473.width === null || x3032455473.width === undefined || typeof x3032455473.width !== "number" || (x3032455473.width || 0) !== x3032455473.width || x3032455473.width < 0) {
                    const err = new Error("Invalid Type at '" + "createProfessor.args.professor" + ".avatar" + ".image" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x3032455473.width + "'");
                    typeCheckerError(err, ctx);
                }
                if (x3032455473.height === null || x3032455473.height === undefined || typeof x3032455473.height !== "number" || (x3032455473.height || 0) !== x3032455473.height || x3032455473.height < 0) {
                    const err = new Error("Invalid Type at '" + "createProfessor.args.professor" + ".avatar" + ".image" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x3032455473.height + "'");
                    typeCheckerError(err, ctx);
                }
                if (x3032455473.url === null || x3032455473.url === undefined || typeof x3032455473.url !== "string") {
                    const err = new Error("Invalid Type at '" + "createProfessor.args.professor" + ".avatar" + ".image" + ".url" + "', expected AST::StringPrimitiveType, got '" + x3032455473.url + "'");
                    typeCheckerError(err, ctx);
                }
            }
            const x3514413188 = x1283719044.crop;
            if (x3514413188 !== null && x3514413188 !== undefined) {
                if (x3514413188 === null || x3514413188 === undefined) {
                    const err = new Error("Invalid Type at '" + "createProfessor.args.professor" + ".avatar" + ".crop" + "', expected AST::StructType, got '" + x3514413188 + "'");
                    typeCheckerError(err, ctx);
                }
                if (x3514413188.x === null || x3514413188.x === undefined || typeof x3514413188.x !== "number" || (x3514413188.x || 0) !== x3514413188.x || x3514413188.x < 0) {
                    const err = new Error("Invalid Type at '" + "createProfessor.args.professor" + ".avatar" + ".crop" + ".x" + "', expected AST::UIntPrimitiveType, got '" + x3514413188.x + "'");
                    typeCheckerError(err, ctx);
                }
                if (x3514413188.y === null || x3514413188.y === undefined || typeof x3514413188.y !== "number" || (x3514413188.y || 0) !== x3514413188.y || x3514413188.y < 0) {
                    const err = new Error("Invalid Type at '" + "createProfessor.args.professor" + ".avatar" + ".crop" + ".y" + "', expected AST::UIntPrimitiveType, got '" + x3514413188.y + "'");
                    typeCheckerError(err, ctx);
                }
                if (x3514413188.width === null || x3514413188.width === undefined || typeof x3514413188.width !== "number" || (x3514413188.width || 0) !== x3514413188.width || x3514413188.width < 0) {
                    const err = new Error("Invalid Type at '" + "createProfessor.args.professor" + ".avatar" + ".crop" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x3514413188.width + "'");
                    typeCheckerError(err, ctx);
                }
                if (x3514413188.height === null || x3514413188.height === undefined || typeof x3514413188.height !== "number" || (x3514413188.height || 0) !== x3514413188.height || x3514413188.height < 0) {
                    const err = new Error("Invalid Type at '" + "createProfessor.args.professor" + ".avatar" + ".crop" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x3514413188.height + "'");
                    typeCheckerError(err, ctx);
                }
            }
        }
        if (args.professor.schoolClassIds === null || args.professor.schoolClassIds === undefined || !(args.professor.schoolClassIds instanceof Array)) {
            const err = new Error("Invalid Type at '" + "createProfessor.args.professor" + ".schoolClassIds" + "', expected AST::ArrayType, got '" + args.professor.schoolClassIds + "'");
            typeCheckerError(err, ctx);
        } else {
            for (let x1027102726 = 0; x1027102726 < args.professor.schoolClassIds.length; ++x1027102726) {
                if (args.professor.schoolClassIds[x1027102726] === null || args.professor.schoolClassIds[x1027102726] === undefined || typeof args.professor.schoolClassIds[x1027102726] !== "string") {
                    const err = new Error("Invalid Type at '" + "createProfessor.args.professor" + ".schoolClassIds" + "[" + x1027102726 + "]" + "', expected AST::StringPrimitiveType, got '" + args.professor.schoolClassIds[x1027102726] + "'");
                    typeCheckerError(err, ctx);
                }
            }
        }
        if (args.professor.name === null || args.professor.name === undefined || typeof args.professor.name !== "string") {
            const err = new Error("Invalid Type at '" + "createProfessor.args.professor" + ".name" + "', expected AST::StringPrimitiveType, got '" + args.professor.name + "'");
            typeCheckerError(err, ctx);
        }
        if (args.professor.tags === null || args.professor.tags === undefined || !(args.professor.tags instanceof Array)) {
            const err = new Error("Invalid Type at '" + "createProfessor.args.professor" + ".tags" + "', expected AST::ArrayType, got '" + args.professor.tags + "'");
            typeCheckerError(err, ctx);
        } else {
            for (let x3368201535 = 0; x3368201535 < args.professor.tags.length; ++x3368201535) {
                if (args.professor.tags[x3368201535] === null || args.professor.tags[x3368201535] === undefined || typeof args.professor.tags[x3368201535] !== "string") {
                    const err = new Error("Invalid Type at '" + "createProfessor.args.professor" + ".tags" + "[" + x3368201535 + "]" + "', expected AST::StringPrimitiveType, got '" + args.professor.tags[x3368201535] + "'");
                    typeCheckerError(err, ctx);
                }
            }
        }
        if (args.professor.hardness === null || args.professor.hardness === undefined || typeof args.professor.hardness !== "number" || (args.professor.hardness || 0) !== args.professor.hardness || args.professor.hardness < 0) {
            const err = new Error("Invalid Type at '" + "createProfessor.args.professor" + ".hardness" + "', expected AST::UIntPrimitiveType, got '" + args.professor.hardness + "'");
            typeCheckerError(err, ctx);
        }
        const professor = {
            avatar: args.professor.avatar === null || args.professor.avatar === undefined ? null : {
                bytes: args.professor.avatar.bytes === null || args.professor.avatar.bytes === undefined ? null : Buffer.from(args.professor.avatar.bytes, "base64"),
                image: args.professor.avatar.image === null || args.professor.avatar.image === undefined ? null : {
                    thumb: {
                        width: args.professor.avatar.image.thumb.width || 0,
                        height: args.professor.avatar.image.thumb.height || 0,
                        url: args.professor.avatar.image.thumb.url,
                    },
                    width: args.professor.avatar.image.width || 0,
                    height: args.professor.avatar.image.height || 0,
                    url: args.professor.avatar.image.url,
                },
                crop: args.professor.avatar.crop === null || args.professor.avatar.crop === undefined ? null : {
                    x: args.professor.avatar.crop.x || 0,
                    y: args.professor.avatar.crop.y || 0,
                    width: args.professor.avatar.crop.width || 0,
                    height: args.professor.avatar.crop.height || 0,
                },
            },
            schoolClassIds: args.professor.schoolClassIds.map((e: any) => e),
            name: args.professor.name,
            tags: args.professor.tags.map((e: any) => e),
            hardness: args.professor.hardness || 0,
        };

        let cacheKey: string | null = null, decodedKey: string | null = null, cacheExpirationSeconds: number | null = null, cacheVersion: number | null = null;
        if (cacheConfig.createProfessor) {
            try {
                const {key, expirationSeconds, version} = await cacheConfig.createProfessor(ctx, professor);
                if (!key) throw "";
                cacheKey = crypto.createHash("sha256").update(JSON.stringify(key)+ "-createProfessor").digest("hex").substr(0, 100); decodedKey = JSON.stringify(key); cacheExpirationSeconds = expirationSeconds; cacheVersion = version;
                const cache = await hook.getCache(cacheKey, version);console.log(JSON.stringify(cache));
                if (cache && (!cache.expirationDate || cache.expirationDate > new Date())) return cache.ret;
            } catch(e) {console.log(JSON.stringify(e));}
        }
        const ret = await fn.createProfessor(ctx, professor);
        if (ret === null || ret === undefined) {
            const err = new Error("Invalid Type at '" + "createProfessor.ret" + "', expected AST::StructType, got '" + ret + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.id === null || ret.id === undefined || typeof ret.id !== "string") {
            const err = new Error("Invalid Type at '" + "createProfessor.ret" + ".id" + "', expected AST::StringPrimitiveType, got '" + ret.id + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.schoolClasses === null || ret.schoolClasses === undefined || !(ret.schoolClasses instanceof Array)) {
            const err = new Error("Invalid Type at '" + "createProfessor.ret" + ".schoolClasses" + "', expected AST::ArrayType, got '" + ret.schoolClasses + "'");
            typeCheckerError(err, ctx);
        } else {
            for (let x3159424823 = 0; x3159424823 < ret.schoolClasses.length; ++x3159424823) {
                if (ret.schoolClasses[x3159424823] === null || ret.schoolClasses[x3159424823] === undefined) {
                    const err = new Error("Invalid Type at '" + "createProfessor.ret" + ".schoolClasses" + "[" + x3159424823 + "]" + "', expected AST::StructType, got '" + ret.schoolClasses[x3159424823] + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret.schoolClasses[x3159424823].id === null || ret.schoolClasses[x3159424823].id === undefined || typeof ret.schoolClasses[x3159424823].id !== "string") {
                    const err = new Error("Invalid Type at '" + "createProfessor.ret" + ".schoolClasses" + "[" + x3159424823 + "]" + ".id" + "', expected AST::StringPrimitiveType, got '" + ret.schoolClasses[x3159424823].id + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret.schoolClasses[x3159424823].description === null || ret.schoolClasses[x3159424823].description === undefined || typeof ret.schoolClasses[x3159424823].description !== "string") {
                    const err = new Error("Invalid Type at '" + "createProfessor.ret" + ".schoolClasses" + "[" + x3159424823 + "]" + ".description" + "', expected AST::StringPrimitiveType, got '" + ret.schoolClasses[x3159424823].description + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret.schoolClasses[x3159424823].name === null || ret.schoolClasses[x3159424823].name === undefined || typeof ret.schoolClasses[x3159424823].name !== "string") {
                    const err = new Error("Invalid Type at '" + "createProfessor.ret" + ".schoolClasses" + "[" + x3159424823 + "]" + ".name" + "', expected AST::StringPrimitiveType, got '" + ret.schoolClasses[x3159424823].name + "'");
                    typeCheckerError(err, ctx);
                }
            }
        }
        const x552169405 = ret.avatar;
        if (x552169405 !== null && x552169405 !== undefined) {
            if (x552169405 === null || x552169405 === undefined) {
                const err = new Error("Invalid Type at '" + "createProfessor.ret" + ".avatar" + "', expected AST::StructType, got '" + x552169405 + "'");
                typeCheckerError(err, ctx);
            }
            if (x552169405.thumb === null || x552169405.thumb === undefined) {
                const err = new Error("Invalid Type at '" + "createProfessor.ret" + ".avatar" + ".thumb" + "', expected AST::StructType, got '" + x552169405.thumb + "'");
                typeCheckerError(err, ctx);
            }
            if (x552169405.thumb.width === null || x552169405.thumb.width === undefined || typeof x552169405.thumb.width !== "number" || (x552169405.thumb.width || 0) !== x552169405.thumb.width || x552169405.thumb.width < 0) {
                const err = new Error("Invalid Type at '" + "createProfessor.ret" + ".avatar" + ".thumb" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x552169405.thumb.width + "'");
                typeCheckerError(err, ctx);
            }
            if (x552169405.thumb.height === null || x552169405.thumb.height === undefined || typeof x552169405.thumb.height !== "number" || (x552169405.thumb.height || 0) !== x552169405.thumb.height || x552169405.thumb.height < 0) {
                const err = new Error("Invalid Type at '" + "createProfessor.ret" + ".avatar" + ".thumb" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x552169405.thumb.height + "'");
                typeCheckerError(err, ctx);
            }
            if (x552169405.thumb.url === null || x552169405.thumb.url === undefined || typeof x552169405.thumb.url !== "string") {
                const err = new Error("Invalid Type at '" + "createProfessor.ret" + ".avatar" + ".thumb" + ".url" + "', expected AST::StringPrimitiveType, got '" + x552169405.thumb.url + "'");
                typeCheckerError(err, ctx);
            }
            if (x552169405.width === null || x552169405.width === undefined || typeof x552169405.width !== "number" || (x552169405.width || 0) !== x552169405.width || x552169405.width < 0) {
                const err = new Error("Invalid Type at '" + "createProfessor.ret" + ".avatar" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x552169405.width + "'");
                typeCheckerError(err, ctx);
            }
            if (x552169405.height === null || x552169405.height === undefined || typeof x552169405.height !== "number" || (x552169405.height || 0) !== x552169405.height || x552169405.height < 0) {
                const err = new Error("Invalid Type at '" + "createProfessor.ret" + ".avatar" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x552169405.height + "'");
                typeCheckerError(err, ctx);
            }
            if (x552169405.url === null || x552169405.url === undefined || typeof x552169405.url !== "string") {
                const err = new Error("Invalid Type at '" + "createProfessor.ret" + ".avatar" + ".url" + "', expected AST::StringPrimitiveType, got '" + x552169405.url + "'");
                typeCheckerError(err, ctx);
            }
        }
        if (ret.name === null || ret.name === undefined || typeof ret.name !== "string") {
            const err = new Error("Invalid Type at '" + "createProfessor.ret" + ".name" + "', expected AST::StringPrimitiveType, got '" + ret.name + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.tags === null || ret.tags === undefined || !(ret.tags instanceof Array)) {
            const err = new Error("Invalid Type at '" + "createProfessor.ret" + ".tags" + "', expected AST::ArrayType, got '" + ret.tags + "'");
            typeCheckerError(err, ctx);
        } else {
            for (let x2941702569 = 0; x2941702569 < ret.tags.length; ++x2941702569) {
                if (ret.tags[x2941702569] === null || ret.tags[x2941702569] === undefined || typeof ret.tags[x2941702569] !== "string") {
                    const err = new Error("Invalid Type at '" + "createProfessor.ret" + ".tags" + "[" + x2941702569 + "]" + "', expected AST::StringPrimitiveType, got '" + ret.tags[x2941702569] + "'");
                    typeCheckerError(err, ctx);
                }
            }
        }
        if (ret.hardness === null || ret.hardness === undefined || typeof ret.hardness !== "number" || (ret.hardness || 0) !== ret.hardness || ret.hardness < 0) {
            const err = new Error("Invalid Type at '" + "createProfessor.ret" + ".hardness" + "', expected AST::UIntPrimitiveType, got '" + ret.hardness + "'");
            typeCheckerError(err, ctx);
        }
        const encodedRet = {
            id: ret.id,
            schoolClasses: ret.schoolClasses.map(e => ({
                id: e.id,
                description: e.description,
                name: e.name,
            })),
            avatar: ret.avatar === null || ret.avatar === undefined ? null : {
                thumb: {
                    width: ret.avatar.thumb.width || 0,
                    height: ret.avatar.thumb.height || 0,
                    url: ret.avatar.thumb.url,
                },
                width: ret.avatar.width || 0,
                height: ret.avatar.height || 0,
                url: ret.avatar.url,
            },
            name: ret.name,
            tags: ret.tags.map(e => e),
            hardness: ret.hardness || 0,
        };
        if (cacheKey !== null && cacheVersion !== null) hook.setCache(cacheKey, cacheExpirationSeconds ? new Date(new Date().getTime() + (cacheExpirationSeconds * 1000)) : null, cacheVersion, decodedKey!, "createProfessor", encodedRet);
        return encodedRet    },
    editProfessor: async (ctx: Context, args: any) => {
        if (args.professorId === null || args.professorId === undefined || typeof args.professorId !== "string") {
            const err = new Error("Invalid Type at '" + "editProfessor.args.professorId" + "', expected AST::StringPrimitiveType, got '" + args.professorId + "'");
            typeCheckerError(err, ctx);
        }
        const professorId = args.professorId;
        if (args.professor === null || args.professor === undefined) {
            const err = new Error("Invalid Type at '" + "editProfessor.args.professor" + "', expected AST::StructType, got '" + args.professor + "'");
            typeCheckerError(err, ctx);
        }
        const x1489409561 = args.professor.avatar;
        if (x1489409561 !== null && x1489409561 !== undefined) {
            if (x1489409561 === null || x1489409561 === undefined) {
                const err = new Error("Invalid Type at '" + "editProfessor.args.professor" + ".avatar" + "', expected AST::StructType, got '" + x1489409561 + "'");
                typeCheckerError(err, ctx);
            }
            const x2668122184 = x1489409561.bytes;
            if (x2668122184 !== null && x2668122184 !== undefined) {
            }
            const x456989233 = x1489409561.image;
            if (x456989233 !== null && x456989233 !== undefined) {
                if (x456989233 === null || x456989233 === undefined) {
                    const err = new Error("Invalid Type at '" + "editProfessor.args.professor" + ".avatar" + ".image" + "', expected AST::StructType, got '" + x456989233 + "'");
                    typeCheckerError(err, ctx);
                }
                if (x456989233.thumb === null || x456989233.thumb === undefined) {
                    const err = new Error("Invalid Type at '" + "editProfessor.args.professor" + ".avatar" + ".image" + ".thumb" + "', expected AST::StructType, got '" + x456989233.thumb + "'");
                    typeCheckerError(err, ctx);
                }
                if (x456989233.thumb.width === null || x456989233.thumb.width === undefined || typeof x456989233.thumb.width !== "number" || (x456989233.thumb.width || 0) !== x456989233.thumb.width || x456989233.thumb.width < 0) {
                    const err = new Error("Invalid Type at '" + "editProfessor.args.professor" + ".avatar" + ".image" + ".thumb" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x456989233.thumb.width + "'");
                    typeCheckerError(err, ctx);
                }
                if (x456989233.thumb.height === null || x456989233.thumb.height === undefined || typeof x456989233.thumb.height !== "number" || (x456989233.thumb.height || 0) !== x456989233.thumb.height || x456989233.thumb.height < 0) {
                    const err = new Error("Invalid Type at '" + "editProfessor.args.professor" + ".avatar" + ".image" + ".thumb" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x456989233.thumb.height + "'");
                    typeCheckerError(err, ctx);
                }
                if (x456989233.thumb.url === null || x456989233.thumb.url === undefined || typeof x456989233.thumb.url !== "string") {
                    const err = new Error("Invalid Type at '" + "editProfessor.args.professor" + ".avatar" + ".image" + ".thumb" + ".url" + "', expected AST::StringPrimitiveType, got '" + x456989233.thumb.url + "'");
                    typeCheckerError(err, ctx);
                }
                if (x456989233.width === null || x456989233.width === undefined || typeof x456989233.width !== "number" || (x456989233.width || 0) !== x456989233.width || x456989233.width < 0) {
                    const err = new Error("Invalid Type at '" + "editProfessor.args.professor" + ".avatar" + ".image" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x456989233.width + "'");
                    typeCheckerError(err, ctx);
                }
                if (x456989233.height === null || x456989233.height === undefined || typeof x456989233.height !== "number" || (x456989233.height || 0) !== x456989233.height || x456989233.height < 0) {
                    const err = new Error("Invalid Type at '" + "editProfessor.args.professor" + ".avatar" + ".image" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x456989233.height + "'");
                    typeCheckerError(err, ctx);
                }
                if (x456989233.url === null || x456989233.url === undefined || typeof x456989233.url !== "string") {
                    const err = new Error("Invalid Type at '" + "editProfessor.args.professor" + ".avatar" + ".image" + ".url" + "', expected AST::StringPrimitiveType, got '" + x456989233.url + "'");
                    typeCheckerError(err, ctx);
                }
            }
            const x3907771745 = x1489409561.crop;
            if (x3907771745 !== null && x3907771745 !== undefined) {
                if (x3907771745 === null || x3907771745 === undefined) {
                    const err = new Error("Invalid Type at '" + "editProfessor.args.professor" + ".avatar" + ".crop" + "', expected AST::StructType, got '" + x3907771745 + "'");
                    typeCheckerError(err, ctx);
                }
                if (x3907771745.x === null || x3907771745.x === undefined || typeof x3907771745.x !== "number" || (x3907771745.x || 0) !== x3907771745.x || x3907771745.x < 0) {
                    const err = new Error("Invalid Type at '" + "editProfessor.args.professor" + ".avatar" + ".crop" + ".x" + "', expected AST::UIntPrimitiveType, got '" + x3907771745.x + "'");
                    typeCheckerError(err, ctx);
                }
                if (x3907771745.y === null || x3907771745.y === undefined || typeof x3907771745.y !== "number" || (x3907771745.y || 0) !== x3907771745.y || x3907771745.y < 0) {
                    const err = new Error("Invalid Type at '" + "editProfessor.args.professor" + ".avatar" + ".crop" + ".y" + "', expected AST::UIntPrimitiveType, got '" + x3907771745.y + "'");
                    typeCheckerError(err, ctx);
                }
                if (x3907771745.width === null || x3907771745.width === undefined || typeof x3907771745.width !== "number" || (x3907771745.width || 0) !== x3907771745.width || x3907771745.width < 0) {
                    const err = new Error("Invalid Type at '" + "editProfessor.args.professor" + ".avatar" + ".crop" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x3907771745.width + "'");
                    typeCheckerError(err, ctx);
                }
                if (x3907771745.height === null || x3907771745.height === undefined || typeof x3907771745.height !== "number" || (x3907771745.height || 0) !== x3907771745.height || x3907771745.height < 0) {
                    const err = new Error("Invalid Type at '" + "editProfessor.args.professor" + ".avatar" + ".crop" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x3907771745.height + "'");
                    typeCheckerError(err, ctx);
                }
            }
        }
        if (args.professor.schoolClassIds === null || args.professor.schoolClassIds === undefined || !(args.professor.schoolClassIds instanceof Array)) {
            const err = new Error("Invalid Type at '" + "editProfessor.args.professor" + ".schoolClassIds" + "', expected AST::ArrayType, got '" + args.professor.schoolClassIds + "'");
            typeCheckerError(err, ctx);
        } else {
            for (let x1613829517 = 0; x1613829517 < args.professor.schoolClassIds.length; ++x1613829517) {
                if (args.professor.schoolClassIds[x1613829517] === null || args.professor.schoolClassIds[x1613829517] === undefined || typeof args.professor.schoolClassIds[x1613829517] !== "string") {
                    const err = new Error("Invalid Type at '" + "editProfessor.args.professor" + ".schoolClassIds" + "[" + x1613829517 + "]" + "', expected AST::StringPrimitiveType, got '" + args.professor.schoolClassIds[x1613829517] + "'");
                    typeCheckerError(err, ctx);
                }
            }
        }
        if (args.professor.name === null || args.professor.name === undefined || typeof args.professor.name !== "string") {
            const err = new Error("Invalid Type at '" + "editProfessor.args.professor" + ".name" + "', expected AST::StringPrimitiveType, got '" + args.professor.name + "'");
            typeCheckerError(err, ctx);
        }
        if (args.professor.tags === null || args.professor.tags === undefined || !(args.professor.tags instanceof Array)) {
            const err = new Error("Invalid Type at '" + "editProfessor.args.professor" + ".tags" + "', expected AST::ArrayType, got '" + args.professor.tags + "'");
            typeCheckerError(err, ctx);
        } else {
            for (let x3586166953 = 0; x3586166953 < args.professor.tags.length; ++x3586166953) {
                if (args.professor.tags[x3586166953] === null || args.professor.tags[x3586166953] === undefined || typeof args.professor.tags[x3586166953] !== "string") {
                    const err = new Error("Invalid Type at '" + "editProfessor.args.professor" + ".tags" + "[" + x3586166953 + "]" + "', expected AST::StringPrimitiveType, got '" + args.professor.tags[x3586166953] + "'");
                    typeCheckerError(err, ctx);
                }
            }
        }
        if (args.professor.hardness === null || args.professor.hardness === undefined || typeof args.professor.hardness !== "number" || (args.professor.hardness || 0) !== args.professor.hardness || args.professor.hardness < 0) {
            const err = new Error("Invalid Type at '" + "editProfessor.args.professor" + ".hardness" + "', expected AST::UIntPrimitiveType, got '" + args.professor.hardness + "'");
            typeCheckerError(err, ctx);
        }
        const professor = {
            avatar: args.professor.avatar === null || args.professor.avatar === undefined ? null : {
                bytes: args.professor.avatar.bytes === null || args.professor.avatar.bytes === undefined ? null : Buffer.from(args.professor.avatar.bytes, "base64"),
                image: args.professor.avatar.image === null || args.professor.avatar.image === undefined ? null : {
                    thumb: {
                        width: args.professor.avatar.image.thumb.width || 0,
                        height: args.professor.avatar.image.thumb.height || 0,
                        url: args.professor.avatar.image.thumb.url,
                    },
                    width: args.professor.avatar.image.width || 0,
                    height: args.professor.avatar.image.height || 0,
                    url: args.professor.avatar.image.url,
                },
                crop: args.professor.avatar.crop === null || args.professor.avatar.crop === undefined ? null : {
                    x: args.professor.avatar.crop.x || 0,
                    y: args.professor.avatar.crop.y || 0,
                    width: args.professor.avatar.crop.width || 0,
                    height: args.professor.avatar.crop.height || 0,
                },
            },
            schoolClassIds: args.professor.schoolClassIds.map((e: any) => e),
            name: args.professor.name,
            tags: args.professor.tags.map((e: any) => e),
            hardness: args.professor.hardness || 0,
        };

        let cacheKey: string | null = null, decodedKey: string | null = null, cacheExpirationSeconds: number | null = null, cacheVersion: number | null = null;
        if (cacheConfig.editProfessor) {
            try {
                const {key, expirationSeconds, version} = await cacheConfig.editProfessor(ctx, professorId, professor);
                if (!key) throw "";
                cacheKey = crypto.createHash("sha256").update(JSON.stringify(key)+ "-editProfessor").digest("hex").substr(0, 100); decodedKey = JSON.stringify(key); cacheExpirationSeconds = expirationSeconds; cacheVersion = version;
                const cache = await hook.getCache(cacheKey, version);console.log(JSON.stringify(cache));
                if (cache && (!cache.expirationDate || cache.expirationDate > new Date())) return cache.ret;
            } catch(e) {console.log(JSON.stringify(e));}
        }
        const ret = await fn.editProfessor(ctx, professorId, professor);
        if (ret === null || ret === undefined) {
            const err = new Error("Invalid Type at '" + "editProfessor.ret" + "', expected AST::StructType, got '" + ret + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.id === null || ret.id === undefined || typeof ret.id !== "string") {
            const err = new Error("Invalid Type at '" + "editProfessor.ret" + ".id" + "', expected AST::StringPrimitiveType, got '" + ret.id + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.schoolClasses === null || ret.schoolClasses === undefined || !(ret.schoolClasses instanceof Array)) {
            const err = new Error("Invalid Type at '" + "editProfessor.ret" + ".schoolClasses" + "', expected AST::ArrayType, got '" + ret.schoolClasses + "'");
            typeCheckerError(err, ctx);
        } else {
            for (let x592818808 = 0; x592818808 < ret.schoolClasses.length; ++x592818808) {
                if (ret.schoolClasses[x592818808] === null || ret.schoolClasses[x592818808] === undefined) {
                    const err = new Error("Invalid Type at '" + "editProfessor.ret" + ".schoolClasses" + "[" + x592818808 + "]" + "', expected AST::StructType, got '" + ret.schoolClasses[x592818808] + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret.schoolClasses[x592818808].id === null || ret.schoolClasses[x592818808].id === undefined || typeof ret.schoolClasses[x592818808].id !== "string") {
                    const err = new Error("Invalid Type at '" + "editProfessor.ret" + ".schoolClasses" + "[" + x592818808 + "]" + ".id" + "', expected AST::StringPrimitiveType, got '" + ret.schoolClasses[x592818808].id + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret.schoolClasses[x592818808].description === null || ret.schoolClasses[x592818808].description === undefined || typeof ret.schoolClasses[x592818808].description !== "string") {
                    const err = new Error("Invalid Type at '" + "editProfessor.ret" + ".schoolClasses" + "[" + x592818808 + "]" + ".description" + "', expected AST::StringPrimitiveType, got '" + ret.schoolClasses[x592818808].description + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret.schoolClasses[x592818808].name === null || ret.schoolClasses[x592818808].name === undefined || typeof ret.schoolClasses[x592818808].name !== "string") {
                    const err = new Error("Invalid Type at '" + "editProfessor.ret" + ".schoolClasses" + "[" + x592818808 + "]" + ".name" + "', expected AST::StringPrimitiveType, got '" + ret.schoolClasses[x592818808].name + "'");
                    typeCheckerError(err, ctx);
                }
            }
        }
        const x4101963276 = ret.avatar;
        if (x4101963276 !== null && x4101963276 !== undefined) {
            if (x4101963276 === null || x4101963276 === undefined) {
                const err = new Error("Invalid Type at '" + "editProfessor.ret" + ".avatar" + "', expected AST::StructType, got '" + x4101963276 + "'");
                typeCheckerError(err, ctx);
            }
            if (x4101963276.thumb === null || x4101963276.thumb === undefined) {
                const err = new Error("Invalid Type at '" + "editProfessor.ret" + ".avatar" + ".thumb" + "', expected AST::StructType, got '" + x4101963276.thumb + "'");
                typeCheckerError(err, ctx);
            }
            if (x4101963276.thumb.width === null || x4101963276.thumb.width === undefined || typeof x4101963276.thumb.width !== "number" || (x4101963276.thumb.width || 0) !== x4101963276.thumb.width || x4101963276.thumb.width < 0) {
                const err = new Error("Invalid Type at '" + "editProfessor.ret" + ".avatar" + ".thumb" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x4101963276.thumb.width + "'");
                typeCheckerError(err, ctx);
            }
            if (x4101963276.thumb.height === null || x4101963276.thumb.height === undefined || typeof x4101963276.thumb.height !== "number" || (x4101963276.thumb.height || 0) !== x4101963276.thumb.height || x4101963276.thumb.height < 0) {
                const err = new Error("Invalid Type at '" + "editProfessor.ret" + ".avatar" + ".thumb" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x4101963276.thumb.height + "'");
                typeCheckerError(err, ctx);
            }
            if (x4101963276.thumb.url === null || x4101963276.thumb.url === undefined || typeof x4101963276.thumb.url !== "string") {
                const err = new Error("Invalid Type at '" + "editProfessor.ret" + ".avatar" + ".thumb" + ".url" + "', expected AST::StringPrimitiveType, got '" + x4101963276.thumb.url + "'");
                typeCheckerError(err, ctx);
            }
            if (x4101963276.width === null || x4101963276.width === undefined || typeof x4101963276.width !== "number" || (x4101963276.width || 0) !== x4101963276.width || x4101963276.width < 0) {
                const err = new Error("Invalid Type at '" + "editProfessor.ret" + ".avatar" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x4101963276.width + "'");
                typeCheckerError(err, ctx);
            }
            if (x4101963276.height === null || x4101963276.height === undefined || typeof x4101963276.height !== "number" || (x4101963276.height || 0) !== x4101963276.height || x4101963276.height < 0) {
                const err = new Error("Invalid Type at '" + "editProfessor.ret" + ".avatar" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x4101963276.height + "'");
                typeCheckerError(err, ctx);
            }
            if (x4101963276.url === null || x4101963276.url === undefined || typeof x4101963276.url !== "string") {
                const err = new Error("Invalid Type at '" + "editProfessor.ret" + ".avatar" + ".url" + "', expected AST::StringPrimitiveType, got '" + x4101963276.url + "'");
                typeCheckerError(err, ctx);
            }
        }
        if (ret.name === null || ret.name === undefined || typeof ret.name !== "string") {
            const err = new Error("Invalid Type at '" + "editProfessor.ret" + ".name" + "', expected AST::StringPrimitiveType, got '" + ret.name + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.tags === null || ret.tags === undefined || !(ret.tags instanceof Array)) {
            const err = new Error("Invalid Type at '" + "editProfessor.ret" + ".tags" + "', expected AST::ArrayType, got '" + ret.tags + "'");
            typeCheckerError(err, ctx);
        } else {
            for (let x3254043950 = 0; x3254043950 < ret.tags.length; ++x3254043950) {
                if (ret.tags[x3254043950] === null || ret.tags[x3254043950] === undefined || typeof ret.tags[x3254043950] !== "string") {
                    const err = new Error("Invalid Type at '" + "editProfessor.ret" + ".tags" + "[" + x3254043950 + "]" + "', expected AST::StringPrimitiveType, got '" + ret.tags[x3254043950] + "'");
                    typeCheckerError(err, ctx);
                }
            }
        }
        if (ret.hardness === null || ret.hardness === undefined || typeof ret.hardness !== "number" || (ret.hardness || 0) !== ret.hardness || ret.hardness < 0) {
            const err = new Error("Invalid Type at '" + "editProfessor.ret" + ".hardness" + "', expected AST::UIntPrimitiveType, got '" + ret.hardness + "'");
            typeCheckerError(err, ctx);
        }
        const encodedRet = {
            id: ret.id,
            schoolClasses: ret.schoolClasses.map(e => ({
                id: e.id,
                description: e.description,
                name: e.name,
            })),
            avatar: ret.avatar === null || ret.avatar === undefined ? null : {
                thumb: {
                    width: ret.avatar.thumb.width || 0,
                    height: ret.avatar.thumb.height || 0,
                    url: ret.avatar.thumb.url,
                },
                width: ret.avatar.width || 0,
                height: ret.avatar.height || 0,
                url: ret.avatar.url,
            },
            name: ret.name,
            tags: ret.tags.map(e => e),
            hardness: ret.hardness || 0,
        };
        if (cacheKey !== null && cacheVersion !== null) hook.setCache(cacheKey, cacheExpirationSeconds ? new Date(new Date().getTime() + (cacheExpirationSeconds * 1000)) : null, cacheVersion, decodedKey!, "editProfessor", encodedRet);
        return encodedRet    },
    getProfessorsFor: async (ctx: Context, args: any) => {
        if (args.schoolClassId === null || args.schoolClassId === undefined || typeof args.schoolClassId !== "string") {
            const err = new Error("Invalid Type at '" + "getProfessorsFor.args.schoolClassId" + "', expected AST::StringPrimitiveType, got '" + args.schoolClassId + "'");
            typeCheckerError(err, ctx);
        }
        const schoolClassId = args.schoolClassId;

        let cacheKey: string | null = null, decodedKey: string | null = null, cacheExpirationSeconds: number | null = null, cacheVersion: number | null = null;
        if (cacheConfig.getProfessorsFor) {
            try {
                const {key, expirationSeconds, version} = await cacheConfig.getProfessorsFor(ctx, schoolClassId);
                if (!key) throw "";
                cacheKey = crypto.createHash("sha256").update(JSON.stringify(key)+ "-getProfessorsFor").digest("hex").substr(0, 100); decodedKey = JSON.stringify(key); cacheExpirationSeconds = expirationSeconds; cacheVersion = version;
                const cache = await hook.getCache(cacheKey, version);console.log(JSON.stringify(cache));
                if (cache && (!cache.expirationDate || cache.expirationDate > new Date())) return cache.ret;
            } catch(e) {console.log(JSON.stringify(e));}
        }
        const ret = await fn.getProfessorsFor(ctx, schoolClassId);
        if (ret === null || ret === undefined || !(ret instanceof Array)) {
            const err = new Error("Invalid Type at '" + "getProfessorsFor.ret" + "', expected AST::ArrayType, got '" + ret + "'");
            typeCheckerError(err, ctx);
        } else {
            for (let x1688549243 = 0; x1688549243 < ret.length; ++x1688549243) {
                if (ret[x1688549243] === null || ret[x1688549243] === undefined) {
                    const err = new Error("Invalid Type at '" + "getProfessorsFor.ret" + "[" + x1688549243 + "]" + "', expected AST::StructType, got '" + ret[x1688549243] + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret[x1688549243].id === null || ret[x1688549243].id === undefined || typeof ret[x1688549243].id !== "string") {
                    const err = new Error("Invalid Type at '" + "getProfessorsFor.ret" + "[" + x1688549243 + "]" + ".id" + "', expected AST::StringPrimitiveType, got '" + ret[x1688549243].id + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret[x1688549243].schoolClasses === null || ret[x1688549243].schoolClasses === undefined || !(ret[x1688549243].schoolClasses instanceof Array)) {
                    const err = new Error("Invalid Type at '" + "getProfessorsFor.ret" + "[" + x1688549243 + "]" + ".schoolClasses" + "', expected AST::ArrayType, got '" + ret[x1688549243].schoolClasses + "'");
                    typeCheckerError(err, ctx);
                } else {
                    for (let x2916723753 = 0; x2916723753 < ret[x1688549243].schoolClasses.length; ++x2916723753) {
                        if (ret[x1688549243].schoolClasses[x2916723753] === null || ret[x1688549243].schoolClasses[x2916723753] === undefined) {
                            const err = new Error("Invalid Type at '" + "getProfessorsFor.ret" + "[" + x1688549243 + "]" + ".schoolClasses" + "[" + x2916723753 + "]" + "', expected AST::StructType, got '" + ret[x1688549243].schoolClasses[x2916723753] + "'");
                            typeCheckerError(err, ctx);
                        }
                        if (ret[x1688549243].schoolClasses[x2916723753].id === null || ret[x1688549243].schoolClasses[x2916723753].id === undefined || typeof ret[x1688549243].schoolClasses[x2916723753].id !== "string") {
                            const err = new Error("Invalid Type at '" + "getProfessorsFor.ret" + "[" + x1688549243 + "]" + ".schoolClasses" + "[" + x2916723753 + "]" + ".id" + "', expected AST::StringPrimitiveType, got '" + ret[x1688549243].schoolClasses[x2916723753].id + "'");
                            typeCheckerError(err, ctx);
                        }
                        if (ret[x1688549243].schoolClasses[x2916723753].description === null || ret[x1688549243].schoolClasses[x2916723753].description === undefined || typeof ret[x1688549243].schoolClasses[x2916723753].description !== "string") {
                            const err = new Error("Invalid Type at '" + "getProfessorsFor.ret" + "[" + x1688549243 + "]" + ".schoolClasses" + "[" + x2916723753 + "]" + ".description" + "', expected AST::StringPrimitiveType, got '" + ret[x1688549243].schoolClasses[x2916723753].description + "'");
                            typeCheckerError(err, ctx);
                        }
                        if (ret[x1688549243].schoolClasses[x2916723753].name === null || ret[x1688549243].schoolClasses[x2916723753].name === undefined || typeof ret[x1688549243].schoolClasses[x2916723753].name !== "string") {
                            const err = new Error("Invalid Type at '" + "getProfessorsFor.ret" + "[" + x1688549243 + "]" + ".schoolClasses" + "[" + x2916723753 + "]" + ".name" + "', expected AST::StringPrimitiveType, got '" + ret[x1688549243].schoolClasses[x2916723753].name + "'");
                            typeCheckerError(err, ctx);
                        }
                    }
                }
                const x1336871983 = ret[x1688549243].avatar;
                if (x1336871983 !== null && x1336871983 !== undefined) {
                    if (x1336871983 === null || x1336871983 === undefined) {
                        const err = new Error("Invalid Type at '" + "getProfessorsFor.ret" + "[" + x1688549243 + "]" + ".avatar" + "', expected AST::StructType, got '" + x1336871983 + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x1336871983.thumb === null || x1336871983.thumb === undefined) {
                        const err = new Error("Invalid Type at '" + "getProfessorsFor.ret" + "[" + x1688549243 + "]" + ".avatar" + ".thumb" + "', expected AST::StructType, got '" + x1336871983.thumb + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x1336871983.thumb.width === null || x1336871983.thumb.width === undefined || typeof x1336871983.thumb.width !== "number" || (x1336871983.thumb.width || 0) !== x1336871983.thumb.width || x1336871983.thumb.width < 0) {
                        const err = new Error("Invalid Type at '" + "getProfessorsFor.ret" + "[" + x1688549243 + "]" + ".avatar" + ".thumb" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x1336871983.thumb.width + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x1336871983.thumb.height === null || x1336871983.thumb.height === undefined || typeof x1336871983.thumb.height !== "number" || (x1336871983.thumb.height || 0) !== x1336871983.thumb.height || x1336871983.thumb.height < 0) {
                        const err = new Error("Invalid Type at '" + "getProfessorsFor.ret" + "[" + x1688549243 + "]" + ".avatar" + ".thumb" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x1336871983.thumb.height + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x1336871983.thumb.url === null || x1336871983.thumb.url === undefined || typeof x1336871983.thumb.url !== "string") {
                        const err = new Error("Invalid Type at '" + "getProfessorsFor.ret" + "[" + x1688549243 + "]" + ".avatar" + ".thumb" + ".url" + "', expected AST::StringPrimitiveType, got '" + x1336871983.thumb.url + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x1336871983.width === null || x1336871983.width === undefined || typeof x1336871983.width !== "number" || (x1336871983.width || 0) !== x1336871983.width || x1336871983.width < 0) {
                        const err = new Error("Invalid Type at '" + "getProfessorsFor.ret" + "[" + x1688549243 + "]" + ".avatar" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x1336871983.width + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x1336871983.height === null || x1336871983.height === undefined || typeof x1336871983.height !== "number" || (x1336871983.height || 0) !== x1336871983.height || x1336871983.height < 0) {
                        const err = new Error("Invalid Type at '" + "getProfessorsFor.ret" + "[" + x1688549243 + "]" + ".avatar" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x1336871983.height + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x1336871983.url === null || x1336871983.url === undefined || typeof x1336871983.url !== "string") {
                        const err = new Error("Invalid Type at '" + "getProfessorsFor.ret" + "[" + x1688549243 + "]" + ".avatar" + ".url" + "', expected AST::StringPrimitiveType, got '" + x1336871983.url + "'");
                        typeCheckerError(err, ctx);
                    }
                }
                if (ret[x1688549243].name === null || ret[x1688549243].name === undefined || typeof ret[x1688549243].name !== "string") {
                    const err = new Error("Invalid Type at '" + "getProfessorsFor.ret" + "[" + x1688549243 + "]" + ".name" + "', expected AST::StringPrimitiveType, got '" + ret[x1688549243].name + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret[x1688549243].tags === null || ret[x1688549243].tags === undefined || !(ret[x1688549243].tags instanceof Array)) {
                    const err = new Error("Invalid Type at '" + "getProfessorsFor.ret" + "[" + x1688549243 + "]" + ".tags" + "', expected AST::ArrayType, got '" + ret[x1688549243].tags + "'");
                    typeCheckerError(err, ctx);
                } else {
                    for (let x1034463812 = 0; x1034463812 < ret[x1688549243].tags.length; ++x1034463812) {
                        if (ret[x1688549243].tags[x1034463812] === null || ret[x1688549243].tags[x1034463812] === undefined || typeof ret[x1688549243].tags[x1034463812] !== "string") {
                            const err = new Error("Invalid Type at '" + "getProfessorsFor.ret" + "[" + x1688549243 + "]" + ".tags" + "[" + x1034463812 + "]" + "', expected AST::StringPrimitiveType, got '" + ret[x1688549243].tags[x1034463812] + "'");
                            typeCheckerError(err, ctx);
                        }
                    }
                }
                if (ret[x1688549243].hardness === null || ret[x1688549243].hardness === undefined || typeof ret[x1688549243].hardness !== "number" || (ret[x1688549243].hardness || 0) !== ret[x1688549243].hardness || ret[x1688549243].hardness < 0) {
                    const err = new Error("Invalid Type at '" + "getProfessorsFor.ret" + "[" + x1688549243 + "]" + ".hardness" + "', expected AST::UIntPrimitiveType, got '" + ret[x1688549243].hardness + "'");
                    typeCheckerError(err, ctx);
                }
            }
        }
        const encodedRet = ret.map(e => ({
            id: e.id,
            schoolClasses: e.schoolClasses.map(e => ({
                id: e.id,
                description: e.description,
                name: e.name,
            })),
            avatar: e.avatar === null || e.avatar === undefined ? null : {
                thumb: {
                    width: e.avatar.thumb.width || 0,
                    height: e.avatar.thumb.height || 0,
                    url: e.avatar.thumb.url,
                },
                width: e.avatar.width || 0,
                height: e.avatar.height || 0,
                url: e.avatar.url,
            },
            name: e.name,
            tags: e.tags.map(e => e),
            hardness: e.hardness || 0,
        }));
        if (cacheKey !== null && cacheVersion !== null) hook.setCache(cacheKey, cacheExpirationSeconds ? new Date(new Date().getTime() + (cacheExpirationSeconds * 1000)) : null, cacheVersion, decodedKey!, "getProfessorsFor", encodedRet);
        return encodedRet    },
    createCommentary: async (ctx: Context, args: any) => {
        if (args.commentary === null || args.commentary === undefined) {
            const err = new Error("Invalid Type at '" + "createCommentary.args.commentary" + "', expected AST::StructType, got '" + args.commentary + "'");
            typeCheckerError(err, ctx);
        }
        const x3343695521 = args.commentary.professorId;
        if (x3343695521 !== null && x3343695521 !== undefined) {
            if (x3343695521 === null || x3343695521 === undefined || typeof x3343695521 !== "string") {
                const err = new Error("Invalid Type at '" + "createCommentary.args.commentary" + ".professorId" + "', expected AST::StringPrimitiveType, got '" + x3343695521 + "'");
                typeCheckerError(err, ctx);
            }
        }
        const x437344764 = args.commentary.schoolClassId;
        if (x437344764 !== null && x437344764 !== undefined) {
            if (x437344764 === null || x437344764 === undefined || typeof x437344764 !== "string") {
                const err = new Error("Invalid Type at '" + "createCommentary.args.commentary" + ".schoolClassId" + "', expected AST::StringPrimitiveType, got '" + x437344764 + "'");
                typeCheckerError(err, ctx);
            }
        }
        if (args.commentary.text === null || args.commentary.text === undefined || typeof args.commentary.text !== "string") {
            const err = new Error("Invalid Type at '" + "createCommentary.args.commentary" + ".text" + "', expected AST::StringPrimitiveType, got '" + args.commentary.text + "'");
            typeCheckerError(err, ctx);
        }
        const commentary = {
            professorId: args.commentary.professorId === null || args.commentary.professorId === undefined ? null : args.commentary.professorId,
            schoolClassId: args.commentary.schoolClassId === null || args.commentary.schoolClassId === undefined ? null : args.commentary.schoolClassId,
            text: args.commentary.text,
        };

        let cacheKey: string | null = null, decodedKey: string | null = null, cacheExpirationSeconds: number | null = null, cacheVersion: number | null = null;
        if (cacheConfig.createCommentary) {
            try {
                const {key, expirationSeconds, version} = await cacheConfig.createCommentary(ctx, commentary);
                if (!key) throw "";
                cacheKey = crypto.createHash("sha256").update(JSON.stringify(key)+ "-createCommentary").digest("hex").substr(0, 100); decodedKey = JSON.stringify(key); cacheExpirationSeconds = expirationSeconds; cacheVersion = version;
                const cache = await hook.getCache(cacheKey, version);console.log(JSON.stringify(cache));
                if (cache && (!cache.expirationDate || cache.expirationDate > new Date())) return cache.ret;
            } catch(e) {console.log(JSON.stringify(e));}
        }
        const ret = await fn.createCommentary(ctx, commentary);
        if (ret === null || ret === undefined) {
            const err = new Error("Invalid Type at '" + "createCommentary.ret" + "', expected AST::StructType, got '" + ret + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.id === null || ret.id === undefined || typeof ret.id !== "string") {
            const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".id" + "', expected AST::StringPrimitiveType, got '" + ret.id + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.user === null || ret.user === undefined) {
            const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".user" + "', expected AST::StructType, got '" + ret.user + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.user.id === null || ret.user.id === undefined || typeof ret.user.id !== "string") {
            const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".user" + ".id" + "', expected AST::StringPrimitiveType, got '" + ret.user.id + "'");
            typeCheckerError(err, ctx);
        }
        const x3175006138 = ret.user.avatar;
        if (x3175006138 !== null && x3175006138 !== undefined) {
            if (x3175006138 === null || x3175006138 === undefined) {
                const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".user" + ".avatar" + "', expected AST::StructType, got '" + x3175006138 + "'");
                typeCheckerError(err, ctx);
            }
            if (x3175006138.thumb === null || x3175006138.thumb === undefined) {
                const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".user" + ".avatar" + ".thumb" + "', expected AST::StructType, got '" + x3175006138.thumb + "'");
                typeCheckerError(err, ctx);
            }
            if (x3175006138.thumb.width === null || x3175006138.thumb.width === undefined || typeof x3175006138.thumb.width !== "number" || (x3175006138.thumb.width || 0) !== x3175006138.thumb.width || x3175006138.thumb.width < 0) {
                const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".user" + ".avatar" + ".thumb" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x3175006138.thumb.width + "'");
                typeCheckerError(err, ctx);
            }
            if (x3175006138.thumb.height === null || x3175006138.thumb.height === undefined || typeof x3175006138.thumb.height !== "number" || (x3175006138.thumb.height || 0) !== x3175006138.thumb.height || x3175006138.thumb.height < 0) {
                const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".user" + ".avatar" + ".thumb" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x3175006138.thumb.height + "'");
                typeCheckerError(err, ctx);
            }
            if (x3175006138.thumb.url === null || x3175006138.thumb.url === undefined || typeof x3175006138.thumb.url !== "string") {
                const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".user" + ".avatar" + ".thumb" + ".url" + "', expected AST::StringPrimitiveType, got '" + x3175006138.thumb.url + "'");
                typeCheckerError(err, ctx);
            }
            if (x3175006138.width === null || x3175006138.width === undefined || typeof x3175006138.width !== "number" || (x3175006138.width || 0) !== x3175006138.width || x3175006138.width < 0) {
                const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".user" + ".avatar" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x3175006138.width + "'");
                typeCheckerError(err, ctx);
            }
            if (x3175006138.height === null || x3175006138.height === undefined || typeof x3175006138.height !== "number" || (x3175006138.height || 0) !== x3175006138.height || x3175006138.height < 0) {
                const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".user" + ".avatar" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x3175006138.height + "'");
                typeCheckerError(err, ctx);
            }
            if (x3175006138.url === null || x3175006138.url === undefined || typeof x3175006138.url !== "string") {
                const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".user" + ".avatar" + ".url" + "', expected AST::StringPrimitiveType, got '" + x3175006138.url + "'");
                typeCheckerError(err, ctx);
            }
        }
        if (ret.user.name === null || ret.user.name === undefined || typeof ret.user.name !== "string") {
            const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".user" + ".name" + "', expected AST::StringPrimitiveType, got '" + ret.user.name + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.user.email === null || ret.user.email === undefined || typeof ret.user.email !== "string") {
            const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".user" + ".email" + "', expected AST::StringPrimitiveType, got '" + ret.user.email + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.user.course === null || ret.user.course === undefined || typeof ret.user.course !== "string") {
            const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".user" + ".course" + "', expected AST::StringPrimitiveType, got '" + ret.user.course + "'");
            typeCheckerError(err, ctx);
        }
        const x2056332665 = ret.schoolClass;
        if (x2056332665 !== null && x2056332665 !== undefined) {
            if (x2056332665 === null || x2056332665 === undefined) {
                const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".schoolClass" + "', expected AST::StructType, got '" + x2056332665 + "'");
                typeCheckerError(err, ctx);
            }
            if (x2056332665.id === null || x2056332665.id === undefined || typeof x2056332665.id !== "string") {
                const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".schoolClass" + ".id" + "', expected AST::StringPrimitiveType, got '" + x2056332665.id + "'");
                typeCheckerError(err, ctx);
            }
            if (x2056332665.description === null || x2056332665.description === undefined || typeof x2056332665.description !== "string") {
                const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".schoolClass" + ".description" + "', expected AST::StringPrimitiveType, got '" + x2056332665.description + "'");
                typeCheckerError(err, ctx);
            }
            if (x2056332665.name === null || x2056332665.name === undefined || typeof x2056332665.name !== "string") {
                const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".schoolClass" + ".name" + "', expected AST::StringPrimitiveType, got '" + x2056332665.name + "'");
                typeCheckerError(err, ctx);
            }
        }
        const x4225207322 = ret.professor;
        if (x4225207322 !== null && x4225207322 !== undefined) {
            if (x4225207322 === null || x4225207322 === undefined) {
                const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".professor" + "', expected AST::StructType, got '" + x4225207322 + "'");
                typeCheckerError(err, ctx);
            }
            if (x4225207322.id === null || x4225207322.id === undefined || typeof x4225207322.id !== "string") {
                const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".professor" + ".id" + "', expected AST::StringPrimitiveType, got '" + x4225207322.id + "'");
                typeCheckerError(err, ctx);
            }
            if (x4225207322.schoolClasses === null || x4225207322.schoolClasses === undefined || !(x4225207322.schoolClasses instanceof Array)) {
                const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".professor" + ".schoolClasses" + "', expected AST::ArrayType, got '" + x4225207322.schoolClasses + "'");
                typeCheckerError(err, ctx);
            } else {
                for (let x308066582 = 0; x308066582 < x4225207322.schoolClasses.length; ++x308066582) {
                    if (x4225207322.schoolClasses[x308066582] === null || x4225207322.schoolClasses[x308066582] === undefined) {
                        const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".professor" + ".schoolClasses" + "[" + x308066582 + "]" + "', expected AST::StructType, got '" + x4225207322.schoolClasses[x308066582] + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x4225207322.schoolClasses[x308066582].id === null || x4225207322.schoolClasses[x308066582].id === undefined || typeof x4225207322.schoolClasses[x308066582].id !== "string") {
                        const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".professor" + ".schoolClasses" + "[" + x308066582 + "]" + ".id" + "', expected AST::StringPrimitiveType, got '" + x4225207322.schoolClasses[x308066582].id + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x4225207322.schoolClasses[x308066582].description === null || x4225207322.schoolClasses[x308066582].description === undefined || typeof x4225207322.schoolClasses[x308066582].description !== "string") {
                        const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".professor" + ".schoolClasses" + "[" + x308066582 + "]" + ".description" + "', expected AST::StringPrimitiveType, got '" + x4225207322.schoolClasses[x308066582].description + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x4225207322.schoolClasses[x308066582].name === null || x4225207322.schoolClasses[x308066582].name === undefined || typeof x4225207322.schoolClasses[x308066582].name !== "string") {
                        const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".professor" + ".schoolClasses" + "[" + x308066582 + "]" + ".name" + "', expected AST::StringPrimitiveType, got '" + x4225207322.schoolClasses[x308066582].name + "'");
                        typeCheckerError(err, ctx);
                    }
                }
            }
            const x2409819546 = x4225207322.avatar;
            if (x2409819546 !== null && x2409819546 !== undefined) {
                if (x2409819546 === null || x2409819546 === undefined) {
                    const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".professor" + ".avatar" + "', expected AST::StructType, got '" + x2409819546 + "'");
                    typeCheckerError(err, ctx);
                }
                if (x2409819546.thumb === null || x2409819546.thumb === undefined) {
                    const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".professor" + ".avatar" + ".thumb" + "', expected AST::StructType, got '" + x2409819546.thumb + "'");
                    typeCheckerError(err, ctx);
                }
                if (x2409819546.thumb.width === null || x2409819546.thumb.width === undefined || typeof x2409819546.thumb.width !== "number" || (x2409819546.thumb.width || 0) !== x2409819546.thumb.width || x2409819546.thumb.width < 0) {
                    const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".professor" + ".avatar" + ".thumb" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x2409819546.thumb.width + "'");
                    typeCheckerError(err, ctx);
                }
                if (x2409819546.thumb.height === null || x2409819546.thumb.height === undefined || typeof x2409819546.thumb.height !== "number" || (x2409819546.thumb.height || 0) !== x2409819546.thumb.height || x2409819546.thumb.height < 0) {
                    const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".professor" + ".avatar" + ".thumb" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x2409819546.thumb.height + "'");
                    typeCheckerError(err, ctx);
                }
                if (x2409819546.thumb.url === null || x2409819546.thumb.url === undefined || typeof x2409819546.thumb.url !== "string") {
                    const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".professor" + ".avatar" + ".thumb" + ".url" + "', expected AST::StringPrimitiveType, got '" + x2409819546.thumb.url + "'");
                    typeCheckerError(err, ctx);
                }
                if (x2409819546.width === null || x2409819546.width === undefined || typeof x2409819546.width !== "number" || (x2409819546.width || 0) !== x2409819546.width || x2409819546.width < 0) {
                    const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".professor" + ".avatar" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x2409819546.width + "'");
                    typeCheckerError(err, ctx);
                }
                if (x2409819546.height === null || x2409819546.height === undefined || typeof x2409819546.height !== "number" || (x2409819546.height || 0) !== x2409819546.height || x2409819546.height < 0) {
                    const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".professor" + ".avatar" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x2409819546.height + "'");
                    typeCheckerError(err, ctx);
                }
                if (x2409819546.url === null || x2409819546.url === undefined || typeof x2409819546.url !== "string") {
                    const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".professor" + ".avatar" + ".url" + "', expected AST::StringPrimitiveType, got '" + x2409819546.url + "'");
                    typeCheckerError(err, ctx);
                }
            }
            if (x4225207322.name === null || x4225207322.name === undefined || typeof x4225207322.name !== "string") {
                const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".professor" + ".name" + "', expected AST::StringPrimitiveType, got '" + x4225207322.name + "'");
                typeCheckerError(err, ctx);
            }
            if (x4225207322.tags === null || x4225207322.tags === undefined || !(x4225207322.tags instanceof Array)) {
                const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".professor" + ".tags" + "', expected AST::ArrayType, got '" + x4225207322.tags + "'");
                typeCheckerError(err, ctx);
            } else {
                for (let x3176047791 = 0; x3176047791 < x4225207322.tags.length; ++x3176047791) {
                    if (x4225207322.tags[x3176047791] === null || x4225207322.tags[x3176047791] === undefined || typeof x4225207322.tags[x3176047791] !== "string") {
                        const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".professor" + ".tags" + "[" + x3176047791 + "]" + "', expected AST::StringPrimitiveType, got '" + x4225207322.tags[x3176047791] + "'");
                        typeCheckerError(err, ctx);
                    }
                }
            }
            if (x4225207322.hardness === null || x4225207322.hardness === undefined || typeof x4225207322.hardness !== "number" || (x4225207322.hardness || 0) !== x4225207322.hardness || x4225207322.hardness < 0) {
                const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".professor" + ".hardness" + "', expected AST::UIntPrimitiveType, got '" + x4225207322.hardness + "'");
                typeCheckerError(err, ctx);
            }
        }
        if (ret.createdAt === null || ret.createdAt === undefined || !(ret.createdAt instanceof Date || ((ret.createdAt as any).match && (ret.createdAt as any).match(/^[0-9]{4}-[01][0-9]-[0123][0-9]T[012][0-9]:[0123456][0-9]:[0123456][0-9](\.[0-9]{1,6})?Z?$/)))) {
            const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".createdAt" + "', expected AST::DateTimePrimitiveType, got '" + ret.createdAt + "'");
            typeCheckerError(err, ctx);
        }
        if (ret.text === null || ret.text === undefined || typeof ret.text !== "string") {
            const err = new Error("Invalid Type at '" + "createCommentary.ret" + ".text" + "', expected AST::StringPrimitiveType, got '" + ret.text + "'");
            typeCheckerError(err, ctx);
        }
        const encodedRet = {
            id: ret.id,
            user: {
                id: ret.user.id,
                avatar: ret.user.avatar === null || ret.user.avatar === undefined ? null : {
                    thumb: {
                        width: ret.user.avatar.thumb.width || 0,
                        height: ret.user.avatar.thumb.height || 0,
                        url: ret.user.avatar.thumb.url,
                    },
                    width: ret.user.avatar.width || 0,
                    height: ret.user.avatar.height || 0,
                    url: ret.user.avatar.url,
                },
                name: ret.user.name,
                email: ret.user.email,
                course: ret.user.course,
            },
            schoolClass: ret.schoolClass === null || ret.schoolClass === undefined ? null : {
                id: ret.schoolClass.id,
                description: ret.schoolClass.description,
                name: ret.schoolClass.name,
            },
            professor: ret.professor === null || ret.professor === undefined ? null : {
                id: ret.professor.id,
                schoolClasses: ret.professor.schoolClasses.map(e => ({
                    id: e.id,
                    description: e.description,
                    name: e.name,
                })),
                avatar: ret.professor.avatar === null || ret.professor.avatar === undefined ? null : {
                    thumb: {
                        width: ret.professor.avatar.thumb.width || 0,
                        height: ret.professor.avatar.thumb.height || 0,
                        url: ret.professor.avatar.thumb.url,
                    },
                    width: ret.professor.avatar.width || 0,
                    height: ret.professor.avatar.height || 0,
                    url: ret.professor.avatar.url,
                },
                name: ret.professor.name,
                tags: ret.professor.tags.map(e => e),
                hardness: ret.professor.hardness || 0,
            },
            createdAt: (typeof ret.createdAt === "string" && (ret.createdAt as any).match(/^[0-9]{4}-[01][0-9]-[0123][0-9]T[012][0-9]:[0123456][0-9]:[0123456][0-9](\.[0-9]{1,6})?Z?$/) ? (ret.createdAt as any).replace("Z", "") : ret.createdAt.toISOString().replace("Z", "")),
            text: ret.text,
        };
        if (cacheKey !== null && cacheVersion !== null) hook.setCache(cacheKey, cacheExpirationSeconds ? new Date(new Date().getTime() + (cacheExpirationSeconds * 1000)) : null, cacheVersion, decodedKey!, "createCommentary", encodedRet);
        return encodedRet    },
    getCommentariesForProfessor: async (ctx: Context, args: any) => {
        if (args.professorId === null || args.professorId === undefined || typeof args.professorId !== "string") {
            const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.args.professorId" + "', expected AST::StringPrimitiveType, got '" + args.professorId + "'");
            typeCheckerError(err, ctx);
        }
        const professorId = args.professorId;

        let cacheKey: string | null = null, decodedKey: string | null = null, cacheExpirationSeconds: number | null = null, cacheVersion: number | null = null;
        if (cacheConfig.getCommentariesForProfessor) {
            try {
                const {key, expirationSeconds, version} = await cacheConfig.getCommentariesForProfessor(ctx, professorId);
                if (!key) throw "";
                cacheKey = crypto.createHash("sha256").update(JSON.stringify(key)+ "-getCommentariesForProfessor").digest("hex").substr(0, 100); decodedKey = JSON.stringify(key); cacheExpirationSeconds = expirationSeconds; cacheVersion = version;
                const cache = await hook.getCache(cacheKey, version);console.log(JSON.stringify(cache));
                if (cache && (!cache.expirationDate || cache.expirationDate > new Date())) return cache.ret;
            } catch(e) {console.log(JSON.stringify(e));}
        }
        const ret = await fn.getCommentariesForProfessor(ctx, professorId);
        if (ret === null || ret === undefined || !(ret instanceof Array)) {
            const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "', expected AST::ArrayType, got '" + ret + "'");
            typeCheckerError(err, ctx);
        } else {
            for (let x1394930804 = 0; x1394930804 < ret.length; ++x1394930804) {
                if (ret[x1394930804] === null || ret[x1394930804] === undefined) {
                    const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + "', expected AST::StructType, got '" + ret[x1394930804] + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret[x1394930804].id === null || ret[x1394930804].id === undefined || typeof ret[x1394930804].id !== "string") {
                    const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".id" + "', expected AST::StringPrimitiveType, got '" + ret[x1394930804].id + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret[x1394930804].user === null || ret[x1394930804].user === undefined) {
                    const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".user" + "', expected AST::StructType, got '" + ret[x1394930804].user + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret[x1394930804].user.id === null || ret[x1394930804].user.id === undefined || typeof ret[x1394930804].user.id !== "string") {
                    const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".user" + ".id" + "', expected AST::StringPrimitiveType, got '" + ret[x1394930804].user.id + "'");
                    typeCheckerError(err, ctx);
                }
                const x4263304619 = ret[x1394930804].user.avatar;
                if (x4263304619 !== null && x4263304619 !== undefined) {
                    if (x4263304619 === null || x4263304619 === undefined) {
                        const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".user" + ".avatar" + "', expected AST::StructType, got '" + x4263304619 + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x4263304619.thumb === null || x4263304619.thumb === undefined) {
                        const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".user" + ".avatar" + ".thumb" + "', expected AST::StructType, got '" + x4263304619.thumb + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x4263304619.thumb.width === null || x4263304619.thumb.width === undefined || typeof x4263304619.thumb.width !== "number" || (x4263304619.thumb.width || 0) !== x4263304619.thumb.width || x4263304619.thumb.width < 0) {
                        const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".user" + ".avatar" + ".thumb" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x4263304619.thumb.width + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x4263304619.thumb.height === null || x4263304619.thumb.height === undefined || typeof x4263304619.thumb.height !== "number" || (x4263304619.thumb.height || 0) !== x4263304619.thumb.height || x4263304619.thumb.height < 0) {
                        const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".user" + ".avatar" + ".thumb" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x4263304619.thumb.height + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x4263304619.thumb.url === null || x4263304619.thumb.url === undefined || typeof x4263304619.thumb.url !== "string") {
                        const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".user" + ".avatar" + ".thumb" + ".url" + "', expected AST::StringPrimitiveType, got '" + x4263304619.thumb.url + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x4263304619.width === null || x4263304619.width === undefined || typeof x4263304619.width !== "number" || (x4263304619.width || 0) !== x4263304619.width || x4263304619.width < 0) {
                        const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".user" + ".avatar" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x4263304619.width + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x4263304619.height === null || x4263304619.height === undefined || typeof x4263304619.height !== "number" || (x4263304619.height || 0) !== x4263304619.height || x4263304619.height < 0) {
                        const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".user" + ".avatar" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x4263304619.height + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x4263304619.url === null || x4263304619.url === undefined || typeof x4263304619.url !== "string") {
                        const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".user" + ".avatar" + ".url" + "', expected AST::StringPrimitiveType, got '" + x4263304619.url + "'");
                        typeCheckerError(err, ctx);
                    }
                }
                if (ret[x1394930804].user.name === null || ret[x1394930804].user.name === undefined || typeof ret[x1394930804].user.name !== "string") {
                    const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".user" + ".name" + "', expected AST::StringPrimitiveType, got '" + ret[x1394930804].user.name + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret[x1394930804].user.email === null || ret[x1394930804].user.email === undefined || typeof ret[x1394930804].user.email !== "string") {
                    const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".user" + ".email" + "', expected AST::StringPrimitiveType, got '" + ret[x1394930804].user.email + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret[x1394930804].user.course === null || ret[x1394930804].user.course === undefined || typeof ret[x1394930804].user.course !== "string") {
                    const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".user" + ".course" + "', expected AST::StringPrimitiveType, got '" + ret[x1394930804].user.course + "'");
                    typeCheckerError(err, ctx);
                }
                const x1028461023 = ret[x1394930804].schoolClass;
                if (x1028461023 !== null && x1028461023 !== undefined) {
                    if (x1028461023 === null || x1028461023 === undefined) {
                        const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".schoolClass" + "', expected AST::StructType, got '" + x1028461023 + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x1028461023.id === null || x1028461023.id === undefined || typeof x1028461023.id !== "string") {
                        const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".schoolClass" + ".id" + "', expected AST::StringPrimitiveType, got '" + x1028461023.id + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x1028461023.description === null || x1028461023.description === undefined || typeof x1028461023.description !== "string") {
                        const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".schoolClass" + ".description" + "', expected AST::StringPrimitiveType, got '" + x1028461023.description + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x1028461023.name === null || x1028461023.name === undefined || typeof x1028461023.name !== "string") {
                        const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".schoolClass" + ".name" + "', expected AST::StringPrimitiveType, got '" + x1028461023.name + "'");
                        typeCheckerError(err, ctx);
                    }
                }
                const x1531810925 = ret[x1394930804].professor;
                if (x1531810925 !== null && x1531810925 !== undefined) {
                    if (x1531810925 === null || x1531810925 === undefined) {
                        const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".professor" + "', expected AST::StructType, got '" + x1531810925 + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x1531810925.id === null || x1531810925.id === undefined || typeof x1531810925.id !== "string") {
                        const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".professor" + ".id" + "', expected AST::StringPrimitiveType, got '" + x1531810925.id + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x1531810925.schoolClasses === null || x1531810925.schoolClasses === undefined || !(x1531810925.schoolClasses instanceof Array)) {
                        const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".professor" + ".schoolClasses" + "', expected AST::ArrayType, got '" + x1531810925.schoolClasses + "'");
                        typeCheckerError(err, ctx);
                    } else {
                        for (let x26312150 = 0; x26312150 < x1531810925.schoolClasses.length; ++x26312150) {
                            if (x1531810925.schoolClasses[x26312150] === null || x1531810925.schoolClasses[x26312150] === undefined) {
                                const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".professor" + ".schoolClasses" + "[" + x26312150 + "]" + "', expected AST::StructType, got '" + x1531810925.schoolClasses[x26312150] + "'");
                                typeCheckerError(err, ctx);
                            }
                            if (x1531810925.schoolClasses[x26312150].id === null || x1531810925.schoolClasses[x26312150].id === undefined || typeof x1531810925.schoolClasses[x26312150].id !== "string") {
                                const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".professor" + ".schoolClasses" + "[" + x26312150 + "]" + ".id" + "', expected AST::StringPrimitiveType, got '" + x1531810925.schoolClasses[x26312150].id + "'");
                                typeCheckerError(err, ctx);
                            }
                            if (x1531810925.schoolClasses[x26312150].description === null || x1531810925.schoolClasses[x26312150].description === undefined || typeof x1531810925.schoolClasses[x26312150].description !== "string") {
                                const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".professor" + ".schoolClasses" + "[" + x26312150 + "]" + ".description" + "', expected AST::StringPrimitiveType, got '" + x1531810925.schoolClasses[x26312150].description + "'");
                                typeCheckerError(err, ctx);
                            }
                            if (x1531810925.schoolClasses[x26312150].name === null || x1531810925.schoolClasses[x26312150].name === undefined || typeof x1531810925.schoolClasses[x26312150].name !== "string") {
                                const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".professor" + ".schoolClasses" + "[" + x26312150 + "]" + ".name" + "', expected AST::StringPrimitiveType, got '" + x1531810925.schoolClasses[x26312150].name + "'");
                                typeCheckerError(err, ctx);
                            }
                        }
                    }
                    const x2406088969 = x1531810925.avatar;
                    if (x2406088969 !== null && x2406088969 !== undefined) {
                        if (x2406088969 === null || x2406088969 === undefined) {
                            const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".professor" + ".avatar" + "', expected AST::StructType, got '" + x2406088969 + "'");
                            typeCheckerError(err, ctx);
                        }
                        if (x2406088969.thumb === null || x2406088969.thumb === undefined) {
                            const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".professor" + ".avatar" + ".thumb" + "', expected AST::StructType, got '" + x2406088969.thumb + "'");
                            typeCheckerError(err, ctx);
                        }
                        if (x2406088969.thumb.width === null || x2406088969.thumb.width === undefined || typeof x2406088969.thumb.width !== "number" || (x2406088969.thumb.width || 0) !== x2406088969.thumb.width || x2406088969.thumb.width < 0) {
                            const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".professor" + ".avatar" + ".thumb" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x2406088969.thumb.width + "'");
                            typeCheckerError(err, ctx);
                        }
                        if (x2406088969.thumb.height === null || x2406088969.thumb.height === undefined || typeof x2406088969.thumb.height !== "number" || (x2406088969.thumb.height || 0) !== x2406088969.thumb.height || x2406088969.thumb.height < 0) {
                            const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".professor" + ".avatar" + ".thumb" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x2406088969.thumb.height + "'");
                            typeCheckerError(err, ctx);
                        }
                        if (x2406088969.thumb.url === null || x2406088969.thumb.url === undefined || typeof x2406088969.thumb.url !== "string") {
                            const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".professor" + ".avatar" + ".thumb" + ".url" + "', expected AST::StringPrimitiveType, got '" + x2406088969.thumb.url + "'");
                            typeCheckerError(err, ctx);
                        }
                        if (x2406088969.width === null || x2406088969.width === undefined || typeof x2406088969.width !== "number" || (x2406088969.width || 0) !== x2406088969.width || x2406088969.width < 0) {
                            const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".professor" + ".avatar" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x2406088969.width + "'");
                            typeCheckerError(err, ctx);
                        }
                        if (x2406088969.height === null || x2406088969.height === undefined || typeof x2406088969.height !== "number" || (x2406088969.height || 0) !== x2406088969.height || x2406088969.height < 0) {
                            const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".professor" + ".avatar" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x2406088969.height + "'");
                            typeCheckerError(err, ctx);
                        }
                        if (x2406088969.url === null || x2406088969.url === undefined || typeof x2406088969.url !== "string") {
                            const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".professor" + ".avatar" + ".url" + "', expected AST::StringPrimitiveType, got '" + x2406088969.url + "'");
                            typeCheckerError(err, ctx);
                        }
                    }
                    if (x1531810925.name === null || x1531810925.name === undefined || typeof x1531810925.name !== "string") {
                        const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".professor" + ".name" + "', expected AST::StringPrimitiveType, got '" + x1531810925.name + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x1531810925.tags === null || x1531810925.tags === undefined || !(x1531810925.tags instanceof Array)) {
                        const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".professor" + ".tags" + "', expected AST::ArrayType, got '" + x1531810925.tags + "'");
                        typeCheckerError(err, ctx);
                    } else {
                        for (let x701698752 = 0; x701698752 < x1531810925.tags.length; ++x701698752) {
                            if (x1531810925.tags[x701698752] === null || x1531810925.tags[x701698752] === undefined || typeof x1531810925.tags[x701698752] !== "string") {
                                const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".professor" + ".tags" + "[" + x701698752 + "]" + "', expected AST::StringPrimitiveType, got '" + x1531810925.tags[x701698752] + "'");
                                typeCheckerError(err, ctx);
                            }
                        }
                    }
                    if (x1531810925.hardness === null || x1531810925.hardness === undefined || typeof x1531810925.hardness !== "number" || (x1531810925.hardness || 0) !== x1531810925.hardness || x1531810925.hardness < 0) {
                        const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".professor" + ".hardness" + "', expected AST::UIntPrimitiveType, got '" + x1531810925.hardness + "'");
                        typeCheckerError(err, ctx);
                    }
                }
                if (ret[x1394930804].createdAt === null || ret[x1394930804].createdAt === undefined || !(ret[x1394930804].createdAt instanceof Date || ((ret[x1394930804].createdAt as any).match && (ret[x1394930804].createdAt as any).match(/^[0-9]{4}-[01][0-9]-[0123][0-9]T[012][0-9]:[0123456][0-9]:[0123456][0-9](\.[0-9]{1,6})?Z?$/)))) {
                    const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".createdAt" + "', expected AST::DateTimePrimitiveType, got '" + ret[x1394930804].createdAt + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret[x1394930804].text === null || ret[x1394930804].text === undefined || typeof ret[x1394930804].text !== "string") {
                    const err = new Error("Invalid Type at '" + "getCommentariesForProfessor.ret" + "[" + x1394930804 + "]" + ".text" + "', expected AST::StringPrimitiveType, got '" + ret[x1394930804].text + "'");
                    typeCheckerError(err, ctx);
                }
            }
        }
        const encodedRet = ret.map(e => ({
            id: e.id,
            user: {
                id: e.user.id,
                avatar: e.user.avatar === null || e.user.avatar === undefined ? null : {
                    thumb: {
                        width: e.user.avatar.thumb.width || 0,
                        height: e.user.avatar.thumb.height || 0,
                        url: e.user.avatar.thumb.url,
                    },
                    width: e.user.avatar.width || 0,
                    height: e.user.avatar.height || 0,
                    url: e.user.avatar.url,
                },
                name: e.user.name,
                email: e.user.email,
                course: e.user.course,
            },
            schoolClass: e.schoolClass === null || e.schoolClass === undefined ? null : {
                id: e.schoolClass.id,
                description: e.schoolClass.description,
                name: e.schoolClass.name,
            },
            professor: e.professor === null || e.professor === undefined ? null : {
                id: e.professor.id,
                schoolClasses: e.professor.schoolClasses.map(e => ({
                    id: e.id,
                    description: e.description,
                    name: e.name,
                })),
                avatar: e.professor.avatar === null || e.professor.avatar === undefined ? null : {
                    thumb: {
                        width: e.professor.avatar.thumb.width || 0,
                        height: e.professor.avatar.thumb.height || 0,
                        url: e.professor.avatar.thumb.url,
                    },
                    width: e.professor.avatar.width || 0,
                    height: e.professor.avatar.height || 0,
                    url: e.professor.avatar.url,
                },
                name: e.professor.name,
                tags: e.professor.tags.map(e => e),
                hardness: e.professor.hardness || 0,
            },
            createdAt: (typeof e.createdAt === "string" && (e.createdAt as any).match(/^[0-9]{4}-[01][0-9]-[0123][0-9]T[012][0-9]:[0123456][0-9]:[0123456][0-9](\.[0-9]{1,6})?Z?$/) ? (e.createdAt as any).replace("Z", "") : e.createdAt.toISOString().replace("Z", "")),
            text: e.text,
        }));
        if (cacheKey !== null && cacheVersion !== null) hook.setCache(cacheKey, cacheExpirationSeconds ? new Date(new Date().getTime() + (cacheExpirationSeconds * 1000)) : null, cacheVersion, decodedKey!, "getCommentariesForProfessor", encodedRet);
        return encodedRet    },
    getCommentariesForSchoolClass: async (ctx: Context, args: any) => {
        if (args.schoolClassId === null || args.schoolClassId === undefined || typeof args.schoolClassId !== "string") {
            const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.args.schoolClassId" + "', expected AST::StringPrimitiveType, got '" + args.schoolClassId + "'");
            typeCheckerError(err, ctx);
        }
        const schoolClassId = args.schoolClassId;

        let cacheKey: string | null = null, decodedKey: string | null = null, cacheExpirationSeconds: number | null = null, cacheVersion: number | null = null;
        if (cacheConfig.getCommentariesForSchoolClass) {
            try {
                const {key, expirationSeconds, version} = await cacheConfig.getCommentariesForSchoolClass(ctx, schoolClassId);
                if (!key) throw "";
                cacheKey = crypto.createHash("sha256").update(JSON.stringify(key)+ "-getCommentariesForSchoolClass").digest("hex").substr(0, 100); decodedKey = JSON.stringify(key); cacheExpirationSeconds = expirationSeconds; cacheVersion = version;
                const cache = await hook.getCache(cacheKey, version);console.log(JSON.stringify(cache));
                if (cache && (!cache.expirationDate || cache.expirationDate > new Date())) return cache.ret;
            } catch(e) {console.log(JSON.stringify(e));}
        }
        const ret = await fn.getCommentariesForSchoolClass(ctx, schoolClassId);
        if (ret === null || ret === undefined || !(ret instanceof Array)) {
            const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "', expected AST::ArrayType, got '" + ret + "'");
            typeCheckerError(err, ctx);
        } else {
            for (let x17780997 = 0; x17780997 < ret.length; ++x17780997) {
                if (ret[x17780997] === null || ret[x17780997] === undefined) {
                    const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + "', expected AST::StructType, got '" + ret[x17780997] + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret[x17780997].id === null || ret[x17780997].id === undefined || typeof ret[x17780997].id !== "string") {
                    const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".id" + "', expected AST::StringPrimitiveType, got '" + ret[x17780997].id + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret[x17780997].user === null || ret[x17780997].user === undefined) {
                    const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".user" + "', expected AST::StructType, got '" + ret[x17780997].user + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret[x17780997].user.id === null || ret[x17780997].user.id === undefined || typeof ret[x17780997].user.id !== "string") {
                    const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".user" + ".id" + "', expected AST::StringPrimitiveType, got '" + ret[x17780997].user.id + "'");
                    typeCheckerError(err, ctx);
                }
                const x3114119555 = ret[x17780997].user.avatar;
                if (x3114119555 !== null && x3114119555 !== undefined) {
                    if (x3114119555 === null || x3114119555 === undefined) {
                        const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".user" + ".avatar" + "', expected AST::StructType, got '" + x3114119555 + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x3114119555.thumb === null || x3114119555.thumb === undefined) {
                        const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".user" + ".avatar" + ".thumb" + "', expected AST::StructType, got '" + x3114119555.thumb + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x3114119555.thumb.width === null || x3114119555.thumb.width === undefined || typeof x3114119555.thumb.width !== "number" || (x3114119555.thumb.width || 0) !== x3114119555.thumb.width || x3114119555.thumb.width < 0) {
                        const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".user" + ".avatar" + ".thumb" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x3114119555.thumb.width + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x3114119555.thumb.height === null || x3114119555.thumb.height === undefined || typeof x3114119555.thumb.height !== "number" || (x3114119555.thumb.height || 0) !== x3114119555.thumb.height || x3114119555.thumb.height < 0) {
                        const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".user" + ".avatar" + ".thumb" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x3114119555.thumb.height + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x3114119555.thumb.url === null || x3114119555.thumb.url === undefined || typeof x3114119555.thumb.url !== "string") {
                        const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".user" + ".avatar" + ".thumb" + ".url" + "', expected AST::StringPrimitiveType, got '" + x3114119555.thumb.url + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x3114119555.width === null || x3114119555.width === undefined || typeof x3114119555.width !== "number" || (x3114119555.width || 0) !== x3114119555.width || x3114119555.width < 0) {
                        const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".user" + ".avatar" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x3114119555.width + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x3114119555.height === null || x3114119555.height === undefined || typeof x3114119555.height !== "number" || (x3114119555.height || 0) !== x3114119555.height || x3114119555.height < 0) {
                        const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".user" + ".avatar" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x3114119555.height + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x3114119555.url === null || x3114119555.url === undefined || typeof x3114119555.url !== "string") {
                        const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".user" + ".avatar" + ".url" + "', expected AST::StringPrimitiveType, got '" + x3114119555.url + "'");
                        typeCheckerError(err, ctx);
                    }
                }
                if (ret[x17780997].user.name === null || ret[x17780997].user.name === undefined || typeof ret[x17780997].user.name !== "string") {
                    const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".user" + ".name" + "', expected AST::StringPrimitiveType, got '" + ret[x17780997].user.name + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret[x17780997].user.email === null || ret[x17780997].user.email === undefined || typeof ret[x17780997].user.email !== "string") {
                    const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".user" + ".email" + "', expected AST::StringPrimitiveType, got '" + ret[x17780997].user.email + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret[x17780997].user.course === null || ret[x17780997].user.course === undefined || typeof ret[x17780997].user.course !== "string") {
                    const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".user" + ".course" + "', expected AST::StringPrimitiveType, got '" + ret[x17780997].user.course + "'");
                    typeCheckerError(err, ctx);
                }
                const x1179284479 = ret[x17780997].schoolClass;
                if (x1179284479 !== null && x1179284479 !== undefined) {
                    if (x1179284479 === null || x1179284479 === undefined) {
                        const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".schoolClass" + "', expected AST::StructType, got '" + x1179284479 + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x1179284479.id === null || x1179284479.id === undefined || typeof x1179284479.id !== "string") {
                        const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".schoolClass" + ".id" + "', expected AST::StringPrimitiveType, got '" + x1179284479.id + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x1179284479.description === null || x1179284479.description === undefined || typeof x1179284479.description !== "string") {
                        const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".schoolClass" + ".description" + "', expected AST::StringPrimitiveType, got '" + x1179284479.description + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x1179284479.name === null || x1179284479.name === undefined || typeof x1179284479.name !== "string") {
                        const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".schoolClass" + ".name" + "', expected AST::StringPrimitiveType, got '" + x1179284479.name + "'");
                        typeCheckerError(err, ctx);
                    }
                }
                const x1183943732 = ret[x17780997].professor;
                if (x1183943732 !== null && x1183943732 !== undefined) {
                    if (x1183943732 === null || x1183943732 === undefined) {
                        const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".professor" + "', expected AST::StructType, got '" + x1183943732 + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x1183943732.id === null || x1183943732.id === undefined || typeof x1183943732.id !== "string") {
                        const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".professor" + ".id" + "', expected AST::StringPrimitiveType, got '" + x1183943732.id + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x1183943732.schoolClasses === null || x1183943732.schoolClasses === undefined || !(x1183943732.schoolClasses instanceof Array)) {
                        const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".professor" + ".schoolClasses" + "', expected AST::ArrayType, got '" + x1183943732.schoolClasses + "'");
                        typeCheckerError(err, ctx);
                    } else {
                        for (let x2191340954 = 0; x2191340954 < x1183943732.schoolClasses.length; ++x2191340954) {
                            if (x1183943732.schoolClasses[x2191340954] === null || x1183943732.schoolClasses[x2191340954] === undefined) {
                                const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".professor" + ".schoolClasses" + "[" + x2191340954 + "]" + "', expected AST::StructType, got '" + x1183943732.schoolClasses[x2191340954] + "'");
                                typeCheckerError(err, ctx);
                            }
                            if (x1183943732.schoolClasses[x2191340954].id === null || x1183943732.schoolClasses[x2191340954].id === undefined || typeof x1183943732.schoolClasses[x2191340954].id !== "string") {
                                const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".professor" + ".schoolClasses" + "[" + x2191340954 + "]" + ".id" + "', expected AST::StringPrimitiveType, got '" + x1183943732.schoolClasses[x2191340954].id + "'");
                                typeCheckerError(err, ctx);
                            }
                            if (x1183943732.schoolClasses[x2191340954].description === null || x1183943732.schoolClasses[x2191340954].description === undefined || typeof x1183943732.schoolClasses[x2191340954].description !== "string") {
                                const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".professor" + ".schoolClasses" + "[" + x2191340954 + "]" + ".description" + "', expected AST::StringPrimitiveType, got '" + x1183943732.schoolClasses[x2191340954].description + "'");
                                typeCheckerError(err, ctx);
                            }
                            if (x1183943732.schoolClasses[x2191340954].name === null || x1183943732.schoolClasses[x2191340954].name === undefined || typeof x1183943732.schoolClasses[x2191340954].name !== "string") {
                                const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".professor" + ".schoolClasses" + "[" + x2191340954 + "]" + ".name" + "', expected AST::StringPrimitiveType, got '" + x1183943732.schoolClasses[x2191340954].name + "'");
                                typeCheckerError(err, ctx);
                            }
                        }
                    }
                    const x2924097972 = x1183943732.avatar;
                    if (x2924097972 !== null && x2924097972 !== undefined) {
                        if (x2924097972 === null || x2924097972 === undefined) {
                            const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".professor" + ".avatar" + "', expected AST::StructType, got '" + x2924097972 + "'");
                            typeCheckerError(err, ctx);
                        }
                        if (x2924097972.thumb === null || x2924097972.thumb === undefined) {
                            const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".professor" + ".avatar" + ".thumb" + "', expected AST::StructType, got '" + x2924097972.thumb + "'");
                            typeCheckerError(err, ctx);
                        }
                        if (x2924097972.thumb.width === null || x2924097972.thumb.width === undefined || typeof x2924097972.thumb.width !== "number" || (x2924097972.thumb.width || 0) !== x2924097972.thumb.width || x2924097972.thumb.width < 0) {
                            const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".professor" + ".avatar" + ".thumb" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x2924097972.thumb.width + "'");
                            typeCheckerError(err, ctx);
                        }
                        if (x2924097972.thumb.height === null || x2924097972.thumb.height === undefined || typeof x2924097972.thumb.height !== "number" || (x2924097972.thumb.height || 0) !== x2924097972.thumb.height || x2924097972.thumb.height < 0) {
                            const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".professor" + ".avatar" + ".thumb" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x2924097972.thumb.height + "'");
                            typeCheckerError(err, ctx);
                        }
                        if (x2924097972.thumb.url === null || x2924097972.thumb.url === undefined || typeof x2924097972.thumb.url !== "string") {
                            const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".professor" + ".avatar" + ".thumb" + ".url" + "', expected AST::StringPrimitiveType, got '" + x2924097972.thumb.url + "'");
                            typeCheckerError(err, ctx);
                        }
                        if (x2924097972.width === null || x2924097972.width === undefined || typeof x2924097972.width !== "number" || (x2924097972.width || 0) !== x2924097972.width || x2924097972.width < 0) {
                            const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".professor" + ".avatar" + ".width" + "', expected AST::UIntPrimitiveType, got '" + x2924097972.width + "'");
                            typeCheckerError(err, ctx);
                        }
                        if (x2924097972.height === null || x2924097972.height === undefined || typeof x2924097972.height !== "number" || (x2924097972.height || 0) !== x2924097972.height || x2924097972.height < 0) {
                            const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".professor" + ".avatar" + ".height" + "', expected AST::UIntPrimitiveType, got '" + x2924097972.height + "'");
                            typeCheckerError(err, ctx);
                        }
                        if (x2924097972.url === null || x2924097972.url === undefined || typeof x2924097972.url !== "string") {
                            const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".professor" + ".avatar" + ".url" + "', expected AST::StringPrimitiveType, got '" + x2924097972.url + "'");
                            typeCheckerError(err, ctx);
                        }
                    }
                    if (x1183943732.name === null || x1183943732.name === undefined || typeof x1183943732.name !== "string") {
                        const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".professor" + ".name" + "', expected AST::StringPrimitiveType, got '" + x1183943732.name + "'");
                        typeCheckerError(err, ctx);
                    }
                    if (x1183943732.tags === null || x1183943732.tags === undefined || !(x1183943732.tags instanceof Array)) {
                        const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".professor" + ".tags" + "', expected AST::ArrayType, got '" + x1183943732.tags + "'");
                        typeCheckerError(err, ctx);
                    } else {
                        for (let x2088827952 = 0; x2088827952 < x1183943732.tags.length; ++x2088827952) {
                            if (x1183943732.tags[x2088827952] === null || x1183943732.tags[x2088827952] === undefined || typeof x1183943732.tags[x2088827952] !== "string") {
                                const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".professor" + ".tags" + "[" + x2088827952 + "]" + "', expected AST::StringPrimitiveType, got '" + x1183943732.tags[x2088827952] + "'");
                                typeCheckerError(err, ctx);
                            }
                        }
                    }
                    if (x1183943732.hardness === null || x1183943732.hardness === undefined || typeof x1183943732.hardness !== "number" || (x1183943732.hardness || 0) !== x1183943732.hardness || x1183943732.hardness < 0) {
                        const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".professor" + ".hardness" + "', expected AST::UIntPrimitiveType, got '" + x1183943732.hardness + "'");
                        typeCheckerError(err, ctx);
                    }
                }
                if (ret[x17780997].createdAt === null || ret[x17780997].createdAt === undefined || !(ret[x17780997].createdAt instanceof Date || ((ret[x17780997].createdAt as any).match && (ret[x17780997].createdAt as any).match(/^[0-9]{4}-[01][0-9]-[0123][0-9]T[012][0-9]:[0123456][0-9]:[0123456][0-9](\.[0-9]{1,6})?Z?$/)))) {
                    const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".createdAt" + "', expected AST::DateTimePrimitiveType, got '" + ret[x17780997].createdAt + "'");
                    typeCheckerError(err, ctx);
                }
                if (ret[x17780997].text === null || ret[x17780997].text === undefined || typeof ret[x17780997].text !== "string") {
                    const err = new Error("Invalid Type at '" + "getCommentariesForSchoolClass.ret" + "[" + x17780997 + "]" + ".text" + "', expected AST::StringPrimitiveType, got '" + ret[x17780997].text + "'");
                    typeCheckerError(err, ctx);
                }
            }
        }
        const encodedRet = ret.map(e => ({
            id: e.id,
            user: {
                id: e.user.id,
                avatar: e.user.avatar === null || e.user.avatar === undefined ? null : {
                    thumb: {
                        width: e.user.avatar.thumb.width || 0,
                        height: e.user.avatar.thumb.height || 0,
                        url: e.user.avatar.thumb.url,
                    },
                    width: e.user.avatar.width || 0,
                    height: e.user.avatar.height || 0,
                    url: e.user.avatar.url,
                },
                name: e.user.name,
                email: e.user.email,
                course: e.user.course,
            },
            schoolClass: e.schoolClass === null || e.schoolClass === undefined ? null : {
                id: e.schoolClass.id,
                description: e.schoolClass.description,
                name: e.schoolClass.name,
            },
            professor: e.professor === null || e.professor === undefined ? null : {
                id: e.professor.id,
                schoolClasses: e.professor.schoolClasses.map(e => ({
                    id: e.id,
                    description: e.description,
                    name: e.name,
                })),
                avatar: e.professor.avatar === null || e.professor.avatar === undefined ? null : {
                    thumb: {
                        width: e.professor.avatar.thumb.width || 0,
                        height: e.professor.avatar.thumb.height || 0,
                        url: e.professor.avatar.thumb.url,
                    },
                    width: e.professor.avatar.width || 0,
                    height: e.professor.avatar.height || 0,
                    url: e.professor.avatar.url,
                },
                name: e.professor.name,
                tags: e.professor.tags.map(e => e),
                hardness: e.professor.hardness || 0,
            },
            createdAt: (typeof e.createdAt === "string" && (e.createdAt as any).match(/^[0-9]{4}-[01][0-9]-[0123][0-9]T[012][0-9]:[0123456][0-9]:[0123456][0-9](\.[0-9]{1,6})?Z?$/) ? (e.createdAt as any).replace("Z", "") : e.createdAt.toISOString().replace("Z", "")),
            text: e.text,
        }));
        if (cacheKey !== null && cacheVersion !== null) hook.setCache(cacheKey, cacheExpirationSeconds ? new Date(new Date().getTime() + (cacheExpirationSeconds * 1000)) : null, cacheVersion, decodedKey!, "getCommentariesForSchoolClass", encodedRet);
        return encodedRet    },
    ping: async (ctx: Context, args: any) => {

        let cacheKey: string | null = null, decodedKey: string | null = null, cacheExpirationSeconds: number | null = null, cacheVersion: number | null = null;
        if (cacheConfig.ping) {
            try {
                const {key, expirationSeconds, version} = await cacheConfig.ping(ctx);
                if (!key) throw "";
                cacheKey = crypto.createHash("sha256").update(JSON.stringify(key)+ "-ping").digest("hex").substr(0, 100); decodedKey = JSON.stringify(key); cacheExpirationSeconds = expirationSeconds; cacheVersion = version;
                const cache = await hook.getCache(cacheKey, version);console.log(JSON.stringify(cache));
                if (cache && (!cache.expirationDate || cache.expirationDate > new Date())) return cache.ret;
            } catch(e) {console.log(JSON.stringify(e));}
        }
        const ret = await fn.ping(ctx);
        if (ret === null || ret === undefined || typeof ret !== "string") {
            const err = new Error("Invalid Type at '" + "ping.ret" + "', expected AST::StringPrimitiveType, got '" + ret + "'");
            typeCheckerError(err, ctx);
        }
        const encodedRet = ret;
        if (cacheKey !== null && cacheVersion !== null) hook.setCache(cacheKey, cacheExpirationSeconds ? new Date(new Date().getTime() + (cacheExpirationSeconds * 1000)) : null, cacheVersion, decodedKey!, "ping", encodedRet);
        return encodedRet    },
    setPushToken: async (ctx: Context, args: any) => {
        if (args.token === null || args.token === undefined || typeof args.token !== "string") {
            const err = new Error("Invalid Type at '" + "setPushToken.args.token" + "', expected AST::StringPrimitiveType, got '" + args.token + "'");
            typeCheckerError(err, ctx);
        }
        const token = args.token;

        let cacheKey: string | null = null, decodedKey: string | null = null, cacheExpirationSeconds: number | null = null, cacheVersion: number | null = null;
        if (cacheConfig.setPushToken) {
            try {
                const {key, expirationSeconds, version} = await cacheConfig.setPushToken(ctx, token);
                if (!key) throw "";
                cacheKey = crypto.createHash("sha256").update(JSON.stringify(key)+ "-setPushToken").digest("hex").substr(0, 100); decodedKey = JSON.stringify(key); cacheExpirationSeconds = expirationSeconds; cacheVersion = version;
                const cache = await hook.getCache(cacheKey, version);console.log(JSON.stringify(cache));
                if (cache && (!cache.expirationDate || cache.expirationDate > new Date())) return cache.ret;
            } catch(e) {console.log(JSON.stringify(e));}
        }
        const ret = await fn.setPushToken(ctx, token);
        const encodedRet = null;
        if (cacheKey !== null && cacheVersion !== null) hook.setCache(cacheKey, cacheExpirationSeconds ? new Date(new Date().getTime() + (cacheExpirationSeconds * 1000)) : null, cacheVersion, decodedKey!, "setPushToken", encodedRet);
        return encodedRet    },
};

const clearForLogging: {[name: string]: (call: DBApiCall) => void} = {
    uploadImage: async (call: DBApiCall) => {
        call.args.image = `<${call.args.image.length} bytes>`;
    },
    uploadFile: async (call: DBApiCall) => {
        call.args.file.bytes = `<${call.args.file.bytes.length} bytes>`;
    },
    login: async (call: DBApiCall) => {
        call.args.password = "<secret>";
    },
    createUser: async (call: DBApiCall) => {
        if (call.args.user.avatar) {
            if (call.args.user.avatar.bytes) {
                call.args.user.avatar.bytes = `<${call.args.user.avatar.bytes.length} bytes>`;
            }
        }
    },
    editUser: async (call: DBApiCall) => {
        if (call.args.user.avatar) {
            if (call.args.user.avatar.bytes) {
                call.args.user.avatar.bytes = `<${call.args.user.avatar.bytes.length} bytes>`;
            }
        }
    },
    setAvatar: async (call: DBApiCall) => {
        if (call.args.avatar.bytes) {
            call.args.avatar.bytes = `<${call.args.avatar.bytes.length} bytes>`;
        }
    },
    createProfessor: async (call: DBApiCall) => {
        if (call.args.professor.avatar) {
            if (call.args.professor.avatar.bytes) {
                call.args.professor.avatar.bytes = `<${call.args.professor.avatar.bytes.length} bytes>`;
            }
        }
    },
    editProfessor: async (call: DBApiCall) => {
        if (call.args.professor.avatar) {
            if (call.args.professor.avatar.bytes) {
                call.args.professor.avatar.bytes = `<${call.args.professor.avatar.bytes.length} bytes>`;
            }
        }
    },
};

export function transformLatLngToJson(x: LatLng) {
    return {
        lat: x.lat,
        lng: x.lng,
    };
}

export function transformImageToJson(x: Image) {
    return {
        thumb: {
            width: x.thumb.width || 0,
            height: x.thumb.height || 0,
            url: x.thumb.url,
        },
        width: x.width || 0,
        height: x.height || 0,
        url: x.url,
    };
}

export function transformSimpleImageToJson(x: SimpleImage) {
    return {
        width: x.width || 0,
        height: x.height || 0,
        url: x.url,
    };
}

export function transformFileToJson(x: File) {
    return {
        name: x.name,
        url: x.url,
    };
}

export function transformCropToJson(x: Crop) {
    return {
        x: x.x || 0,
        y: x.y || 0,
        width: x.width || 0,
        height: x.height || 0,
    };
}

export function transformUncertainImageToJson(x: UncertainImage) {
    return {
        bytes: x.bytes === null || x.bytes === undefined ? null : x.bytes.toString("base64"),
        image: x.image === null || x.image === undefined ? null : {
            thumb: {
                width: x.image.thumb.width || 0,
                height: x.image.thumb.height || 0,
                url: x.image.thumb.url,
            },
            width: x.image.width || 0,
            height: x.image.height || 0,
            url: x.image.url,
        },
        crop: x.crop === null || x.crop === undefined ? null : {
            x: x.crop.x || 0,
            y: x.crop.y || 0,
            width: x.crop.width || 0,
            height: x.crop.height || 0,
        },
    };
}

export function transformUncertainFileToJson(x: UncertainFile) {
    return {
        fileData: x.fileData === null || x.fileData === undefined ? null : {
            bytes: x.fileData.bytes.toString("base64"),
            name: x.fileData.name,
        },
        file: x.file === null || x.file === undefined ? null : {
            name: x.file.name,
            url: x.file.url,
        },
    };
}

export function transformUploadFileToJson(x: UploadFile) {
    return {
        bytes: x.bytes.toString("base64"),
        name: x.name,
    };
}

export function transformUserToJson(x: User) {
    return {
        id: x.id,
        avatar: x.avatar === null || x.avatar === undefined ? null : {
            thumb: {
                width: x.avatar.thumb.width || 0,
                height: x.avatar.thumb.height || 0,
                url: x.avatar.thumb.url,
            },
            width: x.avatar.width || 0,
            height: x.avatar.height || 0,
            url: x.avatar.url,
        },
        name: x.name,
        email: x.email,
        course: x.course,
    };
}

export function transformNewUserToJson(x: NewUser) {
    return {
        password: x.password,
        avatar: x.avatar === null || x.avatar === undefined ? null : {
            bytes: x.avatar.bytes === null || x.avatar.bytes === undefined ? null : x.avatar.bytes.toString("base64"),
            image: x.avatar.image === null || x.avatar.image === undefined ? null : {
                thumb: {
                    width: x.avatar.image.thumb.width || 0,
                    height: x.avatar.image.thumb.height || 0,
                    url: x.avatar.image.thumb.url,
                },
                width: x.avatar.image.width || 0,
                height: x.avatar.image.height || 0,
                url: x.avatar.image.url,
            },
            crop: x.avatar.crop === null || x.avatar.crop === undefined ? null : {
                x: x.avatar.crop.x || 0,
                y: x.avatar.crop.y || 0,
                width: x.avatar.crop.width || 0,
                height: x.avatar.crop.height || 0,
            },
        },
        name: x.name,
        email: x.email,
        course: x.course,
    };
}

export function transformEditUserToJson(x: EditUser) {
    return {
        avatar: x.avatar === null || x.avatar === undefined ? null : {
            bytes: x.avatar.bytes === null || x.avatar.bytes === undefined ? null : x.avatar.bytes.toString("base64"),
            image: x.avatar.image === null || x.avatar.image === undefined ? null : {
                thumb: {
                    width: x.avatar.image.thumb.width || 0,
                    height: x.avatar.image.thumb.height || 0,
                    url: x.avatar.image.thumb.url,
                },
                width: x.avatar.image.width || 0,
                height: x.avatar.image.height || 0,
                url: x.avatar.image.url,
            },
            crop: x.avatar.crop === null || x.avatar.crop === undefined ? null : {
                x: x.avatar.crop.x || 0,
                y: x.avatar.crop.y || 0,
                width: x.avatar.crop.width || 0,
                height: x.avatar.crop.height || 0,
            },
        },
        name: x.name,
        email: x.email,
        course: x.course,
    };
}

export function transformUserDetailsToJson(x: UserDetails) {
    return {
        name: x.name,
        email: x.email,
        course: x.course,
    };
}

export function transformSchoolClassToJson(x: SchoolClass) {
    return {
        id: x.id,
        description: x.description,
        name: x.name,
    };
}

export function transformSchoolClassDetailsToJson(x: SchoolClassDetails) {
    return {
        id: x.id,
        description: x.description,
        name: x.name,
    };
}

export function transformNewSchoolClassToJson(x: NewSchoolClass) {
    return {
        id: x.id,
        description: x.description,
        name: x.name,
    };
}

export function transformProfessorToJson(x: Professor) {
    return {
        id: x.id,
        schoolClasses: x.schoolClasses.map(e => ({
            id: e.id,
            description: e.description,
            name: e.name,
        })),
        avatar: x.avatar === null || x.avatar === undefined ? null : {
            thumb: {
                width: x.avatar.thumb.width || 0,
                height: x.avatar.thumb.height || 0,
                url: x.avatar.thumb.url,
            },
            width: x.avatar.width || 0,
            height: x.avatar.height || 0,
            url: x.avatar.url,
        },
        name: x.name,
        tags: x.tags.map(e => e),
        hardness: x.hardness || 0,
    };
}

export function transformProfessorDetailsToJson(x: ProfessorDetails) {
    return {
        avatar: x.avatar === null || x.avatar === undefined ? null : {
            thumb: {
                width: x.avatar.thumb.width || 0,
                height: x.avatar.thumb.height || 0,
                url: x.avatar.thumb.url,
            },
            width: x.avatar.width || 0,
            height: x.avatar.height || 0,
            url: x.avatar.url,
        },
        name: x.name,
        tags: x.tags.map(e => e),
        hardness: x.hardness || 0,
    };
}

export function transformNewProfessorToJson(x: NewProfessor) {
    return {
        avatar: x.avatar === null || x.avatar === undefined ? null : {
            bytes: x.avatar.bytes === null || x.avatar.bytes === undefined ? null : x.avatar.bytes.toString("base64"),
            image: x.avatar.image === null || x.avatar.image === undefined ? null : {
                thumb: {
                    width: x.avatar.image.thumb.width || 0,
                    height: x.avatar.image.thumb.height || 0,
                    url: x.avatar.image.thumb.url,
                },
                width: x.avatar.image.width || 0,
                height: x.avatar.image.height || 0,
                url: x.avatar.image.url,
            },
            crop: x.avatar.crop === null || x.avatar.crop === undefined ? null : {
                x: x.avatar.crop.x || 0,
                y: x.avatar.crop.y || 0,
                width: x.avatar.crop.width || 0,
                height: x.avatar.crop.height || 0,
            },
        },
        schoolClassIds: x.schoolClassIds.map(e => e),
        name: x.name,
        tags: x.tags.map(e => e),
        hardness: x.hardness || 0,
    };
}

export function transformCommentaryToJson(x: Commentary) {
    return {
        id: x.id,
        user: {
            id: x.user.id,
            avatar: x.user.avatar === null || x.user.avatar === undefined ? null : {
                thumb: {
                    width: x.user.avatar.thumb.width || 0,
                    height: x.user.avatar.thumb.height || 0,
                    url: x.user.avatar.thumb.url,
                },
                width: x.user.avatar.width || 0,
                height: x.user.avatar.height || 0,
                url: x.user.avatar.url,
            },
            name: x.user.name,
            email: x.user.email,
            course: x.user.course,
        },
        schoolClass: x.schoolClass === null || x.schoolClass === undefined ? null : {
            id: x.schoolClass.id,
            description: x.schoolClass.description,
            name: x.schoolClass.name,
        },
        professor: x.professor === null || x.professor === undefined ? null : {
            id: x.professor.id,
            schoolClasses: x.professor.schoolClasses.map(e => ({
                id: e.id,
                description: e.description,
                name: e.name,
            })),
            avatar: x.professor.avatar === null || x.professor.avatar === undefined ? null : {
                thumb: {
                    width: x.professor.avatar.thumb.width || 0,
                    height: x.professor.avatar.thumb.height || 0,
                    url: x.professor.avatar.thumb.url,
                },
                width: x.professor.avatar.width || 0,
                height: x.professor.avatar.height || 0,
                url: x.professor.avatar.url,
            },
            name: x.professor.name,
            tags: x.professor.tags.map(e => e),
            hardness: x.professor.hardness || 0,
        },
        createdAt: (typeof x.createdAt === "string" && (x.createdAt as any).match(/^[0-9]{4}-[01][0-9]-[0123][0-9]T[012][0-9]:[0123456][0-9]:[0123456][0-9](\.[0-9]{1,6})?Z?$/) ? (x.createdAt as any).replace("Z", "") : x.createdAt.toISOString().replace("Z", "")),
        text: x.text,
    };
}

export function transformCommentaryDetailsToJson(x: CommentaryDetails) {
    return {
        text: x.text,
    };
}

export function transformNewCommentaryToJson(x: NewCommentary) {
    return {
        professorId: x.professorId === null || x.professorId === undefined ? null : x.professorId,
        schoolClassId: x.schoolClassId === null || x.schoolClassId === undefined ? null : x.schoolClassId,
        text: x.text,
    };
}

export function transformJsonToLatLng(x: string) {
    const y = JSON.parse(x);
    return {
        lat: y.lat,
        lng: y.lng,
    };
}

export function transformJsonToImage(x: string) {
    const y = JSON.parse(x);
    return {
        thumb: {
            width: y.thumb.width || 0,
            height: y.thumb.height || 0,
            url: y.thumb.url,
        },
        width: y.width || 0,
        height: y.height || 0,
        url: y.url,
    };
}

export function transformJsonToSimpleImage(x: string) {
    const y = JSON.parse(x);
    return {
        width: y.width || 0,
        height: y.height || 0,
        url: y.url,
    };
}

export function transformJsonToFile(x: string) {
    const y = JSON.parse(x);
    return {
        name: y.name,
        url: y.url,
    };
}

export function transformJsonToCrop(x: string) {
    const y = JSON.parse(x);
    return {
        x: y.x || 0,
        y: y.y || 0,
        width: y.width || 0,
        height: y.height || 0,
    };
}

export function transformJsonToUncertainImage(x: string) {
    const y = JSON.parse(x);
    return {
        bytes: y.bytes === null || y.bytes === undefined ? null : Buffer.from(y.bytes, "base64"),
        image: y.image === null || y.image === undefined ? null : {
            thumb: {
                width: y.image.thumb.width || 0,
                height: y.image.thumb.height || 0,
                url: y.image.thumb.url,
            },
            width: y.image.width || 0,
            height: y.image.height || 0,
            url: y.image.url,
        },
        crop: y.crop === null || y.crop === undefined ? null : {
            x: y.crop.x || 0,
            y: y.crop.y || 0,
            width: y.crop.width || 0,
            height: y.crop.height || 0,
        },
    };
}

export function transformJsonToUncertainFile(x: string) {
    const y = JSON.parse(x);
    return {
        fileData: y.fileData === null || y.fileData === undefined ? null : {
            bytes: Buffer.from(y.fileData.bytes, "base64"),
            name: y.fileData.name,
        },
        file: y.file === null || y.file === undefined ? null : {
            name: y.file.name,
            url: y.file.url,
        },
    };
}

export function transformJsonToUploadFile(x: string) {
    const y = JSON.parse(x);
    return {
        bytes: Buffer.from(y.bytes, "base64"),
        name: y.name,
    };
}

export function transformJsonToUser(x: string) {
    const y = JSON.parse(x);
    return {
        id: y.id,
        avatar: y.avatar === null || y.avatar === undefined ? null : {
            thumb: {
                width: y.avatar.thumb.width || 0,
                height: y.avatar.thumb.height || 0,
                url: y.avatar.thumb.url,
            },
            width: y.avatar.width || 0,
            height: y.avatar.height || 0,
            url: y.avatar.url,
        },
        name: y.name,
        email: y.email,
        course: y.course,
    };
}

export function transformJsonToNewUser(x: string) {
    const y = JSON.parse(x);
    return {
        password: y.password,
        avatar: y.avatar === null || y.avatar === undefined ? null : {
            bytes: y.avatar.bytes === null || y.avatar.bytes === undefined ? null : Buffer.from(y.avatar.bytes, "base64"),
            image: y.avatar.image === null || y.avatar.image === undefined ? null : {
                thumb: {
                    width: y.avatar.image.thumb.width || 0,
                    height: y.avatar.image.thumb.height || 0,
                    url: y.avatar.image.thumb.url,
                },
                width: y.avatar.image.width || 0,
                height: y.avatar.image.height || 0,
                url: y.avatar.image.url,
            },
            crop: y.avatar.crop === null || y.avatar.crop === undefined ? null : {
                x: y.avatar.crop.x || 0,
                y: y.avatar.crop.y || 0,
                width: y.avatar.crop.width || 0,
                height: y.avatar.crop.height || 0,
            },
        },
        name: y.name,
        email: y.email,
        course: y.course,
    };
}

export function transformJsonToEditUser(x: string) {
    const y = JSON.parse(x);
    return {
        avatar: y.avatar === null || y.avatar === undefined ? null : {
            bytes: y.avatar.bytes === null || y.avatar.bytes === undefined ? null : Buffer.from(y.avatar.bytes, "base64"),
            image: y.avatar.image === null || y.avatar.image === undefined ? null : {
                thumb: {
                    width: y.avatar.image.thumb.width || 0,
                    height: y.avatar.image.thumb.height || 0,
                    url: y.avatar.image.thumb.url,
                },
                width: y.avatar.image.width || 0,
                height: y.avatar.image.height || 0,
                url: y.avatar.image.url,
            },
            crop: y.avatar.crop === null || y.avatar.crop === undefined ? null : {
                x: y.avatar.crop.x || 0,
                y: y.avatar.crop.y || 0,
                width: y.avatar.crop.width || 0,
                height: y.avatar.crop.height || 0,
            },
        },
        name: y.name,
        email: y.email,
        course: y.course,
    };
}

export function transformJsonToUserDetails(x: string) {
    const y = JSON.parse(x);
    return {
        name: y.name,
        email: y.email,
        course: y.course,
    };
}

export function transformJsonToSchoolClass(x: string) {
    const y = JSON.parse(x);
    return {
        id: y.id,
        description: y.description,
        name: y.name,
    };
}

export function transformJsonToSchoolClassDetails(x: string) {
    const y = JSON.parse(x);
    return {
        id: y.id,
        description: y.description,
        name: y.name,
    };
}

export function transformJsonToNewSchoolClass(x: string) {
    const y = JSON.parse(x);
    return {
        id: y.id,
        description: y.description,
        name: y.name,
    };
}

export function transformJsonToProfessor(x: string) {
    const y = JSON.parse(x);
    return {
        id: y.id,
        schoolClasses: y.schoolClasses.map((e: any) => ({
            id: e.id,
            description: e.description,
            name: e.name,
        })),
        avatar: y.avatar === null || y.avatar === undefined ? null : {
            thumb: {
                width: y.avatar.thumb.width || 0,
                height: y.avatar.thumb.height || 0,
                url: y.avatar.thumb.url,
            },
            width: y.avatar.width || 0,
            height: y.avatar.height || 0,
            url: y.avatar.url,
        },
        name: y.name,
        tags: y.tags.map((e: any) => e),
        hardness: y.hardness || 0,
    };
}

export function transformJsonToProfessorDetails(x: string) {
    const y = JSON.parse(x);
    return {
        avatar: y.avatar === null || y.avatar === undefined ? null : {
            thumb: {
                width: y.avatar.thumb.width || 0,
                height: y.avatar.thumb.height || 0,
                url: y.avatar.thumb.url,
            },
            width: y.avatar.width || 0,
            height: y.avatar.height || 0,
            url: y.avatar.url,
        },
        name: y.name,
        tags: y.tags.map((e: any) => e),
        hardness: y.hardness || 0,
    };
}

export function transformJsonToNewProfessor(x: string) {
    const y = JSON.parse(x);
    return {
        avatar: y.avatar === null || y.avatar === undefined ? null : {
            bytes: y.avatar.bytes === null || y.avatar.bytes === undefined ? null : Buffer.from(y.avatar.bytes, "base64"),
            image: y.avatar.image === null || y.avatar.image === undefined ? null : {
                thumb: {
                    width: y.avatar.image.thumb.width || 0,
                    height: y.avatar.image.thumb.height || 0,
                    url: y.avatar.image.thumb.url,
                },
                width: y.avatar.image.width || 0,
                height: y.avatar.image.height || 0,
                url: y.avatar.image.url,
            },
            crop: y.avatar.crop === null || y.avatar.crop === undefined ? null : {
                x: y.avatar.crop.x || 0,
                y: y.avatar.crop.y || 0,
                width: y.avatar.crop.width || 0,
                height: y.avatar.crop.height || 0,
            },
        },
        schoolClassIds: y.schoolClassIds.map((e: any) => e),
        name: y.name,
        tags: y.tags.map((e: any) => e),
        hardness: y.hardness || 0,
    };
}

export function transformJsonToCommentary(x: string) {
    const y = JSON.parse(x);
    return {
        id: y.id,
        user: {
            id: y.user.id,
            avatar: y.user.avatar === null || y.user.avatar === undefined ? null : {
                thumb: {
                    width: y.user.avatar.thumb.width || 0,
                    height: y.user.avatar.thumb.height || 0,
                    url: y.user.avatar.thumb.url,
                },
                width: y.user.avatar.width || 0,
                height: y.user.avatar.height || 0,
                url: y.user.avatar.url,
            },
            name: y.user.name,
            email: y.user.email,
            course: y.user.course,
        },
        schoolClass: y.schoolClass === null || y.schoolClass === undefined ? null : {
            id: y.schoolClass.id,
            description: y.schoolClass.description,
            name: y.schoolClass.name,
        },
        professor: y.professor === null || y.professor === undefined ? null : {
            id: y.professor.id,
            schoolClasses: y.professor.schoolClasses.map((e: any) => ({
                id: e.id,
                description: e.description,
                name: e.name,
            })),
            avatar: y.professor.avatar === null || y.professor.avatar === undefined ? null : {
                thumb: {
                    width: y.professor.avatar.thumb.width || 0,
                    height: y.professor.avatar.thumb.height || 0,
                    url: y.professor.avatar.thumb.url,
                },
                width: y.professor.avatar.width || 0,
                height: y.professor.avatar.height || 0,
                url: y.professor.avatar.url,
            },
            name: y.professor.name,
            tags: y.professor.tags.map((e: any) => e),
            hardness: y.professor.hardness || 0,
        },
        createdAt: new Date(y.createdAt + "Z"),
        text: y.text,
    };
}

export function transformJsonToCommentaryDetails(x: string) {
    const y = JSON.parse(x);
    return {
        text: y.text,
    };
}

export function transformJsonToNewCommentary(x: string) {
    const y = JSON.parse(x);
    return {
        professorId: y.professorId === null || y.professorId === undefined ? null : y.professorId,
        schoolClassId: y.schoolClassId === null || y.schoolClassId === undefined ? null : y.schoolClassId,
        text: y.text,
    };
}

export class NotFound extends Error {
    _type = "NotFound";
    constructor(public _msg: string) {
        super(_msg ? "NotFound: " + _msg : "NotFound");
    }
}

export class InvalidArgument extends Error {
    _type = "InvalidArgument";
    constructor(public _msg: string) {
        super(_msg ? "InvalidArgument: " + _msg : "InvalidArgument");
    }
}

export class MissingArgument extends Error {
    _type = "MissingArgument";
    constructor(public _msg: string) {
        super(_msg ? "MissingArgument: " + _msg : "MissingArgument");
    }
}

export class WrongLoginOrPassword extends Error {
    _type = "WrongLoginOrPassword";
    constructor(public _msg: string) {
        super(_msg ? "WrongLoginOrPassword: " + _msg : "WrongLoginOrPassword");
    }
}

export class NotLoggedIn extends Error {
    _type = "NotLoggedIn";
    constructor(public _msg: string) {
        super(_msg ? "NotLoggedIn: " + _msg : "NotLoggedIn");
    }
}

export class PasswordTooSmall extends Error {
    _type = "PasswordTooSmall";
    constructor(public _msg: string) {
        super(_msg ? "PasswordTooSmall: " + _msg : "PasswordTooSmall");
    }
}

export class EmailAlreadyInUse extends Error {
    _type = "EmailAlreadyInUse";
    constructor(public _msg: string) {
        super(_msg ? "EmailAlreadyInUse: " + _msg : "EmailAlreadyInUse");
    }
}

export class InvalidEmail extends Error {
    _type = "InvalidEmail";
    constructor(public _msg: string) {
        super(_msg ? "InvalidEmail: " + _msg : "InvalidEmail");
    }
}

export class Fatal extends Error {
    _type = "Fatal";
    constructor(public _msg: string) {
        super(_msg ? "Fatal: " + _msg : "Fatal");
    }
}

export class Connection extends Error {
    _type = "Connection";
    constructor(public _msg: string) {
        super(_msg ? "Connection: " + _msg : "Connection");
    }
}

export const err = {
    NotFound: (message: string = "") => { throw new NotFound(message); },
    InvalidArgument: (message: string = "") => { throw new InvalidArgument(message); },
    MissingArgument: (message: string = "") => { throw new MissingArgument(message); },
    WrongLoginOrPassword: (message: string = "") => { throw new WrongLoginOrPassword(message); },
    NotLoggedIn: (message: string = "") => { throw new NotLoggedIn(message); },
    PasswordTooSmall: (message: string = "") => { throw new PasswordTooSmall(message); },
    EmailAlreadyInUse: (message: string = "") => { throw new EmailAlreadyInUse(message); },
    InvalidEmail: (message: string = "") => { throw new InvalidEmail(message); },
    Fatal: (message: string = "") => { throw new Fatal(message); },
    Connection: (message: string = "") => { throw new Connection(message); },
};

//////////////////////////////////////////////////////

const httpHandlers: {
    [signature: string]: (body: string, res: http.ServerResponse, req: http.IncomingMessage) => void
} = {}

export function handleHttp(method: "GET" | "POST" | "PUT" | "DELETE", path: string, func: (body: string, res: http.ServerResponse, req: http.IncomingMessage) => void) {
    httpHandlers[method + path] = func;
}

export function handleHttpPrefix(method: "GET" | "POST" | "PUT" | "DELETE", path: string, func: (body: string, res: http.ServerResponse, req: http.IncomingMessage) => void) {
    httpHandlers["prefix " + method + path] = func;
}

export interface Context {
    call: DBApiCall;
    device: DBDevice;
    req: http.IncomingMessage;
    startTime: Date;
    staging: boolean;
}

function sleep(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export let server: http.Server;

export const hook: {
    onHealthCheck: () => Promise<boolean>
    onDevice: (id: string, deviceInfo: any) => Promise<void>
    onReceiveCall: (call: DBApiCall) => Promise<DBApiCall | void>
    afterProcessCall: (call: DBApiCall) => Promise<void>
    setCache: (cacheKey: string, expirationDate: Date | null, version: number, decodedKey: string, fnName: string, ret: any) => Promise<void>
    getCache: (cacheKey: string, version: number) => Promise<{expirationDate: Date | null, ret: any} | null>
} = {
    onHealthCheck: async () => true,
    onDevice: async () => {},
    onReceiveCall: async () => {},
    afterProcessCall: async () => {},
    setCache: async () => {},
    getCache: async () => null
};

export function start(port: number = 8000) {
    if (server) return;
    server = http.createServer((req, res) => {
        req.on("error", (err) => {
            console.error(err);
        });

        res.on("error", (err) => {
            console.error(err);
        });

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "PUT, POST, GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.setHeader("Access-Control-Max-Age", "86400");
        res.setHeader("Content-Type", "application/json");

        let body = "";
        req.on("data", (chunk: any) => body += chunk.toString());
        req.on("end", () => {
            if (req.method === "OPTIONS") {
                res.writeHead(200);
                res.end();
                return;
            }
            const ip = req.headers["x-real-ip"] as string || "";
            const signature = req.method! + url.parse(req.url || "").pathname;
            if (httpHandlers[signature]) {
                console.log(`${toDateTimeString(new Date())} http ${signature}`);
                httpHandlers[signature](body, res, req);
                return;
            }
            for (let target in httpHandlers) {
                if (("prefix " + signature).startsWith(target)) {
                    console.log(`${toDateTimeString(new Date())} http ${target}`);
                    httpHandlers[target](body, res, req);
                    return;
                }
            }

            switch (req.method) {
                case "HEAD": {
                    res.writeHead(200);
                    res.end();
                    break;
                }
                case "GET": {
                    hook.onHealthCheck().then(ok => {
                        res.writeHead(ok ? 200 : 500);
                        res.write(JSON.stringify({ok}));
                        res.end();
                    }, error => {
                        console.error(error);
                        res.writeHead(500);
                        res.write(JSON.stringify({ok: false}));
                        res.end();
                    });
                    break;
                }
                case "POST": {
                    (async () => {
                        const request = JSON.parse(body);
                        request.device.ip = ip;
                        request.device.lastActiveAt = new Date();
                        const context: Context = {
                            call: null as any,
                            req: req,
                            device: request.device,
                            startTime: new Date,
                            staging: request.staging || false
                        };
                        const startTime = process.hrtime();

                        const {id, ...deviceInfo} = context.device;

                        if (!context.device.id)
                            context.device.id = crypto.randomBytes(20).toString("hex");

                        await hook.onDevice(context.device.id, deviceInfo);

                        const executionId = crypto.randomBytes(20).toString("hex");

                        let call: DBApiCall = {
                            id: `${request.id}-${context.device.id}`,
                            name: request.name,
                            args: JSON.parse(JSON.stringify(request.args)),
                            executionId: executionId,
                            running: true,
                            device: context.device,
                            date: context.startTime,
                            duration: 0,
                            host: os.hostname(),
                            ok: true,
                            result: null as any,
                            error: null as {type: string, message: string} | null
                        };

                        context.call = call;

                        if (clearForLogging[call.name])
                            clearForLogging[call.name](call);

                        try {
                            call = await hook.onReceiveCall(call) || call;
                        } catch (e) {
                            call.ok = false;
                            call.error = {
                                type: "Fatal",
                                message: e.toString()
                            };
                            call.running = false;
                        }

                        if (call.running) {
                            try {
                                const func = fnExec[request.name];
                                if (func) {
                                    call.result = await func(context, request.args);
                                } else {
                                    console.error(JSON.stringify(Object.keys(fnExec)));
                                    throw "Function does not exist: " + request.name;
                                }
                            } catch (err) {
                                console.error(err);
                                call.ok = false;
                                if (["NotFound","InvalidArgument","MissingArgument","WrongLoginOrPassword","NotLoggedIn","PasswordTooSmall","EmailAlreadyInUse","InvalidEmail","Fatal","Connection"].includes(err._type)) {
                                    call.error = {
                                        type: err._type,
                                        message: err._msg
                                    };
                                } else {
                                    call.error = {
                                        type: "Fatal",
                                        message: err.toString()
                                    };
                                    setTimeout(() => captureError(err, req, {
                                        call
                                    }), 1);
                                }
                            }
                            call.running = false;
                            const deltaTime = process.hrtime(startTime);
                            call.duration = deltaTime[0] + deltaTime[1] * 1e-9;

                            await hook.afterProcessCall(call);
                        }

                        const response = {
                            id: call.id,
                            ok: call.ok,
                            executed: call.executionId === executionId,
                            deviceId: call.device.id,
                            startTime: call.date,
                            duration: call.duration,
                            host: call.host,
                            result: call.result,
                            error: call.error
                        };

                        // res.writeHead(!response.error ? 200 : response.error.type === "Fatal" ? 500 : 400);
                        res.writeHead(200);
                        res.write(JSON.stringify(response));
                        res.end();

                        console.log(
                            `${toDateTimeString(new Date())} ` +
                            `${call.id} [${call.duration.toFixed(6)}s] ` +
                            `${call.name}() -> ${call.ok ? "OK" : call.error ? call.error.type : "???"}`
                        );
                    })().catch(err => {
                        console.error(err);
                        if (!res.headersSent)
                            res.writeHead(500);
                        res.end();
                    });
                    break;
                }
                default: {
                    res.writeHead(500);
                    res.end();
                }
            }
        });
    });

    if ((server as any).keepAliveTimeout)
        (server as any).keepAliveTimeout = 0;

    if (!process.env.TEST && !process.env.DEBUGGING && sentryUrl) {
        Raven.config(sentryUrl).install();
        captureError = (e, req, extra) => Raven.captureException(e, {
            req,
            extra,
            fingerprint: [(e.message || e.toString()).replace(/[0-9]+/g, "X").replace(/"[^"]*"/g, "X")]
        });
    }

    if (process.env.DEBUGGING && !process.env.NOLOCALTUNNEL) {
        port = (Math.random() * 50000 + 10000) || 0;
    }

    if (!process.env.TEST) {
        server.listen(port, () => {
            const addr = server.address();
            const addrString = typeof addr === "string" ? addr : `${addr.address}:${addr.port}`;
            console.log(`Listening on ${addrString}`);
        });
    }

    if (process.env.DEBUGGING && !process.env.NOLOCALTUNNEL) {
        const subdomain = require("crypto").createHash("md5").update(process.argv[1]).digest("hex").substr(0, 8);
        require("localtunnel")(port, {subdomain}, (err: Error | null, tunnel: any) => {
            if (err) throw err;
            console.log("Tunnel URL:", tunnel.url);
        });
    }
}

fn.ping = async (ctx: Context) => "pong";fn.setPushToken = async (ctx: Context, token: string) => {
    await r.table("devices").get(ctx.device.id).update({push: token});
};

import r from "../../rethinkdb";

hook.onHealthCheck = async () => {
    return await r.expr(true);
};

hook.onDevice = async (id, deviceInfo) => {
    if (await r.table("devices").get(id).eq(null)) {
        await r.table("devices").insert({
            id: id,
            date: r.now(),
            ...deviceInfo
        });
    } else {
        r.table("devices").get(id).update(deviceInfo).run();
    }
};

hook.onReceiveCall = async (call) => {
    for (let i = 0; i < 1500; ++i) {
        const priorCall = await r.table("api_calls").get(call.id);
        if (priorCall === null) {
            const res = await r.table("api_calls").insert(call);
            if (res.inserted > 0)
                return;
            else
                continue;
        }
        if (!priorCall.running) {
            return priorCall;
        }
        if (priorCall.executionId === call.executionId) {
            return;
        }

        await sleep(100);
    }

    throw "CallExecutionTimeout: Timeout while waiting for execution somewhere else (is the original container that received this request dead?)";
};

hook.afterProcessCall = async (call) => {
    r.table("api_calls").get(call.id).update(call).run();
};
