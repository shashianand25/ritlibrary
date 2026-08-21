import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		coverage: {
			provider: 'v8',
			clean: true,
			reporter: ['text', 'json', 'html', 'lcov'],
			exclude: ['node_modules/', 'test/**', 'wrangler.jsonc', 'eslint.config.js'],
			thresholds: {
				lines: 70,
				statements: 70,
				branches: 70,
				functions: 70,
			},
		},
	},
});
