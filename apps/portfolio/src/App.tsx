import '@modul/tokens/styles.css';
import { Button, Card } from '@modul/ui';
import { Reveal, Marquee, InView, CursorProvider } from '@modul/motion';

const works = [
  { k: '어드민', t: 'Console 리디자인', d: '데이터 밀도와 룰의 구조' },
  { k: '소비자 앱', t: '홈페이지 v3', d: '마키와 그리드' },
  { k: '시스템', t: 'MODUL', d: '토큰에서 템플릿까지' },
];

export default function App() {
  return (
    <CursorProvider>
      <nav className="nav"><span className="nav-brand">Kim Studio</span><a href="#work">작업</a><a href="#about">소개</a><Button>이력서</Button></nav>
      <section style={{ padding: '64px 48px 48px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 40, alignItems: 'end' }}>
        <Reveal as="h1" split="line" style={{ fontSize: 'clamp(48px, 6.5vw, 104px)', lineHeight: .98, letterSpacing: '-0.035em', margin: 0 }}>{'디자인은\n구조다.'}</Reveal>
        <Reveal as="p" delay={500}>프로덕트 디자이너 · 2026 포트폴리오.</Reveal>
      </section>
      <Marquee speed={20} style={{ borderBlock: '2px solid var(--color-divider)', padding: '8px 0' }}>
        <span style={{ fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', paddingRight: 32 }}>포트폴리오 2026 · 프로덕트 디자인 · 디자인 시스템 · 모션 ·</span>
      </Marquee>
      <div id="work" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, background: 'var(--color-divider)', padding: '2px 0' }}>
        {works.map(w => (
          <InView key={w.t}>
            <Card kicker={w.k} title={w.t} data-cursor="view" style={{ background: 'var(--color-bg)', padding: 18 }}>{w.d}</Card>
          </InView>
        ))}
      </div>
    </CursorProvider>
  );
}
