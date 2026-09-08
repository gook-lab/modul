export function radioDescription(markdown: string) {
  return markdown.trim().replace(/^#\s+[^\n]+\n+/, '').replace(/^>\s?/gm, '').trim();
}
