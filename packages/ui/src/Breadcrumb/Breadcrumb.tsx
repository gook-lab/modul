import { forwardRef, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { useLabels } from '../utils/labels';
import type { NativeProps } from '../utils/polymorphic';

export type Crumb = { label: string; href?: string };
export type BreadcrumbProps = NativeProps<'nav', { items: Crumb[]; separator?: ReactNode; collapse?: boolean | number; renderLink?: (item: Crumb, props: ComponentPropsWithoutRef<'a'>) => ReactNode }>;

/** 마지막은 aria-current=page 텍스트. collapse(기본 5) 이상이면 가운데를 … 버튼으로 접고 클릭 시 펼침 */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(({ items, separator = '/', collapse = true, renderLink, className, ...rest }, ref) => {
  const t = useLabels(); const [open, setOpen] = useState(false);
  const limit = collapse === true ? 5 : collapse || Infinity;
  const vis: (Crumb | '…')[] = items.length >= limit && !open ? [items[0], '…', ...items.slice(-2)] : items;
  const linkStyle = (last: boolean): React.CSSProperties => ({ color: last ? 'var(--color-text)' : 'var(--color-neutral-700)', textDecoration: 'none', fontWeight: last ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: '18ch' });
  return (
    <nav ref={ref} aria-label={t('breadcrumb.label')} className={cx('breadcrumb', className)} {...rest}>
      <ol style={{ display: 'flex', alignItems: 'center', gap: 6, listStyle: 'none', margin: 0, padding: 0, fontSize: 13 }}>
        {vis.map((c, k) => {
          const last = k === vis.length - 1;
          return (
            <li key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              {k > 0 && <span aria-hidden style={{ color: 'var(--color-neutral-400)' }}>{separator}</span>}
              {c === '…' ? <button type="button" aria-label={t('breadcrumb.expand')} onClick={() => setOpen(true)} style={{ border: '1px solid var(--color-divider)', background: 'transparent', cursor: 'pointer', padding: '2px 8px', font: 'inherit', fontSize: 12, color: 'var(--color-neutral-700)' }}>…</button>
                : last || !c.href ? <span aria-current={last ? 'page' : undefined} style={linkStyle(last)}>{c.label}</span>
                : renderLink ? renderLink(c, { href: c.href, className: 'breadcrumb-link', style: linkStyle(false), children: c.label }) : <a href={c.href} className="breadcrumb-link" style={linkStyle(false)}>{c.label}</a>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});
Breadcrumb.displayName = 'Breadcrumb';
/* styles.css: .breadcrumb-link:hover{color:var(--color-accent-700);text-decoration:underline;text-underline-offset:3px} */
