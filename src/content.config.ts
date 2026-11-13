import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Field names match .pages.yml (Pages CMS). The handoff's "category" and "summary"
// are this site's existing `type` and `excerpt`. The newer fields are optional,
// so posts written before the redesign render without edits.
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    /** Optional word or phrase from the title to underline. Must match the title text exactly. */
    highlight: z.string().optional(),
    type: z.enum(["Company news", "Articles", "Practical guides"]),
    excerpt: z.string(),
    date: z.coerce.date(),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    /** 0–3 "In short" takeaways shown at the top of the post. Empty strings are dropped. */
    in_short: z
      .array(z.string().nullable())
      .nullish()
      .transform((v) => (v ?? []).map((s) => (s ?? "").trim()).filter(Boolean).slice(0, 3)),
    author: z.string().nullish().transform((v) => v?.trim() || "Grace Landry"),
    /** Pins the post to the featured slot on /blog/. Otherwise the newest post is featured. */
    featured: z.boolean().nullish().transform((v) => v ?? false),
    draft: z.boolean().default(true),
  }),
});

export const collections = { blog };
