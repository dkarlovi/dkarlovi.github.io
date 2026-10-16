# Colour Field — approved design

The user approved the standalone Colour Field prototypes and explicitly requested implementation in Astro. Reference artifacts: `/tmp/dkarlovi-design-preview/field.html`, `field-article.html`, and `field-article-experiment.html`.

The homepage is Dalibor’s personal landing page: larger red brand mark, portrait-led hero, name and introduction, recent writing, photography and about links. Use warm cream/vermilion in light mode and warm dark surfaces with bright accents in dark mode.

Articles retain common navigation/footer but inherit an image-derived palette. Full-viewport hero photographs sit behind the monochrome brand, article title, summary and avatar byline. Wide media and syntax-highlighted code break out of a readable text column; captions are centred. An optional 16:9 interactive experiment precedes a smaller heading. Honor live system theme and reduced-motion changes without a theme switcher.

Replace Bootstrap and obsolete theme Sass with Tailwind 4 and semantic custom properties. Derive image palette roles at build time, map colours into gamut and keep body/link contrast accessible. Allow explicit frontmatter palette and focal-position overrides. No external generation service or runtime image sampling. Preserve existing content, slugs, headings/aliases, taxonomy, pagination, discussions, analytics consent, metadata, base-path support, and deployment behavior. Refresh collection, About and 404 surfaces consistently. Do not publish or rewrite existing article bodies to insert sample text. Provide the experiment as an opt-in article setting and a draft example.
