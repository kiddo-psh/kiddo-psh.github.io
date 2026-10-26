// Portfolio claims follow the submitted resume (2026.10). Order, periods, roles and figures
// must match it; detail pages keep the full measurement conditions.
// Keep personal ownership, team outcomes and evaluation conditions together.
// Only text a reader needs: a note or caption exists only when it changes how a number reads.
// In bullet strings, **text** is rendered as emphasis.

/** 문제 해결 사례 하나. 상황 → 해결 → 성과 순서로 읽는다 */
export interface Solution {
  title: string;
  situation: string;
  actions: string[];
  results: string[];
  /** 전후 비교 막대. 값이 작을수록 좋은 지표만 넣는다 */
  compare?: { caption: string; unit: string; rows: { label: string; before: number; after: number }[] };
}

export interface PortfolioCase {
  id: string;
  number: string;
  title: string;
  period: string;
  summary: string;
  /** 팀 규모 / 역할 (기여도) */
  team: string;
  award?: string;
  /** 담당 업무. 짧은 명사구로 */
  roles: string[];
  metrics: { value: string; label: string; note?: string }[];
  /** caption은 그림을 오해할 수 있을 때만 */
  figure?: { src: string; alt: string; caption?: string };
  solutions: Solution[];
  /** 꼭 밝혀야 할 측정 한계 한 문장 */
  boundary: string;
  links: { href: string; label: string; external?: boolean }[];
}

export const portfolioCases: PortfolioCase[] = [
  {
    id:'yumyum', number:'01', title:'yumyum', period:'2026.05 ~ 2026.09',
    summary:'사진 식단 분석, AI 영양 상담, 주간 코칭을 제공하는 LLM/VLM 기반 건강 코칭 서비스',
    team:'2명 · 팀장 · Backend & AI 서버 (60%)',
    award:'SSAFY 1학기 관통 프로젝트 최우수상 (12팀 중 1등)',
    roles:['VLM 평가셋·평가 하니스 구축','주간 코칭 Agent 라우팅','AI 영양 상담 RAG','Claude 호출 지연·토큰·비용 계측'],
    metrics:[
      {value:'0.38 → 0.77', label:'음식명 F1', note:'평가셋 31장'},
      {value:'49 → 7건', label:'과검출'},
      {value:'−37.5%', label:'Agent 호출'},
    ],
    solutions:[
      {
        title:'측정 없이 내려진 VLM 설계 결정을 평가셋으로 검증',
        situation:'“DB 조회 대신 VLM이 직접 추정해도 정확도 차이가 없다”는 결정이 측정 없이 내려져 있었습니다.',
        actions:[
          '저울 실측·포장 표기로 정답을 단 **실제 사진 31장 평가셋**과 평가 하니스 구축',
          'kcal 오차를 그램·밀도 오차로 분해하고, DB 조회 방식을 현실 규칙·oracle 상한과 같은 사진으로 비교',
          '요리명과 재료를 중복 출력하는 과검출을 찾아 프롬프트 제약 추가',
        ],
        results:[
          'DB 이름 매칭 실패 37.5% 확인 → **결론의 근거를 “이름 → 레코드 매칭 불가”로 수정**',
          '**과검출 49 → 7건, 음식명 F1 0.38 → 0.77**, 항목 kcal MAPE 34.1 → 20.8%',
        ],
      },
      {
        title:'기록에 따라 필요한 Agent만 실행',
        situation:'주간 코칭이 기록 유무와 관계없이 모든 Agent를 고정 실행했습니다.',
        actions:[
          '추가 LLM 호출 대신 **기록 상태를 읽는 테스트 가능한 규칙**으로 Agent 선택',
          'RAG 검색 거리 임계값으로 관련성 낮은 근거 차단',
        ],
        results:[
          '입력 조합 8개 × 3회 실제 API 비교에서 **Agent 호출 37.5% 감소**',
          '평균 응답 11.1 → 8.7초, 응답 성공률 100% 유지',
        ],
        compare:{caption:'평균 실행 Agent 수', unit:'개', rows:[{label:'Agent', before:4.0, after:2.5}]},
      },
    ],
    boundary:'응답시간은 비교 당시 프롬프트·검색 조건이 달라 같은 조건에서 재측정할 예정입니다.',
    links:[{href:'/projects/yumyum', label:'상세 기록'}],
  },
  {
    id:'baro', number:'02', title:'주차바로', period:'2026.07 ~ 2026.08',
    summary:'AI 엣지 디바이스가 아파트 주차 위반을 감지하고, 개인정보 노출 없이 이동 요청부터 이동 확인까지 중계하는 서비스',
    team:'7명 · AI 판정 파이프라인 (25%)',
    award:'SSAFY 2학기 공통 프로젝트 우수상 (6팀 중 2등)',
    roles:['판정 엔진(상태 머신·위반 규칙·사건 축약)','리플레이 하니스·판정 오버레이','단계별 성능 계측 도구','SQLite outbox 사건 전송'],
    metrics:[
      {value:'6.5 → 15 FPS', label:'처리 속도', note:'팀 최적화 결과'},
      {value:'154 → 67ms', label:'프레임당 처리'},
      {value:'1초 / 5초', label:'진입 확인 · 이탈 확정'},
    ],
    figure:{src:'/images/projects/baro/zone-overlay-045s-ev.jpg', alt:'파일럿 주차 모형에서 차량 검출과 주차 구역을 함께 표시한 실제 오버레이'},
    solutions:[
      {
        title:'‘주차 위반’을 위치·시간 판정 규칙으로 정의',
        situation:'프레임 단위 탐지를 그대로 위반으로 처리하면 가림·추적 단절·경계 통과에서 오탐과 중복 알림이 생겼습니다.',
        actions:[
          '구역 폴리곤 겹침·진입/이탈 확정 대기시간·사건 축약기로 판정 규칙 정의',
          '파일럿 영상 리플레이로 임계값을 실측하고, 판정 근거를 라이브 오버레이로 시각화',
          '확정 사건을 SQLite outbox에 먼저 기록하고 멱등 키로 전송',
        ],
        results:[
          '진입 확인 **1초**, 이탈 확정 **5초**를 관측값으로 결정',
          '불안정한 현장 네트워크에서도 사건 유실·중복 방지',
        ],
      },
      {
        title:'모델을 바꾸기 전에 느린 구간부터 측정',
        situation:'처리 속도가 6.5 FPS에 그쳐 추적이 끊겼지만, 어느 단계가 느린지 알 수 없었습니다.',
        actions:[
          '영상 처리를 **7단계로 나눠 재는 계측 도구** 구현',
          '추론과 왜곡 보정이 병목임을 확인 → 팀이 TensorRT FP16·GPU 보정 적용',
        ],
        results:[
          '프레임당 154 → 67ms, **6.5 → 약 15 FPS (팀 성과)**',
        ],
        compare:{caption:'프레임당 처리 시간', unit:'ms', rows:[{label:'모델 추론', before:54, after:32}, {label:'왜곡 보정', before:33, after:3}, {label:'그 외', before:67, after:32}]},
      },
    ],
    boundary:'파일럿 모형과 녹화 영상 기준이며, TensorRT·GPU 보정 구현은 팀원 몫입니다.',
    links:[{href:'/projects/baro', label:'상세 기록'}],
  },
  {
    id:'ai-dev-harness', number:'03', title:'ai-dev-harness', period:'2026.09 ~ 2026.10',
    summary:'팀의 AI 에이전트 개발 절차를 다른 저장소에 설치하는 가드레일 키트',
    team:'개인 프로젝트 · 설계·구현·측정 (100%)',
    roles:['규칙 문서·양식·hooks 생성 CLI','보호 경로 승인·CI 검사','팀 MR 판정 기록','AgentOps 사용량 리포트'],
    metrics:[
      {value:'8건', label:'MR 단계 차단 CVE', note:'CRITICAL 3건 · 적용 리허설'},
      {value:'9건', label:'병합 전 발견 결함', note:'적용 리허설'},
      {value:'54건', label:'판정 기록한 팀 MR'},
    ],
    figure:{src:'/images/projects/ai-dev-harness/01-gates-overview.svg', alt:'AI 에이전트의 변경이 hooks·MR·CI 게이트를 지나 병합되고, 세션 기록이 AgentOps와 주간 리포트로 집계되는 구조'},
    solutions:[
      {
        title:'팀의 AI 작업 절차를 설치형 가드레일로',
        situation:'AI가 37분 만에 만든 기능을 완료 기준 불일치로 5시간 30분 동안 재작업했습니다.',
        actions:[
          '규칙 문서·플랜/리뷰 양식·hooks를 생성하는 CLI로 **팀의 작업 절차를 자산화**',
          'DB 마이그레이션 같은 보호 경로 편집 시 사람 승인 요구',
          'CI에서 MR 형식·보안·의존성 검사',
        ],
        results:[
          '빈 저장소에 키트를 적용한 리허설에서 **CVE 8건(CRITICAL 3)** 버전을 MR 단계에서 차단',
          '병합 전 결함 9건 발견',
        ],
      },
      {
        title:'AI 변경의 검증과 비용을 작업에 연결',
        situation:'어떤 작업에 토큰이 쓰였는지, 그 변경이 검증됐는지 작업별로 추적할 수 없었습니다.',
        actions:[
          '팀 프로젝트 MR을 전부 판정하고 기록',
          '에이전트 세션·토큰·추정 비용을 MR 본문과 주간 리포트로 제공(AgentOps)',
        ],
        results:[
          '**MR 54건** 판정 기록',
          '추론 서버 171초 지연과 정확도 과대 표현을 병합 전에 발견',
        ],
      },
    ],
    boundary:'도입 전후의 팀 생산성 변화는 측정하지 않았습니다.',
    links:[{href:'/projects/ai-dev-harness', label:'상세 기록'}, {href:'https://github.com/kiddo-psh/ai-dev-harness', label:'GitHub', external:true}],
  },
  {
    id:'kkugi', number:'04', title:'꾸기', period:'2026.09 ~ 진행 중',
    summary:'사용자가 기록하지 않아도 미리 준비해 두는 AI 건강 코치 (yumyum 리뉴얼, Android · Wear OS)',
    team:'6명 · 팀장 · AI·ML 트랙',
    roles:['팀장 · 스프린트 관리','데이터셋 빌드·학습·평가','품질 게이트·MLflow 승격','onnxruntime 추론 서버'],
    metrics:[
      {value:'87.19%', label:'크롭 평가 top-1', note:'7,994장'},
      {value:'2 / 26장', label:'실사용 전체 사진 top-1', note:'작은 표본'},
      {value:'p95 ≤ 1초', label:'추론 지연 기준', note:'2 vCPU'},
    ],
    figure:{src:'/images/projects/kkugi/01-system-overview.svg', alt:'폰·워치·관리자 웹이 Spring을 거쳐 추론 서버를 쓰고, 데이터셋 빌드·학습·평가·품질 게이트·MLflow를 거쳐 추론 서버로 돌아가는 꾸기 구성도', caption:'점선은 아직 연결하지 않은 재학습 경로'},
    solutions:[
      {
        title:'데이터셋부터 추론 서버까지 MLOps 루프',
        situation:'사용자 수정을 다음 학습에 쓰려면, 새 모델이 나아졌는지 같은 조건에서 판단할 기준이 필요했습니다.',
        actions:[
          'AI Hub 데이터셋 빌드(고정 80/10/10 층화 분할) → ConvNeXt·EfficientNet fine-tune',
          'top-1 **품질 게이트** → MLflow Staging/Production 승격 → 추론 서버 로드',
        ],
        results:[
          '396종 분류기 크롭 평가 **top-1 87.19%**, top-5 96.65%',
        ],
      },
      {
        title:'학습 조건과 서빙 조건의 차이 확인',
        situation:'87.19%는 라벨 박스로 자른 사진의 값이었고, 앱 서버에는 GPU가 없었습니다.',
        actions:[
          '크롭(학습 조건)과 전체 사진(서빙 조건)을 **모두 평가**',
          '2 vCPU 기준 **p95 1초 이하**를 정하고 int8 양자화 모델의 정확도·지연 측정',
        ],
        results:[
          '실사용 전체 사진 **26장 중 top-1 2장** → 정답 하나 대신 후보를 제시하는 흐름 유지',
        ],
      },
    ],
    boundary:'진행 중이며, 크롭과 전체 사진은 난이도가 달라 하락률로 비교하지 않습니다.',
    links:[{href:'/projects/kkugi', label:'상세 기록'}, {href:'https://teamyumyum.github.io', label:'Team Blog', external:true}],
  },
];

// 상세 사례로 다루지 않는 프로젝트. 이력서와 맞추기 위해 한 줄로 남긴다
export const otherProjects = [
  {
    title:'Feelm', period:'2026.08 ~ 2026.09', href:'/projects/feelm',
    text:'MovieLens 32M 기반 영화 추천 서비스 · 7명 팀장 · 계정·인증 백엔드, 통합 MR 39건 중 31건 작성',
    award:'특화 프로젝트 우수상 (1등)',
  },
];

// 대표 성과. 이력서에서 강조한 숫자와 같아야 한다
export const highlights = [
  {value:'0.38 → 0.77', label:'VLM 음식명 F1', from:'yumyum', href:'#yumyum'},
  {value:'−37.5%', label:'Agent 호출', from:'yumyum', href:'#yumyum'},
  {value:'6.5 → 15 FPS', label:'엣지 영상 처리 (팀)', from:'주차바로', href:'#baro'},
  {value:'CVE 8건', label:'MR 단계 차단', from:'ai-dev-harness', href:'#ai-dev-harness'},
];

export const skills = [
  {k:'LLM / VLM', v:'Claude API(structured output), VLM 프롬프트 설계, LLM/VLM 평가 하니스, RAG(ChromaDB), Agent 라우팅'},
  {k:'Vision / MLOps', v:'PyTorch(timm), YOLOv8, ByteTrack, ONNX / TensorRT, MLflow, 품질 게이트'},
  {k:'Backend / Infra', v:'Python(FastAPI), Java(Spring Boot), PostgreSQL, Redis, Docker Compose, Jetson Orin Nano'},
  {k:'협업 / 자동화', v:'GitLab / GitHub CI, Git hooks, Jira, 코드 리뷰·ADR'},
];
export const education = [
  {date:'2026.01 ~ 2026.12', title:'삼성 청년 SW·AI 아카데미(SSAFY) 15기', text:'Java 트랙 1,600시간 · 프로젝트 3건 팀장'},
  {date:'2018.03 ~ 2024.02', title:'경희대학교 생체의공학과', text:'학점 3.91 / 4.5'},
];
export const awards = [
  {date:'2026.10', text:'SSAFY 2학기 특화 프로젝트 우수상 (1등)'},
  {date:'2026.08', text:'SSAFY 2학기 공통 프로젝트 우수상 (2등)'},
  {date:'2026.06', text:'SSAFY 1학기 관통 프로젝트 최우수상 (1등)'},
  {date:'2026.06', text:'SSAFY 1학기 성적우수상 (25명 중 2등)'},
];
export const certificates = [
  {date:'2026.09', text:'정보처리기사'},
  {date:'2026.06', text:'SQL 개발자(SQLD)'},
  {date:'2026.06', text:'데이터분석 준전문가(ADsP)'},
  {date:'2026.03', text:'삼성 SW 역량테스트 B형'},
  {date:'2025.09', text:'OPIc 영어 IH'},
];
