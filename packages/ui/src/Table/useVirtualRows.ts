import { useEffect, useRef, useState } from 'react';
/** 고정 높이 행 가상화 — 외부 의존 없음. 반환: 스크롤 컨테이너 ref, 렌더할 [start,end), 위/아래 패딩 */
export function useVirtualRows(count: number, rowHeight: number, height: number, overscan = 4) {
  const ref = useRef<HTMLDivElement>(null); const [top, setTop] = useState(0);
  useEffect(() => { const el = ref.current; if (!el) return; const on = () => setTop(el.scrollTop); el.addEventListener('scroll', on, { passive: true }); return () => el.removeEventListener('scroll', on); }, []);
  const start = Math.max(0, Math.floor(top / rowHeight) - overscan);
  const end = Math.min(count, Math.ceil((top + height) / rowHeight) + overscan);
  return { ref, start, end, padTop: start * rowHeight, padBottom: (count - end) * rowHeight, style: { height, overflow: 'auto' as const } };
}
