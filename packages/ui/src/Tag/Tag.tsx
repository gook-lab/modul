import type { ElementType } from 'react';
import { cx } from '../utils/cx';
import { Slot } from '../utils/Slot';
import { polyForwardRef } from '../utils/polymorphic';
import type { PolymorphicProps, PolymorphicRef } from '../utils/polymorphic';

export type TagOwnProps = { variant?: 'accent' | 'neutral' | 'outline'; asChild?: boolean };
export type TagProps<C extends ElementType = 'span'> = PolymorphicProps<C, TagOwnProps>;

export const Tag = polyForwardRef<'span', TagOwnProps>(function Tag<C extends ElementType = 'span'>(
  { as, asChild, variant = 'accent', className, ...rest }: TagProps<C>, ref: PolymorphicRef<C>,
) {
  const Comp: ElementType = asChild ? Slot : (as ?? 'span');
  return <Comp ref={ref} className={cx('tag', `tag-${variant}`, className)} {...rest} />;
});
Tag.displayName = 'Tag';
