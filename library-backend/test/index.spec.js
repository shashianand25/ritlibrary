import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import worker from '../src/index.js';
import * as adminsDb from '../src/db.js';

describe('RIT Library Worker Entry Point & API Validation', () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	const createMockEnv = () => ({
		DRIVE_ROOT_ID: 'root-123',
		FIREBASE_API_KEY: 'test-api-key',
		ADMIN_EMAILS: 'admin@rit.edu,lead@rit.edu',
		PYQ_BUCKET: {
			get: async () => null,
			put: async () => {},
		},
		EVENTS_BUCKET: {
			get: async () => null,
			put: async () => {},
			delete: async () => {},
		},
	});

	const mockAuthFetch = (email = 'admin@rit.edu') => {
		globalThis.fetch = vi.fn().mockImplementation(async (url) => {
			const urlStr = String(url);
			if (urlStr.includes('identitytoolkit.googleapis.com')) {
				return {
					ok: true,
					json: async () => ({ users: [{ email }] }),
				};
			}
			if (urlStr.includes('oauth2.googleapis.com/token')) {
				return {
					ok: true,
					json: async () => ({ access_token: 'mock-token' }),
				};
			}
			if (urlStr.includes('googleapis.com/upload/drive')) {
				return {
					ok: true,
					json: async () => ({ id: 'uploaded-drive-id-123', name: 'uploaded-file' }),
				};
			}
			return { ok: true, json: async () => ({}) };
		});
	};

	describe('Basic Routes & Cron', () => {
		it('delegates fetch handling to the router', async () => {
			const request = new Request('http://example.com/api/drive-root');
			const env = createMockEnv();
			const response = await worker.fetch(request, env, {});
			expect(response.status).toBe(200);
			const data = await response.json();
			expect(data.folderId).toBe('root-123');
		});

		it('returns an empty file list when files.json is missing in R2', async () => {
			const request = new Request('http://example.com/');
			const env = createMockEnv();
			const response = await worker.fetch(request, env, {});
			expect(response.status).toBe(200);
			const data = await response.json();
			expect(data).toEqual([]);
		});

		it('runs scheduled cron task without crashing', async () => {
			const env = {
				...createMockEnv(),
				GOOGLE_SERVICE_ACCOUNT: null,
				GOOGLE_OAUTH_CLIENT_ID: null,
			};
			const waitUntilCalls = [];
			const ctx = {
				waitUntil: (promise) => waitUntilCalls.push(promise),
			};

			await worker.scheduled({}, env, ctx);
			expect(waitUntilCalls.length).toBe(1);
		});
	});

	describe('POST /api/check-admin validation', () => {
		it('accepts valid email and returns isAdmin status', async () => {
			const env = createMockEnv();
			const req = new Request('http://example.com/api/check-admin', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: 'admin@rit.edu' }),
			});
			const res = await worker.fetch(req, env, {});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.isAdmin).toBe(true);
		});

		it('returns 403 for valid email not in admin list', async () => {
			const env = createMockEnv();
			const req = new Request('http://example.com/api/check-admin', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: 'student@rit.edu' }),
			});
			const res = await worker.fetch(req, env, {});
			expect(res.status).toBe(403);
			const data = await res.json();
			expect(data.isAdmin).toBe(false);
		});

		it('returns 400 for invalid email payload format', async () => {
			const env = createMockEnv();
			const req = new Request('http://example.com/api/check-admin', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: 'not-an-email' }),
			});
			const res = await worker.fetch(req, env, {});
			expect(res.status).toBe(400);
			const data = await res.json();
			expect(data.isAdmin).toBe(false);
			expect(data.error).toBe('Invalid email');
		});

		it('returns 400 for missing email or malformed JSON', async () => {
			const env = createMockEnv();
			const reqMissing = new Request('http://example.com/api/check-admin', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({}),
			});
			const resMissing = await worker.fetch(reqMissing, env, {});
			expect(resMissing.status).toBe(400);
			const dataMissing = await resMissing.json();
			expect(dataMissing.isAdmin).toBe(false);

			const reqBadJson = new Request('http://example.com/api/check-admin', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: '{bad-json',
			});
			const resBadJson = await worker.fetch(reqBadJson, env, {});
			expect(resBadJson.status).toBe(400);
		});
	});

	describe('POST & DELETE /api/admins validation', () => {
		it('rejects unauthenticated requests to /api/admins', async () => {
			const env = createMockEnv();
			const req = new Request('http://example.com/api/admins', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ newAdminEmail: 'user@rit.edu' }),
			});
			const res = await worker.fetch(req, env, {});
			expect(res.status).toBe(401);
		});

		it('returns 400 when adding admin with invalid email payload', async () => {
			const env = createMockEnv();
			mockAuthFetch('admin@rit.edu');

			const req = new Request('http://example.com/api/admins', {
				method: 'POST',
				headers: {
					Authorization: 'Bearer valid-token',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ newAdminEmail: 'invalid-email-address' }),
			});
			const res = await worker.fetch(req, env, {});
			expect(res.status).toBe(400);
			const data = await res.json();
			expect(data.error).toBe('Invalid email address');
		});

		it('returns 400 when deleting admin with invalid email payload', async () => {
			const env = createMockEnv();
			mockAuthFetch('admin@rit.edu');

			const req = new Request('http://example.com/api/admins', {
				method: 'DELETE',
				headers: {
					Authorization: 'Bearer valid-token',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ removeEmail: 'not-an-email' }),
			});
			const res = await worker.fetch(req, env, {});
			expect(res.status).toBe(400);
			const data = await res.json();
			expect(data.error).toBe('Invalid email address');
		});

		it('successfully processes valid admin payloads when authenticated', async () => {
			const env = createMockEnv();
			mockAuthFetch('admin@rit.edu');
			vi.spyOn(adminsDb, 'addAdminToDb').mockResolvedValue();
			vi.spyOn(adminsDb, 'removeAdminFromDb').mockResolvedValue();

			const postReq = new Request('http://example.com/api/admins', {
				method: 'POST',
				headers: {
					Authorization: 'Bearer valid-token',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ newAdminEmail: 'faculty@rit.edu' }),
			});
			const postRes = await worker.fetch(postReq, env, {});
			expect(postRes.status).toBe(200);
			expect((await postRes.json()).success).toBe(true);

			const deleteReq = new Request('http://example.com/api/admins', {
				method: 'DELETE',
				headers: {
					Authorization: 'Bearer valid-token',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ removeEmail: 'faculty@rit.edu' }),
			});
			const deleteRes = await worker.fetch(deleteReq, env, {});
			expect(deleteRes.status).toBe(200);
			expect((await deleteRes.json()).success).toBe(true);
		});
	});

	describe('POST /api/register-file validation', () => {
		it('returns 400 when register-file payload misses id or name', async () => {
			const env = createMockEnv();
			mockAuthFetch('admin@rit.edu');

			const req = new Request('http://example.com/api/register-file', {
				method: 'POST',
				headers: {
					Authorization: 'Bearer valid-token',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ mimeType: 'application/pdf' }),
			});
			const res = await worker.fetch(req, env, {});
			expect(res.status).toBe(400);
			const data = await res.json();
			expect(data.error).toContain('Missing id or name');
		});

		it('registers file successfully with valid payload', async () => {
			const env = createMockEnv();
			mockAuthFetch('admin@rit.edu');

			const req = new Request('http://example.com/api/register-file', {
				method: 'POST',
				headers: {
					Authorization: 'Bearer valid-token',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					id: 'drive-file-abc',
					name: 'PhysicsNotes.pdf',
					mimeType: 'application/pdf',
				}),
			});
			const res = await worker.fetch(req, env, {});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.success).toBe(true);
			expect(data.file.id).toBe('drive-file-abc');
			expect(data.file.name).toBe('PhysicsNotes.pdf');
		});
	});

	describe('POST /api/events validation', () => {
		it('returns 400 when banner image is missing in event creation', async () => {
			const env = createMockEnv();
			mockAuthFetch('admin@rit.edu');

			const formData = new FormData();
			formData.append('title', 'Hackathon 2026');
			formData.append('description', 'A full 24h coding challenge');

			const req = new Request('http://example.com/api/events', {
				method: 'POST',
				headers: { Authorization: 'Bearer valid-token' },
				body: formData,
			});
			const res = await worker.fetch(req, env, {});
			expect(res.status).toBe(400);
			const data = await res.json();
			expect(data.error).toBe('Banner image is required');
		});

		it('returns 400 when event metadata fails schema validation (short title / invalid category)', async () => {
			const env = createMockEnv();
			mockAuthFetch('admin@rit.edu');

			const formData = new FormData();
			formData.append('image', new File(['dummy-data'], 'banner.png', { type: 'image/png' }));
			formData.append('title', 'A');
			formData.append('description', 'Bad');
			formData.append('category', 'unknown-category');

			const req = new Request('http://example.com/api/events', {
				method: 'POST',
				headers: { Authorization: 'Bearer valid-token' },
				body: formData,
			});
			const res = await worker.fetch(req, env, {});
			expect(res.status).toBe(400);
			const data = await res.json();
			expect(data.error).toBeDefined();
			expect(data.error).toContain('Title must be at least 2 characters long');
		});

		it('creates event successfully with valid payload', async () => {
			const env = createMockEnv();
			mockAuthFetch('admin@rit.edu');

			const formData = new FormData();
			formData.append('image', new File(['banner-bytes'], 'banner.jpg', { type: 'image/jpeg' }));
			formData.append('title', 'AI Symposium 2026');
			formData.append('description', 'Annual Artificial Intelligence Symposium');
			formData.append('category', 'event');

			const req = new Request('http://example.com/api/events', {
				method: 'POST',
				headers: { Authorization: 'Bearer valid-token' },
				body: formData,
			});
			const res = await worker.fetch(req, env, {});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.success).toBe(true);
			expect(data.event.title).toBe('AI Symposium 2026');
			expect(data.event.category).toBe('event');
		});
	});

	describe('POST /api/upload validation', () => {
		it('returns 400 when file is missing in upload payload', async () => {
			const env = createMockEnv();
			mockAuthFetch('uploader@rit.edu');

			const formData = new FormData();
			formData.append('year', '2nd Year');
			formData.append('sem', '3');
			formData.append('branch', 'CSE');
			formData.append('subjectCode', '21CS32');
			formData.append('folderName', 'Unit 1');

			const req = new Request('http://example.com/api/upload', {
				method: 'POST',
				headers: { Authorization: 'Bearer valid-token' },
				body: formData,
			});
			const res = await worker.fetch(req, env, {});
			expect(res.status).toBe(400);
			const data = await res.json();
			expect(data.error).toBe('File is required');
		});

		it('returns 400 when upload metadata fails schema validation (missing required fields)', async () => {
			const env = createMockEnv();
			mockAuthFetch('uploader@rit.edu');

			const formData = new FormData();
			formData.append(
				'file',
				new File(['notes content'], 'module1.pdf', { type: 'application/pdf' })
			);
			formData.append('year', '2nd Year');
			// missing sem, branch, subjectCode, folderName

			const req = new Request('http://example.com/api/upload', {
				method: 'POST',
				headers: { Authorization: 'Bearer valid-token' },
				body: formData,
			});
			const res = await worker.fetch(req, env, {});
			expect(res.status).toBe(400);
			const data = await res.json();
			expect(data.error).toBeDefined();
			expect(data.error).toContain("Field 'sem' is required");
		});

		it('processes file upload successfully with valid metadata', async () => {
			const env = {
				...createMockEnv(),
				GOOGLE_OAUTH_CLIENT_ID: 'client-id',
				GOOGLE_OAUTH_CLIENT_SECRET: 'client-secret',
				GOOGLE_REFRESH_TOKEN: 'refresh-token',
			};
			mockAuthFetch('uploader@rit.edu');

			const formData = new FormData();
			formData.append(
				'file',
				new File(['notes content'], 'Module1.pdf', { type: 'application/pdf' })
			);
			formData.append('year', '2nd Year');
			formData.append('sem', '3');
			formData.append('branch', 'CSE');
			formData.append('subjectCode', '21CS32');
			formData.append('folderName', 'Unit 1');
			formData.append('section', 'Gen');

			const req = new Request('http://example.com/api/upload', {
				method: 'POST',
				headers: { Authorization: 'Bearer valid-token' },
				body: formData,
			});
			const res = await worker.fetch(req, env, {});
			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.success).toBe(true);
			expect(data.file.subjectCode).toBe('21CS32');
			expect(data.file.uploaderEmail).toBe('uploader@rit.edu');
		});
	});
});
