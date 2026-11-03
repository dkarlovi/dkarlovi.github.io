export function selectArticles<T extends { data: { publishedAt: Date; draft?: boolean } }>(
    entries: T[],
    includeDrafts: boolean,
): T[] {
    return entries
        .filter(({ data }) => includeDrafts || !data.draft)
        .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}
export function validateSlugs(entries: { id: string; data: { slug: string } }[]): void {
    const seen = new Set([
        "about",
        "articles",
        "categories",
        "series",
        "series-collection",
        "category",
        "404",
        "sitemap.xml",
        "sitemap-index.xml",
        "uploads",
        "assets",
    ]);
    for (const entry of entries) {
        const slug = entry.data.slug;
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || seen.has(slug))
            throw new Error(`Duplicate, reserved or invalid article slug: ${slug}`);
        seen.add(slug);
    }
}
export function validateTaxonomyIds(entries: { id: string; data: { slug: string } }[]): void {
    for (const entry of entries) {
        if (entry.id !== entry.data.slug)
            throw new Error(`Taxonomy filename ${entry.id} must match slug ${entry.data.slug}`);
    }
}
/**
 * Articles live in `content/articles/YYYY/YYYY-MM-DD-name/index.md`; the folder name is the entry ID.
 * The public URL always comes from the required `slug` frontmatter field, never from the path.
 */
export function articleIdFromPath(entry: string): string {
    const match = entry.match(/^(\d{4})\/((\1-\d{2}-\d{2})-[a-z0-9]+(?:-[a-z0-9]+)*)\/index\.md$/);
    if (!match)
        throw new Error(
            `Article ${entry} must be at YYYY/YYYY-MM-DD-name/index.md (lowercase name, matching year)`,
        );
    return match[2];
}
export function validateArticleDates(entries: { id: string; data: { publishedAt: Date } }[]): void {
    for (const entry of entries) {
        const date = entry.data.publishedAt.toISOString().slice(0, 10);
        if (!entry.id.startsWith(`${date}-`))
            throw new Error(
                `Article folder ${entry.id} must start with its publishedAt date ${date}`,
            );
    }
}
