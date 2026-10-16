# Astro migration validation

Migrated from YASSG/Symfony/Twig/Encore/imgproxy to Astro 7.4.0. The existing layout and six articles, five page-copy records, four categories, and one series were preserved. Historical frontmatter is recorded in `baseline.json`; ongoing output checks derive expectations from current native content so new CMS articles do not require editing a six-article snapshot.

## Implementation choices

- Native `glob()` collections, `reference()`, `image()`, `getCollection()`, `getEntries()`, and `render()`; native file routes and `paginate()`; official `@astrojs/sitemap`.
- Built-in `generateId` uses filenames. Article URL overrides remain frontmatter data, allowing duplicate URLs and mismatched taxonomy IDs to fail explicitly instead of being silently collapsed by the default slug-derived ID behavior.
- Standard Markdown/GFM/footnotes/Shiki, with one-time conversion of Twig image calls and `^^^` figure syntax into ordinary Markdown/HTML. Details/summary replaces client-rewritten asides. Native heading IDs plus explicit legacy HTML aliases preserve old anchor links.
- CMS-editable image input `src/assets/uploads`, output `../../assets/uploads`: Astro processes cover images and ordinary Markdown images without a custom resolver or generated imports. This improves on the early public-upload proposal by retaining native image optimization and base-prefix support.
- `.pages.yml` provides article/page/taxonomy fields and native reference serialization. The real Pages CMS account/editor was not connected; HTML-rich legacy blocks should use Source mode until actual rich-text round-trip behavior is verified.
- The sitemap is now the official `/sitemap-index.xml` and `/sitemap-0.xml`. Page heads advertise the index. YASSG's compressed/partition sitemap implementation is retired.

## Checks

- A clean `npm ci --no-audit --no-fund` installed successfully from the lockfile on Node 22.22.2.
- Five unit/content/CMS-configuration checks pass. `astro check` reports zero errors, warnings, and hints.
- Actual Astro fixture builds exercise native pagination at a full-page boundary plus one item; a new article with a new upload and native references; omitted optional media/taxonomies; optional page-image removal; draft exclusion from routes/counts/sitemap; an empty taxonomy; invalid references; missing uploads; duplicate article URL slugs; and taxonomy filename/slug mismatch. Fixtures are removed in `finally`, and the normal site is rebuilt.
- Root and `BASE_URL=https://example.com/blog/` production builds are checked for all generated pages, local links/assets/anchors, article metadata, taxonomy membership/counts, image/font resolution, manifest references, and official sitemap. Both produce 17 HTML pages and pass checks for 783 local targets.
- Independent code review identified authoring regressions in test fixture counts and optional-field handling; these were fixed and covered by the expanded actual-build checks.
- Headless Google Chrome visited 11 representative pages at both 1440×1000 and 390×844 (22 visits): home, About, articles, categories, series collection, category detail, series detail, speech-recognition article, feature-flags article, coverage article, and CommonMark example. No JavaScript exceptions, failed local HTTP requests, broken local images, or horizontal overflow were observed.
- Browser interactions cover consent preferences and rejection (analytics remains unloaded), keyboard dropdown navigation, mobile offcanvas open/close, and native details toggling. The test disables webdriver detection because CookieConsent intentionally suppresses its UI for bots; product bot handling is unchanged.
- Full-page homepage screenshots and representative viewport captures were inspected, including a fresh screenshot from the deployed YASSG homepage. The theme, layout, content ordering, and imagery remain close; native details, functional icon fonts, and the explicit article-dropdown button account for small intentional differences.

Browser results/screenshots from this session are under `/tmp/astro-migration-browser/`, including `results.json` and `baseline-home-desktop.png`. This is temporary local verification output, not a deployment artifact. `node scripts/check-browser.mjs` can reproduce the browser pass with local Astro preview running and Google Chrome installed.

## Boundaries

No CMS account connection, remote deployment, push, or PR was performed. Local checks cannot establish lossless rich-text editing of arbitrary HTML in every future CMS; the content is ordinary Markdown/HTML and the repository uses standard Astro extension points. The CommonMark demonstration intentionally includes external images and an illustrative repository-file link; the latter is explicitly exempted from local link validation.
