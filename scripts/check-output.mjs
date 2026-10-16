import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { load } from "cheerio";
import { parse } from "yaml";
const site = new URL(process.env.BASE_URL || "https://dkarlovi.github.io");
const base = site.pathname.replace(/\/$/, "");
const homeData = parse(readFileSync('src/content/pages/home.md', 'utf8').split('---')[1]);
const content = {};
for (const kind of ["articles", "categories", "series"]) {
    content[kind] = readdirSync(`src/content/${kind}`)
        .filter((name) => name.endsWith(".md"))
        .map((name) => ({
            id: name.slice(0, -3),
            ...parse(readFileSync(`src/content/${kind}/${name}`, "utf8").split("---")[1]),
        }));
}
content.articles = content.articles.filter((article) => !article.draft);
const pages = new Map();
function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) walk(path);
        else if (path.endsWith(".html")) pages.set(path, load(readFileSync(path, "utf8")));
    }
}
walk("dist");
const fileFor = (pathname) => {
    const path = decodeURIComponent(pathname)
        .replace(new RegExp(`^${base}(?=/|$)`), "")
        .replace(/^\//, "");
    const file = join("dist", path);
    if (existsSync(file) && extname(file)) return file;
    return join(file, "index.html");
};
const get = (path) => {
    const file = path === "/404" ? "dist/404.html" : fileFor(base + path);
    assert.ok(pages.has(file), `Missing route: ${path}`);
    return pages.get(file);
};
// A selected section must remain selected on its child routes.
for (const [path, title] of [
    ["/articles", "Writing"],
    ["/about", "About"],
    ["/categories", "Categories"],
    ["/category/devops", "Categories"],
    ["/series-collection", "Series"],
    ["/series/a-specific-series", "Series"],
]) {
    const $ = get(path);
    for (const nav of $(".site-nav").toArray()) {
        assert.equal($(nav).find("a[aria-current]").text(), title, `Active navigation: ${path}`);
    }
}
{
    const $ = get("/category/devops");
    assert.equal($(".subject-link[aria-current]").length, 1);
    assert.equal($(".subject-link[aria-current]").attr("href"), base + "/category/devops");
    assert.equal(get("/articles")(".subject-link[aria-current]").length, 0);
}
const knownIllustrativeLinks = new Set(["/blob/master/LICENSE"]);
let checkedLinks = 0;
for (const [file, $] of pages) {
    if ($('meta[http-equiv="refresh"]').length) continue;
    assert.equal($("html").attr("lang"), "en", file);
    assert.ok($("title").text().includes(homeData.title), file);
    assert.ok($('meta[name="description"]').attr("content"), file);
    assert.ok(
        $('link[rel="canonical"]')
            .attr("href")
            ?.startsWith(site.origin + base),
        file,
    );
    assert.ok(
        $('meta[property="og:image"]')
            .attr("content")
            ?.startsWith(site.origin + base + "/"),
        file,
    );
    assert.equal(
        $('meta[name="google-site-verification"]').attr("content"),
        "soyKXJT1zDtOEO_En0NAjPTu58_HXX5stvmF5MnVrEA",
    );
    assert.equal($('[data-category="analytics"][data-src]').length, 1);
    if (homeData.footer) {
        assert.equal($('footer .eyebrow').text(), homeData.footer.eyebrow);
        assert.equal($('footer h2').text(), homeData.footer.title);
        assert.ok($('footer').text().includes(homeData.footer.tagline));
    }
    assert.equal($('meta[name="color-scheme"]').attr("content"), "light dark");
    assert.equal(
        $("[data-bs-toggle], .navbar, .offcanvas").length,
        0,
        `${file}: no Bootstrap controls`,
    );
    $(".card").each((index, card) => {
        for (const image of $(card).find("img").toArray()) {
            assert.equal(
                $(image).attr("loading"),
                index < 2 ? "eager" : "lazy",
                `${file}: card ${index + 1} image loading`,
            );
        }
    });
    for (const element of $(
        "a[href], img[src], script[src], link[href], source[srcset]",
    ).toArray()) {
        const raw =
            $(element).attr("href") ??
            $(element).attr("src") ??
            $(element).attr("srcset")?.split(/[ ,]/)[0];
        if (!raw || /^(mailto:|tel:|data:|javascript:)/.test(raw)) continue;
        const canonical = $('link[rel="canonical"]').attr("href") || site.href;
        const target = new URL(raw, canonical);
        if (target.origin !== site.origin) continue;
        if (knownIllustrativeLinks.has(target.pathname)) continue;
        assert.ok(
            target.pathname === base || target.pathname.startsWith(base + "/"),
            `Missing base in ${file}: ${raw}`,
        );
        const targetFile = fileFor(target.pathname);
        assert.ok(
            existsSync(targetFile),
            `Broken local target in ${file}: ${raw} -> ${targetFile}`,
        );
        if (target.hash && pages.has(targetFile)) {
            const destination = pages.get(targetFile);
            assert.ok(
                destination("[id]")
                    .toArray()
                    .some(
                        (el) =>
                            destination(el).attr("id") === decodeURIComponent(target.hash.slice(1)),
                    ),
                `Broken anchor in ${file}: ${raw}`,
            );
        }
        checkedLinks++;
    }
}
assert.equal(get("/")(".card").length, Math.min(content.articles.length, 4));
const recent = [...content.articles]
    .filter((a) => !a.draft)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 4);
assert.deepEqual(
    get("/")(".card h3 a")
        .toArray()
        .map((el) => get("/")(el).text()),
    recent.map((a) => a.title),
);
assert.equal(get("/articles")(".card").length, Math.min(content.articles.length, 20));
for (const article of content.articles) {
    const $ = get(`/${article.slug ?? article.id}`);
    assert.equal($("main h1").first().text(), article.title);
    assert.equal(
        $("main .card-meta img").attr("loading"),
        "eager",
        `${article.id}: author avatar loading`,
    );
    assert.ok($("main").text().includes(article.summary), article.slug ?? article.id);
    assert.ok($(".content").text().trim().length > 0, article.slug ?? article.id);
    if (article.image) {
        assert.equal($(".photo-palette span").length, 4, "visible image-derived palette");
        assert.match($("body").attr("style"), /--paper-dark:#[a-f0-9]{6}/);
    }
    assert.ok(
        $("time").attr("datetime") === new Date(article.publishedAt).toISOString().slice(0, 10),
    );
}
for (const kind of ["categories", "series"]) {
    for (const taxonomy of content[kind]) {
        const members = content.articles.filter(
            (a) => !a.draft && (a[kind] ?? []).includes(taxonomy.id),
        );
        assert.equal(
            get(`/${kind === "categories" ? "category" : "series"}/${taxonomy.slug}`)(".card")
                .length,
            Math.min(members.length, 20),
            taxonomy.slug,
        );
    }
}
get("/categories");
get("/series-collection");
get("/about");
get("/404");
// Validate semantic blocks against editable source instead of freezing sample articles.
for (const article of content.articles) {
    const source = readFileSync(`src/content/articles/${article.id}.md`, "utf8");
    const $ = get(`/${article.slug ?? article.id}`);
    assert.equal(
        $(".content figure").length,
        [...source.matchAll(/^\s*<figure>/gm)].length,
        article.id,
    );
    assert.equal(
        $(".content figcaption").length,
        [...source.matchAll(/^\s*<figcaption>/gm)].length,
        article.id,
    );
    assert.equal(
        $(".content details").length,
        [...source.matchAll(/^\s*<details(?:\s|>)/gm)].length,
        article.id,
    );
}
const sitemap = readFileSync("dist/sitemap-0.xml", "utf8");
assert.ok(existsSync("dist/sitemap-index.xml"));
for (const article of content.articles.filter((a) => !a.draft))
    assert.ok(sitemap.includes(`${site.origin}${base}/${article.slug ?? article.id}`));
for (const icon of JSON.parse(readFileSync("dist/site.webmanifest", "utf8")).icons)
    assert.ok(existsSync(join("dist", icon.src)), icon.src);
assert.ok(readFileSync("dist/browserconfig.xml", "utf8").includes("mstile-150x150.png"));
// Verify Vite resolved fonts too: successful HTML alone would miss broken icon URLs.
for (const filename of readdirSync("dist/_astro").filter((name) => name.endsWith(".css"))) {
    const css = readFileSync(join("dist/_astro", filename), "utf8");
    for (const [, src] of css.matchAll(/url\(["']?([^\s)"']+)["']?\)/g)) {
        if (/^(data:|https?:)/.test(src)) continue;
        const file = src.startsWith("/") ? fileFor(src) : join("dist/_astro", src);
        assert.ok(existsSync(file), `Missing CSS asset: ${src}`);
    }
}
console.log(
    `Validated ${pages.size} HTML pages, ${checkedLinks} local targets, ${content.articles.length} published articles, taxonomy counts, images, fonts, metadata and sitemap.`,
);
