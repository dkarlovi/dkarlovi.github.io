# dkarlovi.github.io

Static site built with Astro 7, TypeScript, Tailwind CSS 4, and standard Markdown content collections. The custom Colour Field design replaces the Bootstrap/Geeky Hugo theme; the historical theme attribution is retained in the migration documentation. Fonts are bundled locally.

Use Node 24 (see `.node-version`) or a compatible newer release.

```sh
npm ci
npm run dev
```

`npm run build` generates `dist/`; `npm run preview` serves that output locally. PHP, Composer, Docker, YASSG, and imgproxy are no longer needed.

## Content

Content lives in `content/`, separate from the code in `src/` that renders it:

```
content/
  articles/2026/2026-11-03-my-article/
    index.md          # the article
    cover.jpeg        # images used only by this article sit next to it
  pages/*.md          # homepage, About, and listing introduction copy
  categories/*.md     # taxonomy records; filename and `slug` must match
  series/*.md
  assets/             # images shared by several entries (portrait, listing headers)
```

- Each article is a folder `content/articles/YYYY/YYYY-MM-DD-name/index.md`. The folder name is the entry ID; the year folder and date prefix must match `publishedAt`, and the build fails otherwise. Any other `.md` file under `content/articles/` also fails the build.
- `src/content.config.ts`: native Astro collection schemas, including `reference()` and `image()`.
- `src/assets/`: theme assets such as icons; `public/`: brand/favicon/manifest files.

Example article:

```markdown
---
title: An example article
slug: an-example-article
summary: A short description.
publishedAt: 2026-10-16
draft: false
image:
    url: ./example.webp
    alt: A useful description
categories: [engineering]
series: []
keywords: [engineering]
---

## A heading

Ordinary Markdown, including images:

![A useful description](./example.webp)
```

Saved as `content/articles/2026/2026-10-16-an-example-article/index.md` with `example.webp` beside it. Shared images are referenced relative to the file, e.g. `../../../assets/self.jpeg` from an article or `../assets/self.jpeg` from a page or taxonomy entry.

The required `slug` frontmatter field is the public URL (`slug: an-example-article` → `/an-example-article`); the folder name never affects URLs, so files can be reorganised freely. Categories and series contain native collection IDs: `engineering` refers to `content/categories/engineering.md`. New articles and images need no generated imports or template changes.

Articles, pages, categories, series and gallery photos share one `image` object. Its `url` is required; `credit`, `alt` and `position` are optional. Listing headers read that same object. Set them in `content/pages/article-collection.md`, `category-collection.md`, or `series-collection.md` for the main listings, and in each category or series file for its own article listing. For example:

```yaml
image:
    url: ../assets/puzzle.jpeg
    credit: Photograph by Dalibor Karlović
    alt: Golden puzzle pieces against a dark background
    position: 50% 45%
```

The photo supplies the page’s light/dark palette. Omit the whole `image` object for a plain heading. `url` uses Astro’s native local-image validation and optimization. A supplied `alt` is used where the photo conveys content; decorative avatars keep empty alt text because the linked author name already identifies them. `position` accepts two percentages from 0% to 100%; omitted positions preserve each placement’s existing crop.

The About entry also supplies the homepage’s introduction card through `homepageTeaser`: `title` and `summary` control its heading and paragraph. About’s top-level `eyebrow` supplies the label on the About page and homepage card; its `linkLabel` supplies both homepage About buttons. The card shares the About image. Omit the group to hide it.

About’s `homepageHero.roles` and `homepageHero.introduction` supply the hero’s role line and introduction paragraph. The site-wide logo tagline comes from `brandTagline` in the Homepage entry.

Homepage also owns the remaining homepage and footer content: `hero` (display name and footnote), `ticker`, `writing` (section heading), `gallery` (heading, credit, images, alt text and captions), and `footer` (eyebrow, multiline heading, description and copyright name/location). The footer adds the current year automatically. Homepage’s `title` supplies the shared brand and article author name.

The 404 page’s copy lives in `content/pages/not-found.md`. Standard interface text remains in the theme: navigation and article controls, pagination, empty states, consent controls, image-palette labels and the optional interactive terrain demo. Social-profile URLs remain in `src/data/site.ts`.

The Articles entry’s `linkLabel` supplies “Explore my writing” in the homepage hero, collection eyebrows and article-footer archive button. Its `title` supplies the homepage archive button (“All articles”), and `discussionHeading` sets the discussion prompt. Article headings and footers share the same author link; Reddit and Hacker News discussions use branded icon buttons.

Drafts appear in `npm run dev` and are excluded from production article routes, listings, counts, and sitemap. Articles are sorted newest first; series contents are oldest first. Listings use Astro's native pagination with 20 records per page.

Content uses Astro's normal Markdown rendering, GFM, footnotes, and Shiki highlighting. Native heading IDs are the default. Explicit HTML aliases in migrated articles keep old `#content-...` links working. Captions use standard `<figure>`/`<figcaption>` HTML; expandable notes use `<details>`/`<summary>`. Add `class="collapsible-aside"` to a details element for the shared editorial aside: tinted expanded background, protruding exclamation badge, and a bouncing plus/minus control that emits a subtle diagonal sweep on both open and close. Its timing scales with travel distance, and it respects reduced motion. The native disclosure works without JavaScript. Put blank lines around Markdown inside HTML blocks. No custom YASSG syntax or compatibility parser remains.

## Verification

```sh
npm test
npm run check
npm run build
npm run check:output
npm run test:integration
```

The integration check temporarily creates content/media fixtures (including an article with a co-located image), exercises native image processing, empty taxonomies, drafts, invalid references, missing slugs, misplaced or misdated article folders and the 20/21-record pagination boundary, then removes its fixtures and rebuilds. Run it separately from development/build processes. `check:output` checks the migrated site's baseline content, local links/assets/anchors, taxonomy counts, metadata, and sitemap. The CommonMark demonstration's illustrative repository link is explicitly exempted.

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

The theme keeps its normal scale through a 2560 CSS-pixel viewport, then smoothly enlarges rem-based text, spacing and content widths up to 150% at 3840 pixels. This gives unscaled 4K displays the proportions of a 150%-scaled desktop while leaving smaller viewports unchanged. Browser/OS scaling reduces the effective viewport, so the adjustment eases off automatically; browser font preferences remain the base size.

Every article with an image gets a palette extracted by Sharp at build time. The generated light/dark roles colour the article, navigation and footer, with visible swatches beside the photo attribution. Neutral/absent images have a warm fallback. The site honors system theme changes live, without a switcher. No client-side colour extraction or external font requests are needed.

Internal theme links use `DestinationLink.astro` to preview the destination’s palette on hover and keyboard focus. The build-time registry resolves content routes, article slug overrides and pagination, and shares the same light/dark roles with the destination page. Only button-styled links use a matched accent/text pair with a hover background. Ordinary links, including article titles and menu items, colour their text and underline; image links keep their appearance. The logo and article attribution colour the name and outline the mark/avatar, while the logo tagline and reading time stay unchanged. Current-page links stay highlighted, while active parent sections retain the current page’s colours. Home and About intentionally keep the original warm palette (`defaultPalette`), including their link previews. External social/discussion icons retain their brand colours. Use `DestinationLink` in new theme components; links inside ordinary Markdown retain their existing styling.

Article listing buttons hide a silent “Pocket disco” easter egg. A one-second hover or keyboard focus starts four rhythmic “Read it!” phrases, followed by a final thud and 1.4-second hold. The spotlights fade out one at a time, then the stage and text ease back to idle before five seconds of calm. Leaving the button, pressing Escape, hiding the page or enabling reduced motion cancels the animation. The normal link destination and accessible name stay unchanged. The standalone comparison is in `docs/design/just-read-it.html`.

Images in `content/` are processed by Astro’s native image pipeline into responsive variants. Larger replacements keep the component’s intended display sizes (for example, 720 × 460 article cards and 1920-wide hero requests); the browser selects a suitable generated variant. Palette extraction samples at most 80 × 60 pixels and is cached by image and accent. Images remain optional.

Optional frontmatter:

```yaml
image:
    url: ./teambuilding.jpeg
    credit: Photograph by Dalibor Karlović
    alt: Sunlit meadow grasses
    position: 50% 45% # focal point, each coordinate 0–100%
experience:
    accent: "#006b65" # optional; adjusted if needed for legibility
    layout: box # heading experiment layout; "box" (default) is the only one so far
    aspect: 16/9 # heading experiment frame ratio (default 16/9)
```

### Heading experiments

An article gets an interactive heading by placing an `experiment.astro` next to its `index.md`; no registry or frontmatter switch is needed. The site supplies the frame (the `layout`, currently a bordered `box` at the chosen `aspect`, with a taller minimum on phones) and the experiment just fills it edge to edge. The component receives `article` and its resolved `palette` as props, so it can match the article's colours, for example when building an embed URL at build time.

```text
content/articles/2026/2026-11-03-introducing-diapason/
    index.md
    experiment.astro   # markup and an optional <script>; may import sibling files
    experiment.css     # optional styles, linked only on this article
```

Put styles in `experiment.css`, not in a `<style>` block: Astro bundles component styles by module graph, so they would load on every article. The build rejects `<style>` in an experiment. Scripts are fine; they load only where the experiment renders. Global touches can be scoped with `body[data-article]` because the file only loads on its own article; the shared header/footer can consume `--paper`, `--ink`, `--accent`, `--panel` and the root `--*-light`/`--*-dark` values. Avoid fixed colours. A new layout is a component in `src/components/experiments/` plus a value in the `layout` enum.

An experiment's `<script>` runs only on its own article, which makes it the place for article-specific behaviour beyond the heading. For example, the Diapason draft's script also themes the Diapason iframe in its Markdown body (written with `data-diapason-src` instead of `src`) from the page palette.

Two drafts show the range: `/colour-field-experiment` (a canvas terrain study with keyboard light controls, pause, visibility gating and live reduced-motion changes) and `/introducing-diapason` (an embedded Diapason tune editor themed from the article palette). Drafts are visible in development only and excluded from production routes, counts and sitemap.

Markdown prose stays readable while images, figures, code, tables and videos can use the wider article canvas. Shiki highlighting is static. Add a code caption using a standard HTML figure around the fenced block, as the existing articles already do. Captions are centred; code and wide tables scroll within their own surfaces on small screens. Keep descriptive image alt text and add captions/transcripts to authored videos.

Run browser checks against a built preview with `BROWSER_URL=http://127.0.0.1:4321 node scripts/check-browser.mjs`. Set `CHROMIUM_PATH` if using a downloaded Chromium rather than installed Google Chrome. These checks cover four viewport widths, both themes, mobile menu/Escape, consent, captions, palette visibility and local media. They intentionally do not contact the deployed site.
