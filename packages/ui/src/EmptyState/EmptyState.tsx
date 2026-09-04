import { type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { Skeleton } from '@modul/motion';
import type { NativeProps } from '../utils/polymorphic';
import { useLabels } from '../utils/labels';

/** bottling @malt/core 의 ViewState 와 같은 형태 */
export type ViewState<T> = { kind: 'loading' } | { kind: 'empty' } | { kind: 'error'; message: string; retry: () => void } | { kind: 'offline'; cached?: T } | { kind: 'ready'; data: T };
type Slot = { title?: ReactNode; body?: ReactNode; action?: { label: string; onClick: () => void }; secondary?: { label: string; onClick: () => void } };
export type EmptyStateProps<T> = NativeProps<'div', { view: ViewState<T>; children: (data: T) => ReactNode; empty?: Slot; error?: Slot; offline?: Slot; skeleton?: ReactNode; size?: 'md' | 'sm' }>;

const MARK: Record<string, string> = { empty: 'var(--color-accent)', error: 'var(--color-accent-700)', offline: 'var(--color-neutral-500)' };

/** ViewState 5종을 한 컴포넌트로. 빈 상태에 부정형 문구 금지 — 다음 행동 버튼을 준다. 오류는 인라인 재시도. */
export function EmptyState<T>({ view, children, empty, error, offline, skeleton, size = 'md', className, ...rest }: EmptyStateProps<T>) {
  const t = useLabels();
  if (view.kind === 'ready') return <>{children(view.data)}</>;
  if (view.kind === 'loading') return <div className={cx('view-loading', className)} aria-busy {...rest}>{skeleton ?? <Skeleton.Card lines={3} />}</div>;
  const slot: Slot = view.kind === 'empty' ? { title: t('emptystate.empty'), ...empty }
    : view.kind === 'error' ? { title: t('emptystate.error'), body: view.message, action: { label: t('common.retry'), onClick: view.retry }, ...error }
    : { title: t('emptystate.offline'), body: t('emptystate.offlineBody'), ...offline };
  return (
    <div role={view.kind === 'error' ? 'alert' : undefined} className={cx('view-' + view.kind, className)} style={{ display: 'grid', gap: 12, justifyItems: 'start', padding: size === 'sm' ? 20 : 32, animation: 'mdl-fadeup var(--motion-slow) var(--ease-decel) both' }} {...rest}>
      <span aria-hidden style={{ width: 12, height: 12, background: MARK[view.kind] }} />
      <span style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-neutral-700)' }}>{view.kind}</span>
      <b className="dialog-title" style={{ fontSize: size === 'sm' ? 20 : 22, maxWidth: '24ch' }}>{slot.title}</b>
      {slot.body && <span style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-neutral-700)', maxWidth: '40ch' }}>{slot.body}</span>}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        {slot.action && <button type="button" className={cx('btn', view.kind === 'offline' ? 'btn-secondary' : 'btn-primary')} onClick={slot.action.onClick}>{slot.action.label}</button>}
        {slot.secondary && <button type="button" className="btn btn-ghost" onClick={slot.secondary.onClick}>{slot.secondary.label}</button>}
      </div>
      {view.kind === 'offline' && view.cached !== undefined && <div style={{ width: '100%', opacity: .6 }}>{children(view.cached)}</div>}
    </div>
  );
}
