import { describe, it, expect, vi, beforeEach } from 'vitest';
import worker from '../src/index.js';

describe('Health Check API (/api/health)', () => {
	let mockEnv;

	beforeEach(() => {
		vi.restoreAllMocks();
		mockEnv = {
			DRIVE_ROOT_ID: 'root-xyz',
			ADMIN_EMAILS: 'admin@rit.edu',
			PYQ_BUCKET: {},
			EVENTS_BUCKET: {},
		};
	});

	it('returns 200 status with ok status and ISO timestamp', async () => {
		const req = new Request('https://api.ritlib.org/api/health', {
			method: 'GET',
		});
		const res = await worker.fetch(req, mockEnv, {});
		expect(res.status).toBe(200);

		const data = await res.json();
		expect(data).toHaveProperty('status', 'ok');
		expect(data).toHaveProperty('timestamp');
		expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
	});

	it('includes correlation requestId and CORS headers in healthcheck response', async () => {
		const req = new Request('https://api.ritlib.org/api/health', {
			method: 'GET',
			headers: { 'x-request-id': 'custom-health-check-id' },
		});
		const res = await worker.fetch(req, mockEnv, {});
		expect(res.headers.get('X-Request-Id')).toBe('custom-health-check-id');
		expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
		expect(res.headers.get('Content-Type')).toContain('application/json');
	});
});
