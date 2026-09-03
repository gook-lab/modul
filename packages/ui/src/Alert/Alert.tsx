import { forwardRef, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import type { NativeProps } from '../utils/polymorphic';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';
export type AlertProps = NativeProps<'div', { tone?: AlertTone; title: ReactNode; action?: { label: string; onClick: () => void }; onDismiss?: () => void; icon?: ReactNode }>;
const T: Record<AlertTone, [string, string, string]> = { info: ['var(--color-surface)', 'var(--color-text)', 'var(--color-neutral-500)'], success: ['var(--color-neutral-200)', 'var(--color-text)', 'var(--color-text)'], warning: ['var(--color-accent-100)', 'var(--color-accent-800)', 'var(--color-accent-400)'], error: ['var(--color-accent-100)', 'var(--color-accent-800)', 'var(--color-accent)'] };

/** 인라인 알림. 토스트와 달리 문맥 옆에 머무른다. error 만 role=alert, 나머지 status. 모노 팔레트라 톤은 채도가 아니라 강조색 램프 단계로 구분 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(({ tone = 'info', title, action, onDismiss, icon, className, children, ...rest }, ref) => {
  const [bg, fg, bar] = T[tone];
  return (
    <div ref={ref} role={tone === 'error' ? 'alert' : 'status'} className={cx('alert', `alert-${tone}`, className)} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 14px', background: bg, color: fg, borderLeft: `2px solid ${bar}` }} {...rest}>
      {icon && <span aria-hidden style={{ flex: 'none', marginTop: 2, display: 'flex' }}>{icon}</span>}
      <div style={{ flex: 1, display: 'grid', gap: 4, minWidth: 0 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{title}</span>
        {children && <span style={{ fontSize: 13, lineHeight: 1.55, opacity: .85 }}>{children}</span>}
        {action && <button type="button" className="btn btn-ghost" onClick={action.onClick} style={{ justifySelf: 'start', paddingInline: 0, marginTop: 2, color: 'inherit' }}>{action.label} →</button>}
      </div>
      {onDismiss && <button type="button" aria-label="닫기" onClick={onDismiss} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'inherit', opacity: .6, padding: 2 }}>×</button>}
    </div>
  );
});
Alert.displayName = 'Alert';
