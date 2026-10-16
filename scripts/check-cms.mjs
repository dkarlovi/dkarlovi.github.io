// Build real CMS-style files through Astro: no mocked collections or image resolver.
import assert from "node:assert/strict";
import { writeFileSync, readFileSync, existsSync, unlinkSync, copyFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { load } from "cheerio";
import { parse, stringify } from "yaml";
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
    const headerFields =
        "image: ../../assets/uploads/cms-fixture.png\nimageCredit: CMS header attribution\n";
    writeFileSync(
        category,
        readFileSync(category, "utf8").replace("summary:", headerFields + "summary:"),
    );
    write(
        "src/content/series/cms-fixture.md",
        `---\ntitle: CMS series\nslug: cms-fixture\nsummary: A series with its own photograph\n${headerFields}---\n`,
    );
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
    const aboutPath = "src/content/pages/about.md";
    originals.set(aboutPath, readFileSync(aboutPath, "utf8"));
    const [, aboutFrontmatter, ...aboutBody] = originals.get(aboutPath).split("---");
    const aboutData = parse(aboutFrontmatter);
    aboutData.image = "../../assets/uploads/cms-fixture.png";
    aboutData.homepageHero = {
        roles: "Engineer · Writer",
        introduction: "An introduction edited in About content.",
    };
    aboutData.linkLabel = 'Meet Dalibor';
    aboutData.eyebrow = 'Meet the author';
    aboutData.homepageTeaser = {
        title: "A CMS-edited introduction",
        summary: "This introduction comes from the About entry.",
    };
    writeFileSync(aboutPath, `---\n${stringify(aboutData)}---${aboutBody.join("---")}`);
    const homePath = "src/content/pages/home.md";
    originals.set(homePath, readFileSync(homePath, "utf8"));
    const [, homeFrontmatter, ...homeBody] = originals.get(homePath).split("---");
    const homeData = parse(homeFrontmatter);
    homeData.brandTagline = "Ideas and experiments";
    homeData.title = "CMS Author";
    homeData.footer = {
        eyebrow: "CMS footer eyebrow",
        title: "Keep exploring.\nKeep making.",
        tagline: "CMS footer description",
        copyright: "CMS author · Somewhere",
    };
    homeData.hero = {
        firstLine: "CMS",
        secondLine: "Author.",
        imageAlt: "CMS portrait",
        footnote: "CMS hero footnote",
    };
    homeData.ticker = ["CMS ticker one", "CMS ticker two"];
    homeData.writing = { title: "CMS writing heading" };
    homeData.gallery = {
        title: "CMS gallery",
        credit: "CMS photographer",
        photos: [
            {
                image: "../../assets/uploads/cms-fixture.png",
                alt: "CMS gallery photo",
                caption: "CMS caption",
            },
        ],
    };
    writeFileSync(homePath, `---\n${stringify(homeData)}---${homeBody.join("---")}`);
    const notFoundPath = "src/content/pages/not-found.md";
    originals.set(notFoundPath, readFileSync(notFoundPath, "utf8"));
    writeFileSync(
        notFoundPath,
        `---\n${stringify({
            title: "CMS error page",
            summary: "CMS missing page explanation",
            eyebrow: "CMS error label",
            heading: "CMS missing page heading",
            linkLabel: "CMS home link",
        })}---\n`,
    );
    const archivePath = "src/content/pages/article-collection.md";
    originals.set(archivePath, readFileSync(archivePath, "utf8"));
    const [, archiveFrontmatter, ...archiveBody] = originals.get(archivePath).split("---");
    const archiveData = parse(archiveFrontmatter);
    archiveData.linkLabel = "CMS archive button";
    archiveData.discussionHeading = "CMS discussion heading";
    writeFileSync(archivePath, `---\n${stringify(archiveData)}---${archiveBody.join("---")}`);
    build();
    assert.match(html('')('.home-actions a').first().text(), /CMS archive button/);
    assert.match(html('')('.home-actions a').last().text(), /Meet Dalibor/);
    assert.ok(html('')('.home-writing .section-heading a').text().includes(archiveData.title));
    assert.equal(html('articles')('.collection-hero .eyebrow').text(), 'CMS archive button');
    assert.equal(html('categories')('.collection-hero .eyebrow').text(), 'CMS archive button');
    assert.match(html("cms-fixture-0")(".article-end > .button-link").text(), /CMS archive button/);
    assert.equal(
        html("choose-boring")(".discussion-links .eyebrow").text(),
        "CMS discussion heading",
    );
    const notFound = load(readFileSync("dist/404.html", "utf8"));
    assert.equal(notFound("main h1").text(), "CMS missing page heading");
    assert.match(notFound("main").text(), /CMS missing page explanation/);
    assert.match(notFound("main a").text(), /CMS home link/);
    assert.match(html("")(".brand").text(), /CMS Author/);
    assert.equal(html("cms-fixture-0")(".hero-author .author strong").text(), "CMS Author");
    assert.equal(html("")(".home-hero-copy > .eyebrow").text(), "Engineer · Writer");
    assert.equal(html("")(".home-introduction").text(), "An introduction edited in About content.");
    assert.equal(html("")(".brand small").text(), "Ideas and experiments");
    assert.equal(html("")(".home-hero h1").text(), "CMSAuthor.");
    assert.equal(html("")(".hero-footnote").text(), "CMS hero footnote");
    assert.equal(html("")(".ticker").text(), "CMS ticker oneCMS ticker two");
    assert.equal(html("")(".home-writing h2").text(), "CMS writing heading");
    assert.equal(html("")(".visuals-section h2").text(), "CMS gallery");
    assert.equal(html("")(".visuals-grid img").attr("alt"), "CMS gallery photo");
    assert.match(html("")(".visuals-grid img").attr("src"), /cms-fixture/);
    assert.equal(html("")(".visuals-grid figcaption").text(), "CMS caption");
    for (const route of ["", "about", "cms-fixture-0"]) {
        const $ = html(route);
        assert.equal($("footer .eyebrow").text(), "CMS footer eyebrow");
        assert.equal($("footer h2").text(), "Keep exploring.\nKeep making.");
        assert.match($("footer").text(), /CMS footer description/);
        assert.match($("footer").text(), /CMS author · Somewhere/);
    }
    assert.equal(html("about")(".brand small").text(), "Ideas and experiments");
    assert.equal(html("")(".about-note .eyebrow").text(), "Meet the author");
    assert.equal(html("")(".about-note h2").text(), "A CMS-edited introduction");
    assert.equal(
        html("")(".about-note .about-note-summary").text(),
        "This introduction comes from the About entry.",
    );
    assert.match(html("")(".about-note .button-link").text(), /^Meet Dalibor/);
    assert.match(
        html("cms-fixture-0")(".author img").attr("src"),
        /cms-fixture/,
        "Author avatar follows the About image",
    );
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
    assert.equal(
        html(`articles/${lastPage}`)(".desktop-navigation a[aria-current]").text(),
        "Writing",
    );
    assert.equal(html("cms-fixture-0")(".desktop-navigation a[aria-current]").text(), "Writing");
    for (const route of ["category/cms-fixture", "series/cms-fixture"]) {
        const $ = html(route);
        assert.match($(".collection-cover img").attr("src"), /cms-fixture/);
        assert.match($(".collection-cover .photo-credit").text(), /CMS header attribution/);
        assert.equal($(".collection-cover .photo-palette span").length, 4);
    }
    assert.ok(
        html("articles")(".collection-cover img").length,
        "All articles uses its content photo",
    );
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
    for (const name of [
        "home",
        "about",
        "article-collection",
        "category-collection",
        "series-collection",
    ]) {
        const path = `src/content/pages/${name}.md`;
        if (!originals.has(path)) originals.set(path, readFileSync(path, "utf8"));
        writeFileSync(path, originals.get(path).replace(/^image:.*\n/m, ""));
    }
    for (const path of [category, "src/content/series/cms-fixture.md"]) {
        originals.set(path, readFileSync(path, "utf8"));
        writeFileSync(path, originals.get(path).replace(/^image:.*\n/m, ""));
    }
    build();
    assert.equal(
        html("cms-fixture-0")(".author img").length,
        0,
        "Optional About image leaves a text author link",
    );
    assert.equal(
        html("cms-fixture-0")(".hero-author .author strong").text(),
        parse(readFileSync("src/content/pages/home.md", "utf8").split("---")[1]).title,
    );
    for (const route of [
        "articles",
        "categories",
        "series-collection",
        "category/cms-fixture",
        "series/cms-fixture",
    ]) {
        const $ = html(route);
        assert.equal($(".collection-cover").length, 0, `Optional header image: ${route}`);
        assert.equal($(".collection-heading h1").length, 1, `Heading fallback: ${route}`);
        assert.equal($("body").hasClass("has-hero"), false, `Normal header placement: ${route}`);
    }
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
