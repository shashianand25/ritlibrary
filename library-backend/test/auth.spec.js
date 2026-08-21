import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	verifyIdToken,
	checkIsAdmin,
	requireAdmin,
	requireDeleter,
	requireUploader,
} from '../src/utils/auth.js';

describe('Backend Auth & RBAC Middleware', () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it('verifies Firebase ID token and extracts user email', async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ users: [{ email: 'admin@msrit.edu' }] }),
		});

		const email = await verifyIdToken('mock-token-123', 'mock-firebase-api-key');
		expect(email).toBe('admin@msrit.edu');
	});

	it('returns null on invalid token or missing parameters', async () => {
		expect(await verifyIdToken(null, 'key')).toBeNull();
		expect(await verifyIdToken('token', null)).toBeNull();

		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 400,
		});
		expect(await verifyIdToken('bad-token', 'key')).toBeNull();
	});

	it('checks bootstrap admin emails correctly', async () => {
		const env = { ADMIN_EMAILS: 'admin1@msrit.edu, admin2@msrit.edu' };
		expect(await checkIsAdmin('admin1@msrit.edu', env)).toBe(true);
		expect(await checkIsAdmin('ADMIN2@msrit.edu', env)).toBe(true);
		expect(await checkIsAdmin('user@msrit.edu', env)).toBe(false);
	});

	it('requireAdmin rejects requests without token or with invalid credentials', async () => {
		const env = { FIREBASE_API_KEY: 'test-key', ADMIN_EMAILS: 'admin@msrit.edu' };

		// Missing header
		const reqNoAuth = new Request('https://api.example.com/api/admins');
		const resNoAuth = await requireAdmin(reqNoAuth, env);
		expect(resNoAuth.response.status).toBe(401);

		// Invalid token
		globalThis.fetch = vi.fn().mockResolvedValue({ ok: false });
		const reqBadAuth = new Request('https://api.example.com/api/admins', {
			headers: { Authorization: 'Bearer bad-token' },
		});
		const resBadAuth = await requireAdmin(reqBadAuth, env);
		expect(resBadAuth.response.status).toBe(401);
	});

	it('requireAdmin allows authorized admins and returns their email', async () => {
		const env = { FIREBASE_API_KEY: 'test-key', ADMIN_EMAILS: 'admin@msrit.edu' };
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ users: [{ email: 'admin@msrit.edu' }] }),
		});

		const req = new Request('https://api.example.com/api/admins', {
			headers: { Authorization: 'Bearer valid-token' },
		});
		const result = await requireAdmin(req, env);
		expect(result.email).toBe('admin@msrit.edu');
		expect(result.response).toBeUndefined();
	});

	it('requireDeleter allows public deletes or authenticated users', async () => {
		const env = { FIREBASE_API_KEY: 'test-key' };
		const req = new Request('https://api.example.com/api/files/123');
		const result = await requireDeleter(req, env);
		expect(result.email).toBe('public-showcase');
	});

	it('requireUploader validates authorization headers and returns verified email', async () => {
		const env = { FIREBASE_API_KEY: 'test-key' };
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ users: [{ email: 'uploader@msrit.edu' }] }),
		});

		const req = new Request('https://api.example.com/api/upload', {
			headers: { Authorization: 'Bearer upload-token' },
		});
		const result = await requireUploader(req, env);
		expect(result.email).toBe('uploader@msrit.edu');
	});
});
