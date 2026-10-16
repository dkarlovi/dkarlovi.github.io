import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const base = (process.env.BROWSER_URL || "http://127.0.0.1:4321").replace(/\/$/, "");
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
    const page = await browser.newPage({
        viewport: { width: 1440, height: 1000 },
        reducedMotion: "no-preference",
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base + "/articles", { waitUntil: "load" });
    await page.clock.install();
    const button = page.locator("[data-read-disco]").first();
    const state = () => button.getAttribute("data-disco");
    const advance = (ms) => page.clock.runFor(ms);
    const name = await button.ariaSnapshot();
    await button.hover();
    const bounds = await button.boundingBox();
    assert.equal(await state(), "armed");
    await advance(900);
    assert.equal(await state(), "armed", "Short hovers stay quiet");
    await advance(200);
    assert.equal(await state(), "playing");
    await advance(3500);
    assert.equal(await state(), "finale");
    assert.equal(await button.locator(".read-more-chorus").textContent(), "JUST READ IT!");
    assert.equal(await button.ariaSnapshot(), name, "Accessible name never dances");
    await advance(1300);
    assert.equal(await state(), "finale", "Final line holds after its impact");
    await advance(700);
    assert.equal(await state(), "lights-out");
    const delays = await button
        .locator(".read-more-beam")
        .evaluateAll((beams) =>
            beams.map((beam) => beam.getAnimations().at(-1).effect.getTiming().delay),
        );
    assert.ok(delays[1] >= delays[0] + 360, "Second spotlight waits for the first to go out");
    await advance(800);
    assert.equal(await state(), "morph");
    await advance(700);
    assert.equal(await state(), "calm");
    assert.deepEqual(await button.boundingBox(), bounds, "Hit area stays fixed");
    assert.equal(await button.ariaSnapshot(), name);
    await advance(4800);
    assert.equal(await state(), "calm", "Five seconds of calm begin after morphing");
    await advance(200);
    assert.equal(await state(), "playing", "Persistent hover repeats");
    await page.mouse.move(0, 0);
    assert.equal(await state(), null);
    await advance(20000);
    assert.equal(await state(), null, "Leaving cancels delayed repeats");
    await button.focus();
    await advance(7400);
    assert.equal(await state(), "morph", "Keyboard focus discovers the same sequence");
    await page.keyboard.press("Escape");
    assert.equal(await state(), null, "Escape cancels even a half-complete morph");
    assert.equal(
        await button.evaluate(
            (el) =>
                el
                    .getAnimations({ subtree: true })
                    .filter((animation) => !(animation instanceof CSSTransition)).length,
        ),
        0,
    );
    await button.evaluate((el) => el.blur());
    await button.hover();
    await advance(1500);
    await page.emulateMedia({ reducedMotion: "reduce" });
    // Media events arrive on a rendering frame, independently of mocked timers.
    await new Promise((resolve) => setTimeout(resolve, 100));
    await advance(100);
    assert.equal(await state(), null, "Enabling reduced motion cancels an active party");
    await page.mouse.move(0, 0);
    await button.hover();
    await advance(10000);
    assert.equal(await state(), null, "Reduced motion stays static");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await new Promise((resolve) => setTimeout(resolve, 100));
    await page.mouse.move(0, 0);
    // Check both themes across mobile, ordinary desktops and the scaled 4K layout.
    for (const width of [320, 390, 1440, 3840]) {
        await page.setViewportSize({ width, height: 1000 });
        for (const colorScheme of ["light", "dark"]) {
            await page.emulateMedia({ colorScheme });
            await button.hover();
            await advance(1100);
            assert.equal(await state(), "playing");
            assert.equal(
                await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
                false,
            );
            await page.mouse.move(0, 0);
        }
    }
    const href = await button.getAttribute("href");
    await button.click();
    await page.waitForURL(base + href);
    assert.deepEqual(errors, []);
    await page.close();
    const plain = await browser.newPage({ javaScriptEnabled: false });
    await plain.goto(base + "/articles");
    assert.ok(
        await plain.locator(".read-more-idle").first().isVisible(),
        "No-JS label remains readable",
    );
    await plain.locator("[data-read-disco]").first().click();
    await plain.waitForURL(base + href);
    await plain.close();
    const touch = await browser.newPage({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
    });
    await touch.goto(base + "/articles");
    await touch.locator("[data-read-disco]").first().tap();
    await touch.waitForURL(base + href);
    await touch.close();
    console.log(
        "Read-more disco passed: held finale, sequential lights, morph, full calm/repeat, cancellation, keyboard, reduced motion, stable hit area, 4 widths × 2 themes, and normal/no-JS/touch navigation.",
    );
} finally {
    await browser.close();
}
