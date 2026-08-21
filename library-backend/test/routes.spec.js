import { describe, it, expect, vi, beforeEach } from 'vitest';
import worker from '../src/index.js';
import router from '../src/router.js';

describe('Worker HTTP Router & Request Dispatch', () => {
	const mockEnv = {
		DRIVE_ROOT_ID: 'root-folder-xyz',
		PYQ_BUCKET: {
			get: vi.fn().mockResolvedValue({
				text: async () => JSON.stringify([{ id: 'file-1', name: 'Notes.pdf' }]),
			}),
			put: vi.fn().mockResolvedValue({}),
		},
		EVENTS_BUCKET: {
			get: vi.fn().mockResolvedValue({
				text: async () => JSON.stringify([{ id: 'event-1', title: 'Tech Symposium' }]),
			}),
			put: vi.fn().mockResolvedValue({}),
		},
	};

	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('handles OPTIONS preflight request with CORS headers', async () => {
		const req = new Request('https://api.ritlib.org/api/events', {
			method: 'OPTIONS',
		});
		const res = await worker.fetch(req, mockEnv, {});
		expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
	});

	it('GET / returns files from R2', async () => {
		const req = new Request('https://api.ritlib.org/');
		const res = await worker.fetch(req, mockEnv, {});
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toEqual([{ id: 'file-1', name: 'Notes.pdf' }]);
	});

	it('GET /api/drive-root returns configured Drive root folder id', async () => {
		const req = new Request('https://api.ritlib.org/api/drive-root');
		const res = await worker.fetch(req, mockEnv, {});
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.folderId).toBe('root-folder-xyz');
	});

	it('GET /api/events returns formatted events array', async () => {
		const req = new Request('https://api.ritlib.org/api/events');
		const res = await worker.fetch(req, mockEnv, {});
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.length).toBe(1);
		expect(body[0].id).toBe('event-1');
	});

	it('POST /api/check-admin validates email correctly', async () => {
		const reqInvalid = new Request('https://api.ritlib.org/api/check-admin', {
			method: 'POST',
			body: JSON.stringify({ email: 'not-an-email' }),
		});
		const resInvalid = await worker.fetch(reqInvalid, mockEnv, {});
		expect(resInvalid.status).toBe(400);

		const reqValid = new Request('https://api.ritlib.org/api/check-admin', {
			method: 'POST',
			body: JSON.stringify({ email: 'student@msrit.edu' }),
		});
		const resValid = await worker.fetch(reqValid, mockEnv, {});
		expect(resValid.status).toBe(403);
		const body = await resValid.json();
		expect(body.isAdmin).toBe(false);
	});

	it('returns 404 for unknown endpoints', async () => {
		const req = new Request('https://api.ritlib.org/api/unknown-endpoint');
		const res = await worker.fetch(req, mockEnv, {});
		expect(res.status).toBe(404);
	});
});
