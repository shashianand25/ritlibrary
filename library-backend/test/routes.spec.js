import { describe, it, expect, vi, beforeEach } from 'vitest';
import worker from '../src/index.js';

describe('Worker HTTP Router & Request Dispatch', () => {
	let mockEnv;

	beforeEach(() => {
		vi.restoreAllMocks();
		mockEnv = {
			DRIVE_ROOT_ID: 'root-folder-xyz',
			ADMIN_EMAILS: 'admin@rit.edu',
			FIREBASE_API_KEY: 'test-api-key',
			PYQ_BUCKET: {
				get: vi.fn().mockResolvedValue({
					text: async () => JSON.stringify([{ id: 'file-1', name: 'Notes.pdf' }]),
				}),
				put: vi.fn().mockResolvedValue({}),
			},
			EVENTS_BUCKET: {
				get: vi.fn().mockImplementation(async (key) => {
					if (key === 'banner.jpg') {
						return {
							body: new Uint8Array([1, 2, 3]),
							httpMetadata: { contentType: 'image/jpeg' },
						};
					}
					if (key === 'events.json') {
						return {
							text: async () =>
								JSON.stringify([
									{ id: 'event-1', title: 'Tech Symposium', imageKey: 'events/banner.jpg' },
								]),
						};
					}
					return null;
				}),
				put: vi.fn().mockResolvedValue({}),
				delete: vi.fn().mockResolvedValue({}),
			},
		};
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

	it('GET /api/health returns ok status and current timestamp', async () => {
		const req = new Request('https://api.ritlib.org/api/health');
		const res = await worker.fetch(req, mockEnv, {});
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.status).toBe('ok');
		expect(body.timestamp).toBeDefined();
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

	it('GET /api/events/assets/:key serves event banner asset from R2 and returns 404 when missing', async () => {
		const reqFound = new Request('https://api.ritlib.org/api/events/assets/banner.jpg');
		const resFound = await worker.fetch(reqFound, mockEnv, {});
		expect(resFound.status).toBe(200);
		expect(resFound.headers.get('Content-Type')).toBe('image/jpeg');
		expect(resFound.headers.get('Cache-Control')).toContain('max-age=31536000');

		const reqMissing = new Request('https://api.ritlib.org/api/events/assets/missing.png');
		const resMissing = await worker.fetch(reqMissing, mockEnv, {});
		expect(resMissing.status).toBe(404);
	});

	it('DELETE /api/events/:id deletes target event from R2 and returns 404 when missing', async () => {
		const reqFound = new Request('https://api.ritlib.org/api/events/event-1', {
			method: 'DELETE',
		});
		const resFound = await worker.fetch(reqFound, mockEnv, {});
		expect(resFound.status).toBe(200);
		const data = await resFound.json();
		expect(data.success).toBe(true);

		const reqMissing = new Request('https://api.ritlib.org/api/events/non-existent', {
			method: 'DELETE',
		});
		const resMissing = await worker.fetch(reqMissing, mockEnv, {});
		expect(resMissing.status).toBe(404);
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
