import type { CollectionEntry } from 'astro:content';
import { SITE } from '../site.config';

/** 목록에 보일 프로젝트. listed가 false인 것은 빼고 order 오름차순. */
export function listProjects(entries: CollectionEntry<'projects'>[]): CollectionEntry<'projects'>[] {
  return entries.filter((p) => p.data.listed).sort((a, b) => a.data.order - b.data.order);
}

/** 상세 페이지 없이 바깥 서비스로 바로 가는 프로젝트. 목록 맨 끝에 붙는다. */
export const EXTERNAL_PROJECTS = [
  {
    title: 'Agentpedia',
    href: SITE.links.agentpedia,
    summary: 'AI 에이전트 시대의 사람과 사례를 정리하고, 에이전트가 MCP로 바로 가져다 쓰게 한 백과사전입니다.',
    logo: '/images/projects/agentpedia/logo.png',
  },
] as const;
