import { useCallback, useEffect, useRef, useState } from 'react';
import { SPRING } from './presets';
export function useSpring(initial = 0, cfg = SPRING) {
  const [x, setX] = useState(initial); const v = useRef(0); const raf = useRef(0); const cur = useRef(initial);
  const to = useCallback((target: number, done?: () => void) => {
    cancelAnimationFrame(raf.current); let last = performance.now();
    const tick = (now: number) => { const dt = Math.min(.032, (now - last) / 1000); last = now; const a = -cfg.stiffness * (cur.current - target) - cfg.damping * v.current; v.current += a / cfg.mass * dt; cur.current += v.current * dt; if (Math.abs(cur.current - target) < .3 && Math.abs(v.current) < .3) { cur.current = target; v.current = 0; setX(target); done?.(); return; } setX(cur.current); raf.current = requestAnimationFrame(tick); };
    raf.current = requestAnimationFrame(tick);
  }, [cfg]);
  const set = useCallback((n: number) => { cancelAnimationFrame(raf.current); cur.current = n; v.current = 0; setX(n); }, []);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return { x, to, set };
}
/** 드래그 + 스냅 + rubber-band. 포인터 이벤트(터치 포함) */
export function useDrag({ snap, rubber = .35, min = Math.min(...snap), max = Math.max(...snap), spring = SPRING }: { snap: number[]; rubber?: number; min?: number; max?: number; spring?: typeof SPRING }) {
  const s = useSpring(snap[0], spring); const drag = useRef<{ start: number; from: number } | null>(null);
  // drag 는 포인터 계산용 ref 이고, 화면에 보이는 상태(커서·dragging)는 state 로 둡니다.
  // ref 를 렌더에서 읽으면 값이 바뀌어도 리렌더가 없어 cursor 가 grabbing 으로 바뀌지 않았습니다.
  const [dragging, setDragging] = useState(false);
  const bind = {
    onPointerDown: (e: React.PointerEvent) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); drag.current = { start: e.clientX, from: s.x }; setDragging(true); },
    onPointerMove: (e: React.PointerEvent) => { if (!drag.current) return; let x = drag.current.from + e.clientX - drag.current.start; if (x < min) x = min + (x - min) * rubber; if (x > max) x = max + (x - max) * rubber; s.set(x); },
    onPointerUp: () => { if (!drag.current) return; drag.current = null; setDragging(false); s.to(snap.reduce((a, b) => Math.abs(b - s.x) < Math.abs(a - s.x) ? b : a)); },
    style: { touchAction: 'pan-y' as const, cursor: dragging ? 'grabbing' : 'grab' },
  };
  return { x: s.x, bind, dragging };
}
