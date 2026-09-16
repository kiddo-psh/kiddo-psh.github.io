/*
 * 표시용 세리프(나눔명조)를 이 사이트가 실제로 쓰는 글자만 남기고 잘라낸다.
 *
 * 왜 필요한가.
 * fontsource가 주는 한글 폰트는 유니코드 구간 93개로 쪼개져 있다. 브라우저는 페이지에
 * 쓰인 구간만 받으므로 본문용 폰트에는 좋은 방식이다. 그런데 세리프는 히어로·제목·인용
 * 에만 쓰고 글자 수가 몇십 자인데, 한글 음절이 구간에 흩어져 있어서 그 몇십 자가 8개
 * 구간을 건드린다 — 구간마다 23KB씩, 합쳐서 175KB를 받아 몇십 자를 그린다.
 * @font-face 규칙 94개가 렌더를 막는 CSS에도 26KB(gzip)를 더한다.
 *
 * 그래서 빌드할 때 실제로 쓰이는 글자를 모아 한 번에 잘라낸다. 결과는 파일 둘
 * (한글·라틴)과 @font-face 둘이고, 사이트 전체를 합쳐 67KB로 떨어진다.
 *
 * 무엇을 모으는가.
 * 세리프가 붙는 자리만 모은다(.serif, .page-title, .prose blockquote, 홈 선언문).
 * 여기 빠뜨린 자리가 생기면 그 글자만 시스템 명조나 고딕으로 떨어져 눈에 띈다.
 * 그래서 아래 COLLECT에 자리를 모아 두고, 빌드 끝에 직전 결과물과 대조해 빠진 글자가
 * 있으면 빌드를 세운다(verifyAgainstLastBuild).
 *
 * 콘텐츠가 바뀌면 글자 집합도 바뀌므로 매 빌드마다 다시 돈다(prebuild).
 */
import { readFile, writeFile, mkdir, stat, readdir } from 'node:fs/promises';
import path from 'node:path';
import subsetFont from 'subset-font';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = (p) => path.join(ROOT, p);

/** 세리프가 렌더하는 글자가 나오는 곳 */
const COLLECT = {
  /** 홈 선언문 (Hero의 .stmt) */
  config: 'src/site.config.ts',
  /** 글·프로젝트 제목(목록 머리기사·상세 h1)과 본문 강조 블록 */
  contentDirs: ['src/content/posts', 'src/content/projects'],
  /** 브리핑 제목(상세 h1) */
  briefings: 'src/data/briefings.json',
  /** .page-title로 박혀 있는 문자열들. 코드에 리터럴로 있어 자동으로 못 모은다 */
  pageTitles: ['소개', '글', '프로젝트', 'AI 브리핑', '검색', '페이지를 찾을 수 없습니다'],
};

/*
 * 언제나 넣는 글자. 숫자·문장부호·라틴 기본은 제목 어디에나 섞여 들어오고,
 * 다 합쳐도 150자가 안 되므로 콘텐츠에서 찾을 것 없이 통째로 넣는다.
 */
const ALWAYS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' +
  ' .,:;!?\'"()[]{}<>/\\|-–—_+=*&^%$#@~`' +
  '·…“”‘’→←↑↓↗×÷°';

const isHangulOrCJK = (cp) =>
  (cp >= 0x1100 && cp <= 0x11ff) || // 자모
  (cp >= 0x3130 && cp <= 0x318f) || // 호환 자모
  (cp >= 0xac00 && cp <= 0xd7a3) || // 음절
  (cp >= 0xf900 && cp <= 0xfaff) || // 호환 한자
  (cp >= 0x4e00 && cp <= 0x9fff);   // 한자

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

/** 마크다운에서 제목(frontmatter)과 강조 블록(> ...)만 뽑는다 */
function fromMarkdown(raw) {
  /*
   * BOM을 떼고 시작한다. 붙어 있으면 ^---가 첫 줄에 안 걸려 frontmatter를 통째로
   * 놓치고, 그 글의 제목 글자만 폰트에서 빠진다. 실제로 이것 때문에 "딩"과 "잘"
   * 두 글자가 빠져 한 글의 제목이 절반만 명조로 나왔다.
   */
  const text = raw.replace(/^﻿/, '');
  const parts = [];
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fm) {
    for (const key of ['title', 'summary']) {
      const m = fm[1].match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
      if (m) parts.push(m[1].trim().replace(/^['"]|['"]$/g, ''));
    }
  }
  /* 강조 블록. 마크다운 강조 기호는 렌더에 안 남으므로 같이 걷어낸다 */
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*>/.test(line)) parts.push(line.replace(/^\s*>\s?/, '').replace(/[*_`]/g, ''));
  }
  return parts;
}

async function collectChars() {
  const parts = [ALWAYS, ...COLLECT.pageTitles];

  const config = (await readFile(SRC(COLLECT.config), 'utf8')).replace(/^﻿/, '');
  for (const key of ['statement', 'lead', 'title', 'tagline']) {
    const m = config.match(new RegExp(`${key}:\\s*'([^']*)'`));
    if (m) parts.push(m[1]);
  }

  for (const dir of COLLECT.contentDirs) {
    for (const file of await walk(SRC(dir))) {
      if (file.endsWith('.md')) parts.push(...fromMarkdown(await readFile(file, 'utf8')));
    }
  }

  try {
    const briefings = JSON.parse((await readFile(SRC(COLLECT.briefings), 'utf8')).replace(/^﻿/, ''));
    for (const b of briefings) {
      parts.push(b.title ?? '');
      /*
       * 원문 인용은 상세에서 <blockquote>로 나온다. 세리프가 걸리는 자리는
       * .prose 안의 인용뿐이라 여기는 고딕으로 그려지지만, 아래 검증기는
       * HTML만 보고 <blockquote>를 전부 세리프로 친다. 영어 인용이면 라틴이
       * ALWAYS에 이미 있어 문제가 없지만, 한국어 자료를 인용하는 날
       * 빌드가 서는 것을 막으려고 글자를 미리 걷어 둔다.
       */
      if (b.quote) parts.push(b.quote.text ?? '', b.quote.ko ?? '');
    }
  } catch {
    /* 브리핑 데이터가 없을 수도 있다 — 없으면 건너뛴다 */
  }

  return new Set([...parts.join('')].filter((ch) => ch.trim() !== ''));
}

/*
 * 자른 결과를 한글·라틴 둘로 나눈다. 한 벌로 합치면 라틴만 있는 페이지도 한글 자형을
 * 통째로 받게 되고, unicode-range로 나눠 두면 브라우저가 필요한 쪽만 받는다.
 */
const SOURCES = [
  {
    name: 'ko',
    src: 'node_modules/@fontsource/nanum-myeongjo/files/nanum-myeongjo-korean-700-normal.woff2',
    pick: (cp) => isHangulOrCJK(cp),
  },
  {
    name: 'latin',
    src: 'node_modules/@fontsource/nanum-myeongjo/files/nanum-myeongjo-latin-700-normal.woff2',
    pick: (cp) => !isHangulOrCJK(cp),
  },
];

/** 코드포인트 목록 → CSS unicode-range 문자열(연속 구간을 묶는다) */
function toUnicodeRange(codepoints) {
  const sorted = [...codepoints].sort((a, b) => a - b);
  const ranges = [];
  let start = sorted[0];
  let prev = sorted[0];
  for (const cp of sorted.slice(1)) {
    if (cp === prev + 1) {
      prev = cp;
      continue;
    }
    ranges.push([start, prev]);
    start = prev = cp;
  }
  ranges.push([start, prev]);
  const hex = (n) => n.toString(16).toUpperCase().padStart(4, '0');
  return ranges.map(([a, b]) => (a === b ? `U+${hex(a)}` : `U+${hex(a)}-${hex(b)}`)).join(',');
}

/*
 * 직전 빌드 결과를 가지고 자가 검증한다.
 *
 * 이 스크립트의 위험은 단 하나 — 세리프가 걸리는 자리를 COLLECT에서 빠뜨리면 그
 * 글자만 시스템 폰트로 떨어지는 것이고, 화면을 직접 보기 전에는 모른다.
 * 그래서 dist에 남은 HTML에서 세리프가 걸리는 텍스트를 다시 긁어 대조한다.
 * dist가 없는 첫 빌드에서는 건너뛴다(null).
 */
async function verifyAgainstLastBuild(chars) {
  const dist = SRC('dist');
  try {
    await stat(dist);
  } catch {
    return null;
  }

  const strip = (h) => h.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;|&#\d+;/g, ' ');
  const SERIF = /<(h1|h2|h3|p|span|div)\b[^>]*class="[^"]*(?:serif|page-title)[^"]*"[^>]*>([\s\S]*?)<\/\1>/g;
  const QUOTE = /<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/g;

  const missing = new Set();
  for (const f of await walk(dist)) {
    if (!f.endsWith('.html')) continue;
    const html = await readFile(f, 'utf8');
    let text = '';
    for (const m of html.matchAll(SERIF)) text += strip(m[2]);
    for (const m of html.matchAll(QUOTE)) text += strip(m[1]);
    for (const ch of text) if (ch.trim() !== '' && !chars.has(ch)) missing.add(ch);
  }
  return missing;
}

// ── 실행 ──────────────────────────────────────────────────────────────

const chars = await collectChars();
await mkdir(SRC('public/fonts'), { recursive: true });

const faces = [];
let total = 0;

for (const s of SOURCES) {
  const picked = [...chars].filter((ch) => s.pick(ch.codePointAt(0)));
  if (picked.length === 0) continue;

  const buf = await subsetFont(await readFile(SRC(s.src)), picked.join(''), {
    targetFormat: 'woff2',
  });
  await writeFile(SRC(`public/fonts/serif-${s.name}.woff2`), buf);
  total += buf.length;

  faces.push(`/* ${picked.length}자 · ${(buf.length / 1024).toFixed(1)}KB */
@font-face {
  font-family: 'Nanum Myeongjo';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/serif-${s.name}.woff2') format('woff2');
  unicode-range: ${toUnicodeRange(picked.map((ch) => ch.codePointAt(0)))};
}`);

  console.log(`  ${s.name}: ${picked.length}자 → ${(buf.length / 1024).toFixed(1)}KB`);
}

await writeFile(
  SRC('src/styles/serif.css'),
  `/*
 * 자동 생성 파일 — 직접 고치지 않는다. scripts/subset-serif.mjs가 매 빌드마다 다시 쓴다.
 * 이 사이트가 표시용으로 실제 쓰는 글자만 담은 나눔명조다. 어디에 쓰는지와 왜
 * 잘라내는지는 그 스크립트의 주석에 있다.
 */
${faces.join('\n\n')}
`,
  'utf8',
);

const missing = await verifyAgainstLastBuild(chars);
if (missing && missing.size > 0) {
  console.error(
    `\n세리프 서브셋에 빠진 글자 ${missing.size}개: ${[...missing].join('')}\n` +
      '이 글자는 시스템 폰트로 떨어진다. scripts/subset-serif.mjs의 COLLECT에 ' +
      '해당 자리를 추가하고 다시 빌드하라.\n',
  );
  process.exit(1);
}

/* 원본을 그대로 쓸 때와 얼마나 차이 나는지 빌드 로그에 남긴다 — 다시 늘어나면 눈에 띈다 */
const before = (await stat(SRC(SOURCES[0].src))).size;
console.log(
  `세리프 서브셋: ${chars.size}자 → ${(total / 1024).toFixed(1)}KB ` +
    `(원본 한글 한 벌 ${(before / 1024).toFixed(0)}KB, 구간 분할본은 홈 기준 175KB)` +
    (missing ? ' · 직전 빌드 대조 통과' : ' · 대조할 직전 빌드 없음'),
);
