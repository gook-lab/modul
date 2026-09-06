import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // EmptyState 처럼 @gook-lab/motion 을 쓰는 컴포넌트가 있어 워크스페이스 참조를 풀어 줍니다.
  resolve: {
    alias: {
      '@gook-lab/motion': resolve(__dirname, '../motion/src/index.ts'),
      '@gook-lab/tokens': resolve(__dirname, '../tokens/tokens.ts'),
      // motion 이 다시 @gook-lab/ui 를 참조합니다(Reveal 의 polyForwardRef).
      '@gook-lab/ui': resolve(__dirname, 'src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    // .ts 테스트(cx · Pagination · files · richtext · image-safety)도 포함해야 합니다.
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
