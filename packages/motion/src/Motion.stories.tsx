import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Reveal } from './Reveal';
import { Marquee } from './Marquee';
import { RouteTransition } from './RouteTransition';
import { InView } from './InView';
import { Skeleton, Spinner, Progress } from './Skeleton';
import { useCountUp } from './useCountUp';
import { CursorProvider } from './Cursor';

const meta: Meta = { title: 'Motion', parameters: { layout: 'padded' } };
export default meta;

export const TextReveal: StoryObj = {
  render: () => <Reveal as="h1" split="char" stagger={30} style={{ fontSize: 88, lineHeight: 1, letterSpacing: '-0.03em', margin: 0 }}>움직임은 구조다.</Reveal>,
};
export const ScrollTrigger: StoryObj = {
  render: () => (
    /* 중첩 스크롤 박스(overflow:auto) 대신 프리뷰 자체를 스크롤합니다.
       키보드로 닿을 수 없는 스크롤 영역은 axe scrollable-region-focusable 위반이고,
       tabIndex 로 막으면 jsx-a11y/no-noninteractive-tabindex 와 부딪힙니다. */
    <div>
      <div style={{ height: 380, fontSize: 12 }}>↓ 스크롤</div>
      {['토큰', '컴포넌트', '모션', '템플릿'].map((t, i) => (
        <InView key={t} style={{ padding: '28px 0', borderTop: '2px solid var(--color-divider)' }}><h3 style={{ margin: 0 }}><span style={{ color: 'var(--color-accent)' }}>0{i + 1}</span> {t}</h3></InView>
      ))}
      <div style={{ height: 120 }} />
    </div>
  ),
};
export const PageTransition: StoryObj = {
  render: () => {
    const [r, setR] = useState<'home' | 'work'>('home');
    return (
      <>
        <div style={{ display: 'flex', gap: 2, marginBottom: 20 }}>{(['home', 'work'] as const).map(k => <button key={k} className={'btn ' + (k === r ? 'btn-primary' : 'btn-secondary')} onClick={() => setR(k)}>{k}</button>)}</div>
        <RouteTransition routeKey={r} style={{ minHeight: 220, border: '1px solid var(--color-divider)' }}>
          <div style={{ padding: 32, background: r === 'work' ? 'var(--color-text)' : 'var(--color-bg)', color: r === 'work' ? 'var(--color-bg)' : 'var(--color-text)', minHeight: 220 }}><h2 style={{ margin: 0 }}>{r}</h2></div>
        </RouteTransition>
      </>
    );
  },
};
export const MarqueeStory: StoryObj = {
  name: 'Marquee',
  render: () => (
    <div style={{ display: 'grid', gap: 2 }}>
      <Marquee speed={18} pauseOnHover style={{ borderBlock: '2px solid var(--color-divider)', padding: '12px 0' }}><span style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-0.02em', paddingRight: 40, whiteSpace: 'nowrap' }}>DESIGN IS STRUCTURE — 디자인은 구조다 —</span></Marquee>
      <Marquee speed={12} reverse tone="accent" style={{ padding: '10px 0' }}><span style={{ fontSize: 13, letterSpacing: '.12em', textTransform: 'uppercase', paddingRight: 32, whiteSpace: 'nowrap' }}>포트폴리오 2026 · 프로덕트 디자인 · 디자인 시스템 ·</span></Marquee>
    </div>
  ),
};
export const Loading: StoryObj = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
      <Skeleton.Card lines={3} />
      <div style={{ display: 'grid', gap: 32, alignContent: 'start' }}>
        <div style={{ display: 'flex', gap: 24 }}><Spinner /><Spinner variant="square" /></div>
        <Progress value={0.7} />
      </div>
    </div>
  ),
};
export const Cursor: StoryObj = {
  render: () => (
    <CursorProvider>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        {[['view', '프로젝트 카드'], ['drag', '갤러리 슬라이더'], ['link', '외부 링크']].map(([m, t]) => (
          <div key={m} data-cursor={m} style={{ height: 160, border: '1px solid var(--color-divider)', padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--color-neutral-700)' }}>data-cursor="{m}"</span><b style={{ fontSize: 22 }}>{t}</b>
          </div>
        ))}
      </div>
    </CursorProvider>
  ),
};
function Stat({ value, suffix, label, decimals = 0 }: { value: number; suffix?: string; label: string; decimals?: number }) {
  const n = useCountUp(value, { decimals });
  return <div style={{ borderTop: '2px solid var(--color-divider)', paddingTop: 16 }}><div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1, color: 'var(--color-accent)', fontVariantNumeric: 'tabular-nums' }}>{n.toLocaleString('ko-KR', { minimumFractionDigits: decimals })}<span style={{ fontSize: '.5em', color: 'var(--color-text)' }}>{suffix}</span></div><div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 14 }}>{label}</div></div>;
}
export const CountUp: StoryObj = {
  // rAF 로 숫자를 세는 동안 값이 계속 바뀌어 스크린샷이 실행마다 다릅니다(실측 2.16% 차이).
  // 애니메이션을 CSS 로 끄는 것으로는 막을 수 없어 시각 스냅샷에서 뺍니다.
  parameters: { visual: { skip: true } },
  render: () => <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48 }}><Stat value={1280} suffix="+" label="완료한 화면" /><Stat value={42} label="프로젝트" /><Stat value={98.6} suffix="%" label="토큰 커버리지" decimals={1} /></div>,
};
