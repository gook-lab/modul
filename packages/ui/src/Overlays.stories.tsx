import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Drawer } from './Drawer/Drawer';
import { Sheet } from './Sheet/Sheet';
import { ToastProvider, useToast } from './Toast/Toast';
import { Sidebar } from './Sidebar/Sidebar';
import { Button } from './Button/Button';
import { Input } from './Input/Input';

const meta: Meta = { title: 'Overlays', parameters: { layout: 'padded' } };
export default meta;

export const DrawerStory: StoryObj = { name: 'Drawer', render: () => { const [o, s] = useState(false); return (<>
  <Button onClick={() => s(true)}>드로어 열기</Button>
  <Drawer open={o} onClose={() => s(false)} title="새 프로젝트" aria-label="새 프로젝트" footer={<><Button onClick={() => s(false)}>저장</Button><Button variant="secondary" onClick={() => s(false)}>취소</Button></>}>
    <Input label="이름" name="name" /><Input label="담당" name="owner" />
  </Drawer></>); } };

export const SheetStory: StoryObj = { name: 'Sheet', render: () => { const [o, s] = useState(false); return (<>
  <Button onClick={() => s(true)}>시트 열기</Button>
  <Sheet open={o} onClose={() => s(false)} title="참석을 취소할까요?" description="하루 전까지는 취소해도 기록에 남지 않습니다.">
    <Button onClick={() => s(false)}>취소하기</Button><Button variant="secondary" onClick={() => s(false)}>그대로 두기</Button>
  </Sheet></>); } };

function ToastDemo() { const t = useToast(); return (<div style={{ display: 'flex', gap: 8 }}>
  <Button onClick={() => t.show('보틀을 캐비닛에서 뺐습니다', { action: { label: '되돌리기', run: () => {} } })}>토스트</Button>
  <Button variant="secondary" onClick={() => t.show('저장에 실패했습니다', { tone: 'error' })}>실패 토스트</Button>
</div>); }
export const ToastStory: StoryObj = { name: 'Toast', render: () => <ToastProvider><ToastDemo /></ToastProvider> };

export const SidebarStory: StoryObj = { name: 'Sidebar', render: () => { const [c, setC] = useState(false); const [a, setA] = useState('proj'); return (
  <div style={{ height: 320, display: 'flex', border: '1px solid var(--color-divider)' }}>
    <Sidebar brand="Console" collapsed={c} onToggle={() => setC(!c)} activeId={a} onSelect={setA} aria-label="주 메뉴"
      items={[{ id: 'dash', label: '대시보드', icon: '▦' }, { id: 'proj', label: '프로젝트', icon: '◈', badge: 4 }, { id: 'team', label: '팀', icon: '◯' }, { id: 'set', label: '설정', icon: '⚙' }]} />
  </div>); } };
