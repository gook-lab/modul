import { Children, type ElementType } from 'react';
import { polyForwardRef } from '@modul/ui';
import type { PolymorphicProps, PolymorphicRef } from '@modul/ui';

export type RevealOwnProps = {
  split?: 'none' | 'char' | 'word' | 'line';
  /** ms 간격 */
  stagger?: number;
  delay?: number;
  duration?: number;
  from?: 'bottom' | 'left';
};
export type RevealProps<C extends ElementType = 'div'> = PolymorphicProps<C, RevealOwnProps>;

/** 텍스트 리빌. split 시 문자열 자식을 span 으로 분할, overflow:hidden 마스크 안에서 올라옴. */
export const Reveal = polyForwardRef<'div', RevealOwnProps>(function Reveal<C extends ElementType = 'div'>(
  { as, split = 'none', stagger = 30, delay = 0, duration = 700, from = 'bottom', style, children, ...rest }: RevealProps<C>,
  ref: PolymorphicRef<C>,
) {
  const Comp: ElementType = as ?? 'div';
  const ease = 'var(--ease-decel)';
  if (from === 'left') {
    return <Comp ref={ref} style={{ transformOrigin: 'left', animation: `mdl-line ${duration}ms ${ease} ${delay}ms both`, ...style }} {...rest}>{children}</Comp>;
  }
  if (split === 'none') {
    return <Comp ref={ref} style={{ animation: `mdl-fadeup ${duration}ms ${ease} ${delay}ms both`, ...style }} {...rest}>{children}</Comp>;
  }
  const text = Children.toArray(children).join('');
  const parts = split === 'char' ? [...text] : split === 'word' ? text.split(/(\s+)/) : text.split('\n');
  return (
    <Comp ref={ref} style={{ display: 'flex', flexWrap: 'wrap', ...style }} aria-label={text} {...rest}>
      {parts.map((p, i) => (
        <span key={i} aria-hidden style={{ display: 'inline-block', overflow: 'hidden', paddingBottom: '.08em' }}>
          <span style={{ display: 'inline-block', whiteSpace: 'pre', animation: `mdl-char ${duration}ms ${ease} ${delay + i * stagger}ms both` }}>{p}</span>
        </span>
      ))}
    </Comp>
  );
});
