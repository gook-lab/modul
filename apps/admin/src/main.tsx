import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@modul/tokens/components.css';
import App from './App';

/** 앱이 데이터를 소유합니다 — 컴포넌트는 fetch 를 모릅니다(PROMPT 1.5). */
const rows = [
  { name: '어드민 리디자인', owner: '윤성국', status: '진행중' as const, date: '2026.09.01' },
  { name: '토큰 마이그레이션', owner: '김하늘', status: '검토' as const, date: '2026.08.28' },
  { name: '모바일 셸', owner: '이도현', status: '완료' as const, date: '2026.08.20' },
  { name: '차트 확장 검토', owner: '박서준', status: '진행중' as const, date: '2026.09.03' },
];

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App rows={rows} />
  </StrictMode>,
);
