import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    type: z.enum(["Company news", "Articles", "Practical guides"]),
    excerpt: z.string(),
    date: z.coerce.date(),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    draft: z.boolean().default(true),
  }),
});

export const collections = { blog };
