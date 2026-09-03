/** 업로드 전 검증 — FileDrop · ImageGallery · AvatarUpload 공용 */
export type FileReject = { file: File; reason: 'type' | 'size' | 'duplicate' | 'count' };
export type ValidateOptions = {
  accept?: string;                 // input accept 문법: "image/*", ".csv,.json", "image/png,.svg"
  maxSize?: number;                // bytes
  max?: number;                    // 총 개수 (existing 포함)
  existing?: Array<{ name: string; size: number; lastModified?: number; hash?: string }>;
  /** 'meta' = name+size+lastModified (동기, 기본) · 'content' = SHA-256 (비동기, 이름 바꿔 올린 같은 사진도 잡음) */
  dedupe?: 'meta' | 'content' | false;
};
export type ValidateResult = { accepted: File[]; rejected: FileReject[]; hashes?: Map<File, string> };

export function matchesAccept(file: File, accept?: string) {
  if (!accept || accept === '*' || accept === '*/*') return true;
  const name = file.name.toLowerCase(); const type = file.type.toLowerCase();
  return accept.split(',').map(s => s.trim().toLowerCase()).filter(Boolean).some(rule =>
    rule.startsWith('.') ? name.endsWith(rule)
    : rule.endsWith('/*') ? type.startsWith(rule.slice(0, -1))
    : type === rule);
}
const metaKey = (f: { name: string; size: number; lastModified?: number }) => `${f.name}|${f.size}|${f.lastModified ?? ''}`;
export async function sha256(file: File) { const buf = await crypto.subtle.digest('SHA-256', await file.arrayBuffer()); return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join(''); }

export function validateFiles(files: File[], o: ValidateOptions = {}): ValidateResult {
  const accepted: File[] = [], rejected: FileReject[] = [];
  const seen = new Set((o.existing ?? []).map(metaKey));
  let room = o.max != null ? o.max - (o.existing?.length ?? 0) : Infinity;
  for (const f of files) {
    if (!matchesAccept(f, o.accept)) { rejected.push({ file: f, reason: 'type' }); continue; }
    if (o.maxSize && f.size > o.maxSize) { rejected.push({ file: f, reason: 'size' }); continue; }
    if (o.dedupe !== false) { const k = metaKey(f); if (seen.has(k)) { rejected.push({ file: f, reason: 'duplicate' }); continue; } seen.add(k); }
    if (room <= 0) { rejected.push({ file: f, reason: 'count' }); continue; }
    room--; accepted.push(f);
  }
  return { accepted, rejected };
}
/** dedupe:'content' — 메타 검증 후 남은 것들만 해시. 이미 올린 사진의 hash 를 existing 에 넣어두면 이름이 달라도 잡는다 */
export async function validateFilesAsync(files: File[], o: ValidateOptions = {}): Promise<ValidateResult> {
  const r = validateFiles(files, { ...o, dedupe: o.dedupe === 'content' ? 'meta' : o.dedupe });
  if (o.dedupe !== 'content') return r;
  const known = new Set((o.existing ?? []).map(e => e.hash).filter(Boolean) as string[]);
  const hashes = new Map<File, string>(); const accepted: File[] = [];
  for (const f of r.accepted) { const h = await sha256(f); if (known.has(h)) r.rejected.push({ file: f, reason: 'duplicate' }); else { known.add(h); hashes.set(f, h); accepted.push(f); } }
  return { accepted, rejected: r.rejected, hashes };
}
export const rejectMessage = (r: FileReject, o: { maxSize?: number; max?: number } = {}) => ({
  type: `${r.file.name} — 받을 수 없는 형식입니다`,
  size: `${r.file.name} — ${o.maxSize ? Math.round(o.maxSize / 1e6) + 'MB' : '크기 제한'} 를 넘습니다`,
  duplicate: `${r.file.name} — 이미 올린 파일입니다`,
  count: `최대 ${o.max ?? ''}개까지 올릴 수 있습니다`,
}[r.reason]);
