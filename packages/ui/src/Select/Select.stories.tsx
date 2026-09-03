import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';
import { Combobox } from '../Combobox/Combobox';

const meta: Meta = { title: 'Components/Select & Combobox', decorators: [S => <div style={{ width: 340, minHeight: 320 }}><S /></div>] };
export default meta;
type St = 'active' | 'review' | 'done';
const STATUS = [{ value: 'active' as St, label: '진행중', hint: 4, dot: 'accent' as const }, { value: 'review' as St, label: '검토', hint: 2 }, { value: 'done' as St, label: '완료', hint: 6 }];

export const SelectStory: StoryObj = { name: 'Select', render: () => { const [v, s] = useState<St | null>(null); return <Select label="상태" options={STATUS} value={v} onChange={s} name="status" />; } };
export const SelectNative: StoryObj = { name: 'Select — native', render: () => { const [v, s] = useState<St | null>(null); return <Select native label="상태" options={STATUS} value={v} onChange={s} name="status" />; } };

const BOTTLES = [
  { value: 'lap10', label: '라프로익 10', group: '아일라', hint: '피티', keywords: ['laphroaig'] },
  { value: 'ard', label: '아드벡 우가달', group: '아일라', hint: '피티' },
  { value: 'gf15', label: '글렌파클라스 15', group: '스페이사이드', hint: '셰리' },
  { value: 'gm10', label: '글렌모렌지 10', group: '하이랜드', hint: '플로럴' },
];
export const ComboboxSingle: StoryObj = { name: 'Combobox', render: () => { const [v, s] = useState<string | null>(null); return <Combobox label="보틀 찾기" placeholder="이름 · 지역" options={BOTTLES} value={v} onChange={s} creatable={q => alert('추가: ' + q)} />; } };
export const ComboboxMulti: StoryObj = { name: 'Combobox — multiple', render: () => { const [v, s] = useState<string[]>(['lap10']); return <Combobox multiple label="보틀 (여러 개)" options={BOTTLES} value={v} onChange={s} />; } };
