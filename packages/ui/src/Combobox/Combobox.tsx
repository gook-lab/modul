import { forwardRef, Fragment, useEffect, useId, useMemo, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import type { NativeProps } from '../utils/polymorphic';
import { guardIme, searchHints } from '../utils/keyboard';
import { useLabels } from '../utils/labels';
import { mergeRefs } from '../utils/Slot';

export type ComboOption<V extends string> = { value: V; label: string; group?: string; hint?: ReactNode; keywords?: string[] };
type Base<V extends string> = {
  options: ComboOption<V>[];
  label?: ReactNode;
  placeholder?: string;
  filter?: (q: string, o: ComboOption<V>) => boolean;
  /** 빈 결과에서 "새로 추가" — 함수면 호출, true 면 onChange 에 입력값을 그대로 */
  creatable?: boolean | ((q: string) => void);
  /** 원격 검색. 있으면 options 대신 결과를 씀 */
  async?: (q: string) => Promise<ComboOption<V>[]>;
  emptyText?: string;
  fieldProps?: ComponentPropsWithoutRef<'div'>;
};
export type ComboboxProps<V extends string> = NativeProps<
  'input',
  Base<V> & (
    | { multiple?: false; value: V | null; onChange: (v: V | null) => void }
    | { multiple: true; value: V[]; onChange: (v: V[]) => void }
  )
>;

/**
 * 구현 내부에서만 쓰는 평탄화 타입. 공개 계약은 ComboboxProps 의 판별 유니온이고,
 * 구현은 multiple 분기를 런타임에서 하므로 유니온을 한 벌로 본 뒤 selected 만 좁힙니다.
 */
type ComboboxRuntimeProps<V extends string> = NativeProps<
  'input',
  Base<V> & { multiple?: boolean; value: V | V[] | null; onChange: (v: V | V[] | null) => void }
>;

const defaultFilter = <V extends string>(q: string, o: ComboOption<V>) => {
  const s = q.toLowerCase(); return o.label.toLowerCase().includes(s) || (o.keywords ?? []).some(k => k.toLowerCase().includes(s));
};
function hl(label: string, q: string) {
  const i = q ? label.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i < 0) return <>{label}</>;
  return <><span style={{ color: 'var(--color-neutral-700)' }}>{label.slice(0, i)}</span><b style={{ color: 'var(--color-accent-700)' }}>{label.slice(i, i + q.length)}</b>{label.slice(i + q.length)}</>;
}

/**
 * 검색 + 선택. 구조: <input role=combobox> + <ul role=listbox>(그룹 헤더 li[role=presentation] + li[role=option]).
 * multiple 이면 선택값이 입력 위에 태그로 쌓이고 Backspace 로 마지막 태그를 뺀다.
 */
function ComboboxInner<V extends string>(props: ComboboxProps<V>, ref: React.Ref<HTMLInputElement>) {
  const { options, label, placeholder, filter = defaultFilter, creatable, async, emptyText, fieldProps, className, id, multiple, value, onChange, onKeyDown, onFocus, ...rest } = props as unknown as ComboboxRuntimeProps<V>;
  const t = useLabels(); const auto = useId(); const inputId = id ?? auto; const listId = inputId + '-list';
  const [q, setQ] = useState(''); const [open, setOpen] = useState(false); const [active, setActive] = useState(0);
  const [remote, setRemote] = useState<ComboOption<V>[] | null>(null);
  const input = useRef<HTMLInputElement>(null); const root = useRef<HTMLDivElement>(null);
  const selected: V[] = multiple ? (value as V[]) : value ? [value as V] : [];

  // stale 응답 폐기 — 요청 순번을 붙이고 최신 순번만 채택 (RADIO/R: 이전 요청이 늦게 도착해도 덮어쓰지 않음)
  const seq = useRef(0);
  // RADIO/O: 최소 1글자. 빈 입력으로는 요청하지 않고 로컬 options 로 되돌린다.
  // 원격 검색 결과를 받는 비동기 이펙트입니다. 빈 입력으로 되돌릴 때도 같은 자리에서 정리합니다.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!async) return;
    if (!q) { setRemote(null); return; }
    const my = ++seq.current;
    async(q).then(r => { if (my === seq.current) setRemote(r); });
  }, [q, async]);
  /* eslint-enable react-hooks/set-state-in-effect */
  useEffect(() => { if (!open) return; const close = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close); }, [open]);

  const source = remote ?? options;
  const matched = useMemo(() => (async ? source : source.filter((o: ComboOption<V>) => !q || filter(q, o))), [source, q, filter, async]);
  const groups = useMemo(() => { const m = new Map<string, ComboOption<V>[]>(); for (const o of matched) { const g = o.group ?? ''; if (!m.has(g)) m.set(g, []); m.get(g)!.push(o); } return [...m.entries()]; }, [matched]);
  const flat: ComboOption<V>[] = groups.flatMap(([, xs]) => xs);
  // 검색어가 바뀌면 활성 인덱스를 0 으로 되돌립니다. 이펙트로 하면 한 프레임 동안
  // 이전 인덱스가 하이라이트된 채로 그려집니다 — React 가 권하는 렌더 중 조정을 씁니다.
  const [lastQ, setLastQ] = useState(q);
  if (q !== lastQ) { setLastQ(q); setActive(0); }

  const pick = (o: ComboOption<V>) => {
    if (multiple) { onChange(selected.includes(o.value) ? selected.filter(v => v !== o.value) : [...selected, o.value]); setQ(''); }
    else { onChange(o.value); setQ(o.label); setOpen(false); }
  };
  const create = () => { const t = q.trim(); if (!t) return; if (typeof creatable === 'function') creatable(t); else pick({ value: t as V, label: t }); };
  const labelOf = (v: V) => options.find((o: ComboOption<V>) => o.value === v)?.label ?? v;

  const onKey = guardIme((e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e); if (e.defaultPrevented) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive(a => Math.min(flat.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(0, a - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (flat[active]) pick(flat[active]); else if (creatable) create(); }
    else if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'Backspace' && multiple && !q && selected.length) onChange(selected.slice(0, -1));
  });

  return (
    <div ref={root} {...fieldProps} className={cx('field', fieldProps?.className)} style={{ position: 'relative', ...fieldProps?.style }}>
      {label && <label htmlFor={inputId}>{label}</label>}
      {multiple && selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
          {selected.map(v => <span key={v} className="tag tag-accent" style={{ gap: 6, paddingRight: 4 }}>{labelOf(v)}<button type="button" aria-label={t('filedrop.remove', { name: labelOf(v) })} onClick={() => onChange(selected.filter(x => x !== v))} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'inherit', padding: '2px 4px' }}>×</button></span>)}
        </div>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 10, color: 'var(--color-neutral-700)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input ref={mergeRefs(ref, input)} id={inputId} role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list" aria-activedescendant={open && flat[active] ? `${listId}-${active}` : undefined}
          className={cx('input', 'combobox', className)} placeholder={placeholder} value={q} autoComplete="off"
          onChange={e => { setQ(e.target.value); setOpen(true); if (!multiple && value) onChange(null); }} onFocus={e => { setOpen(true); onFocus?.(e); }} onKeyDown={onKey} {...searchHints}
          style={{ paddingLeft: 32 }} {...rest} />
        {q && <button type="button" aria-label={t('common.clear')} onClick={() => { setQ(''); if (!multiple) onChange(null); input.current?.focus(); }} style={{ position: 'absolute', right: 8, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--color-neutral-700)', padding: 4 }}>×</button>}
      </div>
      {open && (
        <ul id={listId} role="listbox" aria-multiselectable={multiple || undefined} style={{ position: 'absolute', left: 0, right: 0, top: '100%', margin: '2px 0 0', padding: 0, listStyle: 'none', background: 'var(--color-surface)', border: '1px solid var(--color-divider)', boxShadow: 'var(--shadow-md)', zIndex: 5, maxHeight: 260, overflow: 'auto', animation: 'mdl-fadeup 160ms var(--ease-decel) both' }}>
          {flat.length === 0 && (
            <li role="presentation" style={{ padding: '14px 12px', fontSize: 13, color: 'var(--color-neutral-700)' }}>
              {q ? `"${q}" — ` : ''}{emptyText ?? t('combobox.empty')}{creatable && q && <> <button type="button" onClick={create} style={{ border: 0, background: 'none', cursor: 'pointer', font: 'inherit', fontSize: 13, color: 'var(--color-accent-700)', padding: 0, textDecoration: 'underline', textUnderlineOffset: 3 }}>{t('combobox.create')}</button></>}
            </li>
          )}
          {groups.map(([g, xs]) => (<Fragment key={g}>
            {g && <li role="presentation" style={{ padding: '10px 12px 4px', fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-neutral-700)' }}>{g}</li>}
            {xs.map(o => { const i = flat.indexOf(o), on = selected.includes(o.value), act = i === active; return (
              <li key={o.value} id={`${listId}-${i}`} role="option" aria-selected={on} onMouseEnter={() => setActive(i)} onMouseDown={e => { e.preventDefault(); pick(o); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', minHeight: 40, fontSize: 14, cursor: 'pointer', background: act ? 'var(--color-neutral-200)' : 'transparent', color: on ? 'var(--color-accent-700)' : 'var(--color-text)' }}>
                {multiple && <span aria-hidden style={{ width: 14, height: 14, border: '1.5px solid var(--color-divider)', background: on ? 'var(--color-accent)' : 'transparent', flex: 'none' }} />}
                <span style={{ flex: 1 }}>{hl(o.label, q)}</span>
                {o.hint != null && <span style={{ fontSize: 11, color: 'var(--color-neutral-700)' }}>{o.hint}</span>}
              </li>); })}
          </Fragment>))}
        </ul>
      )}
    </div>
  );
}
export const Combobox = forwardRef(ComboboxInner) as <V extends string>(p: ComboboxProps<V> & { ref?: React.Ref<HTMLInputElement> }) => React.ReactElement;
