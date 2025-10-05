import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      exclude: [
        '**/dev-dist/**',
        '**/src/types/**',
        '**/node_modules/**',
        '**/dist/**',
        '**/*.config.*',
        '**/test/**',
        '**/__tests__/**',
        '**/src/main.tsx',
      ],
    },
  },
  resolve: {
    alias: {
      '~': '/src',
    },
  },
});
