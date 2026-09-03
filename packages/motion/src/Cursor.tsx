import { useEffect, useState, type ReactNode } from 'react';

const MODES: Record<string, { label: string; size: number }> = { view: { label: '보기', size: 72 }, drag: { label: '드래그', size: 56 }, link: { label: '→', size: 40 } };

/** 커스텀 커서. [data-cursor] 타깃 위에서 크기·라벨 변경. 터치 기기·reduced-motion 에서는 렌더하지 않음. */
export function CursorProvider({ children, modes = MODES }: { children: ReactNode; modes?: typeof MODES }) {
  const [s, set] = useState({ x: -100, y: -100, on: false, mode: null as string | null });
  useEffect(() => {
    if (matchMedia('(pointer: coarse)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.documentElement.style.cursor = 'none';
    const move = (e: MouseEvent) => {
      const t = (e.target as Element).closest?.('[data-cursor]');
      set({ x: e.clientX, y: e.clientY, on: true, mode: t?.getAttribute('data-cursor') ?? null });
    };
    const leave = () => set(v => ({ ...v, on: false }));
    addEventListener('mousemove', move); document.addEventListener('mouseleave', leave);
    return () => { removeEventListener('mousemove', move); document.removeEventListener('mouseleave', leave); document.documentElement.style.cursor = ''; };
  }, []);
  const m = s.mode ? modes[s.mode] : null;
  return (
    <>
      {children}
      <div aria-hidden style={{
        position: 'fixed', left: 0, top: 0, zIndex: 9999, pointerEvents: 'none', display: 'grid', placeItems: 'center',
        background: 'var(--color-accent)', color: 'var(--color-bg)', mixBlendMode: m ? 'normal' : 'difference',
        width: m ? m.size : 12, height: m ? m.size : 12, opacity: s.on ? 1 : 0,
        transform: `translate(${s.x}px, ${s.y}px) translate(-50%, -50%)`,
        transition: 'width var(--motion-slow) var(--ease-decel), height var(--motion-slow) var(--ease-decel), opacity var(--motion-base)',
        fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600,
      }}>{m?.label}</div>
    </>
  );
}
