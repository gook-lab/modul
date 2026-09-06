import { forwardRef, useId, type ComponentPropsWithoutRef } from 'react';
import { cx } from '@gook-lab/ui';

export type NumberFieldProps = {
  value: number | '';
  onChange: (v: number | '') => void;
  min?: number; max?: number; step?: number;
  suffix?: string;
  'aria-label': string;
  /** 래퍼 div 로 전달 */
  fieldProps?: ComponentPropsWithoutRef<'div'>;
} & Omit<ComponentPropsWithoutRef<'input'>, 'value' | 'onChange' | 'min' | 'max' | 'step' | 'type'>;

/** 기본 스피너(10px) 대신 44px − / + 버튼. 입력칸은 그대로 — 키보드로 바로 친다. */
export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  ({ value, onChange, min, max, step = 1, suffix, 'aria-label': label, fieldProps, id, disabled, className, ...rest }, ref) => {
    const auto = useId(); const inputId = id ?? auto;
    const cur = value === '' ? (min ?? 0) : value;
    const atMin = min !== undefined && cur <= min, atMax = max !== undefined && cur >= max;
    const nudge = (d: number) => { const n = cur + d; if ((min !== undefined && n < min) || (max !== undefined && n > max)) return; onChange(n); };
    return (
      <div {...fieldProps} className={cx('malt-numberfield', fieldProps?.className)}>
        <button type="button" className="malt-numberfield__step" onClick={() => nudge(-step)} disabled={disabled || atMin} aria-label={atMin ? `${label} — 가장 작은 값입니다` : `${label} 줄이기`}>−</button>
        <input ref={ref} id={inputId} type="number" inputMode="numeric" className={cx('malt-numberfield__input', className)} aria-label={label} disabled={disabled} value={value} min={min} max={max} step={step}
          onChange={e => { const raw = e.target.value; if (raw === '') return onChange(''); const n = Number(raw); if (!Number.isNaN(n)) onChange(n); }} {...rest} />
        {suffix !== undefined && <span className="malt-numberfield__suffix malt-mono">{suffix}</span>}
        <button type="button" className="malt-numberfield__step" onClick={() => nudge(step)} disabled={disabled || atMax} aria-label={atMax ? `${label} — 가장 큰 값입니다` : `${label} 늘리기`}>+</button>
      </div>
    );
  },
);
NumberField.displayName = 'NumberField';
