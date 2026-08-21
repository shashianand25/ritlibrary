/**
 * Application Structured Logger utility
 * Formats logs into structured JSON payloads with configurable log levels
 * and an optional remote error-tracking sink.
 */

export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLevel = import.meta.env?.MODE === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

/**
 * Format log entry into structured JSON object
 * @param {string} level
 * @param {string} message
 * @param {Record<string, any>|any} [context]
 * @returns {{ timestamp: string, level: string, message: string, context?: any }}
 */
export function formatLogEntry(level, message, context) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message: typeof message === 'string' ? message : String(message),
  };

  if (context !== undefined) {
    entry.context =
      context instanceof Error
        ? { name: context.name, message: context.message, stack: context.stack }
        : context;
  }

  return entry;
}

/**
 * Optional error tracker sink (e.g. Sentry / remote logging endpoint)
 * @param {{ timestamp: string, level: string, message: string, context?: any }} entry
 */
export function sendToErrorTracker(entry) {
  const sentryDsn = import.meta.env?.VITE_SENTRY_DSN;
  if (!sentryDsn) {
    // Default no-op when Sentry/external tracker is not configured
    return;
  }

  try {
    if (typeof window !== 'undefined' && /** @type {any} */ (window).__SENTRY__) {
      /** @type {any} */ (window).__SENTRY__.captureException(
        entry.context || new Error(entry.message)
      );
    }
  } catch {
    // Fail silently in tracker sink
  }
}

export const logger = {
  debug: (message, context) => {
    if (currentLevel <= LOG_LEVELS.DEBUG && typeof console !== 'undefined' && console.debug) {
      const entry = formatLogEntry('DEBUG', message, context);
      console.debug(JSON.stringify(entry));
    }
  },
  info: (message, context) => {
    if (currentLevel <= LOG_LEVELS.INFO && typeof console !== 'undefined' && console.info) {
      const entry = formatLogEntry('INFO', message, context);
      console.info(JSON.stringify(entry));
    }
  },
  warn: (message, context) => {
    if (currentLevel <= LOG_LEVELS.WARN && typeof console !== 'undefined' && console.warn) {
      const entry = formatLogEntry('WARN', message, context);
      console.warn(JSON.stringify(entry));
    }
  },
  error: (message, context) => {
    if (currentLevel <= LOG_LEVELS.ERROR && typeof console !== 'undefined' && console.error) {
      const entry = formatLogEntry('ERROR', message, context);
      console.error(JSON.stringify(entry));
      sendToErrorTracker(entry);
    }
  },
};

export default logger;
