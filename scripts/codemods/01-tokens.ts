// jscodeshift + CSS: @malt 변수명 → MODUL. 매핑은 tokens/theme.json 의 malt 블록과 같은 출처
export const MAP: Record<string, string> = {
  '--malt-cream': '--color-bg', '--malt-surface': '--color-surface', '--malt-ink': '--color-text', '--malt-muted': '--color-neutral-700', '--malt-faint': '--color-neutral-600', '--malt-rule': '--color-divider',
  '--malt-amber': '--color-accent', '--malt-amber-hover': '--color-accent-600', '--malt-amber-soft': '--color-accent-100', '--malt-amber-soft-text': '--color-accent-700',
  '--malt-radius': '--radius-md', '--malt-font-serif': '--font-heading', '--malt-font-sans': '--font-body', '--malt-font-mono': '--font-mono',
  // 유지 (MODUL 에 없는 역할): --malt-clay --malt-stock-in --malt-stock-low
};
export default function transform(src: string) { return Object.entries(MAP).reduce((s, [a, b]) => s.split(a).join(b), src); }
