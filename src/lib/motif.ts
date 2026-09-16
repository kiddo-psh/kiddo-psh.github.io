/**
 * 마크 타일 색을 정하는 규칙.
 *
 * 프로젝트는 order로, 글은 분류로 정한다. 둘 다 "렌더 순서"가 아니라 작성자가 정한
 * 값이라, 같은 대상이 목록·카드·상세 어디에서나 같은 색을 갖는다. 규칙을 화면마다
 * 따로 쓰면 한쪽만 고쳤을 때 같은 프로젝트가 페이지에 따라 다른 색이 된다.
 */
export type Tone = 'a' | 'b' | 'c' | 'd';

const TONES: Tone[] = ['a', 'b', 'c', 'd'];

/** 프로젝트: order 1,2,3,4 → a,b,c,d (음수·0도 안전하게 감싼다) */
export function projectTone(order: number): Tone {
  return TONES[(((order - 1) % 4) + 4) % 4];
}

/** 글: 분류마다 고정색. 색이 DEV/RETRO를 한 번 더 말해 준다 */
const BY_CATEGORY: Record<string, Tone> = { dev: 'a', ai: 'b', retro: 'c', essay: 'd' };

export function postTone(category: string): Tone {
  return BY_CATEGORY[category] ?? 'a';
}

/* 브리핑: 자료 형식마다 고정색. 목록 머리그림과 상세가 같은 색을 갖는다 */
const BY_BRIEFING_TYPE: Record<string, Tone> = { article: 'b', interview: 'c', paper: 'd', domestic: 'a' };

export function briefingTone(type: string): Tone {
  return BY_BRIEFING_TYPE[type] ?? 'a';
}
