# kiddo-psh.github.io 블로그 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 스펙 `docs/superpowers/specs/2026-08-13-github-pages-blog-design.md`대로 Astro 정적 블로그를 만들어 `https://kiddo-psh.github.io`에 자동 배포한다.

**Architecture:** Astro 콘텐츠 컬렉션이 `src/content/posts`와 `src/content/projects`의 마크다운을 zod 스키마로 검증해 타입 있는 데이터로 만들고, 레이아웃이 `category` 값에 따라 두 형태로 분기해 렌더한다. 색과 문구는 각각 `src/styles/tokens.css`와 `src/site.config.ts` 단일 출처에만 둔다. `git push` 시 GitHub Actions가 빌드하고, 실패하면 배포하지 않는다.

**Tech Stack:** Astro 7 (설치 확인된 버전 7.2.1), TypeScript, Pagefind(검색), astro-og-canvas(공유 카드), @astrojs/rss, @astrojs/sitemap, giscus(댓글), Pretendard(웹폰트), Node 24

> **버전 참고:** 이 계획서는 Astro 5 문서를 기준으로 작성됐으나 실제 설치본은 7.2.1이다. 콘텐츠 레이어 API(`src/content.config.ts` + `glob()` 로더)는 Task 3에서 정상 동작을 확인했다. Task 8(astro-pagefind)과 Task 9(astro-og-canvas)의 서드파티 통합은 Astro 7 호환을 설치 시점에 확인해야 하며, API가 달라졌으면 해당 패키지의 현재 문서를 따른다.

## Global Constraints

- 사이트 주소는 `https://kiddo-psh.github.io`. `astro.config.mjs`의 `site`에 이 값을 넣고, `base`는 설정하지 않는다 (user site이므로 루트에 배포된다).
- Node 버전은 `24`. `.nvmrc`와 워크플로우 양쪽에 명시한다.
- 의존성 설치는 로컬 최초 1회만 `npm install`이고, 그 뒤 CI와 재설치는 **항상 `npm ci`**를 쓴다. `package-lock.json`은 커밋한다.
- 카테고리는 `dev`, `ai`, `retro`, `essay` 네 개로 고정. 다른 값은 스키마에서 빌드를 실패시킨다.
- 태그 기능은 만들지 않는다.
- 색은 `src/styles/tokens.css`의 CSS 변수로만 쓴다. 컴포넌트에 색상 리터럴(`#1D6B4F` 등)을 직접 쓰지 않는다.
- 사이트 이름·소개·링크·카테고리 라벨은 `src/site.config.ts`에만 둔다. 컴포넌트에 문구를 하드코딩하지 않는다.
- 라이트 토큰: 배경 `#FBFAF7`, 본문 `#23211D`, 보조 `#57534A`, 경계선 `#E6E1D6`, 액센트 `#1D6B4F`, 코드 배경 `#F4F1EA`.
- 다크 토큰: 배경 `#191817`, 본문 `#EDEAE3`, 보조 `#A8A199`, 경계선 `#2E2B27`, 액센트 `#4FBE8F`, 코드 배경 `#211F1C`.
- 액센트 색은 링크, 카테고리 라벨, 성과 숫자에만 쓴다.
- 본문 기본 크기는 `19px`, 행간 `1.8`. 글 제목은 `2.1em`, 리드문은 `1.1em`.
- 글 목록(홈·`/posts`)은 카드 그리드로 렌더한다. 카드 썸네일은 `cover`가 있으면 이미지, 없으면 카테고리 라벨을 얹은 CSS 그라데이션 타일이다. 자동 생성 OG 이미지는 SNS 공유 전용이며 카드에 쓰지 않는다.
- 웹폰트는 Pretendard 하나만 추가한다. 세리프와 모노는 시스템 폰트 스택을 쓴다.
- 커밋 메시지는 한국어로 쓰고, 각 태스크 끝에서 커밋한다.

**검증 방식에 대한 참고:** 스펙 §10에서 단위 테스트를 두지 않기로 결정했다(로직이 거의 없고 대부분 렌더링이라 유지 비용이 얻는 것보다 크다). 따라서 각 태스크의 검증 단계는 단위 테스트 대신 **실행 가능한 명령과 그 기대 출력**으로 되어 있다: `npm run build`의 성공/실패, 빌드된 `dist/` HTML에 대한 문자열 검사, `npm run dev`에서의 눈 확인. Task 3에는 스키마가 실제로 잘못된 입력을 막는지 확인하기 위해 **일부러 빌드를 깨뜨려보는 단계**가 들어 있다 — 이것이 이 프로젝트에서 테스트에 가장 가까운 장치다.

---

## File Structure

| 파일 | 책임 |
|---|---|
| `src/site.config.ts` | 사이트 전역 상수의 단일 출처: 주소, 이름, 소개, 외부 링크, 카테고리 정의, giscus 설정 |
| `src/styles/tokens.css` | 색·글꼴·간격 CSS 변수 (라이트/다크 두 세트) |
| `src/styles/global.css` | 리셋, 본문 타이포그래피, 마크다운 본문(`.prose`) 스타일 |
| `src/content.config.ts` | posts·projects 컬렉션 스키마와 슬러그 생성 규칙 |
| `src/lib/posts.ts` | 글 조회 헬퍼: draft 제외, 최신순 정렬, 관련 글 |
| `src/layouts/BaseLayout.astro` | `<head>` 메타·폰트·테마 스크립트, Nav, Footer |
| `src/layouts/PostLayout.astro` | 글 상세. `category`에 따라 목차 유무와 본문 폭 분기 |
| `src/layouts/ProjectLayout.astro` | 프로젝트 상세. 상단 메타 + 성과 표 |
| `src/components/Nav.astro` | 상단 내비게이션, 검색 링크, 테마 토글 |
| `src/components/Footer.astro` | 하단 |
| `src/components/ThemeToggle.astro` | 다크모드 토글 버튼 |
| `src/components/CategoryTabs.astro` | 카테고리 필터 탭 |
| `src/components/PostCard.astro` | 글 목록 카드. 썸네일(`cover` 또는 그라데이션 타일) + 카테고리 + 제목 + 요약 |
| `src/components/TableOfContents.astro` | 좌측 sticky 목차 |
| `src/components/RelatedPosts.astro` | 같은 카테고리 최신 3개 |
| `src/components/Comments.astro` | giscus. 설정이 비어 있으면 아무것도 렌더하지 않는다 |
| `src/components/ProjectCard.astro` | 프로젝트 카드 |
| `src/components/MetricsTable.astro` | `before → after` 성과 표시. 카드와 상세 양쪽에서 재사용 |
| `src/components/ProfileHeader.astro` | 홈 상단 프로필 2줄 + 프로젝트 링크 |
| `src/pages/index.astro` | 홈 |
| `src/pages/posts/index.astro` | 글 목록 |
| `src/pages/posts/[...id].astro` | 글 상세 |
| `src/pages/projects/index.astro` | 프로젝트 목록 |
| `src/pages/projects/[...id].astro` | 프로젝트 상세 |
| `src/pages/about.astro` | 소개 |
| `src/pages/search.astro` | 검색 |
| `src/pages/404.astro` | 404 |
| `src/pages/rss.xml.ts` | RSS |
| `src/pages/og/[...route].ts` | 공유 카드 이미지 자동 생성 |
| `.github/workflows/deploy.yml` | 빌드·배포 |

---

## Task 1: 프로젝트 초기화와 배포 파이프라인

빈 사이트라도 실제 주소에 뜨는 것을 가장 먼저 만든다. 배포가 마지막에 붙으면 문제가 한꺼번에 터진다.

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.nvmrc`, `src/pages/index.astro`, `.github/workflows/deploy.yml`
- Modify: `.gitignore` (Astro 초기화가 덮어쓸 경우 기존 항목 복원)

**Interfaces:**
- Consumes: 없음
- Produces: `npm run dev`(포트 4321), `npm run build`(출력 `dist/`) 스크립트. 이후 모든 태스크가 이 두 명령으로 검증한다.

- [ ] **Step 1: Astro 프로젝트 생성**

현재 디렉토리(`C:\kiddo\blog`)에 이미 `.git`과 `docs/`가 있으므로, 빈 디렉토리를 요구하는 대화형 마법사 대신 최소 템플릿으로 만든다.

```bash
npm create astro@latest . -- --template minimal --install --no-git --skip-houston --typescript strict
```

`.gitignore`를 덮어쓸지 물으면 덮어쓰게 하고, Step 2에서 필요한 항목을 다시 넣는다.

- [ ] **Step 2: `.gitignore` 복원**

Astro가 만든 내용에 아래 항목이 모두 있는지 확인하고, 없으면 추가한다.

```
node_modules/
dist/
.astro/

# 브레인스토밍 목업 (로컬 참고용)
.superpowers/

.DS_Store
*.log
.env
.env.production
```

- [ ] **Step 3: Node 버전 고정**

`.nvmrc` 파일을 만든다. 내용은 한 줄이다.

```
24
```

- [ ] **Step 4: `astro.config.mjs` 작성**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://kiddo-psh.github.io',
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
```

`themes`(복수)를 쓰면 Shiki가 라이트/다크 두 벌의 색을 CSS 변수로 함께 출력한다. 다크모드 전환 시 코드블록 색이 따라오게 하려면 이 설정이 필요하고, Task 2에서 이 변수를 연결한다.

- [ ] **Step 5: 임시 홈 페이지 작성**

`src/pages/index.astro`를 아래 내용으로 덮어쓴다. 배포 확인용 최소 페이지다.

```astro
---
---
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <title>kiddo-psh</title>
  </head>
  <body>
    <h1>배포 확인</h1>
  </body>
</html>
```

- [ ] **Step 6: 로컬 빌드 확인**

```bash
npm run build
```

기대: 성공하고 `dist/index.html`이 생성된다.

```bash
grep -c "배포 확인" dist/index.html
```

기대: `1`

- [ ] **Step 7: 배포 워크플로우 작성**

`.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

`npm ci`를 쓰는 것이 중요하다. `npm install`은 lock 파일을 갱신해버려서 로컬과 CI의 버전이 달라질 수 있다.

- [ ] **Step 8: 커밋**

```bash
git add -A
git commit -m "feat: Astro 프로젝트 초기화와 GitHub Pages 배포 워크플로우 추가"
```

- [ ] **Step 9: 원격 저장소 연결과 최초 푸시**

이 단계는 사람이 직접 해야 하는 작업이 섞여 있다. 먼저 GitHub에서 `kiddo-psh/kiddo-psh.github.io` 저장소를 **빈 상태로**(README·라이선스 없이) 만든다.

```bash
git remote add origin https://github.com/kiddo-psh/kiddo-psh.github.io.git
git push -u origin main
```

- [ ] **Step 10: Pages 소스를 Actions로 설정**

저장소 → Settings → Pages → Build and deployment → Source를 **GitHub Actions**로 바꾼다. 브랜치 방식이 아니어야 `dist/`를 커밋하지 않는다.

- [ ] **Step 11: 배포 결과 확인**

```bash
gh run watch
```

기대: `build`와 `deploy` 두 잡이 모두 성공.

```bash
curl -s https://kiddo-psh.github.io | grep -c "배포 확인"
```

기대: `1` (Pages 최초 활성화는 몇 분 걸릴 수 있다. 404면 1~2분 후 재시도한다.)

---

## Task 2: 디자인 토큰, 기본 레이아웃, 다크모드

**Files:**
- Create: `src/site.config.ts`, `src/styles/tokens.css`, `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/components/Nav.astro`, `src/components/Footer.astro`, `src/components/ThemeToggle.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: Task 1의 `npm run dev` / `npm run build`
- Produces:
  - `src/site.config.ts`: `SITE` 객체(`{ url, title, author, tagline, description, links: { github, email }, giscus: { repo, repoId, category, categoryId } }`), `CATEGORIES` 배열(`{ id, label, name, layout }[]`), `getCategory(id: string)` 함수
  - `BaseLayout.astro`: props `{ title: string; description?: string; ogImage?: string }` (`description` 생략 시 `SITE.description`)
  - CSS 변수: `--bg`, `--text`, `--text-dim`, `--border`, `--accent`, `--code-bg`, `--font-sans`, `--font-serif`, `--font-mono`, `--w-doc`, `--w-read`

- [ ] **Step 1: Pretendard 폰트 CSS 주소 확인**

Pretendard의 동적 서브셋 CSS를 쓴다. 한글은 글리프가 많아서 통째로 받으면 첫 로딩이 느려지는데, 동적 서브셋은 실제 쓰인 글자만 받는다.

버전 태그를 추측하지 말고 아래로 현재 최신 주소를 확인한다.

```bash
curl -s https://api.github.com/repos/orioncactus/pretendard/releases/latest | grep '"tag_name"'
```

기대: `"tag_name": "v1.3.x"` 형태의 출력. 이 태그를 아래 주소의 `@` 뒤에 넣고 200이 오는지 확인한다.

```bash
curl -sI "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" | head -1
```

기대: `HTTP/2 200`. (`v1.3.9`를 위에서 확인한 태그로 바꿔서 실행한다.) 200이 확인된 주소를 Step 4에서 쓴다.

- [ ] **Step 2: `src/site.config.ts` 작성**

```ts
export const SITE = {
  url: 'https://kiddo-psh.github.io',
  title: 'kiddo-psh',
  author: 'kiddo-psh',
  // TODO(본인): 실제 문구로 교체
  tagline: '백엔드 개발자',
  description: '백엔드 개발자 kiddo-psh의 기록. 기술, 프로젝트, 회고, 생각을 씁니다.',
  links: {
    github: 'https://github.com/kiddo-psh',
    email: 'asded5655@naver.com',
  },
  // Task 10에서 giscus 발급 후 채운다. 비어 있으면 댓글이 렌더되지 않는다.
  giscus: {
    repo: '',
    repoId: '',
    category: 'Announcements',
    categoryId: '',
  },
} as const;

/**
 * layout: 'doc'  → 넓은 본문 + 좌측 목차 (기술글)
 * layout: 'read' → 좁은 본문 + 목차 없음 + 세리프 리드문 (에세이·회고)
 */
export const CATEGORIES = [
  { id: 'dev', label: 'DEV', name: '기술', layout: 'doc' },
  { id: 'ai', label: 'AI', name: 'AI 개발', layout: 'doc' },
  { id: 'retro', label: 'RETRO', name: '회고', layout: 'read' },
  { id: 'essay', label: 'ESSAY', name: '생각', layout: 'read' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export function getCategory(id: string) {
  const found = CATEGORIES.find((c) => c.id === id);
  if (!found) throw new Error(`알 수 없는 카테고리: ${id}`);
  return found;
}
```

카테고리별 레이아웃 분기를 `layout` 필드로 데이터화한 것이 핵심이다. 컴포넌트에 `if (category === 'dev' || category === 'ai')` 같은 조건을 흩뿌리면 카테고리를 조정할 때 여러 파일을 뒤져야 한다.

- [ ] **Step 3: `src/styles/tokens.css` 작성**

```css
:root {
  --bg: #fbfaf7;
  --bg-elev: #ffffff;
  --text: #23211d;
  --text-dim: #57534a;
  --border: #e6e1d6;
  --accent: #1d6b4f;
  --code-bg: #f4f1ea;

  --font-sans: 'Pretendard Variable', Pretendard, system-ui, sans-serif;
  --font-serif: 'Iowan Old Style', 'Apple SD Gothic Neo', Georgia, serif;
  --font-mono: ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', monospace;

  --w-doc: 760px;
  --w-read: 660px;
  --w-page: 1100px;
}

:root[data-theme='dark'] {
  --bg: #191817;
  --bg-elev: #211f1c;
  --text: #edeae3;
  --text-dim: #a8a199;
  --border: #2e2b27;
  --accent: #4fbe8f;
  --code-bg: #211f1c;
}
```

다크 블록은 색만 덮어쓴다. 글꼴과 폭 변수를 다시 정의하지 않아서, 나중에 폭을 바꿀 때 한 곳만 고치면 된다.

- [ ] **Step 4: `src/styles/global.css` 작성**

`@import`의 URL은 Step 1에서 200을 확인한 주소로 넣는다.

```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');
@import './tokens.css';

*, *::before, *::after { box-sizing: border-box; }
html { color-scheme: light dark; }
:root[data-theme='light'] { color-scheme: light; }
:root[data-theme='dark'] { color-scheme: dark; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 19px;
  line-height: 1.8;
  -webkit-font-smoothing: antialiased;
}

a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

img { max-width: 100%; height: auto; }

.page { max-width: var(--w-page); margin: 0 auto; padding: 0 20px; }

/* 마크다운 본문 — 크기는 body(19px)를 상속한다 */
.prose h2 { margin: 2.3em 0 .7em; font-size: 1.45em; letter-spacing: -.02em; scroll-margin-top: 80px; }
.prose h3 { margin: 1.8em 0 .6em; font-size: 1.18em; scroll-margin-top: 80px; }
.prose p { margin: 0 0 1.2em; }
.prose ul, .prose ol { margin: 0 0 1.2em; padding-left: 1.3em; }
.prose li { margin-bottom: .4em; }
.prose blockquote {
  margin: 1.6em 0; padding: .2em 0 .2em 1.1em;
  border-left: 3px solid var(--accent); color: var(--text-dim);
}
.prose :not(pre) > code {
  background: var(--code-bg); border: 1px solid var(--border);
  border-radius: 4px; padding: .1em .35em;
  font-family: var(--font-mono); font-size: .88em;
}
.prose pre {
  background: var(--code-bg); border: 1px solid var(--border);
  border-radius: 8px; padding: 14px 16px; overflow-x: auto;
  font-size: .84em; line-height: 1.7;
}
.prose table { width: 100%; border-collapse: collapse; margin: 1.6em 0; font-size: .92em; }
.prose th, .prose td { border: 1px solid var(--border); padding: 8px 10px; text-align: left; }
.prose th { background: var(--code-bg); }

/* Shiki 라이트/다크 전환 */
:root[data-theme='dark'] .astro-code,
:root[data-theme='dark'] .astro-code span {
  color: var(--shiki-dark) !important;
  background-color: transparent !important;
}
```

- [ ] **Step 5: `ThemeToggle.astro` 작성**

```astro
<button id="theme-toggle" type="button" aria-label="테마 전환">
  <span aria-hidden="true">☾</span>
</button>

<style>
  button {
    background: none; border: 1px solid var(--border); border-radius: 6px;
    color: var(--text-dim); cursor: pointer; padding: 3px 8px; font-size: 13px;
    line-height: 1.4;
  }
  button:hover { color: var(--text); }
</style>

<script>
  const btn = document.getElementById('theme-toggle');
  btn?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
  });
</script>
```

- [ ] **Step 6: `Nav.astro`와 `Footer.astro` 작성**

`src/components/Nav.astro`:

```astro
---
import { SITE } from '../site.config';
import ThemeToggle from './ThemeToggle.astro';
---

<header>
  <nav class="page">
    <a class="brand" href="/">{SITE.title}</a>
    <a href="/posts">글</a>
    <a href="/projects">프로젝트</a>
    <a href="/about">소개</a>
    <div class="right">
      <a href="/search" aria-label="검색">⌕</a>
      <ThemeToggle />
    </div>
  </nav>
</header>

<style>
  header { border-bottom: 1px solid var(--border); }
  nav { display: flex; align-items: center; gap: 16px; height: 54px; font-size: 14px; }
  .brand { color: var(--text); font-weight: 800; margin-right: 6px; }
  nav a { color: var(--text-dim); }
  nav a:hover { color: var(--text); text-decoration: none; }
  .right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
</style>
```

`src/components/Footer.astro`:

```astro
---
import { SITE } from '../site.config';
---

<footer>
  <div class="page">
    <span>© {SITE.author}</span>
    <a href={SITE.links.github}>GitHub</a>
    <a href={`mailto:${SITE.links.email}`}>Email</a>
    <a href="/rss.xml">RSS</a>
  </div>
</footer>

<style>
  footer { border-top: 1px solid var(--border); margin-top: 80px; padding: 26px 0 50px; }
  footer div { display: flex; gap: 14px; font-size: 13px; color: var(--text-dim); }
  footer a { color: var(--text-dim); }
</style>
```

- [ ] **Step 7: `BaseLayout.astro` 작성**

```astro
---
import '../styles/global.css';
import { SITE } from '../site.config';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';

interface Props {
  title: string;
  description?: string;
  ogImage?: string;
}

const { title, description = SITE.description, ogImage } = Astro.props;
const pageTitle = title === SITE.title ? title : `${title} · ${SITE.title}`;
const canonical = new URL(Astro.url.pathname, SITE.url).href;
const ogUrl = ogImage ? new URL(ogImage, SITE.url).href : undefined;
---

<!doctype html>
<html lang="ko" data-theme="light">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{pageTitle}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <link rel="alternate" type="application/rss+xml" title={SITE.title} href="/rss.xml" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content={SITE.title} />
    <meta property="og:title" content={pageTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    {ogUrl && <meta property="og:image" content={ogUrl} />}
    <meta name="twitter:card" content={ogUrl ? 'summary_large_image' : 'summary'} />

    <script is:inline>
      // 첫 페인트 전에 테마를 확정해서 색 번쩍임을 막는다.
      const saved = localStorage.getItem('theme');
      const dark = saved ? saved === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    </script>
  </head>
  <body>
    <Nav />
    <main>
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

테마 스크립트는 `is:inline`으로 `<head>`에 두어야 한다. Astro가 번들해서 지연 실행하면 라이트 배경이 한 프레임 보인 뒤 다크로 바뀌는 깜빡임이 생긴다.

- [ ] **Step 8: 홈을 BaseLayout으로 교체**

`src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { SITE } from '../site.config';
---

<BaseLayout title={SITE.title}>
  <div class="page">
    <h1>레이아웃 확인</h1>
    <p>본문 색과 배경, 다크모드 토글이 동작하는지 봅니다.</p>
    <p><a href="/posts">링크 색 확인</a></p>
  </div>
</BaseLayout>
```

- [ ] **Step 9: 개발 서버로 눈 확인**

```bash
npm run dev
```

`http://localhost:4321`에서 확인할 것:

- 배경이 따뜻한 종이색(`#FBFAF7`)이고 본문이 검정이 아닌 잉크색이다
- 링크가 딥그린이다
- `☾` 버튼을 누르면 다크로 바뀌고, **새로고침해도 다크가 유지된다**
- 다크에서 배경이 `#191817`, 링크가 밝은 그린이다
- 페이지 로드 순간에 흰색이 번쩍이지 않는다
- 폰트가 Pretendard다 (기본 시스템 고딕보다 자획이 균일하다)

- [ ] **Step 10: 빌드 확인**

```bash
npm run build && grep -c 'data-theme' dist/index.html
```

기대: 빌드 성공, `grep` 결과 `1` 이상.

- [ ] **Step 11: 커밋**

```bash
git add -A
git commit -m "feat: 디자인 토큰, 기본 레이아웃, 다크모드 추가"
```

---

## Task 3: 콘텐츠 컬렉션 스키마와 샘플 콘텐츠

**Files:**
- Create: `src/content.config.ts`, `src/lib/posts.ts`, `src/content/posts/2026-08-13-jpa-n1.md`, `src/content/posts/2026-08-06-claude-code-rules.md`, `src/content/posts/2026-07-28-easy-to-change.md`, `src/content/projects/coupon.md`

**Interfaces:**
- Consumes: `getCategory`, `CategoryId` (Task 2)
- Produces:
  - 컬렉션 `posts`: `{ id, data: { title, description, pubDate: Date, category: CategoryId, draft: boolean, cover?: string } }`
  - 컬렉션 `projects`: `{ id, data: { title, summary, period, role, stack: string[], repo?: string, demo?: string, metrics: { label, before, after }[], featured: boolean, order: number } }`
  - `src/lib/posts.ts`: `getVisiblePosts(): Promise<Post[]>` (draft 제외, 최신순), `getRelatedPosts(post, limit = 3)`, `type Post = CollectionEntry<'posts'>`

- [ ] **Step 1: `src/content.config.ts` 작성**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { CATEGORIES } from './site.config';

const categoryIds = CATEGORIES.map((c) => c.id) as [string, ...string[]];

const posts = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/posts',
    // 2026-08-13-jpa-n1.md → jpa-n1 (URL에 날짜를 넣지 않는다)
    generateId: ({ entry }) =>
      entry.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, ''),
  }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    pubDate: z.coerce.date(),
    category: z.enum(categoryIds),
    draft: z.boolean().default(false),
    // public/ 기준 절대 경로. 예: /images/n1.png
    cover: z.string().startsWith('/').optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    period: z.string().min(1),
    role: z.string().min(1),
    stack: z.array(z.string()).min(1),
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
    metrics: z
      .array(z.object({ label: z.string(), before: z.string(), after: z.string() }))
      .default([]),
    featured: z.boolean().default(false),
    order: z.number().default(99),
  }),
});

export const collections = { posts, projects };
```

`cover`를 `public/` 기준 절대 경로 문자열로 둔 이유: 공유 카드 메타태그에는 절대 URL이 필요하고, Astro의 이미지 최적화를 거치면 해시가 붙은 경로를 다시 조립해야 한다. 커버는 최적화 이득이 크지 않으니 단순한 쪽을 택한다.

`cover`는 목록 카드의 썸네일과 SNS 공유 카드 양쪽에 쓰인다(스펙 §6.3). 선행 슬래시를 스키마에서 강제해서, 상대 경로를 적어 카드 이미지가 조용히 깨지는 일을 막는다.

- [ ] **Step 2: `src/lib/posts.ts` 작성**

```ts
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
```

draft를 개발 서버에서는 보이게, 프로덕션 빌드에서는 제외하는 것이 요점이다. 이러면 쓰다 만 글을 로컬에서 계속 확인하면서도 실수로 공개되지 않는다.

- [ ] **Step 3: 샘플 글 3개 작성**

카테고리 분기와 목차를 확인해야 하므로 `doc` 계열 2개와 `read` 계열 1개를 만든다. 내용은 실제로 교체될 임시 글이지만, 목차가 나오는지 보려면 `##` 제목이 여러 개 필요하다.

`src/content/posts/2026-08-13-jpa-n1.md`:

```markdown
---
title: "JPA N+1, 목록 API가 느려진 진짜 이유"
description: "쿼리 로그를 켜보기 전까지 원인을 세 번 잘못 짚었다"
pubDate: 2026-08-13
category: dev
---

목록 API 응답이 1.2초까지 늘어났다. 원인을 세 번 잘못 짚은 기록이다.

## 문제 상황

응답 시간이 갑자기 늘어났지만 데이터 양은 그대로였다.

## 원인 추적

쿼리 로그를 켜자 요청 하나에 쿼리가 201개 나가고 있었다.

```java
List<Order> orders = orderRepository.findAll();
orders.forEach(o -> o.getItems().size());
```

## 해결

`fetch join`으로 연관을 한 번에 가져왔다.

## 남은 것

페이징과 `fetch join`을 함께 쓸 때의 메모리 문제는 아직 정리하지 못했다.
```

`src/content/posts/2026-08-06-claude-code-rules.md`:

```markdown
---
title: "Claude Code로 리팩터링할 때 정한 3가지 규칙"
description: "에이전트에게 맡길 수 있는 작업과 맡기면 안 되는 작업의 경계"
pubDate: 2026-08-06
category: ai
---

에이전트에게 리팩터링을 맡기며 정한 규칙이다.

## 규칙 1: 테스트가 있는 코드만 맡긴다

되돌릴 수 있는 상태가 아니면 맡기지 않는다.

## 규칙 2: 한 번에 한 파일

## 규칙 3: 변경 이유를 커밋 메시지로 남기게 한다
```

`src/content/posts/2026-07-28-easy-to-change.md`:

```markdown
---
title: "좋은 코드보다 고치기 쉬운 코드"
description: "6개월 뒤의 내가 읽을 코드를 기준으로 판단하기 시작했다"
pubDate: 2026-07-28
category: essay
---

좋은 코드가 무엇인지에 대한 답을 오래 찾다가, 질문을 바꿨다.

## 판단 기준을 바꾼 계기

## 그래서 지금은
```

- [ ] **Step 4: 샘플 프로젝트 1개 작성**

`src/content/projects/coupon.md`:

```markdown
---
title: "쿠폰 발급 시스템"
summary: "동시 요청 1만 건에서 중복 발급 0건"
period: "2026.03 ~ 2026.05"
role: "백엔드 3명 중 API·동시성 설계 담당"
stack: ["Spring Boot", "Redis", "MySQL"]
repo: "https://github.com/kiddo-psh/coupon"
metrics:
  - { label: "p99 응답시간", before: "1,240ms", after: "180ms" }
  - { label: "중복 발급", before: "37건", after: "0건" }
featured: true
order: 1
---

## 문제

선착순 쿠폰 발급에서 동시 요청이 몰리면 재고보다 많이 발급되었다.

## 아키텍처

Redis의 원자적 감소 연산으로 재고를 선점하고, 발급 이력을 비동기로 저장했다.

## 내 역할

발급 API와 동시성 제어를 설계하고 부하 테스트를 담당했다.

## 결과

중복 발급이 사라지고 p99 응답시간이 1,240ms에서 180ms로 줄었다. 재고 복원 로직은 아직 수동이다.
```

- [ ] **Step 5: 스키마가 콘텐츠를 읽는지 확인**

```bash
npm run build
```

기대: 성공. 아직 글을 렌더하는 페이지가 없어서 화면 변화는 없지만, 스키마 오류가 있으면 여기서 실패한다.

- [ ] **Step 6: 스키마가 잘못된 입력을 막는지 확인 (중요)**

이 프로젝트에서 테스트에 가장 가까운 단계다. 실제로 깨뜨려서 방어가 작동하는지 본다.

먼저 카테고리 오타:

```bash
sed -i 's/^category: dev$/category: devv/' src/content/posts/2026-08-13-jpa-n1.md
npm run build
```

기대: **빌드 실패.** 오류 메시지에 `category`와 유효한 값 목록이 나온다. 확인 후 되돌린다.

```bash
sed -i 's/^category: devv$/category: dev/' src/content/posts/2026-08-13-jpa-n1.md
```

다음으로 필수 필드 누락:

```bash
sed -i '/^description:/d' src/content/posts/2026-08-13-jpa-n1.md
npm run build
```

기대: **빌드 실패.** 오류에 `description` Required가 나온다. 되돌린다.

```bash
git checkout src/content/posts/2026-08-13-jpa-n1.md
npm run build
```

기대: 성공.

- [ ] **Step 7: 슬러그 생성 규칙 확인**

```bash
node -e "const f='2026-08-13-jpa-n1.md'; console.log(f.replace(/\.md$/,'').replace(/^\d{4}-\d{2}-\d{2}-/,''))"
```

기대: `jpa-n1` — 날짜 접두사가 떨어지고 URL이 `/posts/jpa-n1`이 된다. (실제 라우팅은 Task 5에서 확인한다.)

- [ ] **Step 8: 스키마와 스펙이 일치하는지 확인**

```bash
grep -n 'cover' docs/superpowers/specs/2026-08-13-github-pages-blog-design.md src/content.config.ts
```

기대: 스펙 예시가 `/images/n1.png`(선행 슬래시)이고 스키마가 `.startsWith('/')`를 요구한다. 어긋나면 스키마를 기준으로 스펙을 고친다.

- [ ] **Step 9: 커밋**

```bash
git add -A
git commit -m "feat: 콘텐츠 컬렉션 스키마와 샘플 글·프로젝트 추가"
```

---

## Task 4: 글 목록과 홈

**Files:**
- Create: `src/components/PostCard.astro`, `src/components/CategoryTabs.astro`, `src/components/ProfileHeader.astro`, `src/pages/posts/index.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `getVisiblePosts` (Task 3), `SITE`·`CATEGORIES`·`getCategory` (Task 2)
- Produces:
  - `PostCard.astro`: props `{ post: Post }`
  - `CategoryTabs.astro`: props `{ active: string }` — `active`는 `'all'` 또는 카테고리 id
  - `ProfileHeader.astro`: props `{ projectCount: number }`
  - 카드 그리드 CSS 클래스 `.grid` (각 페이지에서 정의, `auto-fit` / `minmax(280px, 1fr)`)

- [ ] **Step 1: `PostCard.astro` 작성**

카드 전체가 하나의 링크다. 썸네일은 `cover`가 있으면 이미지, 없으면 카테고리 라벨을 얹은 그라데이션 타일이다. 이미지를 요구하지 않으면서 카드가 비어 보이지 않게 하는 것이 목적이다.

```astro
---
import type { Post } from '../lib/posts';
import { getCategory } from '../site.config';

interface Props { post: Post }
const { post } = Astro.props;
const cat = getCategory(post.data.category);
const date = post.data.pubDate.toISOString().slice(0, 10).replace(/-/g, '.');
---

<a class="card" href={`/posts/${post.id}`}>
  {post.data.cover ? (
    <img class="thumb" src={post.data.cover} alt="" loading="lazy" width="600" height="338" />
  ) : (
    <div class="thumb tile" aria-hidden="true"><span>{cat.label}</span></div>
  )}

  <div class="body">
    <div class="meta">
      <span class="cat">{cat.label}</span>
      <span>{date}</span>
    </div>
    <h3>{post.data.title}</h3>
    <p>{post.data.description}</p>
  </div>
</a>

<style>
  .card {
    display: flex; flex-direction: column;
    border: 1px solid var(--border); border-radius: 12px; overflow: hidden;
    background: var(--bg-elev); color: var(--text);
    transition: border-color .15s, transform .15s;
  }
  .card:hover { border-color: var(--accent); transform: translateY(-2px); text-decoration: none; }

  .thumb { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; }
  .tile {
    display: flex; align-items: flex-end; padding: 14px 16px;
    background: linear-gradient(135deg, var(--code-bg) 0%, var(--border) 100%);
  }
  .tile span { font-size: .72em; font-weight: 800; letter-spacing: .14em; color: var(--accent); }

  .body { padding: 15px 17px 18px; }
  .meta { display: flex; gap: 9px; font-size: .72em; color: var(--text-dim); margin-bottom: 7px; }
  .cat { color: var(--accent); font-weight: 800; letter-spacing: .1em; }
  h3 { margin: 0 0 7px; font-size: 1.02em; line-height: 1.45; letter-spacing: -.01em; }
  .card:hover h3 { color: var(--accent); }
  p { margin: 0; color: var(--text-dim); font-size: .84em; line-height: 1.6; }
</style>
```

`aspect-ratio: 16 / 9`를 이미지와 타일에 같이 걸어서, 커버가 있는 카드와 없는 카드의 높이가 어긋나지 않게 한다.

날짜를 `toISOString()`으로 만드는 이유: `toLocaleDateString`은 빌드 서버의 로케일에 따라 결과가 달라져서 로컬과 CI의 출력이 어긋날 수 있다.

- [ ] **Step 2: `CategoryTabs.astro` 작성**

```astro
---
import { CATEGORIES } from '../site.config';

interface Props { active: string }
const { active } = Astro.props;
---

<nav class="tabs">
  <a href="/posts" class:list={[{ on: active === 'all' }]}>전체</a>
  {CATEGORIES.map((c) => (
    <a href={`/posts?category=${c.id}`} class:list={[{ on: active === c.id }]}>
      {c.name}
    </a>
  ))}
</nav>

<style>
  .tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 4px; }
  a {
    font-size: .82em; padding: 4px 11px; border-radius: 20px;
    background: var(--code-bg); color: var(--text-dim); border: 1px solid var(--border);
  }
  a:hover { color: var(--text); text-decoration: none; }
  a.on { background: var(--text); color: var(--bg); border-color: var(--text); }
</style>
```

- [ ] **Step 3: 글 목록 페이지 작성**

정적 사이트이므로 쿼리스트링 필터는 클라이언트에서 처리한다. 글이 수십 개 규모라 전부 렌더해두고 감추는 방식이 가장 단순하고, 페이지 전환도 없다.

`src/pages/posts/index.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostCard from '../../components/PostCard.astro';
import CategoryTabs from '../../components/CategoryTabs.astro';
import { getVisiblePosts } from '../../lib/posts';

const posts = await getVisiblePosts();
---

<BaseLayout title="글" description="기술, AI 개발, 회고, 생각">
  <div class="page">
    <h1>글</h1>
    <CategoryTabs active="all" />
    <div id="list" class="grid">
      {posts.map((post) => (
        <div class="cell" data-category={post.data.category}>
          <PostCard post={post} />
        </div>
      ))}
    </div>
    <p id="empty" hidden>이 분류에 아직 글이 없습니다.</p>
  </div>
</BaseLayout>

<style>
  h1 { font-size: 1.6em; margin: 34px 0 18px; }
  .grid {
    display: grid; gap: 18px; margin-top: 16px;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
</style>

<script>
  function applyFilter() {
    const wanted = new URLSearchParams(location.search).get('category');
    let shown = 0;
    document.querySelectorAll<HTMLElement>('#list .cell').forEach((cell) => {
      const hit = !wanted || cell.dataset.category === wanted;
      cell.hidden = !hit;
      if (hit) shown++;
    });
    const empty = document.getElementById('empty');
    if (empty) empty.hidden = shown > 0;

    document.querySelectorAll<HTMLAnchorElement>('.tabs a').forEach((a) => {
      const q = new URL(a.href, location.origin).searchParams.get('category');
      a.classList.toggle('on', (q ?? null) === (wanted ?? null));
    });
  }
  applyFilter();
  window.addEventListener('popstate', applyFilter);
</script>
```

- [ ] **Step 4: `ProfileHeader.astro` 작성**

```astro
---
import { SITE } from '../site.config';

interface Props { projectCount: number }
const { projectCount } = Astro.props;
---

<div class="prof">
  <div class="av" aria-hidden="true"></div>
  <div class="who">
    <div class="nm">{SITE.author}</div>
    <div class="tg">{SITE.tagline}</div>
  </div>
  {projectCount > 0 && (
    <a class="more" href="/projects">프로젝트 {projectCount}개 →</a>
  )}
</div>

<style>
  .prof { display: flex; align-items: center; gap: 12px; margin: 36px 0 26px; }
  .av {
    width: 44px; height: 44px; border-radius: 50%; flex: 0 0 auto;
    background: linear-gradient(135deg, var(--accent), var(--border));
  }
  .nm { font-weight: 800; }
  .tg { font-size: .88em; color: var(--text-dim); margin-top: 2px; }
  .more { margin-left: auto; font-size: .85em; }
</style>
```

프로필 이미지는 아직 없으므로 액센트 그라데이션 원으로 둔다. 이미지가 준비되면 `.av`를 `<img>`로 바꾼다.

- [ ] **Step 5: 홈 작성**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ProfileHeader from '../components/ProfileHeader.astro';
import CategoryTabs from '../components/CategoryTabs.astro';
import PostCard from '../components/PostCard.astro';
import { getVisiblePosts } from '../lib/posts';
import { getCollection } from 'astro:content';
import { SITE } from '../site.config';

const posts = (await getVisiblePosts()).slice(0, 6);
const allProjects = await getCollection('projects');
---

<BaseLayout title={SITE.title}>
  <div class="page">
    <ProfileHeader projectCount={allProjects.length} />
    <CategoryTabs active="all" />
    <div class="grid">
      {posts.map((post) => <PostCard post={post} />)}
    </div>
    <p class="all"><a href="/posts">글 전체 보기 →</a></p>
  </div>
</BaseLayout>

<style>
  .grid {
    display: grid; gap: 18px; margin-top: 16px;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
  .all { margin-top: 24px; font-size: .88em; }
</style>
```

홈에 6개를 두는 이유: 카드가 3열로 깔리므로 6개면 두 줄이 정확히 채워진다. 프로젝트가 담긴 하단 섹션은 `ProjectCard`가 필요하므로 Task 6에서 붙인다.

- [ ] **Step 6: 빌드하고 목록 렌더 확인**

```bash
npm run build
grep -c "JPA N+1" dist/index.html dist/posts/index.html
```

기대: 두 파일 모두 `1` 이상.

```bash
grep -o 'href="/posts/[a-z0-9-]*"' dist/posts/index.html | sort -u
```

기대: `href="/posts/jpa-n1"`, `href="/posts/claude-code-rules"`, `href="/posts/easy-to-change"` — 날짜 접두사가 없다.

커버가 없는 글은 그라데이션 타일이 렌더되어야 한다 (`<img>`가 아니다).

빌드된 HTML은 한 줄로 압축되므로 **`grep -c`(일치한 줄 수)가 아니라 `grep -o | wc -l`(일치 횟수)로 세야 한다.** `grep -c`는 개수와 무관하게 `1`을 돌려준다.

```bash
grep -o 'thumb tile' dist/posts/index.html | wc -l
```

기대: `3` (샘플 글 3개 모두 `cover`가 없다)

```bash
grep -o '<img class="thumb"' dist/posts/index.html | wc -l
```

기대: `0`

(있음/없음만 보는 다른 태스크의 `grep -c` 검사는 압축된 출력에서도 `1`/`0`으로 정상 동작하므로 그대로 둔다.)

- [ ] **Step 7: 개발 서버에서 필터 확인**

```bash
npm run dev
```

- `/` 에서 프로필, 카테고리 탭, 글 카드 3개가 그리드로, "프로젝트 1개 →" 링크가 보인다
- 카드에 이미지 대신 카테고리 라벨이 얹힌 그라데이션 타일이 보이고, 카드 높이가 서로 같다
- 카드에 마우스를 올리면 테두리가 딥그린으로 바뀌고 살짝 떠오른다
- `/posts` 에서 글 3개가 모두 보인다
- 본문 글자가 이전보다 크다 (19px). 글 상세는 Task 5에서 확인한다
- `/posts?category=essay` 로 들어가면 `좋은 코드보다 고치기 쉬운 코드` 하나만 보이고 `생각` 탭이 활성 표시된다
- `/posts?category=retro` 로 들어가면 "이 분류에 아직 글이 없습니다."가 보인다
- 탭을 눌러 이동한 뒤 브라우저 뒤로가기를 누르면 목록이 이전 필터로 되돌아간다

- [ ] **Step 8: 커밋**

```bash
git add -A
git commit -m "feat: 글 목록과 홈 화면 추가"
```

---

## Task 5: 글 상세 페이지 (목차, 카테고리별 레이아웃 분기, 관련 글)

**Files:**
- Create: `src/components/TableOfContents.astro`, `src/components/RelatedPosts.astro`, `src/layouts/PostLayout.astro`, `src/pages/posts/[...id].astro`

**Interfaces:**
- Consumes: `getVisiblePosts`·`getRelatedPosts`·`Post` (Task 3), `getCategory` (Task 2)
- Produces:
  - `TableOfContents.astro`: props `{ headings: { depth: number; slug: string; text: string }[] }`
  - `RelatedPosts.astro`: props `{ posts: Post[] }`
  - `PostLayout.astro`: props `{ post: Post; headings: MarkdownHeading[] }`, 본문은 `<slot />`

- [ ] **Step 1: `TableOfContents.astro` 작성**

```astro
---
import type { MarkdownHeading } from 'astro';

interface Props { headings: MarkdownHeading[] }
const { headings } = Astro.props;
const items = headings.filter((h) => h.depth === 2 || h.depth === 3);
---

{items.length > 0 && (
  <nav class="toc" aria-label="목차">
    <p class="ttl">목차</p>
    <ul>
      {items.map((h) => (
        <li class:list={[{ sub: h.depth === 3 }]}>
          <a href={`#${h.slug}`}>{h.text}</a>
        </li>
      ))}
    </ul>
  </nav>
)}

<style>
  .toc { position: sticky; top: 78px; font-size: .82em; line-height: 1.6; }
  .ttl { margin: 0 0 8px; font-weight: 800; font-size: .95em; color: var(--text-dim); }
  ul { list-style: none; margin: 0; padding: 0; border-left: 1px solid var(--border); }
  li { padding: 0; }
  li a { display: block; padding: 4px 0 4px 12px; color: var(--text-dim); border-left: 2px solid transparent; margin-left: -1px; }
  li a:hover { color: var(--text); text-decoration: none; }
  li a.on { color: var(--accent); font-weight: 700; border-left-color: var(--accent); }
  li.sub a { padding-left: 24px; font-size: .95em; }
</style>

<script>
  const links = document.querySelectorAll<HTMLAnchorElement>('.toc a');
  if (links.length) {
    const bySlug = new Map<string, HTMLAnchorElement>();
    links.forEach((a) => bySlug.set(decodeURIComponent(a.hash.slice(1)), a));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          links.forEach((a) => a.classList.remove('on'));
          bySlug.get(e.target.id)?.classList.add('on');
        });
      },
      { rootMargin: '-70px 0px -70% 0px' },
    );

    document.querySelectorAll('.prose h2, .prose h3').forEach((h) => observer.observe(h));
  }
</script>
```

- [ ] **Step 2: `RelatedPosts.astro` 작성**

```astro
---
import type { Post } from '../lib/posts';

interface Props { posts: Post[] }
const { posts } = Astro.props;
---

{posts.length > 0 && (
  <section class="rel">
    <p class="ttl">같은 분류의 다른 글</p>
    <ul>
      {posts.map((p) => (
        <li><a href={`/posts/${p.id}`}>{p.data.title}</a></li>
      ))}
    </ul>
  </section>
)}

<style>
  .rel { margin-top: 60px; padding-top: 22px; border-top: 1px solid var(--border); }
  .ttl { margin: 0 0 10px; font-size: .8em; font-weight: 800; letter-spacing: .1em; color: var(--text-dim); }
  ul { list-style: none; margin: 0; padding: 0; }
  li { padding: 6px 0; }
  li a { color: var(--text); font-size: .95em; }
  li a:hover { color: var(--accent); text-decoration: none; }
</style>
```

- [ ] **Step 3: `PostLayout.astro` 작성**

카테고리별 분기가 이 파일에 모여 있다. 조건은 `getCategory(...).layout` 하나뿐이다.

```astro
---
import type { MarkdownHeading } from 'astro';
import BaseLayout from './BaseLayout.astro';
import TableOfContents from '../components/TableOfContents.astro';
import RelatedPosts from '../components/RelatedPosts.astro';
import Comments from '../components/Comments.astro';
import { getCategory } from '../site.config';
import { getRelatedPosts, type Post } from '../lib/posts';

interface Props { post: Post; headings: MarkdownHeading[] }
const { post, headings } = Astro.props;

const cat = getCategory(post.data.category);
const isDoc = cat.layout === 'doc';
const related = await getRelatedPosts(post);
const date = post.data.pubDate.toISOString().slice(0, 10).replace(/-/g, '.');
const ogImage = post.data.cover ?? `/og/${post.id}.png`;
---

<BaseLayout title={post.data.title} description={post.data.description} ogImage={ogImage}>
  <div class="page">
    <div class:list={['shell', isDoc ? 'doc' : 'read']}>
      {isDoc && <aside class="side"><TableOfContents headings={headings} /></aside>}

      <article data-pagefind-body>
        <header>
          <p class="cat">{cat.label}</p>
          <h1>{post.data.title}</h1>
          <p class:list={['lead', { serif: !isDoc }]}>{post.data.description}</p>
          <p class="date">{date}</p>
        </header>

        <div class="prose"><slot /></div>

        <RelatedPosts posts={related} />
        <Comments slug={post.id} />
      </article>
    </div>
  </div>
</BaseLayout>

<style>
  .shell { display: grid; gap: 40px; margin: 40px 0 0; }
  .shell.doc { grid-template-columns: 200px minmax(0, var(--w-doc)); }
  .shell.read { grid-template-columns: minmax(0, var(--w-read)); justify-content: center; }

  header { margin-bottom: 30px; }
  .cat { margin: 0 0 10px; font-size: .74em; font-weight: 800; letter-spacing: .12em; color: var(--accent); }
  h1 { margin: 0 0 14px; font-size: 2.1em; line-height: 1.32; letter-spacing: -.03em; }
  .lead { margin: 0 0 16px; color: var(--text-dim); font-size: 1.1em; line-height: 1.7; }
  .lead.serif { font-family: var(--font-serif); font-size: 1.18em; }
  .date { margin: 0; padding-bottom: 18px; border-bottom: 1px solid var(--border); font-size: .8em; color: var(--text-dim); }

  .shell.read .prose { line-height: 1.95; }

  @media (max-width: 900px) {
    .shell.doc { grid-template-columns: minmax(0, 1fr); }
    .side { display: none; }
  }
</style>
```

`data-pagefind-body`를 `<article>`에 붙이는 것이 Task 8의 전제다. 이게 없으면 Pagefind가 내비게이션과 푸터까지 색인해서 검색 결과에 잡음이 섞인다.

- [ ] **Step 4: 상세 라우트 작성**

```astro
---
import { render } from 'astro:content';
import PostLayout from '../../layouts/PostLayout.astro';
import { getVisiblePosts } from '../../lib/posts';

export async function getStaticPaths() {
  const posts = await getVisiblePosts();
  return posts.map((post) => ({ params: { id: post.id }, props: { post } }));
}

const { post } = Astro.props;
const { Content, headings } = await render(post);
---

<PostLayout post={post} headings={headings}>
  <Content />
</PostLayout>
```

- [ ] **Step 5: `Comments.astro` 자리표시자 작성**

Task 10에서 giscus를 채우지만, `PostLayout`이 지금 이 컴포넌트를 import하므로 빌드가 되는 최소 형태를 먼저 만든다.

```astro
---
import { SITE } from '../site.config';

interface Props { slug: string }
const { slug } = Astro.props;
const enabled = SITE.giscus.repo !== '' && SITE.giscus.repoId !== '';
---

{enabled && <div class="comments" data-slug={slug}></div>}
```

설정이 비었으면 아무것도 렌더하지 않으므로, giscus 발급 전에도 빌드와 페이지가 정상이다.

- [ ] **Step 6: 빌드하고 라우팅·분기 확인**

```bash
npm run build
ls dist/posts/
```

기대: `jpa-n1/`, `claude-code-rules/`, `easy-to-change/`, `index.html`

기술글에는 목차가 있어야 한다.

```bash
grep -c 'aria-label="목차"' dist/posts/jpa-n1/index.html
```

기대: `1`

에세이에는 목차가 없어야 한다.

```bash
grep -c 'aria-label="목차"' dist/posts/easy-to-change/index.html
```

기대: `0`

에세이 리드문에 세리프 클래스가 붙어야 한다.

```bash
grep -c 'lead serif' dist/posts/easy-to-change/index.html
```

기대: `1`

Pagefind 대상 표시를 확인한다.

```bash
grep -c 'data-pagefind-body' dist/posts/jpa-n1/index.html
```

기대: `1`

- [ ] **Step 7: 개발 서버에서 눈 확인**

- `/posts/jpa-n1` — 좌측에 목차가 붙어 있고, 스크롤하면 현재 섹션이 딥그린으로 강조된다
- 목차 항목을 클릭하면 해당 제목으로 이동하고 제목이 헤더에 가려지지 않는다
- 코드블록에 하이라이팅이 적용되고, 다크모드로 바꾸면 코드 색도 함께 바뀐다
- `/posts/easy-to-change` — 목차가 없고 본문이 더 좁으며 리드문이 세리프다
- 두 글 모두 하단에 "같은 분류의 다른 글"이 나온다 (`ai` 글은 같은 카테고리가 없어 섹션이 안 나오는 게 정상)
- 브라우저 폭을 900px 이하로 줄이면 목차가 사라지고 본문이 한 칼럼으로 찬다

- [ ] **Step 8: 커밋**

```bash
git add -A
git commit -m "feat: 글 상세 페이지, 목차, 카테고리별 레이아웃 분기 추가"
```

---

## Task 6: 프로젝트 목록과 상세

**Files:**
- Create: `src/components/MetricsTable.astro`, `src/components/ProjectCard.astro`, `src/layouts/ProjectLayout.astro`, `src/pages/projects/index.astro`, `src/pages/projects/[...id].astro`
- Modify: `src/pages/index.astro` (홈 하단 프로젝트 섹션)

**Interfaces:**
- Consumes: 컬렉션 `projects` (Task 3), `BaseLayout` (Task 2)
- Produces:
  - `MetricsTable.astro`: props `{ metrics: { label: string; before: string; after: string }[]; compact?: boolean }`
  - `ProjectCard.astro`: props `{ project: CollectionEntry<'projects'> }`
  - `ProjectLayout.astro`: props `{ project: CollectionEntry<'projects'> }`, 본문은 `<slot />`

- [ ] **Step 1: `MetricsTable.astro` 작성**

카드와 상세에서 같은 컴포넌트를 쓴다. `compact`는 카드용으로 첫 항목만 크게 보여주는 모드다.

```astro
---
interface Metric { label: string; before: string; after: string }
interface Props { metrics: Metric[]; compact?: boolean }
const { metrics, compact = false } = Astro.props;
const shown = compact ? metrics.slice(0, 1) : metrics;
---

{shown.length > 0 && (
  <div class:list={['metrics', { compact }]}>
    {shown.map((m) => (
      <div class="m">
        <div class="lbl">{m.label}</div>
        <div class="val">
          <s>{m.before}</s>
          <span class="arrow" aria-hidden="true">→</span>
          <b>{m.after}</b>
        </div>
      </div>
    ))}
  </div>
)}

<style>
  .metrics { display: grid; gap: 12px; }
  .metrics:not(.compact) {
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    margin: 24px 0 30px;
  }
  .m { border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; background: var(--bg-elev); }
  .compact .m { border: 0; padding: 0; background: none; }
  .lbl { font-size: .76em; color: var(--text-dim); margin-bottom: 5px; }
  .val { display: flex; align-items: baseline; gap: 7px; }
  s { color: var(--text-dim); opacity: .7; font-size: .86em; text-decoration: line-through; }
  .arrow { color: var(--text-dim); font-size: .8em; }
  b { color: var(--accent); font-size: 1.16em; font-weight: 800; letter-spacing: -.02em; }
</style>
```

- [ ] **Step 2: `ProjectCard.astro` 작성**

```astro
---
import type { CollectionEntry } from 'astro:content';
import MetricsTable from './MetricsTable.astro';

interface Props { project: CollectionEntry<'projects'> }
const { project } = Astro.props;
const d = project.data;
---

<a class="card" href={`/projects/${project.id}`}>
  <h3>{d.title}</h3>
  <p class="sum">{d.summary}</p>
  <MetricsTable metrics={d.metrics} compact />
  <div class="stack">{d.stack.join(' · ')}</div>
</a>

<style>
  .card {
    display: block; border: 1px solid var(--border); border-radius: 10px;
    padding: 18px; background: var(--bg-elev); color: var(--text);
  }
  .card:hover { border-color: var(--accent); text-decoration: none; }
  h3 { margin: 0 0 7px; font-size: 1.02em; }
  .sum { margin: 0 0 12px; color: var(--text-dim); font-size: .89em; line-height: 1.6; }
  .stack { margin-top: 12px; font-size: .76em; color: var(--text-dim); }
</style>
```

- [ ] **Step 3: 프로젝트 목록 페이지 작성**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import ProjectCard from '../../components/ProjectCard.astro';

const projects = (await getCollection('projects')).sort(
  (a, b) => a.data.order - b.data.order,
);
---

<BaseLayout title="프로젝트" description="만든 것들과 그때의 판단">
  <div class="page narrow">
    <h1>프로젝트</h1>
    <div class:list={['grid', { single: projects.length === 1 }]}>
      {projects.map((project) => <ProjectCard project={project} />)}
    </div>
  </div>
</BaseLayout>

<style>
  .narrow { max-width: var(--w-doc); }
  h1 { font-size: 1.5em; margin: 34px 0 20px; }
  .grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
  .grid.single { grid-template-columns: 1fr; }
</style>
```

`single` 클래스로 프로젝트가 1개일 때 카드가 전체 폭을 차지하게 한다. `auto-fit`만 쓰면 카드 하나가 좁게 남고 오른쪽이 비어 어색해진다.

- [ ] **Step 4: `ProjectLayout.astro` 작성**

```astro
---
import type { CollectionEntry } from 'astro:content';
import BaseLayout from './BaseLayout.astro';
import MetricsTable from '../components/MetricsTable.astro';

interface Props { project: CollectionEntry<'projects'> }
const { project } = Astro.props;
const d = project.data;
---

<BaseLayout title={d.title} description={d.summary} ogImage={`/og/project-${project.id}.png`}>
  <div class="page narrow">
    <article data-pagefind-body>
      <h1>{d.title}</h1>
      <p class="sum">{d.summary}</p>

      <dl class="facts">
        <div><dt>기간</dt><dd>{d.period}</dd></div>
        <div><dt>역할</dt><dd>{d.role}</dd></div>
        <div><dt>기술</dt><dd>{d.stack.join(', ')}</dd></div>
        {(d.repo || d.demo) && (
          <div>
            <dt>링크</dt>
            <dd>
              {d.repo && <a href={d.repo}>GitHub</a>}
              {d.repo && d.demo && ' · '}
              {d.demo && <a href={d.demo}>Demo</a>}
            </dd>
          </div>
        )}
      </dl>

      <MetricsTable metrics={d.metrics} />

      <div class="prose"><slot /></div>
    </article>
  </div>
</BaseLayout>

<style>
  .narrow { max-width: var(--w-doc); }
  h1 { margin: 40px 0 10px; font-size: 1.8em; letter-spacing: -.025em; }
  .sum { margin: 0 0 22px; color: var(--text-dim); font-size: 1.02em; }
  .facts { margin: 0 0 4px; padding: 16px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); display: grid; gap: 9px; }
  .facts div { display: flex; gap: 12px; font-size: .89em; }
  dt { flex: 0 0 52px; color: var(--text-dim); }
  dd { margin: 0; }
</style>
```

- [ ] **Step 5: 프로젝트 상세 라우트 작성**

```astro
---
import { getCollection, render } from 'astro:content';
import ProjectLayout from '../../layouts/ProjectLayout.astro';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map((project) => ({
    params: { id: project.id },
    props: { project },
  }));
}

const { project } = Astro.props;
const { Content } = await render(project);
---

<ProjectLayout project={project}>
  <Content />
</ProjectLayout>
```

- [ ] **Step 6: 홈에 프로젝트 섹션 붙이기**

`src/pages/index.astro`에 `ProjectCard` import를 추가하고, `allProjects` 아래에 `featured` 계산을 넣는다. `ProfileHeader`에 넘기는 `allProjects.length`는 그대로 둔다(프로필 링크는 전체 개수를 보여준다).

```astro
const featured = allProjects
  .filter((p) => p.data.featured)
  .sort((a, b) => a.data.order - b.data.order)
  .slice(0, 3);
```

"글 전체 보기" 링크 아래에 섹션을 추가한다.

```astro
{featured.length > 0 && (
  <section class="pj">
    <p class="lbl">프로젝트</p>
    <div class:list={['pj-grid', { single: featured.length === 1 }]}>
      {featured.map((project) => <ProjectCard project={project} />)}
    </div>
  </section>
)}
```

스타일에 추가한다. 글 카드 그리드(`.grid`)와 클래스를 분리해서, 프로젝트가 1개일 때만 전체 폭으로 펴지도록 한다.

```css
.pj { margin-top: 52px; }
.lbl { margin: 0 0 12px; font-size: .78em; font-weight: 800; letter-spacing: .12em; color: var(--text-dim); }
.pj-grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
.pj-grid.single { grid-template-columns: 1fr; }
```

- [ ] **Step 7: 빌드하고 확인**

```bash
npm run build
ls dist/projects/
```

기대: `coupon/`, `index.html`

성과 숫자가 카드와 상세 양쪽에 나와야 한다.

```bash
grep -c "180ms" dist/index.html dist/projects/index.html dist/projects/coupon/index.html
```

기대: 세 파일 모두 `1` 이상.

상세에는 두 지표가 모두, 카드에는 첫 지표만 나온다.

```bash
grep -c "중복 발급" dist/projects/coupon/index.html
```

기대: `1` 이상.

```bash
grep -c "중복 발급" dist/index.html
```

기대: `0` (카드는 `compact`로 첫 지표만 보여준다)

- [ ] **Step 8: 개발 서버에서 눈 확인**

- `/projects` — 프로젝트가 1개라서 카드가 전체 폭으로 넓게 깔린다
- `/projects/coupon` — 기간·역할·기술·링크 표, 그 아래 성과 2개가 딥그린 숫자로 크게 보이고, 본문 4단(문제/아키텍처/내 역할/결과)이 이어진다
- `/` 하단에 프로젝트 카드가 보이고 프로필 줄 오른쪽에 "프로젝트 1개 →"가 있다
- 다크모드에서 카드 배경(`--bg-elev`)이 본문 배경과 살짝 구분된다

- [ ] **Step 9: 커밋**

```bash
git add -A
git commit -m "feat: 프로젝트 목록·상세와 성과 표시 컴포넌트 추가"
```

---

## Task 7: 소개 페이지와 404

**Files:**
- Create: `src/pages/about.astro`, `src/pages/404.astro`

**Interfaces:**
- Consumes: `SITE` (Task 2), `BaseLayout` (Task 2)
- Produces: 없음 (말단 페이지)

- [ ] **Step 1: `about.astro` 작성**

문구는 임시다. 교체할 자리를 주석으로 표시한다.

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { SITE } from '../site.config';

/* TODO(본인): 아래 소개 문단과 기술 스택을 실제 내용으로 교체 */
const stacks = [
  { group: '언어', items: ['Java', 'TypeScript', 'SQL'] },
  { group: '프레임워크', items: ['Spring Boot', 'JPA'] },
  { group: '인프라', items: ['MySQL', 'Redis', 'Docker', 'GitHub Actions'] },
];
---

<BaseLayout title="소개" description={SITE.description}>
  <div class="page narrow">
    <h1>소개</h1>

    <div class="prose">
      <p>
        {SITE.author}입니다. 서버가 왜 느려졌는지 끝까지 파는 일을 좋아합니다.
        문제를 재현하고 숫자로 확인한 뒤에 고칩니다.
      </p>
      <p>
        이 블로그에는 기술 학습과 트러블슈팅, AI 도구를 개발에 쓰는 방법,
        프로젝트 회고, 일하는 방식에 대한 생각을 씁니다.
      </p>
    </div>

    <h2>기술 스택</h2>
    <dl class="stack">
      {stacks.map((s) => (
        <div>
          <dt>{s.group}</dt>
          <dd>{s.items.join(', ')}</dd>
        </div>
      ))}
    </dl>

    <h2>연락</h2>
    <ul class="links">
      <li><a href={SITE.links.github}>GitHub</a></li>
      <li><a href={`mailto:${SITE.links.email}`}>{SITE.links.email}</a></li>
    </ul>
  </div>
</BaseLayout>

<style>
  .narrow { max-width: var(--w-read); }
  h1 { font-size: 1.6em; margin: 40px 0 20px; }
  h2 { font-size: 1.05em; margin: 40px 0 12px; }
  .stack { margin: 0; display: grid; gap: 9px; }
  .stack div { display: flex; gap: 14px; font-size: .93em; }
  dt { flex: 0 0 72px; color: var(--text-dim); }
  dd { margin: 0; }
  .links { list-style: none; margin: 0; padding: 0; font-size: .93em; }
  .links li { padding: 3px 0; }
</style>
```

- [ ] **Step 2: `404.astro` 작성**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="찾을 수 없는 페이지" description="요청한 주소에 페이지가 없습니다.">
  <div class="page box">
    <p class="code">404</p>
    <h1>페이지를 찾을 수 없습니다</h1>
    <p class="hint">주소가 바뀌었거나 삭제된 글일 수 있습니다.</p>
    <p><a href="/">홈으로</a> · <a href="/posts">글 목록</a></p>
  </div>
</BaseLayout>

<style>
  .box { text-align: center; padding: 90px 20px; }
  .code { margin: 0; font-family: var(--font-mono); font-size: 2.6em; color: var(--accent); }
  h1 { font-size: 1.3em; margin: 10px 0; }
  .hint { color: var(--text-dim); font-size: .93em; }
</style>
```

- [ ] **Step 3: 빌드하고 확인**

```bash
npm run build && ls dist/about/index.html dist/404.html
```

기대: 두 파일 모두 존재.

- [ ] **Step 4: 개발 서버 확인**

`/about`에서 소개·스택·연락처가 보이고, `/no-such-page`에서 404 페이지가 나온다.

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "feat: 소개 페이지와 404 페이지 추가"
```

---

## Task 8: 검색 (Pagefind)

**Files:**
- Create: `src/pages/search.astro`
- Modify: `package.json`, `astro.config.mjs`

**Interfaces:**
- Consumes: `data-pagefind-body`가 붙은 `PostLayout`·`ProjectLayout` (Task 5, 6)
- Produces: `/search` 페이지. Nav의 `⌕` 링크(Task 2)가 여기로 온다

- [ ] **Step 1: 설치**

```bash
npm install astro-pagefind
```

- [ ] **Step 2: `astro.config.mjs`에 통합 추가**

```js
import { defineConfig } from 'astro/config';
import pagefind from 'astro-pagefind';

export default defineConfig({
  site: 'https://kiddo-psh.github.io',
  integrations: [pagefind()],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
```

이 통합이 빌드 후 `dist/`를 색인하고, 개발 서버에서도 색인을 서빙한다. 색인은 빌드된 HTML을 대상으로 하므로, 개발 서버에서 검색을 확인하려면 먼저 한 번 `npm run build`를 돌려야 한다.

- [ ] **Step 3: `search.astro` 작성**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import PagefindConfig from 'astro-pagefind/components/PagefindConfig.astro';
---

<BaseLayout title="검색" description="사이트 내 글 검색">
  <div class="page narrow">
    <h1>검색</h1>
    <PagefindConfig />
    <pagefind-searchbox></pagefind-searchbox>
  </div>
</BaseLayout>

<style>
  .narrow { max-width: var(--w-doc); }
  h1 { font-size: 1.5em; margin: 34px 0 18px; }
  pagefind-searchbox {
    --pagefind-ui-primary: var(--accent);
    --pagefind-ui-text: var(--text);
    --pagefind-ui-background: var(--bg);
    --pagefind-ui-border: var(--border);
    --pagefind-ui-font: var(--font-sans);
    display: block;
  }
</style>
```

`Search.astro`(구 컴포넌트)가 아니라 `PagefindConfig` + `<pagefind-searchbox>`를 쓴다. 구 컴포넌트는 유지보수 모드이고, `PagefindConfig`가 번들 경로를 맞춰준다.

- [ ] **Step 4: 빌드하고 색인 생성 확인**

```bash
npm run build
ls dist/pagefind/
```

기대: `pagefind.js`와 `fragment/`, `index/` 등이 생성된다.

색인에 글 본문이 들어갔는지 확인한다.

```bash
grep -rl "fetch join" dist/pagefind/fragment/ | head -1
```

기대: 파일 경로 하나가 출력된다 (본문 문구가 색인에 들어갔다는 뜻).

내비게이션 문구가 색인되지 않았는지 확인한다.

```bash
grep -rl "테마 전환" dist/pagefind/fragment/ | head -1
```

기대: 아무것도 출력되지 않는다 (`data-pagefind-body`가 범위를 본문으로 제한하고 있다).

- [ ] **Step 5: 검색 동작 확인**

```bash
npm run preview
```

`http://localhost:4321/search`에서 확인할 것:

- `쿠폰`을 입력하면 프로젝트 상세가 결과에 나온다
- `fetch`를 입력하면 JPA 글이 나온다
- **한글 단어(`동시성`, `회고`)로 검색해도 결과가 나온다**
- 결과를 클릭하면 해당 페이지로 이동한다
- 다크모드에서 검색 UI가 배경에 묻히지 않는다

한글이 안 걸리면 Pagefind가 언어를 감지하지 못한 경우다. `BaseLayout`의 `<html lang="ko">`가 제대로 출력되는지 확인한다 (Pagefind는 이 값으로 분절 방식을 정한다).

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "feat: Pagefind 기반 사이트 내 검색 추가"
```

---

## Task 9: RSS, sitemap, 공유 카드 이미지

**Files:**
- Create: `src/pages/rss.xml.ts`, `src/pages/og/[...route].ts`, `public/fonts/` (폰트 파일)
- Modify: `package.json`, `astro.config.mjs`

**Interfaces:**
- Consumes: `getVisiblePosts` (Task 3), `SITE` (Task 2), `PostLayout`이 참조하는 `/og/{id}.png` 경로 (Task 5), `ProjectLayout`이 참조하는 `/og/project-{id}.png` 경로 (Task 6)
- Produces: `/rss.xml`, `/sitemap-index.xml`, `/og/{id}.png`, `/og/project-{id}.png`

- [ ] **Step 1: 설치**

```bash
npm install @astrojs/rss @astrojs/sitemap astro-og-canvas
```

- [ ] **Step 2: `astro.config.mjs`에 sitemap 추가**

`integrations` 배열을 `[pagefind(), sitemap()]`으로 바꾸고 `import sitemap from '@astrojs/sitemap';`을 추가한다.

- [ ] **Step 3: `rss.xml.ts` 작성**

```ts
import rss from '@astrojs/rss';
import { getVisiblePosts } from '../lib/posts';
import { SITE } from '../site.config';

export async function GET() {
  const posts = await getVisiblePosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/posts/${post.id}`,
      categories: [post.data.category],
    })),
    customData: '<language>ko</language>',
  });
}
```

- [ ] **Step 4: 한글이 렌더되는 폰트 파일 준비**

공유 카드는 캔버스에 직접 글자를 그리므로 웹폰트 CSS와 무관하게 **폰트 파일이 필요하다.** 시스템 폰트로는 한글이 두부(□□□)로 나온다.

```bash
mkdir -p public/fonts
curl -fL -o public/fonts/Pretendard-Bold.woff2 \
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/woff2/Pretendard-Bold.woff2"
curl -fL -o public/fonts/Pretendard-Regular.woff2 \
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/woff2/Pretendard-Regular.woff2"
ls -la public/fonts/
```

버전 태그는 Task 2 Step 1에서 확인한 값을 쓴다. 기대: 두 파일이 각각 수백 KB 이상으로 받아진다. 0바이트나 404 HTML이면 경로가 틀린 것이므로 저장소의 `dist/web/static/woff2/` 경로를 다시 확인한다.

- [ ] **Step 5: `og/[...route].ts` 작성**

글과 프로젝트를 한 라우트에서 처리한다. 프로젝트 키에 `project-` 접두사를 붙여 슬러그가 겹치는 사고를 막는다.

```ts
import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';

const posts = await getCollection('posts');
const projects = await getCollection('projects');

const pages: Record<string, { title: string; description: string }> = {};
for (const p of posts) {
  pages[p.id] = { title: p.data.title, description: p.data.description };
}
for (const p of projects) {
  pages[`project-${p.id}`] = { title: p.data.title, description: p.data.summary };
}

export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'route',
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    bgGradient: [[251, 250, 247]],
    border: { color: [29, 107, 79], width: 24, side: 'inline-start' },
    padding: 60,
    font: {
      title: { size: 58, weight: 'Bold', color: [35, 33, 29], lineHeight: 1.3 },
      description: { size: 28, weight: 'Normal', color: [87, 83, 74], lineHeight: 1.5 },
    },
    fonts: [
      './public/fonts/Pretendard-Bold.woff2',
      './public/fonts/Pretendard-Regular.woff2',
    ],
  }),
});
```

색을 CSS 변수로 못 쓰는 곳이라 RGB 값을 직접 넣는다. 라이트 토큰과 같은 값이며(`#FBFAF7`, `#23211D`, `#57534A`, `#1D6B4F`), 토큰을 바꾸면 이 파일도 함께 고쳐야 한다는 주석을 파일 상단에 남긴다.

- [ ] **Step 6: 빌드하고 산출물 확인**

```bash
npm run build
ls dist/rss.xml dist/sitemap-index.xml
ls dist/og/
```

기대: `rss.xml`, `sitemap-index.xml`이 있고 `dist/og/`에 `jpa-n1.png`, `claude-code-rules.png`, `easy-to-change.png`, `project-coupon.png`이 있다.

RSS에 글이 들어갔는지 확인한다.

```bash
grep -c "JPA N+1" dist/rss.xml
```

기대: `1`

메타태그가 절대 URL로 들어갔는지 확인한다.

```bash
grep -o 'og:image" content="[^"]*"' dist/posts/jpa-n1/index.html
```

기대: `og:image" content="https://kiddo-psh.github.io/og/jpa-n1.png"`

- [ ] **Step 7: 한글이 이미지에 제대로 그려졌는지 확인 (중요)**

```bash
ls -la dist/og/jpa-n1.png
```

파일을 직접 열어 본다.

```bash
start dist/og/jpa-n1.png
```

기대: 종이색 배경, 왼쪽에 딥그린 세로 띠, **한글 제목이 두부(□□□)가 아니라 정상 렌더**된다.

두부로 나오면 `woff2`를 canvaskit이 못 읽은 경우다. `dist/web/static/otf/`의 `.otf` 또는 `variable/PretendardVariable.ttf`를 받아 `fonts` 경로를 그 파일로 바꾸고 다시 빌드한다.

- [ ] **Step 8: 커밋**

```bash
git add -A
git commit -m "feat: RSS, sitemap, 공유 카드 이미지 자동 생성 추가"
```

---

## Task 10: 댓글 (giscus)

**Files:**
- Modify: `src/components/Comments.astro`, `src/site.config.ts`

**Interfaces:**
- Consumes: `SITE.giscus` (Task 2), `Comments` 호출부 (Task 5 Step 5)
- Produces: 글 하단 댓글. 설정이 비면 렌더하지 않는다

- [ ] **Step 1: giscus 준비 (사람이 하는 작업)**

1. `kiddo-psh/kiddo-psh.github.io` → Settings → General → Features에서 **Discussions**를 켠다
2. Discussions → Categories에서 `Announcements` 카테고리가 있는지 확인한다 (없으면 만든다. Announcements 형식이어야 아무나 새 글을 만들 수 없다)
3. https://github.com/apps/giscus 에서 giscus 앱을 이 저장소에 설치한다
4. https://giscus.app 에서 저장소를 입력하고, 매핑은 **pathname**, 카테고리는 `Announcements`를 고른다
5. 페이지가 보여주는 `data-repo-id`와 `data-category-id` 값을 복사한다

- [ ] **Step 2: `site.config.ts`에 값 채우기**

```ts
giscus: {
  repo: 'kiddo-psh/kiddo-psh.github.io',
  repoId: '<복사한 data-repo-id>',
  category: 'Announcements',
  categoryId: '<복사한 data-category-id>',
},
```

- [ ] **Step 3: `Comments.astro` 구현**

```astro
---
import { SITE } from '../site.config';

interface Props { slug: string }
const { slug } = Astro.props;
const g = SITE.giscus;
const enabled = g.repo !== '' && g.repoId !== '' && g.categoryId !== '';
---

{enabled && (
  <section class="comments" data-slug={slug}>
    <script
      is:inline
      src="https://giscus.app/client.js"
      data-repo={g.repo}
      data-repo-id={g.repoId}
      data-category={g.category}
      data-category-id={g.categoryId}
      data-mapping="pathname"
      data-strict="1"
      data-reactions-enabled="1"
      data-emit-metadata="0"
      data-input-position="top"
      data-lang="ko"
      data-loading="lazy"
      crossorigin="anonymous"
      async
    ></script>
  </section>
)}

<style>
  .comments { margin-top: 56px; padding-top: 26px; border-top: 1px solid var(--border); }
</style>

<script>
  // 테마 토글에 맞춰 giscus iframe 테마를 바꾼다.
  function sendTheme() {
    const frame = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
    if (!frame?.contentWindow) return;
    const theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    frame.contentWindow.postMessage(
      { giscus: { setConfig: { theme } } },
      'https://giscus.app',
    );
  }

  new MutationObserver(sendTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  window.addEventListener('message', (e) => {
    if (e.origin === 'https://giscus.app') sendTheme();
  });
</script>
```

`data-theme` 초기값을 스크립트로 넘기지 않고 giscus가 로드된 뒤 `postMessage`로 맞추는 이유: 서버 렌더 시점에는 방문자의 테마를 알 수 없다. 로드 완료 메시지를 받은 뒤 현재 테마를 보내면 라이트/다크가 어긋나지 않는다.

- [ ] **Step 4: 빌드하고 확인**

```bash
npm run build
grep -c "giscus.app/client.js" dist/posts/jpa-n1/index.html
```

기대: `1`

- [ ] **Step 5: 실제 동작 확인**

```bash
npm run preview
```

`http://localhost:4321/posts/jpa-n1` 하단에서 확인할 것:

- giscus 댓글 상자가 로드된다 (로그인 안내가 보이는 것이 정상)
- 테마를 다크로 바꾸면 댓글 영역도 다크로 따라온다
- 실제로 댓글을 하나 남겨보고, 저장소 Discussions에 글이 생기는지 확인한다

로드가 안 되면 원인은 대개 셋 중 하나다: Discussions 미활성화, giscus 앱 미설치, `repoId`/`categoryId` 오타.

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "feat: giscus 댓글 추가"
```

---

## Task 11: 최종 점검과 배포

**Files:**
- Modify: 점검에서 발견된 파일들

**Interfaces:**
- Consumes: Task 1~10 전부
- Produces: 공개된 사이트

- [ ] **Step 1: 임시 샘플 콘텐츠 정리 방침 결정**

Task 3에서 만든 샘플 글 3개와 프로젝트 1개는 내용이 임시다. 지금은 **남겨둔다** — 레이아웃이 실제 콘텐츠 없이도 확인 가능한 상태를 유지하는 것이 낫고, 첫 실제 글을 쓸 때 파일을 덮어쓰거나 삭제하면 된다.

`docs/superpowers/plans/`에 다음 문장을 기억해두거나 저장소 이슈로 남긴다: "첫 실제 글 발행 시 `src/content/posts/`의 샘플 3개와 `src/content/projects/coupon.md`를 실제 내용으로 교체할 것."

- [ ] **Step 2: 전체 페이지를 라이트·다크 양쪽에서 확인**

```bash
npm run build && npm run preview
```

각 주소를 라이트와 다크에서 모두 본다.

| 주소 | 확인 |
|---|---|
| `/` | 프로필, 탭, 글 카드 그리드, 프로젝트 카드 |
| `/posts` | 카드 그리드, 카테고리 필터 |
| `/posts/jpa-n1` | 목차, 코드 하이라이팅, 관련 글, 댓글, 큰 본문 글씨 |
| `/posts/easy-to-change` | 목차 없음, 좁은 본문, 세리프 리드문 |
| `/projects` | 카드 |
| `/projects/coupon` | 메타 표, 성과 숫자, 본문 |
| `/about` | 소개, 스택, 연락처 |
| `/search` | 한글 검색 |
| `/no-such-page` | 404 |

다크에서 특히 볼 것: 코드블록 배경과 본문 배경의 구분, 액센트 그린의 가독성, 경계선이 너무 어둡거나 밝지 않은지.

- [ ] **Step 3: 모바일 폭 확인**

브라우저 개발자도구에서 폭 390px로 놓고 본다.

- 글 상세에서 목차가 사라지고 본문이 한 칼럼으로 찬다
- 글 카드 그리드와 프로젝트 카드 그리드가 각각 한 줄에 하나로 떨어진다
- 카드 썸네일 타일의 16:9 비율이 유지되고 카드 높이가 서로 어긋나지 않는다
- 내비게이션 항목이 넘치지 않는다
- 코드블록이 가로 스크롤되고 **페이지 전체가 좌우로 밀리지 않는다**
- 성과 숫자 표가 세로로 쌓인다

넘치는 곳이 있으면 해당 컴포넌트의 `@media (max-width: 640px)` 규칙을 추가해 고친다.

- [ ] **Step 4: 배포**

```bash
git push
gh run watch
```

기대: 두 잡 모두 성공.

- [ ] **Step 5: 실제 주소에서 확인**

```bash
curl -s https://kiddo-psh.github.io | grep -c "kiddo-psh"
curl -sI https://kiddo-psh.github.io/rss.xml | head -1
curl -sI https://kiddo-psh.github.io/og/jpa-n1.png | head -1
```

기대: 첫 명령은 `1` 이상, 나머지는 `HTTP/2 200`.

- [ ] **Step 6: 공유 카드 확인**

`https://kiddo-psh.github.io/posts/jpa-n1` 링크를 카카오톡 나와의 채팅과 슬랙에 붙여본다.

기대: 제목·설명과 함께 자동 생성된 이미지 카드가 뜬다.

카드가 안 뜨면 캐시 때문일 수 있다. https://developers.facebook.com/tools/debug/ 에서 URL을 넣고 다시 긁어 어떤 메타태그가 읽히는지 확인한다.

- [ ] **Step 7: 검색엔진 등록**

Google Search Console에 `https://kiddo-psh.github.io` 속성을 추가하고 사이트맵으로 `https://kiddo-psh.github.io/sitemap-index.xml`을 제출한다. 소유 확인은 HTML 파일 방식을 쓰면 `public/`에 파일을 넣고 커밋하면 된다.

- [ ] **Step 8: 의존성 고정 상태 확인**

```bash
git status --short package-lock.json
```

기대: 출력 없음 (lock 파일이 커밋되어 있고 변경도 없다).

```bash
grep -c '"node-version-file": *".nvmrc"\|node-version-file' .github/workflows/deploy.yml
```

기대: `1`

Dependabot 설정 파일(`.github/dependabot.yml`)이 없는지 확인한다. 스펙 §9에서 자동 PR을 켜지 않기로 했다.

```bash
ls .github/dependabot.yml 2>/dev/null || echo "없음 (의도한 상태)"
```

- [ ] **Step 9: 최종 커밋**

```bash
git add -A
git commit -m "chore: 최종 점검 반영"
git push
```

---

## 구축 후 남는 작업 (본인 몫)

스펙 §12의 항목이다. 계획 실행으로는 채울 수 없는 것들이다.

- `src/site.config.ts`의 `tagline`, `src/pages/about.astro`의 소개 문단과 기술 스택 — 둘 다 `TODO(본인)` 주석으로 표시되어 있다
- 프로필 이미지 (`ProfileHeader.astro`의 `.av`를 `<img>`로 교체), `public/favicon.svg`
- 샘플 글 3개와 샘플 프로젝트 1개를 실제 내용으로 교체
- 태그 도입 판단은 같은 주제 글이 3개 쌓인 뒤에 (스펙 §5.3)
