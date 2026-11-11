/**
 * 초대 링크: 연결 코드를 앱 주소의 URL 조각(#join= · #answer=)에 실어 건넨다.
 * 조각은 서버로 보내지 않으므로 코드가 어디에도 남지 않는다. 서버가 없는 방이라 링크도 사람이 직접 건넨다.
 * 코드는 base64url 이라 조각에 그대로 들어간다.
 */

export type InviteKind = 'join' | 'answer'

export interface InviteFragment {
  /** 방장의 초대 코드(게스트 화면이 열린다) */
  join?: string
  /** 게스트의 응답 코드(방장 화면이 채운다) */
  answer?: string
}

/** 앱 주소(조각 제외)에 코드를 실은 링크. base 는 지금 주소(location.href)다. */
export function buildInviteLink(kind: InviteKind, code: string, base: string): string {
  return `${withoutFragment(base)}#${kind}=${code}`
}

/** 주소에서 조각(#…)을 뗀다. */
export function withoutFragment(url: string): string {
  const hash = url.indexOf('#')
  return hash === -1 ? url : url.slice(0, hash)
}

/** 조각(#join=…&answer=…)에서 코드를 읽는다. 모르는 조각이나 빈 값은 무시한다. */
export function parseInviteFragment(hash: string): InviteFragment {
  const found: InviteFragment = {}
  for (const part of hash.replace(/^#/, '').split('&')) {
    const eq = part.indexOf('=')
    if (eq <= 0) continue
    const key = part.slice(0, eq)
    const value = part.slice(eq + 1).trim()
    if (!value) continue
    if (key === 'join') found.join = value
    else if (key === 'answer') found.answer = value
  }
  return found
}

/**
 * 입력칸에 붙인 글자에서 코드를 꺼낸다. 코드 그대로면 다듬어 돌려주고, 링크면 그 종류의 조각 코드를 쓴다.
 * 예: 'https://host/#answer=abc' 를 answer 칸에 붙이면 'abc'.
 */
export function codeFromPaste(text: string, kind: InviteKind): string {
  const trimmed = text.trim()
  const hash = trimmed.indexOf('#')
  if (hash === -1) return trimmed
  return parseInviteFragment(trimmed.slice(hash))[kind] ?? trimmed
}

let pending: InviteFragment = {}

/**
 * 앱이 열릴 때 한 번 URL 조각을 읽어 대기열에 넣고, 주소창에서는 지운다(코드가 주소에 남지 않게).
 * 주소 조각이 없으면 아무 일도 없다. 여러 번 불러도 같은 결과다(두 번째는 이미 지운 주소라 빈 조각이다).
 */
export function receiveInviteFragment(
  loc: { hash: string; href: string } = window.location,
  replace: (url: string) => void = (url) => window.history.replaceState(null, '', url),
): void {
  const found = parseInviteFragment(loc.hash)
  if (found.join === undefined && found.answer === undefined) return
  pending = { ...pending, ...found }
  replace(withoutFragment(loc.href))
}

/** 아직 쓰지 않은 초대 코드(없으면 빈 객체). 읽기만 하고 지우지 않는다. */
export function pendingInvite(): InviteFragment {
  return pending
}

/** 대기 중인 초대 코드가 있는지(방 창을 바로 열지 정한다) */
export const hasPendingInvite = (): boolean => pending.join !== undefined || pending.answer !== undefined

/** 대기 중인 코드 한 개를 꺼내 쓴다(한 번만 쓰인다). */
export function takePendingInvite(kind: InviteKind): string | undefined {
  const code = pending[kind]
  pending = { ...pending, [kind]: undefined }
  return code
}

/**
 * 링크를 건넨다: 기기가 공유 창을 지원하면 그것을 쓰고, 아니면 클립보드에 복사한다.
 * 공유 창에서 사용자가 닫으면 cancelled 를 돌려준다.
 */
export async function shareInviteLink(url: string, title: string): Promise<'shared' | 'copied' | 'cancelled' | 'failed'> {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, url })
      return 'shared'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    return 'failed'
  }
}

/** 공유 창을 지원하는 기기인지(단추 글자를 고를 때 쓴다) */
export const canShareInvite = (): boolean => typeof navigator !== 'undefined' && typeof navigator.share === 'function'
