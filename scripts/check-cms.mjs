// Build real CMS-style files through Astro: no mocked collections or image resolver.
import assert from "node:assert/strict";
import { writeFileSync, readFileSync, existsSync, unlinkSync, copyFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { load } from "cheerio";
import { parse } from "yaml";
import { readdirSync } from "node:fs";
const created = [];
const originals = new Map();
function write(path, text) {
    assert.ok(!existsSync(path), `Refuse to overwrite ${path}`);
    writeFileSync(path, text);
    created.push(path);
}
function build(expectSuccess = true) {
    const result = spawnSync(process.execPath, ["node_modules/astro/bin/astro.mjs", "build"], {
        encoding: "utf8",
        env: process.env,
    });
    assert.ifError(result.error);
    assert.equal(result.signal, null, `Build terminated: ${result.signal}`);
    const output = result.stdout + result.stderr;
    if (expectSuccess) assert.equal(result.status, 0, output);
    else assert.notEqual(result.status, 0, "Build must reject invalid content");
    return output;
}
function html(path) {
    return load(readFileSync(`dist/${path ? path + "/" : ""}index.html`, "utf8"));
}
const category = "src/content/categories/cms-fixture.md";
const draft = "src/content/articles/cms-fixture-draft.md";
try {
    write(
        category,
        "---\ntitle: CMS fixture\nslug: cms-fixture\nsummary: Empty except for a draft\n---\n",
    );
    write(
        draft,
        "---\ntitle: Private CMS draft\nsummary: Not published\npublishedAt: 2030-01-01\ndraft: true\ncategories: [cms-fixture]\n---\nPrivate body\n",
    );
    const media = "src/assets/uploads/cms-fixture.png";
    assert.ok(!existsSync(media));
    copyFileSync("src/assets/uploads/testing-speech-recognition-robot.png", media);
    created.push(media);
    write(
        "src/content/articles/cms-fixture-plain.md",
        "---\ntitle: Plain CMS article\nsummary: Optional fields omitted\npublishedAt: 2026-01-01\n---\nPlain article body\n",
    );
    const publishedCount = readdirSync("src/content/articles")
        .filter((name) => name.endsWith(".md"))
        .filter(
            (name) =>
                !parse(readFileSync(`src/content/articles/${name}`, "utf8").split("---")[1]).draft,
        ).length;
    const fixtureCount = 20 - (publishedCount % 20) + 1;
    const lastPage = Math.ceil((publishedCount + fixtureCount) / 20);
    for (let i = 0; i < fixtureCount; i++)
        write(
            `src/content/articles/cms-fixture-${i}.md`,
            `---\ntitle: CMS fixture ${i}\nsummary: A new article written by a CMS\npublishedAt: 2026-01-01\nimage: ../../assets/uploads/cms-fixture.png\ncategories: [programming]\n---\nNew Markdown image:\n\n![CMS upload](../../assets/uploads/cms-fixture.png)\n`,
        );
    const themed = "src/content/articles/cms-fixture-0.md";
    writeFileSync(
        themed,
        readFileSync(themed, "utf8").replace(
            "categories: [programming]",
            'categories: [programming]\nexperience:\n    headingExperiment: terrain\n    stylesheet: terrain\n    accent: "#006b65"\n    imagePosition: 60% 35%\n    imageCredit: CMS image attribution',
        ),
    );
    build();
    assert.equal(html("cms-fixture-0")("[data-heading-experiment]").length, 1);
    assert.equal(html("cms-fixture-0")('link[href*="terrain"]').length, 1);
    assert.equal(
        html("cms-fixture-plain")('[data-heading-experiment], link[href*="terrain"]').length,
        0,
    );
    assert.equal(html("cms-fixture-0")(".photo-palette span").length, 4);
    assert.match(html("cms-fixture-0")(".photo-credit").text(), /CMS image attribution/);
    assert.ok(!existsSync("dist/cms-fixture-draft/index.html"), "No draft route");
    assert.equal(html("articles")(".card").length, 20);
    assert.equal(html(`articles/${lastPage}`)(".card").length, 1);
    assert.ok(!existsSync(`dist/articles/${lastPage + 1}/index.html`));
    assert.ok(html("articles")('a[href$="/articles/2"]').length > 0);
    assert.ok(
        html(`articles/${lastPage}`)(
            `a[href$="${lastPage === 2 ? "/articles" : "/articles/" + (lastPage - 1)}"]`,
        ).length > 0,
    );
    assert.equal(
        html("category/cms-fixture")(".card").length,
        0,
        "Native paginate preserves empty taxonomy page",
    );
    assert.match(html("categories")("main").text(), /CMS fixture \(0\)/);
    assert.equal(html("cms-fixture-0")(".content img").attr("alt"), "CMS upload");
    assert.match(html("cms-fixture-0")(".content img").attr("src"), /_astro\//);
    assert.doesNotMatch(readFileSync("dist/sitemap-0.xml", "utf8"), /cms-fixture-draft/);
    const sourceTests = spawnSync(
        process.execPath,
        ["--experimental-strip-types", "scripts/test.mjs"],
        { encoding: "utf8" },
    );
    assert.equal(sourceTests.status, 0, sourceTests.stdout + sourceTests.stderr);
    // Images are editable/optional; removing one must not break unrelated pages.
    for (const name of ["home", "about", "category-collection", "series-collection"]) {
        const path = `src/content/pages/${name}.md`;
        originals.set(path, readFileSync(path, "utf8"));
        writeFileSync(path, originals.get(path).replace(/^image:.*\n/m, ""));
    }
    build();
    assert.ok(
        html("")("body").hasClass("without-portrait"),
        "Readable fallback without optional page images",
    );
    assert.equal(
        html("about")("main h1").text(),
        parse(originals.get("src/content/pages/about.md").split("---")[1]).title,
    );
    for (const [path, source] of originals) writeFileSync(path, source);
    originals.clear();
    const bad = "src/content/articles/cms-fixture-invalid.md";
    write(
        bad,
        "---\ntitle: Invalid\nsummary: Invalid native reference\npublishedAt: 2026-01-01\ncategories: [missing-category]\n---\nInvalid\n",
    );
    assert.match(build(false), /missing-category/);
    unlinkSync(bad);
    created.splice(created.indexOf(bad), 1);
    write(
        bad,
        "---\ntitle: Missing media\nsummary: Broken upload\npublishedAt: 2026-01-01\nimage: ../../assets/uploads/missing-upload.png\n---\nInvalid\n",
    );
    assert.match(build(false), /missing-upload/);
    unlinkSync(bad);
    created.splice(created.indexOf(bad), 1);
    const existingFilename = readdirSync("src/content/articles")
        .filter((name) => name.endsWith(".md") && !name.startsWith("cms-fixture"))
        .sort()[0];
    const existing = parse(
        readFileSync(`src/content/articles/${existingFilename}`, "utf8").split("---")[1],
    );
    const duplicateSlug = existing.slug ?? existingFilename.slice(0, -3);
    write(
        bad,
        `---\ntitle: Duplicate URL\nsummary: Duplicate URL override\npublishedAt: 2026-01-01\nslug: ${duplicateSlug}\n---\nInvalid\n`,
    );
    assert.ok(build(false).includes(duplicateSlug));
    unlinkSync(bad);
    created.splice(created.indexOf(bad), 1);
    for (const [setting, expected] of [
        ["accent: red", /six-digit hex/],
        ["imagePosition: 200% 45%", /coordinates/],
        ["headingExperiment: unknown", /headingExperiment/],
        ["stylesheet: missing-style", /unknown experience stylesheet/],
    ]) {
        write(
            bad,
            `---\ntitle: Invalid article experience\nsummary: Reject invalid author settings\npublishedAt: 2026-01-01\nexperience:\n    ${setting}\n---\nInvalid\n`,
        );
        assert.match(build(false), expected);
        unlinkSync(bad);
        created.splice(created.indexOf(bad), 1);
    }
    writeFileSync(
        category,
        "---\ntitle: Mismatched taxonomy\nsummary: Invalid ID\nslug: wrong-id\n---\n",
    );
    assert.match(build(false), /cms-fixture.*wrong-id/);
    console.log(
        "CMS fixture builds passed: native pagination boundary, optional fields/page images, image upload, draft exclusion, empty taxonomy, source tests, optional article experiences/palettes/stylesheets, and invalid reference/media/slug/experience rejection.",
    );
} finally {
    for (const [path, source] of originals) writeFileSync(path, source);
    for (const path of created.reverse()) unlinkSync(path);
    build();
}
