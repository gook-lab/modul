import { Children, cloneElement, forwardRef, isValidElement, type ReactNode, type Ref } from 'react';
import { cx } from './cx';

export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T) => refs.forEach(r => { if (typeof r === 'function') r(node); else if (r) (r as React.MutableRefObject<T>).current = node; });
}
export function composeHandlers<E extends { defaultPrevented: boolean }>(ours?: (e: E) => void, theirs?: (e: E) => void) {
  return (e: E) => { theirs?.(e); if (!e.defaultPrevented) ours?.(e); };
}

type SlotProps = { children: ReactNode } & Record<string, unknown>;
type Handler = (e: { defaultPrevented: boolean }) => void;

/** asChild 구현 — 단일 자식에 props/className/style/ref 를 병합. 자식의 props 가 우선. */
export const Slot = forwardRef<HTMLElement, SlotProps>(({ children, ...slotProps }, ref) => {
  const child = Children.only(children);
  if (!isValidElement(child)) return null;
  const cp = child.props as Record<string, unknown>;
  const merged: Record<string, unknown> = { ...slotProps, ...cp };
  for (const k of Object.keys(slotProps)) {
    if (/^on[A-Z]/.test(k) && typeof slotProps[k] === 'function' && typeof cp[k] === 'function') merged[k] = composeHandlers(slotProps[k] as Handler, cp[k] as Handler);
  }
  merged.className = cx(slotProps.className as string, cp.className as string);
  merged.style = { ...(slotProps.style as object), ...(cp.style as object) };
  merged.ref = mergeRefs(ref, (child as { ref?: Ref<HTMLElement> }).ref);
  return cloneElement(child, merged);
});
Slot.displayName = 'Slot';
