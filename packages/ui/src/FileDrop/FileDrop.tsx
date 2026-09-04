import { forwardRef, useId, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { validateFiles, rejectMessage, type FileReject } from '../utils/files';
import type { NativeProps } from '../utils/polymorphic';
import { useLabels } from '../utils/labels';

export type UploadItem = { id: string; name: string; size: number; lastModified?: number; progress: number; error?: string };
export type FileDropProps = NativeProps<'input', { onFiles: (files: File[]) => void; files?: UploadItem[]; onRemove?: (id: string) => void; maxSize?: number; max?: number; /** 형식·크기·중복·개수 거부 — 기본은 콘솔 없이 무시하므로 반드시 토스트/필드 오류로 연결 */ onReject?: (rejected: FileReject[], messages: string[]) => void; /** false 면 중복 허용 */ dedupe?: 'meta' | false; title?: ReactNode; hint?: ReactNode; labelProps?: ComponentPropsWithoutRef<'label'> }>;
const fmt = (b: number) => b > 1e6 ? (b / 1e6).toFixed(1) + ' MB' : Math.round(b / 1e3) + ' KB';

/** 드래그 앤 드롭 + 클릭. 진짜 input 은 시각적으로만 숨김(접근성 트리엔 남음). 진행은 2px 룰 */
/**
 * 모션 (components.css .filedrop*):
 *  hover      — 배경 neutral-200, 테두리 neutral-500 (200ms)
 *  drag-over  — 배경 accent-100, scale 1.015, shadow-md, 테두리는 달리는 점선(mdl-dash), 아이콘 bounce, 제목 accent-700
 *  reject     — accept 불일치: shake 300ms + 제목 "이 형식은 받을 수 없습니다" 1.6s
 *  item enter — fade-up 200ms · 완료 시 pop 350ms + 체크 stroke draw · 실패 시 테두리 accent + 재시도
 */
export const FileDrop = forwardRef<HTMLInputElement, FileDropProps>(({ onFiles, files = [], onRemove, maxSize, max, onReject, dedupe = 'meta', title, hint, labelProps, className, id, accept, multiple, ...rest }, ref) => {
  const t = useLabels();
  const auto = useId(); const iid = id ?? auto; const [drag, setDrag] = useState(false); const [reject, setReject] = useState(false);
  // 드롭 경로는 브라우저가 accept 를 검사하지 않는다 — 여기서 확장자/MIME · 크기 · 중복(name+size+lastModified, 이미 올린 files 포함) · 개수를 한 번에
  const take = (list: FileList | null) => {
    if (!list) return;
    const r = validateFiles([...list], { accept, maxSize, max: multiple ? max : 1, existing: files.map(f => ({ name: f.name, size: f.size, lastModified: f.lastModified })), dedupe });
    if (r.rejected.length) { setReject(true); setTimeout(() => setReject(false), 1600); onReject?.(r.rejected, r.rejected.map(x => rejectMessage(x, { maxSize, max }))); }
    if (r.accepted.length) onFiles(r.accepted);
  };
  return (
    <div className={cx('filedrop', className)} data-drag={drag || undefined} data-reject={reject || undefined} style={{ display: 'grid', gap: 12 }}>
      <label htmlFor={iid} {...labelProps} onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); take(e.dataTransfer.files); }}
        style={{ display: 'grid', gap: 10, justifyItems: 'start', alignContent: 'center', minHeight: 140, padding: '28px 24px', cursor: 'pointer', border: `2px dashed ${drag ? 'var(--color-accent)' : 'var(--color-divider)'}`, background: drag ? 'var(--color-accent-100)' : 'var(--color-surface)', transition: 'background var(--motion-fast), border-color var(--motion-fast)', ...labelProps?.style }}>
        <input ref={ref} id={iid} type="file" accept={accept} multiple={multiple} onChange={e => take(e.target.files)} style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden' }} {...rest} />
        <span className="dialog-title" style={{ fontSize: 16 }}>{reject ? t('filedrop.reject') : title ?? (drag ? t('filedrop.drop') : t('filedrop.title'))}</span>
        <span style={{ fontSize: 13, color: 'var(--color-neutral-700)' }}>{hint ?? [accept, maxSize && t('filedrop.maxSize', { size: fmt(maxSize) })].filter(Boolean).join(' · ')}</span>
        <span className="btn btn-secondary" aria-hidden style={{ marginTop: 4 }}>{t('filedrop.pick')}</span>
      </label>
      {files.map(f => (
        <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid var(--color-divider)', background: 'var(--color-surface)', animation: 'mdl-fadeup var(--motion-base) both' }}>
          <span style={{ width: 32, height: 32, background: 'var(--color-neutral-300)', display: 'grid', placeItems: 'center', fontSize: 9, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--color-neutral-800)', flex: 'none' }}>{f.name.split('.').pop()?.slice(0, 4)}</span>
          <span style={{ flex: 1, display: 'grid', gap: 4, minWidth: 0 }}>
            <span style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: f.error ? 'var(--color-accent-700)' : undefined }}>{f.error ?? f.name}</span>
            <span role="progressbar" aria-label={`${f.name} 업로드 진행률`} aria-valuenow={f.progress} aria-valuemin={0} aria-valuemax={100} style={{ height: 2, background: 'var(--color-neutral-300)' }}><span style={{ display: 'block', height: 2, width: `${f.progress}%`, background: f.error ? 'var(--color-accent-700)' : 'var(--color-accent)', transition: 'width var(--motion-slow)' }} /></span>
          </span>
          <span style={{ fontSize: 11, color: 'var(--color-neutral-700)', fontVariantNumeric: 'tabular-nums' }}>{fmt(f.size)}</span>
          {onRemove && <button type="button" aria-label={`${f.name} 제거`} onClick={() => onRemove(f.id)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--color-neutral-700)', padding: 6 }}>×</button>}
        </div>
      ))}
    </div>
  );
});
FileDrop.displayName = 'FileDrop';
