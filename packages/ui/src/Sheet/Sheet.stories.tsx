import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import radio from '../../../../docs/radio/Sheet.md?raw';
import { radioDescription } from '../storybook-radio';
import { Button } from '../Button/Button';
import { Sheet } from './Sheet';

const meta: Meta<typeof Sheet> = {
  title: 'Components/Sheet', component: Sheet, tags: ['autodocs'],
  parameters: { layout: 'padded', docs: { description: { component: radioDescription(radio) } } },
};
export default meta;
type Story = StoryObj<typeof Sheet>;

export const Default: Story = { render: () => { const [open, setOpen] = useState(false); return <><Button onClick={() => setOpen(true)}>시트 열기</Button><Sheet open={open} onClose={() => setOpen(false)} title="참석을 취소할까요?" description="하루 전까지는 취소해도 기록에 남지 않습니다."><Button onClick={() => setOpen(false)}>취소하기</Button><Button variant="secondary" onClick={() => setOpen(false)}>그대로 두기</Button></Sheet></>; } };
