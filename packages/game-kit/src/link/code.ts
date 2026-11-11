/**
 * 연결 코드: SDP 를 줄여 복사 · 붙여넣기 한 줄로 만든다. 서버가 없으니 두 사람이 코드를 직접 건넨다.
 * 불필요한 줄(확장 헤더 · RTCP 피드백 · 미디어 식별)을 빼고 deflate 로 묶은 뒤 base64url 로 적는다.
 */

/** 데이터 채널만 쓰므로 필요 없는 SDP 줄을 뺀다(확장 헤더 · RTCP 피드백 · 스트림 식별) */
const DROPPED_SDP_LINES = /^a=(extmap|rtcp-fb|msid|ssrc|rtcp-rsize|rtcp-mux-only)/

export function minifySdp(sdp: string): string {
  return sdp
    .split(/\r?\n/)
    .filter((line) => line.length > 0 && !DROPPED_SDP_LINES.test(line))
    .join('\n')
}

/** 바이트를 base64url 문자열로 적는다(줄바꿈 · 기호 없이 복사하기 쉽게) */
function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(code: string): Uint8Array {
  const base64 = code.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(code.length / 4) * 4, '=')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const writer = stream.writable.getWriter()
  // 쓰기와 읽기를 함께 돌려야 긴 입력에서도 멈추지 않는다. 깨진 코드면 쓰기 쪽도 실패하는데, 실패는 읽기 쪽에서 알리므로 여기서는 삼킨다.
  void writer.write(bytes as Uint8Array<ArrayBuffer>).then(() => writer.close()).catch(() => undefined)
  return new Uint8Array(await new Response(stream.readable).arrayBuffer())
}

/** 글자를 압축해 연결 코드로 만든다 */
export async function packCode(text: string): Promise<string> {
  const packed = await pipe(new TextEncoder().encode(text), new CompressionStream('deflate-raw'))
  return toBase64Url(packed)
}

/** 연결 코드를 원래 글자로 되돌린다. 깨진 코드면 예외를 던진다. */
export async function unpackCode(code: string): Promise<string> {
  const bytes = fromBase64Url(code.trim())
  const plain = await pipe(bytes, new DecompressionStream('deflate-raw'))
  return new TextDecoder().decode(plain)
}
