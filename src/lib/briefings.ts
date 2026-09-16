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

/*
 * 요약 본문 세 칸.
 *
 * 전에는 핵심 3개 · 한계 2개 · 적용 1개를 모두 적었다. 다 적으면 읽고 나서
 * 원문에 갈 이유가 없어진다 — 요약이 원문을 대체해 버린다. 그리고 한계 칸은
 * 세 건이 전부 "일부만 봤다 · 아직 검증 안 됐다"로 같아져서, 자료 얘기가 아니라
 * 면책조항이 됐다. 그 문장은 본문에서 빼 메타 줄로 보냈다.
 *
 * 그래서 칸을 셋으로 줄이고 마지막 칸의 성격을 바꿨다. open은 "내가 못 본 것"이
 * 아니라 "이 자료를 읽어야만 알 수 있는 것"이다. 그 칸이 원문 링크 바로 위에 선다.
 */
export interface BriefingBody {
  /** 핵심 주장 또는 변화 */
  what: string;
  /** 구체 하나 — 숫자, 선택지, 발언. 이게 없으면 요약이 추상적으로만 남는다 */
  concrete: string;
  /** 이 요약이 답하지 못하는 것. 원문으로 가는 이유 */
  open: string;
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
  body: BriefingBody;
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

/*
 * 칸 이름은 자료 형식마다 다르다. 같은 자리라도 논문에서 읽고 싶은 것과
 * 기사에서 읽고 싶은 것이 다르다 — 논문은 "얼마나 되나", 기사는 "나한테 언제
 * 오나", 인터뷰는 "그 사람이 실제로 뭐라고 했나"를 먼저 묻는다.
 * 특히 세 번째 칸이 원문으로 보내는 자리라, 형식마다 다른 종류의 빈자리를 가리킨다.
 */
export const bodyLabels: Record<BriefingType, Record<keyof BriefingBody, string>> = {
  paper: {
    what: '무엇을 주장하나',
    concrete: '보고된 숫자',
    open: '초록이 답하지 않는 것',
  },
  article: {
    what: '무엇이 바뀌나',
    concrete: '눈에 띄는 대목',
    open: '기사가 말하지 않는 것',
  },
  interview: {
    what: '누가 · 무엇을 말하나',
    concrete: '가장 뾰족한 대목',
    open: '확인되지 않은 것',
  },
};

export const briefings = (rawBriefings as Briefing[])
  .slice()
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
