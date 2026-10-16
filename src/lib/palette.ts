/** Small, deterministic CIELAB palette generator; no browser or image dependency. */
export type RGB = readonly [number, number, number];
export interface PaletteRoles {
    paper: string;
    ink: string;
    muted: string;
    accent: string;
    accentInk: string;
    panel: string;
    line: string;
}
export interface ArticlePalette {
    light: PaletteRoles;
    dark: PaletteRoles;
}
const hex = (rgb: readonly number[]) =>
    "#" + rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
const rgb = (value: string): RGB =>
    [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16)) as unknown as RGB;
const linear = (v: number) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const luminance = (value: string) => {
    const c = rgb(value).map(linear);
    return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
};
export function contrastRatio(a: string, b: string): number {
    const x = luminance(a),
        y = luminance(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
function lab(value: RGB) {
    const c = value.map(linear),
        f = (v: number) => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116);
    const x = f((c[0] * 0.4124564 + c[1] * 0.3575761 + c[2] * 0.1804375) / 0.95047);
    const y = f(c[0] * 0.2126729 + c[1] * 0.7151522 + c[2] * 0.072175);
    const z = f((c[0] * 0.0193339 + c[1] * 0.119192 + c[2] * 0.9503041) / 1.08883);
    const a = 500 * (x - y),
        b = 200 * (y - z);
    return {
        L: 116 * y - 16,
        C: Math.hypot(a, b),
        h: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360,
    };
}
function lch(L: number, chroma: number, hue: number): string {
    const angle = (hue * Math.PI) / 180;
    let c: number[] = [];
    // Preserve hue/lightness; bring chroma into the sRGB gamut rather than clipping.
    for (let attempt = 0; attempt < 80; attempt++) {
        const y = (L + 16) / 116,
            x = y + (chroma * Math.cos(angle)) / 500,
            z = y - (chroma * Math.sin(angle)) / 200;
        const inv = (v: number) => (v ** 3 > 0.008856 ? v ** 3 : (v - 16 / 116) / 7.787);
        const X = 0.95047 * inv(x),
            Y = inv(y),
            Z = 1.08883 * inv(z);
        c = [
            3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z,
            -0.969266 * X + 1.8760108 * Y + 0.041556 * Z,
            0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z,
        ];
        if (c.every((v) => v >= 0 && v <= 1)) break;
        chroma *= 0.9;
    }
    return hex(
        c.map((v) =>
            Math.max(
                0,
                Math.min(
                    255,
                    255 *
                        (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.max(0, v) ** (1 / 2.4) - 0.055),
                ),
            ),
        ),
    );
}
export function createPalette(pixels: readonly RGB[], accent?: string): ArticlePalette {
    if (accent && !/^#[a-f0-9]{6}$/i.test(accent))
        throw new Error("Article accent must be a six-digit hex colour");
    const bins = new Map<string, { count: number; sum: number[] }>();
    for (const pixel of pixels) {
        const key = pixel.map((v) => Math.floor(v / 24)).join(",");
        const bin = bins.get(key) ?? { count: 0, sum: [0, 0, 0] };
        bin.count++;
        pixel.forEach((v, i) => (bin.sum[i] += v));
        bins.set(key, bin);
    }
    const groups = [...bins.values()]
        .map((b) => ({
            ...lab(b.sum.map((v) => v / b.count) as unknown as RGB),
            n: b.count,
        }))
        .filter((b) => b.L > 12 && b.L < 90 && b.C > 6);
    const ambient = [...groups].sort((a, b) => b.n - a.n)[0] ?? {
        h: 85,
        C: 18,
    };
    const score = (b: (typeof groups)[number]) =>
        Math.sqrt(b.n) * b.C * Math.sin((b.L * Math.PI) / 100);
    const highlight = accent
        ? lab(rgb(accent))
        : ([...groups].sort((a, b) => score(b) - score(a))[0] ?? ambient);
    const h = ambient.h,
        ah = highlight.h,
        C = Math.min(28, Math.max(8, ambient.C * 0.6)),
        ac = Math.min(52, Math.max(25, highlight.C));
    const light: PaletteRoles = {
        paper: lch(96, Math.min(C, 9), h),
        ink: lch(14, Math.min(C, 12), h),
        muted: lch(37, Math.min(C, 18), h),
        accent: lch(37, ac, ah),
        accentInk: lch(99, 1, ah),
        panel: lch(89, Math.min(C, 20), h),
        line: lch(62, Math.min(C, 19), h),
    };
    const dark: PaletteRoles = {
        paper: lch(10, Math.min(C, 11), h),
        ink: lch(94, Math.min(C, 10), h),
        muted: lch(75, Math.min(C, 16), h),
        accent: lch(80, Math.min(ac, 40), ah),
        accentInk: lch(10, Math.min(C, 11), h),
        panel: lch(18, Math.min(C, 16), h),
        line: lch(48, Math.min(C, 17), h),
    };
    if (accent) {
        const value = accent.toLowerCase();
        if (
            contrastRatio(value, light.paper) >= 4.5 &&
            contrastRatio(value, light.accentInk) >= 4.5
        )
            light.accent = value;
        if (contrastRatio(value, dark.paper) >= 4.5 && contrastRatio(value, dark.accentInk) >= 4.5)
            dark.accent = value;
    }
    return { light, dark };
}
export function paletteStyle(palette: ArticlePalette): string {
    return Object.entries(palette)
        .flatMap(([mode, roles]) =>
            Object.entries(roles).map(
                ([role, value]) =>
                    `--${role.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())}-${mode}:${value}`,
            ),
        )
        .join(";");
}
