# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People visiting Dalibor Karlović’s personal site to read his writing and explore his work and interests, professional or otherwise. No narrower audience or commercial conversion goal has been established.

Dalibor is the author and publisher, using the site as a lasting home for that material.

## Product Purpose

Provide a place to publish Dalibor’s writing and showcase his work and interests. Success means visitors can discover, read, and explore that material and get to know the person behind it.

## Positioning

A personal publishing and showcase site whose scope follows Dalibor’s interests. Software engineering, consulting, photography, and experiments are represented in the current content; professional and personal material both belong here.

## Operating Context

- Content lives in repository-backed Markdown collections for articles, pages, categories, and series. Local images accompany that content.
- Visitors enter through the homepage or individual articles, browse archives and taxonomies, and follow links to Dalibor’s external profiles or article discussions.
- The existing implementation uses Astro, TypeScript, Tailwind CSS, and build-time image processing. It produces a static site for GitHub Pages.
- Pages CMS configuration is available as an optional editing interface; the site does not depend on a CMS runtime. See `README.md` for authoring, development, verification, and deployment instructions.

## Capabilities and Constraints

- Preserve published content, public article URLs and legacy heading aliases, categories, series, pagination, discussion links, metadata, and base-path support. These commitments are recorded in the approved migration/design brief at `docs/superpowers/specs/2026-10-16-colour-field-design.md`.
- Draft articles are visible during development and excluded from production publication.
- Articles support optional images, captions, code, tables, embedded media, and opt-in interactive experiments.
- Retain consent handling for analytics and the existing deployment behavior.
- The current design is recent and the owner considers it good. Future work should capture the incumbent implementation and polish it; a replacement visual identity is outside that direction unless requested.
- No specific business funnel, consulting enquiry target, or narrower editorial scope has been established.

## Brand Commitments

- The site represents Dalibor Karlović personally, based in Croatia.
- Preserve the personal authorship and breadth of interests represented by the site. Professional work need not displace photography, experiments, or other personal subjects.
- Existing copy, identity assets, and the recent approved implementation are the baseline for refinement. Do not invent biographical details, achievements, or commercial claims.

## Evidence on Hand

- `src/content/articles/`: existing writing and a draft interactive experiment.
- `src/content/pages/`: homepage, About, archive introductions, and error-page copy. The About body is currently brief placeholder content and does not establish a detailed biography.
- `src/assets/uploads/`: portrait, photographs, and article media. Preserve existing credits and descriptions; broader ownership or licensing claims have not been established.
- `src/data/site.ts`: external profile destinations.
- `src/components/`, `src/layouts/`, and `src/styles/`: the incumbent interface and behavior.
- `docs/superpowers/specs/2026-10-16-colour-field-design.md`: approved design and preservation commitments. Historical prototype paths in that document are references, not guaranteed available artifacts.

## Product Principles

1. Give writing a durable, easy-to-read home.
2. Represent the breadth of Dalibor’s work and interests, professional and personal.
3. Let real authored material carry the site’s credibility.
4. Refine the recent design while preserving content and established behavior.

## Accessibility & Inclusion

The approved brief and existing implementation establish keyboard access, reduced-motion support, system light/dark preferences, and legible contrast as requirements to preserve. Keep descriptive image alternatives, readable prose, and usable media and code on small screens. No additional audience-specific needs or formal conformance target have been established.
