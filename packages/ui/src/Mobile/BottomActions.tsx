import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cx } from '../utils/cx';
/** 고정 하단 액션 바. 첫 자식이 primary(flex:1). safe-area 반영. 콘텐츠엔 padding-bottom 88 을 준다 */
export const BottomActions = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(({ className, style, children, ...rest }, ref) => (
  <div ref={ref} className={cx('bottom-actions', className)} style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 10, display: 'flex', gap: 8, padding: '12px 20px calc(16px + env(safe-area-inset-bottom))', background: 'var(--color-surface)', borderTop: '1px solid var(--color-divider)', ...style }} {...rest}>{children}</div>
));
BottomActions.displayName = 'BottomActions';
/* components.css: .bottom-actions > .btn{min-height:44px} .bottom-actions > .btn:first-child{flex:1} */
