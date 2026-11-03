import { paletteSeeds } from "./diapason-theme";
/**
 * Markdown can't reach the build-time palette, so Diapason iframes in this article's body
 * declare `data-diapason-src` instead of `src`; this adds the page palette (the same CSS
 * variables extracted from the article image) as Diapason's `theme=` and starts the load.
 * Loaded by ./experiment.astro, so it only runs on this article.
 */
function initializeDiapasonEmbeds(): void {
    const frames = document.querySelectorAll<HTMLIFrameElement>("iframe[data-diapason-src]");
    if (!frames.length) return;
    const style = getComputedStyle(document.body);
    const role = (name: string) => style.getPropertyValue(`--${name}`).trim();
    let theme: string | undefined;
    try {
        theme = paletteSeeds(
            { accent: role("accent-light"), paper: role("paper-light") },
            { accent: role("accent-dark"), paper: role("paper-dark") },
        );
    } catch {
        theme = undefined; // No usable palette: Diapason falls back to its own default theme.
    }
    for (const frame of frames) {
        const url = new URL(frame.dataset.diapasonSrc!);
        if (theme) url.searchParams.set("theme", theme);
        frame.src = url.href;
    }
}
initializeDiapasonEmbeds();
