// NOTE: This canvas renderer takes raw RGB values and cannot read CSS custom
// properties, so the colors below duplicate the *light* theme tokens defined
// in `src/styles/tokens.css` (--bg, --text, --text-dim, --accent). If those
// tokens change, update the RGB triples here too:
//   --bg        #FBFAF7 -> [251, 250, 247]
//   --text      #23211D -> [35, 33, 29]
//   --text-dim  #57534A -> [87, 83, 74]
//   --accent    #1D6B4F -> [29, 107, 79]
import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';

const posts = await getCollection('posts');
const projects = await getCollection('projects');

const pages: Record<string, { title: string; description: string }> = {};
for (const p of posts) {
  pages[p.id] = { title: p.data.title, description: p.data.description };
}
for (const p of projects) {
  // `project-` 접두사로 posts와 슬러그가 겹치는 사고를 막는다.
  pages[`project-${p.id}`] = { title: p.data.title, description: p.data.summary };
}

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    bgGradient: [[251, 250, 247]],
    border: { color: [29, 107, 79], width: 24, side: 'inline-start' },
    padding: 60,
    font: {
      title: {
        size: 58,
        weight: 'Bold',
        color: [35, 33, 29],
        lineHeight: 1.3,
        families: ['Pretendard'],
      },
      description: {
        size: 28,
        weight: 'Normal',
        color: [87, 83, 74],
        lineHeight: 1.5,
        families: ['Pretendard'],
      },
    },
    fonts: ['./fonts/Pretendard-Bold.woff2', './fonts/Pretendard-Regular.woff2'],
  }),
});
