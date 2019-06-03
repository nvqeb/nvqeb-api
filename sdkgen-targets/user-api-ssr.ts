import { LocalizedStringsMethods } from "localized-strings";
import { UAParser } from "ua-parser-js";

import axios, { AxiosResponse } from "axios";
import * as Cookies from "js-cookie";
import { NextContext } from "next";

let baseUrl: string = "localhost:8000";
let strings: (LocalizedStringsMethods & any) | null = null;

export const isServer = typeof window === "undefined";

export function setUrl(url: string) {
    baseUrl = url;
}

export function setStrings(newStrings: (LocalizedStringsMethods & {}) | null): void {
    strings = newStrings;
}

interface Options {
    progress?: (progress: number) => void;
    device?: Optional<Device>;
    ctx?: Context;
}

interface Context extends NextContext {
    deviceId?: string | null;
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
    ExpiredResetPasswordToken = "ExpiredResetPasswordToken",
    MissingPermission = "MissingPermission",
    EmailAlreadyInUse = "EmailAlreadyInUse",
    InvalidEmail = "InvalidEmail",
    NickAlreadyInUse = "NickAlreadyInUse",
    InvalidNick = "InvalidNick",
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
        case ErrorType.ExpiredResetPasswordToken: {
            return strings ? strings["enum"]["ErrorType"]["ExpiredResetPasswordToken"] || ErrorType.ExpiredResetPasswordToken : ErrorType.ExpiredResetPasswordToken;
        }
        case ErrorType.MissingPermission: {
            return strings ? strings["enum"]["ErrorType"]["MissingPermission"] || ErrorType.MissingPermission : ErrorType.MissingPermission;
        }
        case ErrorType.EmailAlreadyInUse: {
            return strings ? strings["enum"]["ErrorType"]["EmailAlreadyInUse"] || ErrorType.EmailAlreadyInUse : ErrorType.EmailAlreadyInUse;
        }
        case ErrorType.InvalidEmail: {
            return strings ? strings["enum"]["ErrorType"]["InvalidEmail"] || ErrorType.InvalidEmail : ErrorType.InvalidEmail;
        }
        case ErrorType.NickAlreadyInUse: {
            return strings ? strings["enum"]["ErrorType"]["NickAlreadyInUse"] || ErrorType.NickAlreadyInUse : ErrorType.NickAlreadyInUse;
        }
        case ErrorType.InvalidNick: {
            return strings ? strings["enum"]["ErrorType"]["InvalidNick"] || ErrorType.InvalidNick : ErrorType.InvalidNick;
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
        ErrorType.ExpiredResetPasswordToken,
        ErrorType.MissingPermission,
        ErrorType.EmailAlreadyInUse,
        ErrorType.InvalidEmail,
        ErrorType.NickAlreadyInUse,
        ErrorType.InvalidNick,
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
        translateErrorType(ErrorType.ExpiredResetPasswordToken),
        translateErrorType(ErrorType.MissingPermission),
        translateErrorType(ErrorType.EmailAlreadyInUse),
        translateErrorType(ErrorType.InvalidEmail),
        translateErrorType(ErrorType.NickAlreadyInUse),
        translateErrorType(ErrorType.InvalidNick),
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

export async function uploadImage(image: Buffer, format: ImageFormat | null, crop: Crop | null, options?: Options): Promise<Image> {
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

    const ret = await makeRequest({name: "uploadImage", args, options});

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

export async function cropImage(src: string, crop: Crop, options?: Options): Promise<Image> {
    const args = {
        src: src,
        crop: {
            x: crop.x || 0,
            y: crop.y || 0,
            width: crop.width || 0,
            height: crop.height || 0,
        },
    };

    const ret = await makeRequest({name: "cropImage", args, options});

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

export async function uploadFile(file: UploadFile, options?: Options): Promise<File> {
    const args = {
        file: {
            bytes: file.bytes.toString("base64"),
            name: file.name,
        },
    };

    const ret = await makeRequest({name: "uploadFile", args, options});

    return {
        name: ret.name,
        url: ret.url,
    };
}

export async function ping(options?: Options): Promise<string> {

    const ret = await makeRequest({name: "ping", args: {}, options});

    return ret;
}

export async function setPushToken(token: string, options?: Options): Promise<void> {
    const args = {
        token: token,
    };

await makeRequest({name: "setPushToken", args, options});

    return undefined;
}

//////////////////////////////////////////////////////

let fallbackDeviceId: string | null = null;

interface Device {
    id: string | null;
    type: "web" | "ssr";
    platform: Platform | null;
    screen: Screen | null;
    version: string;
    language: string | null;
}

interface Platform {
    browser?: string;
    browserVersion?: string;
    os?: string;
    osVersion?: string;
}

interface Screen {
    width: number;
    height: number;
}

function setDeviceId(deviceId: string, ctx?: Context) {
    if (!isServer) {
        fallbackDeviceId = deviceId;

        try {
            Cookies.set("deviceId", deviceId);
            localStorage.setItem("deviceId", deviceId);
        } catch (e) {}
    } else {
        if (ctx) {
            ctx.deviceId = deviceId;
        }
    }
}

function getDeviceId(ctx?: Context): string | null {
    if (!isServer) {
        try {
            return localStorage.getItem("deviceId") || fallbackDeviceId;
        } catch (e) {}

        return fallbackDeviceId;
    } else {
        return ctx ? (ctx.deviceId ? ctx.deviceId : null) : null;
    }
}

function device(ctx?: Context) {
    let platform: Platform | null = null;

    if (!isServer) {
        const parser = new UAParser();
        parser.setUA(navigator.userAgent);
        const agent = parser.getResult();

        platform = {
            browser: agent.browser.name,
            browserVersion: agent.browser.version,
            os: agent.os.name,
            osVersion: agent.os.version
        };
    }

    const device: Device = {
        id: getDeviceId(ctx),
        type: !isServer ? "web" : "ssr",
        platform: platform,
        screen: !isServer ? {
            width: screen.width,
            height: screen.height
        } : null,
        version: !isServer && document.currentScript ?
            (document.currentScript as HTMLScriptElement).src :
            "",
        language: !isServer ?
            navigator.language :
            null,
    };

    return device;
}

function randomBytesHex(len: number) {
    let hex = "";

    for (let i = 0; i < 2 * len; ++i)
        hex += "0123456789abcdef"[Math.floor(Math.random() * 16)];

    return hex;
}

export interface ListenerTypes {
    fail: (e: Error, name: string, args: any) => void;
    fatal: (e: Error, name: string, args: any) => void;
    success: (res: string, name: string, args: any) => void;
}

type HookArray = Array<ListenerTypes[Listenables]>;
export type Listenables = keyof ListenerTypes;
export type ListenersDict = { [k in Listenables]: Array<ListenerTypes[k]> };

const listenersDict: ListenersDict = {
    fail: [],
    fatal: [],
    success: [],
};

export function addEventListener(listenable: Listenables, hook: ListenerTypes[typeof listenable]) {
    const listeners: HookArray = listenersDict[listenable];
    listeners.push(hook);
}

export function removeEventListener(listenable: Listenables, hook: ListenerTypes[typeof listenable]) {
    const listeners: HookArray = listenersDict[listenable];
    listenersDict[listenable] = listeners.filter(h => h !== hook) as any;
}

async function makeRequest({name, args, options}: {name: string, args: any, options?: Options}) {
    const deviceData = device(
        options ? options.ctx : undefined
    );

    if (options && options.device) {
        const device = options.device;

        if (device.id)
            deviceData.id = device.id;

        if (device.type)
            deviceData.type = device.type;

        if (device.platform)
            deviceData.platform = device.platform;

        if (device.screen)
            deviceData.screen = device.screen;

        if (device.version)
            deviceData.version = device.version;

        if (device.language)
            deviceData.language = device.language;
    }

    return new Promise<any>((resolve, reject) => {
        const requestUrl = `${baseUrl.startsWith("http") || baseUrl.startsWith("localhost") ?
            "" :
            "https://"
        }${baseUrl}/${name}`;

        const body = {
            id: randomBytesHex(8),
            device: deviceData,
            name: name,
            args: args
        };

        axios.post(
            requestUrl,
            body,
            {
                onUploadProgress: (p: {loaded?: number, total?: number}) => {
                    if (p.loaded && p.total && options && options.progress) {
                        options.progress(Math.ceil(((p.loaded / p.total) * 100)));
                    }
                },
                validateStatus: () => true,
            },
        ).then((res: Response<{deviceId: string, ok: boolean, result: any | null, error: {type: ErrorType, message: string} | null}>) => {
            const response = res.data;

            try {
                setDeviceId(
                    response.deviceId,
                    options ? options.ctx : undefined
                );

                if (response.ok) {
                    resolve(response.result);
                    if (!isServer) {
                        listenersDict["success"].forEach(hook => hook(response.result, name, args));
                    }
                } else {
                    reject(response.error);
                    if (!isServer) {
                        listenersDict["fail"].forEach(hook => hook(response.error as any, name, args));
                    }
                }
            } catch (e) {
                console.error(e);

                reject({type: "Fatal", message: e.toString()});
                if (!isServer) {
                    listenersDict["fatal"].forEach(hook => hook(e, name, args));
                }
            }
        }).catch((e: any) => {
            console.error(e);

            reject({
                type: "BadFormattedResponse",
                message: `Response couldn't be parsed as JSON:\n${
                    typeof e === "object" ? JSON.stringify(e) : e.toString()
                }`
            });
            if (!isServer) {
                listenersDict["fatal"].forEach(hook => hook(e, name, args));
            }
        });
    });
}

type Optional<T> = {
    [P in keyof T]?: T[P]
};

interface Response<T> extends AxiosResponse {
    data: T;
}
