import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag } from './Tag';
const meta: Meta<typeof Tag> = { title: 'Components/Tag', component: Tag, args: { children: '진행중', variant: 'accent' }, argTypes: { variant: { control: 'inline-radio', options: ['accent', 'neutral', 'outline'] } } };
export default meta;
type S = StoryObj<typeof Tag>;
export const Accent: S = {};
export const All: S = { render: () => <div style={{ display: 'flex', gap: 8 }}><Tag variant="accent">진행중</Tag><Tag variant="neutral">검토</Tag><Tag variant="outline">완료</Tag></div> };
export const AsLink: S = { render: () => <Tag as="a" href="/status" variant="outline">상태 보기</Tag> };
