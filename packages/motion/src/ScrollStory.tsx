import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useReducedMotion } from './useReducedMotion';
/** sticky 스테이지 + 진행률. 스크롤이 이징 — duration 없음. reduced: progress 를 step 경계로 스냅 */
export function ScrollStory({ steps, height = `${steps * 100}vh`, children, style }: { steps: number; height?: string; children: (s: { progress: number; step: number }) => ReactNode; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null); const [p, setP] = useState(0); const rm = useReducedMotion();
  useEffect(() => { const el = ref.current!; let raf = 0; const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const r = el.getBoundingClientRect(); const total = el.offsetHeight - innerHeight; setP(Math.min(1, Math.max(0, -r.top / total))); }); }; on(); addEventListener('scroll', on, { passive: true }); addEventListener('resize', on); return () => { removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf); }; }, []);
  const step = Math.min(steps, Math.floor(p * steps) + 1); const progress = rm ? (step - 1) / (steps - 1 || 1) : p;
  return <div ref={ref} style={{ height, position: 'relative', ...style }}><div style={{ position: 'sticky', top: 0, height: '100vh' }}>{children({ progress, step })}</div></div>;
}
