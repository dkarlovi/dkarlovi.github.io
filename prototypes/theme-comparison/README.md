# Colour Field palette comparison

Throwaway local prototype: current CIELAB colors versus Material Color Utilities
0.3.0, using the existing Astro pages. No production palette code is changed.

Start the main site with `npm run dev`, then from the repository root:

```sh
node --experimental-strip-types prototypes/theme-comparison/generate.mjs
node prototypes/theme-comparison/server.mjs
```

Open <http://localhost:4325>. Set `ASTRO_URL` if Astro uses a different origin;
set `PROTOTYPE_PORT` to change the comparison server’s port.

The generator deliberately uses the already-installed Material Color Utilities
package in `../diapason/node_modules`, plus this project’s Sharp and YAML
dependencies. This keeps the dependency experiment out of the site’s package
manifest and lockfile. The prototype requires that sibling checkout for
regeneration; `palettes.json` contains the generated results used by the server.

Compare the homepage, writing archive, and three differently colored articles.
Switch between light/dark, desktop/mobile viewport sizes, and side-by-side or
single views. Preview scrolling is synchronized; local content links navigate
both previews. External navigation is suppressed inside previews.

The **standard** candidate uses Material Tonal Spot dynamic roles, integrating a
neutral seed before resolving roles, as in Diapason. The **warm** candidate uses
custom HCT tone assignments and higher neutral chroma to approach Colour Field’s
existing density and warmth. It does not inherit Material dynamic-role contrast
guarantees. Both mappings have measured solid-pair contrast shown in the UI.

Photo seeds use Material Celebi quantization (32 colors) and suitability scoring
on the same 80×60 samples as the existing generator. The neutral seed is the most
populous cluster. Home uses vermilion and brown seeds from the existing palette.
This compares whole pipelines, not only color spaces. Candidate output colors may
shift away from the supplied seeds. Solid-pair checks do not cover photographic
overlays, all hover states, or constitute an accessibility audit.

The server listens on loopback only and proxies the local Astro server. Keep this
prototype separate from deployment. Source pages, content, and production theme
configuration are unchanged.

## Review outcome

The owner preferred the current palettes wherever the candidates differed.
Standard Material felt sterile and harsh; the warm mapping was not a compelling
improvement. Keep the current production generator and palette character. No
Material migration follows from this study. Continue with scoped polish, handling
any demonstrated contrast issues without replacing the overall color system.
