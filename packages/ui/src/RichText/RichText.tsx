import { Fragment, forwardRef } from 'react';
import { cx } from '../utils/cx';
import { toBlocks, type RichTextOptions } from './richtext-core';
import type { NativeProps } from '../utils/polymorphic';

export type RichTextProps = NativeProps<'div', { value: string | null | undefined; /** 빈 값일 때 */ fallback?: React.ReactNode } & Omit<RichTextOptions, 'className'>>;
const URL_RE = /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]])/g;
const Inline = ({ text, autolink }: { text: string; autolink: boolean }) => {
  if (!autolink) return <>{text}</>;
  const parts = text.split(URL_RE);
  return <>{parts.map((p, i) => i % 2 ? <a key={i} href={p} rel="noopener noreferrer" target="_blank">{p}</a> : p)}</>;
};
/**
 * Textarea 로 받은 문자열을 표시. dangerouslySetInnerHTML 없이 toHtml() 과 정확히 같은 구조(<p> + <br>)를 그린다 —
 * 서버가 toHtml() 로 만든 정적 HTML 과 하이드레이션 결과가 동일.
 */
export const RichText = forwardRef<HTMLDivElement, RichTextProps>(({ value, paragraphs = true, autolink = false, fallback = null, className, style, ...rest }, ref) => {
  const blocks = toBlocks(value ?? '', paragraphs);
  if (!blocks.length) return <div ref={ref} className={cx('richtext', 'richtext-empty', className)} style={{ color: 'var(--color-neutral-500)', ...style }} {...rest}>{fallback}</div>;
  const lines = (ls: string[]) => ls.map((l, i) => <Fragment key={i}>{i > 0 && <br />}<Inline text={l} autolink={autolink} /></Fragment>);
  return (
    <div ref={ref} className={cx('richtext', className)} style={{ lineHeight: 1.6, ...style }} {...rest}>
      {paragraphs ? blocks.map((ls, i) => <p key={i} style={{ margin: i === blocks.length - 1 ? 0 : '0 0 .8em' }}>{lines(ls)}</p>) : lines(blocks[0])}
    </div>
  );
});
RichText.displayName = 'RichText';
