import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import api, {
  checkHealth,
  checkAdmin,
  getAdmins,
  addAdmin,
  removeAdmin,
  fetchFileIndex,
  uploadResource,
  deleteResource,
  fetchEvents,
  createEvent,
  deleteEvent,
} from '../api/client.js';

describe('Frontend API Client Suite', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('performs health check request successfully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', timestamp: '2026-08-21T00:00:00.000Z' }),
    });

    const res = await checkHealth();
    expect(res.status).toBe('ok');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/health'),
      expect.objectContaining({
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
  });

  it('fetches file index correctly', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 'file-1', name: 'Physics.pdf' }],
    });

    const files = await fetchFileIndex();
    expect(files).toHaveLength(1);
    expect(files[0].id).toBe('file-1');
  });

  it('checks admin status and handles errors gracefully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ isAdmin: true }),
    });

    const isAdmin = await checkAdmin('mock-token');
    expect(isAdmin).toBe(true);

    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));
    const isOfflineAdmin = await checkAdmin('mock-token');
    expect(isOfflineAdmin).toBe(false);
  });

  it('manages admins via get, add, and remove operations', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    await getAdmins('token-123');
    await addAdmin('new@rit.edu', 'token-123');
    await removeAdmin('old@rit.edu', 'token-123');

    expect(globalThis.fetch).toHaveBeenCalledTimes(3);
  });

  it('uploads resource and deletes resource', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const formData = new FormData();
    await uploadResource(formData, 'token');
    await deleteResource('file-123', 'token');

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it('fetches, creates, and deletes events', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, events: [] }),
    });

    await fetchEvents();
    await createEvent({ title: 'Hackathon' }, 'token');
    await deleteEvent('event-1', 'token');

    expect(globalThis.fetch).toHaveBeenCalledTimes(3);
  });
});
