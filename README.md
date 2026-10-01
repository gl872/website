# Krue website

Marketing site for Krue: homepage (with the Try Krue sign-up form), blog, and policy pages. Built with [Astro](https://astro.build), static output, deployed by Netlify from `main`.

## Project structure

```
src/
  layouts/Base.astro         head meta, OG tags, JSON-LD
  pages/index.astro          homepage + Try Krue form
  pages/blog/index.astro     blog listing
  pages/blog/[slug].astro    article template
  pages/llms.txt.ts          llms.txt, built from the blog posts
  pages/privacy.astro        privacy policy (terms/accessibility are noindex placeholders)
  components/                Header, Footer, ClosingBand, ShareButtons, Analytics
  content/blog/              *.md posts (written in Pages CMS)
  content.config.ts          blog collection schema
  styles/                    design tokens + global styles
public/
  assets/                    logos and founder photo
  uploads/                   Pages CMS media folder
```

## Commands

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the local dev server at `localhost:4321` |
| `npm run build` | Build the production site to `./dist/` |
| `npm run preview` | Preview the production build locally |

## Environment variables

Copy `.env.example` to `.env`. `PUBLIC_INTAKE_URL` is the Google Apps Script web app address that saves sign-ups to the Pilot tab of the Krue intake sheet. Set the same variables in Netlify.

## Blog

Posts are Markdown files in `src/content/blog/`, matching the schema in `src/content.config.ts`. Only posts with `draft: false` are built and listed. Written through [Pages CMS](https://pagescms.org) (`.pages.yml` at the repo root) once this repo is connected there.
