import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cx } from '@modul/ui';

export type ChipOption<V extends string> = { value: V; label: string };
export type ChipGroupProps<V extends string> = {
  label: string;
  options: ChipOption<V>[];
  type?: 'single';
  value: V | '';
  onChange: (v: V | '') => void;
} & Omit<ComponentPropsWithoutRef<'div'>, 'onChange'>;

/** 44px pill 칩, 단일 선택. role=group + aria-pressed. (Radix ToggleGroup 대체 가능) */
function ChipGroupInner<V extends string>({ label, options, value, onChange, className, ...rest }: ChipGroupProps<V>, ref: React.Ref<HTMLDivElement>) {
  return (
    <div ref={ref} role="group" aria-label={label} className={cx('malt-chip-group', className)} {...rest}>
      {options.map(o => {
        const on = o.value === value;
        return <button key={o.value} type="button" aria-pressed={on} className={cx('malt-chip', on && 'malt-chip--selected')} onClick={() => onChange(on ? '' : o.value)}>{o.label}</button>;
      })}
    </div>
  );
}
export const ChipGroup = forwardRef(ChipGroupInner) as <V extends string>(p: ChipGroupProps<V> & { ref?: React.Ref<HTMLDivElement> }) => React.ReactElement;
