// MARK: Libraries
import * as fs from "mz/fs";
import * as path from "path";
import { randomBytes } from "crypto";

// MARK: Shared
import strings from "../../shared/strings";

// MARK: Types
import * as types from "./types";
import { err } from "./error";

// MARK: Constants
export const staticUrl = process.env.STATIC_URL || process.exit(14);
export const directoryPath = process.env.STATIC_PATH || process.exit(14);

export async function uploadUncertainFile(uncertainFile: types.UncertainFile): Promise<types.File> {
    const file = uncertainFile.fileData ?
        await _uploadFile(uncertainFile.fileData.name, uncertainFile.fileData.bytes) :
        uncertainFile.file;

    if (!file) {
        throw err.MissingArgument(strings.error.missingArgument.image);
    }

    return validateFile(file);
}

export async function uploadFile(ctx: types.Context, file: types.UploadFile): Promise<types.File> {
    return await _uploadFile(file.name, file.bytes);
}

export async function _uploadFile(filename: string, data: Buffer): Promise<types.File> {
    filename = encodeURI(decodeURI(filename));

    return {
        name: filename,
        url: await __uploadFile(`${randomBytes(32).toString("hex")}/${filename}`, data),
    };
}

export async function __uploadFile(filename: string, data: Buffer): Promise<string> {
    await _writeFile(`${directoryPath}/${filename}`, data);

    return `https://${staticUrl}/${filename}`;
}

export async function _writeFile(filename: string, data: Buffer): Promise<void> {
    await _ensureDirectoryExists(path.dirname(filename));
    await fs.writeFile(filename, data);
}

export  async function _readFile(filename: string): Promise<Buffer> {
    return await fs.readFile(filename);
}

export async function _ensureDirectoryExists(dirname: string): Promise<void> {
    if (await fs.access(dirname).then(() => true).catch(() => false))
        return;

    await _ensureDirectoryExists(path.dirname(dirname));
    await fs.mkdir(dirname);
}

export async function _unlinkSync(unlinkPath: string): Promise<void>  {
    fs.unlinkSync(unlinkPath);
}

export function validateFile(file: types.File): types.File  {
    if (file) {
        file.name = encodeURI(decodeURI(file.name));
        file.url = encodeURI(decodeURI(file.url));
    }

    return file;
}
