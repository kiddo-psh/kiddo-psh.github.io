# kiddo-psh.github.io

백엔드 개발자 kiddo-psh의 기술 블로그. https://kiddo-psh.github.io

## 실행

```sh
npm install
npm run dev     # http://localhost:4321
npm run build   # dist/ 에 정적 사이트 생성
```

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
