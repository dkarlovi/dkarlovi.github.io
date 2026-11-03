import { test } from "node:test";
import assert from "node:assert/strict";
import {
    articleIdFromPath,
    selectArticles,
    validateArticleDates,
    validateSlugs,
} from "../src/lib/publication.ts";
const entry = (id: string, date: string, draft = false) => ({
    id,
    data: { publishedAt: new Date(date), draft },
});
test("filters drafts before sorting and sorts newest first without mutating", () => {
    const entries = [
        entry("old", "2020-01-01"),
        entry("draft", "2026-01-01", true),
        entry("new", "2025-01-01"),
    ];
    assert.deepEqual(
        selectArticles(entries, false).map((e) => e.id),
        ["new", "old"],
    );
    assert.deepEqual(
        selectArticles(entries, true).map((e) => e.id),
        ["draft", "new", "old"],
    );
    assert.equal(entries[0].id, "old");
});
test("rejects duplicate, reserved and unsafe public slugs", () => {
    assert.throws(
        () =>
            validateSlugs([
                { id: "one", data: { slug: "same" } },
                { id: "two", data: { slug: "same" } },
            ]),
        /same/,
    );
    for (const slug of ["about", "articles", "404", "sitemap.xml", "../bad"])
        assert.throws(
            () => validateSlugs([{ id: "one", data: { slug } }]),
            new RegExp(slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        );
    assert.doesNotThrow(() => validateSlugs([{ id: "2026-01-01-hello", data: { slug: "hello-world" } }]));
});
test("taxonomy IDs must match editable slugs", async () => {
    const { validateTaxonomyIds } = await import("../src/lib/publication.ts");
    assert.throws(
        () => validateTaxonomyIds([{ id: "engineering", data: { slug: "renamed" } }]),
        /engineering.*renamed/,
    );
    assert.doesNotThrow(() =>
        validateTaxonomyIds([{ id: "engineering", data: { slug: "engineering" } }]),
    );
});
test("article IDs come from YYYY/YYYY-MM-DD-name/index.md folders", () => {
    assert.equal(articleIdFromPath("2026/2026-11-03-my-article/index.md"), "2026-11-03-my-article");
    for (const path of [
        "2026-11-03-my-article.md",
        "2026/2026-11-03-my-article.md",
        "2025/2026-11-03-my-article/index.md",
        "2026/2026-11-03-My-Article/index.md",
        "2026/2026-11-03-my-article/notes.md",
        "2026/my-article/index.md",
    ])
        assert.throws(() => articleIdFromPath(path), /YYYY\/YYYY-MM-DD-name/, path);
});
test("article folder dates must match publishedAt", () => {
    const entry = (id: string, date: string) => ({ id, data: { publishedAt: new Date(date) } });
    assert.doesNotThrow(() => validateArticleDates([entry("2026-11-03-a", "2026-11-03")]));
    assert.throws(
        () => validateArticleDates([entry("2026-11-03-a", "2026-11-04")]),
        /2026-11-03-a.*2026-11-04/,
    );
});
