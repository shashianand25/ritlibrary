import { describe, it, expect } from 'vitest';
import { AppError, normalizeError, withErrorHandling } from '../utils/errorHandler.js';

describe('Frontend Error Layer Suite', () => {
  it('instantiates AppError with appropriate status code and metadata', () => {
    const error = new AppError('Resource not found', 'NOT_FOUND', 404, { resourceId: '123' });
    expect(error.message).toBe('Resource not found');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.statusCode).toBe(404);
    expect(error.details.resourceId).toBe('123');
    expect(error.timestamp).toBeDefined();
  });

  it('normalizes standard JavaScript errors into AppError instances', () => {
    const rawError = new TypeError('Cannot read properties of undefined');
    const normalized = normalizeError(rawError, 'TestComponent');

    expect(normalized).toBeInstanceOf(AppError);
    expect(normalized.message).toBe('Cannot read properties of undefined');
    expect(normalized.statusCode).toBe(500);
  });

  it('normalizes string errors cleanly', () => {
    const normalized = normalizeError('Network request timed out');
    expect(normalized).toBeInstanceOf(AppError);
    expect(normalized.message).toBe('Network request timed out');
  });

  it('executes withErrorHandling successfully on resolve', async () => {
    const result = await withErrorHandling(async () => 'success_payload', 'fallback');
    expect(result).toBe('success_payload');
  });

  it('returns fallback value when withErrorHandling operation fails', async () => {
    const result = await withErrorHandling(
      async () => {
        throw new Error('Database disconnected');
      },
      'fallback_data',
      'TestOperation'
    );
    expect(result).toBe('fallback_data');
  });
});
