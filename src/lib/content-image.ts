import type { SchemaContext } from "astro:content";
import { z } from "astro/zod";

export const contentImage = (image: SchemaContext["image"]) =>
    z.object({
        url: image(),
        credit: z.string().optional(),
        alt: z.string().optional(),
        position: z
            .string()
            .regex(/^\d{1,3}% \d{1,3}%$/, "Use two percentage coordinates")
            .refine(
                (value) => value.split(" ").every((v) => parseInt(v) <= 100),
                "Image coordinates must be between 0% and 100%",
            )
            .optional(),
    });

export type ContentImage = z.infer<ReturnType<typeof contentImage>>;
