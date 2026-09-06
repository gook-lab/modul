import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'tsup';
import { external } from '../../tsup.config.base';

/**
 * 컴포넌트별 엔트리로 나눕니다. packages/ui 와 같은 방식입니다 — 배럴 하나로 묶으면
 * dist/index.js 최상단에 모든 최상단 import 가 모여서, 소비자가 Reveal 하나만 써도
 * 번들러가 나머지를 지우지 못합니다(실측 6.15 KB gzip → 분할 후 1.54 KB).
 *
 * src 를 순회하므로, 배럴에 없는 내부 헬퍼 파일을 새로 만들면 그 파일도 엔트리가 되고
 * package.json 의 `"./*"` 서브패스로 함께 공개됩니다. 내부용으로 두려면 파일을 만들지 말고
 * 기존 파일 안에 두거나, 여기 SKIP 에 패턴을 추가해 주세요.
 */
const SRC = 'src';
const SKIP = /\.(test|stories)\.tsx?$/;

function entries(dir = SRC, out: Record<string, string> = {}) {
  for (const name of readdirSync(join(process.cwd(), dir))) {
    const rel = `${dir}/${name}`;
    if (statSync(join(process.cwd(), rel)).isDirectory()) { entries(rel, out); continue; }
    if (!/\.tsx?$/.test(name) || SKIP.test(name) || name.endsWith('.d.ts')) continue;
    out[rel.slice(SRC.length + 1).replace(/\.tsx?$/, '')] = rel;
  }
  return out;
}

export default defineConfig({
  entry: entries(),
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: false, // 배포 tarball 에서 소스맵 제외 — @gook-lab/ui 1.1MB 중 631KB 가 .map 이었습니다
  clean: true,
  splitting: true,
  treeshake: true,
  target: 'es2022',
  external,
});
