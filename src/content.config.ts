import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
// Keep native entry IDs tied to filenames; URL overrides remain separate data.
const generateId = ({ entry }: { entry: string }) => entry.replace(/\.md$/, "");
const copy = z.object({ title: z.string(), summary: z.string() });
const articles = defineCollection({
    loader: glob({ pattern: "*.md", generateId, base: "./src/content/articles" }),
    schema: ({ image }) =>
        copy.extend({
            image: image().optional(),
            slug: z.string().optional(),
            publishedAt: z.coerce.date(),
            draft: z.boolean().default(false),
            categories: z.array(reference("categories")).default([]),
            series: z.array(reference("series")).default([]),
            keywords: z.array(z.string()).default([]),
            discussReddit: z.string().optional(),
            discussHackerNews: z.number().int().optional(),
        }),
});
const pages = defineCollection({
    loader: glob({ pattern: "*.md", generateId, base: "./src/content/pages" }),
    schema: ({ image }) => copy.extend({ image: image().optional() }),
});

const categories = defineCollection({
    loader: glob({ pattern: "*.md", generateId, base: "./src/content/categories" }),
    schema: ({ image }) => copy.extend({ slug: z.string(), image: image().optional() }),
});
const series = defineCollection({
    loader: glob({ pattern: "*.md", generateId, base: "./src/content/series" }),
    schema: ({ image }) => copy.extend({ slug: z.string(), image: image().optional() }),
});
export const collections = { articles, pages, categories, series };
