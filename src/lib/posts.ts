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

/** 같은 카테고리의 다른 글을 최신순으로 limit개 */
export async function getRelatedPosts(current: Post, limit = 3): Promise<Post[]> {
  const posts = await getVisiblePosts();
  return posts
    .filter((p) => p.id !== current.id && p.data.category === current.data.category)
    .slice(0, limit);
}
