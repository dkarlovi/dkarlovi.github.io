// Read Astro's actual dev-toolbar Audit panel, including its own visibility filtering.
import { chromium } from "@playwright/test";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { parse } from "yaml";
const origin = process.env.ASTRO_DEV_URL || "http://localhost:4321";
const paths = ["/", "/about", "/articles", "/categories", "/series-collection", "/404"];
for (const [kind, prefix] of [
    ["articles", ""],
    ["categories", "/category"],
    ["series", "/series"],
]) {
    for (const name of (await readdir(`src/content/${kind}`)).filter((name) =>
        name.endsWith(".md"),
    )) {
        const data = parse((await readFile(`src/content/${kind}/${name}`, "utf8")).split("---")[1]);
        paths.push(
            `${prefix}/${kind === "articles" ? (data.slug ?? name.slice(0, -3)) : name.slice(0, -3)}`,
        );
    }
}
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
try {
    for (const viewport of [
        { width: 1440, height: 1000 },
        { width: 390, height: 844 },
    ]) {
        const page = await browser.newPage({ viewport });
        // External example images are not required to inspect local accessible names.
        await page.route("**/*", (route) =>
            route.request().resourceType() === "image" && !route.request().url().startsWith(origin)
                ? route.abort()
                : route.continue(),
        );
        for (const path of paths) {
            await page.goto(`${origin}${path}`, { waitUntil: "networkidle" });
            // Astro's auditor waits for image loads. Scroll lazy images into view first
            // without altering their loading attributes or the audit's rules.
            await page.locator("img").evaluateAll(async (images) => {
                for (const img of images) {
                    if (img.complete) continue;
                    img.scrollIntoView();
                    await img.decode().catch(() => {});
                }
                scrollTo(0, 0);
            });
            const toolbar = page.locator("astro-dev-toolbar");
            const panel = page.locator("astro-dev-toolbar-audit-window");
            if (!(await panel.isVisible()))
                await toolbar.locator('button[data-app-id="astro:audit"]').click();
            await panel.waitFor({ state: "visible" });
            const issues = await panel.evaluate((panel) =>
                panel.audits.map(({ rule, auditedElement: el }) => ({
                    code: rule.code,
                    message: typeof rule.message === "function" ? rule.message(el) : rule.message,
                    element: el.outerHTML
                        .replace(/srcset="[^"]*"/g, "")
                        .replace(/src="[^"]*"/g, "")
                        .slice(0, 600),
                })),
            );
            results.push({ viewport: viewport.width, path, issues });
            await writeFile(
                process.env.AUDIT_REPORT || "/tmp/astro-dev-audit.json",
                JSON.stringify(results, null, 2),
            );
            console.log(
                JSON.stringify({
                    viewport: viewport.width,
                    path,
                    count: issues.length,
                    codes: [...new Set(issues.map((issue) => issue.code))],
                }),
            );
        }
        await page.close();
    }
} finally {
    await browser.close();
}
await writeFile(
    process.env.AUDIT_REPORT || "/tmp/astro-dev-audit.json",
    JSON.stringify(results, null, 2),
);
const accessibility = results.flatMap((result) =>
    result.issues.filter((issue) => issue.code.startsWith("a11y-")),
);
const performance = results.flatMap((result) =>
    result.issues.filter((issue) => issue.code.startsWith("perf-")),
);
console.log(
    `Audited ${results.length} page/viewports: ${accessibility.length} accessibility warnings, ${performance.length} performance hints.`,
);
if (accessibility.length || (process.argv.includes("--strict") && performance.length))
    process.exitCode = 1;
