import type { AstroComponentFactory } from "astro/runtime/server/index.js";
/**
 * Heading experiments live next to their article:
 *   content/articles/YYYY/<id>/experiment.astro  markup and <script> (scripts load only where rendered)
 *   content/articles/YYYY/<id>/experiment.css    optional styles, linked only on that article
 *
 * Astro assigns component <style> blocks by module graph, not by what renders, so a <style>
 * in any experiment.astro would ship on every article page. Styles therefore go in the
 * sibling experiment.css, and a <style> block in an experiment is rejected at build time.
 */
const components = import.meta.glob<{ default: AstroComponentFactory }>(
    "/content/articles/*/*/experiment.astro",
);
const sources = import.meta.glob<string>("/content/articles/*/*/experiment.astro", {
    query: "?raw",
    import: "default",
    eager: true,
});
const stylesheets = import.meta.glob<string>("/content/articles/*/*/experiment.css", {
    query: "?url",
    import: "default",
    eager: true,
});
for (const [path, source] of Object.entries(sources))
    if (/<style[\s>]/.test(source))
        throw new Error(
            `${path}: move <style> into experiment.css next to it (styles would leak onto every article)`,
        );
const find = <T>(files: Record<string, T>, articleId: string, name: string) =>
    Object.entries(files).find(([path]) => path.endsWith(`/${articleId}/${name}`))?.[1];
export interface Experiment {
    component: AstroComponentFactory;
    stylesheet?: string;
}
export async function loadExperiment(articleId: string): Promise<Experiment | undefined> {
    const load = find(components, articleId, "experiment.astro");
    if (!load) return undefined;
    return {
        component: (await load()).default,
        stylesheet: find(stylesheets, articleId, "experiment.css"),
    };
}
