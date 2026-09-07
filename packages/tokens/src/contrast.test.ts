import { describe, it, expect } from 'vitest';
import themeJson from '../theme.json';
import { parseThemeFile } from './theme.schema';
import { readVars } from './verify-tokens';

/**
 * docs/contrast-audit.md 의 결정을 숫자로 고정합니다.
 *
 * 그 문서는 사람이 읽는 기록이라, 토큰을 바꾸면 문서만 낡고 화면은 조용히 나빠집니다.
 * 스토리북 axe 는 스토리에 그려진 조합만 보기 때문에, 스토리가 없는 조합은 잡지 못합니다
 * (실측: Malt 프리미티브는 스토리가 생기기 전까지 한 번도 검사되지 않았습니다).
 * 여기서는 토큰 쌍 자체를 직접 잽니다.
 */

const hex = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const luminance = (h: string) => {
  const [r, g, b] = hex(h).map(v => v / 255).map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
/** WCAG 2.1 §1.4.3 상대 휘도 대비 */
export const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const theme = parseThemeFile(themeJson);
const styles = readVars('../styles.css');
const malt = readVars('../theme-malt-vars.css');

/** 배포 CSS 에서 실제 값을 읽습니다 — theme.json 에 없는 램프도 검사 대상입니다. */
const varOf = (block: Record<string, string> | undefined, name: string) => {
  const v = block?.[name];
  if (!v || !/^#[0-9a-fA-F]{6}$/.test(v.trim())) return null;
  return v.trim();
};

const THEMES = [
  { name: 'light', vars: styles[':root'] },
  { name: 'dark', vars: styles['[data-theme=dark]'] },
  { name: 'malt', vars: malt['[data-theme=malt]'] },
] as const;

describe('대비 검수 — 소형 텍스트 4.5:1', () => {
  /** 규칙 1 · 6: 읽어야 하는 소형 텍스트는 neutral-700 이 최소선입니다. */
  it.each(THEMES.map(t => [t.name, t] as const))('%s — neutral-700 이 bg 와 surface 위에서 4.5:1', (_n, t) => {
    const bgName = t.name === 'malt' ? 'color-bg' : 'color-bg';
    const fg = varOf(t.vars, 'color-neutral-700');
    const bg = varOf(t.vars, bgName) ?? varOf(styles[':root'], bgName);
    const surface = varOf(t.vars, 'color-surface') ?? varOf(styles[':root'], 'color-surface');
    expect(fg, `${t.name} 에 neutral-700 이 없습니다`).toBeTruthy();
    expect(contrast(fg!, bg!)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(fg!, surface!)).toBeGreaterThanOrEqual(4.5);
  });

  /** 규칙 6: 본문 크기 링크와 강조 텍스트는 accent 가 아니라 accent-700 입니다. */
  it.each(THEMES.map(t => [t.name, t] as const))('%s — accent-700 이 bg 위에서 4.5:1', (_n, t) => {
    const fg = varOf(t.vars, 'color-accent-700');
    const bg = varOf(t.vars, 'color-bg') ?? varOf(styles[':root'], 'color-bg');
    expect(contrast(fg!, bg!)).toBeGreaterThanOrEqual(4.5);
  });

  /** 규칙 7: neutral-300 배경 위 소형 텍스트는 한 단계 더 필요합니다(FileDrop 뱃지 4.39 사례). */
  it.each(THEMES.map(t => [t.name, t] as const))('%s — neutral-800 이 neutral-300 위에서 4.5:1', (_n, t) => {
    const fg = varOf(t.vars, 'color-neutral-800');
    const bg = varOf(t.vars, 'color-neutral-300');
    expect(contrast(fg!, bg!)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('대비 검수 — Malt 재고 상태색', () => {
  const extra = theme.themes.malt.extra ?? {};
  const bg = theme.themes.malt.bg;
  const surface = theme.themes.malt.surface;

  /**
   * 배지는 텍스트와 6px 점(background: currentColor)을 같은 색으로 씁니다.
   * 텍스트 4.5:1 을 넘기면 UI 요소 3:1 은 자동으로 넘습니다.
   *
   * 예외: 텍스트가 아니라 **비활성 컨트롤의 채움색**인 토큰. WCAG 1.4.3 이
   * inactive UI component 를 명시적으로 제외합니다 — 비활성 버튼(#B8B0A5 위
   * surface 글자)은 bottling 원 디자인 그대로 두들 기준 위반이 아닙니다.
   */
  const FILL_ONLY = new Set(['malt-btn-disabled']);
  it.each(Object.keys(extra).filter(k => !FILL_ONLY.has(k)))('%s 이 bg 와 surface 위에서 4.5:1', key => {
    const v = String(extra[key]);
    expect(contrast(v, bg), `${key} ${v} / bg ${bg}`).toBeGreaterThanOrEqual(4.5);
    expect(contrast(v, surface), `${key} ${v} / surface ${surface}`).toBeGreaterThanOrEqual(4.5);
  });

  /**
   * malt-stock-in 은 4.54 로 기준을 0.04 만큼 넘깁니다(수정 11).
   * 배경을 밝게 바꾸면 조용히 깨지는 자리라, 여유가 사라지면 여기서 실패하게 둡니다.
   */
  it('malt-stock-in 의 여유가 사라지지 않았는지', () => {
    const v = String(extra['malt-stock-in']);
    const ratio = contrast(v, bg);
    expect(ratio, `${v} / ${bg} = ${ratio.toFixed(2)} — 배경을 밝게 바꿨다면 색도 같이 낮춰야 합니다`)
      .toBeGreaterThanOrEqual(4.5);
  });
});

describe('대비 검수 — 금지 조합', () => {
  /** 규칙 1: neutral-600 은 소형 텍스트에 쓰지 않습니다. 실제로 미달인지 확인합니다. */
  it('neutral-600 은 light·malt 에서 4.5:1 에 못 미친다 (금지 근거)', () => {
    for (const name of ['light', 'malt'] as const) {
      const t = THEMES.find(x => x.name === name)!;
      const fg = varOf(t.vars, 'color-neutral-600')!;
      const bg = varOf(t.vars, 'color-bg') ?? varOf(styles[':root'], 'color-bg')!;
      expect(contrast(fg, bg), `${name} neutral-600 이 4.5 를 넘으면 금지 규칙을 다시 봐야 합니다`)
        .toBeLessThan(4.5);
    }
  });
});
