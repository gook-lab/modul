import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from 'react';
import { mergeRefs } from '@modul/ui';
import { useReducedMotion } from './useReducedMotion';
import { useInView } from './InView';
/** clip-path 리빌 + scale + 스크롤 패럴랙스 + 호버 확대. grayscale 은 .grayscale 래퍼 규칙 */
export function ImageReveal({ src, alt, parallax = .08, hoverScale = 1.04, from = 'bottom', className, style, ...rest }: { src: string; alt: string; parallax?: number; hoverScale?: number; from?: 'bottom' | 'top' | 'left' | 'right' } & ComponentPropsWithoutRef<'div'>) {
  const rm = useReducedMotion(); const { ref, inView } = useInView<HTMLDivElement>({ once: true }); const [py, setPy] = useState(0); const box = useRef<HTMLDivElement>(null);
  useEffect(() => { if (rm || !parallax) return; const on = () => { const el = box.current; if (!el) return; const r = el.getBoundingClientRect(); const c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; setPy(-c * parallax * r.height); }; on(); addEventListener('scroll', on, { passive: true }); return () => removeEventListener('scroll', on); }, [rm, parallax]);
  const inset = { bottom: '100% 0 0 0', top: '0 0 100% 0', left: '0 100% 0 0', right: '0 0 0 100%' }[from];
  return (
    <div ref={mergeRefs(ref, box)} className={`grayscale ${className ?? ''}`} style={{ overflow: 'hidden', position: 'relative', clipPath: inView ? 'inset(0)' : `inset(${inset})`, transition: rm ? 'opacity 200ms' : 'clip-path 720ms var(--ease-inout)', opacity: rm && !inView ? 0 : 1, ...style }} {...rest}>
      <img src={src} alt={alt} loading="lazy" decoding="async" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', transform: `translateY(${py}px) scale(${inView || rm ? 'var(--hs,1)' : 1.15})`, transition: rm ? 'none' : 'transform 720ms var(--ease-inout)' }} onMouseEnter={e => !rm && e.currentTarget.style.setProperty('--hs', String(hoverScale))} onMouseLeave={e => e.currentTarget.style.removeProperty('--hs')} />
    </div>
  );
}
