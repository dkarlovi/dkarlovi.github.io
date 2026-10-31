import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import sharp from "sharp";
import { parse } from "yaml";
import { createPalette, defaultPalette, contrastRatio } from "../../src/lib/palette.ts";

const root = fileURLToPath(new URL("../../", import.meta.url));
const require = createRequire(resolve(root, "../diapason/package.json"));
// This throwaway study uses the same installed engine/version as Diapason.
const { Hct, DynamicScheme, SchemeTonalSpot, TonalPalette, QuantizerCelebi, Score,
    argbFromHex, argbFromRgb, hexFromArgb } = await import(pathToFileURL(require.resolve("@material/material-color-utilities")).href);

function material(seeds, warm) {
    return Object.fromEntries([false, true].map(dark => {
        const neutral = Hct.fromInt(argbFromHex(seeds.neutral));
        const scheme = new DynamicScheme({
            ...new SchemeTonalSpot(Hct.fromInt(argbFromHex(seeds.primary)), dark, 0),
            neutralPalette: TonalPalette.fromHueAndChroma(neutral.hue, Math.min(neutral.chroma, warm ? 14 : 6)),
            neutralVariantPalette: TonalPalette.fromHueAndChroma(neutral.hue, Math.min(neutral.chroma, warm ? 18 : 8)),
        });
        const hex = hexFromArgb;
        // Warm is deliberately a custom mapping; validate its actual pairs below.
        const palette = warm ? {
            paper: hex(scheme.neutralPalette.tone(dark ? 10 : 94)),
            ink: hex(scheme.neutralPalette.tone(dark ? 94 : 14)),
            muted: hex(scheme.neutralVariantPalette.tone(dark ? 75 : 37)),
            accent: hex(scheme.primaryPalette.tone(dark ? 80 : 37)),
            accentInk: hex(scheme.primaryPalette.tone(dark ? 10 : 99)),
            panel: hex(scheme.neutralPalette.tone(dark ? 18 : 89)),
            line: hex(scheme.neutralVariantPalette.tone(dark ? 57 : 47)),
        } : {
            paper: hex(scheme.surface), ink: hex(scheme.onSurface),
            muted: hex(scheme.onSurfaceVariant), accent: hex(scheme.primary),
            accentInk: hex(scheme.onPrimary), panel: hex(scheme.surfaceContainer),
            line: hex(scheme.outline),
        };
        return [dark ? "dark" : "light", palette];
    }));
}

const cache = new Map();
async function sample(path) {
    if (!path) return { pixels: [], seeds: { primary: "#b7352d", neutral: "#725c50" } };
    if (cache.has(path)) return cache.get(path);
    const { data, info } = await sharp(path).rotate().resize(80, 60, { fit: "inside" })
        .removeAlpha().toColourspace("srgb").raw().toBuffer({ resolveWithObject: true });
    const pixels = [];
    for (let i = 0; i < data.length; i += info.channels) pixels.push([data[i], data[i + 1], data[i + 2]]);
    const quantized = QuantizerCelebi.quantize(pixels.map(p => argbFromRgb(...p)), 32);
    const dominant = [...quantized].sort((a, b) => b[1] - a[1])[0][0];
    const [primary] = Score.score(quantized, { desired: 1, fallbackColorARGB: argbFromHex("#b7352d") });
    const result = { pixels, seeds: { primary: hexFromArgb(primary), neutral: hexFromArgb(dominant) } };
    cache.set(path, result);
    return result;
}

const pagePaths = { home: "/", about: "/about", "article-collection": "/articles",
    "category-collection": "/categories", "series-collection": "/series-collection", "not-found": "/404.html" };
const routes = {};
for (const collection of ["articles", "pages", "categories", "series"]) {
    const dir = resolve(root, "src/content", collection);
    for (const file of await readdir(dir)) {
        if (!file.endsWith(".md")) continue;
        const source = resolve(dir, file);
        const text = await readFile(source, "utf8");
        const entry = parse(text.split(/^---\s*$/m)[1]);
        const id = file.slice(0, -3);
        const route = collection === "articles" ? "/" + (entry.slug ?? id)
            : collection === "pages" ? pagePaths[id]
            : collection === "categories" ? "/category/" + id : "/series/" + id;
        if (!route) continue;
        const imagePath = entry.image?.url ? resolve(dirname(source), entry.image.url) : undefined;
        const home = collection === "pages" && ["home", "about"].includes(id);
        const { pixels, seeds: imageSeeds } = await sample(home ? undefined : imagePath);
        const seeds = { ...imageSeeds, ...(entry.experience?.accent ? { primary: entry.experience.accent } : {}) };
        const current = home ? defaultPalette : createPalette(pixels, entry.experience?.accent);
        routes[route] = { title: entry.title, seeds, current, material: material(seeds, false), warm: material(seeds, true) };
    }
}
const checks = [];
for (const [route, entry] of Object.entries(routes)) {
    for (const engine of ["current", "material", "warm"]) {
        entry[engine + "Contrast"] = {};
        for (const scheme of ["light", "dark"]) {
            const p = entry[engine][scheme];
            const pairs = [["Body / paper", "ink", "paper", 4.5], ["Muted / paper", "muted", "paper", 4.5],
                ["Accent / paper", "accent", "paper", 4.5], ["Accent fill", "accentInk", "accent", 4.5],
                ["Button text", "ink", "panel", 4.5], ["Control border / paper", "line", "paper", 3],
                ["Control border / panel", "line", "panel", 3]];
            entry[engine + "Contrast"][scheme] = pairs.map(([label, fg, bg, minimum]) => {
                const ratio = contrastRatio(p[fg], p[bg]);
                const result = { label, ratio: Number(ratio.toFixed(2)), minimum, pass: ratio >= minimum };
                if (!result.pass) checks.push({ route, engine, scheme, ...result });
                return result;
            });
        }
    }
}
const result = { generatedAt: new Date().toISOString(), engineVersion: "0.3.0",
    cases: ["/", "/articles", "/testing-speech-recognition", "/lying-coverage", "/choose-boring"], routes };
await writeFile(new URL("palettes.json", import.meta.url), JSON.stringify(result, null, 2) + "\n");
console.log(`Generated ${Object.keys(routes).length} route palettes. ${checks.length} below-threshold role pairs across all candidates (shown in the preview).`);
