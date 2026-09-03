import { forwardRef, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { useLabels } from '../utils/labels';
import type { NativeProps } from '../utils/polymorphic';

export type AppBarProps = NativeProps<'header', { title?: ReactNode; onBack?: () => void; crumbs?: string[]; actions?: ReactNode; sticky?: boolean }>;
/** 모바일 상단 바: 뒤로(44px) + 제목 또는 Breadcrumb + 액션. F5 매장 상세에서 반복돼 승격 */
export const AppBar = forwardRef<HTMLElement, AppBarProps>(({ title, onBack, crumbs, actions, sticky = true, className, ...rest }, ref) => {
  const t = useLabels();
  return (
    <header ref={ref} className={cx('appbar', className)} style={{ position: sticky ? 'sticky' : undefined, top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', minHeight: 56, background: 'var(--color-surface)', borderBottom: '1px solid var(--color-divider)' }} {...rest}>
      {onBack && <button type="button" className="btn btn-ghost btn-icon" aria-label={t('common.back')} onClick={onBack} style={{ minHeight: 44, width: 44 }}>‹</button>}
      {crumbs ? (
        <nav aria-label={t('breadcrumb.label')} style={{ display: 'flex', gap: 6, fontSize: 12, color: 'var(--color-neutral-700)', minWidth: 0, flex: 1 }}>
          {crumbs.map((c, i) => { const last = i === crumbs.length - 1; return <span key={i} style={{ display: 'contents' }}>{i > 0 && <span aria-hidden style={{ color: 'var(--color-neutral-400)' }}>/</span>}<span aria-current={last ? 'page' : undefined} style={last ? { color: 'var(--color-text)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } : undefined}>{c}</span></span>; })}
        </nav>
      ) : <h1 className="dialog-title" style={{ flex: 1, margin: 0, fontSize: 17, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h1>}
      {actions && <div style={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>{actions}</div>}
    </header>
  );
});
AppBar.displayName = 'AppBar';
