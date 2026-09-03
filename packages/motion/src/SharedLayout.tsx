import { useLayoutEffect, useRef } from 'react';
import { DURATIONS, EASINGS } from './presets';
/**
 * 공유 레이아웃 전환. 1) document.startViewTransition 있으면 view-transition-name 만 붙이면 브라우저가 처리
 * 2) 없으면 FLIP: 라우트 전 rect 를 세션에 저장 → 마운트 후 역산 transform → 320ms decel 로 0
 */
const store = new Map<string, DOMRect>();
export const rememberRect = (name: string, el: Element | null) => { if (el) store.set(name, el.getBoundingClientRect()); };
export function navigateShared(run: () => void) { const d = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (d.startViewTransition) d.startViewTransition(run); else run(); }
export function useFlip<T extends HTMLElement>(name: string, rm = false) {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const el = ref.current; const from = store.get(name); if (!el || !from || 'startViewTransition' in document) return;
    const to = el.getBoundingClientRect(); const dx = from.left - to.left, dy = from.top - to.top, sx = from.width / to.width, sy = from.height / to.height;
    if (rm) { el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: EASINGS.out }); store.delete(name); return; }
    el.style.transformOrigin = 'top left';
    el.animate([{ transform: `translate(${dx}px,${dy}px) scale(${sx},${sy})` }, { transform: 'none' }], { duration: DURATIONS.slow, easing: EASINGS.decel });
    store.delete(name);
  }, [name, rm]);
  return { ref, style: { viewTransitionName: name } as React.CSSProperties, onClickCapture: () => rememberRect(name, ref.current) };
}
