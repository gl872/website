// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { krueMarkdown } from './src/lib/markdown-krue.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://krue.io',
  output: 'static',
  // Retired placeholder pages. Static builds emit a meta-refresh page; add true 301s at the host if wanted.
  redirects: {
    '/terms': '/',
    '/accessibility': '/',
  },
  markdown: {
    // Astro 7's default Markdown processor, plus a plugin that maps quotes,
    // "Try this:" tips and captioned images onto the post template's styles.
    processor: satteri({ hastPlugins: [krueMarkdown] }),
  },
  integrations: [
    sitemap({
      // Keep redirect stubs out of the sitemap.
      filter: (page) => !/\/(terms|accessibility)\/?$/.test(page),
    }),
  ],
});
