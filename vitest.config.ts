import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    alias: {
      obsidian: './src/__tests__/obsidian-mock.ts',
    },
  },
});
