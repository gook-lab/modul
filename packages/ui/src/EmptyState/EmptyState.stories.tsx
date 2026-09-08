import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import radio from '../../../../docs/radio/EmptyState.md?raw';
import { radioDescription } from '../storybook-radio';
import { EmptyState, type ViewState } from './EmptyState';
const meta: Meta<typeof EmptyState> = { title: 'Components/EmptyState', component: EmptyState, tags: ['autodocs'], parameters: { layout: 'padded', docs: { description: { component: radioDescription(radio) } } } };
export default meta;
export const States: StoryObj<typeof EmptyState> = { render: () => { const [kind, setKind] = useState<'loading' | 'empty' | 'error' | 'offline' | 'ready'>('empty'); const views = { loading: { kind: 'loading' }, empty: { kind: 'empty' }, error: { kind: 'error', message: '서버가 응답하지 않았습니다', retry: () => setKind('loading') }, offline: { kind: 'offline' }, ready: { kind: 'ready', data: ['라프로익 10', '아드벡 우가달'] } } satisfies Record<typeof kind, ViewState<string[]>>; return <div style={{ display: 'grid', gap: 16 }}><div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{(Object.keys(views) as (keyof typeof views)[]).map(value => <button key={value} className={`btn ${value === kind ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setKind(value)}>{value}</button>)}</div><div style={{ border: '1px solid var(--color-divider)', minHeight: 220 }}><EmptyState view={views[kind]} empty={{ title: '아직 보틀이 없습니다', body: '첫 보틀을 추가하면 상태를 여기서 확인할 수 있습니다.' }}>{data => <ul>{data.map(item => <li key={item}>{item}</li>)}</ul>}</EmptyState></div></div>; } };
