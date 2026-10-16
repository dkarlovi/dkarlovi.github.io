import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const base = (process.env.BROWSER_URL || "http://127.0.0.1:4321").replace(/\/$/, "");
const output = process.env.BROWSER_OUTPUT || "/tmp/colour-field-browser";
await mkdir(output, { recursive: true });
const browser = await chromium.launch(
    process.env.CHROMIUM_PATH
        ? { executablePath: process.env.CHROMIUM_PATH }
        : { channel: "chrome", headless: true },
);
const paths = [
    "/",
    "/about",
    "/articles",
    "/categories",
    "/series-collection",
    "/category/programming",
    "/series/a-specific-series",
    "/testing-speech-recognition",
    "/symfony-feature-flags",
    "/lying-coverage",
    "/choose-boring",
    "/hello-world-again",
    "/testing-commonmark-features",
    "/404.html",
];
const results = [];
try {
    for (const viewport of [
        { width: 1440, height: 1000 },
        { width: 768, height: 1024 },
        { width: 390, height: 844 },
        { width: 320, height: 740 },
    ]) {
        const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
        await context.addInitScript(() =>
            Object.defineProperty(navigator, "webdriver", { get: () => false }),
        );
        const page = await context.newPage(),
            errors = [],
            missing = [];
        page.on("pageerror", (e) => errors.push(e.message));
        page.on("response", (r) => {
            if (r.url().startsWith(base) && r.status() >= 400 && !r.url().endsWith("/404.html"))
                missing.push(`${r.status()} ${r.url()}`);
        });
        await page.route(/https:\/\/(?:octodex\.github\.com|github\.com\/adam-p)/, (route) =>
            route.abort(),
        );
        await page.goto(base + "/", { waitUntil: "networkidle" });
        await page.getByRole("button", { name: "Manage preferences", exact: true }).click();
        await page
            .getByRole("heading", { name: "Consent Preferences Center", exact: true })
            .waitFor({ state: "visible" });
        await page.getByRole("button", { name: "Reject all", exact: true }).last().click();
        await page
            .getByRole("heading", { name: "Consent Preferences Center", exact: true })
            .waitFor({ state: "hidden" });
        assert.equal(
            await page.locator('script[src*="googletagmanager"]').count(),
            0,
            "analytics stays gated after rejection",
        );
        if (viewport.width <= 800) {
            await page.locator(".mobile-navigation > summary").click();
            await page
                .locator(".mobile-navigation")
                .getByRole("link", { name: "Categories", exact: true })
                .waitFor({ state: "visible" });
            await page.keyboard.press("Escape");
            assert.equal(await page.locator(".mobile-navigation").getAttribute("open"), null);
            await page.locator(".mobile-navigation > summary").click();
            await page
                .locator(".mobile-navigation")
                .getByRole("link", { name: "About", exact: true })
                .click();
            assert.ok(page.url().endsWith("/about"));
        }
        let views = 0;
        for (const scheme of ["light", "dark"]) {
            await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
            for (const path of paths) {
                await page.goto(base + path, { waitUntil: "networkidle" });
                await page.waitForFunction(
                    (wanted) => document.documentElement.dataset.scheme === wanted,
                    scheme,
                );
                assert.equal(
                    await page.evaluate(
                        () => document.documentElement.scrollWidth > innerWidth + 1,
                    ),
                    false,
                    `overflow ${viewport.width} ${scheme} ${path}`,
                );
                const broken = await page.locator("img").evaluateAll(async (images) => {
                    const local = images.filter((img) => img.src.startsWith(location.origin));
                    await Promise.all(
                        local.map(async (img) => {
                            img.loading = "eager";
                            try {
                                await img.decode();
                            } catch {}
                        }),
                    );
                    return local
                        .filter((img) => !img.complete || !img.naturalWidth)
                        .map((img) => img.src);
                });
                assert.deepEqual(broken, [], `local images ${path}`);
                if (path === "/testing-speech-recognition") {
                    assert.equal(await page.locator(".photo-palette span").count(), 4);
                    await page.locator(".article-content details>summary").first().click();
                    assert.ok(
                        await page.locator(".article-content details pre").first().isVisible(),
                    );
                    for (const pre of await page.locator(".article-content pre").all())
                        assert.ok(await pre.evaluate((el) => el.scrollWidth >= el.clientWidth));
                    for (const caption of await page.locator(".article-content figcaption").all())
                        assert.equal(
                            await caption.evaluate((el) => getComputedStyle(el).textAlign),
                            "center",
                        );
                    await page.locator(".article-content details>summary").first().click();
                }
                if (viewport.width === 1440 || viewport.width === 390)
                    await page.screenshot({
                        path: `${output}/${viewport.width}-${scheme}-${path.replaceAll("/", "_") || "home"}.png`,
                        fullPage: path === "/" || path === "/testing-speech-recognition",
                    });
                views++;
            }
        }
        await page.goto(base + "/", { waitUntil: "networkidle" });
        await page.emulateMedia({ colorScheme: "light" });
        await page.waitForFunction(() => document.documentElement.dataset.scheme === "light");
        await page.emulateMedia({ colorScheme: "dark" });
        await page.waitForFunction(() => document.documentElement.dataset.scheme === "dark");
        assert.deepEqual(errors, []);
        assert.deepEqual(missing, []);
        results.push({
            viewport,
            views,
            errors,
            missing,
            interactions: [
                "consent rejection",
                "native menu and Escape",
                "local images",
                "wide code/details/captions",
                "visible palette",
                "live system theme",
            ],
        });
        await context.close();
    }
    await writeFile(output + "/results.json", JSON.stringify(results, null, 2) + "\n");
    console.log(JSON.stringify(results, null, 2));
} finally {
    await browser.close();
}
