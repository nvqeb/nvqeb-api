import { LocalizedStringsMethods } from "localized-strings";
import { UAParser } from "ua-parser-js";

let baseUrl: string = "localhost:8000";
let strings: (LocalizedStringsMethods & any) | null = null;

export function setUrl(url: string): void {
    baseUrl = url;
}

export function setStrings(newStrings: (LocalizedStringsMethods & {}) | null): void {
    strings = newStrings;
}
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

export function translateImageFormat(enumImageFormat: ImageFormat): string {
    switch (enumImageFormat) {
        case ImageFormat.png: {
            return strings ? strings["enum"]["ImageFormat"]["png"] || ImageFormat.png : ImageFormat.png;
        }
        case ImageFormat.jpeg: {
            return strings ? strings["enum"]["ImageFormat"]["jpeg"] || ImageFormat.jpeg : ImageFormat.jpeg;
        }
    }
    return "";
}

export function allValuesImageFormat(): ImageFormat[] {
    return [
        ImageFormat.png,
        ImageFormat.jpeg,
    ];
}

export function allTranslatedValuesImageFormat(): string[] {
    return [
        translateImageFormat(ImageFormat.png),
        translateImageFormat(ImageFormat.jpeg),
    ];
}

export function allDisplayableValuesImageFormat(): string[] {
    return allTranslatedValuesImageFormat().sort();
}

export function valueFromTranslationImageFormat(translation: string): ImageFormat {
    const index = allTranslatedValuesImageFormat().indexOf(translation);
    return allValuesImageFormat()[index] || ImageFormat.png;
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

export function translateErrorType(enumErrorType: ErrorType): string {
    switch (enumErrorType) {
        case ErrorType.NotFound: {
            return strings ? strings["enum"]["ErrorType"]["NotFound"] || ErrorType.NotFound : ErrorType.NotFound;
        }
        case ErrorType.InvalidArgument: {
            return strings ? strings["enum"]["ErrorType"]["InvalidArgument"] || ErrorType.InvalidArgument : ErrorType.InvalidArgument;
        }
        case ErrorType.MissingArgument: {
            return strings ? strings["enum"]["ErrorType"]["MissingArgument"] || ErrorType.MissingArgument : ErrorType.MissingArgument;
        }
        case ErrorType.WrongLoginOrPassword: {
            return strings ? strings["enum"]["ErrorType"]["WrongLoginOrPassword"] || ErrorType.WrongLoginOrPassword : ErrorType.WrongLoginOrPassword;
        }
        case ErrorType.NotLoggedIn: {
            return strings ? strings["enum"]["ErrorType"]["NotLoggedIn"] || ErrorType.NotLoggedIn : ErrorType.NotLoggedIn;
        }
        case ErrorType.PasswordTooSmall: {
            return strings ? strings["enum"]["ErrorType"]["PasswordTooSmall"] || ErrorType.PasswordTooSmall : ErrorType.PasswordTooSmall;
        }
        case ErrorType.EmailAlreadyInUse: {
            return strings ? strings["enum"]["ErrorType"]["EmailAlreadyInUse"] || ErrorType.EmailAlreadyInUse : ErrorType.EmailAlreadyInUse;
        }
        case ErrorType.InvalidEmail: {
            return strings ? strings["enum"]["ErrorType"]["InvalidEmail"] || ErrorType.InvalidEmail : ErrorType.InvalidEmail;
        }
        case ErrorType.Fatal: {
            return strings ? strings["enum"]["ErrorType"]["Fatal"] || ErrorType.Fatal : ErrorType.Fatal;
        }
        case ErrorType.Connection: {
            return strings ? strings["enum"]["ErrorType"]["Connection"] || ErrorType.Connection : ErrorType.Connection;
        }
    }
    return "";
}

export function allValuesErrorType(): ErrorType[] {
    return [
        ErrorType.NotFound,
        ErrorType.InvalidArgument,
        ErrorType.MissingArgument,
        ErrorType.WrongLoginOrPassword,
        ErrorType.NotLoggedIn,
        ErrorType.PasswordTooSmall,
        ErrorType.EmailAlreadyInUse,
        ErrorType.InvalidEmail,
        ErrorType.Fatal,
        ErrorType.Connection,
    ];
}

export function allTranslatedValuesErrorType(): string[] {
    return [
        translateErrorType(ErrorType.NotFound),
        translateErrorType(ErrorType.InvalidArgument),
        translateErrorType(ErrorType.MissingArgument),
        translateErrorType(ErrorType.WrongLoginOrPassword),
        translateErrorType(ErrorType.NotLoggedIn),
        translateErrorType(ErrorType.PasswordTooSmall),
        translateErrorType(ErrorType.EmailAlreadyInUse),
        translateErrorType(ErrorType.InvalidEmail),
        translateErrorType(ErrorType.Fatal),
        translateErrorType(ErrorType.Connection),
    ];
}

export function allDisplayableValuesErrorType(): string[] {
    return allTranslatedValuesErrorType().sort();
}

export function valueFromTranslationErrorType(translation: string): ErrorType {
    const index = allTranslatedValuesErrorType().indexOf(translation);
    return allValuesErrorType()[index] || ErrorType.NotFound;
}

export async function uploadImage(image: Buffer, format: ImageFormat | null, crop: Crop | null, progress?: (progress: number) => void): Promise<Image> {
    const args = {
        image: image.toString("base64"),
        format: format === null || format === undefined ? null : format,
        crop: crop === null || crop === undefined ? null : {
            x: crop.x || 0,
            y: crop.y || 0,
            width: crop.width || 0,
            height: crop.height || 0,
        },
    };
    const ret = await makeRequest({name: "uploadImage", args, progress});
    return {
        thumb: {
            width: ret.thumb.width || 0,
            height: ret.thumb.height || 0,
            url: ret.thumb.url,
        },
        width: ret.width || 0,
        height: ret.height || 0,
        url: ret.url,
    };
}

export async function cropImage(src: string, crop: Crop, progress?: (progress: number) => void): Promise<Image> {
    const args = {
        src: src,
        crop: {
            x: crop.x || 0,
            y: crop.y || 0,
            width: crop.width || 0,
            height: crop.height || 0,
        },
    };
    const ret = await makeRequest({name: "cropImage", args, progress});
    return {
        thumb: {
            width: ret.thumb.width || 0,
            height: ret.thumb.height || 0,
            url: ret.thumb.url,
        },
        width: ret.width || 0,
        height: ret.height || 0,
        url: ret.url,
    };
}

export async function uploadFile(file: UploadFile, progress?: (progress: number) => void): Promise<File> {
    const args = {
        file: {
            bytes: file.bytes.toString("base64"),
            name: file.name,
        },
    };
    const ret = await makeRequest({name: "uploadFile", args, progress});
    return {
        name: ret.name,
        url: ret.url,
    };
}

export async function emailAvailable(email: string, progress?: (progress: number) => void): Promise<void> {
    const args = {
        email: email,
    };
    await makeRequest({name: "emailAvailable", args, progress});
    return undefined;
}

export async function getCurrentUser(progress?: (progress: number) => void): Promise<User> {
    const ret = await makeRequest({name: "getCurrentUser", args: {}, progress});
    return {
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
}

export async function login(email: string, password: string, progress?: (progress: number) => void): Promise<User> {
    const args = {
        email: email,
        password: password,
    };
    const ret = await makeRequest({name: "login", args, progress});
    return {
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
}

export async function logout(progress?: (progress: number) => void): Promise<void> {
    await makeRequest({name: "logout", args: {}, progress});
    return undefined;
}

export async function createUser(user: NewUser, progress?: (progress: number) => void): Promise<User> {
    const args = {
        user: {
            password: user.password,
            avatar: user.avatar === null || user.avatar === undefined ? null : {
                bytes: user.avatar.bytes === null || user.avatar.bytes === undefined ? null : user.avatar.bytes.toString("base64"),
                image: user.avatar.image === null || user.avatar.image === undefined ? null : {
                    thumb: {
                        width: user.avatar.image.thumb.width || 0,
                        height: user.avatar.image.thumb.height || 0,
                        url: user.avatar.image.thumb.url,
                    },
                    width: user.avatar.image.width || 0,
                    height: user.avatar.image.height || 0,
                    url: user.avatar.image.url,
                },
                crop: user.avatar.crop === null || user.avatar.crop === undefined ? null : {
                    x: user.avatar.crop.x || 0,
                    y: user.avatar.crop.y || 0,
                    width: user.avatar.crop.width || 0,
                    height: user.avatar.crop.height || 0,
                },
            },
            name: user.name,
            email: user.email,
            course: user.course,
        },
    };
    const ret = await makeRequest({name: "createUser", args, progress});
    return {
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
}

export async function editUser(user: EditUser, progress?: (progress: number) => void): Promise<User> {
    const args = {
        user: {
            avatar: user.avatar === null || user.avatar === undefined ? null : {
                bytes: user.avatar.bytes === null || user.avatar.bytes === undefined ? null : user.avatar.bytes.toString("base64"),
                image: user.avatar.image === null || user.avatar.image === undefined ? null : {
                    thumb: {
                        width: user.avatar.image.thumb.width || 0,
                        height: user.avatar.image.thumb.height || 0,
                        url: user.avatar.image.thumb.url,
                    },
                    width: user.avatar.image.width || 0,
                    height: user.avatar.image.height || 0,
                    url: user.avatar.image.url,
                },
                crop: user.avatar.crop === null || user.avatar.crop === undefined ? null : {
                    x: user.avatar.crop.x || 0,
                    y: user.avatar.crop.y || 0,
                    width: user.avatar.crop.width || 0,
                    height: user.avatar.crop.height || 0,
                },
            },
            name: user.name,
            email: user.email,
            course: user.course,
        },
    };
    const ret = await makeRequest({name: "editUser", args, progress});
    return {
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
}

export async function setAvatar(avatar: UncertainImage, progress?: (progress: number) => void): Promise<User> {
    const args = {
        avatar: {
            bytes: avatar.bytes === null || avatar.bytes === undefined ? null : avatar.bytes.toString("base64"),
            image: avatar.image === null || avatar.image === undefined ? null : {
                thumb: {
                    width: avatar.image.thumb.width || 0,
                    height: avatar.image.thumb.height || 0,
                    url: avatar.image.thumb.url,
                },
                width: avatar.image.width || 0,
                height: avatar.image.height || 0,
                url: avatar.image.url,
            },
            crop: avatar.crop === null || avatar.crop === undefined ? null : {
                x: avatar.crop.x || 0,
                y: avatar.crop.y || 0,
                width: avatar.crop.width || 0,
                height: avatar.crop.height || 0,
            },
        },
    };
    const ret = await makeRequest({name: "setAvatar", args, progress});
    return {
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
}

export async function getSchoolClass(schoolClassId: string, progress?: (progress: number) => void): Promise<SchoolClass> {
    const args = {
        schoolClassId: schoolClassId,
    };
    const ret = await makeRequest({name: "getSchoolClass", args, progress});
    return {
        id: ret.id,
        description: ret.description,
        name: ret.name,
    };
}

export async function getSchoolClassesFor(schoolClassIds: string[], progress?: (progress: number) => void): Promise<SchoolClass[]> {
    const args = {
        schoolClassIds: schoolClassIds.map(e => e),
    };
    const ret = await makeRequest({name: "getSchoolClassesFor", args, progress});
    return ret.map((e: any) => ({
        id: e.id,
        description: e.description,
        name: e.name,
    }));
}

export async function createSchoolClass(schoolClass: NewSchoolClass, progress?: (progress: number) => void): Promise<SchoolClass> {
    const args = {
        schoolClass: {
            id: schoolClass.id,
            description: schoolClass.description,
            name: schoolClass.name,
        },
    };
    const ret = await makeRequest({name: "createSchoolClass", args, progress});
    return {
        id: ret.id,
        description: ret.description,
        name: ret.name,
    };
}

export async function editSchoolClass(schoolClassId: string, schoolClass: NewSchoolClass, progress?: (progress: number) => void): Promise<SchoolClass> {
    const args = {
        schoolClassId: schoolClassId,
        schoolClass: {
            id: schoolClass.id,
            description: schoolClass.description,
            name: schoolClass.name,
        },
    };
    const ret = await makeRequest({name: "editSchoolClass", args, progress});
    return {
        id: ret.id,
        description: ret.description,
        name: ret.name,
    };
}

export async function getProfessor(professorId: string, progress?: (progress: number) => void): Promise<Professor> {
    const args = {
        professorId: professorId,
    };
    const ret = await makeRequest({name: "getProfessor", args, progress});
    return {
        id: ret.id,
        schoolClasses: ret.schoolClasses.map((e: any) => ({
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
        tags: ret.tags.map((e: any) => e),
        hardness: ret.hardness || 0,
    };
}

export async function getProfessors(pageOffset: number, progress?: (progress: number) => void): Promise<Professor[]> {
    const args = {
        pageOffset: pageOffset || 0,
    };
    const ret = await makeRequest({name: "getProfessors", args, progress});
    return ret.map((e: any) => ({
        id: e.id,
        schoolClasses: e.schoolClasses.map((e: any) => ({
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
        tags: e.tags.map((e: any) => e),
        hardness: e.hardness || 0,
    }));
}

export async function createProfessor(professor: NewProfessor, progress?: (progress: number) => void): Promise<Professor> {
    const args = {
        professor: {
            avatar: professor.avatar === null || professor.avatar === undefined ? null : {
                bytes: professor.avatar.bytes === null || professor.avatar.bytes === undefined ? null : professor.avatar.bytes.toString("base64"),
                image: professor.avatar.image === null || professor.avatar.image === undefined ? null : {
                    thumb: {
                        width: professor.avatar.image.thumb.width || 0,
                        height: professor.avatar.image.thumb.height || 0,
                        url: professor.avatar.image.thumb.url,
                    },
                    width: professor.avatar.image.width || 0,
                    height: professor.avatar.image.height || 0,
                    url: professor.avatar.image.url,
                },
                crop: professor.avatar.crop === null || professor.avatar.crop === undefined ? null : {
                    x: professor.avatar.crop.x || 0,
                    y: professor.avatar.crop.y || 0,
                    width: professor.avatar.crop.width || 0,
                    height: professor.avatar.crop.height || 0,
                },
            },
            schoolClassIds: professor.schoolClassIds.map(e => e),
            name: professor.name,
            tags: professor.tags.map(e => e),
            hardness: professor.hardness || 0,
        },
    };
    const ret = await makeRequest({name: "createProfessor", args, progress});
    return {
        id: ret.id,
        schoolClasses: ret.schoolClasses.map((e: any) => ({
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
        tags: ret.tags.map((e: any) => e),
        hardness: ret.hardness || 0,
    };
}

export async function editProfessor(professorId: string, professor: NewProfessor, progress?: (progress: number) => void): Promise<Professor> {
    const args = {
        professorId: professorId,
        professor: {
            avatar: professor.avatar === null || professor.avatar === undefined ? null : {
                bytes: professor.avatar.bytes === null || professor.avatar.bytes === undefined ? null : professor.avatar.bytes.toString("base64"),
                image: professor.avatar.image === null || professor.avatar.image === undefined ? null : {
                    thumb: {
                        width: professor.avatar.image.thumb.width || 0,
                        height: professor.avatar.image.thumb.height || 0,
                        url: professor.avatar.image.thumb.url,
                    },
                    width: professor.avatar.image.width || 0,
                    height: professor.avatar.image.height || 0,
                    url: professor.avatar.image.url,
                },
                crop: professor.avatar.crop === null || professor.avatar.crop === undefined ? null : {
                    x: professor.avatar.crop.x || 0,
                    y: professor.avatar.crop.y || 0,
                    width: professor.avatar.crop.width || 0,
                    height: professor.avatar.crop.height || 0,
                },
            },
            schoolClassIds: professor.schoolClassIds.map(e => e),
            name: professor.name,
            tags: professor.tags.map(e => e),
            hardness: professor.hardness || 0,
        },
    };
    const ret = await makeRequest({name: "editProfessor", args, progress});
    return {
        id: ret.id,
        schoolClasses: ret.schoolClasses.map((e: any) => ({
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
        tags: ret.tags.map((e: any) => e),
        hardness: ret.hardness || 0,
    };
}

export async function getProfessorsFor(schoolClassId: string, progress?: (progress: number) => void): Promise<Professor[]> {
    const args = {
        schoolClassId: schoolClassId,
    };
    const ret = await makeRequest({name: "getProfessorsFor", args, progress});
    return ret.map((e: any) => ({
        id: e.id,
        schoolClasses: e.schoolClasses.map((e: any) => ({
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
        tags: e.tags.map((e: any) => e),
        hardness: e.hardness || 0,
    }));
}

export async function createCommentary(commentary: NewCommentary, progress?: (progress: number) => void): Promise<Commentary> {
    const args = {
        commentary: {
            professorId: commentary.professorId === null || commentary.professorId === undefined ? null : commentary.professorId,
            schoolClassId: commentary.schoolClassId === null || commentary.schoolClassId === undefined ? null : commentary.schoolClassId,
            text: commentary.text,
        },
    };
    const ret = await makeRequest({name: "createCommentary", args, progress});
    return {
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
            schoolClasses: ret.professor.schoolClasses.map((e: any) => ({
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
            tags: ret.professor.tags.map((e: any) => e),
            hardness: ret.professor.hardness || 0,
        },
        createdAt: new Date(ret.createdAt + "Z"),
        text: ret.text,
    };
}

export async function getCommentariesForProfessor(professorId: string, progress?: (progress: number) => void): Promise<Commentary[]> {
    const args = {
        professorId: professorId,
    };
    const ret = await makeRequest({name: "getCommentariesForProfessor", args, progress});
    return ret.map((e: any) => ({
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
            schoolClasses: e.professor.schoolClasses.map((e: any) => ({
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
            tags: e.professor.tags.map((e: any) => e),
            hardness: e.professor.hardness || 0,
        },
        createdAt: new Date(e.createdAt + "Z"),
        text: e.text,
    }));
}

export async function getCommentariesForSchoolClass(schoolClassId: string, progress?: (progress: number) => void): Promise<Commentary[]> {
    const args = {
        schoolClassId: schoolClassId,
    };
    const ret = await makeRequest({name: "getCommentariesForSchoolClass", args, progress});
    return ret.map((e: any) => ({
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
            schoolClasses: e.professor.schoolClasses.map((e: any) => ({
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
            tags: e.professor.tags.map((e: any) => e),
            hardness: e.professor.hardness || 0,
        },
        createdAt: new Date(e.createdAt + "Z"),
        text: e.text,
    }));
}

export async function ping(progress?: (progress: number) => void): Promise<string> {
    const ret = await makeRequest({name: "ping", args: {}, progress});
    return ret;
}

export async function setPushToken(token: string, progress?: (progress: number) => void): Promise<void> {
    const args = {
        token: token,
    };
    await makeRequest({name: "setPushToken", args, progress});
    return undefined;
}

//////////////////////////////////////////////////////

let fallbackDeviceId: string | null = null;

function setDeviceId(deviceId: string): void {
    fallbackDeviceId = deviceId;
    try {
        localStorage.setItem("deviceId", deviceId);
    } catch (e) {}
}

function getDeviceId(): string | null {
    try {
        return localStorage.getItem("deviceId") || fallbackDeviceId;
    } catch (e) {}

    return fallbackDeviceId;
}

async function device(): Promise<any> {
    const parser = new UAParser();
    parser.setUA(navigator.userAgent);
    const agent = parser.getResult();
    const me = document.currentScript as HTMLScriptElement;
    const device: any = {
            type: "web",
            platform: {
                browser: agent.browser.name,
                browserVersion: agent.browser.version,
                os: agent.os.name,
                osVersion: agent.os.version,
            },
            screen: {
                width: screen.width,
                height: screen.height,
            },
            version: me ? me.src : "",
            language: navigator.language,
    };

    const deviceId = getDeviceId();
    if (deviceId)
        device.id = deviceId;

    return device;
}

function randomBytesHex(len: number): string {
    let hex = "";
    for (let i = 0; i < 2 * len; ++i) {
        hex += "0123456789abcdef"[Math.floor(Math.random() * 16)];
    }

    return hex;
}

export interface ListenerTypes {
    fail: (e: Error, name: string, args: any) => void;
    fatal: (e: Error, name: string, args: any) => void;
    success: (res: string, name: string, args: any) => void;
}

// tslint:disable-next-line: ban-types
type HookArray = Function[];
export type Listenables = keyof ListenerTypes;
export type ListenersDict = { [k in Listenables]: Array<ListenerTypes[k]> };

const listenersDict: ListenersDict = {
    fail: [],
    fatal: [],
    success: [],
};

export function addEventListener(listenable: Listenables, hook: ListenerTypes[typeof listenable]): void {
    const listeners: HookArray = listenersDict[listenable];
    listeners.push(hook);
}

export function removeEventListener(listenable: Listenables, hook: ListenerTypes[typeof listenable]): void {
    const listeners: HookArray = listenersDict[listenable];
    listenersDict[listenable] = listeners.filter((h) => h !== hook) as any;
}

async function makeRequest({name, args, progress}: {name: string, args: any, progress?: (progress: number) => void}): Promise<any> {
    const deviceData = await device();
    return new Promise<any>((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.open(
            "POST",
            `${baseUrl.startsWith("http") || baseUrl.startsWith("localhost") ?
                "" :
                "https://"
            }${baseUrl}/${name}`,
        );

        const body = {
            id: randomBytesHex(8),
            device: deviceData,
            name: name,
            args: args,
        };

        function roughSizeOfObject(object: any): number {
            const objectList = [];
            const stack = [ object ];
            let bytes = 0;

            while (stack.length) {
                const value = stack.pop();
                if (typeof value === "boolean") {
                    bytes += 4;
                } else if (typeof value === "string") {
                    bytes += value.length * 2;
                } else if (typeof value === "number") {
                    bytes += 8;
                } else if (
                    typeof value === "object"
                    && objectList.indexOf(value) === -1
                ) {
                    objectList.push(value);
                    for (const i in value) {
                        stack.push(value[i]);
                    }
                }
            }

            return bytes;
        }

        req.upload.onprogress = (event: ProgressEvent) => {
            if (event.lengthComputable && progress) {
                progress(Math.ceil(((event.loaded) / event.total) * 100));
            }
        };

        req.onreadystatechange = () => {
            if (req.readyState !== 4) return;
            try {
                const response = JSON.parse(req.responseText);

                try {
                    setDeviceId(response.deviceId);

                    if (response.ok) {
                        resolve(response.result);
                        listenersDict["success"].forEach((hook) => hook(response.result, name, args));
                    } else {
                        reject(response.error);
                        listenersDict["fail"].forEach((hook) => hook(response.error, name, args));
                    }
                } catch (e) {
                    console.error(e);
                    reject({type: "Fatal", message: e.toString()});
                    listenersDict["fatal"].forEach((hook) => hook(e, name, args));
                }
            } catch (e) {
                console.error(e);
                reject({ type: "BadFormattedResponse", message: `Response couldn't be parsed as JSON (${req.responseText}):\n${e.toString()}` });
                listenersDict["fatal"].forEach((hook) => hook(e, name, args));
            }
        };

        req.send(JSON.stringify(body));
    });
}
