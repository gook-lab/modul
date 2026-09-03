import * as RTabs from '@radix-ui/react-tabs';
import { type ComponentPropsWithoutRef } from 'react';
import { cx } from '../utils/cx';
import type { TabItem } from '../Tabs/Tabs';
/** 모바일 Tabs: 44px 행, 가로 스크롤(스크롤바 숨김), 활성 탭 자동 스크롤-인. 4개 이상이면 이걸 쓴다 */
export function ScrollTabs({ items, className, children, ...rest }: ComponentPropsWithoutRef<typeof RTabs.Root> & { items: TabItem[] }) {
  return (
    <RTabs.Root className={cx('tabs', 'scroll-tabs', className)} {...rest}>
      <RTabs.List style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', borderBottom: '1px solid var(--color-divider)', padding: '0 12px', scrollSnapType: 'x proximity' }}>
        {items.map(t => <RTabs.Trigger key={t.value} value={t.value} disabled={t.disabled} className="tab" onFocus={e => e.currentTarget.scrollIntoView?.({ inline: 'nearest', block: 'nearest' })} style={{ all: 'unset', flex: 'none', display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', minHeight: 44, fontSize: 14, color: 'var(--color-neutral-700)', cursor: 'pointer', scrollSnapAlign: 'start' }}>{t.label}{t.count != null && t.count > 0 && <span style={{ fontSize: 11, color: 'var(--color-neutral-700)' }}>{t.count}</span>}</RTabs.Trigger>)}
      </RTabs.List>
      {children}
    </RTabs.Root>
  );
}
/* components.css: .scroll-tabs [role=tablist]::-webkit-scrollbar{display:none} */
