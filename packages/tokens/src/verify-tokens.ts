import { readFileSync } from 'node:fs';

/**
 * 배포되는 CSS 에서 CSS 변수를 셀렉터별로 읽습니다.
 * 중첩 없는 평범한 CSS 라 정규식으로 충분하고, 의존성을 하나도 늘리지 않습니다.
 */
export function readVars(file: string): Record<string, Record<string, string>> {
  const css = readFileSync(new URL(file, import.meta.url), 'utf8');
  const out: Record<string, Record<string, string>> = {};
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = m[1].trim().split('\n').pop()!.trim();
    if (!/^:root$|^\[data-theme=/.test(selector)) continue;
    const bag = (out[selector] ??= {});
    for (const v of m[2].matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)) bag[v[1]] = v[2].trim();
  }
  return out;
}

/**
 * 값 비교 전 정규화. `16.0px` 와 `16px`, `cubic-bezier(0, 0, .2, 1)` 와
 * `cubic-bezier(0,0,.2,1)`, 대소문자가 다른 hex 는 같은 값입니다.
 */
export const norm = (v: string) =>
  v.trim().toLowerCase().replace(/\s+/g, '').replace(/(\d)\.0(?=px|ms|$)/g, '$1');

export type Mismatch = { where: string; key: string; expected: string; actual: string | undefined };

/** theme.json 이 정하는 값만 대조합니다. 램프처럼 손으로 튜닝한 파생값은 대상이 아닙니다. */
export function compare(where: string, expected: Record<string, string | number>, actual: Record<string, string> | undefined): Mismatch[] {
  const out: Mismatch[] = [];
  for (const [key, value] of Object.entries(expected)) {
    const got = actual?.[key];
    if (got === undefined || norm(got) !== norm(String(value))) {
      out.push({ where, key, expected: String(value), actual: got });
    }
  }
  return out;
}
