import * as RAcc from '@radix-ui/react-accordion';
import { type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cx, cssVar } from '../utils/cx';

export type AccordionItem = { value: string; title: ReactNode; content: ReactNode };
export type AccordionProps = ComponentPropsWithoutRef<typeof RAcc.Root> & { items: AccordionItem[]; rule?: '1px' | '2px' };

/** Radix Accordion. 번호 + 제목 + −/+ . 높이 애니메이션은 --radix-accordion-content-height */
export function Accordion({ items, rule = '1px', className, ...rest }: AccordionProps) {
  const r = `${rule} solid var(--color-divider)`;
  return (
    <RAcc.Root className={cx('accordion', className)} style={{ borderTop: r }} {...rest}>
      {items.map((it, i) => (
        <RAcc.Item key={it.value} value={it.value} style={{ borderBottom: r }}>
          <RAcc.Header asChild><h3 style={{ margin: 0 }}>
            <RAcc.Trigger className="accordion-trigger" style={{ all: 'unset', display: 'flex', alignItems: 'center', gap: 12, width: '100%', cursor: 'pointer', padding: '16px 0', minHeight: 44, boxSizing: 'border-box' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: cssVar('--font-heading-weight'), fontSize: 15, color: 'var(--color-neutral-700)', fontVariantNumeric: 'tabular-nums' }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ flex: 1, fontFamily: 'var(--font-heading)', fontWeight: cssVar('--font-heading-weight'), fontSize: 17 }}>{it.title}</span>
              <svg className="accordion-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14"/><path className="accordion-plus" d="M12 5v14"/></svg>
            </RAcc.Trigger>
          </h3></RAcc.Header>
          <RAcc.Content className="accordion-content"><p style={{ margin: '0 0 16px 27px', fontSize: 14, lineHeight: 1.65, color: 'var(--color-neutral-800)', maxWidth: '52ch' }}>{it.content}</p></RAcc.Content>
        </RAcc.Item>
      ))}
    </RAcc.Root>
  );
}
/* styles.css:
.accordion-content{overflow:hidden}
.accordion-content[data-state=open]{animation:acc-down var(--motion-slow) var(--ease-decel)} .accordion-content[data-state=closed]{animation:acc-up var(--motion-slow) var(--ease-decel)}
@keyframes acc-down{from{height:0}to{height:var(--radix-accordion-content-height)}} @keyframes acc-up{from{height:var(--radix-accordion-content-height)}to{height:0}}
.accordion-trigger[data-state=open] .accordion-icon{transform:rotate(180deg)} .accordion-trigger[data-state=open] .accordion-plus{opacity:0} .accordion-icon{transition:transform var(--motion-slow)} */
