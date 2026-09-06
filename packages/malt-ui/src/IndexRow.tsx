import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cx } from '@gook-lab/ui';
import type { NativeProps } from '@gook-lab/ui';

export type IndexRowProps = NativeProps<'button', { index: number; title: ReactNode; meta?: ReactNode; /** title 아래 두 번째 줄 — StockBadge 등 */ sub?: ReactNode; opacity?: number; onClick?: () => void }>;
/** 번호 붙은 도감 행. onClick 이 있으면 <button>, 없으면 <div>. */
export const IndexRow = forwardRef<HTMLElement, IndexRowProps>(({ index, title, meta, sub, opacity = 1, onClick, className, style, ...rest }, ref) => {
  const content = (<><span className="malt-index-row__no">{String(index).padStart(3, '0')}</span><span className="malt-index-row__title" style={sub ? { display: 'grid', gap: 3, minWidth: 0 } : undefined}><span style={sub ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : undefined}>{title}</span>{sub}</span>{meta !== undefined && <span className="malt-index-row__meta" style={{ whiteSpace: 'nowrap' }}>{meta}</span>}</>);
  const s = { opacity, ...style };
  if (!onClick) return <div ref={ref as React.Ref<HTMLDivElement>} className={cx('malt-index-row', className)} style={s} {...(rest as ComponentPropsWithoutRef<'div'>)}>{content}</div>;
  return <button ref={ref as React.Ref<HTMLButtonElement>} type="button" className={cx('malt-index-row', 'malt-index-row--tappable', className)} style={s} onClick={onClick} {...rest}>{content}</button>;
});
IndexRow.displayName = 'IndexRow';
