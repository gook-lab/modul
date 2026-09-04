import type { StoryObj } from '@storybook/react-vite';
import * as Icons from '@modul/icons';
import { presets, DURATIONS, EASINGS, transition, type PresetName } from '@modul/motion';
import { Button } from './Button/Button';
import { Tag } from './Tag/Tag';

/**
 * 시안(Storybook.dc.html)의 문서 섹션을 스토리북으로 옮긴 것입니다.
 * 컴포넌트가 아니라 "무엇을 언제 쓰는가" 를 정한 규칙이라, 값은 전부 토큰과 소스에서 읽어옵니다 —
 * 손으로 옮겨 적으면 코드가 바뀔 때 문서만 낡습니다.
 */
export default { title: 'Foundations', parameters: { layout: 'padded' } };

const Section = ({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: 40 }}>
    <h2 style={{ fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-neutral-700)', margin: '0 0 4px' }}>{title}</h2>
    {note && <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-neutral-700)', margin: '0 0 16px', maxWidth: '62ch' }}>{note}</p>}
    {children}
  </section>
);

const Code = ({ children }: { children: string }) => (
  <code style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: 12, background: 'var(--color-neutral-200)', padding: '1px 5px' }}>{children}</code>
);

const Table = ({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) => (
  <div style={{ overflowX: 'auto' }}>
    <table className="table" style={{ minWidth: 480 }}>
      <thead><tr>{head.map(h => <th key={h} style={{ textAlign: 'left' }}>{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
    </table>
  </div>
);

/* — 설치 & 사용법 — */
export const Install: StoryObj = {
  name: '설치 & 사용법',
  render: () => (
    <>
      <Section title="설치" note="토큰 CSS 한 줄과 컴포넌트 import 만으로 동작합니다. Tailwind 는 소비자 앱의 선택이고 라이브러리는 요구하지 않습니다.">
        <pre style={{ background: 'var(--color-neutral-900)', color: 'var(--color-neutral-100)', padding: 16, overflowX: 'auto', fontSize: 12, lineHeight: 1.7, margin: 0 }}>
{`pnpm add @modul/ui @modul/tokens

// app 진입점에서 한 번
import '@modul/tokens/styles.css';
import '@modul/tokens/components.css';

import { Button } from '@modul/ui';
<Button variant="primary" type="submit" form="contact">보내기</Button>`}
        </pre>
      </Section>
      <Section title="네이티브 속성은 막히지 않습니다" note="고유 props 를 뺀 나머지는 전부 루트 엘리먼트로 갑니다. type · form · aria-* · data-* · 이벤트 핸들러가 그대로 도달합니다.">
        <Button type="submit" form="contact" aria-label="문의 보내기" data-testid="cta">보내기</Button>
      </Section>
      <Section title="덮어쓰기 — className 이 마지막" note="cx() 가 ! 접두를 상위 룰로 처리합니다. 같은 그룹이라도 축(size / look)이 다르면 남습니다.">
        <Table
          head={['입력', '결과']}
          rows={[
            [<Code key="a">cx('btn', 'btn-primary', '!btn-ghost')</Code>, <Code key="b">btn btn-ghost</Code>],
            [<Code key="c">cx('btn', 'btn-primary', 'btn-sm', '!btn-ghost')</Code>, <Code key="d">btn btn-sm btn-ghost</Code>],
            [<Code key="e">cx('btn', '!hover:bg-red')</Code>, <Code key="f">btn !hover:bg-red</Code>],
          ]}
        />
        <p style={{ fontSize: 13, color: 'var(--color-neutral-700)', marginTop: 12, maxWidth: '62ch' }}>
          CSS 쪽 근거는 <Code>components.css</Code> 전체가 <Code>@layer modul</Code> 안에 있다는 것입니다. 레이어 밖 앱 CSS 는 명시도와 무관하게 이깁니다.
        </p>
      </Section>
    </>
  ),
};

/* — 다형성 — */
export const Polymorphism: StoryObj = {
  name: '다형성 — as / asChild',
  render: () => (
    <>
      <Section title="as — 태그 교체" note="단일 엘리먼트 컴포넌트(Button · Tag)는 as 로 루트 태그를 바꿉니다. 바뀐 태그의 네이티브 속성이 타입에도 열립니다.">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button as="a" href="/work" icon={<Icons.ArrowRight />}>작업 보기</Button>
          <Tag as="a" href="/tag/ui" variant="outline">ui</Tag>
        </div>
      </Section>
      <Section title="asChild — 자식에 병합" note="Next Link 처럼 이미 엘리먼트를 렌더하는 컴포넌트를 감쌀 때 씁니다. className · style · ref · 이벤트가 자식으로 병합되고 자식 값이 우선입니다.">
        <Button asChild><a href="/docs">문서로</a></Button>
      </Section>
      <Section title="복합 컴포넌트는 루트 고정" note="Table · Modal 처럼 내부 구조가 있는 컴포넌트는 as 를 열지 않습니다. 바꿔야 할 것은 보통 루트가 아니라 슬롯입니다.">
        <span style={{ fontSize: 13, color: 'var(--color-neutral-700)' }}>대신 <Code>fieldProps</Code> · <Code>containerProps</Code> · <Code>labelProps</Code> 로 내부 표면에 전달합니다.</span>
      </Section>
    </>
  ),
};

/* — 컬러 — */
const RAMP = [100, 200, 300, 400, 500, 600, 700, 800, 900];
const Swatch = ({ v, label }: { v: string; label: string }) => (
  <div style={{ display: 'grid', gap: 6 }}>
    <div style={{ height: 56, background: `var(${v})`, border: '1px solid var(--color-divider)' }} />
    <span style={{ fontSize: 10, color: 'var(--color-neutral-700)' }}>{label}</span>
  </div>
);

export const Color: StoryObj = {
  name: '컬러',
  render: () => (
    <>
      <Section title="역할 토큰" note="컴포넌트는 램프 번호가 아니라 역할을 씁니다. 테마를 바꿔도 코드가 그대로인 이유입니다.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 12 }}>
          {['--color-bg', '--color-surface', '--color-text', '--color-accent', '--color-divider'].map(v => <Swatch key={v} v={v} label={v.replace('--color-', '')} />)}
        </div>
      </Section>
      <Section title="neutral 램프" note="같은 hue·chroma 에서 명도만 9단계. 11–12px 소형 텍스트에는 neutral-600 을 쓰지 않습니다 — light 3.85 로 4.5:1 에 못 미칩니다.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 4 }}>
          {RAMP.map(n => <Swatch key={n} v={`--color-neutral-${n}`} label={String(n)} />)}
        </div>
      </Section>
      <Section title="accent 램프" note="본문 크기 텍스트에는 accent 대신 accent-700 을 씁니다(3.76 → 6.41). accent 는 아이콘·대형 텍스트·UI 크롬용입니다.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 4 }}>
          {RAMP.map(n => <Swatch key={n} v={`--color-accent-${n}`} label={String(n)} />)}
        </div>
      </Section>
    </>
  ),
};

/* — 타이포그래피 — */
export const Typography: StoryObj = {
  name: '타이포그래피',
  render: () => (
    <>
      <Section title="스케일" note="제목은 --font-heading, 본문은 --font-body. 폰트명을 직접 쓰지 않습니다 — ESLint 가 막습니다.">
        <div style={{ display: 'grid', gap: 12 }}>
          {[['h1', 40], ['h2', 30], ['h3', 24], ['body', 15], ['small', 13], ['caption', 11]].map(([n, px]) => (
            <div key={n as string} style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
              <span style={{ width: 72, fontSize: 11, color: 'var(--color-neutral-700)' }}>{n} · {px}px</span>
              <span style={{ fontSize: px as number, fontFamily: (n as string).startsWith('h') ? 'var(--font-heading)' : 'var(--font-body)' }}>
                디자인 시스템 Design System 0123
              </span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="숫자" note="표·금액·카운터는 tabular-nums 로 자릿수를 고정합니다. 값이 바뀔 때 폭이 흔들리면 그것도 레이아웃 이동입니다.">
        <div style={{ display: 'grid', gap: 4, fontSize: 15 }}>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>1,240,000 · 88,000 · 111,111</span>
          <span>1,240,000 · 88,000 · 111,111 <span style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>(비교용 — 기본)</span></span>
        </div>
      </Section>
    </>
  ),
};

/* — 스페이싱 & 룰 — */
export const Spacing: StoryObj = {
  name: '스페이싱 & 룰',
  render: () => (
    <>
      <Section title="간격 6단계" note="4 · 8 · 12 · 16 · 24 · 32. 이 밖의 값이 필요하면 대개 레이아웃 구조가 잘못된 것입니다.">
        <div style={{ display: 'grid', gap: 10 }}>
          {[1, 2, 3, 4, 6, 8].map(n => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 76, fontSize: 11, color: 'var(--color-neutral-700)' }}>--space-{n}</span>
              <span style={{ height: 12, width: `var(--space-${n})`, background: 'var(--color-accent)' }} />
            </div>
          ))}
        </div>
      </Section>
      <Section title="룰(구분선)" note="1px 는 목록 안, 2px 는 영역 경계. 색은 --color-divider 하나만 씁니다.">
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: 8, fontSize: 13 }}>1px — 행 사이</div>
          <div style={{ borderTop: '2px solid var(--color-divider)', paddingTop: 8, fontSize: 13 }}>2px — 섹션 사이</div>
        </div>
      </Section>
      <Section title="반경" note="--radius-sm · md · lg 셋뿐이고 테마가 값을 정합니다. Modernist 는 0, Malt 는 2px 입니다.">
        <div style={{ display: 'flex', gap: 12 }}>
          {['sm', 'md', 'lg'].map(r => (
            <div key={r} style={{ width: 72, height: 48, background: 'var(--color-neutral-300)', borderRadius: `var(--radius-${r})`, display: 'grid', placeItems: 'center', fontSize: 11 }}>{r}</div>
          ))}
        </div>
      </Section>
    </>
  ),
};

/* — 아이콘 — */
const ICON_NAMES = Object.keys(Icons).filter(k => /^[A-Z]/.test(k) && k !== 'ICON_SIZE');

export const IconSet: StoryObj = {
  name: '아이콘',
  render: () => (
    <>
      <Section title={`Lucide 재export · ${ICON_NAMES.length}종`} note="크기는 sm 16 · md 20 · lg 24 세 규격. stroke-width 는 2 고정이고 색은 currentColor 라 부모 색을 따릅니다. aria-label 이 없으면 aria-hidden 이 붙습니다.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 12 }}>
          {ICON_NAMES.map(n => {
            const I = (Icons as unknown as Record<string, React.ComponentType<{ size?: 'sm' | 'md' | 'lg' }>>)[n];
            return (
              <div key={n} style={{ display: 'grid', gap: 6, justifyItems: 'center', padding: 10, border: '1px solid var(--color-divider)' }}>
                <I size="md" />
                <span style={{ fontSize: 10, color: 'var(--color-neutral-700)' }}>{n}</span>
              </div>
            );
          })}
        </div>
      </Section>
    </>
  ),
};

/* — 모션 토큰 — */
export const Motion: StoryObj = {
  name: '모션 토큰',
  render: () => (
    <>
      <Section title="프리셋 8종" note="컴포넌트는 이 밖의 duration/easing 을 쓰지 않습니다. 움직이는 속성은 transform · opacity · clip-path 뿐입니다 — 레이아웃 속성은 애니메이션하지 않습니다.">
        <Table
          head={['프리셋', 'duration', 'easing', '속성', 'reduced 대체']}
          rows={(Object.keys(presets) as PresetName[]).map(k => {
            const p = presets[k];
            return [
              <Code key="n">{k}</Code>,
              p.duration ? `${p.duration}ms` : '—',
              p.easing,
              p.properties.join(' · '),
              p.reduced.duration ? `${p.reduced.duration}ms · ${p.reduced.properties.join(' · ')}` : '정지',
            ];
          })}
        />
      </Section>
      <Section title="토큰 값" note="duration 과 easing 은 theme.json 에서 나오고 CSS 변수로도 같은 값이 나갑니다.">
        <Table
          head={['duration', '값']}
          rows={Object.entries(DURATIONS).map(([k, v]) => [<Code key={k}>{k}</Code>, `${v}ms`])}
        />
        <div style={{ height: 12 }} />
        <Table
          head={['easing', '값']}
          rows={Object.entries(EASINGS).map(([k, v]) => [<Code key={k}>{k}</Code>, <Code key={k + 'v'}>{v}</Code>])}
        />
      </Section>
      <Section title="transition() 출력" note="prefers-reduced-motion 분기는 프리셋 안에 있습니다. 컴포넌트마다 따로 분기하지 않는 이유입니다.">
        <Table
          head={['프리셋', '기본', 'reduced']}
          rows={(Object.keys(presets) as PresetName[]).map(k => [
            <Code key="n">{k}</Code>,
            <Code key="a">{transition(k)}</Code>,
            <Code key="b">{transition(k, true)}</Code>,
          ])}
        />
      </Section>
    </>
  ),
};

/* — 키보드 · 포커스 — */
export const Keyboard: StoryObj = {
  name: '키보드 · 포커스',
  render: () => (
    <>
      <Section title="포커스 링" note=":focus-visible 에만 2px accent 링을 그립니다. 마우스 클릭에는 나타나지 않고 키보드 탐색에만 보입니다. outline 을 없애는 코드를 쓰지 않습니다.">
        <div style={{ display: 'flex', gap: 8 }}>
          <Button>Tab 으로 눌러 보세요</Button>
          <Button variant="secondary">두 번째</Button>
        </div>
      </Section>
      <Section title="컴포넌트별 키" note="목록형은 전부 같은 규칙을 씁니다 — 화살표로 이동, Enter/Space 로 선택, Escape 로 닫기, Home/End 로 양 끝.">
        <Table
          head={['컴포넌트', '키']}
          rows={[
            ['Select · Combobox', '↑↓ 이동 · Enter 선택 · Esc 닫기 · 타이핑으로 점프 · Backspace 로 태그 제거(multiple)'],
            ['Tabs · ScrollTabs', '←→ roving tabindex · Home/End 양 끝'],
            ['Table(편집 셀)', 'Enter/F2 편집 시작 · Enter 저장 · Esc 취소 · Tab 다음 셀'],
            ['ImageGallery', '항목 포커스 후 ←→ 로 순서 변경 (드래그의 키보드 대안)'],
            ['Modal · Drawer · Sheet', 'Esc 닫기 · 포커스 트랩과 복귀는 <dialog> + showModal() 이 처리'],
            ['CommandPalette', 'Cmd/Ctrl+K 열기 · ↑↓ 이동 · Enter 실행'],
          ]}
        />
      </Section>
      <Section title="한글 IME" note="조합 중 Enter 는 글자 확정이지 제출이 아닙니다. Enter · Escape · 화살표 핸들러는 guardIme() 를 거쳐 조합 중 입력을 흘려보냅니다.">
        <Code>{'onKeyDown={guardIme(e => …)}'}</Code>
      </Section>
      <Section title="터치 타깃" note="44px 가 최소선입니다. Malt 테마는 .btn 에 min-height 를 강제합니다.">
        <span style={{ fontSize: 13, color: 'var(--color-neutral-700)' }}>버튼 · 탭 · 목록 행 · 아이콘 버튼 전부 해당합니다.</span>
      </Section>
    </>
  ),
};

/* — 반응형 — */
export const Responsive: StoryObj = {
  name: '반응형 규칙',
  render: () => (
    <>
      <Section title="브레이크포인트" note="셋뿐입니다. 그 사이는 유동 폭으로 처리하고 중간 브레이크포인트를 늘리지 않습니다.">
        <Table
          head={['이름', '폭', '무엇이 바뀌나']}
          rows={[
            ['mobile', '~ 767px', 'AppBar · BottomActions · ScrollTabs, 표는 가로 스크롤(min-width 480)'],
            ['tablet', '768 ~ 1023px', 'Sidebar 접힘, 2열 그리드'],
            ['desktop', '1024px ~', 'Sidebar 펼침, 3열 이상, Table 고정 헤더'],
          ]}
        />
      </Section>
      <Section title="모바일에서 바뀌는 것" note="화면이 좁아지면 같은 컴포넌트를 줄이는 게 아니라 다른 컴포넌트로 바꿉니다.">
        <Table
          head={['데스크톱', '모바일']}
          rows={[
            ['Modal', 'Sheet — 아래에서 올라오고 한 손으로 닫힙니다'],
            ['Sidebar', 'Drawer — 트리거로 열고 Esc 로 닫습니다'],
            ['Tabs', 'ScrollTabs — 4개 이상이면 가로 스크롤'],
            ['폼 하단 버튼', 'BottomActions — 화면 하단 고정'],
          ]}
        />
      </Section>
    </>
  ),
};

/* — 인쇄 / PDF — */
export const Print: StoryObj = {
  name: '인쇄 / PDF',
  render: () => (
    <>
      <Section title="print.css" note="@modul/tokens/print.css 를 함께 넣으면 인쇄 시 잉크와 레이아웃이 정리됩니다. 화면 전용 요소는 빠지고 링크는 URL 이 붙습니다.">
        <Table
          head={['규칙', '이유']}
          rows={[
            ['배경 제거 · 텍스트 검정', '잉크를 아끼고 대비를 확보합니다'],
            ['오버레이·내비·버튼 숨김', '종이에서는 누를 수 없는 요소입니다'],
            ['외부 링크 뒤에 URL 표기', '종이에서 링크는 주소가 보여야 따라갈 수 있습니다'],
            ['.richtext orphans/widows 3', '문단이 페이지 끝에서 한 줄만 남지 않게 합니다'],
            ['표 헤더 반복', '여러 장에 걸친 표에서 열 이름을 잃지 않습니다'],
          ]}
        />
        <p style={{ fontSize: 13, color: 'var(--color-neutral-700)', marginTop: 12 }}>
          확인은 브라우저 인쇄 미리보기(⌘P)로 합니다.
        </p>
      </Section>
    </>
  ),
};

/* — 성능 예산 — */
export const Budget: StoryObj = {
  name: '성능 예산',
  render: () => (
    <>
      <Section title="번들 (gzip)" note="CI 의 size-limit 이 이 표를 강제합니다. 초과하면 빌드가 실패합니다.">
        <Table
          head={['측정', '예산']}
          rows={[
            ['@modul/tokens css', '8 KB'],
            ['@modul/ui — Button+Input+Tag+Card', '4 KB'],
            ['@modul/ui — 전부 (MODUL 코드)', '30 KB'],
            ['@modul/ui — 전부 (Radix 포함)', '74 KB'],
            ['@modul/motion — 훅 + Marquee/Reveal', '3 KB'],
          ]}
        />
        <p style={{ fontSize: 13, color: 'var(--color-neutral-700)', marginTop: 12, maxWidth: '62ch' }}>
          엔트리를 컴포넌트별로 나눠서 <Code>Button</Code> 만 import 하면 Radix 가 따라오지 않습니다. 배럴 하나로 묶으면 최상단 import 문이 트리셰이킹 뒤에도 남습니다.
        </p>
      </Section>
      <Section title="상호작용" note="측정은 스토리북 test-runner 와 앱 셸의 web-vitals 에서 합니다.">
        <Table
          head={['지표', '목표 p75']}
          rows={[
            ['INP', '≤ 200ms · 오버레이 열림 ≤ 100ms'],
            ['Combobox 입력 → 결과', '≤ 150ms 로컬 · ≤ 400ms 원격'],
            ['CLS', '0 — 오버레이 절대 위치 · 스켈레톤 동일 높이 · 인라인 편집 동일 박스'],
          ]}
        />
      </Section>
      <Section title="DOM 노드" note="1,000행부터는 Table 의 virtual 을 켭니다. 고정 높이 가상화라 외부 의존이 없습니다.">
        <Code>{'<Table rows={rows} columns={cols} rowKey="id" stickyHeader virtual={{ rowHeight: 44, height: 560 }} />'}</Code>
      </Section>
    </>
  ),
};
