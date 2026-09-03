import { forwardRef } from 'react';
import { cx } from '@modul/ui';
import type { NativeProps } from '@modul/ui';

export type StockStatus = 'IN_STOCK' | 'LOW' | 'SOLD_OUT' | 'PRICE_ONLY';
export type StockBadgeProps = NativeProps<'span', { status: StockStatus; label: string }>;
const MOD: Record<StockStatus, string> = { IN_STOCK: 'malt-stock--in', LOW: 'malt-stock--low', SOLD_OUT: 'malt-stock--out', PRICE_ONLY: 'malt-stock--price' };

/** 초록·노랑은 여기 전용. 색만으로 뜻을 전하지 않는다 — 글자가 같이 있다. */
export const StockBadge = forwardRef<HTMLSpanElement, StockBadgeProps>(({ status, label, className, ...rest }, ref) => (
  <span ref={ref} className={cx('malt-stock', MOD[status], className)} {...rest}>
    <span className="malt-stock__dot" aria-hidden="true" />{label}
  </span>
));
StockBadge.displayName = 'StockBadge';
