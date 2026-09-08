import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import radio from '../../../../docs/radio/Boundary.md?raw';
import { Skeleton } from '@gook-lab/motion';
import { radioDescription } from '../storybook-radio';
import { Button } from '../Button/Button';
import { Boundary } from './Boundary';
function Demo({ crash }: { crash: boolean }) { if (crash) throw new Error('시세를 불러오지 못했습니다'); return <div style={{ padding: 20 }}>위젯이 정상입니다.</div>; }
const meta: Meta<typeof Boundary> = { title: 'Components/Boundary', component: Boundary, tags: ['autodocs'], parameters: { layout: 'padded', docs: { description: { component: radioDescription(radio) } } } };
export default meta;
export const ErrorAndRecovery: StoryObj<typeof Boundary> = { render: () => { const [crash, setCrash] = useState(true); return <div style={{ display: 'grid', gap: 12, width: 460 }}><Button variant="secondary" size="sm" onClick={() => setCrash(current => !current)}>{crash ? '복구하기' : '오류 만들기'}</Button><div style={{ border: '1px solid var(--color-divider)', minHeight: 200 }}><Boundary resetKeys={[crash]} skeleton={<Skeleton.Text lines={3} />}><Demo crash={crash} /></Boundary></div></div>; } };
