import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * 워크스페이스 소스를 그대로 참조합니다. dist 를 거치면 라이브러리를 고칠 때마다
 * 다시 빌드해야 하고, 이 앱들의 목적은 조립 예시라 소스 직결이 맞습니다.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@gook-lab/ui': resolve(__dirname, '../../packages/ui/src/index.ts'),
      '@gook-lab/motion': resolve(__dirname, '../../packages/motion/src/index.ts'),
      '@gook-lab/icons': resolve(__dirname, '../../packages/icons/src/index.tsx'),
      '@gook-lab/tokens/styles.css': resolve(__dirname, '../../packages/tokens/styles.css'),
      '@gook-lab/tokens/components.css': resolve(__dirname, '../../packages/tokens/components.css'),
      '@gook-lab/tokens/theme-malt.css': resolve(__dirname, '../../packages/tokens/theme-malt.css'),
    },
  },
});
