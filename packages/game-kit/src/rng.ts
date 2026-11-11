/** 0 이상 1 미만의 난수를 내는 함수 */
export type Rng = () => number

/** 같은 시드면 같은 수열을 낸다 */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** FNV-1a 32비트. 문자열의 UTF-16 코드 단위를 하나씩 섞는다. 저장된 시드와 날짜 키가 이 값에 기대므로 바꾸지 않는다. */
export function hashString(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
