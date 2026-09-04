import { defineConfig, type Options } from 'tsup';

/**
 * 패키지 공통 번들 설정. 각 패키지의 tsup.config.ts 에서:
 *   import { pkg } from '../../tsup.config.base';
 *   export default pkg('src/index.ts');                      // 단일 엔트리
 *   export default pkg(['src/index.ts', 'src/Button/Button.tsx']);  // 엔트리 분할
 *
 * 엔트리를 여러 개 주면 tsup 이 ESM 을 코드 분할하고 공유 코드를 별도 청크로 뺍니다.
 * 서브패스 소비자가 배럴 전체를 끌고 오지 않게 하려는 구조입니다 —
 * 단일 배럴에서는 dist/index.js 최상단의 `import * as RTabs from '@radix-ui/react-tabs'` 류가
 * 트리셰이킹 뒤에도 남습니다(Radix·cmdk·react-day-picker 가 sideEffects:false 를 선언하지 않음).
 * 실측과 선택지는 docs/performance-budget.md 의 '실측' 절에 있습니다.
 *
 * external 은 소비자 앱이 직접 들고 있어야 하는 것들입니다. 여기에 없는 의존성만 번들에 들어갑니다.
 */
export const external: (string | RegExp)[] = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  /^@radix-ui\//,
  'react-hook-form',
  'zod',
  '@hookform/resolvers',
  /^@hookform\//,
  'cmdk',
  'react-day-picker',
  'date-fns',
  'lucide-react',
  /^@modul\//,
  /^@malt\//,
];

export const pkg = (entry: string | string[], overrides: Options = {}) =>
  defineConfig({
    entry: Array.isArray(entry) ? entry : [entry],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: false, // 배포 tarball 에서 소스맵 제외 — @modul/ui 1.1MB 중 631KB 가 .map 이었습니다
    clean: true,
    treeshake: true,
    target: 'es2022',
    external,
    ...overrides,
  });

export default pkg('src/index.ts');
