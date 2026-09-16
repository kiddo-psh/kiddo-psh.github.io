export const SITE = {
  url: 'https://kiddo-psh.github.io',
  title: 'kiddo-psh',
  author: 'kiddo-psh',
  tagline: 'AI 파이프라인 · 백엔드 개발자',
  description: '판정 기준을 숫자로 만드는 개발자 kiddo-psh의 기록. 기술, 프로젝트, 회고, 생각을 씁니다.',
  /*
   * 홈 첫 화면의 선언문. 소개 페이지 첫 문단에만 있던 문장을 끌어올렸다 —
   * 사이트에서 제일 할 말이 있는 문장이 660px 본문 안에 19px로 묻혀 있었고,
   * 정작 홈은 아바타와 목록으로 시작해서 들어갈 문이 없었다.
   * 줄바꿈은 Hero가 pre-line으로 그대로 살린다. 어절 묶음이 갈리지 않게 손으로 정한다.
   */
  statement: '만드는 것보다\n기준 정하는 게 더 어렵다',
  /*
   * 선언문 아래 리드. 소개 페이지의 문단을 통째로 옮기면 두 페이지가 같은 말을
   * 두 번 하게 되므로, 이 블로그가 무엇을 쓰는 곳인지만 한 문장으로 둔다.
   * 근거를 어떻게 다루는지(세 가지 규칙)는 소개에서 이어서 읽는다.
   */
  lead: '뭘 만들었는지보다, 왜 그렇게 판단했는지를 써요.',
  links: {
    github: 'https://github.com/kiddo-psh',
    email: 'asded5655@naver.com',
  },
  // Task 10에서 giscus 발급 후 채운다. 비어 있으면 댓글이 렌더되지 않는다.
  giscus: {
    repo: 'kiddo-psh/kiddo-psh.github.io',
    repoId: 'R_kgDOT27PKg',
    category: 'Announcements',
    categoryId: 'DIC_kwDOT27PKs4DDRqY',
  },
} as const;

/**
 * layout: 'doc'  → 넓은 본문 + 좌측 목차 (기술글)
 * layout: 'read' → 좁은 본문 + 목차 없음 + 세리프 리드문 (에세이·회고)
 */
export const CATEGORIES = [
  { id: 'dev', label: 'DEV', name: '기술', layout: 'doc' },
  { id: 'ai', label: 'AI', name: 'AI 개발', layout: 'doc' },
  { id: 'retro', label: 'RETRO', name: '회고', layout: 'read' },
  { id: 'essay', label: 'ESSAY', name: '생각', layout: 'read' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export function getCategory(id: string) {
  const found = CATEGORIES.find((c) => c.id === id);
  if (!found) throw new Error(`알 수 없는 카테고리: ${id}`);
  return found;
}
