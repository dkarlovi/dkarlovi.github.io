import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const base = process.env.BROWSER_URL || "http://127.0.0.1:4321";
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
    for (const width of [1440, 390]) {
        const page = await browser.newPage({
            viewport: { width, height: 900 },
            colorScheme: "light",
        });
        page.setDefaultTimeout(20_000);
        await page.goto(`${base}/introducing-diapason`);
        // Wait for the eagerly loaded editor, rather than checking before embeds initialize.
        await page
            .frameLocator(".heading-experiment iframe")
            .getByRole("button", { name: "Play MIDI", exact: true })
            .waitFor();
        const hero = page.locator(".heading-experiment diapason-studio iframe");
        const editorUrl = new URL(await hero.getAttribute("src"));
        assert.equal(editorUrl.searchParams.get("scheme"), "dark");
        assert.equal(await hero.getAttribute("allow"), "midi");
        const studio = page.locator(".article-content diapason-studio iframe");
        await studio.scrollIntoViewIfNeeded();
        await page
            .frameLocator(".article-content diapason-studio iframe")
            .locator(".capture-step-title")
            .waitFor({ state: "attached" });
        const studioUrl = new URL(await studio.getAttribute("src"));
        assert.equal(studioUrl.searchParams.get("afterRecording"), "edit");
        assert.equal(studioUrl.searchParams.get("scheme"), "light");
        assert.equal(await studio.getAttribute("allow"), "microphone; midi");
        assert.equal(
            await page.evaluate(
                () => document.documentElement.scrollWidth > innerWidth,
            ),
            false,
        );

        // A system theme change must reach the running studio without navigating it.
        const frame = await (await studio.elementHandle()).contentFrame();
        const navigations = [];
        page.on("framenavigated", (changed) => {
            if (changed === frame) navigations.push(frame.url());
        });
        const before = await frame.evaluate(() => performance.timeOrigin);
        await page.emulateMedia({ colorScheme: "dark" });
        await frame.waitForFunction(
            () =>
                getComputedStyle(document.documentElement).colorScheme ===
                "dark",
        );
        assert.equal(
            await frame.evaluate(() => performance.timeOrigin),
            before,
        );
        assert.deepEqual(navigations, []);
        await page.close();
        console.log(
            `Diapason: direct embeds, permissions, responsive sizing and live theme at ${width}px`,
        );
    }
} finally {
    await browser.close();
}
