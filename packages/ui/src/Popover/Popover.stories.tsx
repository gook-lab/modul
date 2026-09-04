import type { Meta, StoryObj } from '@storybook/react-vite';
import { Popover, Menu } from './Popover';
import { Button } from '../Button/Button';

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover & Menu',
  component: Popover,
  tags: ['autodocs'],
  argTypes: { trigger: { control: false }, align: { control: 'inline-radio', options: ['start', 'center', 'end'] } },
  parameters: { docs: { description: { component: 'Radix Popover / DropdownMenu. 트리거는 소비자가 넘기고, 열림 상태는 비제어가 기본입니다.' } } },
};
export default meta;

export const Default: StoryObj<typeof Popover> = {
  args: {
    trigger: <Button variant="secondary">필터</Button>,
    children: <div style={{ display: 'grid', gap: 8, minWidth: 200 }}><strong style={{ fontSize: 13 }}>기간</strong><span style={{ fontSize: 12 }}>최근 7일 · 30일 · 전체</span></div>,
  },
};

export const MenuStory: StoryObj<typeof Menu> = {
  name: 'Menu',
  render: () => (
    <Menu
      trigger={<Button variant="ghost">더 보기</Button>}
      items={[
        { label: '이름 바꾸기', kbd: 'F2' },
        { label: '복제', kbd: '⌘D' },
        'separator',
        { label: '삭제', tone: 'danger' },
      ]}
    />
  ),
};
