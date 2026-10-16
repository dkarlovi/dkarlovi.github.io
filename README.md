# dkarlovi.github.io

Static site built with Astro 7, TypeScript, standard Markdown content collections, and Sass/Bootstrap. The layout was ported from [Geeky Hugo](https://github.com/statichunt/geeky-hugo); theme copyright belongs to its original authors.

Use Node 22.22.2 (see `.node-version`) or a compatible newer release.

```sh
npm ci
npm run dev
```

`npm run build` generates `dist/`; `npm run preview` serves that output locally. PHP, Composer, Docker, YASSG, and imgproxy are no longer needed.

## Content

- `src/content/articles/*.md`: one article per file, named for its public slug.
- `src/content/pages/*.md`: homepage, About, and listing introduction copy.
- `src/content/categories/*.md` and `src/content/series/*.md`: taxonomy records. Their filename and `slug` must match.
- `src/content.config.ts`: native Astro collection schemas, including `reference()` and `image()`. The built-in loader uses filenames as stable entry IDs, keeping optional public URL overrides separate.
- `src/assets/uploads/`: editable images, processed by Astro in both frontmatter and Markdown.
- `src/assets/`: template artwork; `public/`: stable favicon/manifest files.

Example article:

```markdown
---
title: An example article
summary: A short description.
publishedAt: 2026-10-16
draft: false
image: ../../assets/uploads/example.webp
categories: [engineering]
series: []
keywords: [engineering]
---

## A heading

Ordinary Markdown, including images:

![A useful description](../../assets/uploads/example.webp)
```

The filename supplies the article ID and URL (`an-example-article.md` → `/an-example-article`). An optional `slug` frontmatter field overrides its URL. Categories and series contain native collection IDs: `engineering` refers to `src/content/categories/engineering.md`. New articles and images need no generated imports or template changes.

Drafts appear in `npm run dev` and are excluded from production article routes, listings, counts, and sitemap. Articles are sorted newest first; series contents are oldest first. Listings use Astro's native pagination with 20 records per page.

Content uses Astro's normal Markdown rendering, GFM, footnotes, and Shiki highlighting. Native heading IDs are the default. Explicit HTML aliases in migrated articles keep old `#content-...` links working. Captions use standard `<figure>`/`<figcaption>` HTML; expandable notes use `<details>`/`<summary>`. Put blank lines around Markdown inside HTML blocks. No custom YASSG syntax or compatibility parser remains.

## Optional Pages CMS

The repository includes `.pages.yml` for [Pages CMS](https://pagescms.org/). It defines article/page/taxonomy fields, native reference IDs, and image uploads. Nothing is connected to a CMS account, and the build has no CMS runtime dependency.

Media input is `src/assets/uploads`; editor output is `../../assets/uploads`, relative to the Markdown files in each collection directory. This lets Astro's native image processing handle a CMS-uploaded file. Keep collection files at their current depth or update the media output paths accordingly. Taxonomy reference fields store `{fields.slug}`, matching Astro's collection IDs; taxonomy filenames must match that slug.

The Markdown body editor offers Editor/Source switching. Use Source mode for legacy HTML figures, embedded iframes, explicit anchors, and expandable notes. Rich-text editors may normalize or discard HTML; lossless Editor/Source round-tripping of these blocks has not been verified against a live Pages CMS account. Ordinary Markdown/frontmatter and native image/reference paths are covered by local build checks. You can choose another Git-backed CMS without changing Astro's content APIs.

## Verification

```sh
npm test
npm run check
npm run build
npm run check:output
npm run test:integration
```

The integration check temporarily creates CMS-style content/media, exercises native image processing, empty taxonomies, drafts, invalid references and the 20/21-record pagination boundary, then removes its fixtures and rebuilds. Run it separately from development/build processes. `check:output` checks the migrated site's baseline content, local links/assets/anchors, taxonomy counts, metadata, and sitemap. The CommonMark demonstration's illustrative repository link is explicitly exempted.

To read Astro's own dev-toolbar Audit panel across every page at desktop and mobile sizes, start `npm run dev` and run:

```sh
ASTRO_DEV_URL=http://localhost:4322 node scripts/check-dev-audit.mjs
```

Set the URL to the port printed by your dev server (normally 4321). This check requires Google Chrome, fails on accessibility warnings, and records all findings in `/tmp/astro-dev-audit.json`. Add `--strict` to also fail on performance hints, including viewport-dependent image-loading advice. External demonstration images are blocked during this local audit so their availability cannot stall Astro's auditor.

## Deployment

Pushes to `main` run the GitHub Pages workflow: Git LFS checkout, Node/npm installation, checks, static build, and `dist/` deployment. Pull requests targeting `main` run the same checks and build without publishing. You can also select **Build and deploy Astro → Run workflow** in GitHub Actions; selecting `main` deploys, while other branches only validate the build. The repository's **Settings → Pages → Source** must be **GitHub Actions** (already configured for this repository). No deployment is performed by local migration commands.

`BASE_URL` sets the production origin and optional path prefix (default `https://dkarlovi.github.io`). For example:

```sh
BASE_URL=https://example.com/blog/ npm run build
BASE_URL=https://example.com/blog/ npm run check:output
```

The sitemap uses the official Astro integration at `/sitemap-index.xml`. Site pages advertise it with `rel="sitemap"`; legacy YASSG gzip/partition URLs are not recreated. See `docs/migration/validation.md` for migration checks and any known limitations.
