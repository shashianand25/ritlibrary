import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
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

describe('api/client module', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('checkAdmin returns boolean when status ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ isAdmin: true }),
      })
    );

    const result = await checkAdmin('fake-token');
    expect(result).toBe(true);
  });

  it('checkAdmin returns false gracefully on error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network down')));

    const result = await checkAdmin('fake-token');
    expect(result).toBe(false);
  });

  it('getAdmins fetches admin list with authorization header', async () => {
    const mockData = { dbAdmins: ['admin@msrit.edu'] };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });
    vi.stubGlobal('fetch', mockFetch);

    const data = await getAdmins('token-123');
    expect(data).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admins'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer token-123' }),
      })
    );
  });

  it('addAdmin sends POST request with email payload', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await addAdmin('new@msrit.edu', 'token-123');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admins'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ newAdminEmail: 'new@msrit.edu' }),
      })
    );
  });

  it('removeAdmin sends DELETE request with payload', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await removeAdmin('old@msrit.edu', 'token-123');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admins'),
      expect.objectContaining({
        method: 'DELETE',
        body: JSON.stringify({ removeEmail: 'old@msrit.edu' }),
      })
    );
  });

  it('fetchFileIndex retrieves list of indexed resources', async () => {
    const mockFiles = [{ id: 'f1', name: 'File 1' }];
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockFiles,
      })
    );

    const res = await fetchFileIndex();
    expect(res).toEqual(mockFiles);
  });

  it('uploadResource sends POST request with FormData', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ file: { id: 'new-file' } }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const formData = new FormData();
    const res = await uploadResource(formData, 'auth-token');
    expect(res).toEqual({ file: { id: 'new-file' } });
  });

  it('deleteResource calls DELETE endpoint with fileId', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await deleteResource('drive-file-id-123', 'auth-token');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/files/drive-file-id-123'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('fetchEvents retrieves list of events', async () => {
    const mockEvents = { events: [{ id: 'e1', title: 'Code Jam' }] };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockEvents,
      })
    );

    const data = await fetchEvents();
    expect(data).toEqual(mockEvents);
  });

  it('createEvent sends POST request with event data', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ event: { id: 'e1' } }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await createEvent({ title: 'Hackathon' }, 'token-abc');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/events'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('deleteEvent sends DELETE request with eventId', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await deleteEvent('event-99', 'token-abc');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/events/event-99'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});
