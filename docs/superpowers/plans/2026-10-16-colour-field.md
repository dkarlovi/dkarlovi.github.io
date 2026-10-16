# Colour Field implementation plan

> **For agentic workers:** Implement inline with superpowers:executing-plans; use test-driven-development and verification-before-completion.

**Goal:** Port the approved standalone Colour Field design into the existing Astro site.
**Architecture:** Server-render shared brand/navigation/footer and image-derived semantic palette tokens. Keep article Markdown static and readable, with full-width media/code and optional Astro experiment components. Small native scripts handle preference changes, mobile navigation, and opt-in motion only.
**Tech stack:** Astro 7, TypeScript, Tailwind 4 Vite plugin, Sharp for build-time image sampling, native Markdown/Shiki, local Fontsource fonts, Playwright.
**Spec:** `docs/superpowers/specs/2026-10-16-colour-field-design.md` (design approved through the prototype review and explicit implementation request).

## Global constraints

- Preserve published content, routes, taxonomy/pagination, metadata, consent and BASE_URL handling.
- No Bootstrap, old theme styles, external fonts, image sampling at runtime, or theme switcher.
- Honor live system colour/motion preferences. Both hero and reading surfaces must remain legible.
- Keep changes in the current clean `refresh` checkout. No push, deployment or merge.

## Review focus

- Base-path deployments: asset, navigation, palette image lookup and pagination paths must resolve.
- Articles with no image, a neutral image, or overridden palette must have readable fallback themes.
- Nested Markdown figures/code/details/tables must keep semantics and scroll within the viewport.
- Long titles, mobile landscape and portrait crops must not collide with navigation/bylines.
- Missing/invalid theme overrides and draft experiment examples must not leak into published routes.

### Task 1: Palette and article contract

Files: `src/lib/palette.ts`, `src/lib/image-palette.ts`, `src/content.config.ts`, `.pages.yml`, `tests/palette.test.ts`.

- [x] Write failing tests for neutral/saturated pixel palettes, contrast and gamut, explicit accents and CSS role serialization.
- [x] Implement deterministic LCh palette roles and build-time Sharp sampling, with cached promises and a safe no-image fallback.
- [x] Add validated optional `experience` settings: accent, imagePosition, imageCredit, headingExperiment.
- [x] Run unit tests; document frontmatter settings.

### Task 2: Shared shell and personal homepage

Files: `astro.config.mjs`, package manifests, `src/styles/*.css`, `src/layouts/SiteLayout.astro`, shared header/footer/brand/navigation, `src/pages/index.astro`, article cards and listings.

- [x] Install Tailwind 4, local DM Sans/Manrope fonts and Sharp as a declared dependency; remove Bootstrap, Font Awesome, old fonts and Sass.
- [x] Port approved visual tokens and compositions, preserving responsive/focus/contrast behavior.
- [x] Replace Bootstrap navigation with native accessible navigation; preserve all existing destinations and social links.
- [x] Add live system-theme handling, and preserve analytics behind existing consent.
- [x] Port collection/404/About surfaces and preserve pagination and taxonomy counts.

### Task 3: Immersive article experience

Files: article route, article hero/byline/experiment components, article styles and native scripts, draft example.

- [x] Add build-time photo palette and author-controlled focal position/credit.
- [x] Keep full-width hero, avatar authorship, monochrome article brand and inherited shell palette.
- [x] Style Markdown using a breakout grid so figures, images, code, tables and video are wider than text, including nested figures/details.
- [x] Implement optional 16:9 interactive terrain experiment with keyboard light control, pause, visibility gating and live reduced-motion handling.
- [x] Add a draft-only example; preserve published content unchanged.

### Task 4: Verification and review

Files: output/browser/integration checks, README, design notes.

- [x] Update old theme-specific assertions to test semantic output and the approved design.
- [x] Run unit tests, Astro type check, static build, output validation and CMS integration (including base-path build).
- [x] Browser-check published routes, mobile menus, live themes, reduced motion, experiment, wide code/captions and overflow.
- [x] Request independent whole-change code review, fix material findings, and report evidence and any limitations.

## Progress

- Approved prototype designs and implementation request recorded. Existing branch: `refresh`; workspace clean.

- Palette tests: RED (missing module) → GREEN, 8/8 unit tests pass.
- Astro check: 46 files, 0 errors/warnings/hints. Root build: 17 pages, 6 published articles.
- Static output: 645 local targets and content/taxonomy/sitemap checks pass; `/blog/` build/output also pass.
- CMS integration: 20/21 pagination boundary, optional images, drafts, invalid references/media/slugs, and article experience/stylesheets verified.
- Browser: 112 published page/theme/viewport combinations, 0 JS or local HTTP errors. Consent rejection, native menu/Escape, live theme, captions, images and details verified.
- Draft experiment: 8 viewport/theme combinations; native keyboard light control, play/pause, 16:9 layout, stylesheet isolation and wide code verified.
- Astro development audit: 36 page/viewports, 0 accessibility warnings; 24 performance hints (viewport-dependent eager/lazy suggestions and pre-existing external demonstration images).
- Independent read-only review (`review_colour_field`): no Critical, Important or Minor findings.
- Implementation remains uncommitted on the existing `refresh` branch. No push, merge or deployment performed.
