/**
 * WebRTC 데이터 채널로 만드는 통신로. 서버가 없으므로 방장이 초대 코드(offer)를 만들어 건네고,
 * 게스트가 응답 코드(answer)를 돌려주면 연결된다. ICE 후보를 다 모은 뒤의 SDP 를 통째로 주고받는다.
 * ICE 서버 목록과 사용자에게 보이는 문구는 호출하는 쪽이 정한다. 기본은 STUN 목록과 DEFAULT_RTC_MESSAGES 다.
 */

import { minifySdp, packCode, unpackCode } from './link'

export const STUN_SERVERS: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }]
/** 후보 수집을 이 시간(ms)까지만 기다린다. 넘으면 모은 것만으로 코드를 만든다 */
const GATHER_TIMEOUT_MS = 4000
/** 응답을 받은 뒤 채널이 열리기까지 기다리는 시간(ms) */
const CONNECT_TIMEOUT_MS = 25000
/** 연결 중 'disconnected' 가 이 시간(ms) 넘게 이어지면 끊긴 것으로 본다 */
const DISCONNECT_GRACE_MS = 6000
/** 닫기 전에 마지막 글이 나갈 시간(ms). 바로 닫으면 방이 닫혔다는 알림이 상대에게 가지 못한다 */
const CLOSE_FLUSH_MS = 300

/** 사용자에게 보이는 문구. {hint} 자리는 항목별 안내 문구(connectHint · iceHint)로 채운다. */
export interface RtcMessages {
  /** 코드를 풀지 못했을 때 */
  unreadable: string
  /** 초대 코드 자리에 다른 코드가 왔을 때 */
  notOffer: string
  /** 응답 코드 자리에 다른 코드가 왔을 때 */
  notAnswer: string
  /** 채널이 제때 열리지 않았을 때. {hint} 는 connectHint */
  timeout: string
  /** 열린 뒤 연결이 끊겼을 때. {hint} 는 connectHint */
  dropped: string
  /** 경로(ICE)를 찾지 못했을 때. {hint} 는 iceHint */
  iceFailed: string
  /** 연결 실패 때 붙이는 안내 */
  connectHint: string
  /** 경로 실패 때 붙이는 안내 */
  iceHint: string
}

/** 문구 기본값(해요체). 옵션 messages 에서 빠진 항목만 이 값을 쓴다. */
export const DEFAULT_RTC_MESSAGES: RtcMessages = {
  unreadable: '코드를 읽지 못했어요. 복사한 코드가 잘렸는지 확인해 주세요.',
  notOffer: '초대 코드가 아니에요.',
  notAnswer: '응답 코드가 아니에요.',
  timeout: '연결 시간이 초과됐어요. {hint}',
  dropped: '연결이 끊겼어요. {hint}',
  iceFailed: '연결 경로를 찾지 못했습니다. {hint}.',
  connectHint: '네트워크 사이 중계를 받지 못했을 수 있습니다. 코드를 다시 만들어 보거나 같은 와이파이에서 시도해 보세요.',
  iceHint: '다른 네트워크라면 TURN 서버가 필요합니다',
}

export interface RtcOptions {
  /** ICE 서버 목록. 연결을 만들 때마다 불러 TURN 같은 사용자 설정을 반영한다. 없으면 STUN_SERVERS. */
  iceServers?: () => Promise<RTCIceServer[]>
  /** 문구 가운데 바꿀 항목만 적는다 */
  messages?: Partial<RtcMessages>
}

/** 통신로의 모양. 소비 레포의 Link 타입이 이 구조를 그대로 만족한다. */
export interface Link {
  readonly open: boolean
  /** reliable 이 false 면 늦거나 빠져도 되는 글(위치 등)이다 */
  send(text: string, reliable?: boolean): void
  onMessage: ((text: string) => void) | null
  /** 상대가 끊었거나 연결이 깨졌을 때 한 번(내가 close 한 경우는 부르지 않는다) */
  onClose: (() => void) | null
  close(): void
}

/** 사용자에게 한 줄로 보여 줄 오류(코드 오류 · 연결 실패). 메시지를 그대로 띄운다. */
export class NetError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NetError'
  }
}

/** 연결 경로(ICE)를 찾지 못한 오류. 화면이 다시 시도 · TURN 안내를 띄우는 데 쓴다. */
export class IceError extends NetError {
  constructor(message: string = fillHint(DEFAULT_RTC_MESSAGES.iceFailed, DEFAULT_RTC_MESSAGES.iceHint)) {
    super(message)
    this.name = 'IceError'
  }
}

/** 방장이 만든 초대. 코드를 건네고, 게스트의 응답 코드를 받으면 accept 로 연결을 마친다. */
export interface HostInvite {
  offerCode: string
  accept(answerCode: string): Promise<Link>
  cancel(): void
}

/** 게스트가 초대 코드를 받아 만든 응답. 응답 코드를 건네면 방장이 연결을 마치고, link 가 풀릴 때 게스트 쪽도 열린다. */
export interface GuestAnswer {
  answerCode: string
  link: Promise<Link>
  cancel(): void
}

/**
 * 데이터 채널 두 개(신뢰 · 빠름)로 만든 통신로. 채널이 생기면 바로 만든다.
 * 핸들러를 달기 전에 온 글은 쌓아 두었다가 달 때 한꺼번에 넘긴다(상대가 먼저 인사해도 놓치지 않게).
 * 끊김은 한 번만 알리며, 끊긴 뒤에 onClose 를 달아도 바로 한 번 알린다.
 */
export class RtcLink implements Link {
  private messageHandler: ((text: string) => void) | null = null
  private closeHandler: (() => void) | null = null
  private backlog: string[] = []
  private closed = false
  private gone = false
  private readonly pc: RTCPeerConnection
  private readonly reliable: RTCDataChannel
  private readonly unreliable: RTCDataChannel

  constructor(pc: RTCPeerConnection, reliable: RTCDataChannel, unreliable: RTCDataChannel) {
    this.pc = pc
    this.reliable = reliable
    this.unreliable = unreliable
    for (const channel of [reliable, unreliable]) {
      channel.onmessage = (event) => {
        if (typeof event.data === 'string') this.receive(event.data)
      }
    }
    // 'disconnected' 는 와이파이 전환 · 잠깐의 손실에도 뜨고 스스로 돌아오는 일이 많아, 잠시 기다린 뒤에만 끊는다.
    let grace: ReturnType<typeof setTimeout> | undefined
    pc.onconnectionstatechange = () => {
      clearTimeout(grace)
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') this.dropped()
      else if (pc.connectionState === 'disconnected') grace = setTimeout(() => this.dropped(), DISCONNECT_GRACE_MS)
    }
    reliable.onclose = () => this.dropped()
  }

  get open(): boolean {
    return !this.closed && this.reliable.readyState === 'open'
  }

  get onMessage(): ((text: string) => void) | null {
    return this.messageHandler
  }

  set onMessage(handler: ((text: string) => void) | null) {
    this.messageHandler = handler
    if (handler) for (const text of this.backlog.splice(0)) handler(text)
  }

  get onClose(): (() => void) | null {
    return this.closeHandler
  }

  set onClose(handler: (() => void) | null) {
    this.closeHandler = handler
    if (handler && this.gone) handler()
  }

  send(text: string, reliable = true): void {
    const channel = reliable ? this.reliable : this.unreliable
    if (channel.readyState === 'open') channel.send(text)
  }

  close(): void {
    if (this.closed) return
    this.closed = true
    this.pc.onconnectionstatechange = null
    this.reliable.close()
    this.unreliable.close()
    setTimeout(() => this.pc.close(), CLOSE_FLUSH_MS)
  }

  private receive(text: string): void {
    if (this.messageHandler) this.messageHandler(text)
    else this.backlog.push(text)
  }

  private dropped(): void {
    if (this.closed) return
    this.closed = true
    this.pc.close()
    this.remoteGone()
  }

  private remoteGone(): void {
    if (this.gone) return
    this.gone = true
    this.closeHandler?.()
  }
}

/** {hint} 자리를 안내 문구로 채운다 */
function fillHint(template: string, hint: string): string {
  return template.replace('{hint}', hint)
}

async function iceServersOf(options: RtcOptions): Promise<RTCIceServer[]> {
  return options.iceServers ? options.iceServers() : STUN_SERVERS
}

function resolveMessages(messages: Partial<RtcMessages> | undefined): RtcMessages {
  return { ...DEFAULT_RTC_MESSAGES, ...messages }
}

function waitForCandidates(pc: RTCPeerConnection): Promise<void> {
  if (pc.iceGatheringState === 'complete') return Promise.resolve()
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer)
      pc.removeEventListener('icegatheringstatechange', check)
      resolve()
    }
    const check = () => {
      if (pc.iceGatheringState === 'complete') done()
    }
    const timer = setTimeout(done, GATHER_TIMEOUT_MS)
    pc.addEventListener('icegatheringstatechange', check)
  })
}

/** 코드 안의 SDP 줄바꿈을 원래 형식(CRLF)으로 되돌린다 */
function restoreSdp(sdp: string): string {
  return sdp.split('\n').map((line) => line.trimEnd()).join('\r\n') + '\r\n'
}

async function readDescription(code: string, type: RTCSdpType, messages: RtcMessages): Promise<RTCSessionDescriptionInit> {
  let parsed: { type?: string; sdp?: string }
  try {
    parsed = JSON.parse(await unpackCode(code))
  } catch {
    throw new NetError(messages.unreadable)
  }
  if (parsed.type !== type || typeof parsed.sdp !== 'string') throw new NetError(type === 'offer' ? messages.notOffer : messages.notAnswer)
  return { type, sdp: restoreSdp(parsed.sdp) }
}

function encodeDescription(description: RTCSessionDescription): Promise<string> {
  return packCode(JSON.stringify({ type: description.type, sdp: minifySdp(description.sdp ?? '') }))
}

/**
 * 데이터 채널 두 개가 모두 열릴 때까지 기다려 통신로를 돌려준다.
 * 시간이 넘거나 경로를 못 찾거나 열리기 전에 닫히면 오류로 끝낸다. 열린 뒤의 끊김은 RtcLink 가 알린다.
 */
function openLink(pc: RTCPeerConnection, reliable: RTCDataChannel, unreliable: RTCDataChannel, messages: RtcMessages): Promise<RtcLink> {
  const link = new RtcLink(pc, reliable, unreliable)
  return new Promise((resolve, reject) => {
    let settled = false
    const fail = (error: Error) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      link.close()
      reject(error)
    }
    const timer = setTimeout(() => fail(new NetError(fillHint(messages.timeout, messages.connectHint))), CONNECT_TIMEOUT_MS)
    const check = () => {
      if (settled || reliable.readyState !== 'open' || unreliable.readyState !== 'open') return
      settled = true
      clearTimeout(timer)
      resolve(link)
    }
    pc.addEventListener('iceconnectionstatechange', () => {
      if (pc.iceConnectionState === 'failed') fail(new IceError(fillHint(messages.iceFailed, messages.iceHint)))
    })
    for (const channel of [reliable, unreliable]) {
      channel.addEventListener('open', check)
      channel.addEventListener('close', () => {
        // 경로를 못 찾아 닫힌 것이면 '끊김' 이 아니라 경로 오류로 알린다
        const iceFailed = pc.iceConnectionState === 'failed' || pc.connectionState === 'failed'
        fail(iceFailed ? new IceError(fillHint(messages.iceFailed, messages.iceHint)) : new NetError(fillHint(messages.dropped, messages.connectHint)))
      })
    }
    check()
  })
}

/** 방장: 초대 코드를 만든다(후보 수집이 끝난 뒤의 SDP 를 코드로 적는다). 게스트 한 명당 하나씩 만든다. */
export async function createHostInvite(options: RtcOptions = {}): Promise<HostInvite> {
  const messages = resolveMessages(options.messages)
  const pc = new RTCPeerConnection({ iceServers: await iceServersOf(options) })
  const reliable = pc.createDataChannel('ctl', { ordered: true })
  const unreliable = pc.createDataChannel('state', { ordered: false, maxRetransmits: 0 })
  await pc.setLocalDescription(await pc.createOffer())
  await waitForCandidates(pc)
  const offerCode = await encodeDescription(pc.localDescription!)
  return {
    offerCode,
    async accept(answerCode) {
      await pc.setRemoteDescription(await readDescription(answerCode, 'answer', messages))
      return openLink(pc, reliable, unreliable, messages)
    },
    cancel() {
      pc.close()
    },
  }
}

/** 게스트: 초대 코드를 받아 응답 코드를 만든다. 방장이 응답을 받으면 채널이 열려 link 가 풀린다. */
export async function answerInvite(offerCode: string, options: RtcOptions = {}): Promise<GuestAnswer> {
  const messages = resolveMessages(options.messages)
  const pc = new RTCPeerConnection({ iceServers: await iceServersOf(options) })
  const channels = new Promise<[RTCDataChannel, RTCDataChannel]>((resolve) => {
    const pair: Partial<Record<string, RTCDataChannel>> = {}
    pc.ondatachannel = (event) => {
      pair[event.channel.label] = event.channel
      if (pair.ctl && pair.state) resolve([pair.ctl, pair.state])
    }
  })
  await pc.setRemoteDescription(await readDescription(offerCode, 'offer', messages))
  await pc.setLocalDescription(await pc.createAnswer())
  await waitForCandidates(pc)
  const answerCode = await encodeDescription(pc.localDescription!)
  const link = channels.then(([reliable, unreliable]) => openLink(pc, reliable, unreliable, messages))
  return { answerCode, link, cancel: () => pc.close() }
}
