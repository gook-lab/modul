import { describe, it, expect } from 'vitest';
import { toHtml, fromHtml, toBlocks } from './richtext-core';
describe('richtext', () => {
  it('줄바꿈 → <br>, 빈 줄 → <p>', () => { expect(toHtml('a\nb\n\nc')).toBe('<p>a<br>b</p>\n<p>c</p>'); });
  it('CRLF 정규화 · 이스케이프', () => { expect(toHtml('<b>\r\nx')).toBe('<p>&lt;b&gt;<br>x</p>'); });
  it('paragraphs:false 는 <br> 만', () => { expect(toHtml('a\n\nb', { paragraphs: false })).toBe('a<br><br>b'); });
  it('autolink', () => { expect(toHtml('see https://a.kr/x.', { autolink: true })).toContain('<a href="https://a.kr/x"'); });
  it('fromHtml 왕복', () => { const t = '첫 줄\n둘째 줄\n\n새 문단'; expect(fromHtml(toHtml(t))).toBe(t); });
  it('공백만 있는 문단 제거', () => { expect(toBlocks('a\n\n   \n\nb')).toEqual([['a'], ['b']]); });
});
