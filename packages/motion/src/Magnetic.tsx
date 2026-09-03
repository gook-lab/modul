import { useEffect, useRef, useState, type ReactNode } from 'react';
import { hasPointer, useReducedMotion } from './useReducedMotion';
/** 커서가 radius 안에 오면 strength 비율로 끌림(max px). 벗어나면 스프링 복귀. 터치·reduced 비활성 */
export function Magnetic({ children, radius = 80, strength = .3, max = 12 }: { children: ReactNode; radius?: number; strength?: number; max?: number }) {
  const ref = useRef<HTMLDivElement>(null); const [d, setD] = useState({ x: 0, y: 0, near: false }); const rm = useReducedMotion();
  useEffect(() => {
    if (rm || !hasPointer()) return;
    const on = (e: PointerEvent) => { const el = ref.current; if (!el) return; const b = el.getBoundingClientRect(); const cx = b.left + b.width / 2, cy = b.top + b.height / 2; const dx = e.clientX - cx, dy = e.clientY - cy; const dist = Math.hypot(dx, dy); if (dist > radius) { if (d.near) setD({ x: 0, y: 0, near: false }); return; } const k = (1 - dist / radius) * strength; setD({ x: Math.max(-max, Math.min(max, dx * k)), y: Math.max(-max, Math.min(max, dy * k)), near: true }); };
    addEventListener('pointermove', on, { passive: true }); return () => removeEventListener('pointermove', on);
  }, [radius, strength, max, rm, d.near]);
  return <div ref={ref} style={{ display: 'inline-block', transform: `translate(${d.x}px,${d.y}px)`, transition: d.near ? 'transform 80ms linear' : 'transform 500ms cubic-bezier(.34,1.56,.64,1)' }}>{children}</div>;
}
