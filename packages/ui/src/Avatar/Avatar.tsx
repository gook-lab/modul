import { forwardRef } from 'react';
import { cx, cssVar } from '../utils/cx';
import type { NativeProps } from '../utils/polymorphic';
import { useLabels } from '../utils/labels';

const SIZE = { xs: 24, sm: 32, md: 40, lg: 56 };
export type AvatarProps = NativeProps<'span', { name: string; src?: string | null; size?: keyof typeof SIZE | number; /** 기본 circle(rounded-full). square 는 로고·팀 마크용 */ shape?: 'square' | 'circle'; status?: 'online' | 'busy' }>;
const initials = (n: string) => /[가-힣]/.test(n) ? n[0] : n.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(({ name, src, size = 'md', shape = 'circle', status, className, style, ...rest }, ref) => {
  const px = typeof size === 'number' ? size : SIZE[size]; const r = shape === 'square' ? 0 : 'var(--radius-avatar)';
  return (
    <span ref={ref} role="img" aria-label={name} className={cx('avatar', className)} style={{ position: 'relative', width: px, height: px, display: 'inline-grid', placeItems: 'center', flex: 'none', background: 'var(--color-neutral-300)', color: 'var(--color-neutral-800)', borderRadius: r, overflow: 'visible', fontFamily: 'var(--font-heading)', fontWeight: cssVar('--font-heading-weight'), fontSize: px * .4, ...style }} {...rest}>
      {src ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: r, filter: 'grayscale(1) contrast(1.08)' }} /> : <span aria-hidden>{initials(name)}</span>}
      {status && <span aria-hidden style={{ position: 'absolute', right: -2, bottom: -2, width: px * .3, height: px * .3, background: status === 'online' ? 'var(--color-accent)' : 'var(--color-neutral-500)', border: '2px solid var(--color-bg)', borderRadius: r }} />}
    </span>
  );
});
Avatar.displayName = 'Avatar';

export type AvatarGroupProps = NativeProps<'div', { people: { name: string; src?: string | null }[]; max?: number; size?: AvatarProps['size']; shape?: AvatarProps['shape'] }>;
export function AvatarGroup({ people, max = 4, size = 'sm', shape = 'circle', className, ...rest }: AvatarGroupProps) {
  const t = useLabels();
  const shown = people.slice(0, max), rest_ = people.length - shown.length; const px = typeof size === 'number' ? size : SIZE[size];
  return (
    <div role="group" aria-label={t('avatar.group', { n: people.length })} className={cx('avatar-group', className)} style={{ display: 'flex', alignItems: 'center' }} {...rest}>
      {shown.map((p, k) => <Avatar key={p.name + k} {...p} size={size} shape={shape} style={{ border: '2px solid var(--color-bg)', marginLeft: k ? -px * .25 : 0 }} />)}
      {rest_ > 0 && <span aria-label={t('avatar.more', { n: rest_ })} style={{ width: px, height: px, display: 'grid', placeItems: 'center', background: 'var(--color-text)', color: 'var(--color-bg)', fontSize: px * .36, fontWeight: 600, border: '2px solid var(--color-bg)', marginLeft: -px * .25, borderRadius: shape === 'square' ? 0 : 'var(--radius-avatar)', fontVariantNumeric: 'tabular-nums' }}>+{rest_}</span>}
    </div>
  );
}
