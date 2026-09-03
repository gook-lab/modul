import { useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { useLabels } from '../utils/labels';
import type { NativeProps } from '../utils/polymorphic';

export type KbdProps = NativeProps<'span', { keys: string[]; tone?: 'outline' | 'filled'; joiner?: ReactNode }>;
export function Kbd({ keys, tone = 'outline', joiner, className, ...rest }: KbdProps) {
  const s: React.CSSProperties = { fontFamily: 'inherit', fontSize: 11, padding: '2px 6px', minWidth: 22, textAlign: 'center', fontVariantNumeric: 'tabular-nums', ...(tone === 'filled' ? { background: 'var(--color-neutral-200)', color: 'var(--color-neutral-800)' } : { background: 'var(--color-surface)', color: 'var(--color-neutral-800)', border: '1px solid var(--color-divider)', boxShadow: '0 1px 0 var(--color-divider)' }) };
  return <span className={cx('kbd', className)} style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }} {...rest}>{keys.map((k, i) => <span key={i} style={{ display: 'contents' }}>{i > 0 && joiner && <span style={{ color: 'var(--color-neutral-500)' }}>{joiner}</span>}<kbd style={s}>{k}</kbd></span>)}</span>;
}

export function Code({ className, style, ...rest }: ComponentPropsWithoutRef<'code'>) {
  return <code className={cx('code', className)} style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: '.9em', padding: '1px 5px', background: 'var(--color-neutral-200)', color: 'var(--color-accent-800)', ...style }} {...rest} />;
}

export type CodeBlockProps = NativeProps<'pre', { children: string; lang?: string; highlight?: number[]; copy?: boolean; lineNumbers?: boolean }>;
/** 줄번호 · 하이라이트 · 복사. 구문 강조가 필요하면 shiki 결과 HTML 을 children 대신 dangerouslySetInnerHTML 로 — bottling 은 금지이므로 서버에서 렌더 */
export function CodeBlock({ children, lang, highlight = [], copy = true, lineNumbers = true, className, style, ...rest }: CodeBlockProps) {
  const t = useLabels(); const [ok, setOk] = useState(false);
  const lines = children.replace(/\n$/, '').split('\n');
  return (
    <div style={{ position: 'relative' }}>
      <pre data-lang={lang} className={cx('code-block', className)} style={{ margin: 0, padding: '14px 16px', background: 'var(--color-neutral-900)', color: 'var(--color-neutral-100)', fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: 12.5, lineHeight: 1.6, overflow: 'auto', ...style }} {...rest}>
        {lines.map((t, i) => <span key={i} style={{ display: 'flex', gap: 16, margin: '0 -16px', padding: '0 16px', background: highlight.includes(i + 1) ? 'color-mix(in srgb, var(--color-accent) 18%, transparent)' : undefined }}>{lineNumbers && <span aria-hidden style={{ width: `${String(lines.length).length}ch`, textAlign: 'right', color: 'var(--color-neutral-700)', flex: 'none', userSelect: 'none' }}>{i + 1}</span>}<span style={{ whiteSpace: 'pre' }}>{t || ' '}</span></span>)}
      </pre>
      {copy && <button type="button" className="btn btn-secondary" onClick={() => { navigator.clipboard.writeText(children); setOk(true); setTimeout(() => setOk(false), 1200); }} aria-live="polite" style={{ position: 'absolute', right: 8, top: 8, padding: '4px 10px', fontSize: 11, background: 'var(--color-neutral-800)', color: 'var(--color-neutral-100)', borderColor: 'var(--color-neutral-700)' }}>{ok ? t('common.copied') : t('common.copy')}</button>}
    </div>
  );
}
