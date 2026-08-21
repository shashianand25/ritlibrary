import { describe, it, expect, vi } from 'vitest';
import logger from '../utils/logger.js';

describe('logger utility suite', () => {
  it('calls console methods safely', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logger.info('Test Info Message');
    expect(infoSpy).toHaveBeenCalledWith('[INFO]', 'Test Info Message');

    logger.warn('Test Warn Message');
    expect(warnSpy).toHaveBeenCalledWith('[WARN]', 'Test Warn Message');

    logger.error('Test Error Message');
    expect(errorSpy).toHaveBeenCalledWith('[ERROR]', 'Test Error Message');

    infoSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
