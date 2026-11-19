/** 서울 달력 기준 YYYY.MM.DD */
export function dotDate(date: Date): string {
  const formatted = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
  return formatted.replaceAll('-', '.');
}

/** 목록 썸네일의 한 글자. 라틴은 대문자, 한글은 첫 음절. */
export function glyph(title: string): string {
  const ch = [...title.trim()][0] ?? '';
  return /[a-z]/i.test(ch) ? ch.toUpperCase() : ch;
}

/** 프로젝트 요약을 한 문장으로. */
export function oneLine(text: string): string {
  const sentence = text.match(/^.*?다\./);
  return (sentence?.[0] ?? text).trim();
}
