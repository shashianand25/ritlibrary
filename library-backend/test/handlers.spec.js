import { describe, it, expect, vi } from 'vitest';
import { handleHealth, handleMetrics, handleDriveRoot } from '../src/handlers/telemetryHandler.js';
import { handleCheckAdmin, handleAdminsRoute } from '../src/handlers/adminsHandler.js';
import { handleListFiles } from '../src/handlers/filesHandler.js';
import { handleListEvents } from '../src/handlers/eventsHandler.js';

describe('Modular Backend Handlers Suite', () => {
	it('handleHealth returns standard ok status payload', async () => {
		const res = handleHealth();
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.status).toBe('ok');
		expect(body.timestamp).toBeDefined();
	});

	it('handleDriveRoot returns configured DRIVE_ROOT_ID', async () => {
		const res = handleDriveRoot({ DRIVE_ROOT_ID: 'root-folder-123' });
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.folderId).toBe('root-folder-123');
	});

	it('handleMetrics serves Prometheus text metrics', async () => {
		const req = new Request('https://worker.test/api/metrics', { method: 'GET' });
		const res = handleMetrics(req, 'req_123');
		expect(res.status).toBe(200);
		const text = await res.text();
		expect(text).toContain('http_requests_total');
	});

	it('handleCheckAdmin validates emails safely', async () => {
		const req = new Request('https://worker.test/api/check-admin', {
			method: 'POST',
			body: JSON.stringify({ email: 'admin@rit.edu' }),
		});
		const env = { ADMIN_EMAILS: 'admin@rit.edu' };
		const res = await handleCheckAdmin(req, env);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.isAdmin).toBe(true);
	});

	it('handleAdminsRoute returns 401 when unauthorized', async () => {
		const req = new Request('https://worker.test/api/admins', { method: 'GET' });
		const env = { ADMIN_EMAILS: 'admin@rit.edu' };
		const res = await handleAdminsRoute(req, env);
		expect(res.status).toBe(401);
	});

	it('handleListFiles reads catalog from R2 service', async () => {
		const env = {
			PYQ_BUCKET: {
				get: vi.fn().mockResolvedValue({
					text: () => JSON.stringify([{ id: 'f1', name: 'Notes.pdf' }]),
				}),
			},
		};
		const res = await handleListFiles(env);
		expect(res.status).toBe(200);
		const files = await res.json();
		expect(files.length).toBe(1);
		expect(files[0].id).toBe('f1');
	});

	it('handleListEvents parses events array with asset urls', async () => {
		const env = {
			EVENTS_BUCKET: {
				get: vi.fn().mockResolvedValue({
					text: () =>
						JSON.stringify([{ id: 'ev1', title: 'Hackathon', imageKey: 'events/banner.png' }]),
				}),
			},
		};
		const url = new URL('https://api.ritlibrary.com/api/events');
		const res = await handleListEvents(env, url);
		expect(res.status).toBe(200);
		const events = await res.json();
		expect(events[0].imageUrl).toContain('https://api.ritlibrary.com/api/events/assets/');
	});
});
