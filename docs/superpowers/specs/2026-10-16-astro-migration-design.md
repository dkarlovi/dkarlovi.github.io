# Astro migration design

## Intent and scope

Replace YASSG, Symfony, Twig, Webpack Encore, and imgproxy with an Astro static build. Preserve the existing content, public URLs, and mostly unchanged layout. Keep GitHub Pages hosting. The user approved this approach and authorized building the old site if useful; the deployed site at https://dkarlovi.github.io/ is also a reference.

This is a technology migration, with no new product features or redesign. Keep the existing theme attribution, Bootstrap layout, SCSS, fonts, icons, navigation, footer, and article presentation.

## Native Astro and future CMS priority

The user's clarified priority is a complete, idiomatic Astro migration. Content restructuring and conversion are explicitly authorized. Preserve public content and the mostly unchanged visual layout; do not preserve YASSG internals or custom authoring syntax at the expense of Astro/CMS conventions. This priority supersedes earlier compatibility-oriented decisions.

Use `src/content/` for Markdown collections, `src/content.config.ts` with built-in `glob()` loaders and schemas, `reference()` for taxonomy relationships, and `getCollection()`, `getEntry()`/`getEntries()`, and `render()` in templates. Use Astro file-based routing, `getStaticPaths()` and its `paginate()` helper, `astro:assets`, and the official sitemap integration. Do not build parallel collection, rendering, image-resolution, pagination, or sitemap frameworks.

Keep editable article bodies in plain Markdown with YAML frontmatter, scalar values, arrays of collection IDs, and ordinary image paths. Avoid required JSX imports, custom directives, executable expressions, and YASSG compatibility plugins. Convert existing `^^^` figures, automatic embeds, and titled asides to standard Markdown/HTML while preserving prose, captions, and visible behavior. Exact per-image dimensions may be simplified where necessary for standard authoring; use template/CSS image treatments for the existing layout. Rich-text editor round-trip fidelity for raw HTML must be verified before claiming it; document source editing for HTML-rich legacy blocks.

Consolidate editable uploads under `src/assets/uploads/`. All Markdown collections live at the same depth, so the CMS writes standard `../../assets/uploads/...` paths. Use Astro's native schema `image()` for frontmatter and normal Markdown images for bodies; Astro resolves and optimizes new uploads without generated imports or a custom resolver. Template-only artwork lives in `src/assets/`; favicon/manifest files remain in `public/`. This execution refinement replaces the earlier unprocessed public-upload proposal and better meets the native Astro priority.

Use slug-named article files in `src/content/articles/`, preserving public article slugs as explicit frontmatter when necessary. Rename taxonomy files to their canonical IDs. Migrate page copy into `src/content/pages/`; route identity belongs in page code, not YASSG `route` frontmatter. Put shared site/navigation/social data in an ordinary typed data module or JSON file. Preserve the six articles, five sets of page copy, four categories, and one series, regardless of source filenames.

Add a repository-only `.pages.yml` as a concrete compatibility example covering content, frontmatter fields, taxonomy reference IDs, and upload paths. It must match actual files and schemas and permit a new article, category, and image without code changes. Do not connect an account, deploy a CMS, or claim compatibility with every CMS. The site must also remain usable without Pages CMS.

## Architecture

Use Astro static output, TypeScript, and build-time content collections for articles, pages, categories, and series. Migrate content into the native Astro structure described above and preserve public article slugs and dates. Validate frontmatter and use native collection references instead of executable YASSG expressions. Unknown relationships, duplicate public slugs, and missing local images must fail the build with actionable errors.

Port the shared Twig layout and macros into focused Astro components: layout/head, navigation, social links, article cards, author/date metadata, category badges/sidebar, pagination, discussion links, and responsive images. Page templates consume Astro collection APIs directly; small shared helpers may centralize site-specific publication filtering and ordering.

Keep Bootstrap JavaScript for dropdowns, mobile offcanvas navigation, and collapsible asides. Preserve relative date formatting, cookie consent, and the existing consent-controlled analytics integration and IDs. Bundle browser scripts through Astro/Vite. No client framework or server runtime is required.

## Content and Markdown compatibility

Replace YASSG frontmatter references with collection IDs validated through Astro `reference()`. Convert actual Twig image calls to ordinary image paths; preserve Twig syntax shown in code samples as literal code. Do not retain a Twig interpreter or evaluate content expressions in JavaScript.

Use Astro's standard Markdown renderer, syntax highlighting, GFM, and footnotes. Convert existing custom syntax once during migration instead of extending Astro to understand YASSG. Preserve tables, code, raw HTML, video, captions, list nesting, and collapsible content through standard Markdown/HTML. Use native heading IDs and update internal links. For known public legacy `content-` heading targets, add explicit HTML anchor aliases in the migrated articles rather than changing Astro's heading generation globally. MDX is optional for future developer-authored content, but no migrated article should require MDX solely to preserve YASSG behavior.

Preserve category/series membership, counts, series sibling ordering (oldest first), discussion links, keywords, and article ordering (newest first). Drafts appear during development and are excluded from production article pages, listings, counts, and the sitemap. Keep the homepage's four recent articles and the installed YASSG default of 20 items per collection page.

## URLs and generated output

Preserve `/`, `/about`, `/{article-slug}`, `/articles`, `/categories`, `/series-collection`, `/category/{slug}`, and `/series/{slug}`, plus the existing numbered pagination URLs. First pages use the existing unnumbered canonical URLs; retain explicit `/1` entry points if the old output exposes them. Generate only valid pagination pages, including accessible empty taxonomy pages. Preserve a static 404 page. Use the official Astro sitemap integration and its standard `/sitemap-index.xml` output; provide a lightweight `/sitemap.xml` redirect/alias only if needed for existing discovery. Do not reproduce YASSG sitemap partitions or gzip generation.

Match document titles, summaries, Open Graph metadata, favicon/manifest references, social destinations, and Google site verification. Use absolute public image URLs for Open Graph metadata and derive production URL configuration from `BASE_URL` or the repository's GitHub Pages URL. Verify actual old output or deployed responses before locking down route/trailing-slash behavior.

## Images and assets

Use Astro's built-in image support in place of imgproxy. Migrate author uploads and template assets to the locations above and rewrite content references. Preserve meaningful alternative text, responsive layout, and eager/high-priority primary images. Prefer native `Image`/`Picture` components where optimization is supported; do not add a YASSG-style image facade to retain old options. Keep favicon/manifest assets in `public/`, repair their internal references, and preserve Git LFS handling for moved binary assets.

## Build and repository changes

Provide `npm run dev`, `npm run build`, `npm run preview`, and `npm run check`, a committed npm lockfile, and a documented supported Node release compatible with the selected stable Astro version. Use `dist/` as build output.

Replace the GitHub Pages build job with Node setup, `npm ci`, validation, and the Astro build; retain the existing artifact/deployment jobs and Git LFS handling. Update README, ignore rules, Dependabot, and Makefile commands as needed. Remove obsolete Composer dependencies, PHP models/configuration/quality tooling, Twig templates, Encore configuration, and PHP/imgproxy Docker services once parity is verified. No deployment, PR, or unrelated dependency migration is included.

## Validation and acceptance

1. Capture a baseline route/content inventory from existing sources and, where accessible, deployed HTML or a local YASSG build.
2. Run Astro type/content checks and a clean production build using the selected supported Node release.
3. Verify all six existing articles, five page records, four categories, and one series migrate without lost prose, unresolved Twig/YASSG directives, missing media, or taxonomy mismatches.
4. Add focused automated regression checks for draft exclusion, date ordering, pagination boundaries, taxonomy counts, CMS-style source-image paths, migrated captions inside lists, code samples containing Twig, native heading IDs, and explicit legacy anchor aliases. Distinguish known illustrative external/broken links in the CommonMark demonstration from migration regressions.
5. Inspect built HTML for expected metadata, sitemap entries, asset resolution, discussion links, and error-page output. Check local links and anchor targets against generated output.
6. Compare representative desktop and mobile views: homepage, About, article listing, category and series listings/details, and image/code-heavy articles. Exercise mobile navigation, dropdowns, cookie preferences, and collapsible asides in a browser when browser tooling is available. Record any unavailable visual/browser verification explicitly.

Success means a fully static Astro site builds and can be deployed by the existing GitHub Pages workflow, with the public content and visual structure preserved and no PHP or imgproxy requirement.

## Documentation references

- https://docs.astro.build/en/guides/content-collections/
- https://docs.astro.build/en/guides/markdown-content/
- https://docs.astro.build/en/guides/cms/pages-cms/
- https://pagescms.org/docs/configuration/

## Alternatives considered

- **Native Astro migration (selected):** preserves public content and the theme while adopting Astro conventions and portable CMS-editable content.
- **Adopt an Astro theme:** faster initial scaffolding but introduces avoidable layout differences and content adaptation.
- **Keep Twig/YASSG compatibility at build time:** reduces initial content edits but preserves the technology coupling this migration is intended to remove.
