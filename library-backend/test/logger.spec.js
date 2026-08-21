import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import logger, {
	formatLogEntry,
	parseSentryDsn,
	sendToRemoteSink,
	createRequestLogger,
	LOG_LEVELS,
} from '../src/utils/logger.js';

describe('Backend Structured Logger & Error Tracking', () => {
	let logSpy;
	let warnSpy;
	let errorSpy;
	let debugSpy;

	beforeEach(() => {
		logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
		warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('formatLogEntry', () => {
		it('formats entries with level, timestamp, requestId, and message', () => {
			const entry = formatLogEntry('INFO', 'Server initialized', { port: 8787 }, 'req_12345');
			expect(entry.level).toBe('INFO');
			expect(entry.message).toBe('Server initialized');
			expect(entry.requestId).toBe('req_12345');
			expect(entry.context).toEqual({ port: 8787 });
			expect(new Date(entry.timestamp).getTime()).not.toBeNaN();
		});

		it('defaults requestId to system when not provided', () => {
			const entry = formatLogEntry('INFO', 'Cron started');
			expect(entry.requestId).toBe('system');
		});

		it('serializes Error instances into the error field', () => {
			const error = new Error('Database connection failed');
			const entry = formatLogEntry('ERROR', 'DB Error', error, 'req_db_1');
			expect(entry.level).toBe('ERROR');
			expect(entry.requestId).toBe('req_db_1');
			expect(entry.error.name).toBe('Error');
			expect(entry.error.message).toBe('Database connection failed');
			expect(entry.error.stack).toBeDefined();
		});

		it('extracts error from context object if present in ERROR level', () => {
			const error = new TypeError('Invalid payload');
			const entry = formatLogEntry(
				'ERROR',
				'Request failed',
				{ path: '/api/upload', error },
				'req_err_2'
			);
			expect(entry.error.name).toBe('TypeError');
			expect(entry.error.message).toBe('Invalid payload');
			expect(entry.context.path).toBe('/api/upload');
		});
	});

	describe('logger methods (info, warn, debug, error)', () => {
		it('logs structured info messages to console.log with requestId', () => {
			logger.info('User connected', { userId: '123' }, 'req_abc');
			expect(logSpy).toHaveBeenCalled();
			const payload = JSON.parse(logSpy.mock.calls[0][0]);
			expect(payload.level).toBe('INFO');
			expect(payload.message).toBe('User connected');
			expect(payload.requestId).toBe('req_abc');
			expect(payload.context.userId).toBe('123');
			expect(payload.timestamp).toBeDefined();
		});

		it('logs structured warn messages to console.warn', () => {
			logger.warn('Rate limit approaching', { count: 95 }, 'req_warn_1');
			expect(warnSpy).toHaveBeenCalled();
			const payload = JSON.parse(warnSpy.mock.calls[0][0]);
			expect(payload.level).toBe('WARN');
			expect(payload.message).toBe('Rate limit approaching');
			expect(payload.requestId).toBe('req_warn_1');
			expect(payload.context.count).toBe(95);
		});

		it('logs structured error messages to console.error with stack traces', () => {
			const err = new Error('Timeout while querying database');
			logger.error('Query timeout', err, 'req_err_top');
			expect(errorSpy).toHaveBeenCalled();
			const payload = JSON.parse(errorSpy.mock.calls[0][0]);
			expect(payload.level).toBe('ERROR');
			expect(payload.message).toBe('Query timeout');
			expect(payload.requestId).toBe('req_err_top');
			expect(payload.error.name).toBe('Error');
			expect(payload.error.message).toBe('Timeout while querying database');
			expect(payload.error.stack).toBeDefined();
		});

		it('logs debug messages without crashing', () => {
			logger.debug('Cache hit', { key: 'files.json' }, 'req_dbg_1');
			expect(debugSpy.mock.calls.length + logSpy.mock.calls.length).toBeGreaterThan(0);
		});
	});

	describe('contextual / request logger (withContext & createRequestLogger)', () => {
		it('binds requestId and route metadata to all child log calls', () => {
			const reqLogger = logger.withContext({ requestId: 'cf-ray-12345', path: '/api/events' });

			reqLogger.info('Fetched events successfully', { count: 10 });
			expect(logSpy).toHaveBeenCalled();
			const payload = JSON.parse(logSpy.mock.calls[0][0]);
			expect(payload.requestId).toBe('cf-ray-12345');
			expect(payload.context.path).toBe('/api/events');
			expect(payload.context.count).toBe(10);
		});

		it('preserves error details in child logger error calls', () => {
			const reqLogger = createRequestLogger('req_scoped_99', {}, { path: '/api/upload' });
			const err = new Error('Drive upload failed');
			reqLogger.error('Upload handler error', err);

			expect(errorSpy).toHaveBeenCalled();
			const payload = JSON.parse(errorSpy.mock.calls[0][0]);
			expect(payload.requestId).toBe('req_scoped_99');
			expect(payload.error.message).toBe('Drive upload failed');
			expect(payload.context.path).toBe('/api/upload');
		});
	});

	describe('Sentry and Remote Error Tracker Sink', () => {
		it('parses valid Sentry DSN accurately', () => {
			const dsn = 'https://abcdef123456@o99999.ingest.sentry.io/1234567';
			const parsed = parseSentryDsn(dsn);
			expect(parsed).not.toBeNull();
			expect(parsed.storeUrl).toBe('https://o99999.ingest.sentry.io/api/1234567/store/');
			expect(parsed.authHeader).toContain('sentry_key=abcdef123456');
		});

		it('returns null on invalid DSN strings gracefully', () => {
			expect(parseSentryDsn('invalid-dsn')).toBeNull();
			expect(parseSentryDsn('')).toBeNull();
			expect(parseSentryDsn(null)).toBeNull();
		});

		it('dispatches structured error to Sentry endpoint when SENTRY_DSN is configured', async () => {
			const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
			vi.stubGlobal('fetch', fetchMock);

			const entry = formatLogEntry(
				'ERROR',
				'Unhandled worker exception',
				new Error('Crash in Drive API'),
				'req_sentry_1'
			);

			const mockEnv = {
				SENTRY_DSN: 'https://key123@sentry.example.com/42',
			};

			const sent = await sendToRemoteSink(entry, mockEnv);
			expect(sent).toBe(true);
			expect(fetchMock).toHaveBeenCalledWith(
				'https://sentry.example.com/api/42/store/',
				expect.objectContaining({
					method: 'POST',
					headers: expect.objectContaining({
						'Content-Type': 'application/json',
						'X-Sentry-Auth': expect.stringContaining('sentry_key=key123'),
					}),
				})
			);

			const sentBody = JSON.parse(fetchMock.mock.calls[0][1].body);
			expect(sentBody.message).toBe('Unhandled worker exception');
			expect(sentBody.tags.requestId).toBe('req_sentry_1');
			expect(sentBody.exception.values[0].value).toBe('Crash in Drive API');
		});

		it('dispatches structured log to LOGPUSH_URL when configured', async () => {
			const fetchMock = vi.fn().mockResolvedValue(new Response('{"status":"ok"}', { status: 200 }));
			vi.stubGlobal('fetch', fetchMock);

			const entry = formatLogEntry('ERROR', 'Disk full alert', { diskUsage: 99 }, 'req_push_1');
			const mockEnv = {
				LOGPUSH_URL: 'https://logpush.internal.rit.edu/ingest',
			};

			const sent = await sendToRemoteSink(entry, mockEnv);
			expect(sent).toBe(true);
			expect(fetchMock).toHaveBeenCalledWith(
				'https://logpush.internal.rit.edu/ingest',
				expect.objectContaining({
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
				})
			);
		});

		it('returns false and does not throw when no remote sink is configured', async () => {
			const entry = formatLogEntry('ERROR', 'Local error only');
			const sent = await sendToRemoteSink(entry, {});
			expect(sent).toBe(false);
		});

		it('handles network failure during remote sink dispatch gracefully without throwing', async () => {
			const fetchMock = vi.fn().mockRejectedValue(new Error('Network offline'));
			vi.stubGlobal('fetch', fetchMock);

			const entry = formatLogEntry('ERROR', 'Sink network failure');
			const mockEnv = {
				SENTRY_DSN: 'https://key@sentry.io/1',
			};

			const sent = await sendToRemoteSink(entry, mockEnv);
			expect(sent).toBe(false);
		});
	});
});
