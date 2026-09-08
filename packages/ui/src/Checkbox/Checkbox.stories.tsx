import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox, RadioGroup } from './Checkbox';

const radioDocs = `
Checkbox와 RadioGroup의 상태·키보드 동작은 Radix가 담당하고, MODUL은 라벨·힌트·레이아웃을 제공합니다.

## RADIO

### R — Requirements
- 체크·불확정·비활성 상태와 stack·inline·cards 레이아웃을 제공합니다.
- Radio는 방향키로 항목을 이동하고 선택하며, 각 행은 최소 44px의 클릭 영역을 확보합니다.
- 옵션이 7개를 넘으면 Select 사용을 권장합니다.

### A — Architecture
- Radix가 상태·키보드·폼의 hidden input을 관리합니다.
- 선택 값은 부모가 소유하며 Checkbox는 boolean, RadioGroup은 문자열로 전달합니다.

### D — Data Model
\`RadioOption<V> = { value: V; label: ReactNode; hint?: ReactNode; disabled?: boolean }\`

### I — Interface
- Checkbox: \`checked\`, \`onCheckedChange\`, \`label\`, \`hint\`, \`layout\`
- RadioGroup: \`value\`, \`onValueChange\`, \`options\`, \`layout\`

### O — Optimization & Observability
- 상태 표현은 Radix의 상태와 CSS에 맡깁니다.
- 라벨과 설명은 접근 가능한 이름과 설명으로 연결합니다.
`;

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox & Radio',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: radioDocs } },
  },
  decorators: [Story => <div style={{ maxWidth: 560 }}><Story /></div>],
};
export default meta;

type Story = StoryObj<typeof Checkbox>;

export const CheckboxStates: Story = {
  name: 'Checkbox states',
  render: () => {
    const [checked, setChecked] = useState<boolean | 'indeterminate'>('indeterminate');
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <Checkbox checked={checked} onCheckedChange={setChecked} label="이메일 알림" hint="모임 확정·변경 시 알려드립니다." />
        <Checkbox checked={false} onCheckedChange={() => {}} label="선택 안 됨" />
        <Checkbox checked disabled onCheckedChange={() => {}} label="비활성 상태" />
      </div>
    );
  },
};

export const RadioLayouts: Story = {
  name: 'Radio layouts',
  render: () => {
    const [value, setValue] = useState<'email' | 'push' | 'none'>('email');
    const options = [
      { value: 'email' as const, label: '이메일', hint: '확정·변경 시' },
      { value: 'push' as const, label: '푸시', hint: '새 알림을 바로 확인' },
      { value: 'none' as const, label: '받지 않음', disabled: true },
    ];
    return (
      <div style={{ display: 'grid', gap: 28 }}>
        <RadioGroup label="알림 방식 — 세로" value={value} onValueChange={setValue} layout="stack" options={options} />
        <RadioGroup label="알림 방식 — 가로" value={value} onValueChange={setValue} layout="inline" options={options} />
        <RadioGroup label="알림 방식 — 카드" value={value} onValueChange={setValue} layout="cards" options={options} />
      </div>
    );
  },
};
