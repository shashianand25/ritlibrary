import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getGoogleUserAuthToken,
  getDriveAuthToken,
  fetchAllDriveFiles,
  uploadToDrive,
  deleteDriveFile,
} from '../src/services/drive.js';

describe('Google Drive API Integration Service', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('getGoogleUserAuthToken returns null when OAuth config is missing', async () => {
    const env = {};
    const token = await getGoogleUserAuthToken(env);
    expect(token).toBeNull();
  });

  it('getGoogleUserAuthToken exchanges refresh token for access token', async () => {
    const env = {
      GOOGLE_OAUTH_CLIENT_ID: 'client-id',
      GOOGLE_OAUTH_CLIENT_SECRET: 'client-secret',
      GOOGLE_REFRESH_TOKEN: 'refresh-token',
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'user-access-token' }),
    });

    const token = await getGoogleUserAuthToken(env);
    expect(token).toBe('user-access-token');
    expect(globalThis.fetch).toHaveBeenCalled();
  });

  it('fetchAllDriveFiles paginates through Drive search results', async () => {
    let callCount = 0;
    globalThis.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            files: [{ id: '1', name: 'File1.pdf' }],
            nextPageToken: 'page2',
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          files: [{ id: '2', name: 'File2.pdf' }],
          nextPageToken: null,
        }),
      });
    });

    const files = await fetchAllDriveFiles('folder-123', 'mock-token');
    expect(files.length).toBe(2);
    expect(files[0].id).toBe('1');
    expect(files[1].id).toBe('2');
  });

  it('uploadToDrive uploads multipart body and returns file metadata', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'uploaded-id', name: 'Test.pdf' }),
    });

    const fileBytes = new Uint8Array([1, 2, 3]).buffer;
    const result = await uploadToDrive(
      'mock-token',
      'Test.pdf',
      fileBytes,
      'application/pdf',
      'root-folder-id'
    );

    expect(result.id).toBe('uploaded-id');
    expect(result.name).toBe('Test.pdf');
  });

  it('uploadToDrive throws error if parentId is missing', async () => {
    await expect(
      uploadToDrive('token', 'name.pdf', new ArrayBuffer(0), 'application/pdf', null)
    ).rejects.toThrow('DRIVE_ROOT_ID is not configured');
  });

  it('deleteDriveFile deletes file and handles 404 gracefully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });

    await expect(deleteDriveFile('token', 'file-id-1')).resolves.toBeUndefined();

    // 404 should not throw
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });
    await expect(deleteDriveFile('token', 'missing-file')).resolves.toBeUndefined();
  });
});
