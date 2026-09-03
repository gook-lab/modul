import { createContext, useContext, useId, type ComponentPropsWithoutRef, type ReactNode, type SyntheticEvent } from 'react';
import { Controller, FormProvider, useFormContext, type FieldPathValue, type FieldValues, type Path, type UseFormReturn } from 'react-hook-form';
import { errorAt } from './errors';
import { cx } from '../utils/cx';
import type { NativeProps } from '../utils/polymorphic';

/**
 * Form = react-hook-form 위의 얇은 레이어. 검증은 zod(resolver), 표시는 MODUL 컴포넌트.
 * Field 가 name 하나로 label·control·오류를 묶고, 컨트롤은 control prop 으로 받은 렌더 함수.
 * 컴포넌트는 값을 소유하지 않는다(RADIO/A) — 전부 RHF 가.
 */
export type FormProps<T extends FieldValues> = NativeProps<'form', { form: UseFormReturn<T>; onSubmit: (v: T) => void | Promise<void>; children: ReactNode }>;
export function Form<T extends FieldValues>({ form, onSubmit, children, className, ...rest }: FormProps<T>) {
  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className={cx('form', className)} style={{ display: 'grid', gap: 20 }} {...rest}>{children}</form>
    </FormProvider>
  );
}

const FieldCtx = createContext<{ id: string; name: string; error?: string } | null>(null);
export const useField = () => useContext(FieldCtx);

/** Field 가 렌더 함수에 넘기는 것. 컨트롤에 그대로 스프레드할 수 있어야 하므로 onChange 는 값과 이벤트를 모두 받습니다. */
export type FieldRenderProps<V> = {
  id: string;
  name: string;
  value: V;
  onChange: (v: V | null | SyntheticEvent) => void;
  onBlur: () => void;
  state: 'default' | 'error';
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
};
export type FieldProps<T extends FieldValues, N extends Path<T> = Path<T>> = {
  name: N;
  label?: ReactNode;
  helper?: ReactNode;
  required?: boolean;
  children: (p: FieldRenderProps<FieldPathValue<T, N>>) => ReactNode;
};
/**
 * 폼 값 타입을 한 번 묶어 둔 Field. `<Field<Values> name="photos">` 처럼 타입 인자를 하나만 주면
 * TS 가 나머지를 추론하지 못해 value 가 전체 필드의 유니온이 됩니다 — 부분 추론이 없기 때문입니다.
 * `const Field = createField<Values>()` 로 T 를 먼저 고정하면 name 리터럴에서 값 타입이 정확히 좁혀집니다.
 */
export function createField<T extends FieldValues>() {
  return function TypedField<N extends Path<T>>(props: FieldProps<T, N>) {
    return <Field<T, N> {...props} />;
  };
}

/** 오류가 있으면 helper 자리에 오류를 대신 그린다 — 두 줄이 되지 않게 (Input RADIO/D 결정과 동일) */
export function Field<T extends FieldValues, N extends Path<T> = Path<T>>({ name, label, helper, required, children }: FieldProps<T, N>) {
  const { control, formState } = useFormContext<T>(); const id = useId();
  const err = errorAt(formState.errors, name);
  const helperId = helper || err ? id + '-h' : undefined;
  return (
    <FieldCtx.Provider value={{ id, name, error: err }}>
      <Controller name={name} control={control} render={({ field }) => (
        <div className={cx('field', err && 'field-error')}>
          {label && <label htmlFor={id}>{label}{required && <span aria-hidden style={{ color: 'var(--color-accent)', marginLeft: 4 }}>*</span>}</label>}
          {children({ id, name: field.name, value: field.value, onChange: field.onChange, onBlur: field.onBlur, state: err ? 'error' : 'default', 'aria-describedby': helperId, 'aria-invalid': !!err || undefined })}
          {(err || helper) && <div id={helperId} role={err ? 'alert' : undefined} style={{ fontSize: 12, marginTop: 6, color: err ? 'var(--color-accent-700)' : 'var(--color-neutral-700)' }}>{err ?? helper}</div>}
        </div>
      )} />
    </FieldCtx.Provider>
  );
}

/** 제출 버튼 — 처리 중 인라인 스피너 + 라벨 교체 (bottling 규칙), 비활성이면 이유 */
export function SubmitButton({ children, busyLabel = '저장 중…', ...rest }: { children: ReactNode; busyLabel?: string } & ComponentPropsWithoutRef<'button'>) {
  const { formState } = useFormContext(); const busy = formState.isSubmitting;
  return <button type="submit" className="btn btn-primary" disabled={busy} aria-busy={busy || undefined} {...rest}>{busy && <span aria-hidden style={{ width: 12, height: 12, border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', animation: 'mdl-spin .7s linear infinite', display: 'inline-block' }} />}{busy ? busyLabel : children}</button>;
}
