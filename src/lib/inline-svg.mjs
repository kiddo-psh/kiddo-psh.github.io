/*
 * 본문 도해(public/images/**.svg)를 <img>로 링크하지 않고 HTML에 그대로 심는다.
 *
 * <img>로 넣은 SVG는 제 문서라서 두 가지를 못 받았다. 페이지의 Pretendard(시스템
 * 고딕으로 떨어졌다)와 사이트의 테마 토글(OS 설정만 따라가서, 라이트로 바꿔도 그림은
 * 어두운 채였다). 인라인이면 둘 다 페이지 CSS가 그대로 적용된다.
 *
 * Astro 7의 마크다운 처리기(Sätteri)는 마크다운 안의 HTML 블록을 파싱하지 않고 raw
 * 문자열 한 덩이로 넘긴다. 그래서 hast 노드가 아니라 문자열을 고친다.
 * 파일은 여전히 public/에 두어 직접 열 수도 있고, 좁은 화면용 판을 고르는
 * <picture>는 두 장을 다 심고 CSS 미디어 쿼리로 하나만 보인다.
 */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const IMG = /<img\s+src="(\/images\/[^"]+\.svg)"([^>]*)\/?>/g;
const PICTURE = /<picture>\s*<source[^>]*media="([^"]+)"[^>]*srcset="(\/images\/[^"]+\.svg)"[^>]*\/?>\s*<img\s+src="(\/images\/[^"]+\.svg)"[^>]*\/?>\s*<\/picture>/g;

function inline(src, only) {
  let svg = readFileSync(new URL(`../../public${src}`, import.meta.url), 'utf8').trim();
  /*
   * 한 페이지에 여러 장이 들어가면 id(a·t·d)가 겹쳐 화살촉 marker가 첫 그림 것만
   * 쓰인다. 경로 해시로 앞을 붙여 갈라 둔다.
   */
  const p = 'dg' + createHash('sha1').update(src).digest('hex').slice(0, 6) + '-';
  svg = svg
    .replace(/\sid="([^"]+)"/g, (_, id) => ` id="${p}${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${p}${id})`)
    .replace(/aria-labelledby="([^"]+)"/, (_, ids) => `aria-labelledby="${ids.split(/\s+/).map((i) => p + i).join(' ')}"`)
    /* 크기는 CSS(.prose svg.dg)가 정한다. 고정 width/height가 남으면 본문 폭을 무시한다 */
    .replace(/^<svg[^>]*>/, (tag) =>
      tag
        .replace(/\swidth="\d+"\sheight="\d+"/, '')
        .replace(/^<svg /, only ? `<svg data-only="${only}" data-src="${src}" ` : `<svg data-src="${src}" `),
    );
  return svg;
}

export default function inlineSvg() {
  return {
    name: 'inline-svg',
    raw(node, ctx) {
      if (!node.value.includes('.svg')) return;
      const value = node.value
        .replace(PICTURE, (_, media, narrowSrc, wideSrc) => {
          if (!/max-width/.test(media)) return _;
          return inline(wideSrc, 'wide') + inline(narrowSrc, 'narrow');
        })
        .replace(IMG, (_, src) => inline(src));
      if (value !== node.value) ctx.replaceNode(node, { type: 'raw', value });
    },
  };
}
