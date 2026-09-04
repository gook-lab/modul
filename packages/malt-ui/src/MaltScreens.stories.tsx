import { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import {
  AppBar, Alert, Avatar, AvatarGroup, Breadcrumb, Button, Card, EmptyState,
  Input, Sheet, Tag, ToastProvider, useToast, type ViewState,
} from '@modul/ui';
import { ScrollTabs } from '@modul/ui';
import * as RTabs from '@radix-ui/react-tabs';
import { Skeleton } from '@modul/motion';
import { StockBadge, type StockStatus } from './StockBadge';
import { IndexRow } from './IndexRow';
import { ChipGroup } from './ChipGroup';

/**
 * 시안(Storybook.dc.html)의 F4 · F5 화면입니다. 새 컴포넌트를 만들지 않고
 * 코어 + 도메인 프리미티브만으로 조립해서, 화면 하나를 만들 때 무엇이 비는지 봅니다.
 * 390px 모바일 폭 · Malt 테마가 기준입니다.
 */
export default {
  title: 'Domain/Malt 화면',
  parameters: { layout: 'centered' },
  decorators: [
    (Story: () => JSX.Element) => (
      <div
        data-theme="malt"
        style={{
          width: 390, height: 760, overflow: 'auto', position: 'relative',
          border: '1px solid var(--color-divider)',
          background: 'var(--color-bg)', color: 'var(--color-text)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

const Photo = ({ h = 132, label }: { h?: number; label: string }) => (
  <div
    role="img"
    aria-label={label}
    style={{
      height: h, background: 'var(--color-neutral-300)', display: 'grid', placeItems: 'center',
      // neutral-300 배경 위라 neutral-700 은 4.22 입니다 — 대비 검수 7번과 같은 사례라 한 단계 더 씁니다.
      fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-neutral-800)',
      filter: 'grayscale(1)',
    }}
  >
    {label}
  </div>
);

/* ── F4 · 피드 ───────────────────────────────────────────── */

type Meet = { id: string; theme: string; when: string; title: string; host: string; seats: string; isNew?: boolean };
const MEETS: Meet[] = [
  { id: 'm1', theme: '아일라 나이트', when: '9월 6일 (토) 19:00', title: '피트 입문자를 위한 다섯 잔', host: '윤성국', seats: '4 / 6', isNew: true },
  { id: 'm2', theme: '셰리 캐스크', when: '9월 9일 (화) 20:00', title: '올로로소 vs PX 비교 시음', host: '김하늘', seats: '6 / 6' },
  { id: 'm3', theme: '재패니즈', when: '9월 13일 (토) 18:30', title: '하쿠슈 세로 테이스팅', host: '이도현', seats: '2 / 8' },
];

function Feed() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [chip, setChip] = useState<'all' | 'near' | 'new' | ''>('all');
  const [sheet, setSheet] = useState(false);
  const [loading, setLoading] = useState(false);

  const shown = MEETS.filter(m => !q || m.title.includes(q) || m.theme.includes(q));

  return (
    <>
      <AppBar
        title="Malt Index"
        actions={<Button variant="ghost" size="sm" onClick={() => setSheet(true)}>제보하기</Button>}
      />
      <div style={{ padding: '12px 16px', display: 'grid', gap: 12 }}>
        <Input
          label="검색"
          placeholder="보틀 · 모임 · 매장 찾기"
          value={q}
          onChange={e => setQ(e.target.value)}
          type="search"
        />
        <ChipGroup
          label="필터"
          value={chip}
          onChange={setChip}
          options={[{ value: 'all', label: '전체' }, { value: 'near', label: '가까운 순' }, { value: 'new', label: '새 자리' }]}
        />
        <Alert
          tone="info"
          title="참석 확정을 기다리는 자리가 있습니다"
          action={{ label: '확정하기', onClick: () => toast.show('참석을 확정했습니다', { action: { label: '되돌리기', run: () => {} } }) }}
        />
      </div>

      <div style={{ padding: '0 16px 24px', display: 'grid', gap: 12, flex: 1 }}>
        {loading
          ? [0, 1, 2].map(i => <Skeleton.Card key={i} lines={2} />)
          : shown.map(m => (
              <Card key={m.id} onClick={() => setSheet(true)} style={{ cursor: 'pointer', overflow: 'hidden' }}>
                <Photo label="매장 사진" />
                <div style={{ padding: 14, display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Tag variant="outline">{m.theme}</Tag>
                    {m.isNew && <Tag variant="accent">새 자리</Tag>}
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--color-neutral-700)', fontVariantNumeric: 'tabular-nums' }}>{m.when}</span>
                  </div>
                  <b className="card-title" style={{ fontSize: 17 }}>{m.title}</b>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-neutral-700)' }}>
                    <Avatar name={m.host} size="sm" />
                    <span>호스트 {m.host}</span>
                    <span style={{ marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' }}>{m.seats}</span>
                  </div>
                </div>
              </Card>
            ))}
        {!loading && shown.length === 0 && (
          <EmptyState view={{ kind: 'empty' }} empty={{ title: '찾는 자리가 없습니다', body: '검색어를 지우면 이번 주 전체를 봅니다.', action: { label: '검색 지우기', onClick: () => setQ('') } }}>
            {() => null}
          </EmptyState>
        )}
        <Button variant="secondary" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 900); }}>
          스켈레톤 보기
        </Button>
      </div>

      <Sheet open={sheet} onClose={() => setSheet(false)} title="자리 제보">
        <div style={{ display: 'grid', gap: 12, padding: '4px 0 12px' }}>
          <Input label="매장 이름" placeholder="예: 몰트바 오크" />
          <Input label="본 날짜" type="date" />
          <Button onClick={() => { setSheet(false); toast.show('제보를 보냈습니다'); }}>보내기</Button>
        </div>
      </Sheet>
    </>
  );
}

export const F4Feed: StoryObj = {
  name: 'F4 · 피드',
  render: () => <ToastProvider position="bottom-center"><Feed /></ToastProvider>,
};

/* ── F5 · 매장 상세 ──────────────────────────────────────── */

type Bottle = { no: number; name: string; status: StockStatus; stock: string; seen: string };
const BOTTLES: Bottle[] = [
  { no: 1, name: '라프로익 10', status: 'IN_STOCK', stock: '보유', seen: '2일 전' },
  { no: 2, name: '아드벡 우가달', status: 'LOW', stock: '소량', seen: '5일 전' },
  { no: 3, name: '탈리스커 10', status: 'SOLD_OUT', stock: '소진', seen: '3주 전' },
  { no: 4, name: '보모어 12', status: 'PRICE_ONLY', stock: '시세만', seen: '1주 전' },
];

const Stat3 = ({ label, value }: { label: string; value: string }) => (
  <div style={{ display: 'grid', gap: 2, justifyItems: 'center', flex: 1 }}>
    <b style={{ fontSize: 18, fontVariantNumeric: 'tabular-nums' }}>{value}</b>
    <span style={{ fontSize: 11, color: 'var(--color-neutral-700)' }}>{label}</span>
  </div>
);

function Shop() {
  const [tab, setTab] = useState('bottles');
  const [follow, setFollow] = useState(false);
  const [sheet, setSheet] = useState<Bottle | null>(null);
  const meetings: ViewState<string[]> = { kind: 'empty' };

  return (
    <>
      <AppBar title="몰트바 오크" onBack={() => {}} />
      <div style={{ padding: '0 16px 8px' }}>
        <Breadcrumb
          items={[{ label: '탐색', href: '#' }, { label: '매장', href: '#' }, { label: '몰트바 오크' }]}
        />
      </div>
      <Photo label="매장 사진 · grayscale" h={160} />

      <div style={{ padding: 16, display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ display: 'grid', gap: 4, minWidth: 0 }}>
            <span style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-neutral-700)' }}>몰트바 · 서울 마포</span>
            <b className="card-title" style={{ fontSize: 22 }}>몰트바 오크</b>
          </div>
          <Button variant={follow ? 'secondary' : 'primary'} size="sm" style={{ marginLeft: 'auto', flex: 'none' }} onClick={() => setFollow(v => !v)}>
            {follow ? '팔로우 중' : '팔로우'}
          </Button>
        </div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--color-neutral-700)' }}>
          아일라 80종. 콜키지 가능(잔당 5,000원). 수요일 휴무.
        </p>
        <div style={{ display: 'flex', padding: '12px 0', borderTop: '1px solid var(--color-divider)', borderBottom: '1px solid var(--color-divider)' }}>
          <Stat3 label="목격 기록" value="128" />
          <Stat3 label="보틀" value="80" />
          <Stat3 label="모임" value="4" />
        </div>
        <Alert tone="warning" title="오프라인 — 2시간 전 받은 목록입니다" action={{ label: '다시 시도', onClick: () => {} }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AvatarGroup max={3} people={[{ name: '윤성국' }, { name: '김하늘' }, { name: '이도현' }, { name: '박서준' }]} />
          <span style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>12명이 팔로우합니다</span>
        </div>
      </div>

      <ScrollTabs
        value={tab}
        onValueChange={setTab}
        items={[{ value: 'bottles', label: '보틀' }, { value: 'meets', label: '모임' }, { value: 'reviews', label: '기록' }]}
      >
        <RTabs.Content value="bottles" style={{ display: 'grid' }}>
          {BOTTLES.map(b => (
            <IndexRow
              key={b.no}
              index={b.no}
              title={b.name}
              meta={b.seen}
              sub={<StockBadge status={b.status} label={b.stock} />}
              onClick={() => setSheet(b)}
            />
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
            <span style={{ fontSize: 12, color: 'var(--color-neutral-700)', fontVariantNumeric: 'tabular-nums' }}>20 / 80</span>
            <Button variant="secondary" size="sm" style={{ marginLeft: 'auto' }}>더 보기</Button>
          </div>
        </RTabs.Content>

        <RTabs.Content value="meets" style={{ padding: 8 }}>
          <EmptyState
            view={meetings}
            empty={{
              title: '이 매장에서 열리는 모임이 아직 없습니다',
              body: '첫 모임을 열면 이 매장을 팔로우하는 12명에게 알림이 갑니다.',
              action: { label: '여기서 모임 열기', onClick: () => {} },
            }}
          >
            {() => null}
          </EmptyState>
        </RTabs.Content>

        <RTabs.Content value="reviews" style={{ padding: 16, display: 'grid', gap: 12 }}>
          <Skeleton.List rows={3} />
        </RTabs.Content>
      </ScrollTabs>

      <Sheet open={!!sheet} onClose={() => setSheet(null)} title={sheet?.name ?? ''}>
        {sheet && (
          <div style={{ display: 'grid', gap: 12, padding: '4px 0 12px' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <StockBadge status={sheet.status} label={sheet.stock} />
              <span style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>마지막 목격 {sheet.seen}</span>
            </div>
            <Button onClick={() => setSheet(null)}>목격 기록 남기기</Button>
          </div>
        )}
      </Sheet>
    </>
  );
}

export const F5Shop: StoryObj = { name: 'F5 · 매장 상세', render: () => <Shop /> };
