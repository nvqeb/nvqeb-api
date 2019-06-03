import axios from "axios";
import { randomBytes } from "crypto";
import sizeOf = require("image-size");
import sharp = require("sharp");

// Shared
import strings from "../../shared/strings";

// Types
import { err } from "./error";
import * as types from "./types";
import * as shared from "./shared";

export async function cropImage(ctx: types.Context, src: string, crop: types.Crop | null): Promise<types.Image> {
    return await _cropImage(src, crop);
}

export async function _cropImage(src: string, crop: types.Crop | null): Promise<types.Image> {
    const imageType = src.includes(".png") ?
        types.ImageFormat.png :
        types.ImageFormat.jpeg;

    if (src.includes(shared.staticUrl)) {
        return await _uploadImage(
            await shared._readFile(`${shared.directoryPath}/${src.substr(src.indexOf(shared.staticUrl) + shared.staticUrl.length + 1)}`),
            imageType,
            crop,
        );
    } else {
        const result = await axios.get(src, {
            responseType: "arraybuffer",
        });

        return await _uploadImage(
            new Buffer(result.data),
            imageType,
            crop,
        );
    }
}

export async function _uploadUncertainImage(uncertainImage: types.UncertainImage, format?: types.ImageFormat | null): Promise<types.Image> {
    return (
        uncertainImage.bytes ?
            await _uploadImage(
                uncertainImage.bytes,
                format || types.ImageFormat.jpeg,
                uncertainImage.crop,
            ) :
            (uncertainImage.image && uncertainImage.crop ?
                await _cropImage(
                    uncertainImage.image.url,
                    uncertainImage.crop,
                ) :
                uncertainImage.image)
    ) || err.MissingArgument(strings.error.missingArgument.image);
}

export async function uploadImage(ctx: types.Context, data: Buffer, format: types.ImageFormat, crop: types.Crop | null): Promise<types.Image> {
    return await _uploadImage(data, format, crop);
}

export async function _uploadImage(data: Buffer, format: types.ImageFormat, crop: types.Crop | null): Promise<types.Image> {
    return {
        thumb: await uploadThumbImage(data, format, crop),
        ...(await uploadImageWith(1000, data, format, crop)),
    };
}

export async function uploadSimpleImage(data: Buffer, format: types.ImageFormat, crop: types.Crop | null): Promise<types.SimpleImage> {
    return await uploadImageWith(1000, data, format, crop);
}

export async function uploadThumbImage(data: Buffer, format: types.ImageFormat, crop: types.Crop | null): Promise<types.SimpleImage> {
    return await uploadImageWith(400, data, format, crop);
}

async function uploadImageWith(side: number, data: Buffer, format: types.ImageFormat, crop: types.Crop | null): Promise<types.SimpleImage> {
    const initialSize = sizeOf(data);
    side = Math.min(Math.max(initialSize.height, initialSize.width), side);

    let sharpInstance = format === types.ImageFormat.png ?
        sharp(data).png() :
        sharp(data).jpeg();

    if (crop) {
        sharpInstance = sharpInstance.extract({
            left: crop.x,
            top: crop.y,
            width: crop.width,
            height: crop.height,
        });
    }

    sharpInstance = sharpInstance.resize(side, side, { fit: "inside" });

    data = await sharpInstance.toBuffer();

    const size = sizeOf(data);

    return {
        url: (await shared._uploadFile(
            `images/${
                randomBytes(32).toString("hex")
            }.${format}`,
            data,
        )).url,
        width: size.width,
        height: size.height,
    };
}
