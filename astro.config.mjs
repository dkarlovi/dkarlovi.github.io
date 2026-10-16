import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
const url = new URL(process.env.BASE_URL || "https://dkarlovi.github.io");
export default defineConfig({
    site: url.origin,
    base: url.pathname.replace(/\/$/, "") || "/",
    output: "static",
    image: { layout: "constrained" },
    trailingSlash: "never",
    integrations: [sitemap({ filter: (page) => !page.endsWith("/404") })],
    markdown: { shikiConfig: { theme: "github-dark" } },
    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    silenceDeprecations: [
                        "import",
                        "global-builtin",
                        "color-functions",
                        "if-function",
                    ],
                    quietDeps: true,
                },
            },
        },
    },
});
