import { forwardRef, useEffect, useRef, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { useLabels } from '../utils/labels';
import { mergeRefs } from '../utils/Slot';
import type { NativeProps } from '../utils/polymorphic';

export type DrawerOwnProps = {
  open: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
  width?: 'sm' | 'md' | 'lg' | number;
  title?: ReactNode;
  footer?: ReactNode;
};
export type DrawerProps = NativeProps<'dialog', DrawerOwnProps>;
const W = { sm: 280, md: 360, lg: 480 };

/** 측면 패널. 네이티브 <dialog> 로 포커스 트랩·Esc·복귀를 브라우저에 맡깁니다. */
export const Drawer = forwardRef<HTMLDialogElement, DrawerProps>(
  ({ open, onClose, side = 'right', width = 'md', title, footer, className, style, children, ...rest }, ref) => {
    const t = useLabels(); const inner = useRef<HTMLDialogElement>(null);
    useEffect(() => { const d = inner.current; if (!d) return; if (open && !d.open) d.showModal(); else if (!open && d.open) d.close(); }, [open]);
    const w = typeof width === 'number' ? width : W[width];
    return (
      // 백드롭 클릭으로 닫기. 키보드 닫기(Esc)·포커스 트랩·복귀는 showModal() 이 브라우저에 맡긴 동작이라
      // 별도 키 핸들러를 달면 중복 동작이 됩니다.
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
      <dialog
        ref={mergeRefs(ref, inner)}
        className={cx('drawer', className)}
        onClose={onClose}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        style={{
          position: 'fixed', inset: 0, margin: 0, border: 0, padding: 0, maxWidth: 'none', maxHeight: 'none', width: '100vw', height: '100vh', background: 'transparent',
          ...style,
        }}
        {...rest}
      >
        <aside style={{
          position: 'absolute', top: 0, bottom: 0, [side]: 0, width: w, display: 'flex', flexDirection: 'column',
          background: 'var(--color-surface)', boxShadow: 'var(--shadow-lg)',
          animation: `mdl-drawer-${side === 'left' ? 'l' : 'r'} var(--motion-slow) var(--ease-decel) both`,
        }}>
          {title && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '2px solid var(--color-divider)' }}>
              <span className="dialog-title" style={{ flex: 1, fontSize: 18 }}>{title}</span>
              <button type="button" className="btn btn-secondary btn-icon" aria-label={t('common.close')} onClick={onClose}>×</button>
            </div>
          )}
          <div style={{ flex: 1, overflow: 'auto', padding: 20, display: 'grid', gap: 16, alignContent: 'start' }}>{children}</div>
          {footer && <div style={{ display: 'flex', gap: 8, padding: '16px 20px', borderTop: '1px solid var(--color-divider)' }}>{footer}</div>}
        </aside>
      </dialog>
    );
  },
);
Drawer.displayName = 'Drawer';
