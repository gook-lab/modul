import type { Meta, StoryObj } from '@storybook/react-vite';
import radio from '../../../../docs/radio/Toast.md?raw';
import { radioDescription } from '../storybook-radio';
import { Button } from '../Button/Button';
import { ToastProvider, useToast } from './Toast';

const meta: Meta<typeof ToastProvider> = {
  title: 'Components/Toast', component: ToastProvider, tags: ['autodocs'],
  parameters: { layout: 'padded', docs: { description: { component: radioDescription(radio) } } },
};
export default meta;
type Story = StoryObj<typeof ToastProvider>;

function Demo() { const toast = useToast(); return <div style={{ display: 'flex', gap: 8 }}><Button onClick={() => toast.show('보틀을 캐비닛에서 뺐습니다', { action: { label: '되돌리기', run: () => {} } })}>토스트</Button><Button variant="secondary" onClick={() => toast.show('저장에 실패했습니다', { tone: 'error' })}>실패 토스트</Button></div>; }
export const Default: Story = { render: () => <ToastProvider><Demo /></ToastProvider> };
