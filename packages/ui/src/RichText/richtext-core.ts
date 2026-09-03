/**
 * 텍스트 ↔ HTML. Textarea 값은 항상 순수 문자열(\n)로 저장한다 — DB · API · 폼 라이브러리 어디서도 이질감이 없다.
 * 화면·이메일·정적 HTML 로 내보낼 때만 toHtml() 로 변환: 빈 줄 = 문단(<p>), 줄바꿈 = <br>. 표시 규칙이 한 곳이라 React 렌더와 서버 출력이 같은 결과.
 */
export type RichTextOptions = { paragraphs?: boolean; autolink?: boolean; className?: string };
export const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// autolink 는 http(s) 만 — javascript: data: 는 정규식에 걸리지 않음. rel=noopener noreferrer + target=_blank, 표시 텍스트는 이스케이프된 원문
const URL_RE = /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]])/g;
export const normalize = (s: string) => s.replace(/\r\n?/g, '\n').replace(/\u00a0/g, ' ');
/** 문단 → 줄 배열. 렌더러(React/HTML) 공용 구조 */
export function toBlocks(text: string, paragraphs = true): string[][] {
  const t = normalize(text);
  const paras = paragraphs ? t.split(/\n{2,}/) : [t];
  return paras.map(p => p.split('\n')).filter(lines => lines.some(l => l.trim()));
}
function inline(line: string, autolink: boolean) {
  const e = escapeHtml(line);
  return autolink ? e.replace(URL_RE, u => `<a href="${u}" rel="noopener noreferrer" target="_blank">${u}</a>`) : e;
}
export function toHtml(text: string, o: RichTextOptions = {}): string {
  const { paragraphs = true, autolink = false, className } = o;
  const cls = className ? ` class="${escapeHtml(className)}"` : '';
  const blocks = toBlocks(text, paragraphs);
  if (!paragraphs) return blocks[0]?.map(l => inline(l, autolink)).join('<br>') ?? '';
  return blocks.map(lines => `<p${cls}>${lines.map(l => inline(l, autolink)).join('<br>')}</p>`).join('\n');
}
/** 역방향 — 붙여넣기·기존 HTML 을 Textarea 값으로. <p>/<br>/<div> 만 해석, 나머지 태그 제거 */
export function fromHtml(html: string): string {
  return html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>\s*<p[^>]*>/gi, '\n\n').replace(/<\/div>\s*<div[^>]*>/gi, '\n').replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim();
}
/** textarea 에서 Shift+Enter = 줄바꿈, Enter = 제출 을 원할 때 (채팅·댓글) */
export const submitOnEnter = (onSubmit: () => void) => (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229) return; if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmit(); } };
