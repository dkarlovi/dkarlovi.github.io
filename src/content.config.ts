import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { contentImage } from "./lib/content-image";
// Keep native entry IDs tied to filenames; URL overrides remain separate data.
const generateId = ({ entry }: { entry: string }) => entry.replace(/\.md$/, "");
const copy = z.object({ title: z.string(), summary: z.string() });
const experience = z
    .object({
        accent: z
            .string()
            .regex(/^#[a-fA-F0-9]{6}$/, "Use a six-digit hex colour")
            .optional(),
        stylesheet: z
            .string()
            .regex(
                /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                "Use a stylesheet name from src/styles/experiences",
            )
            .optional(),
        headingExperiment: z.enum(["none", "terrain"]).default("none"),
    })
    .default({ headingExperiment: "none" });
const articles = defineCollection({
    loader: glob({
        pattern: "*.md",
        generateId,
        base: "./src/content/articles",
    }),
    schema: ({ image }) =>
        copy.extend({
            image: contentImage(image).optional(),
            slug: z.string().optional(),
            publishedAt: z.coerce.date(),
            draft: z.boolean().default(false),
            categories: z.array(reference("categories")).default([]),
            series: z.array(reference("series")).default([]),
            keywords: z.array(z.string()).default([]),
            experience,
            discussReddit: z.string().optional(),
            discussHackerNews: z.number().int().optional(),
        }),
});
const pages = defineCollection({
    loader: glob({ pattern: "*.md", generateId, base: "./src/content/pages" }),
    schema: ({ image }) =>
        copy.extend({
            image: contentImage(image).optional(),
            brandTagline: z.string().optional(),
            eyebrow: z.string().optional(),
            heading: z.string().optional(),
            linkLabel: z.string().optional(),
            discussionHeading: z.string().optional(),
            hero: z
                .object({
                    firstLine: z.string(),
                    secondLine: z.string(),
                    footnote: z.string(),
                })
                .optional(),
            ticker: z.array(z.string()).default([]),
            writing: z.object({ title: z.string() }).optional(),
            gallery: z
                .object({
                    title: z.string(),
                    credit: z.string(),
                    photos: z
                        .array(z.object({ image: contentImage(image), caption: z.string() }))
                        .default([]),
                })
                .optional(),
            footer: z
                .object({
                    eyebrow: z.string(),
                    title: z.string(),
                    tagline: z.string(),
                    copyright: z.string(),
                })
                .optional(),
            homepageHero: z
                .object({
                    roles: z.string(),
                    introduction: z.string(),
                })
                .optional(),
            homepageTeaser: z
                .object({
                    title: z.string(),
                    summary: z.string(),
                })
                .optional(),
        }),
});

const categories = defineCollection({
    loader: glob({
        pattern: "*.md",
        generateId,
        base: "./src/content/categories",
    }),
    schema: ({ image }) => copy.extend({ slug: z.string(), image: contentImage(image).optional() }),
});
const series = defineCollection({
    loader: glob({ pattern: "*.md", generateId, base: "./src/content/series" }),
    schema: ({ image }) => copy.extend({ slug: z.string(), image: contentImage(image).optional() }),
});
export const collections = { articles, pages, categories, series };
