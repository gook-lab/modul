import type { Meta, StoryObj } from '@storybook/react-vite';
import radio from '../../../docs/radio/Skeleton.md?raw';
import { Skeleton } from './Skeleton';
const description = radio.trim().replace(/^#\s+[^\n]+\n+/, '').replace(/^>\s?/gm, '').trim();
const meta: Meta<typeof Skeleton.Text> = { title: 'Components/Skeleton', component: Skeleton.Text, tags: ['autodocs'], parameters: { layout: 'padded', docs: { description: { component: description } } } };
export default meta;
export const Presets: StoryObj<typeof Skeleton.Text> = { render: () => <div style={{ display: 'grid', gap: 28 }}><Skeleton.Text lines={3} /><Skeleton.List rows={3} /><Skeleton.Table rows={3} cols={4} /><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}><Skeleton.Card /><Skeleton.Card /><Skeleton.Card /></div></div> };
