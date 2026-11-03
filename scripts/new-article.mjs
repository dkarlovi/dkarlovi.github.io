// Scaffold a draft article: npm run new -- "My article title" [--date YYYY-MM-DD] [--slug custom-slug]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";
import { parse, stringify } from "yaml";
import { contentFiles } from "./content-files.mjs";

function fail(message) {
    console.error(message);
    process.exit(1);
}

const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { date: { type: "string" }, slug: { type: "string" } },
});
let title = positionals.join(" ").trim();
if (!title) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    title = (await rl.question("Title: ")).trim();
    rl.close();
}
if (!title) fail('Usage: npm run new -- "My article title" [--date YYYY-MM-DD] [--slug name]');

const date = values.date ?? new Date().toISOString().slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)))
    fail(`Invalid --date ${date}; use YYYY-MM-DD`);
const slug =
    values.slug ??
    title
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    fail(`Cannot derive a slug from "${title}"; pass --slug`);

const taken = contentFiles("articles").find(
    ({ path }) => parse(readFileSync(path, "utf8").split("---")[1]).slug === slug,
);
if (taken) fail(`Slug "${slug}" is already used by ${taken.path}`);

const dir = `content/articles/${date.slice(0, 4)}/${date}-${slug}`;
const file = `${dir}/index.md`;
if (existsSync(dir)) fail(`${dir} already exists`);

const categories = contentFiles("categories").map(({ id }) => id);
const frontmatter = stringify({
    title,
    slug,
    summary: "TODO: one or two sentences shown in listings and previews.",
    publishedAt: date,
    draft: true,
    categories: [],
    series: [],
    keywords: [],
});
mkdirSync(dir, { recursive: true });
writeFileSync(
    file,
    `---\n${frontmatter}# categories: ${categories.join(", ")}\n# image:\n#     url: ./cover.jpeg\n#     alt: Describe the photo\n---\n\nStart writing here. Put this article's images next to this file and reference them as ./name.jpeg.\n`,
);
console.log(
    `Created ${file}\nPreview with npm run dev at /${slug} (drafts only appear in dev; remove draft: true to publish).`,
);
