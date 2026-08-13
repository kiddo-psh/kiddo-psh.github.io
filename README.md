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
