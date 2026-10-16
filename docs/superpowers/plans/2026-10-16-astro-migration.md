# Native Astro Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Migrate the site completely to native Astro conventions with portable content suitable for a future Git-backed CMS.

**Architecture:** Built-in content loaders, schemas/references, rendering, asset components, file-based routes, native pagination, and the official sitemap integration own the build. Convert YASSG-specific content once instead of implementing compatibility processors. Preserve public content, URLs, and the existing theme.

**Tech Stack:** Stable Astro, TypeScript, Sass, existing Bootstrap/fonts/cookie consent, official sitemap integration, standard Markdown/YAML and native source-image uploads.

**Spec:** `docs/superpowers/specs/2026-10-16-astro-migration-design.md` (including Native Astro and future CMS priority, which supersedes earlier compatibility decisions).

## Global Constraints

- Content restructuring and conversion are explicitly authorized.
- Use `src/content/`, `src/content.config.ts`, built-in `glob()`, `reference()`, `getCollection()`, `getEntries()`, and `render()`.
- Use Astro file-based routing, `getStaticPaths()` and its `paginate()` helper, `astro:assets`, and the official sitemap integration.
- Do not build parallel collection, rendering, image-resolution, pagination, or sitemap frameworks.
- Keep editable article bodies in plain Markdown with YAML frontmatter and CMS-writable `../../assets/uploads/...` image paths.
- No required MDX, YASSG syntax, custom Markdown compatibility plugins, or executable frontmatter.
- Preserve public article slugs, dates, relationships, prose, visible captions/embeds/asides, four recent homepage articles, and 20-item collection pagination.
- Drafts are visible in development and absent from production routes, counts, listings, and sitemap.
- Keep GitHub Pages hosting, Git LFS handling, theme attribution, and mostly unchanged layout; build to `dist/`.
- Configure repository-only Pages CMS metadata; no account connection, deployment, or PR.

## Review Focus

- A new CMS-authored Markdown file and source-image upload must work without code changes or generated imports.
- Taxonomy IDs must resolve through native references; draft-only membership must not leak published counts or links.
- Migrated figures/code inside lists and asides must preserve nesting and prose without custom parsers.
- Native heading IDs must work alongside explicit old public anchor aliases and literal Twig examples.
- Empty collections, 20/21-item pagination boundaries, and prefixed deployment URLs must render valid navigation/assets.

## Task 1: Capture baseline and establish native collections

**Files:** Create `docs/migration/baseline.json`, `astro.config.mjs`, `tsconfig.json`, `.node-version`, `src/content.config.ts`, `src/lib/articles.ts`, `tests/articles.test.ts`; update npm manifests; migrate records into `src/content/{articles,pages,categories,series}/`.

**Interfaces:** Collections use standard IDs and typed schemas. Article fields are `title`, optional explicit `slug`, `summary`, `publishedAt` (coerced Date), `draft` (default false), `image` (native image() field), `categories`/`series` (arrays of native collection references), `keywords`, and existing discussion IDs. `getArticles(includeDrafts: boolean)` is a small site-specific query around `getCollection('articles')`, sorted newest first. No generic collection facade.

- [x] Capture six article slugs, five page-copy records, four categories, one series, URL behavior, metadata, and representative layout from existing sources/deployed or locally built HTML.
- [x] Run modern-web-guidance search/retrieve before frontend implementation; check current official Astro docs and package engines. Select stable Astro and compatible supported Node, record exact engine/version settings, and install dependencies.
- [x] Add focused failing tests for publication ordering/filtering and duplicate/reserved public slug validation. Run and confirm expected failures.
- [x] Configure Astro static build and scripts `dev`, `build`, `preview`, `check`, `test`. Use built-in loaders and reference schemas; move/rename content files to simple canonical IDs, convert taxonomy expressions, remove YASSG route metadata, and migrate shared data into `src/data/site.ts`.
- [x] Implement only site-specific query/slug validation logic. Verify native reference resolution, clear invalid-reference errors, exact migrated record counts, and passing focused tests plus `astro sync`. Checkpoint changes if repository permissions allow.

## Task 2: Convert content to standard authoring and organize media

**Files:** Modify migrated Markdown records; create `src/assets/uploads/`, `src/assets/`, `public/` favicon/manifest files, `tests/content.test.ts`; update `.gitattributes` if asset movement requires it.

**Interfaces:** Article bodies use ordinary Markdown images with `../../assets/uploads/...` paths. Template artwork uses direct Astro imports. Schema image fields use native `image()` so uploaded source images are resolved and optimized by Astro. No `resolveImage()` or image wrapper that interprets YASSG paths/options.

- [x] Add failing content assertions for literal Twig code, caption text/list nesting, rendered aside content, matching native heading links plus explicit legacy `content-` aliases, and absence of actual YASSG expressions/`^^^` directives.
- [x] Move binary assets with Git LFS awareness, rewrite media references, convert Twig image calls to Markdown, replace caption syntax with standard Markdown/HTML, and express existing videos as explicit HTML embeds. Convert asides to standard HTML such as `details`/`summary` where appropriate, preserving visible text and collapsible behavior without JavaScript content rewriting.
- [x] Preserve body text and code blocks; use normal Astro-generated heading IDs, rewrite local links, and insert explicit HTML aliases for old public anchors. Preserve GFM, footnotes, and native highlighting; remove PHP-vendor highlight CSS dependency.
- [x] Verify representative rendered bodies with Astro's real renderer and run content checks. Test native source-image rendering without any custom imports/resolvers; preserve crop/layout in templates or CSS where needed. Record intentional source-format differences. Checkpoint changes.

## Task 3: Render the theme through native Astro pages/components

**Files:** Create `src/layouts/SiteLayout.astro`, focused navigation/social/card/meta/sidebar/discussion components, `src/pages/{index,about,404}.astro`, `src/pages/[slug].astro`, `src/scripts/app.ts`; move existing theme SCSS to `src/styles/`.

**Interfaces:** Templates read `CollectionEntry` data, call native `render(entry)` for bodies and `getEntries()` for references, and use `Image`/`Picture` directly where supported. SiteLayout accepts page metadata and a default slot. Article cards accept native article entries. A small URL helper may prepend configured `base`; no content engine abstraction.

- [x] Add built-output expectations for homepage's four newest cards, About copy, article author/date/keywords/discussion links, series siblings oldest first, metadata, and 404 recovery.
- [x] Port existing DOM/classes to focused Astro templates, using `getStaticPaths()` from the filtered article collection. Use native imported image components and supported public-image rendering, with eager/high-priority primary images and lazy secondary images.
- [x] Preserve Bootstrap menu/offcanvas/dropdown behavior, relative dates, consent configuration and analytics IDs through bundled scripts. Preserve newly semantic details/asides without rebuilding their inner HTML.
- [x] Correct favicon/manifest internal paths, preserve attribution/socials, set canonical and absolute Open Graph URLs using Astro site/base configuration, and verify prefixed native image URLs.
- [x] Run `npm run check` and production build; verify primary pages exist, Markdown renders natively, and no PHP/imgproxy process is required. Checkpoint changes.

## Task 4: Use native route pagination and sitemap integration

**Files:** Create `src/pages/articles/[...page].astro`, `src/pages/categories/[...page].astro`, `src/pages/series-collection/[...page].astro`, `src/pages/category/[slug]/[...page].astro`, `src/pages/series/[slug]/[...page].astro`, shared collection/pagination components, `tests/routes.test.ts`; update Astro integration configuration.

**Interfaces:** Each paginated route's `getStaticPaths({ paginate })` uses Astro `paginate(items, { pageSize: 20, params })`; page rendering consumes Astro's native `Page<T>` and `page.url` values. Handle empty taxonomy pages explicitly only where Astro pagination does not generate them. Official `@astrojs/sitemap` generates sitemap output; no custom XML/gzip generator.

- [x] Add regression expectations for all existing listing/taxonomy paths, zero/20/21 records, first-page canonical URLs, valid next/previous URLs, and missing invalid page routes.
- [x] Implement route-specific collection queries and native pagination. Validate taxonomy counts/references against native entries and exclude drafts before pagination/counting. Retain old `/1` URLs only as thin aliases/redirects if baseline requires them.
- [x] Configure official sitemap integration; use standard `/sitemap-index.xml` discovery. Add only a lightweight legacy `/sitemap.xml` alias if needed; do not reproduce YASSG partition/gzip behavior.
- [x] Verify draft-only/empty taxonomy output and absence of draft article routes/sitemap entries. Build/check both root and `/blog/` base URLs; confirm native pagination links, uploads and metadata remain valid. Checkpoint changes.

## Task 5: Prove CMS compatibility, switch CI, and remove old stack

**Files:** Create `.pages.yml`, `scripts/check-output.mjs`, `docs/migration/validation.md`; modify README, Makefile, `.gitignore`, npm scripts, build workflow, Dependabot; remove obsolete Composer/PHP/Twig/Encore/Docker files and original migrated content/assets.

**Interfaces:** `.pages.yml` mirrors actual native collection IDs/fields and defines `src/assets/uploads` input with `../../assets/uploads` output. `npm run check:output` validates completed `dist/` output against baseline expectations, normalizes accepted URL/anchor aliases, and exits nonzero on regressions.

- [x] Check official Pages CMS/Astro documentation and create repository-only configuration for articles, page copy, taxonomy references, scalar/date/draft/image fields, Markdown body editing, and media. No CMS runtime dependency.
- [x] Exercise the CMS contract with temporary fixtures equivalent to editor output: add a new Markdown article, reference a new taxonomy ID, and use a new source-image upload. Build successfully without code/import edits and verify rendered content/counts/images. Clean up fixtures and rebuild. Verify the selected Pages CMS reference fields serialize the IDs Astro expects; do not assume the formats match.
- [x] Document rich-text versus source-editor requirements for legacy raw HTML. Do not claim lossless round-trip of captions/asides without testing an actual editor; keep this limitation distinct from Astro build support.
- [x] Implement output validation for baseline content/routes, internal links/anchors, images, taxonomy counts, metadata, manifest files, and official sitemap; explicitly allow only known illustrative links in the CommonMark example.
- [x] Compare desktop/mobile homepage, About, listings/taxonomies and image/code-heavy articles. Exercise offcanvas, dropdowns, cookie preferences and collapsible content using available browser tools. Record actual checks and unavailable verification.
- [x] Switch Pages CI to supported Node, npm cache, `npm ci`, checks/tests/build/output validation and `dist/` upload, retaining Git LFS and deployment permissions. Update README/Makefile/Dependabot/ignore rules for native Astro authoring, uploads, collections, drafts, sitemap and CMS setup.
- [x] Remove the old stack and source locations after parity checks. Run clean `npm ci`, tests, `npm run check`, production build and output validation; repeat prefix build then restore root build. Review diff and obsolete references; record results and checkpoint changes. Do not deploy or open a PR.

## Execution and review

Native execution in this session is recommended because the tasks share native schemas and route/component interfaces. Subagent tooling was discovered during execution and used for an independent final review. Follow the execution/verification/review skills and report unavailable independent review explicitly. Preserve the native-Astro/CMS priority whenever exact YASSG behavior would require a new compatibility subsystem.

Execution complete. See `docs/migration/progress.md` and `docs/migration/validation.md`. Changes are left uncommitted on `migrate-to-astro`; conditional checkpoint commits were omitted to leave the complete migration directly reviewable.
