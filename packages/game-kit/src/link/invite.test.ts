import { describe, expect, it } from 'vitest'
import { packCode, unpackCode } from './code'
import { buildInviteLink, codeFromPaste, hasPendingInvite, parseInviteFragment, pendingInvite, receiveInviteFragment, takePendingInvite, withoutFragment } from './invite'

/** 지금 형식(deflate-raw + base64url)으로 만든 응답 코드. 형식을 바꾸면 이 고정 글자가 깨져 알아챈다. */
const FIXED_CODE = 'q1YqqSxIVbJSSswrLk8tUtJRKk4pULJSKrM1iCmKyUu0zUxO1S1NK0pMtyo1VKoFAA'
const FIXED_TEXT = '{"type":"answer","sdp":"v=0\\r\\na=ice-ufrag:u1"}'

/** 테스트 사이에 대기열이 새지 않게 비운다 */
const clearPending = () => {
  takePendingInvite('join')
  takePendingInvite('answer')
}

describe('초대 링크 만들기 · 읽기', () => {
  it('앱 주소 뒤 조각에 코드를 싣고, 조각만 읽으면 같은 코드가 나온다', () => {
    const link = buildInviteLink('join', 'ABC-_09', 'https://example.com/?lang=ko#old')
    expect(link).toBe('https://example.com/?lang=ko#join=ABC-_09')
    expect(parseInviteFragment(link.slice(link.indexOf('#')))).toEqual({ join: 'ABC-_09' })
  })

  it('응답 링크는 answer 조각을 쓴다', () => {
    const link = buildInviteLink('answer', 'XYZ', 'https://game.example/')
    expect(link).toBe('https://game.example/#answer=XYZ')
    expect(parseInviteFragment('#answer=XYZ')).toEqual({ answer: 'XYZ' })
  })

  it('두 코드가 함께 있어도 나눠 읽고, 모르는 조각이나 빈 값은 무시한다', () => {
    expect(parseInviteFragment('#join=A&answer=B')).toEqual({ join: 'A', answer: 'B' })
    expect(parseInviteFragment('#foo=1')).toEqual({})
    expect(parseInviteFragment('#join=')).toEqual({})
    expect(parseInviteFragment('')).toEqual({})
  })

  it('주소에서 조각만 뗀다', () => {
    expect(withoutFragment('http://a.test/app/?x=1#join=ABC')).toBe('http://a.test/app/?x=1')
    expect(withoutFragment('http://a.test/app/')).toBe('http://a.test/app/')
  })

  it('초대 코드를 링크에 실어 보내면 받는 쪽이 같은 연결 정보를 푼다', async () => {
    const offer = JSON.stringify({ type: 'offer', sdp: 'v=0\r\n'.repeat(40) })
    const code = await packCode(offer)
    const link = buildInviteLink('join', code, 'https://example.com/')
    const received = parseInviteFragment(link.slice(link.indexOf('#'))).join
    expect(received).toBe(code)
    expect(await unpackCode(received!)).toBe(offer)
  })

  it('코드는 URL 에 그대로 들어가는 글자만 쓴다(base64url)', async () => {
    const code = await packCode(JSON.stringify({ type: 'offer', sdp: 'x'.repeat(600) }))
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(encodeURIComponent(code)).toBe(code)
  })
})

describe('입력칸에 붙인 링크에서 코드 꺼내기', () => {
  it('응답 칸은 응답 링크에서 코드를 꺼내고, 날 코드는 다듬어 그대로 쓴다', () => {
    expect(codeFromPaste('https://game.example/#answer=ABC123', 'answer')).toBe('ABC123')
    expect(codeFromPaste('  \nABC123\n  ', 'answer')).toBe('ABC123')
  })

  it('참가 칸은 초대 링크에서 코드를 꺼낸다', () => {
    expect(codeFromPaste('https://example.com/#join=OFFER_1-2', 'join')).toBe('OFFER_1-2')
  })

  it('링크로 감싸지 않은 옛 날 코드도 그대로 읽는다', async () => {
    expect(codeFromPaste(FIXED_CODE, 'answer')).toBe(FIXED_CODE)
    expect(codeFromPaste(`  ${FIXED_CODE}\n`, 'join')).toBe(FIXED_CODE)
    expect(await unpackCode(codeFromPaste(FIXED_CODE, 'answer'))).toBe(FIXED_TEXT)
  })

  it('링크를 붙여도 날 코드와 같은 결과가 나온다', async () => {
    const link = buildInviteLink('answer', FIXED_CODE, 'https://example.com/')
    expect(codeFromPaste(link, 'answer')).toBe(FIXED_CODE)
    expect(await unpackCode(codeFromPaste(link, 'answer'))).toBe(FIXED_TEXT)
  })
})

describe('앱 시작 때 조각 읽고 지우기', () => {
  it('#join= 을 읽고 주소에서 조각을 지운다(코드는 주소창에 남지 않는다)', () => {
    clearPending()
    const replaced: string[] = []
    receiveInviteFragment({ hash: '#join=OFFER', href: 'https://example.com/?lang=ko#join=OFFER' }, (url) => replaced.push(url))
    expect(replaced).toEqual(['https://example.com/?lang=ko'])
    expect(pendingInvite().join).toBe('OFFER')
    expect(hasPendingInvite()).toBe(true)
  })

  it('대기한 참가 코드는 한 번만 꺼내 쓴다', () => {
    clearPending()
    receiveInviteFragment({ hash: '#join=OFFER', href: 'http://h/#join=OFFER' }, () => {})
    expect(takePendingInvite('join')).toBe('OFFER')
    expect(takePendingInvite('join')).toBeUndefined()
    expect(hasPendingInvite()).toBe(false)
  })

  it('#answer= 도 같은 방식으로 읽고 지운다', () => {
    clearPending()
    const replaced: string[] = []
    receiveInviteFragment({ hash: '#answer=RESP', href: 'http://h/app/#answer=RESP' }, (url) => replaced.push(url))
    expect(replaced).toEqual(['http://h/app/'])
    expect(takePendingInvite('answer')).toBe('RESP')
    expect(takePendingInvite('join')).toBeUndefined()
  })

  it('조각이 없으면 주소를 건드리지 않는다', () => {
    clearPending()
    const replaced: string[] = []
    receiveInviteFragment({ hash: '', href: 'http://h/app/' }, (url) => replaced.push(url))
    expect(replaced).toEqual([])
    expect(hasPendingInvite()).toBe(false)
  })

  it('두 번째 호출은 이미 지운 주소라 대기열을 바꾸지 않는다', () => {
    clearPending()
    receiveInviteFragment({ hash: '#join=OFFER', href: 'http://h/#join=OFFER' }, () => {})
    receiveInviteFragment({ hash: '', href: 'http://h/' }, () => {})
    expect(takePendingInvite('join')).toBe('OFFER')
  })
})
