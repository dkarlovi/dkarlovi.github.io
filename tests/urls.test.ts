import { test } from "node:test";
import assert from "node:assert/strict";
import { pathWithBase } from "../src/lib/urls.ts";

test("internal URLs use the path prefix even when BASE_URL contains a full site URL", () => {
    assert.equal(pathWithBase("/articles", "/"), "/articles");
    assert.equal(pathWithBase("/articles", "/blog/"), "/blog/articles");
    assert.equal(pathWithBase("/articles", "https://example.com/blog/"), "/blog/articles");
    assert.equal(pathWithBase("/", "https://example.com/blog/"), "/blog/");
    assert.equal(
        pathWithBase("https://external.example/article", "/blog/"),
        "https://external.example/article",
    );
    assert.equal(pathWithBase("#writing", "/blog/"), "/blog/#writing");
});
