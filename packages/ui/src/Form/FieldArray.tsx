import { type ReactNode } from 'react';
import { useFieldArray, useFormContext, type ArrayPath, type FieldValues, type Path, type FieldArray as RHFFieldArray } from 'react-hook-form';
import { useLabels } from '../utils/labels';
import { errorAt } from './errors';

/**
 * 행 렌더에 넘어오는 것. name(k) 는 `contacts.0.email` 같은 실제 경로 타입을 돌려줍니다 —
 * string 으로 두면 Field 가 값 타입을 좁히지 못해 소비자가 캐스팅을 하게 됩니다.
 */
export type FieldArrayRow<T extends FieldValues, N extends ArrayPath<T>> = {
  index: number;
  id: string;
  name: <K extends string>(k: K) => Path<T> & `${N}.${number}.${K}`;
  remove: () => void;
  canRemove: boolean;
};
export type FieldArrayProps<T extends FieldValues, N extends ArrayPath<T>> = {
  name: N;
  label?: ReactNode;
  /** 새 항목 기본값 */
  empty: RHFFieldArray<T, N>;
  min?: number; max?: number;
  reorder?: boolean;
  addLabel?: string;
  /** 항목 렌더 — index 로 Field name 을 조립: `${name}.${i}.email` */
  children: (row: FieldArrayRow<T, N>) => ReactNode;
};
/**
 * 반복 항목(연락처·일정·태그) — RHF useFieldArray 위의 얇은 레이어. 항목 행 = 콘텐츠 + 이동(↑↓) + 제거, 하단 "추가".
 * 드래그 대신 버튼 이동: 키보드·스크린리더 동일 경로. 한 행 제거 시 포커스는 다음 행 첫 필드로(없으면 추가 버튼).
 */
export function FieldArray<T extends FieldValues, N extends ArrayPath<T>>({ name, label, empty, min = 0, max = 20, reorder = true, addLabel, children }: FieldArrayProps<T, N>) {
  const t = useLabels(); const { control, formState } = useFormContext<T>();
  const { fields, append, remove, move } = useFieldArray({ control, name });
  const rootErr = errorAt(formState.errors, name);
  const canAdd = fields.length < max;
  return (
    <div role="group" aria-label={typeof label === 'string' ? label : undefined} style={{ display: 'grid', gap: 2 }}>
      {label && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}><span style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-neutral-700)' }}>{label}</span><span style={{ fontSize: 11, color: 'var(--color-neutral-700)', fontVariantNumeric: 'tabular-nums' }}>{fields.length} / {max}</span></div>}
      {fields.map((f, i) => (
        <div key={f.id} data-row={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'start', padding: '12px 14px', border: '1px solid var(--color-divider)', background: 'var(--color-surface)', animation: 'mdl-fadeup var(--motion-base) both' }}>
          <div style={{ display: 'grid', gap: 12, minWidth: 0 }}>{children({ index: i, id: f.id, name: k => `${name}.${i}.${k}` as never, remove: () => remove(i), canRemove: fields.length > min })}</div>
          <div style={{ display: 'flex', gap: 2 }}>
            {reorder && <><button type="button" className="btn btn-ghost btn-icon" aria-label={`${i + 1}번 항목 위로`} disabled={i === 0} onClick={() => move(i, i - 1)}>↑</button><button type="button" className="btn btn-ghost btn-icon" aria-label={`${i + 1}번 항목 아래로`} disabled={i === fields.length - 1} onClick={() => move(i, i + 1)}>↓</button></>}
            <button type="button" className="btn btn-ghost btn-icon" aria-label={`${i + 1}번 항목 제거`} disabled={fields.length <= min} onClick={e => { const next = (e.currentTarget.closest('[data-row]')?.nextElementSibling as HTMLElement | null)?.querySelector<HTMLElement>('input,select,textarea,button'); remove(i); (next ?? document.getElementById(`${String(name)}-add`))?.focus(); }}>×</button>
          </div>
        </div>
      ))}
      <button id={`${String(name)}-add`} type="button" className="btn btn-secondary" disabled={!canAdd} aria-disabled={!canAdd} title={canAdd ? undefined : `최대 ${max}개`} onClick={() => append(empty)} style={{ justifySelf: 'start', marginTop: 8 }}>+ {addLabel ?? t('common.add')}</button>
      {rootErr && <div role="alert" style={{ fontSize: 12, color: 'var(--color-accent-700)' }}>{rootErr}</div>}
    </div>
  );
}
