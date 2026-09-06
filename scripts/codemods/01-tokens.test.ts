import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import transform, { MAP, KEPT } from './01-tokens';

/**
 * 이 코드모드의 매핑이 실제 두 저장소의 값과 맞는지 봅니다.
 *
 * 처음 작성된 매핑은 `--malt-cream` 같은 이름을 찾았는데 bottling 의 실제 이름은
 * `--color-cream` 이었습니다. 돌려도 아무것도 바뀌지 않는 코드모드였고, 한 번도
 * 실행된 적이 없어서 아무도 몰랐습니다(2026-09-06 실측).
 */

const vars = (css: string) => {
  const out: Record<string, string> = {};
  for (const m of css.matchAll(/--([a-z0-9-]+)\s*:\s*([^;}]+)[;}]/g)) out[`--${m[1]}`] = m[2].trim();
  return out;
};
const norm = (v: string) => v.trim().toLowerCase().replace(/\s+/g, '').replace(/['"]/g, '');

const MODUL = {
  ...vars(readFileSync(new URL('../../packages/tokens/styles.css', import.meta.url), 'utf8')),
  ...vars(readFileSync(new URL('../../packages/tokens/theme-malt.css', import.meta.url), 'utf8')),
};

/** bottling 은 이 저장소 밖입니다. 없으면 대조 테스트는 건너뜁니다. */
const BOTTLING = join(homedir(), 'sonix/shared/bottling/packages/tokens/dist/tokens.css');
const hasBottling = existsSync(BOTTLING);

describe('01-tokens — 변환 자체', () => {
  it('CSS 변수 이름을 바꾼다', () => {
    expect(transform('color: var(--color-cream);')).toBe('color: var(--color-bg);');
  });

  it('긴 이름을 먼저 바꿔 접두가 겹치는 것을 자르지 않는다', () => {
    // --color-amber 를 먼저 바꾸면 --color-amber-hover 가 --color-accent-hover 가 됩니다.
    const out = transform('a{color:var(--color-amber-hover)}b{color:var(--color-amber)}');
    expect(out).toContain('var(--color-accent-600)');
    expect(out).toContain('var(--color-accent)');
    expect(out).not.toContain('accent-hover');
  });

  it('매핑에 없는 변수는 그대로 둔다', () => {
    expect(transform('gap: var(--size-pull-haptic);')).toBe('gap: var(--size-pull-haptic);');
  });

  it('바꾼 결과가 MODUL 에 실제로 있는 변수다', () => {
    for (const to of Object.values(MAP)) {
      expect(MODUL[to], `${to} 가 MODUL 토큰에 없습니다`).toBeTruthy();
    }
  });
});

describe.runIf(hasBottling)('01-tokens — bottling 실제 값과 대조', () => {
  const BOT = vars(readFileSync(BOTTLING, 'utf8'));

  it('매핑의 출발 이름이 bottling 에 실제로 있다', () => {
    for (const from of Object.keys(MAP)) {
      expect(BOT[from], `${from} 이 bottling 토큰에 없습니다 — 이름이 바뀌었는지 확인하세요`).toBeTruthy();
    }
  });

  it('매핑한 쌍은 값이 같다', () => {
    for (const [from, to] of Object.entries(MAP)) {
      expect(norm(MODUL[to]), `${from}(${BOT[from]}) → ${to}(${MODUL[to]}) 값이 다릅니다`)
        .toBe(norm(BOT[from]));
    }
  });

  it('bottling 의 모든 변수가 매핑되거나 남기는 이유가 적혀 있다', () => {
    const unexplained = Object.keys(BOT)
      .filter(k => !k.startsWith('--camp-'))
      .filter(k => !(k in MAP) && !(k in KEPT));
    expect(unexplained, '새 변수가 생겼습니다 — MAP 에 넣거나 KEPT 에 이유를 적어 주세요').toEqual([]);
  });

  it('남기기로 한 것 중 값이 다른 것은 이유에 그 사실이 적혀 있다', () => {
    // --stock-low 는 값이 달라서 남깁니다. 이유 문구가 사라지면 왜 남았는지 알 수 없습니다.
    expect(KEPT['--stock-low']).toMatch(/값이 다릅니다/);
    expect(norm(BOT['--stock-low'])).not.toBe(norm(MODUL['--malt-stock-low']));
  });
});
