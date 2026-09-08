import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import radio from '../../../../docs/radio/Switch.md?raw';
import { radioDescription } from '../storybook-radio';
import { Switch } from './Switch';
const meta: Meta<typeof Switch> = { title: 'Components/Switch', component: Switch, tags: ['autodocs'], parameters: { docs: { description: { component: radioDescription(radio) } } } };
export default meta;
export const Default: StoryObj<typeof Switch> = { render: () => { const [checked, setChecked] = useState(true); return <Switch checked={checked} onCheckedChange={setChecked} label="위치 권한" hint="근처 매장 검색에 사용합니다." name="geo" />; } };
export const Compact: StoryObj<typeof Switch> = { render: () => { const [checked, setChecked] = useState(false); return <Switch checked={checked} onCheckedChange={setChecked} label="푸시 알림" size="sm" labels />; } };
