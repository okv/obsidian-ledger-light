import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    alias: {
      obsidian: './src/__tests__/obsidian-mock.ts',
    },
  },
  coverage: {
    provider: 'v8',
    thresholds: {
      lines: 60,
      functions: 60,
      branches: 60,
      statements: 60,
      100: true,
    },
  },
});
