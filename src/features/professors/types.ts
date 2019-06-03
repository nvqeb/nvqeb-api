import { IncomingMessage } from "http";

export interface Context {
    call: DBApiCall;
    device: DBDevice;
    req: IncomingMessage;
    startTime: Date;
    staging: boolean;
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
