import { describe, expect, it } from 'vitest'
import { qrMatrix, type QrLevel } from './qrCode'

/**
 * 참조 구현(qrcode-terminal 0.12.0)의 출력을 같은 마스크로 고정해 맞춘 격자다. 1 은 검은 모듈.
 * 참조 구현은 글자를 charCodeAt 로 적으므로 ASCII 글자만 쓴다(한글은 UTF-8 로 따로 시험한다).
 * 마스크 선택 점수는 참조 구현과 다르다(참조는 인접 8칸 기준, 여기는 표준의 줄 연속 기준). 그래서 마스크를 고정해 비교한다.
 */
const REFERENCE: Array<{ text: string; level: QrLevel; mask: number; rows: string[] }> = [
  { text: 'https://example.com/#join=abc', level: 'M', mask: 6, rows: [
    '11111110110001110010001111111',
    '10000010101111110101101000001',
    '10111010110001100000001011101',
    '10111010001010110101101011101',
    '10111010110001010011001011101',
    '10000010010011100110101000001',
    '11111110101010101010101111111',
    '00000000011110100000100000000',
    '10011111101001111101010010111',
    '11101100111010100111110110110',
    '10001111100110100000010010100',
    '00100001001110110111101001001',
    '10101111000001100010101100001',
    '11001001000110000100101111111',
    '01001010101110110001100110101',
    '10010001000111101000001010101',
    '00110011010000010001100101000',
    '11010001101110000111100010110',
    '11110010010011101111001111001',
    '11101000110001011000010001100',
    '11011110100001000100111111110',
    '00000000110111001010100011000',
    '11111110110011011011101011000',
    '10000010100101001111100010011',
    '10111010100001011001111111000',
    '10111010111000101010000100010',
    '10111010001010101111010110111',
    '10000010010011110000010111101',
    '11111110110000000111111010000',
  ] },
  { text: 'HELLO', level: 'L', mask: 4, rows: [
    '111111101111101111111',
    '100000101010101000001',
    '101110101000001011101',
    '101110101111001011101',
    '101110100000101011101',
    '100000101101001000001',
    '111111101010101111111',
    '000000000111100000000',
    '110011100101000101111',
    '101001000101100101111',
    '000101101111001110010',
    '100000011000011010000',
    '111011110100111000110',
    '000000001000111001011',
    '111111100100110001010',
    '100000101101100100010',
    '101110101011001110101',
    '101110100111100001011',
    '101110100011001111000',
    '100000101110011000000',
    '111111101110111110101',
  ] },
]

const toRows = (matrix: boolean[][]) => matrix.map((row) => row.map((dark) => (dark ? '1' : '0')).join(''))

/** 형식 정보 15비트(복사본 1)를 읽어 마스크 XOR 을 푼 값 */
function formatWord(matrix: boolean[][]): number {
  const n = matrix.length
  const bitAt = (i: number) => {
    const [row, col] = i < 6 ? [i, 8] : i < 8 ? [i + 1, 8] : [n - 15 + i, 8]
    return matrix[row][col] ? 1 : 0
  }
  let word = 0
  for (let i = 0; i < 15; i++) word |= bitAt(i) << i
  return word ^ 0x5412
}

const bchRemainder = (value: number, generator: number): number => {
  const bits = (n: number) => 32 - Math.clz32(n)
  let rest = value
  while (bits(rest) >= bits(generator)) rest ^= generator << (bits(rest) - bits(generator))
  return rest
}

const LEVEL_BITS: Record<QrLevel, number> = { L: 0b01, M: 0b00, Q: 0b11, H: 0b10 }

const FINDER = ['1111111', '1000001', '1011101', '1011101', '1011101', '1000001', '1111111']

describe('QR 코드 인코더', () => {
  it.each(REFERENCE)('$text ($level) 는 참조 구현과 같은 격자를 만든다', ({ text, level, mask, rows }) => {
    expect(toRows(qrMatrix(text, level, mask))).toEqual(rows)
  })

  it('위치 탐지 패턴 세 개와 타이밍 패턴을 그린다', () => {
    const m = qrMatrix('https://game.example/?lang=ko#join=ABC', 'M')
    const n = m.length
    for (const [top, left] of [[0, 0], [0, n - 7], [n - 7, 0]]) {
      FINDER.forEach((line, r) => [...line].forEach((ch, c) => expect(m[top + r][left + c]).toBe(ch === '1')))
    }
    for (let i = 8; i < n - 8; i++) {
      expect(m[6][i]).toBe(i % 2 === 0)
      expect(m[i][6]).toBe(i % 2 === 0)
    }
    expect(m[n - 8][8]).toBe(true)
  })

  it.each(['L', 'M', 'Q', 'H'] as const)('형식 정보는 BCH 가 맞고 오류 정정 수준 %s 를 담는다', (level) => {
    const m = qrMatrix('형식 정보 시험 https://example.com', level)
    const word = formatWord(m)
    expect(bchRemainder(word, 0x537)).toBe(0)
    expect(word >> 13).toBe(LEVEL_BITS[level])
  })

  it('버전 7 이상은 버전 정보 18비트를 두 자리에 쓴다', () => {
    const m = qrMatrix('x'.repeat(300), 'M')
    const n = m.length
    const version = (n - 17) / 4
    expect(version).toBeGreaterThanOrEqual(7)
    let word = 0
    for (let i = 0; i < 18; i++) word |= (m[Math.floor(i / 3)][(i % 3) + n - 11] ? 1 : 0) << i
    expect(word).toBe((version << 12) | bchRemainder(version << 12, 0x1f25))
    for (let i = 0; i < 18; i++) expect(m[(i % 3) + n - 11][Math.floor(i / 3)]).toBe(m[Math.floor(i / 3)][(i % 3) + n - 11])
  })

  it('글자 길이에 맞춰 가장 작은 버전을 고르고, 담을 수 없으면 거절한다', () => {
    expect(qrMatrix('a', 'L').length).toBe(21)
    // 버전 40 · L 은 바이트 모드로 2953 바이트까지 담는다
    expect(qrMatrix('L'.repeat(2953), 'L').length).toBe(177)
    expect(() => qrMatrix('L'.repeat(2954), 'L')).toThrow(/너무 깁니다/)
  })

  it('한글은 UTF-8 바이트로 센다', () => {
    // 한글 세 글자는 9바이트다. 버전 1 · M 은 14바이트까지라 21칸이다.
    expect(qrMatrix('가나다', 'M').length).toBe(21)
    // 같은 글자 수라도 바이트가 많으면 버전이 올라간다
    expect(qrMatrix('가'.repeat(20), 'M').length).toBeGreaterThan(21)
  })
})
