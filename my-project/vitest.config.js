import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    css: false,
    fileParallelism: false,
    maxWorkers: 1,
    minWorkers: 1,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    testTimeout: 15000,
    coverage: {
      provider: 'v8',
      clean: false,
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/setupTests.js',
        '**/*.d.ts',
        'dist/**',
        'src/data/**',
        'src/mozillapdf.jsx',
        'src/pdf.jsx',
      ],
      thresholds: {
        lines: 70,
        statements: 70,
        branches: 70,
        functions: 70,
      },
    },
  },
});
