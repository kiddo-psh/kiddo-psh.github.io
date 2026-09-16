import rawBriefings from '../data/briefings.json';

export type BriefingType = 'article' | 'interview' | 'paper';
export type BriefingTag =
  | 'agent-design'
  | 'coding-agent'
  | 'tools-mcp'
  | 'memory-context'
  | 'evaluation'
  | 'security'
  | 'multi-agent'
  | 'model-inference';

export interface Briefing {
  id: string;
  type: BriefingType;
  title: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  generatedAt: string;
  basis: string;
  tags: BriefingTag[];
  preview: string;
  keyPoints: string[];
  limitations: string[];
  takeaway: string;
}

export const briefingLabels: Record<BriefingType, string> = {
  article: '기사',
  interview: '인터뷰',
  paper: '논문',
};

export const briefingTagLabels: Record<BriefingTag, string> = {
  'agent-design': '에이전트 설계',
  'coding-agent': '코딩 에이전트',
  'tools-mcp': '도구·MCP',
  'memory-context': '메모리·컨텍스트',
  evaluation: '평가',
  security: '보안',
  'multi-agent': '멀티 에이전트',
  'model-inference': '모델·추론',
};

export const briefings = (rawBriefings as Briefing[])
  .slice()
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
