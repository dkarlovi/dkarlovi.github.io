import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectArticles, validateSlugs } from '../src/lib/publication.ts';
const entry = (id: string, date: string, draft = false) => ({ id, data: { publishedAt: new Date(date), draft } });
test('filters drafts before sorting and sorts newest first without mutating', () => {
  const entries = [entry('old', '2020-01-01'), entry('draft', '2026-01-01', true), entry('new', '2025-01-01')];
  assert.deepEqual(selectArticles(entries, false).map(e => e.id), ['new', 'old']);
  assert.deepEqual(selectArticles(entries, true).map(e => e.id), ['draft', 'new', 'old']);
  assert.equal(entries[0].id, 'old');
});
test('rejects duplicate, reserved and unsafe public slugs', () => {
  assert.throws(() => validateSlugs([{ id: 'one', data: { slug: 'same' } }, { id: 'two', data: { slug: 'same' } }]), /same/);
  for (const slug of ['about', 'articles', '404', 'sitemap.xml', '../bad']) assert.throws(() => validateSlugs([{ id: 'one', data: { slug } }]), new RegExp(slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.doesNotThrow(() => validateSlugs([{ id: 'hello-world', data: {} }]));
});
test('taxonomy IDs must match editable slugs', async () => {
  const { validateTaxonomyIds } = await import('../src/lib/publication.ts');
  assert.throws(() => validateTaxonomyIds([{ id: 'engineering', data: { slug: 'renamed' } }]), /engineering.*renamed/);
  assert.doesNotThrow(() => validateTaxonomyIds([{ id: 'engineering', data: { slug: 'engineering' } }]));
});
