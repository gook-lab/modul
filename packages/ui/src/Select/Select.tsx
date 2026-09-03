import { forwardRef, useEffect, useId, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { guardIme } from '../utils/keyboard';
import { useLabels } from '../utils/labels';
import { mergeRefs } from '../utils/Slot';
import type { NativeProps } from '../utils/polymorphic';

export type SelectOption<V extends string> = { value: V; label: string; hint?: ReactNode; dot?: 'accent' | 'neutral'; disabled?: boolean };
export type SelectOwnProps<V extends string> = {
  options: SelectOption<V>[];
  value: V | null;
  onChange: (v: V) => void;
  label?: ReactNode;
  placeholder?: string;
  size?: 'md' | 'lg';
  /** 폼 제출용 hidden input 이름 */
  name?: string;
  /** true 면 네이티브 <select> 로 렌더 (힌트·점 없음). SSR/폼 위주 화면에 */
  native?: boolean;
  renderOption?: (o: SelectOption<V>, state: { selected: boolean; active: boolean }) => ReactNode;
  fieldProps?: ComponentPropsWithoutRef<'div'>;
};
export type SelectProps<V extends string> = NativeProps<'button', SelectOwnProps<V>>;

/**
 * 단일 선택 listbox. 구조: <button aria-haspopup=listbox> + <ul role=listbox><li role=option>.
 * 키보드: ↑↓ 이동, Home/End, Enter/Space 선택, Esc 닫기, 문자 입력은 타입어헤드.
 */
function SelectInner<V extends string>(
  { options, value, onChange, label, placeholder, size = 'md', name, native, renderOption, fieldProps, className, id, disabled, ...rest }: SelectProps<V>,
  ref: React.Ref<HTMLButtonElement>,
) {
  const t = useLabels(); const auto = useId(); const btnId = id ?? auto; const listId = btnId + '-list';
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => Math.max(0, options.findIndex(o => o.value === value)));
  const btn = useRef<HTMLButtonElement>(null); const list = useRef<HTMLUListElement>(null); const typed = useRef({ s: '', t: 0 });
  const cur = options.find(o => o.value === value);
  const h = size === 'lg' ? 44 : 36;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!btn.current?.parentElement?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close);
  }, [open]);
  useEffect(() => { if (open) list.current?.querySelector<HTMLElement>('[data-active]')?.scrollIntoView?.({ block: 'nearest' }); }, [open, active]);

  const commit = (i: number) => { const o = options[i]; if (!o || o.disabled) return; onChange(o.value); setOpen(false); btn.current?.focus(); };
  const move = (d: number) => { let i = active; for (let k = 0; k < options.length; k++) { i = (i + d + options.length) % options.length; if (!options[i].disabled) break; } setActive(i); };
  const onKey = guardIme((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (open) move(1); else setOpen(true); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (open) move(-1); else setOpen(true); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
    else if (e.key === 'End') { e.preventDefault(); setActive(options.length - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (open) commit(active); else setOpen(true); }
    else if (e.key === 'Escape') { setOpen(false); }
    else if (e.key.length === 1 && /\S/.test(e.key)) {
      const now = Date.now(); typed.current = { s: (now - typed.current.t < 600 ? typed.current.s : '') + e.key.toLowerCase(), t: now };
      const i = options.findIndex(o => o.label.toLowerCase().startsWith(typed.current.s)); if (i >= 0) { setActive(i); if (!open) commit(i); }
    }
  });

  if (native) {
    return (
      <div {...fieldProps} className={cx('field', fieldProps?.className)}>
        {label && <label htmlFor={btnId}>{label}</label>}
        <select id={btnId} name={name} className={cx('input', className)} disabled={disabled} value={value ?? ''} onChange={e => onChange(e.target.value as V)} style={{ minHeight: h }}>
          <option value="" disabled>{placeholder ?? t('select.placeholder')}</option>
          {options.map(o => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div {...fieldProps} className={cx('field', fieldProps?.className)} style={{ position: 'relative', ...fieldProps?.style }}>
      {label && <label id={btnId + '-label'} htmlFor={btnId}>{label}</label>}
      {name && <input type="hidden" name={name} value={value ?? ''} />}
      <button
        ref={mergeRefs(ref, btn)} id={btnId} type="button" role="combobox"
        aria-haspopup="listbox" aria-expanded={open} aria-controls={listId} aria-labelledby={label ? btnId + '-label' : undefined}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        className={cx('input', 'select', className)} disabled={disabled}
        onClick={() => setOpen(o => !o)} onKeyDown={onKey}
        style={{ display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', cursor: 'pointer', minHeight: h }}
        {...rest}
      >
        <span style={{ flex: 1, color: cur ? undefined : 'var(--color-neutral-700)' }}>{cur?.label ?? placeholder ?? t('select.placeholder')}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform var(--motion-base)' }}><path d="m6 9 6 6 6-6"/></svg>
      </button>
      {open && (
        <ul ref={list} id={listId} role="listbox" aria-labelledby={label ? btnId + '-label' : undefined} tabIndex={-1}
          style={{ position: 'absolute', left: 0, right: 0, top: '100%', margin: '2px 0 0', padding: 0, listStyle: 'none', background: 'var(--color-surface)', border: '1px solid var(--color-divider)', boxShadow: 'var(--shadow-md)', zIndex: 5, maxHeight: 240, overflow: 'auto', animation: 'mdl-fadeup 160ms var(--ease-decel) both' }}>
          {options.map((o, i) => {
            const selected = o.value === value, act = i === active;
            return (
              <li key={o.value} id={`${listId}-${i}`} role="option" aria-selected={selected} aria-disabled={o.disabled || undefined} data-active={act || undefined}
                onMouseEnter={() => setActive(i)} onMouseDown={e => { e.preventDefault(); commit(i); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', minHeight: h, fontSize: 14, cursor: o.disabled ? 'not-allowed' : 'pointer', opacity: o.disabled ? .45 : 1, background: act ? 'var(--color-neutral-200)' : 'transparent', color: selected ? 'var(--color-accent-700)' : 'var(--color-text)' }}>
                {renderOption ? renderOption(o, { selected, active: act }) : (<>
                  <span aria-hidden style={{ width: 6, height: 6, flex: 'none', background: o.dot === 'accent' ? 'var(--color-accent)' : o.dot === 'neutral' ? 'var(--color-neutral-400)' : 'transparent' }} />
                  <span style={{ flex: 1 }}>{o.label}</span>
                  {o.hint != null && <span style={{ fontSize: 11, color: 'var(--color-neutral-700)' }}>{o.hint}</span>}
                </>)}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
export const Select = forwardRef(SelectInner) as <V extends string>(p: SelectProps<V> & { ref?: React.Ref<HTMLButtonElement> }) => React.ReactElement;
