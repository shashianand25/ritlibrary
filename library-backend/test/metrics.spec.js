import { describe, it, expect, beforeEach } from 'vitest';
import {
	recordRequest,
	getJsonMetrics,
	getPrometheusMetrics,
	resetMetrics,
} from '../src/utils/metrics.js';
import { handleRequest } from '../src/router.js';

describe('Backend Metrics Telemetry Suite', () => {
	beforeEach(() => {
		resetMetrics();
	});

	it('records request counts and status codes correctly', () => {
		recordRequest('GET', '/api/health', 200);
		recordRequest('POST', '/api/events', 201);
		recordRequest('GET', '/api/health', 500);

		const json = getJsonMetrics();
		expect(json.totalRequests).toBe(3);
		expect(json.errorCount).toBe(1);
		expect(json.statusCounts['2xx']).toBe(2);
		expect(json.statusCounts['5xx']).toBe(1);
		expect(json.routes['GET /api/health']).toBe(2);
		expect(json.routes['POST /api/events']).toBe(1);
	});

	it('formats metrics in standard Prometheus text format', () => {
		recordRequest('GET', '/api/drive-root', 200);

		const prom = getPrometheusMetrics();
		expect(prom).toContain('http_requests_total 1');
		expect(prom).toContain('process_uptime_seconds');
		expect(prom).toContain('http_requests_by_status{status="2xx"} 1');
		expect(prom).toContain('http_route_requests_total{method="GET",path="/api/drive-root"} 1');
	});

	it('serves Prometheus text format via GET /api/metrics by default', async () => {
		const req = new Request('https://worker.test/api/metrics', {
			method: 'GET',
		});
		const env = { DRIVE_ROOT_ID: 'mock-root' };
		const res = await handleRequest(req, env);

		expect(res.status).toBe(200);
		expect(res.headers.get('Content-Type')).toContain('text/plain');
		const body = await res.text();
		expect(body).toContain('http_requests_total');
	});

	it('serves JSON metrics via GET /api/metrics when Accept header requests application/json', async () => {
		const req = new Request('https://worker.test/api/metrics', {
			method: 'GET',
			headers: { Accept: 'application/json' },
		});
		const env = { DRIVE_ROOT_ID: 'mock-root' };
		const res = await handleRequest(req, env);

		expect(res.status).toBe(200);
		expect(res.headers.get('Content-Type')).toContain('application/json');
		const data = await res.json();
		expect(data).toHaveProperty('uptimeSeconds');
		expect(data).toHaveProperty('totalRequests');
	});
});
