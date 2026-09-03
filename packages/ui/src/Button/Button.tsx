import type { ElementType, ReactNode } from 'react';
import { cx } from '../utils/cx';
import { Slot } from '../utils/Slot';
import { polyForwardRef } from '../utils/polymorphic';
import type { PolymorphicProps, PolymorphicRef } from '../utils/polymorphic';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonTone = 'default' | 'danger';
export type ButtonRounded = 'none' | 'sm' | 'md' | 'pill';
export type ButtonOwnProps = {
  variant?: ButtonVariant;
  /** danger 는 파괴 동작에만 — 삭제·탈퇴 */
  tone?: ButtonTone;
  size?: ButtonSize;
  /** 기본은 토큰(--radius-md: Modernist 0, Malt 2px). 명시하면 덮어씀. pill 은 칩·FAB 성격에만 */
  rounded?: ButtonRounded;
  iconPosition?: 'start' | 'end';
  loading?: boolean;
  /** 라벨 뒤 (flush-left 규칙: 라벨 → 아이콘) */
  icon?: ReactNode;
  block?: boolean;
  /** 자식 엘리먼트에 병합 (Next Link 등) */
  asChild?: boolean;
};
export type ButtonProps<C extends ElementType = 'button'> = PolymorphicProps<C, ButtonOwnProps>;

export const Button = polyForwardRef<'button', ButtonOwnProps>(function Button<C extends ElementType = 'button'>(
  { as, asChild, variant = 'primary', tone = 'default', size = 'md', rounded, icon, iconPosition = 'end', block, loading, className, style, children, ...rest }: ButtonProps<C>,
  ref: PolymorphicRef<C>,
) {
  const Comp: ElementType = asChild ? Slot : (as ?? 'button');
  const native = Comp === 'button' ? { type: 'button' as const, disabled: (rest as { disabled?: boolean }).disabled || loading } : {};
  const R = { none: 'var(--radius-md)', sm: 4, md: 8, pill: 999 };
  return (
    <Comp
      ref={ref}
      {...native}
      aria-busy={loading || undefined}
      className={cx('btn', `btn-${variant}`, tone !== 'default' && `btn-${tone}`, size !== 'md' && `btn-${size}`, block && 'btn-block', className)}
      style={{ ...(rounded ? { borderRadius: R[rounded] } : null), ...style }}
      {...rest}
    >
      {/* asChild 는 소비자 엘리먼트 하나에 props 를 병합하는 모드입니다. Slot 이 Children.only 를 쓰므로
          loading·icon 을 함께 넘기면 "React.Children.only expected to receive a single React element child" 로 깨집니다.
          그 두 장식은 소비자 엘리먼트 안에 직접 넣어 주세요. */}
      {asChild ? children : <>
        {loading && <span aria-hidden style={{ width: 12, height: 12, border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', animation: 'mdl-spin .7s linear infinite', display: 'inline-block' }} />}
        {iconPosition === 'start' && icon}
        {children}
        {iconPosition === 'end' && icon}
      </>}
    </Comp>
  );
});
Button.displayName = 'Button';
