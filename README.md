# kiddo-psh.github.io

백엔드 개발자 kiddo-psh의 기술 블로그. https://kiddo-psh.github.io

## 실행

```sh
npm install
npm run dev     # http://localhost:4321
npm run build   # dist/ 에 정적 사이트 생성
```

## AI 브리핑

`/ai-briefing`에는 AI 개발·에이전트 활용에 관한 기사, 인터뷰, 논문, 국내 기술블로그 요약이 표시된다. 요약은 목록에서 바로 읽을 수 있고, 자료 형식과 주제 태그를 함께 골라 원하는 글만 볼 수 있다. 각 항목에는 원문 주소·발행일·요약 생성일·요약 근거가 표시된다.

주제 태그는 에이전트 설계, 코딩 에이전트, 도구·MCP, 메모리·컨텍스트, 평가, 보안, 멀티 에이전트, 모델·추론의 제한된 분류를 사용한다. 자동 갱신 시 AI가 이 중 1~3개를 선택하고 스크립트가 허용되지 않은 태그를 거부한다.

초기 자료는 `src/data/briefings.json`에 들어 있다. 자동 갱신을 켜려면 GitHub 저장소의 **Settings → Secrets and variables → Actions**에서 저장소 Secret `OPENAI_API_KEY`를 등록한다. 이 키는 GitHub Actions에서만 사용되며 정적 사이트나 방문자 브라우저로 전달되지 않는다. 필요하면 저장소 Variable `OPENAI_MODEL`로 요약 모델을 지정할 수 있다. 비워두면 `gpt-5-mini`를 사용한다.

배포 워크플로는 매주 월요일 오전 9:17(KST)에 브리핑을 갱신하고, Actions에서 수동 실행해 바로 갱신할 수도 있다. 한 번에 기사 3편, 국내 1편, 인터뷰 1편, 논문 2편까지(주 7편) 추가하며 최신 28편을 보관한다. 같은 출처는 한 번에 1편만 실리고, 관련성 점수가 하한(4점) 미만이면 자리가 남아도 싣지 않는다. 수집처는 `scripts/update_briefings.py`의 `FEEDS`에 있다. 기사는 OpenAI, Google DeepMind, Google Research, GitHub Blog, Simon Willison, Hamel Husain, Eugene Yan, Lilian Weng, Interconnects, Import AI. 인터뷰는 Latent Space, Dwarkesh Podcast, Practical AI. 국내는 올리브영, 카카오, 우아한형제들, 토스, 네이버 D2, 당근, LY Corporation 기술블로그. 논문은 arXiv `cs.AI`·`cs.CL`·`cs.SE`·`cs.CR`에서 제목에 agent, tool use, prompt injection, code generation, SWE-bench가 들어간 것이다. 인터뷰는 공개 대본이 없으면 건너뛴다. 논문 본문을 읽지 못한 경우 논문 요약문(abstract) 기반으로 표시한다. 모든 새 브리핑에는 원문에서 확인된 25단어 이하의 인용, 한국어 풀이, 인용 위치가 함께 저장된다. 키가 없으면 자동 갱신은 건너뛰고 기존 브리핑을 배포한다.

수집 규칙은 오프라인에서 `python -m unittest scripts/test_update_briefings.py`로 확인할 수 있다. 로컬 갱신은 `OPENAI_API_KEY` 환경 변수를 설정한 뒤 `python scripts/update_briefings.py`로 실행한다. API 요청에는 비용이 발생할 수 있다.

## 글 추가하기

1. `src/content/posts/YYYY-MM-DD-slug.md` 파일을 만든다.
2. 날짜 접두사는 URL에서 제거된다. 예: `2026-08-13-jpa-n1.md` → `/posts/jpa-n1`
3. slug는 영문 소문자, 숫자, 하이픈만 사용한다. 한글 파일명은 URL이 퍼센트 인코딩되어 공유하기 지저분해진다.
4. 프론트매터 필수 항목: `title`, `description`, `pubDate`, `category`(`dev` | `ai` | `retro` | `essay`)
5. 선택 항목: `draft: true`(dev에서만 보이고 빌드에서 제외), `cover`(`/`로 시작하는 `public/` 기준 경로)
6. `git push`로 배포된다. 프론트매터 값이 잘못되면 배포되지 않고 빌드가 실패한다.

## 본문 작성 관례

일반 마크다운이 그대로 동작한다. 아래 것들만 이 블로그에서 특별한 의미를 갖는다.

**인용문(`>`)은 액센트 세로선이 붙은 강조 블록으로 렌더된다.** 인용 용도가 아니라 본문 흐름에서 떼어내 강조하고 싶은 문장에 쓴다. 첫 줄을 `**굵게**`로 시작하면 그 부분이 액센트 색으로 나온다.

```md
> **결론부터**: 요청 한 번에 쿼리가 201개 나가고 있었다.

> **Try:** "이 파일에서 중복된 검증 로직만 추출해줘."
>
> 범위를 파일 하나로 묶으면 diff가 읽을 수 있는 크기로 나온다.
```

**`<figure class="wide">`로 감싼 그림은 본문 폭을 넘어 넓게 나온다.** 글자가 많은 다이어그램에 쓴다. `dev`·`ai` 글은 목차와의 간격만큼, `retro`·`essay` 글은 좌우 여백 안에서 최대 150px씩 확장된다. 좁은 화면에서는 본문 폭과 같아진다. 다이어그램은 960px 폭으로 그리면 넓은 화면에서 원본 크기로 보인다.

```md
<figure class="wide">
  <img src="/images/slug/diagram.svg" alt="그림 설명" />
</figure>
```

**설명이 필요한 그림은 `<figure>` + `<figcaption>`으로 쓴다.** 여러 장을 표로 한 줄에 늘어놓으면 본문 폭(760px)을 나눠 갖느라 한 장이 250px로 줄어 아무것도 안 보인다. 한 장씩 세우고 설명을 아래에 붙인다.

```md
<figure>
  <img src="/images/slug/shot.jpg" alt="그림 설명" />
  <figcaption>t = 20.0s · 장애인 구역 점유 감지</figcaption>
</figure>
```

**라벨과 수치 한 쌍만 있는 표는 `<dl class="stats">` 카드로 쓴다.** 2열 표로 그리면 값 칸이 두세 줄로 접혀서 정작 보여주려는 숫자가 문장 속에 묻힌다. `<b>`가 대표 숫자(액센트 색), `<small>`이 딸린 내역이다.

```md
<dl class="stats">
  <div><dt>학습 데이터</dt><dd><b>1,605장</b><small>학습 1,410 / 검증 195</small></dd></div>
  <div><dt>커밋</dt><dd><b>207개</b><small>프로젝트 전체 928개</small></dd></div>
</dl>
```

**후보를 훑어 하나를 고른 표는 `<div class="table-scroll">`로 감싼다.** 폭이 내용에 맞춰 줄고, 두 번째 열부터 오른쪽 정렬되고, 좁은 화면에서 접히는 대신 가로로 스크롤된다. 고른 행에 `class="pick"`을 주면 액센트 배경이 깔리고, `<span class="tag">`는 알약 배지로 나온다. 마크다운 표는 행에 클래스를 줄 수 없어 이때만 `<table>`을 직접 쓴다.

```md
<div class="table-scroll">
<table>
  <thead><tr><th>진입 확인 시간</th><th>오탐</th><th>미탐</th></tr></thead>
  <tbody>
    <tr><td>0.5초</td><td>1</td><td>5</td></tr>
    <tr class="pick"><td>1.0초<span class="tag">채택</span></td><td>0</td><td>6</td></tr>
  </tbody>
</table>
</div>
```

**`##`와 `###`만 목차에 들어간다.** `dev`·`ai` 글은 좌측에 고정 목차가 붙고, `retro`·`essay` 글은 목차 없이 좁은 폭으로 렌더된다. `##`이 하나도 없는 글은 목차 없이 한 칼럼으로 나온다.

읽는 시간은 본문 글자 수에서 자동 계산된다(코드블록 제외, 분당 500자). 따로 적지 않는다.
