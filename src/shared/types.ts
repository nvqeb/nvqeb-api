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
