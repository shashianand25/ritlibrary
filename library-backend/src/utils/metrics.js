/**
 * Backend Prometheus & JSON Metrics Instrumentation for Cloudflare Workers
 */

const startTime = Date.now();
const requestCounts = new Map();
const statusCounts = new Map();
let errorCount = 0;
let totalRequests = 0;

/**
 * Record an incoming HTTP request and its status
 *
 * @param {string} method
 * @param {string} path
 * @param {number} status
 */
export function recordRequest(method, path, status) {
	totalRequests++;
	const routeKey = `${method.toUpperCase()} ${path}`;
	requestCounts.set(routeKey, (requestCounts.get(routeKey) || 0) + 1);

	const statusGroup = `${Math.floor(status / 100)}xx`;
	statusCounts.set(statusGroup, (statusCounts.get(statusGroup) || 0) + 1);

	if (status >= 500) {
		errorCount++;
	}
}

/**
 * Return JSON-formatted metrics object
 */
export function getJsonMetrics() {
	return {
		uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
		totalRequests,
		errorCount,
		statusCounts: Object.fromEntries(statusCounts.entries()),
		routes: Object.fromEntries(requestCounts.entries()),
		timestamp: new Date().toISOString(),
	};
}

/**
 * Return Prometheus-compatible metrics representation
 */
export function getPrometheusMetrics() {
	const uptime = Math.floor((Date.now() - startTime) / 1000);
	const lines = [
		'# HELP http_requests_total Total number of HTTP requests processed',
		'# TYPE http_requests_total counter',
		`http_requests_total ${totalRequests}`,
		'# HELP http_errors_total Total number of 5xx HTTP errors',
		'# TYPE http_errors_total counter',
		`http_errors_total ${errorCount}`,
		'# HELP process_uptime_seconds Total worker uptime in seconds',
		'# TYPE process_uptime_seconds gauge',
		`process_uptime_seconds ${uptime}`,
	];

	for (const [statusGroup, count] of statusCounts.entries()) {
		lines.push(`http_requests_by_status{status="${statusGroup}"} ${count}`);
	}

	for (const [route, count] of requestCounts.entries()) {
		const [method, path] = route.split(' ');
		lines.push(`http_route_requests_total{method="${method}",path="${path}"} ${count}`);
	}

	return lines.join('\n') + '\n';
}

export function resetMetrics() {
	totalRequests = 0;
	errorCount = 0;
	requestCounts.clear();
	statusCounts.clear();
}

export default {
	recordRequest,
	getJsonMetrics,
	getPrometheusMetrics,
	resetMetrics,
};
