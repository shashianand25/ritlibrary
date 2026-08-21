import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkHealth } from '../api/client.js';

describe('Health Check Client Service Suite', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('queries /api/health and receives valid status payload', async () => {
    const mockTimestamp = new Date().toISOString();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', timestamp: mockTimestamp }),
    });

    const result = await checkHealth();
    expect(result).toEqual({ status: 'ok', timestamp: mockTimestamp });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/health'),
      expect.objectContaining({
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
  });

  it('propagates error when health check endpoint fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => JSON.stringify({ error: 'Service Unavailable' }),
    });

    await expect(checkHealth()).rejects.toThrow('Service Unavailable');
  });
});
