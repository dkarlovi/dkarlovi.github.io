# Current / suggested polish comparison

Build the suggested version, then start the comparison:

```sh
npm run build
node prototypes/polish-comparison/server.mjs
```

Open <http://localhost:4327>. `PROTOTYPE_PORT` overrides the default port.
The wrapper reuses the theme study’s comparison styling and shows all published
routes, both themes, four viewport widths, synchronized scrolling, and shortcuts
to the reading content and footer. Internal links update both previews.

**Current** serves a frozen production build captured before this polish pass,
stored outside the source tree at `/tmp/colour-field-polish-baseline`. It
deliberately stays unchanged as the suggested design evolves. Set `POLISH_BASELINE`
to use another snapshot directory. **Suggested** serves the current `dist/` build.
Both show production content so drafts do not introduce unrelated differences.
Run `npm run build` and refresh after further refinements.

To reconstruct the baseline in another checkout, build the pre-polish revision
and copy its `dist/` directory to `/tmp/colour-field-polish-baseline/` before
running the server. Do not rebuild the baseline from the polished revision: that
would erase the comparison. The original palette comparison remains on port 4325.

## Suggested refinements

- Keep the existing palettes and generator; strengthen only control outlines using existing line and ink colors.
- Open up small heading tracking and article-title line spacing; increase preview summary and category text.
- Give navigation/back/footer links 44px targets and category links 24px targets at the default root font size.
- Separate mobile hero text from the portrait, stack crowded small-screen section headings, and left-align mobile article-end controls.
- Use tabular numerals for dates/pagination and surface-matched scrollbars for code/tables.

## Verification

The existing nine tests, Astro diagnostics, production build, and output-link
validation pass. The existing browser check covers 112 page/theme/viewport
combinations, including consent rejection, menu/Escape, local images, details,
captions, and system-theme changes. A separate comparison check covers 16 paired
views, matching published content and original palette roles, target sizes,
control-outline contrast, linked navigation, and the responsive comparison shell.

The mechanical design scan reports advisory differences between the retained
fluid typography and the sampled frontmatter roles, along with existing fixed
syntax-highlighting colors. The recent Colour Field palette and display character
are deliberately retained; these findings do not justify a visual replacement.

The owner approved the polish pass, with a mobile article-hero adjustment: publication date above the palette on the right, author aligned with the palette’s bottom edge on the left. Checked three articles at 320px, 390px, and 1440px in both themes (18 combinations). Desktop date placement stays beside the author.
