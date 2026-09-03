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
};
export type InputProps = NativeProps<'input', InputOwnProps>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helper, state = 'default', fieldProps, className, id, ...rest }, ref) => {
    const auto = useId();
    const inputId = id ?? auto;
    const helperId = helper ? `${inputId}-helper` : undefined;
    return (
      <div {...fieldProps} className={cx('field', state === 'error' && 'field-error', fieldProps?.className)}>
        {label && <label htmlFor={inputId}>{label}</label>}
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
        {helper && <div id={helperId} className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>{helper}</div>}
      </div>
    );
  },
);
Input.displayName = 'Input';
