import { forwardRef } from 'react';
import { cx } from '../utils/cx';
import type { NativeProps } from '../utils/polymorphic';
import { useLabels } from '../utils/labels';

export type Step = { id: string; label: string; optional?: boolean };
export type StepperProps = NativeProps<'nav', { steps: Step[]; current: number; onStepChange?: (i: number) => void; variant?: 'bar' | 'dots'; linear?: boolean }>;

/** 다단계 폼 진행. bar = bottling StepBar 규격(상단 2px). dots = 클릭 가능한 단계 목록. linear 면 지난 단계만 되돌아감 */
export const Stepper = forwardRef<HTMLElement, StepperProps>(({ steps, current, onStepChange, variant = 'bar', linear = true, className, ...rest }, ref) => {
  const t = useLabels();
  const total = steps.length;
  if (variant === 'bar') return (
    <nav ref={ref} className={cx('stepper', className)} style={{ display: 'grid', gap: 10 }} {...rest}>
      <div role="progressbar" aria-label={t('stepper.progress')} aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={total} aria-valuetext={steps[current]?.label} style={{ height: 2, background: 'var(--color-neutral-300)' }}><span style={{ display: 'block', height: 2, width: `${((current + 1) / total) * 100}%`, background: 'var(--color-accent)', transition: 'width 180ms ease' }} /></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-neutral-700)', fontVariantNumeric: 'tabular-nums' }}><span>{current + 1} / {total} · {steps[current]?.label}</span><span>{steps[current + 1] ? t('stepper.next', { label: steps[current + 1].label }) : t('stepper.last')}</span></div>
    </nav>
  );
  return (
    <nav ref={ref} className={cx('stepper', className)} {...rest}>
      <ol style={{ display: 'flex', gap: 2, listStyle: 'none', margin: 0, padding: 0 }}>
        {steps.map((s, k) => { const done = k < current, on = k === current, locked = linear && k > current; return (
          <li key={s.id} aria-current={on ? 'step' : undefined} style={{ flex: 1, display: 'grid', gap: 8 }}>
            <button type="button" disabled={locked || !onStepChange} onClick={() => onStepChange?.(k)} style={{ all: 'unset', display: 'flex', alignItems: 'center', gap: 8, cursor: locked ? 'default' : 'pointer', color: on ? 'var(--color-text)' : locked ? 'var(--color-neutral-500)' : 'var(--color-neutral-700)', minHeight: 24 }}>
              <span aria-hidden style={{ width: 20, height: 20, display: 'grid', placeItems: 'center', flex: 'none', fontSize: 11, fontWeight: 600, background: done || on ? 'var(--color-accent)' : 'transparent', color: done || on ? 'var(--color-bg)' : 'var(--color-neutral-700)', border: `1.5px solid ${done || on ? 'var(--color-accent)' : 'var(--color-divider)'}` }}>{done ? '✓' : k + 1}</span>
              <span style={{ fontSize: 13, fontWeight: on ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}{s.optional && <span style={{ color: 'var(--color-neutral-500)' }}> (선택)</span>}</span>
            </button>
            <span aria-hidden style={{ height: 2, background: done || on ? 'var(--color-accent)' : 'var(--color-neutral-300)' }} />
          </li>); })}
      </ol>
    </nav>
  );
});
Stepper.displayName = 'Stepper';
