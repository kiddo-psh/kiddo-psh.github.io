// Portfolio claims are summaries of the project articles, not independent achievements.
// Keep personal ownership, team outcomes and evaluation conditions together.
export interface PortfolioCase {
  id: string;
  number: string;
  focus: string;
  heading: string;
  context: string;
  ownership: string;
  decisions: { title: string; text: string }[];
  result: string;
  boundary: string;
  evidence: {
    type: 'image' | 'routing';
    src?: string;
    alt?: string;
    caption: string;
    label: string;
    value: string;
    note: string;
  };
  skills: string;
}

export const portfolioCases: PortfolioCase[] = [
  {
    id:'baro', number:'01', focus:'현장 문제를 판정 기준으로',
    heading:'차량 감지를 이동 요청과 재확인까지 연결했습니다',
    context:'주민은 통로를 막는 주차로 불편을 겪고, 관리인은 차주 연락과 이동 확인을 반복했습니다. 팀은 감지 → 이동 요청 → 응답 → 카메라 재확인을 파일럿으로 연결했습니다.',
    ownership:'차량 추적·구역 점유·출차 판정, 영상 리플레이, 단계별 성능 계측을 구현했습니다. 스크럼 마스터로 일일 스크럼과 Jira 관리도 맡았습니다.',
    decisions:[
      {title:'“겹친 차량”을 “출차를 막는 관계”로 다시 정의',text:'박스 겹침 비율은 차량 크기에 영향을 받고 실제 방해를 설명하지 못했습니다. 차량과 주차 구역의 관계를 먼저 계산하고 출차 경로를 막는 관계로 발전시켰습니다.'},
      {title:'잠깐 보인 차를 곧바로 점유로 확정하지 않기',text:'파일럿 영상 3편을 리플레이해 진입·이탈 확인 시간을 정했습니다. 진입 1초는 후보 탐색의 안전 마진이며, 모든 현장의 최적값으로 해석하지 않았습니다.'},
      {title:'모델을 바꾸기 전에 느린 구간부터 측정',text:'디코드부터 인코딩까지 실제 처리 경로를 나눠 재는 도구를 만들었습니다. 팀원은 계측을 바탕으로 입력 조정·GPU 보정·TensorRT 변환을 적용했습니다.'},
    ],
    result:'파일럿에서 감지부터 앱 응답·이동 재확인까지 시연했습니다. 팀 최적화 후 처리율은 약 6.5 → 15 FPS였고, SSAFY 공통 프로젝트 우수상을 수상했습니다.',
    boundary:'수치는 프로젝트 당시 측정 기록입니다. 최적화 구현은 팀원 기여이며, 실제 아파트 장기 운영과 관리자 업무시간 절감은 검증하지 않았습니다.',
    evidence:{type:'image',src:'/images/projects/baro/zone-overlay-045s-ev.jpg',alt:'파일럿 주차 모형에서 차량 검출과 주차 구역을 함께 표시한 실제 오버레이',caption:'실제 파일럿 영상 · 차량과 구역의 관계를 표시한 판정 오버레이',label:'팀 최적화 후 처리율',value:'6.5 → 15 FPS',note:'내 담당: 계측·판정·검증 / 팀원 담당: 입력·GPU 보정·TensorRT 최적화'},
    skills:'Python · OpenCV · YOLOv8 · ByteTrack · Jetson',
  },
  {
    id:'yumyum', number:'02', focus:'AI 실행 범위를 데이터로 통제',
    heading:'기록이 없는 분야까지 분석하던 AI 코칭을 바꿨습니다',
    context:'주간 코칭이 기록 상태와 관계없이 모든 분석을 실행했습니다. 성능 테스트에서 예상보다 많은 토큰을 발견하고, 요청별로 필요한 분석과 검색을 먼저 정하도록 바꿨습니다.',
    ownership:'원 프로젝트에서 운동 기능·주간 코칭·영양 상담과 화면을 구현했습니다. 9월의 후속 개선에서는 실행 선택 규칙, 조건부 검색, 평가·호출 계측을 맡았습니다.',
    decisions:[
      {title:'추가 AI 호출 대신 테스트할 수 있는 규칙을 선택',text:'영양·운동·체중 기록에서 판단할 수 있는 조건을 코드로 표현했습니다. 선택·생략한 단계와 이유를 남기고, 분석할 기록이 없으면 종합 생성도 생략했습니다.'},
      {title:'분석과 근거 검색의 필요를 따로 판단',text:'영양 달성률이 부족한 경우에 검색하고, 목표가 0인 항목은 비교에서 제외했습니다. 빈 검색 결과와 검색 실패도 근거를 확보하지 못한 상태로 다뤘습니다.'},
      {title:'호출 감소와 답변 품질을 별도로 검증',text:'고정 입력별 실행 조합을 검사하고 지연·토큰·추정 비용을 기록했습니다. 비교 조건이 달랐던 지연·비용 수치는 대표 성과로 올리지 않았습니다.'},
    ],
    result:'동일 비중의 평가 입력 8개에서 평균 실행 Agent 수가 4.0 → 2.5개로 줄었습니다. 원 프로젝트는 SSAFY 관통 프로젝트 최우수상을 수상했습니다.',
    boundary:'실제 사용자 트래픽 평균은 아닙니다. 기존 지연 비교는 프롬프트 차이와 검색의 대체 경로 동작이 있어 재측정이 필요합니다. 후속 개선은 수상 이후 작업입니다.',
    evidence:{type:'routing',caption:'평가 입력 8개 · 동일 비중의 실행 경로 비교. Agent는 전문 분석과 종합을 담당하는 실행 단계입니다.',label:'평가 입력당 평균 실행 단계',value:'4.0 → 2.5개',note:'모든 단계를 실행하는 방식에서 기록에 필요한 단계만 선택하는 방식으로 변경'},
    skills:'Python · FastAPI · Claude API · ChromaDB · Spring Boot',
  },
  {
    id:'ai-dev-harness', number:'03', focus:'반복한 해결책을 재사용 도구로',
    heading:'AI 개발 규칙을 배포하고 검증 근거까지 연결했습니다',
    context:'팀원마다 다른 요구를 AI에 전달하면 통합 때 다시 맞춰야 했습니다. feelm의 공통 규칙 경험을 키트로 만들고, 사용량과 테스트가 어떤 작업의 결과인지 추적하도록 확장했습니다.',
    ownership:'개인 프로젝트로 규칙 설치·검사, 위험 단계별 제어, 사용량 정규화와 작업별 실행 근거 수집을 설계·구현했습니다. 꾸기 인프라·대시보드에는 팀원 기여가 있습니다.',
    decisions:[
      {title:'문서 배포에서 실제 검사까지 연결',text:'설정과 템플릿으로 규칙을 생성하고 차이를 검사합니다. 작업 중 hooks와 병합 시 CI 검사를 연결하되, 경로로 판단할 수 없는 위험은 사람의 판단으로 남겼습니다.'},
      {title:'재전송한 사용량이 합계에 두 번 들어가지 않게',text:'안정적인 사건 ID와 전송 대기 목록을 사용하고 발생 날짜·최초 단가를 보존했습니다. 미등록 단가와 미지원 상태는 0이나 성공으로 채우지 않았습니다.'},
      {title:'테스트 통과가 어느 코드의 결과인지 남기기',text:'작업·세션 연결 이력과 검증 전후 코드 상태 해시를 기록합니다. 코드가 바뀐 실행을 통과로 기록하지 않고, 직접 관측과 사람·에이전트 신고를 구분합니다.'},
    ],
    result:'꾸기에 실행 근거·이벤트 기반 수집을 적용한 이력이 있습니다. 30초 주기 수집을 제거했고, 기본 수집에서 프롬프트·응답·코드 원문은 중앙으로 보내지 않습니다.',
    boundary:'2026.10.24 조사 기준 main은 0.4.0이고 공통 v2·실행 근거 확장은 별도 개발 브랜치입니다. 대시보드는 목데이터이며, 팀 생산성의 도입 전후 효과는 미측정입니다.',
    evidence:{type:'image',src:'/images/projects/ai-dev-harness/task-evidence.png',alt:'가상 작업의 검증 실행과 완료 조건을 표시한 개발 키트 대시보드 목데이터',caption:'목데이터 예시 · 실제 팀 성과가 아닌 작업별 실행 근거 화면',label:'실제 프로젝트에 적용한 수집 방식',value:'주기 → 이벤트',note:'완료 이벤트·PR 요약·수동 실행 시 수집. 자동 수집의 환경별 한계도 상태로 노출'},
    skills:'Python · Claude Code / Codex · CI · OpenTelemetry · Loki',
  },
  {
    id:'feelm', number:'04', focus:'실패 조건과 시스템 연동',
    heading:'계정 상태와 실제 화면이 같은 의미로 동작하게 했습니다',
    context:'추천 기능이 있어도 인증 상태가 어긋나거나 화면에 서버가 보장하지 않는 수치를 표시하면 서비스를 신뢰하기 어렵습니다. 계정·인증과 실제 API 연동을 맡았습니다.',
    ownership:'가입·로그인·재설정·탈퇴·차단을 구현하고 공통 HTTP 클라이언트와 주요 화면을 연결했습니다. 추천 데이터 처리·모델·서빙은 팀 담당 영역입니다.',
    decisions:[
      {title:'메일 제한과 토큰 무효화를 상태 기준으로',text:'이메일·IP·전역 발송량을 나누고 응답이 계정 존재를 드러내지 않는지 테스트했습니다. 비밀번호가 바뀌는 모든 경로에서 재설정 토큰을 무효화했습니다.'},
      {title:'화면이 원하는 수치를 임의로 만들지 않기',text:'추천의 상대 순위를 확률처럼 표시하지 않았습니다. API가 제공하는 영화 수와 대표 영화로 화면을 맞추며 요구사항·계약·화면 문서를 함께 정리했습니다.'},
    ],
    result:'인증의 실패·만료·경쟁 요청을 코드와 테스트로 남기고 목업 화면을 실제 API에 연결했습니다. 팀은 SSAFY 특화 프로젝트 1등을 기록했습니다.',
    boundary:'실제 공격 차단율·사용자 이탈률·인증 장애율 개선은 미측정입니다. 탈퇴 후 외부 정리의 모든 실패 복구까지 테스트가 증명하는 것은 아닙니다.',
    evidence:{type:'image',src:'/images/projects/feelm/03-record-flow.webp',alt:'영화 평가에서 취향 기록으로 이어지는 feelm의 실제 화면',caption:'실제 서비스 화면 · 평가에서 취향 기록으로 이어지는 사용자 흐름',label:'직접 구현한 범위',value:'인증 + API 연동',note:'서버 응답뿐 아니라 화면·계정 상태 변화까지 연결'},
    skills:'Java · Spring Boot · PostgreSQL · Redis · React',
  },
];
