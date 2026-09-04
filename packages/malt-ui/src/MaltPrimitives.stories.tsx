import { useState } from 'react';
import type { StoryObj } from '@storybook/react-vite';
import { StockBadge, type StockStatus } from './StockBadge';
import { AmountBar } from './AmountBar';
import { StepBar } from './StepBar';
import { Toggle } from './Toggle';
import { ChipGroup } from './ChipGroup';
import { NumberField } from './NumberField';
import { IndexRow } from './IndexRow';

/**
 * 위스키 앱 전용 프리미티브 7종. 코어(@modul/ui)로 승격하지 않습니다 — 도메인 어휘가
 * 들어가 있어서 다른 앱에서는 이름이 맞지 않습니다(PROMPT 4장).
 * Malt 테마에서 보는 것이 기준이라 스토리 전체를 data-theme=malt 로 감쌉니다.
 */
export default {
  title: 'Domain/Malt 프리미티브',
  decorators: [
    (Story: () => JSX.Element) => (
      <div data-theme="malt" style={{ background: 'var(--color-bg)', padding: 24, minWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: 'grid', gap: 8, marginBottom: 28 }}>
    <span style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-neutral-700)' }}>{label}</span>
    {children}
  </div>
);

const STOCK: { status: StockStatus; label: string }[] = [
  { status: 'IN_STOCK', label: '보유' },
  { status: 'LOW', label: '소량' },
  { status: 'SOLD_OUT', label: '소진' },
  { status: 'PRICE_ONLY', label: '시세만' },
];

export const StockBadgeStory: StoryObj = {
  name: 'StockBadge — 상태 4종',
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {STOCK.map(s => <StockBadge key={s.status} status={s.status} label={s.label} />)}
    </div>
  ),
};

export const AmountBarStory: StoryObj = {
  name: 'AmountBar — 잔량',
  render: () => (
    <div style={{ display: 'grid', gap: 14 }}>
      {[92, 55, 18].map(p => (
        <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <AmountBar percent={p} low={p < 25} label={`잔량 ${p}%`} />
          <span style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', color: 'var(--color-neutral-700)' }}>{p}%</span>
        </div>
      ))}
    </div>
  ),
};

export const StepBarStory: StoryObj = {
  name: 'StepBar — 진행',
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      {[1, 2, 3].map(s => <StepBar key={s} step={s} total={3} />)}
    </div>
  ),
};

export const FormBits: StoryObj = {
  name: 'Toggle · ChipGroup · NumberField',
  render: () => {
    const [on, setOn] = useState(true);
    const [chip, setChip] = useState<'islay' | 'speyside' | ''>('islay');
    const [amount, setAmount] = useState<number | ''>(700);
    return (
      <>
        <Row label="Toggle"><Toggle on={on} onChange={() => setOn(v => !v)} label="미개봉만 보기" /></Row>
        <Row label="ChipGroup">
          <ChipGroup
            label="지역"
            value={chip}
            onChange={setChip}
            options={[{ value: 'islay', label: '아일라' }, { value: 'speyside', label: '스페이사이드' }]}
          />
        </Row>
        <Row label="NumberField">
          <NumberField aria-label="용량" value={amount} onChange={setAmount} min={0} max={1000} step={50} suffix="ml" />
        </Row>
      </>
    );
  },
};

export const IndexRowStory: StoryObj = {
  name: 'IndexRow — 목록 행',
  render: () => (
    <div style={{ display: 'grid' }}>
      {[
        { i: 1, title: '라프로익 10', meta: '58,000원', sub: <StockBadge status="IN_STOCK" label="보유" /> },
        { i: 2, title: '아드벡 우가달', meta: '92,000원', sub: <StockBadge status="LOW" label="소량" /> },
        // 소진 상태는 배지로 알립니다 — opacity 로 행을 흐리게 하면 읽어야 하는 텍스트가 4.5:1 아래로 떨어집니다.
        { i: 3, title: '탈리스커 10', meta: '61,000원', sub: <StockBadge status="SOLD_OUT" label="소진" /> },
      ].map(r => (
        <IndexRow key={r.i} index={r.i} title={r.title} meta={r.meta} sub={r.sub} onClick={() => {}} />
      ))}
    </div>
  ),
};
