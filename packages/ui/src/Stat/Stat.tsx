import { forwardRef } from 'react';
import { cx, cssVar } from '../utils/cx';
import type { NativeProps } from '../utils/polymorphic';

export type StatProps = NativeProps<'div', { label: string; value: number | string; unit?: string; tone?: 'ink' | 'accent'; delta?: { value: string; period?: string; direction: 'up' | 'down' | 'flat' }; sparkline?: number[]; decimals?: number }>;
/** KPI. 숫자는 tabular. 추세는 색+화살표+텍스트(색만으로 전하지 않음). */
export const Stat = forwardRef<HTMLDivElement, StatProps>(({ label, value, unit, tone = 'ink', delta, sparkline, decimals = 0, className, ...rest }, ref) => {
  const up = delta?.direction === 'up';
  const pts = sparkline && (() => { const mn = Math.min(...sparkline), mx = Math.max(...sparkline); return sparkline.map((v, k) => `${(k / (sparkline.length - 1)) * 100},${26 - ((v - mn) / (mx - mn || 1)) * 24}`).join(' '); })();
  return (
    <div ref={ref} className={cx('stat', className)} style={{ padding: '20px 22px 22px', display: 'grid', gap: 10, alignContent: 'start', background: 'var(--color-bg)' }} {...rest}>
      <span style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-neutral-700)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: cssVar('--font-heading-weight'), fontSize: 36, lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', color: tone === 'accent' ? 'var(--color-accent)' : 'var(--color-text)' }}>
        {typeof value === 'number' ? value.toLocaleString('ko-KR', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }) : value}{unit && <span style={{ fontSize: '.5em', color: 'var(--color-neutral-700)', marginLeft: 2 }}>{unit}</span>}
      </span>
      {delta && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: up ? 'var(--color-accent-700)' : 'var(--color-neutral-700)' }}><span aria-hidden style={{ fontSize: 10 }}>{up ? '▲' : delta.direction === 'down' ? '▼' : '—'}</span><span className="sr-only">{up ? '증가' : '감소'}</span>{delta.value}{delta.period && <span style={{ color: 'var(--color-neutral-700)' }}>· {delta.period}</span>}</span>}
      {pts && <svg aria-hidden viewBox="0 0 100 28" preserveAspectRatio="none" style={{ width: '100%', height: 28, display: 'block', marginTop: 4 }}><polyline points={pts} fill="none" stroke={up ? 'var(--color-accent)' : 'var(--color-neutral-500)'} strokeWidth="1.5" vectorEffect="non-scaling-stroke" /></svg>}
    </div>
  );
});
Stat.displayName = 'Stat';
