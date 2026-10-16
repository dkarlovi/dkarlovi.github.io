import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";
test("native content is portable Markdown with valid local media and collection IDs", () => {
    for (const kind of ["articles", "pages", "categories", "series"]) {
        const root = `src/content/${kind}`;
        const files = readdirSync(root).filter((f) => f.endsWith(".md"));
        assert.ok(files.length > 0);
        for (const file of files) {
            const source = readFileSync(`${root}/${file}`, "utf8");
            const [, frontmatter] = source.split("---");
            const data = parse(frontmatter);
            if (data.image) {
                assert.equal(typeof data.image, 'object', `${file}: structured image metadata`);
                assert.ok(existsSync(resolve(root, data.image.url)), data.image.url);
            }
            for (const photo of data.gallery?.photos ?? []) {
                assert.ok(existsSync(resolve(root, photo.image.url)), photo.image.url);
            }
            for (const category of data.categories ?? [])
                assert.ok(existsSync(`src/content/categories/${category}.md`), category);
            for (const series of data.series ?? [])
                assert.ok(existsSync(`src/content/series/${series}.md`), series);
            for (const match of source.matchAll(
                /(?:src=["']|\]\()((?:\.\.\/\.\.\/assets\/uploads\/)[^"')\s]+)/g,
            ))
                assert.ok(existsSync(resolve(root, match[1])), match[1]);
        }
    }
});
