/**
 * QR 코드 인코더: 바이트 모드 · 버전 1~40 · 오류 정정 L·M·Q·H.
 * 초대 링크를 화면에 QR 로 띄우려고 외부 라이브러리 없이 직접 만들었다.
 * 블록 구성과 맞춤 패턴 위치는 ISO/IEC 18004 표를 따른다. 시험은 참조 구현 출력과 맞춰 본다(qrCode.test.ts).
 */

export type QrLevel = 'L' | 'M' | 'Q' | 'H'

/** 오류 정정 수준의 형식 정보 2비트 (L=01 · M=00 · Q=11 · H=10) */
const LEVEL_FORMAT_BITS: Record<QrLevel, number> = { L: 0b01, M: 0b00, Q: 0b11, H: 0b10 }
const LEVEL_INDEX: Record<QrLevel, number> = { L: 0, M: 1, Q: 2, H: 3 }

const FORMAT_GENERATOR = 0x537
const FORMAT_XOR = 0x5412
const VERSION_GENERATOR = 0x1f25

const MAX_VERSION = 40

/**
 * 버전(1~40) × 오류 정정(L·M·Q·H) 의 블록 구성. 각 항목은 [블록 수, 블록당 코드어 수, 블록당 데이터 코드어 수] 묶음이다.
 */
const BLOCK_SPECS: ReadonlyArray<ReadonlyArray<ReadonlyArray<readonly [number, number, number]>>> = [
  // 1: L · M · Q · H
  [[[1, 26, 19]], [[1, 26, 16]], [[1, 26, 13]], [[1, 26, 9]]],
  // 2: L · M · Q · H
  [[[1, 44, 34]], [[1, 44, 28]], [[1, 44, 22]], [[1, 44, 16]]],
  // 3: L · M · Q · H
  [[[1, 70, 55]], [[1, 70, 44]], [[2, 35, 17]], [[2, 35, 13]]],
  // 4: L · M · Q · H
  [[[1, 100, 80]], [[2, 50, 32]], [[2, 50, 24]], [[4, 25, 9]]],
  // 5: L · M · Q · H
  [[[1, 134, 108]], [[2, 67, 43]], [[2, 33, 15], [2, 34, 16]], [[2, 33, 11], [2, 34, 12]]],
  // 6: L · M · Q · H
  [[[2, 86, 68]], [[4, 43, 27]], [[4, 43, 19]], [[4, 43, 15]]],
  // 7: L · M · Q · H
  [[[2, 98, 78]], [[4, 49, 31]], [[2, 32, 14], [4, 33, 15]], [[4, 39, 13], [1, 40, 14]]],
  // 8: L · M · Q · H
  [[[2, 121, 97]], [[2, 60, 38], [2, 61, 39]], [[4, 40, 18], [2, 41, 19]], [[4, 40, 14], [2, 41, 15]]],
  // 9: L · M · Q · H
  [[[2, 146, 116]], [[3, 58, 36], [2, 59, 37]], [[4, 36, 16], [4, 37, 17]], [[4, 36, 12], [4, 37, 13]]],
  // 10: L · M · Q · H
  [[[2, 86, 68], [2, 87, 69]], [[4, 69, 43], [1, 70, 44]], [[6, 43, 19], [2, 44, 20]], [[6, 43, 15], [2, 44, 16]]],
  // 11: L · M · Q · H
  [[[4, 101, 81]], [[1, 80, 50], [4, 81, 51]], [[4, 50, 22], [4, 51, 23]], [[3, 36, 12], [8, 37, 13]]],
  // 12: L · M · Q · H
  [[[2, 116, 92], [2, 117, 93]], [[6, 58, 36], [2, 59, 37]], [[4, 46, 20], [6, 47, 21]], [[7, 42, 14], [4, 43, 15]]],
  // 13: L · M · Q · H
  [[[4, 133, 107]], [[8, 59, 37], [1, 60, 38]], [[8, 44, 20], [4, 45, 21]], [[12, 33, 11], [4, 34, 12]]],
  // 14: L · M · Q · H
  [[[3, 145, 115], [1, 146, 116]], [[4, 64, 40], [5, 65, 41]], [[11, 36, 16], [5, 37, 17]], [[11, 36, 12], [5, 37, 13]]],
  // 15: L · M · Q · H
  [[[5, 109, 87], [1, 110, 88]], [[5, 65, 41], [5, 66, 42]], [[5, 54, 24], [7, 55, 25]], [[11, 36, 12]]],
  // 16: L · M · Q · H
  [[[5, 122, 98], [1, 123, 99]], [[7, 73, 45], [3, 74, 46]], [[15, 43, 19], [2, 44, 20]], [[3, 45, 15], [13, 46, 16]]],
  // 17: L · M · Q · H
  [[[1, 135, 107], [5, 136, 108]], [[10, 74, 46], [1, 75, 47]], [[1, 50, 22], [15, 51, 23]], [[2, 42, 14], [17, 43, 15]]],
  // 18: L · M · Q · H
  [[[5, 150, 120], [1, 151, 121]], [[9, 69, 43], [4, 70, 44]], [[17, 50, 22], [1, 51, 23]], [[2, 42, 14], [19, 43, 15]]],
  // 19: L · M · Q · H
  [[[3, 141, 113], [4, 142, 114]], [[3, 70, 44], [11, 71, 45]], [[17, 47, 21], [4, 48, 22]], [[9, 39, 13], [16, 40, 14]]],
  // 20: L · M · Q · H
  [[[3, 135, 107], [5, 136, 108]], [[3, 67, 41], [13, 68, 42]], [[15, 54, 24], [5, 55, 25]], [[15, 43, 15], [10, 44, 16]]],
  // 21: L · M · Q · H
  [[[4, 144, 116], [4, 145, 117]], [[17, 68, 42]], [[17, 50, 22], [6, 51, 23]], [[19, 46, 16], [6, 47, 17]]],
  // 22: L · M · Q · H
  [[[2, 139, 111], [7, 140, 112]], [[17, 74, 46]], [[7, 54, 24], [16, 55, 25]], [[34, 37, 13]]],
  // 23: L · M · Q · H
  [[[4, 151, 121], [5, 152, 122]], [[4, 75, 47], [14, 76, 48]], [[11, 54, 24], [14, 55, 25]], [[16, 45, 15], [14, 46, 16]]],
  // 24: L · M · Q · H
  [[[6, 147, 117], [4, 148, 118]], [[6, 73, 45], [14, 74, 46]], [[11, 54, 24], [16, 55, 25]], [[30, 46, 16], [2, 47, 17]]],
  // 25: L · M · Q · H
  [[[8, 132, 106], [4, 133, 107]], [[8, 75, 47], [13, 76, 48]], [[7, 54, 24], [22, 55, 25]], [[22, 45, 15], [13, 46, 16]]],
  // 26: L · M · Q · H
  [[[10, 142, 114], [2, 143, 115]], [[19, 74, 46], [4, 75, 47]], [[28, 50, 22], [6, 51, 23]], [[33, 46, 16], [4, 47, 17]]],
  // 27: L · M · Q · H
  [[[8, 152, 122], [4, 153, 123]], [[22, 73, 45], [3, 74, 46]], [[8, 53, 23], [26, 54, 24]], [[12, 45, 15], [28, 46, 16]]],
  // 28: L · M · Q · H
  [[[3, 147, 117], [10, 148, 118]], [[3, 73, 45], [23, 74, 46]], [[4, 54, 24], [31, 55, 25]], [[11, 45, 15], [31, 46, 16]]],
  // 29: L · M · Q · H
  [[[7, 146, 116], [7, 147, 117]], [[21, 73, 45], [7, 74, 46]], [[1, 53, 23], [37, 54, 24]], [[19, 45, 15], [26, 46, 16]]],
  // 30: L · M · Q · H
  [[[5, 145, 115], [10, 146, 116]], [[19, 75, 47], [10, 76, 48]], [[15, 54, 24], [25, 55, 25]], [[23, 45, 15], [25, 46, 16]]],
  // 31: L · M · Q · H
  [[[13, 145, 115], [3, 146, 116]], [[2, 74, 46], [29, 75, 47]], [[42, 54, 24], [1, 55, 25]], [[23, 45, 15], [28, 46, 16]]],
  // 32: L · M · Q · H
  [[[17, 145, 115]], [[10, 74, 46], [23, 75, 47]], [[10, 54, 24], [35, 55, 25]], [[19, 45, 15], [35, 46, 16]]],
  // 33: L · M · Q · H
  [[[17, 145, 115], [1, 146, 116]], [[14, 74, 46], [21, 75, 47]], [[29, 54, 24], [19, 55, 25]], [[11, 45, 15], [46, 46, 16]]],
  // 34: L · M · Q · H
  [[[13, 145, 115], [6, 146, 116]], [[14, 74, 46], [23, 75, 47]], [[44, 54, 24], [7, 55, 25]], [[59, 46, 16], [1, 47, 17]]],
  // 35: L · M · Q · H
  [[[12, 151, 121], [7, 152, 122]], [[12, 75, 47], [26, 76, 48]], [[39, 54, 24], [14, 55, 25]], [[22, 45, 15], [41, 46, 16]]],
  // 36: L · M · Q · H
  [[[6, 151, 121], [14, 152, 122]], [[6, 75, 47], [34, 76, 48]], [[46, 54, 24], [10, 55, 25]], [[2, 45, 15], [64, 46, 16]]],
  // 37: L · M · Q · H
  [[[17, 152, 122], [4, 153, 123]], [[29, 74, 46], [14, 75, 47]], [[49, 54, 24], [10, 55, 25]], [[24, 45, 15], [46, 46, 16]]],
  // 38: L · M · Q · H
  [[[4, 152, 122], [18, 153, 123]], [[13, 74, 46], [32, 75, 47]], [[48, 54, 24], [14, 55, 25]], [[42, 45, 15], [32, 46, 16]]],
  // 39: L · M · Q · H
  [[[20, 147, 117], [4, 148, 118]], [[40, 75, 47], [7, 76, 48]], [[43, 54, 24], [22, 55, 25]], [[10, 45, 15], [67, 46, 16]]],
  // 40: L · M · Q · H
  [[[19, 148, 118], [6, 149, 119]], [[18, 75, 47], [31, 76, 48]], [[34, 54, 24], [34, 55, 25]], [[20, 45, 15], [61, 46, 16]]],
]

/** 맞춤 패턴 중심 좌표(버전별). 귀퉁이의 위치 탐지 패턴과 겹치는 조합은 그리지 않는다. */
const ALIGNMENT_CENTERS: readonly (readonly number[])[] = [
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
  [6, 30, 54],
  [6, 32, 58],
  [6, 34, 62],
  [6, 26, 46, 66],
  [6, 26, 48, 70],
  [6, 26, 50, 74],
  [6, 30, 54, 78],
  [6, 30, 56, 82],
  [6, 30, 58, 86],
  [6, 34, 62, 90],
  [6, 28, 50, 72, 94],
  [6, 26, 50, 74, 98],
  [6, 30, 54, 78, 102],
  [6, 28, 54, 80, 106],
  [6, 32, 58, 84, 110],
  [6, 30, 58, 86, 114],
  [6, 34, 62, 90, 118],
  [6, 26, 50, 74, 98, 122],
  [6, 30, 54, 78, 102, 126],
  [6, 26, 52, 78, 104, 130],
  [6, 30, 56, 82, 108, 134],
  [6, 34, 60, 86, 112, 138],
  [6, 30, 58, 86, 114, 142],
  [6, 34, 62, 90, 118, 146],
  [6, 30, 54, 78, 102, 126, 150],
  [6, 24, 50, 76, 102, 128, 154],
  [6, 28, 54, 80, 106, 132, 158],
  [6, 32, 58, 84, 110, 136, 162],
  [6, 26, 54, 82, 110, 138, 166],
  [6, 30, 58, 86, 114, 142, 170],
]

// GF(256) 로그·지수 표(원시 다항식 0x11D)
const GF_EXP = new Uint8Array(512)
const GF_LOG = new Uint8Array(256)
{
  let x = 1
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x
    GF_LOG[x] = i
    x <<= 1
    if (x & 0x100) x ^= 0x11d
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255]
}

const gfMul = (a: number, b: number): number => (a === 0 || b === 0 ? 0 : GF_EXP[GF_LOG[a] + GF_LOG[b]])

/** 데이터 코드어 뒤에 붙일 리드-솔로몬 오류 정정 코드어 */
function reedSolomon(data: number[], count: number): number[] {
  let generator = [1]
  for (let i = 0; i < count; i++) {
    const next = new Array<number>(generator.length + 1).fill(0)
    for (let j = 0; j < generator.length; j++) {
      next[j] ^= generator[j]
      next[j + 1] ^= gfMul(generator[j], GF_EXP[i])
    }
    generator = next
  }
  const rest = [...data, ...new Array<number>(count).fill(0)]
  for (let i = 0; i < data.length; i++) {
    const coef = rest[i]
    if (coef === 0) continue
    for (let j = 1; j < generator.length; j++) rest[i + j] ^= gfMul(generator[j], coef)
  }
  return rest.slice(data.length)
}

interface BlockSize {
  total: number
  data: number
}

export function blockLayout(version: number, level: QrLevel): BlockSize[] {
  return BLOCK_SPECS[version - 1][LEVEL_INDEX[level]].flatMap(([count, total, data]) => Array.from({ length: count }, () => ({ total, data })))
}

const dataCapacity = (version: number, level: QrLevel): number => blockLayout(version, level).reduce((sum, block) => sum + block.data, 0)

/** 바이트 모드의 글자 수 칸 크기: 버전 1~9 는 8비트, 10 이상은 16비트 */
const countBits = (version: number): number => (version <= 9 ? 8 : 16)

/** 글자를 담을 가장 작은 버전 */
function pickVersion(length: number, level: QrLevel): number {
  for (let version = 1; version <= MAX_VERSION; version++) {
    const needed = 4 + countBits(version) + length * 8
    if (needed <= dataCapacity(version, level) * 8) return version
  }
  throw new Error(`QR 코드에 담기에는 너무 깁니다 (${length}바이트)`)
}

/** 바이트 모드 데이터를 블록으로 나누고 오류 정정을 붙여, 배치할 코드어 순서로 만든다 */
function codewords(bytes: Uint8Array, version: number, level: QrLevel): number[] {
  const capacity = dataCapacity(version, level) * 8
  const bits: number[] = []
  const put = (value: number, length: number) => {
    for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1)
  }
  put(0b0100, 4)
  put(bytes.length, countBits(version))
  for (const byte of bytes) put(byte, 8)
  put(0, Math.min(4, capacity - bits.length))
  put(0, (8 - (bits.length % 8)) % 8)
  for (let pad = 0xec; bits.length < capacity; pad = pad === 0xec ? 0x11 : 0xec) put(pad, 8)

  const data: number[] = []
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0
    for (let k = 0; k < 8; k++) byte = (byte << 1) | bits[i + k]
    data.push(byte)
  }

  const layout = blockLayout(version, level)
  const dataBlocks: number[][] = []
  let offset = 0
  for (const block of layout) {
    dataBlocks.push(data.slice(offset, offset + block.data))
    offset += block.data
  }
  const ecBlocks = dataBlocks.map((block, i) => reedSolomon(block, layout[i].total - layout[i].data))

  // 블록을 한 코드어씩 번갈아 적는다(데이터, 그다음 오류 정정)
  const out: number[] = []
  const maxData = Math.max(...layout.map((block) => block.data))
  for (let i = 0; i < maxData; i++) for (const block of dataBlocks) if (i < block.length) out.push(block[i])
  const maxEc = Math.max(...layout.map((block) => block.total - block.data))
  for (let i = 0; i < maxEc; i++) for (const block of ecBlocks) if (i < block.length) out.push(block[i])
  return out
}

/** BCH 나머지: 형식 정보(15비트)와 버전 정보(18비트)의 오류 정정 비트를 만든다 */
export function bchRemainder(value: number, generator: number): number {
  const bitLength = (n: number) => 32 - Math.clz32(n)
  const generatorBits = bitLength(generator)
  let rest = value
  while (bitLength(rest) >= generatorBits) rest ^= generator << (bitLength(rest) - generatorBits)
  return rest
}

/** 마스크 패턴 8개. true 인 칸을 뒤집는다. */
export const MASKS: Array<(row: number, col: number) => boolean> = [
  (i, j) => (i + j) % 2 === 0,
  (i) => i % 2 === 0,
  (_i, j) => j % 3 === 0,
  (i, j) => (i + j) % 3 === 0,
  (i, j) => (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0,
  (i, j) => ((i * j) % 2) + ((i * j) % 3) === 0,
  (i, j) => (((i * j) % 2) + ((i * j) % 3)) % 2 === 0,
  (i, j) => (((i + j) % 2) + ((i * j) % 3)) % 2 === 0,
]

/** 데이터와 마스크를 채우기 전의 고정 패턴(위치 탐지 · 분리대 · 타이밍 · 맞춤 · 버전 정보). reserved 칸은 데이터가 쓰지 않는다. */
export function functionPatterns(version: number): { modules: boolean[][]; reserved: boolean[][] } {
  const size = version * 4 + 17
  const modules = Array.from({ length: size }, () => new Array<boolean>(size).fill(false))
  const reserved = Array.from({ length: size }, () => new Array<boolean>(size).fill(false))
  const set = (row: number, col: number, dark: boolean) => {
    modules[row][col] = dark
    reserved[row][col] = true
  }

  // 위치 탐지 패턴 + 바깥 분리대(밝은 한 줄)
  const finder = (top: number, left: number) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const row = top + dr
        const col = left + dc
        if (row < 0 || row >= size || col < 0 || col >= size) continue
        const ring = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6 && (dr === 0 || dr === 6 || dc === 0 || dc === 6)
        const core = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4
        set(row, col, ring || core)
      }
    }
  }
  finder(0, 0)
  finder(0, size - 7)
  finder(size - 7, 0)

  // 타이밍 패턴(6행 · 6열)
  for (let i = 8; i < size - 8; i++) {
    set(6, i, i % 2 === 0)
    set(i, 6, i % 2 === 0)
  }

  // 맞춤 패턴
  const centers = ALIGNMENT_CENTERS[version - 1]
  const last = centers[centers.length - 1]
  for (const row of centers) {
    for (const col of centers) {
      const inFinder = (row === 6 && col === 6) || (row === 6 && col === last) || (row === last && col === 6)
      if (inFinder) continue
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) set(row + dr, col + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1)
      }
    }
  }

  // 형식 정보가 놓일 칸은 예약만 해 둔다(값은 마스크를 고른 뒤 쓴다). 어두운 모듈은 고정이다.
  for (let i = 0; i < 9; i++) {
    reserved[8][i] = true
    reserved[i][8] = true
  }
  for (let i = 0; i < 8; i++) {
    reserved[8][size - 1 - i] = true
    reserved[size - 1 - i][8] = true
  }
  set(size - 8, 8, true)

  // 버전 정보(7 이상): 두 복사본을 대각선 대칭으로 쓴다
  if (version >= 7) {
    const bits = (version << 12) | bchRemainder(version << 12, VERSION_GENERATOR)
    for (let i = 0; i < 18; i++) {
      const dark = ((bits >> i) & 1) === 1
      const row = Math.floor(i / 3)
      const col = (i % 3) + size - 11
      set(row, col, dark)
      set(col, row, dark)
    }
  }
  return { modules, reserved }
}

/** 형식 정보 두 복사본을 쓴다 */
function writeFormat(modules: boolean[][], level: QrLevel, mask: number) {
  const size = modules.length
  const data = (LEVEL_FORMAT_BITS[level] << 3) | mask
  const bits = ((data << 10) | bchRemainder(data << 10, FORMAT_GENERATOR)) ^ FORMAT_XOR
  for (let i = 0; i < 15; i++) {
    const dark = ((bits >> i) & 1) === 1
    // 왼쪽 위 탐지 패턴 쪽
    if (i < 6) modules[i][8] = dark
    else if (i < 8) modules[i + 1][8] = dark
    else modules[size - 15 + i][8] = dark
    // 오른쪽 위와 왼쪽 아래 쪽(6열 타이밍을 건너뛴다)
    if (i < 8) modules[8][size - 1 - i] = dark
    else modules[8][i === 8 ? 7 : 14 - i] = dark
  }
}

/** 한 마스크로 완성한 격자. 데이터 코드어를 오른쪽 아래에서 두 열씩 위아래로 지그재그 배치한다. */
function buildMatrix(version: number, level: QrLevel, code: number[], mask: number): boolean[][] {
  const { modules, reserved } = functionPatterns(version)
  const size = modules.length
  const totalBits = code.length * 8
  let bitIndex = 0
  let upward = true
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--
    for (let k = 0; k < size; k++) {
      const row = upward ? size - 1 - k : k
      for (const c of [col, col - 1]) {
        if (reserved[row][c]) continue
        let dark = bitIndex < totalBits && ((code[bitIndex >> 3] >> (7 - (bitIndex & 7))) & 1) === 1
        if (MASKS[mask](row, c)) dark = !dark
        modules[row][c] = dark
        bitIndex++
      }
    }
    upward = !upward
  }
  writeFormat(modules, level, mask)
  return modules
}

/** 읽기 어려운 모양 감점. 줄 하나를 따라 같은 색 연속 길이·1:1:3:1:1 모양을 센다. */
function linePenalty(line: boolean[]): number {
  let score = 0
  let run = 1
  for (let i = 1; i < line.length; i++) {
    if (line[i] === line[i - 1]) {
      run++
      continue
    }
    if (run >= 5) score += run - 2
    run = 1
  }
  if (run >= 5) score += run - 2
  const finderLike = [
    [true, false, true, true, true, false, true, false, false, false, false],
    [false, false, false, false, true, false, true, true, true, false, true],
  ]
  for (let i = 0; i + 11 <= line.length; i++) {
    for (const pattern of finderLike) {
      if (pattern.every((dark, k) => line[i + k] === dark)) score += 40
    }
  }
  return score
}

/** 마스크 점수: 줄 · 블록 · 모양 · 어두운 비율의 감점 합 */
function penalty(modules: boolean[][]): number {
  const size = modules.length
  let score = 0
  for (let i = 0; i < size; i++) {
    score += linePenalty(modules[i])
    score += linePenalty(modules.map((row) => row[i]))
  }
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const v = modules[r][c]
      if (v === modules[r][c + 1] && v === modules[r + 1][c] && v === modules[r + 1][c + 1]) score += 3
    }
  }
  let dark = 0
  for (const row of modules) for (const v of row) if (v) dark++
  score += Math.floor(Math.abs((dark * 100) / (size * size) - 50) / 5) * 10
  return score
}

/**
 * 글자를 QR 코드 격자로 만든다. true 가 검은 모듈이다. 여백(quiet zone)은 넣지 않는다.
 * 담기 어려우면 예외를 던진다. 바이트는 UTF-8 로 센다. mask 를 주면 마스크를 고정한다(시험용).
 */
export function qrMatrix(text: string, level: QrLevel = 'M', mask?: number): boolean[][] {
  const bytes = new TextEncoder().encode(text)
  const version = pickVersion(bytes.length, level)
  const code = codewords(bytes, version, level)
  if (mask !== undefined) return buildMatrix(version, level, code, mask)
  let best = buildMatrix(version, level, code, 0)
  let bestScore = penalty(best)
  for (let mask = 1; mask < MASKS.length; mask++) {
    const modules = buildMatrix(version, level, code, mask)
    const score = penalty(modules)
    if (score < bestScore) {
      best = modules
      bestScore = score
    }
  }
  return best
}
