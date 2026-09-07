import { forwardRef, useId, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { mobileHints } from '../utils/keyboard';
import type { NativeProps } from '../utils/polymorphic';

export type InputOwnProps = {
  label?: ReactNode;
  helper?: ReactNode;
  state?: 'default' | 'error' | 'disabled';
  /** 래퍼(.field)로 전달할 props — 루트 <input> 의 ...rest 와 분리 */
  fieldProps?: ComponentPropsWithoutRef<'div'>;
  /** 입력 앞의 표기(₩ · @). 값이 아니라 표기라 클릭·포커스 대상이 아닙니다 */
  prefix?: ReactNode;
  /** 입력 끝의 단위 표기(% · 원 · 병). RADIO I 절에 있었지만 그동안 구현이 없었습니다 */
  suffix?: ReactNode;
};
export type InputProps = NativeProps<'input', InputOwnProps>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helper, state = 'default', fieldProps, prefix, suffix, className, id, ...rest }, ref) => {
    const auto = useId();
    const inputId = id ?? auto;
    const helperId = helper ? `${inputId}-helper` : undefined;
    return (
      <div {...fieldProps} className={cx('field', state === 'error' && 'field-error', fieldProps?.className)}>
        {label && <label htmlFor={inputId}>{label}</label>}
        {prefix === undefined && suffix === undefined ? (
          <input
            ref={ref}
            id={inputId}
            className={cx('input', state === 'error' && 'input-error', className)}
            aria-invalid={state === 'error' || undefined}
            aria-describedby={helperId}
            disabled={state === 'disabled' || rest.disabled}
            {...mobileHints(rest.type, rest)}
            {...rest}
          />
        ) : (
          /* 표기가 테두리 안에 있어야 해서 래퍼가 테두리를 가져갑니다(.input-affix).
             표기 없는 경로의 마크업은 그대로 — 기존 소비자와 스냅샷이 안 흔들립니다. */
          <span className={cx('input', 'input-affix', state === 'error' && 'input-error')}>
            {prefix !== undefined && <span className="input-prefix">{prefix}</span>}
            <input
              ref={ref}
              id={inputId}
              className={cx('input-plain', className)}
              aria-invalid={state === 'error' || undefined}
              aria-describedby={helperId}
              disabled={state === 'disabled' || rest.disabled}
              {...mobileHints(rest.type, rest)}
              {...rest}
            />
            {suffix !== undefined && <span className="input-suffix">{suffix}</span>}
          </span>
        )}
        {helper && <div id={helperId} className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>{helper}</div>}
      </div>
    );
  },
);
Input.displayName = 'Input';
