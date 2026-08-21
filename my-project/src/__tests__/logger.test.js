import { describe, it, expect, vi, beforeEach } from 'vitest';
import logger, { formatLogEntry, sendToErrorTracker } from '../utils/logger.js';

describe('logger utility suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('formats log entries as structured JSON objects', () => {
    const entry = formatLogEntry('INFO', 'Test structured log', { userId: '123' });
    expect(entry.level).toBe('INFO');
    expect(entry.message).toBe('Test structured log');
    expect(entry.context).toEqual({ userId: '123' });
    expect(typeof entry.timestamp).toBe('string');
  });

  it('emits valid JSON strings to console methods', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logger.info('Test Info Message');
    expect(infoSpy).toHaveBeenCalled();
    const infoPayload = JSON.parse(infoSpy.mock.calls[0][0]);
    expect(infoPayload.level).toBe('INFO');
    expect(infoPayload.message).toBe('Test Info Message');

    logger.warn('Test Warn Message', { code: 404 });
    expect(warnSpy).toHaveBeenCalled();
    const warnPayload = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(warnPayload.level).toBe('WARN');
    expect(warnPayload.context).toEqual({ code: 404 });

    logger.error('Test Error Message', new Error('Crash'));
    expect(errorSpy).toHaveBeenCalled();
    const errorPayload = JSON.parse(errorSpy.mock.calls[0][0]);
    expect(errorPayload.level).toBe('ERROR');
    expect(errorPayload.context.message).toBe('Crash');
  });

  it('defaults to no-op when error tracker DSN is not configured', () => {
    expect(() => {
      sendToErrorTracker({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        message: 'Test error',
      });
    }).not.toThrow();
  });
});
