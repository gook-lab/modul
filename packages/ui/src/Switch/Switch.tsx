import { forwardRef, useId, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import type { NativeProps } from '../utils/polymorphic';

export type SwitchProps = NativeProps<'button', { checked: boolean; onCheckedChange: (v: boolean) => void; label: ReactNode; hint?: ReactNode; size?: 'sm' | 'md'; shape?: 'square' | 'pill'; labels?: boolean; name?: string }>;

/** role=switch. 보이는 크기는 44×24(md), 히트 영역은 .switch::after 로 44px. hidden input 으로 폼 제출 */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(({ checked, onCheckedChange, label, hint, size = 'md', shape = 'square', labels, name, id, className, disabled, ...rest }, ref) => {
  const auto = useId(); const sid = id ?? auto; const sm = size === 'sm'; const r = shape === 'pill' ? 999 : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, opacity: disabled ? .45 : 1 }}>
      <label htmlFor={sid} style={{ display: 'grid', gap: 3, cursor: disabled ? 'default' : 'pointer' }}><span style={{ fontSize: 14 }}>{label}</span>{hint && <span style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>{hint}</span>}</label>
      {name && <input type="hidden" name={name} value={checked ? 'on' : ''} />}
      <button ref={ref} id={sid} type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onCheckedChange(!checked)} className={cx('switch', className)}
        style={{ position: 'relative', width: sm ? 36 : 44, height: sm ? 20 : 24, flex: 'none', padding: 0, cursor: disabled ? 'default' : 'pointer', borderRadius: r, border: `1px solid ${checked ? 'var(--color-accent)' : 'var(--color-divider)'}`, background: checked ? 'var(--color-accent)' : 'var(--color-surface)', transition: 'background var(--motion-fast), border-color var(--motion-fast)' }} {...rest}>
        <span aria-hidden style={{ position: 'absolute', top: 2, left: 2, width: sm ? 14 : 18, height: sm ? 14 : 18, borderRadius: r, background: checked ? 'var(--color-bg)' : 'var(--color-neutral-500)', transform: checked ? `translateX(${sm ? 16 : 20}px)` : undefined, transition: 'transform var(--motion-fast) var(--ease-decel)' }} />
        {labels && <span aria-hidden style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: checked ? 'flex-start' : 'flex-end', padding: '0 7px', fontSize: 9, fontWeight: 600, letterSpacing: '.06em', color: checked ? 'var(--color-bg)' : 'var(--color-neutral-700)' }}>{checked ? 'ON' : 'OFF'}</span>}
      </button>
    </div>
  );
});
Switch.displayName = 'Switch';
/* styles.css: .switch{position:relative} .switch::after{content:'';position:absolute;left:0;right:0;top:50%;height:44px;transform:translateY(-50%)} */
