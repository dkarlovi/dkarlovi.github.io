import { getCollection, type CollectionEntry } from "astro:content";
import { getArticles } from "./articles";
import { imagePalette } from "./image-palette";
import { defaultPalette, type ArticlePalette } from "./palette";
import { sitePath } from "./urls";

type Entry = CollectionEntry<"articles" | "pages" | "categories" | "series">;
const pagePaths: Record<string, string> = {
    home: "/",
    about: "/about",
    "article-collection": "/articles",
    "category-collection": "/categories",
    "series-collection": "/series-collection",
    "not-found": "/404.html",
};
const normalize = (path: string) => path.replace(/\/+$/, "") || "/";
let registry: Promise<Map<string, ArticlePalette>> | undefined;

async function buildRegistry() {
    const [articles, pages, categories, series] = await Promise.all([
        getArticles(),
        getCollection("pages"),
        getCollection("categories"),
        getCollection("series"),
    ]);
    const entries: Entry[] = [...articles, ...pages, ...categories, ...series];
    return new Map(
        await Promise.all(
            entries.flatMap((entry) => {
                const path =
                    entry.collection === "articles"
                        ? `/${entry.data.slug ?? entry.id}`
                        : entry.collection === "categories"
                          ? `/category/${entry.id}`
                          : entry.collection === "series"
                            ? `/series/${entry.id}`
                            : pagePaths[entry.id];
                if (!path) return [];
                if (entry.collection === "pages" && ["home", "about"].includes(entry.id)) {
                    return [Promise.resolve([normalize(sitePath(path)), defaultPalette] as const)];
                }
                const image = entry.data.image;
                const accent =
                    entry.collection === "articles" ? entry.data.experience.accent : undefined;
                return [
                    imagePalette(image?.url, accent).then(
                        (palette) => [normalize(sitePath(path)), palette] as const,
                    ),
                ];
            }),
        ),
    );
}

export async function pagePalette(path: string) {
    // Content edits in dev must resolve fresh entries; image sampling itself stays cached.
    const palettes = await (import.meta.env.DEV ? buildRegistry() : (registry ??= buildRegistry()));
    const normalized = normalize(path);
    const exact =
        normalized === normalize(sitePath("/404")) ? normalize(sitePath("/404.html")) : normalized;
    const key = palettes.has(exact) ? exact : exact.replace(/\/\d+$/, "");
    const palette = palettes.get(key);
    return palette ? { path: key, palette } : undefined;
}

export async function destinationPalette(href: string | URL, current: URL) {
    let target: URL;
    try {
        target = new URL(href, current);
    } catch {
        return undefined;
    }
    if (target.origin !== current.origin || !["http:", "https:"].includes(target.protocol))
        return undefined;
    return pagePalette(target.pathname);
}
