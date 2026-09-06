import { defineConfig } from 'vitest/config';

/** 루트 스크립트(코드모드 등)의 테스트. 패키지 테스트는 각 패키지의 설정이 돌립니다. */
export default defineConfig({
  test: { environment: 'node', include: ['scripts/**/*.test.ts'] },
});
