/** 한글 초성 처리 유틸 */

const CHOSUNG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];
const CHOSUNG_SET = new Set(CHOSUNG);

const SYLLABLE_START = 0xac00;
const SYLLABLE_END = 0xd7a3;
const SYLLABLES_PER_CHOSUNG = 588; // 21(중성) * 28(종성)

export function isHangulSyllable(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return code >= SYLLABLE_START && code <= SYLLABLE_END;
}

export function isChosung(ch: string): boolean {
  return CHOSUNG_SET.has(ch);
}

/** '김현우' → 'ㄱㅎㅇ'. 한글 음절이 아닌 글자는 그대로 둔다. */
export function toChosung(text: string): string {
  let out = '';
  for (const ch of text) {
    if (isHangulSyllable(ch)) {
      out += CHOSUNG[Math.floor((ch.charCodeAt(0) - SYLLABLE_START) / SYLLABLES_PER_CHOSUNG)];
    } else {
      out += ch;
    }
  }
  return out;
}

/**
 * text 안에 query 가 부분 일치하는지 검사한다.
 * query 의 각 글자가 초성(ㄱ~ㅎ)이면 text 쪽 글자의 초성과 비교하므로
 * '김ㅎ', 'ㄱ현', 'ㄱㅎㅇ' 처럼 완성형과 초성이 섞인 입력도 처리된다.
 */
export function hangulIncludes(text: string, query: string): boolean {
  if (!query) return true;
  const t = Array.from(text);
  const q = Array.from(query);
  const tCho = Array.from(toChosung(text));
  outer: for (let i = 0; i + q.length <= t.length; i++) {
    for (let j = 0; j < q.length; j++) {
      const qc = q[j];
      const matched = isChosung(qc) ? tCho[i + j] === qc || t[i + j] === qc : t[i + j] === qc;
      if (!matched) continue outer;
    }
    return true;
  }
  return false;
}
