import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/** draft를 제외하고(프로덕션 빌드에서만) 최신순으로 정렬한 글 목록 */
export async function getVisiblePosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) =>
    import.meta.env.PROD ? data.draft === false : true,
  );
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

/**
 * 읽는 시간(분). 코드블록과 마크다운 기호를 걷어낸 뒤 글자 수로 계산한다.
 *
 * 한국어는 단어 단위로 세면 실제 분량을 크게 빗나가므로(조사가 붙어 어절이
 * 길다) 분당 500자를 기준으로 잡았다. 코드블록을 제외하는 이유는 코드가
 * 산문보다 훨씬 느리게 읽히지만 글자 수는 많아서, 포함하면 실제보다 짧게
 * 나오는 게 아니라 길게 나와 신뢰를 잃기 때문이다. 최소 1분.
 */
export function readingMinutes(body: string | undefined): number {
  if (!body) return 1;
  const text = body
    .replace(/```[\s\S]*?```/g, '')   // 펜스 코드블록
    .replace(/`[^`]*`/g, '')          // 인라인 코드
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // 링크·이미지는 라벨만 남김
    .replace(/^#{1,6}\s+/gm, '')      // 제목 기호
    .replace(/[*_>|-]/g, '')          // 나머지 마크다운 기호
    .replace(/\s+/g, ' ')
    .trim();
  return Math.max(1, Math.round(text.length / 500));
}

/** 같은 카테고리의 다른 글을 최신순으로 limit개 */
export async function getRelatedPosts(current: Post, limit = 3): Promise<Post[]> {
  const posts = await getVisiblePosts();
  return posts
    .filter((p) => p.id !== current.id && p.data.category === current.data.category)
    .slice(0, limit);
}
