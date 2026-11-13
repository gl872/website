import type { APIRoute } from "astro";
import { getPublishedPosts } from "../lib/blog";

// Built from the blog collection at every build, so new published posts
// appear in llms.txt automatically. Copy mirrors the home page.
export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL("https://krue.io");
  const posts = await getPublishedPosts();

  const postLines = posts.map(
    (p) => `- [${p.data.title}](${new URL(`/blog/${p.id}`, base)}): ${p.data.excerpt}`
  );

  const body = `# Krue

> An advocate in your pocket. Krue is for people with complex chronic illness, large care teams, and conditions that lack clear answers. It helps you get ready for appointments, keep track of what was said, and create one connected plan across your care.

Krue does not diagnose or give medical advice and is not an emergency service. In a medical emergency, call 911. Krue is in beta; people can join the waitlist on the homepage.

## How it works

- Get ready: tell Krue what's going on. Krue connects the dots across your appointments and helps you set goals, know what to do first, and plan what to say.
- Capture it: record the appointment (after confirming your provider has agreed) and add notes. Krue writes down what was said.
- One plan: next steps from every appointment go in one list: tests, referrals, who to see next, and things to try.
- Find your next step: ask Krue about what was said, get reminders for what's left to do, and start your next appointment where the last one ended.

## Privacy

Health information is encrypted in transit and at rest. You decide what to share and with whom, and you can access, download, or delete your information. Krue does not sell personal information.

## Who's behind it

Krue was started by Grace Landry, who got sick with POTS, was sent home with a pamphlet, and had to piece everything together on her own. Krue is supported by the CIC, the NVIDIA Inception program, and AWS Startup Programs.

## Pages

- [Homepage](${new URL("/", base)}): what Krue is and how it works
- [Blog](${new URL("/blog", base)}): what we're building, and practical ideas for life with a complex chronic illness
- [Privacy policy](${new URL("/privacy", base)}): how Krue collects, uses, and protects information
${postLines.length ? `\n## Blog posts\n\n${postLines.join("\n")}\n` : ""}`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
