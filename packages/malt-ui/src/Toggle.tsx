import { forwardRef } from 'react';
import { cx } from '@modul/ui';
import type { NativeProps } from '@modul/ui';

export type ToggleProps = NativeProps<'button', { on: boolean; onChange: () => void; label: string }>;
/** role=switch. 보이는 44×24, 히트 영역은 CSS ::after 로 44px. */
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(({ on, onChange, label, className, ...rest }, ref) => (
  <button ref={ref} type="button" role="switch" aria-checked={on} aria-label={label} className={cx('malt-toggle', on && 'malt-toggle--on', className)} onClick={onChange} {...rest}>
    <span className="malt-toggle__knob" />
  </button>
));
Toggle.displayName = 'Toggle';
