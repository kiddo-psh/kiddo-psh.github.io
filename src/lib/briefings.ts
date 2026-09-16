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

/*
 * 원문에서 그대로 옮긴 한두 문장과 그 번역.
 *
 * 본문을 통째로 번역해 싣는 것은 2차적저작물이라 저작권자의 허락이 필요하다.
 * 기사는 거의 허락되지 않고, arXiv 논문도 CC-BY 계열이 아니면 안 된다.
 * 반면 짧은 인용은 허용되고, 요약만 있을 때보다 근거를 직접 보여 준다.
 *
 * 그래서 이 필드는 선택이고, 채운 브리핑에서만 상세에 나타난다.
 * 여기 들어가는 문장은 원문에 실제로 있는 문장이어야 한다 — 지어내면
 * 저작권 문제가 아니라 없는 말을 남의 이름으로 싣는 문제가 된다.
 */
export interface BriefingQuote {
  /** 원문 그대로. 번역하지 않고 원어를 유지한다 */
  text: string;
  /** 우리말 옮김 */
  ko: string;
  /** 어디서 가져왔는지 — 초록, 3.2절, 12분 지점처럼 */
  where?: string;
}

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
  quote?: BriefingQuote;
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
