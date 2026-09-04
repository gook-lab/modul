import * as RPop from '@radix-ui/react-popover';
import { DayPicker, type DateRange, type Matcher } from 'react-day-picker';
import { ko } from 'date-fns/locale';
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import type { NativeProps } from '../utils/polymorphic';

type Single = { mode?: 'single'; value: Date | null; onChange: (d: Date | null) => void };
type Range = { mode: 'range'; value: DateRange | null; onChange: (r: DateRange | null) => void };
export type DatePickerProps = NativeProps<'button', (Single | Range) & { label?: ReactNode; withTime?: boolean; time?: string; onTimeChange?: (t: string) => void; min?: Date; max?: Date; placeholder?: string; fieldProps?: ComponentPropsWithoutRef<'div'> }>;
/** 구현 내부용 평탄화 타입. 공개 계약은 DatePickerProps 의 판별 유니온이고 mode 분기는 런타임에서 합니다. */
type DatePickerRuntimeProps = NativeProps<'button', {
  mode?: 'single' | 'range';
  value: Date | DateRange | null;
  onChange: (v: Date | DateRange | null) => void;
  label?: ReactNode; withTime?: boolean; time?: string; onTimeChange?: (t: string) => void;
  min?: Date; max?: Date; placeholder?: string; fieldProps?: ComponentPropsWithoutRef<'div'>;
}>;
/** min/max 는 둘 다 선택이라 배열에서 falsy 를 걸러낸다 — 걸러낸 뒤 타입은 Matcher[] 다. */
const range = (min?: Date, max?: Date): Matcher[] =>
  [min && { before: min }, max && { after: max }].filter(Boolean) as Matcher[];
const fmt = (d?: Date | null) => d ? `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}` : '';

/** Radix Popover + react-day-picker (달력 격자 · 키보드 · 로케일). 시간은 네이티브 <input type=time>. 클래스 .calendar 는 bottling .malt-calendar 와 동일 규격 */
export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>((props, ref) => {
  // mode·value·onChange 도 함께 빼야 한다 — rest 에 남으면 <button> 으로 새어 DOM 경고가 난다.
  const { mode, value, onChange, label, withTime, time, onTimeChange, min, max, placeholder, fieldProps, className, ...rest } =
    props as DatePickerRuntimeProps;
  const isRange = mode === 'range';
  const asRange = value as DateRange | null;
  const text = isRange
    ? (asRange?.from ? `${fmt(asRange.from)} → ${fmt(asRange.to) || '…'}` : '')
    : fmt(value as Date | null);
  return (
    <div {...fieldProps} className={cx('field', fieldProps?.className)}>
      {label && <label>{label}</label>}
      <div style={{ display: 'flex', gap: 8 }}>
        <RPop.Root>
          <RPop.Trigger asChild>
            <button ref={ref} type="button" className={cx('input', className)} style={{ display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', cursor: 'pointer', flex: 1 }} {...rest}>
              <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--color-neutral-700)' }}><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4"/><path d="M3 10h18"/></svg>
              <span style={{ flex: 1, fontVariantNumeric: 'tabular-nums', color: text ? undefined : 'var(--color-neutral-700)' }}>{text || placeholder || (isRange ? '기간 선택' : '날짜 선택')}</span>
            </button>
          </RPop.Trigger>
          <RPop.Portal>
            <RPop.Content align="start" sideOffset={4} className="calendar-popover" style={{ zIndex: 50, padding: 12, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', boxShadow: 'var(--shadow-md)' }}>
              {isRange
                ? <DayPicker mode="range" locale={ko} selected={asRange ?? undefined} onSelect={r => onChange(r ?? null)} disabled={range(min, max)} className="calendar" />
                : <DayPicker mode="single" locale={ko} selected={(value as Date | null) ?? undefined} onSelect={d => onChange(d ?? null)} disabled={range(min, max)} className="calendar" />}
            </RPop.Content>
          </RPop.Portal>
        </RPop.Root>
        {withTime && <input type="time" className="input" value={time} onChange={e => onTimeChange?.(e.target.value)} aria-label="시간" style={{ flex: '0 0 116px' }} />}
      </div>
    </div>
  );
});
DatePicker.displayName = 'DatePicker';
/* styles.css — .calendar: bottling styles.css 의 .malt-calendar 블록을 토큰 이름만 바꿔 그대로 (rdp-accent-color: var(--color-accent), 34px 셀, pill 은 Malt 테마에서만) */
