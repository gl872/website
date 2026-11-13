# Krue website

Marketing site for Krue: homepage, blog, and privacy policy. The design is Concept A2 (Grace's Nov 2026 handoff). Built with [Astro](https://astro.build), static output, deployed by Netlify from `main`.

## Project structure

```
src/
  layouts/Base.astro         head meta, OG tags, JSON-LD, header/footer, loads site.js
  pages/index.astro          homepage
  pages/blog/index.astro     blog listing (featured card, filters, grid)
  pages/blog/[slug].astro    article template
  pages/privacy.astro        privacy policy (PRIVACY_UPDATED sets "Last updated")
  pages/404.astro            not-found page
  pages/llms.txt.ts          llms.txt, built from the blog posts
  components/                Header, Footer, ClosingStart, Analytics (GTM + cookie banner), blog/*
  scripts/site.js            waitlist + updates pop-ups, touch glow (every page)
  scripts/home.js            hero untangle, "How it works" steps
  scripts/blog.js            blog category filters
  lib/blog.ts                category colors, read time, post ordering
  lib/rehype-krue.mjs        Markdown → quote / "Try this" / captioned image styles
  content/blog/              *.md posts (written in Pages CMS)
  content.config.ts          blog collection schema
  styles/                    tokens.css (design system) + site.css (shared site styles)
public/
  assets/                    logos, founder photo, partner logos
  uploads/                   Pages CMS media folder
  _redirects                 Netlify 301s for retired URLs
```

## Commands

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the local dev server at `localhost:4321` |
| `npm run build` | Build the production site to `./dist/` |
| `npm run preview` | Preview the production build locally |

## Environment variables

Copy `.env.example` to `.env` and set the same variables in Netlify.

- `PUBLIC_INTAKE_URL`: the Google Apps Script web app that saves waitlist sign-ups to the Waitlist tab of the Krue intake sheet. The pop-up sends JSON and expects `{"ok":true}`.
- `PUBLIC_UPDATES_URL`: the Apps Script for "Get updates from Krue" (investors, partners, press). It saves rows to an Updates tab and emails Grace.
- `PUBLIC_GTM_ID`: Google Tag Manager. Accepting the cookie banner grants analytics only. Ad signals stay denied, and a Global Privacy Control signal counts as Decline. Keep ad pixels and session recording out of the container.

If either form URL is unset, that pop-up shows an error instead of sending anything.

Any link ending in `#start` or `#waitlist` opens the waitlist pop-up, and any link ending in `#updates` opens the updates pop-up. `krue.io/#waitlist` and `krue.io/#updates` open them on page load.

## Blog

Posts are Markdown files in `src/content/blog/`, matching the schema in `src/content.config.ts`. Only posts with `draft: false` are built and listed. Optional fields: `highlight` (title word to underline), `in_short` (up to 3 takeaways), `author`, `featured` (pin to the featured card), `cover`. Read time is calculated from the body.

Markdown styles: `> quote` becomes a pull-quote card, `> **Try this:** …` becomes a green tip box, and `![alt](src "caption")` on its own line becomes a captioned image. Written through [Pages CMS](https://pagescms.org) (`.pages.yml` at the repo root) once this repo is connected there.
