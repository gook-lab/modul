import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { useLabels } from '../utils/labels';
import type { NativeProps } from '../utils/polymorphic';

export type SidebarItem = { id: string; label: string; icon?: ReactNode; badge?: ReactNode; href?: string };
export type SidebarOwnProps = {
  items: SidebarItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  collapsed?: boolean;
  onToggle?: () => void;
  brand?: ReactNode;
  /** 항목 렌더 오버라이드 — 라우터 Link 등 */
  renderItem?: (item: SidebarItem, props: ComponentPropsWithoutRef<'button'>) => ReactNode;
};
export type SidebarProps = NativeProps<'nav', SidebarOwnProps>;

/** 접히는 내비 레일. 접히면 아이콘 + title 툴팁, 활성은 좌측 2px 룰. */
export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  ({ items, activeId, onSelect, collapsed = false, onToggle, brand, renderItem, className, style, ...rest }, ref) => { const t = useLabels(); return (
    <nav ref={ref} className={cx('sidebar', className)} data-collapsed={collapsed || undefined}
      style={{ width: collapsed ? 56 : 200, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--color-surface)', borderRight: '2px solid var(--color-divider)', transition: 'width var(--motion-slow) var(--ease-decel)', ...style }} {...rest}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', minHeight: 52, borderBottom: '1px solid var(--color-divider)' }}>
        <span aria-hidden style={{ width: 12, height: 12, background: 'var(--color-accent)', flex: 'none' }} />
        {!collapsed && <span className="nav-brand" style={{ fontSize: 16, whiteSpace: 'nowrap', margin: 0 }}>{brand}</span>}
      </div>
      <div style={{ flex: 1, padding: '8px 0', display: 'grid', gap: 2, alignContent: 'start' }}>
        {items.map(it => {
          const on = it.id === activeId;
          const props: ComponentPropsWithoutRef<'button'> = {
            type: 'button', title: it.label, 'aria-current': on ? 'page' : undefined, onClick: () => onSelect?.(it.id),
            style: { display: 'flex', alignItems: 'center', gap: 12, width: '100%', border: 0, cursor: 'pointer', padding: '10px 16px', minHeight: 44, font: 'inherit', fontSize: 13.5, textAlign: 'left', background: on ? 'var(--color-neutral-200)' : 'transparent', color: on ? 'var(--color-accent-700)' : 'var(--color-text)', boxShadow: on ? 'inset 2px 0 0 var(--color-accent)' : 'none' },
            children: (<>{it.icon}{!collapsed && <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{it.label}</span>}{!collapsed && it.badge != null && <span className="tag tag-accent">{it.badge}</span>}</>),
          };
          return renderItem ? renderItem(it, props) : <button key={it.id} {...props} />;
        })}
      </div>
      {onToggle && (
        <button type="button" onClick={onToggle} aria-label={collapsed ? t('sidebar.expand') : t('sidebar.collapse')} aria-expanded={!collapsed}
          style={{ display: 'flex', alignItems: 'center', gap: 12, border: 0, borderTop: '1px solid var(--color-divider)', cursor: 'pointer', padding: '10px 16px', minHeight: 44, font: 'inherit', fontSize: 12, color: 'var(--color-neutral-700)', background: 'transparent', textAlign: 'left' }}>
          <span aria-hidden style={{ display: 'inline-block', transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform var(--motion-slow)' }}>‹</span>
          {!collapsed && t('sidebar.collapse')}
        </button>
      )}
    </nav>
  ); },
);
Sidebar.displayName = 'Sidebar';
