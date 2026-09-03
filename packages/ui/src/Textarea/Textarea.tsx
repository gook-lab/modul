import { forwardRef, useEffect, useId, useRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { guardIme } from '../utils/keyboard';
import { mergeRefs } from '../utils/Slot';
import type { NativeProps } from '../utils/polymorphic';

export type TextareaProps = NativeProps<'textarea', { label?: ReactNode; helper?: ReactNode; autoGrow?: boolean; fieldProps?: ComponentPropsWithoutRef<'div'> }>;
/**
 * 글자수 카운터(maxLength 있을 때) + 2px 진행 룰, 90% 부터 경고색. autoGrow 는 scrollHeight.
 * 값은 순수 문자열(\n). Enter 는 줄바꿈(네이티브) — 표시는 <RichText value={v} />, 내보내기는 toHtml(v). 둘은 같은 <p>/<br> 구조.
 * 채팅처럼 Enter 제출이 필요하면 onKeyDown={submitOnEnter(send)} (Shift+Enter 줄바꿈, 한글 조합 중 무시).
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, helper, autoGrow, fieldProps, className, id, maxLength, value, onChange, style, ...rest }, ref) => {
  const auto = useId(); const tid = id ?? auto; const inner = useRef<HTMLTextAreaElement>(null);
  const len = typeof value === 'string' ? [...value].length : 0, ratio = maxLength ? len / maxLength : 0;
  useEffect(() => { const el = inner.current; if (!el || !autoGrow) return; el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }, [value, autoGrow]);
  return (
    <div {...fieldProps} className={cx('field', fieldProps?.className)}>
      {label && <label htmlFor={tid}>{label}</label>}
      <textarea ref={mergeRefs(ref, inner)} id={tid} className={cx('input', className)} maxLength={maxLength} value={value} onChange={onChange} aria-describedby={maxLength ? tid + '-count' : undefined}
        style={{ resize: autoGrow ? 'none' : 'vertical', overflow: autoGrow ? 'hidden' : undefined, lineHeight: 1.6, borderColor: ratio >= 1 ? 'var(--color-accent)' : undefined, ...style }} enterKeyHint={rest.enterKeyHint ?? 'enter'} {...rest} onKeyDown={rest.onKeyDown && guardIme(rest.onKeyDown)} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12 }}>
        <span style={{ color: 'var(--color-neutral-700)' }}>{helper}</span>
        {maxLength && <span id={tid + '-count'} aria-live="polite" style={{ fontVariantNumeric: 'tabular-nums', color: ratio >= .9 ? 'var(--color-accent-700)' : 'var(--color-neutral-700)' }}>{len} / {maxLength}</span>}
      </div>
      {maxLength && <div aria-hidden style={{ height: 2, background: 'var(--color-neutral-300)', marginTop: 6 }}><div style={{ height: 2, width: `${Math.min(100, ratio * 100)}%`, background: ratio >= .9 ? 'var(--color-accent)' : 'var(--color-neutral-500)', transition: 'width var(--motion-fast)' }} /></div>}
    </div>
  );
});
Textarea.displayName = 'Textarea';
