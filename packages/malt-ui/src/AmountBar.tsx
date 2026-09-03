import { forwardRef } from 'react';
import { cx } from '@modul/ui';
import type { NativeProps } from '@modul/ui';

export type AmountBarProps = NativeProps<'span', { percent: number; low?: boolean; label: string }>;
/** 잔량. low(1/4 이하) 는 clay, 그 외 중립. 판정은 @malt/domain 이 한다. */
export const AmountBar = forwardRef<HTMLSpanElement, AmountBarProps>(({ percent, low = false, label, className, ...rest }, ref) => {
  const w = Math.max(0, Math.min(100, percent));
  return (
    <span ref={ref} className={cx('malt-amount-bar', className)} {...rest}>
      <span className="malt-amount-bar__track" aria-hidden="true"><span className={cx('malt-amount-bar__fill', low && 'malt-amount-bar__fill--low')} style={{ width: `${w}%` }} /></span>
      <span className="malt-amount-bar__label">{label}</span>
    </span>
  );
});
AmountBar.displayName = 'AmountBar';
