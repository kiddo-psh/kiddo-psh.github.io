import { portfolioCases } from '../data/portfolio';

export function sortProjects<T extends { id: string; data: { order: number } }>(entries: T[]): T[] {
  const rank = (id: string) => portfolioCases.findIndex((item) => item.id === id);
  return [...entries].sort((a, b) => {
    const ar = rank(a.id);
    const br = rank(b.id);
    const byCase = (ar < 0 ? Number.MAX_SAFE_INTEGER : ar) - (br < 0 ? Number.MAX_SAFE_INTEGER : br);
    return byCase || a.data.order - b.data.order;
  });
}
