import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://kiddo-psh.github.io',
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
