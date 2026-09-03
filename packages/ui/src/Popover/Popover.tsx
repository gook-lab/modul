import * as RPop from '@radix-ui/react-popover';
import * as RMenu from '@radix-ui/react-dropdown-menu';
import { type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cx } from '../utils/cx';

const panel: React.CSSProperties = { background: 'var(--color-surface)', border: '1px solid var(--color-divider)', boxShadow: 'var(--shadow-md)', zIndex: 50, animation: 'mdl-fadeup 160ms var(--ease-decel) both' };

/* ── Popover: 비모달, 포커스 트랩 없음, Esc·바깥 클릭으로 닫힘 ── */
export type PopoverProps = ComponentPropsWithoutRef<typeof RPop.Content> & { trigger: ReactNode; open?: boolean; onOpenChange?: (o: boolean) => void };
export function Popover({ trigger, open, onOpenChange, className, style, children, align = 'start', sideOffset = 4, ...rest }: PopoverProps) {
  return (
    <RPop.Root open={open} onOpenChange={onOpenChange}>
      <RPop.Trigger asChild>{trigger}</RPop.Trigger>
      <RPop.Portal><RPop.Content align={align} sideOffset={sideOffset} className={cx('popover', className)} style={{ ...panel, width: 280, padding: 16, display: 'grid', gap: 12, ...style }} {...rest}>{children}</RPop.Content></RPop.Portal>
    </RPop.Root>
  );
}
Popover.Title = (p: ComponentPropsWithoutRef<'span'>) => <span className="dialog-title" style={{ fontSize: 15 }} {...p} />;

/* ── Menu: roving tabindex, 타입어헤드, 서브메뉴는 RMenu.Sub ── */
export type MenuItem = 'separator' | { label: ReactNode; icon?: ReactNode; kbd?: string; tone?: 'default' | 'danger'; disabled?: boolean; onSelect?: () => void };
export type MenuProps = ComponentPropsWithoutRef<typeof RMenu.Content> & { trigger: ReactNode; items: MenuItem[] };
export function Menu({ trigger, items, className, style, align = 'start', sideOffset = 4, ...rest }: MenuProps) {
  return (
    <RMenu.Root>
      <RMenu.Trigger asChild>{trigger}</RMenu.Trigger>
      <RMenu.Portal>
        <RMenu.Content align={align} sideOffset={sideOffset} className={cx('menu', className)} style={{ ...panel, minWidth: 200, padding: '4px 0', ...style }} {...rest}>
          {items.map((it, i) => it === 'separator'
            ? <RMenu.Separator key={i} style={{ height: 1, background: 'var(--color-divider)', margin: '4px 0' }} />
            : <RMenu.Item key={i} disabled={it.disabled} onSelect={it.onSelect} className="menu-item" style={{ all: 'unset', display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', minHeight: 36, fontSize: 14, cursor: 'pointer', color: it.tone === 'danger' ? 'var(--color-accent-700)' : 'var(--color-text)', opacity: it.disabled ? .45 : 1 }}>
                {it.icon}<span style={{ flex: 1 }}>{it.label}</span>{it.kbd && <span style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>{it.kbd}</span>}
              </RMenu.Item>)}
        </RMenu.Content>
      </RMenu.Portal>
    </RMenu.Root>
  );
}
/* styles.css: .menu-item[data-highlighted]{background:var(--color-neutral-200)} */
