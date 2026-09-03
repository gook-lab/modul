import * as RSlider from '@radix-ui/react-slider';
import { type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cx } from '../utils/cx';

export type SliderProps = Omit<ComponentPropsWithoutRef<typeof RSlider.Root>, 'value' | 'onValueChange'> & { label: ReactNode; value: number[]; onValueChange: (v: number[]) => void; unit?: string; format?: (v: number) => string; ticks?: boolean | number; range?: boolean };

/** Radix Slider — 키보드(←→ Shift PgUp Home End), 포인터, RTL, minStepsBetweenThumbs. 트랙 2px, 손잡이 16px 사각 */
export function Slider({ label, value, onValueChange, unit = '', format, ticks, range, min = 0, max = 100, step = 1, className, ...rest }: SliderProps) {
  const f = format ?? ((v: number) => `${v}${unit}`);
  const n = ticks === true ? 5 : ticks || 0;
  return (
    <div className={cx('field', 'slider', className)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}><label style={{ margin: 0 }}>{label}</label><span style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums', color: 'var(--color-accent-700)' }}>{value.map(f).join(' – ')}</span></div>
      <RSlider.Root value={value} onValueChange={onValueChange} min={min} max={max} step={step} minStepsBetweenThumbs={range ? 1 : 0} style={{ position: 'relative', display: 'flex', alignItems: 'center', height: 24, userSelect: 'none', touchAction: 'none' }} {...rest}>
        <RSlider.Track style={{ position: 'relative', flex: 1, height: 2, background: 'var(--color-neutral-300)' }}><RSlider.Range style={{ position: 'absolute', height: '100%', background: 'var(--color-accent)' }} /></RSlider.Track>
        {n > 0 && Array.from({ length: n }, (_, k) => <span key={k} aria-hidden style={{ position: 'absolute', top: 'calc(50% + 6px)', left: `${(k / (n - 1)) * 100}%`, width: 1, height: 4, background: 'var(--color-neutral-400)', transform: 'translateX(-50%)' }} />)}
        {value.map((v, i) => <RSlider.Thumb key={i} aria-label={`${typeof label === 'string' ? label : ''}${range ? (i === 0 ? ' 최소' : ' 최대') : ''}`} aria-valuetext={f(v)} className="slider-thumb" style={{ display: 'block', width: 16, height: 16, background: range && i === 0 ? 'var(--color-bg)' : 'var(--color-accent)', border: '2px solid var(--color-accent)', boxShadow: 'var(--shadow-sm)', cursor: 'grab' }} />)}
      </RSlider.Root>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--color-neutral-700)', fontVariantNumeric: 'tabular-nums', marginTop: 6 }}><span>{f(min)}</span><span>{f(max)}</span></div>
    </div>
  );
}
/* styles.css: .slider-thumb:focus-visible{outline:2px solid var(--color-accent);outline-offset:2px} */
