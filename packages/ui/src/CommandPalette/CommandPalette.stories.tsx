import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CommandPalette } from './CommandPalette';
import { Button } from '../Button/Button';

const groups = [
  { name: '이동', items: [{ label: '대시보드', kbd: 'G D', run: () => {} }, { label: '프로젝트', kbd: 'G P', run: () => {} }] },
  { name: '작업', items: [{ label: '새 프로젝트', kbd: '⌘N', keywords: ['create', '생성'], run: () => {} }, { label: '테마 바꾸기', run: () => {} }] },
];

const meta: Meta<typeof CommandPalette> = {
  title: 'Components/CommandPalette',
  component: CommandPalette,
  tags: ['autodocs'],
  argTypes: { open: { control: 'boolean' }, groups: { control: false }, onOpenChange: { control: false }, placeholder: { control: 'text' } },
  parameters: { docs: { description: { component: 'cmdk 기반. 열림 상태는 앱이 소유하고, hotkey(⌘K) 는 컴포넌트가 등록합니다.' } } },
};
export default meta;
type S = StoryObj<typeof CommandPalette>;

/** 닫힌 상태 — 트리거만 렌더합니다(⌘K 로도 열립니다). */
export const Default: S = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>명령 팔레트 열기 (⌘K)</Button>
        <CommandPalette open={open} onOpenChange={setOpen} groups={groups} />
      </>
    );
  },
};
