import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { packCode, unpackCode } from './link'
import { DEFAULT_RTC_MESSAGES, IceError, NetError, STUN_SERVERS, answerInvite, createHostInvite } from './rtc'

/** 테스트 안에서 만들어진 가짜 연결(방장 · 게스트 순서). 테스트마다 비운다. */
let made: FakePC[] = []
let seq = 0
/** 보낸 글과 쓴 채널 이름. 신뢰 · 빠른 채널 구분을 시험한다. */
let sentLog: { label: string; text: string }[] = []

type Listener = () => void

class FakeChannel {
  readyState: 'connecting' | 'open' | 'closed' = 'connecting'
  onmessage: ((event: { data: unknown }) => void) | null = null
  onclose: (() => void) | null = null
  peer: FakeChannel | null = null
  readonly label: string
  private listeners: Record<string, Listener[]> = {}

  constructor(label: string) {
    this.label = label
  }

  addEventListener(type: string, fn: Listener): void {
    ;(this.listeners[type] ??= []).push(fn)
  }

  send(text: string): void {
    const peer = this.peer
    if (this.readyState !== 'open' || !peer) return
    sentLog.push({ label: this.label, text })
    queueMicrotask(() => peer.onmessage?.({ data: text }))
  }

  /** 두 쪽을 함께 연다(실제 채널처럼 열림 알림도 양쪽에 간다) */
  open(): void {
    for (const channel of [this, this.peer]) if (channel) channel.readyState = 'open'
    queueMicrotask(() => {
      for (const channel of [this, this.peer]) channel?.emit('open')
    })
  }

  /** 닫으면 짝도 닫힌다(데이터 채널의 동작) */
  close(): void {
    this.end()
    this.peer?.end()
  }

  private end(): void {
    if (this.readyState === 'closed') return
    this.readyState = 'closed'
    queueMicrotask(() => {
      this.onclose?.()
      this.emit('close')
    })
  }

  private emit(type: string): void {
    for (const fn of this.listeners[type] ?? []) fn()
  }
}

const sdpText = (id: string) => `v=0\r\na=ice-ufrag:${id}\r\na=extmap:1 urn:ietf:params:rtp-hdrext:x\r\nm=application 9\r\n`

/** RTCPeerConnection 대역. 원격 설명의 ice-ufrag 로 짝 연결을 찾아 채널을 잇는다. */
class FakePC {
  readonly id: string
  readonly config: RTCConfiguration
  iceGatheringState: RTCIceGatheringState = 'complete'
  iceConnectionState: RTCIceConnectionState = 'new'
  connectionState: RTCPeerConnectionState = 'new'
  localDescription: RTCSessionDescription | null = null
  closed = false
  channels: FakeChannel[] = []
  ondatachannel: ((event: { channel: RTCDataChannel }) => void) | null = null
  onconnectionstatechange: (() => void) | null = null
  private listeners: Record<string, Listener[]> = {}

  constructor(config: RTCConfiguration) {
    this.config = config
    this.id = `ufrag${++seq}`
    made.push(this)
  }

  addEventListener(type: string, fn: Listener): void {
    ;(this.listeners[type] ??= []).push(fn)
  }

  removeEventListener(type: string, fn: Listener): void {
    this.listeners[type] = (this.listeners[type] ?? []).filter((f) => f !== fn)
  }

  hasListener(type: string): boolean {
    return (this.listeners[type] ?? []).length > 0
  }

  /** 테스트가 상태 변화를 흉내 낸다 */
  emit(type: string): void {
    for (const fn of [...(this.listeners[type] ?? [])]) fn()
  }

  createDataChannel(label: string): RTCDataChannel {
    const channel = new FakeChannel(label)
    this.channels.push(channel)
    return channel as unknown as RTCDataChannel
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    return { type: 'offer', sdp: sdpText(this.id) }
  }

  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    return { type: 'answer', sdp: sdpText(this.id) }
  }

  async setLocalDescription(description: RTCSessionDescriptionInit): Promise<void> {
    this.localDescription = { type: description.type, sdp: description.sdp ?? '' } as RTCSessionDescription
  }

  async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    const id = /ice-ufrag:(\S+)/.exec(description.sdp ?? '')?.[1]
    const other = made.find((pc) => pc.id === id)
    if (!other) return
    if (description.type === 'offer') {
      // 게스트: 방장이 만든 채널 이름마다 짝 채널을 받는다
      for (const remote of other.channels) {
        const local = new FakeChannel(remote.label)
        local.peer = remote
        remote.peer = local
        this.channels.push(local)
        this.ondatachannel?.({ channel: local as unknown as RTCDataChannel })
      }
    } else {
      // 방장: 응답을 받으면 채널이 열린다
      this.connectionState = 'connected'
      other.connectionState = 'connected'
      for (const channel of this.channels) channel.open()
    }
  }

  close(): void {
    this.closed = true
  }
}

const flush = () => new Promise<void>((resolve) => setImmediate(resolve))

/** 방장과 게스트를 실제 교환 절차(초대 → 응답 → accept)로 잇는다 */
async function connectPair() {
  const host = await createHostInvite()
  const guest = await answerInvite(host.offerCode)
  const hostLink = await host.accept(guest.answerCode)
  const guestLink = await guest.link
  return { host, hostLink, guestLink }
}

beforeEach(() => {
  made = []
  sentLog = []
  vi.stubGlobal('RTCPeerConnection', FakePC)
  // 시간 제한만 가짜로 돌린다. 코드 압축(CompressionStream)은 실제 타이머로 돈다.
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('초대 코드 만들기', () => {
  it('초대 코드는 SDP 의 확장 줄을 뺀 한 줄짜리 base64url 이다', async () => {
    const host = await createHostInvite()
    expect(host.offerCode).toMatch(/^[A-Za-z0-9_-]+$/)
    const offer = JSON.parse(await unpackCode(host.offerCode)) as { type: string; sdp: string }
    expect(offer.type).toBe('offer')
    expect(offer.sdp).not.toContain('extmap')
    expect(offer.sdp).toContain('ice-ufrag')
  })

  it('ICE 서버는 옵션 목록을 쓰고, 옵션이 없으면 STUN 기본 목록을 쓴다', async () => {
    const relay = [{ urls: 'turn:relay.test:3478', username: 'u', credential: 'p' }]
    await createHostInvite({ iceServers: async () => relay })
    expect(made[0].config.iceServers).toEqual(relay)
    await createHostInvite()
    expect(made[1].config.iceServers).toEqual(STUN_SERVERS)
  })
})

describe('응답 · 연결', () => {
  it('응답을 받으면 양쪽이 열리고, 신뢰 · 빠른 채널로 글을 보낸다', async () => {
    const { hostLink, guestLink } = await connectPair()
    expect(hostLink.open && guestLink.open).toBe(true)

    hostLink.send('판 정보', true)
    hostLink.send('위치', false)
    await flush()
    expect(sentLog).toEqual([
      { label: 'ctl', text: '판 정보' },
      { label: 'state', text: '위치' },
    ])
  })

  it('핸들러를 달기 전에 온 글은 달 때 순서대로 한꺼번에 넘긴다', async () => {
    const { hostLink, guestLink } = await connectPair()
    hostLink.send('첫째', true)
    hostLink.send('둘째', true)
    await flush()
    const received: string[] = []
    guestLink.onMessage = (text) => received.push(text)
    expect(received).toEqual(['첫째', '둘째'])
  })

  it('문구 옵션이 없으면 기본 문구를, 있으면 그 항목만 바꾼 문구를 쓴다', async () => {
    const host = await createHostInvite()
    await expect(host.accept(host.offerCode)).rejects.toThrow(DEFAULT_RTC_MESSAGES.notAnswer)

    const custom = await createHostInvite({ messages: { notAnswer: '응답 코드가 아닙니다.' } })
    await expect(custom.accept(custom.offerCode)).rejects.toThrow('응답 코드가 아닙니다.')
    await expect(custom.accept('zz')).rejects.toThrow(DEFAULT_RTC_MESSAGES.unreadable)
  })

  it('연결이 제때 열리지 않으면 시간 초과 문구에 연결 안내를 붙인다', async () => {
    const host = await createHostInvite()
    // 짝이 없는 응답이라 채널이 열리지 않는다
    const dead = await packCode(JSON.stringify({ type: 'answer', sdp: 'v=0\r\na=ice-ufrag:nobody\r\n' }))
    const failed = host.accept(dead).catch((error: unknown) => error)
    await vi.waitFor(() => expect(made[0].hasListener('iceconnectionstatechange')).toBe(true))
    await vi.advanceTimersByTimeAsync(25000)
    const error = await failed
    expect(error).toBeInstanceOf(NetError)
    expect((error as Error).message).toBe(`연결 시간이 초과됐어요. ${DEFAULT_RTC_MESSAGES.connectHint}`)
  })

  it('경로를 못 찾으면 IceError 로 알리고 안내 문구는 옵션을 따른다', async () => {
    const host = await createHostInvite({ messages: { iceHint: '사설망이라 TURN 이 필요합니다' } })
    const dead = await packCode(JSON.stringify({ type: 'answer', sdp: 'v=0\r\na=ice-ufrag:nobody\r\n' }))
    const failed = host.accept(dead).catch((error: unknown) => error)
    await vi.waitFor(() => expect(made[0].hasListener('iceconnectionstatechange')).toBe(true))
    made[0].iceConnectionState = 'failed'
    made[0].emit('iceconnectionstatechange')
    const error = await failed
    expect(error).toBeInstanceOf(IceError)
    expect((error as Error).message).toBe('연결 경로를 찾지 못했습니다. 사설망이라 TURN 이 필요합니다.')
  })
})

describe('끊김 알림', () => {
  it('내가 닫으면 상대에게 끊김을 알리고, 나에게는 알리지 않는다', async () => {
    const { hostLink, guestLink } = await connectPair()
    const hostGone = vi.fn()
    const guestGone = vi.fn()
    hostLink.onClose = hostGone
    guestLink.onClose = guestGone
    hostLink.close()
    await flush()
    expect(guestGone).toHaveBeenCalledTimes(1)
    expect(hostGone).not.toHaveBeenCalled()
  })

  it('이미 끊긴 뒤에 onClose 를 달아도 한 번 바로 알린다', async () => {
    const { hostLink, guestLink } = await connectPair()
    hostLink.close()
    await flush()
    const late = vi.fn()
    guestLink.onClose = late
    expect(late).toHaveBeenCalledTimes(1)
  })

  it('닫을 때 마지막 글이 나갈 시간을 두고 연결을 닫는다', async () => {
    const { hostLink } = await connectPair()
    hostLink.close()
    expect(made[0].closed).toBe(false)
    await vi.advanceTimersByTimeAsync(300)
    expect(made[0].closed).toBe(true)
  })

  it('연결이 잠깐 끊겼다 돌아오면 끊김으로 보지 않고, 6초 넘게 이어지면 끊김으로 본다', async () => {
    const { hostLink } = await connectPair()
    const gone = vi.fn()
    hostLink.onClose = gone

    made[0].connectionState = 'disconnected'
    made[0].onconnectionstatechange?.()
    await vi.advanceTimersByTimeAsync(5999)
    expect(gone).not.toHaveBeenCalled()

    made[0].connectionState = 'connected'
    made[0].onconnectionstatechange?.()
    await vi.advanceTimersByTimeAsync(10000)
    expect(gone).not.toHaveBeenCalled()

    made[0].connectionState = 'disconnected'
    made[0].onconnectionstatechange?.()
    await vi.advanceTimersByTimeAsync(6000)
    expect(gone).toHaveBeenCalledTimes(1)
  })

  it('게스트도 초대 코드가 아니면 문구로 알린다', async () => {
    await expect(answerInvite('zz')).rejects.toThrow(DEFAULT_RTC_MESSAGES.unreadable)
    const host = await createHostInvite()
    const guest = await answerInvite(host.offerCode)
    await expect(answerInvite(guest.answerCode)).rejects.toThrow(DEFAULT_RTC_MESSAGES.notOffer)
  })
})
