import { forwardRef, useId, useState, type ReactNode } from 'react';
import { cx, cssVar } from '../utils/cx';
import { validateFiles, rejectMessage } from '../utils/files';
import type { NativeProps } from '../utils/polymorphic';
import { useLabels } from '../utils/labels';

type ImageItemBase = { id: string; url: string; progress?: number; alt?: string };
type Common = { maxSize?: number; /** 기본 image/* — HEIC 만 받으려면 ".heic,image/heic" 등 */ accept?: string; onUpload?: (file: File, onProgress: (p: number) => void) => Promise<string>; onError?: (msg: string) => void };
export type ImageItem = ImageItemBase & { /** 중복 검사용 — 컴포넌트가 채움 */ name?: string; size?: number; lastModified?: number };
const ok = (f: File, accept = 'image/*', maxSize = 2e6, onError?: (m: string) => void) => { const r = validateFiles([f], { accept, maxSize, dedupe: false }); if (r.rejected[0]) onError?.(rejectMessage(r.rejected[0], { maxSize })); return r.accepted.length === 1; };
const img: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'grayscale(1) contrast(1.08)' };

/* ── AvatarUpload: 단일, 정방형 크롭(object-fit), 이니셜 폴백 ── */
export type AvatarUploadProps = NativeProps<'input', Common & { value: string | null; onChange: (url: string | null) => void; fallback: string; /** 기본 circle */ shape?: 'circle' | 'square'; size?: number }>;
export const AvatarUpload = forwardRef<HTMLInputElement, AvatarUploadProps>(({ value, onChange, fallback, shape = 'circle', size = 88, maxSize, accept = 'image/*', onUpload, onError, className, id, ...rest }, ref) => {
  const t = useLabels();
  const auto = useId(); const iid = id ?? auto; const [drag, setDrag] = useState(false); const [busy, setBusy] = useState(false);
  const take = async (f?: File) => { if (!f || !ok(f, accept, maxSize, onError)) return; const local = URL.createObjectURL(f); onChange(local); if (onUpload) { setBusy(true); try { onChange(await onUpload(f, () => {})); } finally { setBusy(false); } } };
  return (
    <div className={cx('avatar-upload', className)} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <label htmlFor={iid} onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); take(e.dataTransfer.files[0]); }}
        style={{ position: 'relative', width: size, height: size, flex: 'none', cursor: 'pointer', borderRadius: shape === 'square' ? 0 : 'var(--radius-avatar)', overflow: 'hidden', background: 'var(--color-neutral-300)', border: `2px dashed ${drag ? 'var(--color-accent)' : 'transparent'}`, opacity: busy ? .6 : 1 }}>
        <input ref={ref} id={iid} type="file" accept={accept} onChange={e => take(e.target.files?.[0])} style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }} {...rest} />
        {value ? <img src={value} alt={t('upload.photoAlt')} style={img} /> : <span aria-hidden style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-heading)', fontWeight: cssVar('--font-heading-weight'), fontSize: size * .32, color: 'var(--color-neutral-700)' }}>{fallback}</span>}
        <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '4px 0', textAlign: 'center', fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase', background: 'color-mix(in srgb, var(--color-neutral-900) 70%, transparent)', color: 'var(--color-bg)' }}>{drag ? t('upload.drop') : value ? t('upload.replace') : t('upload.upload')}</span>
      </label>
      {value && <button type="button" className="btn btn-ghost" onClick={() => onChange(null)}>제거</button>}
    </div>
  );
});
AvatarUpload.displayName = 'AvatarUpload';

/* ── ImageGallery: 다중, 드래그 순서, 첫 장이 대표, 장당 진행률 ── */
export type ImageGalleryProps = NativeProps<'div', Common & { value: ImageItem[]; onChange: (v: ImageItem[]) => void; max?: number; reorder?: boolean; label?: ReactNode }>;
export function ImageGallery({ value, onChange, max = 5, reorder = true, maxSize = 2e6, accept = 'image/*', onUpload, onError, label, className, ...rest }: ImageGalleryProps) {
  const t = useLabels();
  const [drag, setDrag] = useState(false); const [dragId, setDragId] = useState<string | null>(null);
  const add = async (files: File[]) => {
    // 형식(accept) · 크기 · 중복(같은 배치 안 + 이미 올린 value 와 name/size/lastModified) · 개수 — 한 번에 검증, 거부는 사유별 메시지로 onError
    const r = validateFiles(files, { accept, maxSize, max, existing: value.filter(v => v.name).map(v => ({ name: v.name!, size: v.size!, lastModified: v.lastModified })) });
    r.rejected.forEach(x => onError?.(rejectMessage(x, { maxSize, max })));
    const picked = r.accepted; if (!picked.length) return;
    const items: ImageItem[] = picked.map(f => ({ id: crypto.randomUUID(), url: URL.createObjectURL(f), progress: onUpload ? 0 : 100, alt: f.name, name: f.name, size: f.size, lastModified: f.lastModified }));
    let next = [...value, ...items]; onChange(next);
    if (onUpload) await Promise.all(picked.map(async (f, i) => { const id = items[i].id; const url = await onUpload(f, p => { next = next.map(x => x.id === id ? { ...x, progress: p } : x); onChange(next); }); next = next.map(x => x.id === id ? { ...x, url, progress: 100 } : x); onChange(next); }));
  };
  const [moved, setMoved] = useState('');
  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= value.length) return;
    const arr = [...value]; const [m] = arr.splice(from, 1); arr.splice(to, 0, m); onChange(arr);
    return m.id;
  };
  /**
   * 드래그의 키보드 대안(RADIO/R). 항목에 포커스한 뒤 ←→ 로 옮깁니다.
   * 옮긴 뒤에도 같은 사진에 포커스가 남아야 연속으로 옮길 수 있어서 id 로 다시 찾아 포커스합니다.
   */
  const nudge = (e: React.KeyboardEvent<HTMLElement>, k: number) => {
    const dir = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
    if (!dir || !reorder) return;
    e.preventDefault();
    const id = move(k, k + dir);
    if (!id) return;
    setMoved(t('upload.moved', { i: k + dir + 1 }));
    requestAnimationFrame(() => {
      (e.currentTarget.closest('.image-gallery')?.querySelector(`[data-photo="${id}"]`) as HTMLElement | null)?.focus();
    });
  };
  return (
    <div role="group" aria-label={typeof label === 'string' ? label : undefined} className={cx('image-gallery', className)} {...rest}>
      {label && <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}><span style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-neutral-700)' }}>{label}</span><span style={{ fontSize: 11, color: 'var(--color-neutral-700)', fontVariantNumeric: 'tabular-nums' }}>{value.length} / {max}{reorder && ` · ${t('upload.reorder')}`} · {t('upload.primaryFirst')}</span></div>}
      <span aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>{moved}</span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))', gap: 2 }}>
        {value.map((it, k) => (
          <div key={it.id} draggable={reorder} onDragStart={() => setDragId(it.id)} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const from = value.findIndex(x => x.id === dragId); if (from >= 0) move(from, k); setDragId(null); }} onDragEnd={() => setDragId(null)}
            style={{ position: 'relative', aspectRatio: '1', background: 'var(--color-neutral-300)', overflow: 'hidden', cursor: reorder ? 'grab' : undefined, opacity: dragId === it.id ? .4 : 1, outline: dragId && dragId !== it.id ? '2px dashed var(--color-accent)' : undefined, outlineOffset: -2 }}>
            <div
              data-photo={it.id}
              role={reorder ? 'button' : undefined}
              tabIndex={reorder ? 0 : undefined}
              aria-label={reorder ? t('upload.reorderHint', { i: k + 1, n: value.length }) : undefined}
              onKeyDown={reorder ? e => nudge(e, k) : undefined}
              style={{ display: 'block', width: '100%', height: '100%' }}
            >
              <img src={it.url} alt={it.alt ?? t('upload.photoNth', { i: k + 1 })} style={img} />
            </div>
            {(it.progress ?? 100) < 100 && <span role="progressbar" aria-valuenow={it.progress} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: 'var(--color-neutral-100)' }}><span style={{ display: 'block', height: 2, width: `${it.progress}%`, background: 'var(--color-accent)', transition: 'width var(--motion-base)' }} /></span>}
            {k === 0 && <span style={{ position: 'absolute', left: 6, top: 6, fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', padding: '2px 6px', background: 'var(--color-accent)', color: 'var(--color-bg)' }}>{t('upload.primaryBadge')}</span>}
            <button type="button" aria-label={t('upload.removeNth', { i: k + 1 })} onClick={() => onChange(value.filter(x => x.id !== it.id))} style={{ position: 'absolute', right: 4, top: 4, width: 24, height: 24, border: 0, background: 'color-mix(in srgb, var(--color-neutral-900) 70%, transparent)', color: 'var(--color-bg)', cursor: 'pointer', padding: 0 }}>×</button>
          </div>
        ))}
        {value.length < max && (
          <label onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); add([...e.dataTransfer.files]); }}
            style={{ aspectRatio: '1', border: `2px dashed ${drag ? 'var(--color-accent)' : 'var(--color-divider)'}`, background: drag ? 'var(--color-accent-100)' : 'var(--color-surface)', display: 'grid', placeItems: 'center', alignContent: 'center', gap: 6, cursor: 'pointer', color: 'var(--color-neutral-700)', fontSize: 11, position: 'relative' }}>
            <input type="file" accept={accept} multiple onChange={e => add([...(e.target.files ?? [])])} style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }} />
            <span aria-hidden style={{ fontSize: 20, lineHeight: 1 }}>+</span><span>추가</span>
          </label>
        )}
      </div>
    </div>
  );
}
