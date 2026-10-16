import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { parse } from "yaml";
test("Pages CMS uses the same native IDs and image paths as Astro", () => {
    const config = parse(readFileSync(".pages.yml", "utf8"));
    assert.equal(config.media.input, "src/assets/uploads");
    assert.equal(config.media.output, "../../assets/uploads");
    const articles = config.content.find((c: any) => c.name === "articles");
    for (const entry of config.content.filter((c: any) =>
        c.fields.some((f: any) => f.name === "image"),
    )) {
        const image = entry.fields.find((f: any) => f.name === "image");
        const url = image.fields.find((f: any) => f.name === "url");
        assert.equal(url.type, "image", `${entry.name}: native upload inside image.url`);
        assert.equal(url.required, true);
    }
    assert.equal(articles.path, "src/content/articles");
    for (const kind of ["categories", "series"]) {
        const field = articles.fields.find((f: any) => f.name === kind);
        assert.equal(field.type, "reference");
        assert.equal(field.options.value, "{fields.slug}");
        assert.equal(field.options.multiple, true);
        const collection = config.content.find((c: any) => c.name === kind);
        assert.ok(existsSync(collection.path));
    }
    for (const page of config.content.filter((c: any) => c.type === "file"))
        assert.ok(existsSync(page.path));
});
