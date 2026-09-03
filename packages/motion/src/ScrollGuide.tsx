import { useEffect, useState } from 'react';
/** 상단 2px 진행 바 — 스크럽. 인쇄에선 숨김(print.css .scroll-progress) */
export function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => { const on = () => setP(scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)); on(); addEventListener('scroll', on, { passive: true }); return () => removeEventListener('scroll', on); }, []);
  return <div aria-hidden className="scroll-progress" style={{ position: 'fixed', left: 0, right: 0, top: 0, height: 2, background: 'var(--color-neutral-300)', zIndex: 40 }}><div style={{ height: 2, width: `${p * 100}%`, background: 'var(--color-accent)' }} /></div>;
}
/** 우측 섹션 도트. sections = [{ id, label }] — id 는 화면의 <section id>. IntersectionObserver 로 활성 */
export function SectionDots({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);
  useEffect(() => { const io = new IntersectionObserver(es => { const v = es.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]; if (v) setActive(v.target.id); }, { threshold: [.5] }); sections.forEach(s => { const el = document.getElementById(s.id); if (el) io.observe(el); }); return () => io.disconnect(); }, [sections]);
  return (
    <nav aria-label="섹션" style={{ position: 'fixed', right: 20, top: '50%', transform: 'translateY(-50%)', display: 'grid', gap: 10, zIndex: 40 }}>
      {sections.map(s => { const on = s.id === active; return <a key={s.id} href={`#${s.id}`} aria-label={s.label} aria-current={on ? 'true' : undefined} title={s.label} onClick={e => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }} style={{ display: 'block', width: 4, height: on ? 24 : 8, background: on ? 'var(--color-accent)' : 'var(--color-neutral-500)', transition: 'all var(--motion-base) var(--ease-decel)' }} />; })}
    </nav>
  );
}
