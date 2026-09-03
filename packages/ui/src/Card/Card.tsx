import { forwardRef, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import type { NativeProps } from '../utils/polymorphic';

export type CardOwnProps = {
  kicker?: ReactNode;
  title?: ReactNode;
  meta?: ReactNode;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
};
export type CardProps = NativeProps<'article', CardOwnProps>;

export const Card = forwardRef<HTMLElement, CardProps>(
  ({ kicker, title, meta, elevation = 'none', className, children, ...rest }, ref) => (
    <article ref={ref} className={cx('card', elevation !== 'none' && `elev-${elevation}`, className)} {...rest}>
      {kicker && <span className="card-kicker">{kicker}</span>}
      {title && <span className="card-title">{title}</span>}
      {children && <p className="card-body">{children}</p>}
      {meta && <span className="card-meta">{meta}</span>}
    </article>
  ),
);
Card.displayName = 'Card';
