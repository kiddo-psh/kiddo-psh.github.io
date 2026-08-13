import { defineConfig } from 'astro/config';
import pagefind from 'astro-pagefind';

export default defineConfig({
  site: 'https://kiddo-psh.github.io',
  integrations: [pagefind()],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
