import type { ComponentPropsWithoutRef, CSSProperties } from 'react';
import { useLabels } from '@modul/ui';

const shimmer: CSSProperties = {
  background: 'linear-gradient(90deg, var(--color-neutral-200) 25%, var(--color-neutral-300) 50%, var(--color-neutral-200) 75%)',
  backgroundSize: '200% 100%', animation: 'mdl-shimmer 1.4s linear infinite',
};
export type SkeletonProps = { width?: number | string; height?: number | string } & ComponentPropsWithoutRef<'div'>;
export function Skeleton({ width = '100%', height = 12, style, ...rest }: SkeletonProps) {
  return <div aria-hidden style={{ width, height, ...shimmer, ...style }} {...rest} />;
}
Skeleton.Card = function SkeletonCard({ lines = 3, ...rest }: { lines?: number } & ComponentPropsWithoutRef<'div'>) {
  return (
    <div aria-busy style={{ display: 'grid', gap: 12, padding: 16, background: 'var(--color-surface)' }} {...rest}>
      <Skeleton height={140} />
      {Array.from({ length: lines }, (_, i) => <Skeleton key={i} width={`${[40, 80, 60][i % 3]}%`} height={i === 1 ? 18 : 12} />)}
    </div>
  );
};

export type SpinnerProps = { variant?: 'ring' | 'square'; size?: number } & ComponentPropsWithoutRef<'span'>;
export function Spinner({ variant = 'ring', size = 24, style, ...rest }: SpinnerProps) {
  const base: CSSProperties = { display: 'block', width: size, height: size };
  const s: CSSProperties = variant === 'ring'
    ? { ...base, border: '3px solid var(--color-neutral-300)', borderTopColor: 'var(--color-accent)', animation: 'mdl-spin .9s linear infinite' }
    : { ...base, background: 'var(--color-accent)', animation: 'mdl-spin 1.2s var(--ease-inout) infinite' };
  return <span role="status" style={{ ...s, ...style }} {...rest} />;
}

export function Progress({ value, style, ...rest }: { value: number } & ComponentPropsWithoutRef<'div'>) {
  const t = useLabels();
  return (
    // aria-label 은 rest 앞에 둡니다 — 소비자가 준 값이 이깁니다. 이름 없는 progressbar 는 axe aria-progressbar-name 위반입니다.
    <div role="progressbar" aria-label={t('progress.label')} aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100} style={{ height: 2, background: 'var(--color-neutral-300)', ...style }} {...rest}>
      <div style={{ height: 2, background: 'var(--color-accent)', width: `${value * 100}%`, transition: 'width var(--motion-slow) var(--ease-decel)' }} />
    </div>
  );
}

const rowW = [92, 70, 84, 60, 76];
Skeleton.Text = function SkeletonText({ lines = 3, ...rest }: { lines?: number } & ComponentPropsWithoutRef<'div'>) {
  return <div aria-busy style={{ display: 'grid', gap: 8 }} {...rest}>{Array.from({ length: lines }, (_, i) => <Skeleton key={i} width={`${rowW[i % 5]}%`} />)}</div>;
};
Skeleton.List = function SkeletonList({ rows = 3, avatar = true, ...rest }: { rows?: number; avatar?: boolean } & ComponentPropsWithoutRef<'div'>) {
  return <div aria-busy {...rest}>{Array.from({ length: rows }, (_, i) => <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-divider)' }}>{avatar && <Skeleton width={32} height={32} />}<div style={{ flex: 1, display: 'grid', gap: 6 }}><Skeleton width={`${rowW[i % 5]}%`} /><Skeleton width="30%" height={10} /></div><Skeleton width={48} height={10} /></div>)}</div>;
};
Skeleton.Table = function SkeletonTable({ rows = 5, cols = 4, ...rest }: { rows?: number; cols?: number } & ComponentPropsWithoutRef<'div'>) {
  const grid = { display: 'grid', gridTemplateColumns: `2fr repeat(${cols - 1}, 1fr)`, gap: 16, padding: 12 } as CSSProperties;
  return <div aria-busy style={{ border: '1px solid var(--color-divider)' }} {...rest}><div style={{ ...grid, padding: '10px 12px', borderBottom: '2px solid var(--color-divider)' }}>{Array.from({ length: cols }, (_, c) => <span key={c} style={{ height: 8, width: '55%', background: 'var(--color-neutral-300)' }} />)}</div>{Array.from({ length: rows }, (_, i) => <div key={i} style={{ ...grid, borderBottom: '1px solid var(--color-divider)' }}>{Array.from({ length: cols }, (_, c) => <Skeleton key={c} width={`${c === 0 ? rowW[i % 5] : 40 + (c * 17) % 40}%`} />)}</div>)}</div>;
};
/* reduced-motion: styles.css 의 .mdl-motion 규칙이 시머 애니메이션을 1ms 로 줄인다 */
