import { describe, it, expect, beforeEach } from 'vitest';
import { Sentry, initErrorTracking } from '../utils/errorTracking.js';

describe('Sentry / Error Tracking Client Suite', () => {
  beforeEach(() => {
    Sentry.reset();
  });

  it('is a no-op when DSN is unset or empty', () => {
    expect(Sentry.isEnabled()).toBe(false);
    expect(Sentry.init({ dsn: '' })).toBe(false);
    expect(Sentry.init({ dsn: undefined })).toBe(false);
    expect(Sentry.init({ dsn: null })).toBe(false);
    expect(Sentry.init({ dsn: '   ' })).toBe(false);

    expect(Sentry.isEnabled()).toBe(false);
    expect(Sentry.captureException(new Error('Test error'))).toBeNull();
    expect(Sentry.captureMessage('Test message')).toBeNull();
  });

  it('initErrorTracking helper defaults to no-op when env var is absent', () => {
    expect(initErrorTracking('')).toBe(false);
    expect(Sentry.isEnabled()).toBe(false);
  });

  it('initializes successfully and captures exception payloads when valid DSN is supplied', () => {
    const validDsn = 'https://key123@o0.ingest.sentry.io/456789';
    const initResult = Sentry.init({
      dsn: validDsn,
      environment: 'test',
      release: '1.3.0',
    });

    expect(initResult).toBe(true);
    expect(Sentry.isEnabled()).toBe(true);

    const testError = new Error('Database connection failed');
    testError.name = 'DatabaseError';

    const payload = Sentry.captureException(testError, { userId: 'user-123' });
    expect(payload).not.toBeNull();
    expect(payload.platform).toBe('javascript');
    expect(payload.level).toBe('error');
    expect(payload.exception.values[0].type).toBe('DatabaseError');
    expect(payload.exception.values[0].value).toBe('Database connection failed');
    expect(payload.extra.userId).toBe('user-123');

    const msgPayload = Sentry.captureMessage('User signin failed', 'warning');
    expect(msgPayload).not.toBeNull();
    expect(msgPayload.message).toBe('User signin failed');
    expect(msgPayload.level).toBe('warning');
  });

  it('handles non-Error objects gracefully in captureException', () => {
    Sentry.init({ dsn: 'https://key123@o0.ingest.sentry.io/456789' });
    const payload = Sentry.captureException('Simple string error message');
    expect(payload).not.toBeNull();
    expect(payload.exception.values[0].type).toBe('Error');
    expect(payload.exception.values[0].value).toBe('Simple string error message');
  });
});
