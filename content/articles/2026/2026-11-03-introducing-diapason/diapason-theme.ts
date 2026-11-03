/**
 * Diapason's packed `theme=` value (see its README, "Packing a theme yourself"): version byte,
 * presence mask, then RGB bytes per supplied seed, as unpadded base64url. Runs in Node and browsers.
 */
export interface DiapasonSeeds {
    primary: string;
    neutral?: string;
    secondary?: string;
}
const roles = ["primary", "neutral", "secondary"] as const;
export function packDiapasonTheme(light: DiapasonSeeds, dark?: DiapasonSeeds): string {
    const bytes = [1, 0];
    [light, dark].forEach((mode, modeIndex) => {
        if (!mode) return;
        roles.forEach((role, roleIndex) => {
            const color = mode[role];
            if (color === undefined) return;
            if (!/^#[0-9a-f]{6}$/i.test(color))
                throw new Error(`Invalid Diapason ${role} seed: ${color}`);
            bytes[1] |= 1 << (modeIndex * 3 + roleIndex);
            for (const offset of [1, 3, 5])
                bytes.push(parseInt(color.slice(offset, offset + 2), 16));
        });
    });
    return btoa(String.fromCharCode(...bytes))
        .replaceAll("+", "-")
        .replaceAll("/", "_")
        .replace(/=+$/, "");
}
/** Seeds from an article palette: accent drives actions/notes, paper drives quiet surfaces. */
export function paletteSeeds(
    light: { accent: string; paper: string },
    dark: { accent: string; paper: string },
): string {
    return packDiapasonTheme(
        { primary: light.accent, neutral: light.paper },
        { primary: dark.accent, neutral: dark.paper },
    );
}
