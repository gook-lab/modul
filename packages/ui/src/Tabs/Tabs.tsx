import * as RTabs from '@radix-ui/react-tabs';
import { type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cx } from '../utils/cx';

export type TabItem = { value: string; label: ReactNode; icon?: ReactNode; count?: number; disabled?: boolean };
export type TabsProps = ComponentPropsWithoutRef<typeof RTabs.Root> & { items: TabItem[]; variant?: 'underline' | 'contained'; listProps?: ComponentPropsWithoutRef<typeof RTabs.List> };

/** Radix Tabs — ←→ Home End, 자동 활성. underline: 하단 2px 룰 위에 accent 바. contained: surface 트랙 */
export function Tabs({ items, variant = 'underline', listProps, className, children, ...rest }: TabsProps) {
  const u = variant === 'underline';
  return (
    <RTabs.Root className={cx('tabs', className)} {...rest}>
      <RTabs.List {...listProps} style={{ display: 'flex', gap: u ? 4 : 2, borderBottom: u ? '2px solid var(--color-divider)' : 0, background: u ? undefined : 'var(--color-surface)', padding: u ? 0 : 2, ...listProps?.style }}>
        {items.map(t => (
          <RTabs.Trigger key={t.value} value={t.value} disabled={t.disabled} className="tab"
            style={{ all: 'unset', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, padding: u ? '10px 14px' : '8px 14px', minHeight: 40, color: 'var(--color-neutral-700)' }}>
            {t.icon}{t.label}{t.count != null && t.count > 0 && <span style={{ fontSize: 11, padding: '1px 6px', background: 'var(--color-neutral-200)', color: 'var(--color-neutral-800)', fontVariantNumeric: 'tabular-nums' }}>{t.count}</span>}
          </RTabs.Trigger>
        ))}
      </RTabs.List>
      {children}
    </RTabs.Root>
  );
}
Tabs.Panel = function Panel({ style, ...p }: ComponentPropsWithoutRef<typeof RTabs.Content>) {
  return <RTabs.Content style={{ padding: '20px 0', animation: 'mdl-fadeup var(--motion-base) var(--ease-decel) both', ...style }} {...p} />;
};
/* styles.css 에 추가:
.tabs .tab[data-state=active]{color:var(--color-accent-700);font-weight:600;box-shadow:inset 0 -2px 0 var(--color-accent),0 2px 0 var(--color-accent)}
.tabs[data-variant=contained] .tab[data-state=active]{color:var(--color-text);background:var(--color-bg);box-shadow:var(--shadow-sm)}
.tabs .tab:focus-visible{outline:2px solid var(--color-accent);outline-offset:-2px} */
