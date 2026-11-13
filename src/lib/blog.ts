import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;
export type Category = Post["data"]["type"];

/** Category colors from the handoff README §5. `hl` is the title-highlight tint used in the reference. */
export const CATEGORY: Record<Category, { line: string; tint: string; label: string; hl: string }> = {
  "Company news": { line: "#F290BA", tint: "#FCE6F0", label: "#A93E72", hl: "#F9D3E4" },
  Articles: { line: "#7AD1EF", tint: "#E2F5FC", label: "#1F7FA3", hl: "#C4EBF9" },
  "Practical guides": { line: "#90C9B2", tint: "#E3F2EC", label: "#3E7F66", hl: "#CFE8DD" },
};

/** Filter-pill colors per label: [bg, fg, hover bg, hover fg]. Same table as src/scripts/blog.js. */
export const PILL: Record<"All" | Category, [string, string, string, string]> = {
  All: ["#E4EDF8", "#235592", "#235592", "#FFFFFF"],
  "Company news": ["#FCE6F0", "#A93E72", "#E2169E", "#FFFFFF"],
  Articles: ["#E2F5FC", "#1F7FA3", "#3ABAE8", "#14325A"],
  "Practical guides": ["#E3F2EC", "#3E7F66", "#90C9B2", "#14325A"],
};

/** Published posts, newest first. */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Order for the blog list: the newest post marked `featured` first, then the rest newest first. */
export function featuredFirst(posts: Post[]): Post[] {
  const pinned = posts.find((p) => p.data.featured);
  return pinned ? [pinned, ...posts.filter((p) => p !== pinned)] : posts;
}

/** Read time from the Markdown body at ~230 words per minute (minimum 1). */
export function readTime(body: string | undefined): number {
  const text = (body ?? "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links → text
    .replace(/<[^>]+>/g, " ") // HTML tags
    .replace(/[#>*_`~-]/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 230));
}

export const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export const postUrl = (p: Post) => `/blog/${p.id}/`;

/** Splits a title around the first exact match of `highlight` so it can be underlined. */
export function splitHighlight(title: string, highlight?: string): [string, string, string] | null {
  if (!highlight) return null;
  const i = title.indexOf(highlight);
  if (i < 0) return null;
  return [title.slice(0, i), highlight, title.slice(i + highlight.length)];
}
