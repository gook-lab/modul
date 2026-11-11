import { describe, expect, it } from 'vitest'
import { hashString, mulberry32 } from './rng'

describe('mulberry32', () => {
  it('같은 시드는 같은 수열을 낸다', () => {
    const a = mulberry32(1)
    const b = mulberry32(1)
    for (let i = 0; i < 50; i++) expect(a()).toBe(b())
  })

  it('고정 시드의 첫 값은 바꾸지 않는다(저장된 씨앗 결과가 이 수열에 기댄다)', () => {
    const next = mulberry32(1)
    expect([next(), next(), next()]).toEqual([0.6270739405881613, 0.002735721180215478, 0.5274470399599522])
  })

  it('값은 0 이상 1 미만이다', () => {
    const next = mulberry32(42)
    for (let i = 0; i < 1000; i++) {
      const v = next()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('hashString', () => {
  it('FNV-1a 표준 값과 맞는다', () => {
    expect(hashString('')).toBe(2166136261)
    expect(hashString('a')).toBe(0xe40c292c)
    expect(hashString('foobar')).toBe(0xbf9cf968)
  })

  it('날짜 키 해시는 저장된 결과와 같다', () => {
    expect(hashString('visit:2026-11-11')).toBe(1145853570)
  })

  it('결과는 부호 없는 32비트 정수다', () => {
    for (const text of ['한글', '😀', 'x'.repeat(500)]) {
      const h = hashString(text)
      expect(Number.isInteger(h)).toBe(true)
      expect(h).toBeGreaterThanOrEqual(0)
      expect(h).toBeLessThan(2 ** 32)
    }
  })
})
