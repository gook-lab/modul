import { describe, expect, it } from 'vitest'
import { josa, particle } from './josa'

it('받침에 맞춰 조사를 붙인다', () => {
  expect(josa('꼬마 도깨비', '이/가')).toBe('꼬마 도깨비가')
  expect(josa('저승사자', '은/는')).toBe('저승사자는')
  expect(josa('천마', '을/를')).toBe('천마를')
  expect(josa('백호의 눈', '이/가')).toBe('백호의 눈이')
  expect(josa('혼돈', '은/는')).toBe('혼돈은')
})

describe('으로/로', () => {
  it('받침 없음 · ㄹ 받침은 로, 그 밖은 으로', () => {
    expect(josa('도깨비 마을', '으로/로')).toBe('도깨비 마을로')
    expect(josa('청운성', '으로/로')).toBe('청운성으로')
    expect(josa('혈월채', '으로/로')).toBe('혈월채로')
  })

  it('숫자는 읽는 소리로 — 2를 · 3을 · 10을 · 100을 · 1,000을 · 20으로', () => {
    expect(josa('2', '을/를')).toBe('2를')
    expect(josa('3', '을/를')).toBe('3을')
    expect(josa('10', '을/를')).toBe('10을')
    expect(josa('100', '을/를')).toBe('100을')
    expect(josa('1,000', '을/를')).toBe('1,000을')
    expect(josa('20', '으로/로')).toBe('20으로')
    expect(josa('7', '으로/로')).toBe('7로')
    expect(particle('뇌공검', '을/를')).toBe('을')
  })

  it('영문 · % 는 읽는 소리로 — Q를 · R을 · M으로 · L로 · 15%를', () => {
    expect(josa('Q', '을/를')).toBe('Q를')
    expect(josa('R', '을/를')).toBe('R을')
    expect(josa('M', '으로/로')).toBe('M으로')
    expect(josa('L', '으로/로')).toBe('L로')
    expect(josa('15%', '을/를')).toBe('15%를')
    expect(josa('HP', '이/가')).toBe('HP가')
  })
})
