// Mirrors the glob loaders in src/content.config.ts for scripts that read content sources directly.
import { readdirSync } from "node:fs";
import { basename, dirname, join } from "node:path";
export const contentRoot = "content";
/** @returns {{ id: string, path: string }[]} */
export function contentFiles(kind) {
    const root = join(contentRoot, kind);
    return readdirSync(root, { recursive: true })
        .filter((name) => name.endsWith(".md"))
        .sort()
        .map((name) => {
            const path = join(root, name);
            return {
                path,
                id: kind === "articles" ? basename(dirname(path)) : basename(path, ".md"),
            };
        });
}
