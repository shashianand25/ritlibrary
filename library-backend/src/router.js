import { CORS, jsonRes } from './utils/response.js';
import { z } from './schemas.js';
import logger from './utils/logger.js';
import { recordRequest } from './utils/metrics.js';
import { handleCheckAdmin, handleAdminsRoute } from './handlers/adminsHandler.js';
import {
	handleListEvents,
	handleGetEventAsset,
	handleCreateEvent,
	handleDeleteEvent,
} from './handlers/eventsHandler.js';
import {
	handleListFiles,
	handleRegisterFile,
	handleUploadFile,
	handleDeleteFile,
} from './handlers/filesHandler.js';
import { handleHealth, handleMetrics, handleDriveRoot } from './handlers/telemetryHandler.js';

export async function handleRequest(request, env, _ctx) {
	const requestId =
		request.headers.get('cf-ray') ||
		request.headers.get('x-request-id') ||
		(typeof crypto !== 'undefined' && crypto.randomUUID
			? `req_${crypto.randomUUID()}`
			: `req_${Date.now()}`);

	const url = new URL(request.url);
	const reqLogger = logger.withContext(
		{ requestId, path: url.pathname, method: request.method },
		env
	);

	try {
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: { ...CORS, 'X-Request-Id': requestId },
			});
		}

		/* GET / — serve files.json from R2 */
		if (request.method === 'GET' && url.pathname === '/') {
			const res = await handleListFiles(env);
			recordRequest(request.method, url.pathname, res.status);
			return res;
		}

		/* GET /api/health — lightweight availability healthcheck */
		if (request.method === 'GET' && url.pathname === '/api/health') {
			const res = handleHealth(requestId);
			recordRequest(request.method, url.pathname, res.status);
			return res;
		}

		/* GET /api/metrics — Prometheus / JSON runtime telemetry */
		if (request.method === 'GET' && url.pathname === '/api/metrics') {
			return handleMetrics(request, requestId);
		}

		/* GET /api/drive-root — exposes folder ID for client uploads */
		if (request.method === 'GET' && url.pathname === '/api/drive-root') {
			const res = handleDriveRoot(env, requestId);
			recordRequest(request.method, url.pathname, res.status);
			return res;
		}

		/* GET /api/events — serve events from R2 */
		if (request.method === 'GET' && url.pathname === '/api/events') {
			const res = await handleListEvents(env, url);
			recordRequest(request.method, url.pathname, res.status);
			return res;
		}

		/* GET /api/events/assets/... — serve event banner image */
		if (request.method === 'GET' && url.pathname.startsWith('/api/events/assets/')) {
			return handleGetEventAsset(url, env);
		}

		/* DELETE /api/events/:id — remove event */
		if (request.method === 'DELETE' && url.pathname.startsWith('/api/events/')) {
			const res = await handleDeleteEvent(request, env, url);
			recordRequest(request.method, url.pathname, res.status);
			return res;
		}

		/* POST /api/check-admin */
		if (url.pathname === '/api/check-admin' && request.method === 'POST') {
			const res = await handleCheckAdmin(request, env);
			recordRequest(request.method, url.pathname, res.status);
			return res;
		}

		/* ADMIN MANAGEMENT ROUTES */
		if (url.pathname === '/api/admins') {
			const res = await handleAdminsRoute(request, env);
			recordRequest(request.method, url.pathname, res.status);
			return res;
		}

		/* POST /api/register-file */
		if (url.pathname === '/api/register-file' && request.method === 'POST') {
			const res = await handleRegisterFile(request, env);
			recordRequest(request.method, url.pathname, res.status);
			return res;
		}

		/* DELETE /api/files/:id */
		if (request.method === 'DELETE' && url.pathname.startsWith('/api/files/')) {
			const res = await handleDeleteFile(request, env, url);
			recordRequest(request.method, url.pathname, res.status);
			return res;
		}

		/* POST /api/events */
		if (url.pathname === '/api/events' && request.method === 'POST') {
			const res = await handleCreateEvent(request, env, url);
			recordRequest(request.method, url.pathname, res.status);
			return res;
		}

		/* POST /api/upload */
		if (url.pathname === '/api/upload' && request.method === 'POST') {
			const res = await handleUploadFile(request, env);
			recordRequest(request.method, url.pathname, res.status);
			return res;
		}

		return jsonRes({ error: 'Not Found' }, 404);
	} catch (err) {
		const urlPath = url.pathname;
		if (err instanceof z.ZodError || err?.name === 'ZodError') {
			const errorMsg = err.errors?.map((e) => e.message).join(', ') || 'Validation error';
			reqLogger.warn(`Validation failure on [${request.method}] ${urlPath}: ${errorMsg}`, {
				path: urlPath,
				method: request.method,
				errors: err.errors,
			});
			return jsonRes({ error: errorMsg, requestId }, 400, { 'X-Request-Id': requestId });
		}

		logger.error(
			`Unhandled worker error on [${request.method}] ${urlPath}: ${err?.message || 'Internal server error'}`,
			{
				name: err?.name || 'Error',
				message: err?.message || String(err),
				stack: err?.stack || new Error().stack,
				path: urlPath,
				method: request.method,
				requestId,
			},
			requestId,
			env
		);

		return jsonRes({ error: err?.message || 'Internal server error', requestId }, 500, {
			'X-Request-Id': requestId,
		});
	}
}

export default {
	fetch: handleRequest,
};
