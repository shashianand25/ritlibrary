import { CORS, jsonRes } from '../utils/response.js';
import { recordRequest, getJsonMetrics, getPrometheusMetrics } from '../utils/metrics.js';

export function handleHealth(requestId) {
	return jsonRes(
		{ status: 'ok', timestamp: new Date().toISOString() },
		200,
		requestId ? { 'X-Request-Id': requestId } : {}
	);
}

export function handleMetrics(request, requestId) {
	recordRequest('GET', '/api/metrics', 200);
	const acceptHeader = request.headers.get('accept') || '';
	if (acceptHeader.includes('application/json')) {
		return jsonRes(getJsonMetrics(), 200, { 'X-Request-Id': requestId });
	}
	return new Response(getPrometheusMetrics(), {
		status: 200,
		headers: {
			'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
			...CORS,
			'X-Request-Id': requestId,
		},
	});
}

export function handleDriveRoot(env, requestId) {
	return jsonRes(
		{ folderId: env.DRIVE_ROOT_ID },
		200,
		requestId ? { 'X-Request-Id': requestId } : {}
	);
}

export default {
	handleHealth,
	handleMetrics,
	handleDriveRoot,
};
