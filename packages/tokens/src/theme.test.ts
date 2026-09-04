import { describe, it, expect } from 'vitest';
import themeJson from '../theme.json';
import { parseThemeFile } from './theme.schema';
import { compare, norm, readVars } from './verify-tokens';

describe('theme.json 스키마', () => {
  it('배포 중인 theme.json 이 통과한다', () => {
    expect(() => parseThemeFile(themeJson)).not.toThrow();
  });

  it('색이 hex 가 아니면 경로와 함께 거부한다', () => {
    const bad = structuredClone(themeJson) as typeof themeJson;
    (bad.themes.light as { accent: string }).accent = 'ec3013';
    expect(() => parseThemeFile(bad)).toThrow(/themes\.light\.accent/);
  });

  it('space 단계 수가 6이 아니면 거부한다', () => {
    const bad = structuredClone(themeJson) as typeof themeJson;
    (bad as { space: number[] }).space = [4, 8, 12];
    expect(() => parseThemeFile(bad)).toThrow(/space/);
  });

  it('필수 테마가 빠지면 거부한다', () => {
    const bad = structuredClone(themeJson) as { themes: Record<string, unknown> };
    delete bad.themes.malt;
    expect(() => parseThemeFile(bad)).toThrow(/malt/);
  });
});

describe('배포 CSS 대조', () => {
  const styles = readVars('../styles.css');
  const malt = readVars('../theme-malt.css');
  const theme = parseThemeFile(themeJson);

  it('세 테마 블록이 배포 CSS 에 있다', () => {
    expect(styles[':root']).toBeTruthy();
    expect(styles['[data-theme=dark]']).toBeTruthy();
    expect(malt['[data-theme=malt]']).toBeTruthy();
  });

  it('theme.json 의 base 값이 배포 CSS 와 일치한다', () => {
    const light = theme.themes.light;
    const problems = compare('styles.css [light]', {
      'color-bg': light.bg, 'color-surface': light.surface,
      'color-text': light.text, 'color-accent': light.accent,
    }, styles[':root']);
    expect(problems).toEqual([]);
  });

  it('malt 의 extra 토큰도 일치한다', () => {
    const extra = theme.themes.malt.extra ?? {};
    expect(compare('theme-malt.css [malt]', extra, malt['[data-theme=malt]'])).toEqual([]);
  });

  it('어긋나면 어느 변수가 왜 다른지 돌려준다', () => {
    const problems = compare('테스트', { 'color-bg': '#000000' }, styles[':root']);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatchObject({ key: 'color-bg', expected: '#000000' });
    expect(problems[0].actual).toBeTruthy();
  });

  it('정규화가 표기 차이를 흡수한다', () => {
    // 16.0px 와 16px, cubic-bezier 안의 공백, hex 대소문자는 같은 값입니다.
    expect(norm('16.0px')).toBe(norm('16px'));
    expect(norm('cubic-bezier(0, 0, .2, 1)')).toBe(norm('cubic-bezier(0,0,.2,1)'));
    expect(norm('#F7F3EA')).toBe(norm('#f7f3ea'));
  });
});
