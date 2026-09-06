// This file has been automatically migrated to valid ESM format by Storybook.
import { createRequire } from "node:module";
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';

const require = createRequire(import.meta.url);

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../..');

const config: StorybookConfig = {
  /**
   * `packages/**` 만으로 잡으면 `packages/ui/node_modules/@storybook/react/template/cli/**` 의
   * 템플릿 스토리까지 들어와 빌드가 `./button.css` 미해결로 실패합니다. `src/` 를 경로에 강제해
   * 워크스페이스 소스만 봅니다.
   */
  stories: ['../../../packages/*/src/**/*.stories.@(ts|tsx)'],
  addons: [
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-themes"),
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-mcp")
  ],
  framework: getAbsolutePath("@storybook/react-vite"),
  /**
   * 워크스페이스 패키지를 dist 대신 src 로 알리아스합니다.
   * @gook-lab/ui 와 @gook-lab/motion 은 서로를 import 하는 순환이라(EmptyState → motion, Reveal → ui)
   * node_modules 링크로 풀면 pnpm 이 순환 워크스페이스 의존을 경고하고 dist 가 낡을 수 있습니다.
   * 소스 알리아스는 그 둘을 같은 그래프 안에서 해석하고 HMR 도 그대로 동작합니다.
   */
  viteFinal: async (cfg) => {
    cfg.resolve = cfg.resolve ?? {};
    cfg.resolve.alias = [
      ...(Array.isArray(cfg.resolve.alias) ? cfg.resolve.alias : []),
      { find: /^@gook-lab\/tokens\/(.*)$/, replacement: resolve(root, 'packages/tokens/$1') },
      { find: '@gook-lab/tokens', replacement: resolve(root, 'packages/tokens/tokens.ts') },
      // 서브패스(@gook-lab/ui/Button)도 소스로 받습니다. 레포 규칙이 src/<Name>/<Name>.tsx 라
      // $1/$1 로 펼칩니다 — 정규식 규칙이 먼저 와야 bare 규칙에 먹히지 않습니다.
      // packages/ui 의 exports 맵이 다른 이름을 쓰면 이 줄도 같이 맞춰 주세요.
      { find: /^@gook-lab\/ui\/(.*)$/, replacement: resolve(root, 'packages/ui/src/$1/$1') },
      { find: '@gook-lab/ui', replacement: resolve(root, 'packages/ui/src/index.ts') },
      { find: '@gook-lab/motion', replacement: resolve(root, 'packages/motion/src/index.ts') },
      { find: '@gook-lab/icons', replacement: resolve(root, 'packages/icons/src/index.tsx') },
      { find: '@gook-lab/malt-ui', replacement: resolve(root, 'packages/malt-ui/src/index.ts') },
    ];
    return cfg;
  },
};
export default config;

/**
 * Storybook 업그레이드가 넣어준 헬퍼입니다. pnpm 처럼 중첩 node_modules 를 쓰는 환경에서
 * addon 이름을 실제 설치 경로로 풀어 줍니다(faux-ESM require 대응).
 */
function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, "package.json")));
}
