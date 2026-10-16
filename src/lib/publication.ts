export function selectArticles<T extends { data: { publishedAt: Date; draft?: boolean } }>(entries: T[], includeDrafts: boolean): T[] {
  return entries.filter(({ data }) => includeDrafts || !data.draft).sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}
export function validateSlugs(entries: { id: string; data: { slug?: string } }[]): void {
  const seen = new Set(['about', 'articles', 'categories', 'series', 'series-collection', 'category', '404', 'sitemap.xml', 'sitemap-index.xml', 'uploads', 'assets']);
  for (const entry of entries) {
    const slug = entry.data.slug ?? entry.id;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || seen.has(slug)) throw new Error(`Duplicate, reserved or invalid article slug: ${slug}`);
    seen.add(slug);
  }
}
export function validateTaxonomyIds(entries: { id: string; data: { slug: string } }[]): void {
  for (const entry of entries) {
    if (entry.id !== entry.data.slug) throw new Error(`Taxonomy filename ${entry.id} must match slug ${entry.data.slug}`);
  }
}
