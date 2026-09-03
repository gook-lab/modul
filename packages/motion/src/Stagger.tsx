import { Children, cloneElement, isValidElement, type CSSProperties, type ReactElement, type ReactNode } from 'react';
import { transition, type PresetName } from './presets';
import { useReducedMotion } from './useReducedMotion';
const GAP = { fast: 40, base: 60, slow: 90 } as const;
/** 자식 진입 순서·간격. 12개 넘으면 총 ≤ 900ms 로 간격 축소. reduced: 지연 0, opacity 만 */
export function Stagger({ children, order = 'index', gap = 'base', preset = 'reveal', cols = 1, maxTotal = 900 }: { children: ReactNode; order?: 'index' | 'reverse' | 'center-out' | 'random'; gap?: keyof typeof GAP; preset?: PresetName; cols?: number; maxTotal?: number }) {
  const rm = useReducedMotion(); const arr = Children.toArray(children); const n = arr.length; const rows = Math.ceil(n / cols);
  const orderOf = (i: number) => { const r = Math.floor(i / cols), c = i % cols; switch (order) { case 'reverse': return n - 1 - i; case 'center-out': return Math.round(Math.abs(c - (cols - 1) / 2) * 2 + Math.abs(r - (rows - 1) / 2) * 2); case 'random': return (i * 7 + 3) % n; default: return i; } };
  const maxO = Math.max(0, ...arr.map((_, i) => orderOf(i))); const g = rm ? 0 : Math.min(GAP[gap], maxTotal / Math.max(1, maxO));
  return <>{arr.map((ch, i) => isValidElement(ch) ? cloneElement(ch as ReactElement<{ style?: CSSProperties }>, { style: { ...(ch.props as { style?: CSSProperties }).style, animation: `mdl-${preset === 'reveal' ? 'reveal' : 'fadeup'} ${rm ? 200 : 320}ms var(--ease-decel) both`, animationDelay: `${Math.round(orderOf(i) * g)}ms`, transition: transition(preset, rm) } }) : ch)}</>;
}
