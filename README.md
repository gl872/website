# Krue website

Marketing site for Krue: homepage, intake flow, and blog. Built with [Astro](https://astro.build), static output.

Built from a design handoff; see the handoff's `README.md` and `BUILD_PLAN.md` for the full spec (not included in this repo).

## Project structure

```
src/
  layouts/Base.astro        header meta, OG tags
  pages/index.astro         homepage
  pages/blog/index.astro    blog listing (+ empty state)
  pages/blog/[slug].astro   article template
  components/               Header, Footer, IntakeFlow, PostCard, ShareButtons
  content/blog/              *.md posts
  content.config.ts          blog collection schema
  styles/                    design tokens + global styles
public/
  assets/                    logos, illustrations, photos, icons
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

Copy `.env.example` to `.env` and set `PUBLIC_INTAKE_URL` to the Google Apps Script web app URL once it's deployed (see the design handoff README's "Google Apps Script (intake receiver)" section). Without it, intake submissions are logged to the browser console instead of being sent anywhere.

## Blog

Posts are Markdown files in `src/content/blog/`, matching the schema in `src/content.config.ts`. Only posts with `draft: false` are built and listed. Written through [Pages CMS](https://pagescms.org) (`.pages.yml` at the repo root) once this repo is connected there.
