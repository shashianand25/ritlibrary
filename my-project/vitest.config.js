import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
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
        lines: 65,
        statements: 65,
        branches: 50,
        functions: 58,
      },
    },
  },
});
