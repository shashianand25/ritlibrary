import { describe, it, expect, vi } from 'vitest';
import logger from '../src/utils/logger.js';

describe('Backend Structured Logger', () => {
	it('logs structured info messages as valid JSON', () => {
		const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
		logger.info('User connected', { userId: '123' });
		expect(spy).toHaveBeenCalled();
		const payload = JSON.parse(spy.mock.calls[0][0]);
		expect(payload.level).toBe('INFO');
		expect(payload.message).toBe('User connected');
		expect(payload.context.userId).toBe('123');
		expect(payload.timestamp).toBeDefined();
		spy.mockRestore();
	});

	it('logs structured warn messages as valid JSON', () => {
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		logger.warn('Rate limit approaching', { count: 95 });
		expect(spy).toHaveBeenCalled();
		const payload = JSON.parse(spy.mock.calls[0][0]);
		expect(payload.level).toBe('WARN');
		expect(payload.message).toBe('Rate limit approaching');
		expect(payload.context.count).toBe(95);
		spy.mockRestore();
	});

	it('logs structured error messages with serialized stack trace', () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const err = new Error('Database connection timeout');
		logger.error('DB failure', err);
		expect(spy).toHaveBeenCalled();
		const payload = JSON.parse(spy.mock.calls[0][0]);
		expect(payload.level).toBe('ERROR');
		expect(payload.message).toBe('DB failure');
		expect(payload.error.name).toBe('Error');
		expect(payload.error.message).toBe('Database connection timeout');
		expect(payload.error.stack).toBeDefined();
		spy.mockRestore();
	});
});
