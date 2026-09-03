import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cx } from '../utils/cx';
import { useLabels } from '../utils/labels';
import type { NativeProps } from '../utils/polymorphic';

export type PaginationProps = NativeProps<'nav', { page: number; total: number; onChange: (p: number) => void; siblings?: number; summary?: boolean | ((page: number, total: number) => string); pageSize?: number }>;

/** Radix 에 없음 — 자체 구현. 첫/끝 항상, 현재 ±siblings, 나머지는 … */
export function range(page: number, total: number, siblings: number): (number | '…')[] {
  const set = new Set([1, total]);
  for (let k = page - siblings; k <= page + siblings; k++) if (k >= 1 && k <= total) set.add(k);
  const arr = [...set].sort((a, b) => a - b), out: (number | '…')[] = [];
  arr.forEach((n, i) => { out.push(n); if (arr[i + 1] && arr[i + 1] - n > 1) out.push('…'); });
  return out;
}
const cell: React.CSSProperties = { border: 0, borderRight: '1px solid var(--color-divider)', minWidth: 36, height: 36, padding: '0 8px', font: 'inherit', fontSize: 13, fontVariantNumeric: 'tabular-nums', background: 'transparent', color: 'var(--color-text)', cursor: 'pointer' };

export const Pagination = forwardRef<HTMLElement, PaginationProps>(({ page, total, onChange, siblings = 1, summary = true, pageSize = 20, className, ...rest }, ref) => { const t = useLabels(); return (
  <nav ref={ref} aria-label={t('pagination.label')} className={cx('pagination', className)} style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }} {...rest}>
    <div style={{ display: 'flex', border: '1px solid var(--color-divider)' }}>
      <button type="button" aria-label={t('pagination.prev')} disabled={page <= 1} onClick={() => onChange(page - 1)} className="pagination-cell" style={cell}>‹</button>
      {range(page, total, siblings).map((p, i) => p === '…'
        ? <span key={'g' + i} aria-hidden style={{ ...cell, display: 'grid', placeItems: 'center', color: 'var(--color-neutral-500)', cursor: 'default' }}>…</span>
        : <button key={p} type="button" aria-current={p === page ? 'page' : undefined} onClick={() => onChange(p)} className="pagination-cell" style={{ ...cell, background: p === page ? 'var(--color-text)' : 'transparent', color: p === page ? 'var(--color-bg)' : 'var(--color-text)' }}>{p}</button>)}
      <button type="button" aria-label={t('pagination.next')} disabled={page >= total} onClick={() => onChange(page + 1)} className="pagination-cell" style={{ ...cell, borderRight: 0 }}>›</button>
    </div>
    {summary && <span style={{ fontSize: 12, color: 'var(--color-neutral-700)', fontVariantNumeric: 'tabular-nums' }}>{typeof summary === 'function' ? summary(page, total) : `${(page - 1) * pageSize + 1}–${page * pageSize} / ${total * pageSize}개`}</span>}
  </nav>
); });
Pagination.displayName = 'Pagination';

/** 커서 페이지네이션(bottling 20개 단위) — 번호 없음 */
export function PaginationCursor({ hasPrev, hasNext, onPrev, onNext, ...rest }: { hasPrev: boolean; hasNext: boolean; onPrev: () => void; onNext: () => void } & ComponentPropsWithoutRef<'nav'>) {
  return <nav aria-label="페이지" style={{ display: 'flex', gap: 2 }} {...rest}><button type="button" className="btn btn-secondary" disabled={!hasPrev} onClick={onPrev}>이전</button><button type="button" className="btn btn-secondary" disabled={!hasNext} onClick={onNext}>다음</button></nav>;
}
/* styles.css: .pagination-cell:hover:not(:disabled):not([aria-current]){background:var(--color-neutral-200)} .pagination-cell:disabled{opacity:.45;cursor:default} */
