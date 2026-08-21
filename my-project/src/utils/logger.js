/**
 * Application Logger utility
 * Provides structured logging with levels and fallback protection.
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLevel = import.meta.env?.MODE === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

export const logger = {
  debug: (...args) => {
    if (currentLevel <= LOG_LEVELS.DEBUG && typeof console !== 'undefined' && console.debug) {
      console.debug('[DEBUG]', ...args);
    }
  },
  info: (...args) => {
    if (currentLevel <= LOG_LEVELS.INFO && typeof console !== 'undefined' && console.info) {
      console.info('[INFO]', ...args);
    }
  },
  warn: (...args) => {
    if (currentLevel <= LOG_LEVELS.WARN && typeof console !== 'undefined' && console.warn) {
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args) => {
    if (currentLevel <= LOG_LEVELS.ERROR && typeof console !== 'undefined' && console.error) {
      console.error('[ERROR]', ...args);
    }
  },
};

export default logger;
