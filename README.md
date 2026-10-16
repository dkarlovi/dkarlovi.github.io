# dkarlovi.github.io

Static site built with Astro 7, TypeScript, Tailwind CSS 4, and standard Markdown content collections. The custom Colour Field design replaces the Bootstrap/Geeky Hugo theme; the historical theme attribution is retained in the migration documentation. Fonts are bundled locally.

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
- `src/assets/`: source assets; `public/`: brand/favicon/manifest files.

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

Listing headers use the `image` and optional `imageCredit` frontmatter fields. Set them in `src/content/pages/article-collection.md`, `category-collection.md`, or `series-collection.md` for the main listings, and in each category or series file for its own article listing. For example:

```yaml
image: ../../assets/uploads/puzzle.jpeg
imageCredit: Photograph by Dalibor Karlović
```

The photo supplies the page’s light/dark palette. Omit `image` for a plain heading. Both fields are available in Pages CMS.

The About entry also supplies the homepage’s introduction card through `homepageTeaser`: `eyebrow`, `title`, `summary`, and `linkLabel` control its label, heading, paragraph, and button text. The card shares the About image. Edit these fields under **About → Homepage introduction** in Pages CMS, or omit the group to hide the card.

About’s `homepageHero.roles` and `homepageHero.introduction` supply the hero’s role line and introduction paragraph, editable under **About → Homepage hero**. The site-wide logo tagline comes from `brandTagline` in the Homepage entry.

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

## Article experiences

Every article with an image gets a palette extracted by Sharp at build time. The generated light/dark roles colour the article, navigation and footer, with visible swatches beside the photo attribution. Neutral/absent images have a warm fallback. The site honors system theme changes live, without a switcher. No client-side colour extraction or external font requests are needed.

Optional frontmatter:

```yaml
experience:
    accent: "#006b65" # optional; adjusted if needed for legibility
    imagePosition: 50% 45% # focal point, each coordinate 0–100%
    imageCredit: Photograph by Dalibor Karlović
    headingExperiment: terrain # none (default) or terrain
    stylesheet: terrain # optional src/styles/experiences/terrain.css
```

A named experience stylesheet loads only on articles that request it. Scope rules with `body[data-article="article-filename"]` or `body.article-page`; the entire shared header/footer can consume the article’s `--paper`, `--ink`, `--accent`, `--panel`, and other semantic roles. The root `--*-light`/`--*-dark` values define the extracted palette. Avoid fixed colours in shared components. For a new interactive header, add an Astro component and extend the explicit `headingExperiment` registry in the collection schema and `ArticleHero.astro`.

`colour-field-experiment.md` is a draft authoring example: view `/colour-field-experiment` in development. It is excluded from production routes, counts and sitemap. Its optional 16:9 canvas supports keyboard light controls, pause, visibility gating, and live reduced-motion changes.

Markdown prose stays readable while images, figures, code, tables and videos can use the wider article canvas. Shiki highlighting is static. Add a code caption using a standard HTML figure around the fenced block, as the existing articles already do. Captions are centred; code and wide tables scroll within their own surfaces on small screens. Keep descriptive image alt text and add captions/transcripts to authored videos.

Run browser checks against a built preview with `BROWSER_URL=http://127.0.0.1:4321 node scripts/check-browser.mjs`. Set `CHROMIUM_PATH` if using a downloaded Chromium rather than installed Google Chrome. These checks cover four viewport widths, both themes, mobile menu/Escape, consent, captions, palette visibility and local media. They intentionally do not contact the deployed site.
