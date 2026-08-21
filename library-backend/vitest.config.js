import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		setupFiles: ['./test/setup.js'],
		coverage: {
			provider: 'v8',
			clean: true,
			reporter: ['text', 'json', 'html', 'lcov'],
			exclude: [
				'node_modules/',
				'test/**',
				'wrangler.jsonc',
				'eslint.config.js',
				'vitest.config.js',
			],
			thresholds: {
				lines: 70,
				statements: 70,
				branches: 65,
				functions: 70,
			},
		},
	},
});
