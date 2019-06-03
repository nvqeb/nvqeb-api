import * as types from "../types";

export function image(image: RDatum<DBImage>): RDatum<types.Image> {
    return image;
}

export function simpleImage(simpleImage: RDatum<DBSimpleImage>): RDatum<types.SimpleImage> {
    return simpleImage;
}
