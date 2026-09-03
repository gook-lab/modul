import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    // .ts 테스트(cx · Pagination · files · richtext · image-safety)도 포함해야 합니다.
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
