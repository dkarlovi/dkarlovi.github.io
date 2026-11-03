import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parse } from "yaml";
import { contentFiles } from "../scripts/content-files.mjs";
import { articleIdFromPath } from "../src/lib/publication.ts";
test("native content is portable Markdown with valid local media and collection IDs", () => {
    for (const kind of ["articles", "pages", "categories", "series"]) {
        const files = contentFiles(kind);
        assert.ok(files.length > 0);
        for (const { path } of files) {
            const root = dirname(path);
            const source = readFileSync(path, "utf8");
            const [, frontmatter] = source.split("---");
            const data = parse(frontmatter);
            if (data.image) {
                assert.equal(typeof data.image, "object", `${path}: structured image metadata`);
                assert.ok(existsSync(resolve(root, data.image.url)), data.image.url);
            }
            for (const photo of data.gallery?.photos ?? []) {
                assert.ok(existsSync(resolve(root, photo.image.url)), photo.image.url);
            }
            for (const category of data.categories ?? [])
                assert.ok(existsSync(`content/categories/${category}.md`), category);
            for (const series of data.series ?? [])
                assert.ok(existsSync(`content/series/${series}.md`), series);
            for (const match of source.matchAll(/(?:src=["']|!\[[^\]]*\]\()(\.{1,2}\/[^"')\s]+)/g))
                assert.ok(existsSync(resolve(root, match[1])), `${path}: ${match[1]}`);
        }
    }
});
test("articles live in dated folders and declare their public slug", () => {
    for (const { path } of contentFiles("articles")) {
        const id = articleIdFromPath(path.replace(/^content\/articles\//, ""));
        const data = parse(readFileSync(path, "utf8").split("---")[1]);
        assert.equal(typeof data.slug, "string", `${path}: slug is required`);
        assert.ok(
            id.startsWith(`${data.publishedAt}-`),
            `${path}: folder date matches publishedAt`,
        );
    }
});
