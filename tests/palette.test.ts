import test from "node:test";
import assert from "node:assert/strict";
import { createPalette, contrastRatio, paletteStyle, type RGB } from "../src/lib/palette.ts";

test("photo palettes keep text and links readable in both system themes", () => {
    for (const pixels of [
        [],
        [[128, 128, 128]],
        [[0, 0, 0]],
        [[255, 255, 255]],
        [
            [225, 193, 129],
            [83, 70, 31],
            [164, 136, 71],
        ],
        [
            [31, 40, 70],
            [240, 180, 45],
        ],
        [
            [255, 0, 0],
            [0, 0, 255],
        ],
    ] as RGB[][]) {
        const original = structuredClone(pixels);
        const palette = createPalette(pixels);
        for (const theme of [palette.light, palette.dark]) {
            for (const role of ["ink", "muted", "accent"] as const) {
                assert.ok(
                    contrastRatio(theme[role], theme.paper) >= 4.5,
                    `${role} ${JSON.stringify(theme)}`,
                );
            }
            assert.ok(contrastRatio(theme.accent, theme.accentInk) >= 4.5);
            for (const value of Object.values(theme)) assert.match(value, /^#[a-f0-9]{6}$/);
        }
        assert.deepEqual(pixels, original);
        assert.deepEqual(createPalette(pixels), palette);
    }
});
test("author accent overrides are preserved when readable and adapted when necessary", () => {
    const palette = createPalette([[225, 193, 129]], "#006b65");
    assert.equal(palette.light.accent, "#006b65");
    assert.ok(contrastRatio(palette.dark.accent, palette.dark.paper) >= 4.5);
    assert.throws(() => createPalette([], "red; background:url(x)"), /accent/i);
});
test("palette CSS contains independent roles for both themes and no arbitrary values", () => {
    const css = paletteStyle(createPalette([[225, 193, 129]]));
    assert.match(css, /--paper-light:#[a-f0-9]{6}/);
    assert.match(css, /--paper-dark:#[a-f0-9]{6}/);
    assert.match(css, /--accent-ink-dark:#[a-f0-9]{6}/);
    assert.doesNotMatch(css, /undefined|NaN/);
});
