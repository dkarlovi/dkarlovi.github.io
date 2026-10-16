import { getCollection, getEntries } from 'astro:content';
import { selectArticles, validateSlugs, validateTaxonomyIds } from './publication';
export async function getArticles(includeDrafts = import.meta.env.DEV) {
  const articles = await getCollection('articles');
  validateTaxonomyIds(await getCollection('categories'));
  validateTaxonomyIds(await getCollection('series'));
  validateSlugs(articles);
  for (const article of articles) {
    for (const kind of ['categories', 'series'] as const) {
      const resolved = await getEntries(article.data[kind]);
      for (const [index, entry] of resolved.entries()) {
        if (!entry) throw new Error(`Article ${article.id} references missing ${kind} entry: ${article.data[kind][index].id}`);
      }
    }
  }
  return selectArticles(articles, includeDrafts);
}
