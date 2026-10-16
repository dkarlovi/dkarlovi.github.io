import sharp from "sharp";
import { resolve } from "node:path";
import type { ImageMetadata } from "astro";
import { createPalette, type RGB, type ArticlePalette } from "./palette";
// Match Astro's imported original to its source, not a BASE_URL-dependent public URL.
const sources = import.meta.glob<{ default: ImageMetadata }>(
    "/src/assets/**/*.{jpeg,jpg,png,webp,avif,gif,tiff,svg}",
    { eager: true },
);
const cache = new Map<string, Promise<ArticlePalette>>();
export function imagePalette(image?: ImageMetadata, accent?: string): Promise<ArticlePalette> {
    if (!image) return Promise.resolve(createPalette([], accent));
    const key = image.src + (accent ?? "");
    if (!cache.has(key)) cache.set(key, sample(image, accent));
    return cache.get(key)!;
}
async function sample(image: ImageMetadata, accent?: string): Promise<ArticlePalette> {
    const entry = Object.entries(sources).find(([, module]) => module.default.src === image.src);
    if (!entry) throw new Error(`Cannot locate palette source for ${image.src}`);
    const source = resolve(process.cwd(), "." + entry[0]);
    const { data, info } = await sharp(source)
        .rotate()
        .resize(80, 60, { fit: "inside" })
        .removeAlpha()
        .toColourspace("srgb")
        .raw()
        .toBuffer({ resolveWithObject: true });
    const pixels: RGB[] = [];
    for (let i = 0; i < data.length; i += info.channels)
        pixels.push([data[i], data[i + 1], data[i + 2]]);
    return createPalette(pixels, accent);
}
