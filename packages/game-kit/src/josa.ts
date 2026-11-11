type Pair = '이/가' | '은/는' | '을/를' | '과/와' | '으로/로'

/** 숫자 끝자리 읽는 소리의 받침(종성 번호) — 영 · 일 · 이 · 삼 · 사 · 오 · 육 · 칠 · 팔 · 구 */
const DIGIT_FINAL = [21, 8, 0, 16, 0, 0, 1, 8, 8, 0]
/** 끝의 0 개수별 — 십(ㅂ) · 백(ㄱ) · 천(ㄴ) · 만(ㄴ) */
const TENS_FINAL = [17, 1, 4, 4]

/** 영문 끝 글자를 읽는 소리의 받침 — 엘 · 엠 · 엔 · 알만 받침이 있다(단축키 「R을」 · 「Q를」) */
const LETTER_FINAL: Record<string, number> = { L: 8, M: 16, N: 4, R: 8 }

function letterFinal(word: string): number | null {
  const ch = word.at(-1)
  if (!ch) return null
  if (ch === '%') return 0 // 퍼센트
  return /[a-z]/i.test(ch) ? (LETTER_FINAL[ch.toUpperCase()] ?? 0) : null
}

function numberFinal(word: string): number | null {
  const digits = word.replace(/,/g, '').match(/\d+$/)?.[0]
  if (!digits) return null
  const zeros = digits.length - digits.replace(/0+$/, '').length
  if (zeros === 0 || zeros === digits.length) return DIGIT_FINAL[Number(digits.at(-1))]
  return TENS_FINAL[Math.min(zeros, 4) - 1]
}

/** 받침에 맞춰 조사를 붙인다 — 「꼬마 도깨비가」 · 「구미호는」 · 「도깨비 마을로」 · 「10을」 · 「R을」 · 「15%를」. 한글 · 숫자 · 영문 · % 가 아니면 앞의 것을 쓴다 */
export function josa(word: string | number, pair: Pair): string {
  return `${word}${particle(word, pair)}`
}

/** 조사만 — 「」 같은 괄호 뒤에 붙일 때는 괄호 안 낱말로 받침을 본다 */
export function particle(value: string | number, pair: Pair): string {
  const word = String(value)
  const [withFinal, without] = pair.split('/')
  const code = word.charCodeAt(word.length - 1) - 0xac00
  const final = numberFinal(word) ?? letterFinal(word) ?? (code >= 0 && code <= 11171 ? code % 28 : -1)
  if (final < 0) return withFinal
  // 「으로/로」는 ㄹ 받침도 「로」 — 「마을로」
  if (pair === '으로/로' && final === 8) return without
  return final === 0 ? without : withFinal
}
