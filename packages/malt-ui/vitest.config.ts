import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@gook-lab/ui': resolve(__dirname, '../ui/src/index.ts'),
      '@gook-lab/tokens': resolve(__dirname, '../tokens/tokens.ts'),
      '@gook-lab/motion': resolve(__dirname, '../motion/src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
