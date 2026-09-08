import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import radio from '../../../../docs/radio/FileDrop.md?raw';
import { radioDescription } from '../storybook-radio';
import { FileDrop, type UploadItem } from './FileDrop';
const meta: Meta<typeof FileDrop> = { title: 'Components/FileDrop', component: FileDrop, tags: ['autodocs'], parameters: { layout: 'padded', docs: { description: { component: radioDescription(radio) } } } };
export default meta;
export const Default: StoryObj<typeof FileDrop> = { render: () => { const [files, setFiles] = useState<UploadItem[]>([{ id: 'note', name: '테이스팅노트.pdf', size: 240_000, progress: 100 }, { id: 'label', name: '라벨.png', size: 1_200_000, progress: 62 }]); const [message, setMessage] = useState(''); return <div style={{ display: 'grid', gap: 12, width: 460 }}><FileDrop title="파일을 끌어다 놓거나 선택" hint="PDF · 이미지, 2MB까지" accept="image/*,.pdf" maxSize={2e6} max={5} files={files} onFiles={next => setFiles(current => [...current, ...next.map(file => ({ id: file.name, name: file.name, size: file.size, progress: 0 }))])} onRemove={id => setFiles(current => current.filter(file => file.id !== id))} onReject={(_, messages) => setMessage(messages.join(' · '))} />{message && <div role="alert" style={{ fontSize: 12, color: 'var(--color-accent-700)' }}>{message}</div>}</div>; } };
