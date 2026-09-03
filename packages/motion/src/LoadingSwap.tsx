import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from './useReducedMotion';
/** 스켈레톤 → 콘텐츠 크로스페이드 + 높이 보간. minShow(400) 안에 오면 스켈레톤 생략(깜빡임 방지). reduced: 즉시 교체 */
export function LoadingSwap({ loading, skeleton, children, minShow = 400 }: { loading: boolean; skeleton: ReactNode; children: ReactNode; minShow?: number }) {
  const rm = useReducedMotion(); const [showSk, setShowSk] = useState(false); const [h, setH] = useState<number | undefined>(); const sk = useRef<HTMLDivElement>(null), ct = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!loading) { setShowSk(false); return; } const t = setTimeout(() => setShowSk(true), minShow); return () => clearTimeout(t); }, [loading, minShow]);
  useEffect(() => { const el = loading ? sk.current : ct.current; if (el) setH(el.offsetHeight); }, [loading, showSk, children]);
  const tr = rm ? 'none' : 'opacity var(--motion-slow) var(--ease-decel), height var(--motion-slow) var(--ease-decel)';
  return (
    <div aria-busy={loading || undefined} style={{ position: 'relative', height: h, overflow: 'hidden', transition: tr }}>
      <div ref={sk} aria-hidden style={{ position: 'absolute', inset: '0 0 auto 0', opacity: loading && showSk ? 1 : 0, transition: tr, pointerEvents: 'none' }}>{skeleton}</div>
      <div ref={ct} style={{ position: 'absolute', inset: '0 0 auto 0', opacity: loading ? 0 : 1, transition: tr, transitionDelay: loading || rm ? '0ms' : '80ms' }}>{loading ? null : children}</div>
    </div>
  );
}
