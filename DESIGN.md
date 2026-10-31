---
name: Colour Field — Dalibor Karlović
description: Warm, photographic, editorial, and lightly playful.
colors:
  paper-light: "#f7eddd"
  ink-light: "#311c18"
  muted-light: "#725c50"
  accent-light: "#b7352d"
  accent-ink-light: "#fff8ec"
  panel-light: "#eddfc6"
  line-light: "#b29980"
  paper-dark: "#311c18"
  ink-dark: "#f7eddd"
  muted-dark: "#c7aa98"
  accent-dark: "#ff9f85"
  accent-ink-dark: "#311c18"
  panel-dark: "#432a22"
  line-dark: "#967361"
  control-line: "color-mix(in srgb, var(--line) 75%, var(--ink))"
  brand-github: "#181717"
  brand-twitter: "#1da1f2"
  brand-youtube: "#ff0033"
  brand-linkedin: "#0a66c2"
  brand-reddit: "#ff4500"
  brand-hacker-news: "#ff6600"
  brand-surface-light: "#ffffff"
  brand-surface-dark: "#181717"
typography:
  display:
    fontFamily: Manrope, sans-serif
    fontWeight: 600
    letterSpacing: -0.055em
  display-emphasis:
    fontFamily: Georgia, serif
    fontWeight: 400
  headline:
    fontFamily: Manrope, sans-serif
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: -0.055em
  card-title:
    fontFamily: Manrope, sans-serif
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.04em
  reading-heading:
    fontFamily: Manrope, sans-serif
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.035em
  body:
    fontFamily: '"DM Sans", sans-serif'
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.65
  article-body:
    fontFamily: '"DM Sans", sans-serif'
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.85
  label:
    fontFamily: '"DM Sans", sans-serif'
    fontSize: 0.6875rem
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: 0.13em
  button:
    fontFamily: '"DM Sans", sans-serif'
    fontSize: 0.8125rem
    fontWeight: 500
    lineHeight: 1.5
  code:
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace'
    fontSize: 0.875rem
    lineHeight: 1.9
rounded:
  control: 0.25rem
  code: 3px
  swatch: 1px
  pill: 3rem
spacing:
  gutter-min: 1.375rem
  gutter-max: 5.25rem
  section: 5rem
  section-mobile: 3rem
  grid-column: 2.25rem
  grid-row: 3rem
  button-inline: 1.125rem
  button-block: 0.75rem
components:
  button-default:
    backgroundColor: "{colors.panel-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.control}"
    padding: 0.75rem 1.125rem
    typography: "{typography.button}"
  button-hover:
    backgroundColor: "{colors.ink-light}"
    textColor: "{colors.paper-light}"
  button-active:
    backgroundColor: "{colors.accent-light}"
    textColor: "{colors.accent-ink-light}"
  icon-link:
    width: 2.75rem
    height: 2.75rem
    padding: "0"
    rounded: "{rounded.control}"
  read-more:
    width: 12rem
    height: 4rem
    padding: "0"
    rounded: "{rounded.control}"
  article-card:
    backgroundColor: transparent
    padding: "0"
    rounded: 0px
  taxonomy-card:
    padding: 2rem
    rounded: "{rounded.control}"
  category-link:
    backgroundColor: transparent
    textColor: inherit
  experiment-range:
    width: 5.625rem
---

# Design System: Colour Field

## Overview

**Creative North Star: "Colour Field"**

Colour Field is warm, photographic, editorial, and lightly playful. Large photographs and tightly tracked headings give the site its presence; generous open space, small labels, and compact controls support reading and exploration. The current, recently approved design is the baseline for future refinement.

Home and About retain the original warm palette. Other content can supply its own photographic color field while preserving the same semantic roles, typography, and component language. Components are compact and understated, with playful details; depth belongs mainly to photographic overlays, the mobile menu, and opt-in experiments.

**Key Characteristics:**

- Photography supplies both imagery and page color.
- Large Manrope headings, DM Sans reading text, and selective Georgia italics.
- Open article cards, thin borders, tonal panels, and small-radius controls.
- System-driven light/dark themes and destination-color link previews.
- Playful motion stays local and honors reduced-motion preferences.

This record captures the existing implementation, not a redesign proposal. Sources: `src/styles/global.css`, `src/styles/article.css`, `src/styles/read-more.css`, `src/lib/palette.ts`, `src/lib/content-palettes.ts`, and the components under `src/components/`. The approved historical brief is `docs/superpowers/specs/2026-10-16-colour-field-design.md`; current code governs where later refinements differ. Representative home, archive, About, and article pages were rendered at 1440px and 390px in both themes during documentation. This is an implementation record, not an accessibility or performance audit.

## Colors

Warm paper, brown ink, vermilion, and peach define the original palette. Frontmatter records the exact default tokens; photographic palettes are generated values, not a second fixed brand palette.

### Primary

- **Vermilion** (`accent-light`): the default light-theme accent for the identity mark, emphasis, ticker, links, and interactive states.
- **Peach** (`accent-dark`): the corresponding dark-theme accent. Use its paired accent ink for filled surfaces.
- **Accent ink** (`accent-ink-light/dark`): text on accent backgrounds, including selection and active controls.

### Neutral

- **Warm paper** and **brown ink** (`paper-light`, `ink-light`): the default reading canvas and foreground; their roles exchange in the dark theme.
- **Muted brown** and **light clay** (`muted-light/dark`): metadata, summaries, and secondary text.
- **Sand panel** and **dark brown panel** (`panel-light/dark`): buttons, notices, disclosures, and the About introduction panel.
- **Warm rule** (`line-light/dark`): quiet dividers and the source for derived control outlines.

Control outlines use the derived `control-line` role: the page’s line color mixed with its ink. This adds definition to interactive boundaries while quiet dividers retain the original line role. The palette generator and its output colors remain unchanged. The sidecar’s synthesized tonal ramps are preview aids, not additional production colors.

### Photographic and external colors

The owner compared the current palettes with standard Material and custom warm HCT mappings in `prototypes/theme-comparison/` and preferred the current output wherever they differed. Standard Material felt sterile and harsh; the warm mapping offered no compelling improvement. Preserve the current palette character and generator during polish. This decision concerns the candidates reviewed, not every possible use of Material Color Utilities. Fix demonstrated contrast defects locally without replacing the overall palette.

`src/lib/image-palette.ts` samples images at build time; `createPalette` derives light/dark semantic roles in CIELAB/LCH, maps chroma into the sRGB gamut, and checks explicit accent overrides for contrast. Pages without usable image colors receive the generator’s fallback; do not assume it equals the original home palette. Home and About explicitly use `defaultPalette`. The article/collection palette also reaches shared navigation, footer, and consent UI. System-theme changes apply live, without a manual switcher or client-side image sampling.

Photo-backed headings use dark-paper gradients and light foreground roles even in the light theme. Small four-color swatches accompany image attribution. External social/discussion icons use their own recorded brand colors on hover/focus; those colors are identity cues, not extra site accents.

**The Semantic Palette Rule.** Shared surfaces use paper, ink, muted, accent, accent-ink, panel, and line roles. Home and About keep the original palette; image-derived pages may change every role together.

## Typography

**Display and headings:** locally bundled Manrope, with sans-serif fallback; normally semibold, tightly tracked, and balanced. **Body and controls:** locally bundled DM Sans, with sans-serif fallback. **Selective contrast:** Georgia italics for the emphasized surname and blockquotes. **Code:** the system monospace stack recorded in frontmatter, with static GitHub Dark syntax highlighting.

The hierarchy uses fluid sizes rather than a fixed modular ratio. Frontmatter records shared role properties; responsive sizes below remain CSS expressions.

- **Home display:** `clamp(4.75rem, 7.4vw, 8rem)`, line-height 1.01; rises to 9rem at 1700px. At 800px and below: `clamp(4.5rem, 9vw, 6.5rem)`; at 540px and below: `clamp(3.5rem, 16vw, 4.75rem)`, line-height 1.02. Georgia emphasis retains its own normal weight.
- **Article display:** `clamp(3rem, 6vw, 6.5rem)`, line-height 1.02, up to 19ch. At 540px and below: `clamp(2.625rem, 11vw, 3.75rem)`, up to 15ch. Opt-in experimental heroes use the smaller sizes already defined in article CSS.
- **Section and card headings:** section headings use `clamp(2rem, 3vw, 2.5rem)` with -0.04em tracking; card headings use `clamp(1.5rem, 2.4vw, 2.25rem)` with the card-title role. The About introduction heading also uses -0.04em tracking. Display headings retain the shared -0.055em tracking.
- **Reading headings:** prose h1–h3 use the reading-heading role so smaller headings have more open tracking and line spacing without changing the display identity.
- **Body:** shared interface text follows the body token. Article paragraphs/list items use the article-body token, changing to 1rem/1.8 at 540px and below. Article summaries are 1.125rem/1.65, reducing to 1rem on mobile.
- **Labels:** eyebrows use the label token and uppercase. Category links are 0.6875rem in both cards and heroes, with 0.08em tracking on cards and 0.12em in article heroes. They have a 1.5rem minimum target height and remain text links rather than filled chips.
- **Code and captions:** code retains its dark surface in either theme; captions are centered, muted, and smaller than prose. Code scales to 0.75rem on mobile.

**The Readable Center Rule.** Prose stays within the reading measure; rich media can occupy the wider canvas without widening ordinary paragraphs.

## Layout

The page gutter is fluid (`--space: clamp(1.375rem, 5vw, 5.25rem)`). Prose has a 43rem maximum reading measure; wide figures, code, tables, video, iframes, and disclosures can reach 74rem. Article content uses a three-column grid that centers paragraphs and lets rich blocks span the canvas. Wide code and tables scroll within their own surfaces. Code blocks inside lists use the same canvas width as other code blocks, accounting for list indentation rather than reducing their width. At 540px and below in portrait orientation, code blocks extend to both viewport edges with minimal internal padding. The 404 recovery link uses the shared button treatment.

Sections generally use the recorded section spacing, reduced on small screens. Article grids have two equal columns with the recorded column/row gaps; at 540px they become one column with a 2.5rem gap. Archive layouts include a 13rem category sidebar and 4rem gap; at 1100px the sidebar stacks. Taxonomy collections use three columns, two at 800px, and one at 540px.

The portrait-led homepage layers text over a photo fading into paper. On desktop the photo starts at 26% of the width; at 800px it starts at 20%; at 540px it spans the width with a 29rem photo height and fades completely into paper by 26rem, keeping the copy below the portrait. Mobile gallery headings stack their credit beneath the title; at 380px and below the writing heading and archive action also stack. Article heroes use a near-viewport photographic field; collection photo headings are shorter. Optional missing-image layouts preserve a readable header.

At 800px the desktop navigation becomes a native details menu; at 540px the logo tagline disappears and footer/gallery layouts stack. An additional 1000px breakpoint adjusts experimental article headers. The root rem scale stays normal through a 2560 CSS-pixel viewport and smoothly reaches 150% at 3840px, respecting browser font preferences and effective viewport changes from zoom.

## Elevation & Depth

Flat editorial surfaces, with depth reserved for overlays and experiments. Open cards have no background, border, padding, or shadow. Panels establish tonal separation; fine rules divide header/footer, tables, and controls. Gradients over photography provide legibility. Homepage navigation has a localized blurred dark scrim; this is not a global frosted-glass treatment.

The mobile menu uses `0 1rem 2rem #0002`; the optional heading experiment uses `0 1.5rem 4rem #0002`. Article titles and photograph credits use localized text shadows. The sidecar records those effects separately from primitive tokens.

**The Flat Editorial Surface Rule.** Article cards stay open and flat. Tonal panels and thin borders organize content; shadows remain local to overlays and experiments.

## Shapes

Photography and open article cards are rectangular. Buttons, icon links, taxonomy actions, and the mobile menu have restrained control corners. Portraits and the circular “dk” mark use a circular crop (50% radius); code blocks and palette swatches have their own smaller corners. Pill shapes exist for the small pill control and experiment pause button; they do not define the main button language. Borders are generally one pixel; keyboard focus is a visible accent outline (3px with 5px offset), with light foreground focus over photo-backed headers.

## Components

### Buttons and icon links

Compact and understated, with playful details. Default actions use a panel background, ink foreground, thin control-line border, control radius, and the recorded button padding. Hover/focus reverses to ink on paper; active/current actions use the accent pair. Transitions cover background, foreground, and border over 160ms. Icon buttons have a square 2.75rem hit area and 1.25rem icon. Main action links share this language rather than assuming a permanently filled accent primary button.

### Destination previews

`DestinationLink.astro` resolves the destination’s generated light/dark roles at build time. Surface-style links use its accent/ink pair on hover or focus. Text links change text/underline only. Identity links highlight the name and outline the mark/avatar without resizing; image links retain their appearance. Exact current destinations stay highlighted, while active parent sections retain current-page colors. Ordinary Markdown links retain prose styling. Branded external icons retain their own brand behavior.

### Article cards and taxonomy

Article cards are open vertical stacks: rectangular photo or typographic placeholder, small uppercase categories, tightly tracked title, date, muted summary, and a bottom-aligned read link. Summaries use 0.9375rem/1.75 for readable previews; dates and pagination use tabular numerals. Card images are 17rem tall on desktop and 15rem at 800px and below. Category links wrap with middle-dot separators. Taxonomy cards and sidebar subject links use the shared bordered action language, with name and count separated across the row; taxonomy padding reduces from 2rem to 1.5rem at 540px.

### Navigation and identity

The header pairs a circular “dk” identity with text navigation and external icon links. Home uses a larger filled mark; article pages use a smaller outlined mark. Navigation is 0.8125rem and underlines hover/current text. Header text links, footer navigation, and article back links have a 2.75rem minimum target height. Footer text is 0.75rem with compact row gaps between wrapping links. The mobile menu is a native details/summary disclosure, right aligned over a paper panel, with Escape handling. Keep the skip-to-content link and visible focus.

### Reading and media

Prose links are accented and underlined. Georgia blockquotes use an accent rule. Disclosures use a panel background, thin border, and native summary. Code always uses its static dark palette, horizontal scrolling, small corners, and a bordered surface; code and table scrollbars inherit their surrounding surface colors. Images retain authored focal positions; captions are centered. The author attribution combines a circular portrait and compact name/date/reading-time metadata. Photo palette swatches remain alongside attribution. In mobile article heroes with photographs, the publication date sits above the palette on the right, while the author on the left aligns with the palette’s bottom edge. At 380px and below, hide the generic “Image palette” label while preserving actual photo credits. Desktop retains the date beside the author. At 540px and below, article-end author and discussion controls stack and align left as one group.

### Read-link animation

The 12rem by 4rem read action preserves a still hit area and accessible link name. A one-second hover or keyboard focus starts the silent “Pocket disco” sequence, using the destination palette within the control. Leaving, Escape, hiding the page, or reduced motion cancels it. Detailed timing is implemented in `src/scripts/read-more.ts`; do not extrapolate this animation into routine navigation or body copy.

### Optional experiment and consent

The opt-in 16:9 terrain canvas includes pause and light-direction range controls. Its frame uses dark palette roles, a fine border, small corners, and the reserved experiment shadow. It supports keyboard controls, visibility gating, and reduced motion. The range control is native, with the dark accent; there is no general text-input/form system to infer from it. Consent controls reuse the page palette and DM Sans through the existing cookie-consent integration.

## Do's and Don'ts

### Do:

- Do preserve the approved Colour Field identity when polishing.
- Do use semantic palette roles in shared components and inspect both system themes.
- Do use DestinationLink for internal theme links so destination previews stay consistent.
- Do preserve image focal positions, credits, descriptive alternatives, and centered captions.
- Do keep keyboard focus visible and honor reduced-motion and forced-color behavior.
- Do treat current code as the source for exact rendered behavior; refresh this record when that behavior deliberately changes.

### Don't:

- Don’t hardcode the home palette into article or collection components.
- Don’t turn open article cards into raised, rounded panels.
- Don’t replace the selective Georgia emphasis with a site-wide serif heading system.
- Don’t add a manual theme switcher as part of routine polish; the incumbent follows system preference.
- Don’t apply destination background fills to ordinary text or image links.
- Don’t introduce new factual copy or rewrite article bodies as part of visual refinement.
