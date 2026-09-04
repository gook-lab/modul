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
      {/* children 은 임의의 내용이라 <p> 로 감싸면 안 됩니다 — 블록 요소가 들어오면
          브라우저가 <p> 를 강제로 닫아 DOM 구조가 무너집니다(Storybook 10 이전 중 실측). */}
      {children && <div className="card-body">{children}</div>}
      {meta && <span className="card-meta">{meta}</span>}
    </article>
  ),
);
Card.displayName = 'Card';
