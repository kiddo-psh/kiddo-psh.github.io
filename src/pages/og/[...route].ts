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
import { getVisiblePosts } from '../../lib/posts';
import { SITE } from '../../site.config';

// getVisiblePosts()는 프로덕션 빌드에서 draft: true 글을 제외한다 (dev에서는 포함).
// cover가 지정된 글은 PostLayout이 생성 이미지 대신 cover를 쓰므로 여기서 제외한다.
const posts = (await getVisiblePosts()).filter((p) => !p.data.cover);
const projects = await getCollection('projects');

const pages: Record<string, { title: string; description: string }> = {};
for (const p of posts) {
  pages[p.id] = { title: p.data.title, description: p.data.description };
}
for (const p of projects) {
  // `project-` 접두사로 posts와 슬러그가 겹치는 사고를 막는다.
  pages[`project-${p.id}`] = { title: p.data.title, description: p.data.summary };
}
pages['site'] = { title: SITE.title, description: SITE.description };

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
    /*
     * OG 이미지는 빌드 타임에 satori로 렌더링되므로 웹폰트가 아니라 실제 폰트
     * 파일이 필요하다. 예전엔 레포 루트 fonts/에 1.5MB를 커밋해뒀는데, 이제
     * pretendard 패키지가 같은 파일을 주므로(sha256 동일) 거기서 읽는다.
     * 버전은 package.json 한 곳에서만 관리된다.
     */
    fonts: [
      './node_modules/pretendard/dist/web/static/woff2/Pretendard-Bold.woff2',
      './node_modules/pretendard/dist/web/static/woff2/Pretendard-Regular.woff2',
    ],
  }),
});
