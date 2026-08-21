import js from '@eslint/js';
import globals from 'globals';

export default [
	{
		ignores: ['dist/**', 'coverage/**', 'node_modules/**', '.wrangler/**'],
	},
	{
		files: ['**/*.{js,mjs,cjs}'],
		languageOptions: {
			ecmaVersion: 2022,
			globals: {
				...globals.browser,
				...globals.node,
			},
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
		},
		rules: {
			...js.configs.recommended.rules,
			'no-unused-vars': [
				'warn',
				{
					varsIgnorePattern: '^[A-Z_]',
					argsIgnorePattern: '^_',
					ignoreRestSiblings: true,
					caughtErrors: 'none',
				},
			],
			'no-empty': ['warn', { allowEmptyCatch: true }],
		},
	},
];
