import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'tsup';
import { external } from '../../tsup.config.base';

/**
 * 컴포넌트별 엔트리로 나눕니다. 배럴 하나로 묶으면 dist/index.js 최상단에
 * `import * as RTabs from '@radix-ui/react-tabs'` 같은 문장이 전부 모이고,
 * Radix · cmdk · react-day-picker 는 sideEffects:false 를 선언하지 않아
 * 소비자가 Button 하나만 써도 번들러가 그 문장들을 지우지 못합니다(실측 47KB gzip).
 * 파일이 나뉘어 있으면 배럴은 재수출만 하므로 안 쓰는 파일은 따라오지 않습니다.
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
