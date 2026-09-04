import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

const here = dirname(fileURLToPath(import.meta.url));

/**
 * Storybook 10 부터 test-runner 가 동작하지 않습니다 — storybook 내부의 serverRequire 가
 * module.register() 를 쓰는데 Jest 30 런타임이 이를 거부합니다(실측). 공식 대체 경로인
 * addon-vitest 로 옮겨, 스토리 하나하나를 vitest 브라우저 모드에서 렌더합니다.
 */
export default defineConfig({
  // setup 파일은 브라우저에서 돌아 process 가 없습니다 — 플래그를 주입합니다.
  define: { __VISUAL__: JSON.stringify(process.env.VISUAL === '1') },
  plugins: [
    storybookTest({ configDir: resolve(here, '.storybook'), storybookScript: 'pnpm dev --ci' }),
  ],
  test: {
    name: 'storybook',
    setupFiles: [resolve(here, '.storybook/vitest.setup.ts')],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  },
});
