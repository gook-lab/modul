import type { Meta, StoryObj } from '@storybook/react-vite';
import radio from '../../../../docs/radio/Stat.md?raw';
import { radioDescription } from '../storybook-radio';
import { Stat } from './Stat';
const meta: Meta<typeof Stat> = { title: 'Components/Stat', component: Stat, tags: ['autodocs'], parameters: { layout: 'padded', docs: { description: { component: radioDescription(radio) } } } };
export default meta;
export const Dashboard: StoryObj<typeof Stat> = { render: () => <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2, background: 'var(--color-divider)', padding: 2 }}><Stat label="진행 중 모임" value={4} delta={{ value: '+1', period: '이번 주', direction: 'up' }} sparkline={[3, 3, 2, 4, 3, 4, 4]} /><Stat label="참석률" value={92.4} unit="%" decimals={1} tone="accent" delta={{ value: '−1.2', period: '지난달', direction: 'down' }} /></div> };
