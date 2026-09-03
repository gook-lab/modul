import * as RCheckbox from '@radix-ui/react-checkbox';
import * as RRadio from '@radix-ui/react-radio-group';
import { forwardRef, useId, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cx } from '../utils/cx';

/* 동작은 Radix (roving tabindex, indeterminate, 폼 연동). 모양은 토큰. */
type Layout = 'stack' | 'inline' | 'cards';
const row = (layout: Layout, on: boolean, disabled?: boolean): React.CSSProperties => ({
  display: 'flex', alignItems: 'flex-start', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .45 : 1,
  padding: layout === 'cards' ? 14 : 0, minHeight: layout === 'cards' ? 44 : undefined,
  border: layout === 'cards' ? `1px solid ${on ? 'var(--color-accent)' : 'var(--color-divider)'}` : 0,
  background: layout === 'cards' ? (on ? 'var(--color-accent-100)' : 'var(--color-surface)') : 'transparent',
});
const box = (round: boolean, on: boolean): React.CSSProperties => ({
  width: 16, height: 16, flex: 'none', marginTop: 2, display: 'grid', placeItems: 'center', borderRadius: round ? '50%' : 0,
  border: `1.5px solid ${on ? 'var(--color-accent)' : 'var(--color-divider)'}`, background: on ? 'var(--color-accent)' : 'var(--color-surface)',
  boxShadow: round && on ? 'inset 0 0 0 4px var(--color-bg)' : undefined,
});

export type CheckboxProps = ComponentPropsWithoutRef<typeof RCheckbox.Root> & { label: ReactNode; hint?: ReactNode; layout?: Layout };
export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(({ label, hint, layout = 'stack', id, checked, className, ...rest }, ref) => {
  const auto = useId(); const cid = id ?? auto; const on = checked === true;
  return (
    <label htmlFor={cid} style={row(layout, on, rest.disabled)} className={cx('checkbox', className)}>
      <RCheckbox.Root ref={ref} id={cid} checked={checked} style={{ all: 'unset', ...box(false, on) }} {...rest}>
        <RCheckbox.Indicator><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-bg)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></RCheckbox.Indicator>
      </RCheckbox.Root>
      <span style={{ display: 'grid', gap: 2 }}><span style={{ fontSize: 14 }}>{label}</span>{hint && <span style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>{hint}</span>}</span>
    </label>
  );
});
Checkbox.displayName = 'Checkbox';

export type RadioOption<V extends string> = { value: V; label: ReactNode; hint?: ReactNode; disabled?: boolean };
export type RadioGroupProps<V extends string> = Omit<ComponentPropsWithoutRef<typeof RRadio.Root>, 'value' | 'onValueChange'> & { label: string; options: RadioOption<V>[]; value: V | ''; onValueChange: (v: V) => void; layout?: Layout };
export function RadioGroup<V extends string>({ label, options, value, onValueChange, layout = 'stack', className, ...rest }: RadioGroupProps<V>) {
  const base = useId();
  return (
    <RRadio.Root aria-label={label} value={value} onValueChange={v => onValueChange(v as V)} className={cx('radio-group', className)}
      style={{ display: layout === 'cards' ? 'grid' : 'flex', gridTemplateColumns: layout === 'cards' ? `repeat(${options.length}, 1fr)` : undefined, flexDirection: layout === 'stack' ? 'column' : 'row', gap: layout === 'inline' ? 20 : layout === 'cards' ? 2 : 12 }} {...rest}>
      {options.map(o => { const on = o.value === value, id = `${base}-${o.value}`; return (
        <label key={o.value} htmlFor={id} style={row(layout, on, o.disabled || rest.disabled)}>
          <RRadio.Item id={id} value={o.value} disabled={o.disabled} style={{ all: 'unset', ...box(true, on) }} />
          <span style={{ display: 'grid', gap: 2 }}><span style={{ fontSize: 14 }}>{o.label}</span>{o.hint && <span style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>{o.hint}</span>}</span>
        </label>); })}
    </RRadio.Root>
  );
}
