/**
 * Backend Structured JSON Logger & Error Tracking Sink for Cloudflare Workers
 *
 * Emits uniform structured JSON logs with `level`, `timestamp`, `requestId`, `message`,
 * `context`, and serialized `error` details.
 *
 * Supports optional remote error tracking sinks (Sentry, Cloudflare Workers Logpush,
 * or custom webhook endpoints) via `SENTRY_DSN`, `LOGPUSH_URL`, or `ERROR_TRACKER_URL`.
 */

export const LOG_LEVELS = {
	DEBUG: 0,
	INFO: 1,
	WARN: 2,
	ERROR: 3,
};

/**
 * Format a log entry into a standardized JSON-serializable object
 *
 * @param {'DEBUG'|'INFO'|'WARN'|'ERROR'} level
 * @param {string} message
 * @param {any} [context]
 * @param {string} [requestId]
 * @returns {Record<string, any>}
 */
export function formatLogEntry(level, message, context, requestId) {
	const entry = {
		timestamp: new Date().toISOString(),
		level,
		requestId: requestId || (typeof context === 'object' && context?.requestId) || 'system',
		message: typeof message === 'string' ? message : String(message),
	};

	if (context !== undefined) {
		if (context instanceof Error) {
			entry.error = {
				name: context.name,
				message: context.message,
				stack: context.stack,
			};
		} else if (typeof context === 'object' && context !== null) {
			const cleanContext = { ...context };
			if (cleanContext.error instanceof Error) {
				cleanContext.error = {
					name: cleanContext.error.name,
					message: cleanContext.error.message,
					stack: cleanContext.error.stack,
				};
			}
			if (level === 'ERROR' && cleanContext.error) {
				entry.error = cleanContext.error;
				delete cleanContext.error;
			}
			if (Object.keys(cleanContext).length > 0) {
				entry.context = cleanContext;
			}
		} else {
			entry.context = context;
		}
	}

	return entry;
}

/**
 * Parse a Sentry DSN into endpoint URL and authorization header
 *
 * @param {string} dsn - e.g. "https://public_key@o0.ingest.sentry.io/12345"
 * @returns {{ storeUrl: string, authHeader: string } | null}
 */
export function parseSentryDsn(dsn) {
	try {
		const parsed = new URL(dsn);
		const publicKey = parsed.username;
		const projectId = parsed.pathname.replace(/^\//, '');
		const host = parsed.host;
		if (!publicKey || !projectId || !host) return null;

		return {
			storeUrl: `https://${host}/api/${projectId}/store/`,
			authHeader: `Sentry sentry_version=7, sentry_client=ritlib-worker/1.0, sentry_key=${publicKey}`,
		};
	} catch {
		return null;
	}
}

/**
 * Dispatch structured error log to remote tracker (Sentry / Logpush / Webhook)
 *
 * @param {Record<string, any>} entry
 * @param {Record<string, any>} [env]
 * @returns {Promise<boolean>}
 */
export async function sendToRemoteSink(entry, env) {
	const sentryDsn = env?.SENTRY_DSN || (typeof globalThis !== 'undefined' && globalThis.SENTRY_DSN);
	const logpushUrl =
		env?.LOGPUSH_URL ||
		env?.ERROR_TRACKER_URL ||
		(typeof globalThis !== 'undefined' && (globalThis.LOGPUSH_URL || globalThis.ERROR_TRACKER_URL));

	let sent = false;

	// 1. Dispatch to Sentry if configured
	if (sentryDsn) {
		const sentryConfig = parseSentryDsn(sentryDsn);
		if (sentryConfig) {
			try {
				const eventPayload = {
					event_id: (typeof crypto !== 'undefined' && crypto.randomUUID
						? crypto.randomUUID()
						: Math.random().toString(36).substring(2)
					).replace(/-/g, ''),
					timestamp: new Date(entry.timestamp || Date.now()).toISOString(),
					platform: 'javascript',
					level: (entry.level || 'error').toLowerCase(),
					logger: 'ritlib-cloudflare-worker',
					message: entry.message,
					tags: {
						requestId: entry.requestId || 'system',
					},
					extra: entry.context || {},
				};

				if (entry.error) {
					eventPayload.exception = {
						values: [
							{
								type: entry.error.name || 'Error',
								value: entry.error.message || entry.message,
								stacktrace: entry.error.stack ? { frames: [] } : undefined,
							},
						],
					};
				}

				const res = await fetch(sentryConfig.storeUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-Sentry-Auth': sentryConfig.authHeader,
					},
					body: JSON.stringify(eventPayload),
				});
				if (res.ok) sent = true;
			} catch {
				// Silently catch remote tracking network errors to prevent worker crash
			}
		}
	}

	// 2. Dispatch to generic Logpush / Webhook endpoint if configured
	if (logpushUrl) {
		try {
			const res = await fetch(logpushUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(entry),
			});
			if (res.ok) sent = true;
		} catch {
			// Silently catch remote sink errors
		}
	}

	return sent;
}

/**
 * Creates a contextual logger pre-bound to a specific request ID and metadata
 *
 * @param {string} requestId
 * @param {Record<string, any>} [env]
 * @param {Record<string, any>} [baseContext]
 */
export function createRequestLogger(requestId, env, baseContext = {}) {
	const buildContext = (ctx) => {
		if (ctx instanceof Error) {
			return { ...baseContext, error: ctx };
		}
		if (typeof ctx === 'object' && ctx !== null) {
			return { ...baseContext, ...ctx };
		}
		return baseContext;
	};

	return {
		debug: (message, context) => logger.debug(message, buildContext(context), requestId, env),
		info: (message, context) => logger.info(message, buildContext(context), requestId, env),
		warn: (message, context) => logger.warn(message, buildContext(context), requestId, env),
		error: (message, errorOrContext) =>
			logger.error(message, buildContext(errorOrContext), requestId, env),
		withContext: (extraContext) =>
			createRequestLogger(requestId, env, { ...baseContext, ...extraContext }),
	};
}

/**
 * Primary structured logger implementation
 */
export const logger = {
	debug: (message, context, requestId, _env) => {
		const entry = formatLogEntry('DEBUG', message, context, requestId);
		console.debug ? console.debug(JSON.stringify(entry)) : console.log(JSON.stringify(entry));
		return entry;
	},

	info: (message, context, requestId, _env) => {
		const entry = formatLogEntry('INFO', message, context, requestId);
		console.log(JSON.stringify(entry));
		return entry;
	},

	warn: (message, context, requestId, _env) => {
		const entry = formatLogEntry('WARN', message, context, requestId);
		console.warn(JSON.stringify(entry));
		return entry;
	},

	error: (message, errorOrContext, requestId, env) => {
		const entry = formatLogEntry('ERROR', message, errorOrContext, requestId);
		console.error(JSON.stringify(entry));
		sendToRemoteSink(entry, env).catch(() => {});
		return entry;
	},

	/**
	 * Create a child logger bound to a specific request ID and contextual fields
	 */
	withContext: (context = {}, env) => {
		const reqId = context.requestId || 'system';
		return createRequestLogger(reqId, env, context);
	},
};

export default logger;
