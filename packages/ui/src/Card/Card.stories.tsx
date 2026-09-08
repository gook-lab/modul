import type { Meta, StoryObj } from '@storybook/react-vite';
import radio from '../../../../docs/radio/Card.md?raw';
import { radioDescription } from '../storybook-radio';
import { Card } from './Card';
const meta: Meta<typeof Card> = {
  title: 'Components/Card', component: Card, tags: ['autodocs'],
  args: { kicker: '디자인 시스템', title: 'MODUL 컴포넌트 라이브러리', children: '모듈러 그리드 위에서 표면색 하나로 구분되는 카드.', elevation: 'none', meta: '2026.09 · 디자인 시스템' },
  argTypes: { elevation: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg'] } },
  decorators: [S => <div style={{ width: 300 }}><S /></div>],
  parameters: { docs: { description: { component: radioDescription(radio) } } },
};
export default meta;
type S = StoryObj<typeof Card>;
export const Default: S = {};
export const Elevated: S = { args: { elevation: 'md' } };
/** 카드 전체를 누르게 만들 때 — article 에 role="button" 을 얹으면 aria-allowed-role 위반입니다. 카드 안에 실제 버튼을 둡니다. */
export const Clickable: S = {
  args: {
    children: '카드 자체는 article 로 두고, 동작은 안에 있는 버튼이 받습니다.',
    meta: <button type="button" className="btn btn-ghost btn-sm" onClick={() => {}}>자세히 보기</button>,
  },
};
