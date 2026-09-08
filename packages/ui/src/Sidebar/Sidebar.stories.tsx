import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import radio from '../../../../docs/radio/Sidebar.md?raw';
import { radioDescription } from '../storybook-radio';
import { Sidebar } from './Sidebar';

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Sidebar', component: Sidebar, tags: ['autodocs'],
  parameters: { layout: 'padded', docs: { description: { component: radioDescription(radio) } } },
};
export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = { render: () => { const [collapsed, setCollapsed] = useState(false); const [active, setActive] = useState('proj'); return <div style={{ height: 320, display: 'flex', border: '1px solid var(--color-divider)' }}><Sidebar brand="Console" collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} activeId={active} onSelect={setActive} aria-label="주 메뉴" items={[{ id: 'dash', label: '대시보드', icon: '▦' }, { id: 'proj', label: '프로젝트', icon: '◈', badge: 4 }, { id: 'team', label: '팀', icon: '◯' }, { id: 'set', label: '설정', icon: '⚙' }]} /></div>; } };
