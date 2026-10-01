import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

// Built from the blog collection at every build, so new published posts
// appear in llms.txt automatically.
export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL("https://krue.io");
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );

  const postLines = posts.map(
    (p) => `- [${p.data.title}](${new URL(`/blog/${p.id}`, base)}): ${p.data.excerpt}`
  );

  const body = `# Krue

> Krue helps people living with chronic illness find answers, make a plan, and stay on top of everything that happens between appointments, with a real person there to help along the way.

Krue does not diagnose or give medical advice and is not an emergency service. In a medical emergency, call 911.

## How it works

- Figure it out: bring what you're trying to understand, and Krue helps find credible information, resources, practical strategies, and useful next steps.
- Make a plan: Krue turns what matters to you into a simple plan, with things to try, questions to ask, appointments to prepare for, and resources to explore.
- Adapt as you go: a real person checks in, helps you follow through, and works through new questions with you as things change.

## Who's behind it

Krue was started by Grace Landry, who became sick with POTS and learned how much of managing chronic illness happens outside the doctor's office. It is built from lived experience and 50+ hours of conversations with people navigating chronic illness.

## Pages

- [Homepage](${new URL("/", base)}): what Krue is and how it works
- [Blog](${new URL("/blog", base)}): updates on what we're building and practical ideas for everyday life with chronic illness
${postLines.length ? `\n## Blog posts\n\n${postLines.join("\n")}\n` : ""}`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
