export const SITE = {
  url: 'https://kiddo-psh.github.io',
  title: 'kiddo-psh',
  author: 'kiddo-psh',
  // TODO(본인): 실제 문구로 교체
  tagline: '백엔드 개발자',
  description: '백엔드 개발자 kiddo-psh의 기록. 기술, 프로젝트, 회고, 생각을 씁니다.',
  links: {
    github: 'https://github.com/kiddo-psh',
    email: 'asded5655@naver.com',
  },
  // Task 10에서 giscus 발급 후 채운다. 비어 있으면 댓글이 렌더되지 않는다.
  giscus: {
    repo: '',
    repoId: '',
    category: 'Announcements',
    categoryId: '',
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
