import { describe, it, expect } from 'vitest';
import { sanitizeSvg } from './image-safety';
import { toHtml } from '../RichText/richtext-core';
describe('보안', () => {
  it('SVG: script · on* · 외부 href 제거', () => {
    const out = sanitizeSvg('<svg xmlns="http://www.w3.org/2000/svg"><script>1</script><a href="https://x" onclick="y"><rect/></a><use href="http://evil"/></svg>');
    expect(out).not.toMatch(/script|onclick|https:\/\/x|evil/); expect(out).toContain('<rect');
  });
  it('autolink 는 http(s) 만', () => { expect(toHtml('javascript:alert(1) https://ok.kr', { autolink: true })).toBe('<p>javascript:alert(1) <a href="https://ok.kr" rel="noopener noreferrer" target="_blank">https://ok.kr</a></p>'); });
  it('원문 태그는 항상 이스케이프', () => { expect(toHtml('<img src=x onerror=1>')).toBe('<p>&lt;img src=x onerror=1&gt;</p>'); });
});
