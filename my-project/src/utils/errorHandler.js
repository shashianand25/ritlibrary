/**
 * Unified Frontend Application Error Layer & Exception Normalizer
 */

import logger from './logger.js';

export class AppError extends Error {
  /**
   * @param {string} message
   * @param {string} [code='UNKNOWN_ERROR']
   * @param {number} [statusCode=500]
   * @param {Record<string, any>} [details={}]
   */
  constructor(message, code = 'UNKNOWN_ERROR', statusCode = 500, details = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Normalize and log unhandled exceptions with context
 *
 * @param {unknown} err
 * @param {string} [source='App']
 * @returns {AppError}
 */
export function normalizeError(err, source = 'App') {
  if (err instanceof AppError) {
    logger.error(`[${source}] ${err.message}`, {
      code: err.code,
      statusCode: err.statusCode,
      details: err.details,
    });
    return err;
  }

  if (err instanceof Error) {
    logger.error(`[${source}] ${err.message}`, {
      name: err.name,
      stack: err.stack,
    });
    return new AppError(err.message, 'INTERNAL_ERROR', 500, { originalError: err.name });
  }

  const message = typeof err === 'string' ? err : 'An unexpected error occurred';
  logger.error(`[${source}] ${message}`, { rawError: err });
  return new AppError(message, 'UNKNOWN_ERROR', 500);
}

/**
 * Execute an async operation with automatic error normalization
 *
 * @template T
 * @param {() => Promise<T>} fn
 * @param {T} [fallbackValue]
 * @param {string} [source='Operation']
 * @returns {Promise<T>}
 */
export async function withErrorHandling(fn, fallbackValue, source = 'Operation') {
  try {
    return await fn();
  } catch (err) {
    normalizeError(err, source);
    if (fallbackValue !== undefined) {
      return fallbackValue;
    }
    throw err;
  }
}

export default {
  AppError,
  normalizeError,
  withErrorHandling,
};
