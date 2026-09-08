import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import radio from '../../../../docs/radio/Drawer.md?raw';
import { radioDescription } from '../storybook-radio';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Drawer } from './Drawer';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer', component: Drawer, tags: ['autodocs'],
  parameters: { layout: 'padded', docs: { description: { component: radioDescription(radio) } } },
};
export default meta;
type Story = StoryObj<typeof Drawer>;

export const Default: Story = { render: () => { const [open, setOpen] = useState(false); return <><Button onClick={() => setOpen(true)}>드로어 열기</Button><Drawer open={open} onClose={() => setOpen(false)} title="새 프로젝트" aria-label="새 프로젝트" footer={<><Button onClick={() => setOpen(false)}>저장</Button><Button variant="secondary" onClick={() => setOpen(false)}>취소</Button></>}><Input label="이름" name="name" /><Input label="담당" name="owner" /></Drawer></>; } };
