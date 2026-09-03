import { useEffect, useRef, useState } from 'react';

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export type CountUpOptions = { duration?: number; start?: boolean; decimals?: number };
/** 0 → target. start 가 true 가 되는 순간부터 재생 (useInView 의 inView 를 넘기면 스크롤 트리거). */
export function useCountUp(target: number, { duration = 1400, start = true, decimals = 0 }: CountUpOptions = {}) {
  const [v, setV] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      setV(target * easeOutExpo(t));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, start]);
  return Number(v.toFixed(decimals));
}
