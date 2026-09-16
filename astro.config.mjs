import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import pagefind from 'astro-pagefind';
import sitemap from '@astrojs/sitemap';
import inlineSvg from './src/lib/inline-svg.mjs';

export default defineConfig({
  site: 'https://kiddo-psh.github.io',
  integrations: [pagefind(), sitemap()],
  markdown: {
    /* 기본 처리기 그대로에 본문 도해 인라인 플러그인만 얹는다 — src/lib/inline-svg.mjs 참조 */
    processor: satteri({ hastPlugins: [inlineSvg()] }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
