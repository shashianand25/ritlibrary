import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
	b64url,
	b64urlBuf,
	getGoogleAuthToken,
	getGoogleUserAuthToken,
	getDriveAuthToken,
	fetchAllFiles,
	fetchAllDriveFiles,
	uploadToDrive,
	deleteDriveFile,
} from '../src/drive.js';
import {
	MOCK_SERVICE_ACCOUNT,
	MOCK_AUTH_TOKEN,
	MOCK_USER_AUTH_TOKEN,
	MOCK_UPLOADED_FILE,
	MOCK_DRIVE_FILES,
	createDriveFetchMock,
	parseMultipartBody,
} from './drive.mock.js';

describe('Google Drive Service Unit Tests', () => {
	let mockFetch;
	let originalFetch;

	beforeEach(() => {
		mockFetch = createDriveFetchMock();
		originalFetch = globalThis.fetch;
		globalThis.fetch = vi.fn(mockFetch);
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	describe('Base64 URL Helpers', () => {
		it('encodes strings to URL-safe base64', () => {
			const input = 'Hello+World/?=';
			const encoded = b64url(input);
			expect(encoded).not.toContain('+');
			expect(encoded).not.toContain('/');
			expect(encoded).not.toContain('=');
		});

		it('encodes byte buffers to URL-safe base64', () => {
			const buffer = new Uint8Array([251, 255, 254, 0, 1, 2]);
			const encoded = b64urlBuf(buffer);
			expect(encoded).not.toContain('+');
			expect(encoded).not.toContain('/');
			expect(encoded).not.toContain('=');
		});
	});

	describe('getGoogleAuthToken (Service Account Flow)', () => {
		it('generates a signed JWT and exchanges it for an access token', async () => {
			const env = {
				GOOGLE_SERVICE_ACCOUNT: MOCK_SERVICE_ACCOUNT,
			};

			const token = await getGoogleAuthToken(env);
			expect(token).toBe(MOCK_AUTH_TOKEN);

			expect(globalThis.fetch).toHaveBeenCalledTimes(1);
			const [url, options] = globalThis.fetch.mock.calls[0];
			expect(url).toBe('https://oauth2.googleapis.com/token');
			expect(options.method).toBe('POST');
			expect(options.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
			expect(options.body).toContain('grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer');
			expect(options.body).toContain('assertion=');
		});

		it('supports GOOGLE_SERVICE_ACCOUNT formatted as JSON string', async () => {
			const env = {
				GOOGLE_SERVICE_ACCOUNT: JSON.stringify(MOCK_SERVICE_ACCOUNT),
			};

			const token = await getGoogleAuthToken(env);
			expect(token).toBe(MOCK_AUTH_TOKEN);
			expect(globalThis.fetch).toHaveBeenCalledTimes(1);
		});

		it('throws error when GOOGLE_SERVICE_ACCOUNT is missing', async () => {
			await expect(getGoogleAuthToken({})).rejects.toThrow(
				'GOOGLE_SERVICE_ACCOUNT is not configured'
			);
			expect(globalThis.fetch).not.toHaveBeenCalled();
		});

		it('throws error when Google OAuth token endpoint returns an error', async () => {
			mockFetch = createDriveFetchMock({
				onToken: () =>
					new Response(
						JSON.stringify({ error: 'invalid_grant', error_description: 'Bad credentials' }),
						{
							status: 400,
							headers: { 'Content-Type': 'application/json' },
						}
					),
			});
			globalThis.fetch = vi.fn(mockFetch);

			const env = { GOOGLE_SERVICE_ACCOUNT: MOCK_SERVICE_ACCOUNT };
			await expect(getGoogleAuthToken(env)).rejects.toThrow('Token error: Bad credentials');
		});
	});

	describe('getGoogleUserAuthToken & getDriveAuthToken', () => {
		it('exchanges user refresh token for access token using OAuth endpoint', async () => {
			const env = {
				GOOGLE_OAUTH_CLIENT_ID: 'test-client-id',
				GOOGLE_OAUTH_CLIENT_SECRET: 'test-client-secret',
				GOOGLE_REFRESH_TOKEN: 'test-refresh-token',
			};

			const token = await getGoogleUserAuthToken(env);
			expect(token).toBe(MOCK_USER_AUTH_TOKEN);

			const [url, options] = globalThis.fetch.mock.calls[0];
			expect(url).toBe('https://oauth2.googleapis.com/token');
			expect(options.method).toBe('POST');
			expect(options.body.toString()).toContain('grant_type=refresh_token');
			expect(options.body.toString()).toContain('client_id=test-client-id');
		});

		it('returns null when user OAuth credentials are missing without making fetch calls', async () => {
			const token = await getGoogleUserAuthToken({});
			expect(token).toBeNull();
			expect(globalThis.fetch).not.toHaveBeenCalled();
		});

		it('getDriveAuthToken falls back to service account token when user OAuth credentials not present', async () => {
			const env = { GOOGLE_SERVICE_ACCOUNT: MOCK_SERVICE_ACCOUNT };
			const token = await getDriveAuthToken(env);
			expect(token).toBe(MOCK_AUTH_TOKEN);
			expect(globalThis.fetch).toHaveBeenCalledTimes(1);
		});
	});

	describe('uploadToDrive (Multipart Body Construction & Upload)', () => {
		it('builds the correct multipart body and headers', async () => {
			const token = 'mock-bearer-token-12345';
			const fileName = 'Unit1/21CS32/Gen/sample_notes.pdf';
			const fileContent = 'Sample binary payload representing PDF bytes';
			const fileBytes = new TextEncoder().encode(fileContent);
			const mimeType = 'application/pdf';
			const parentId = 'mock-drive-folder-root-id';

			const result = await uploadToDrive(token, fileName, fileBytes, mimeType, parentId);
			expect(result).toEqual(MOCK_UPLOADED_FILE);

			expect(globalThis.fetch).toHaveBeenCalledTimes(1);
			const [url, options] = globalThis.fetch.mock.calls[0];
			expect(url).toBe(
				'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType'
			);
			expect(options.method).toBe('POST');
			expect(options.headers.Authorization).toBe(`Bearer ${token}`);
			expect(options.headers['Content-Type']).toBe('multipart/related; boundary=rit_lib_boundary');

			expect(options.body).toBeInstanceOf(Uint8Array);
			const parsed = parseMultipartBody(options.body);

			expect(parsed.isValidBoundary).toBe(true);
			expect(parsed.metadata).toEqual({
				name: fileName,
				parents: [parentId],
			});
			expect(parsed.fileContentType).toBe(mimeType);
			expect(parsed.filePayload).toBe(fileContent);
		});

		it('throws error when parentId is missing', async () => {
			await expect(
				uploadToDrive('token', 'notes.pdf', new Uint8Array(), 'application/pdf', '')
			).rejects.toThrow('DRIVE_ROOT_ID is not configured');
			expect(globalThis.fetch).not.toHaveBeenCalled();
		});

		it('handles Drive upload error response correctly', async () => {
			mockFetch = createDriveFetchMock({
				onUpload: () =>
					new Response(
						JSON.stringify({
							error: { message: 'Quota exceeded for project', code: 403 },
						}),
						{ status: 403, headers: { 'Content-Type': 'application/json' } }
					),
			});
			globalThis.fetch = vi.fn(mockFetch);

			await expect(
				uploadToDrive(
					'token',
					'notes.pdf',
					new Uint8Array([1, 2, 3]),
					'application/pdf',
					'parent-folder-id'
				)
			).rejects.toThrow('Drive upload failed (403): Quota exceeded for project');
		});
	});

	describe('fetchAllFiles & deleteDriveFile', () => {
		it('fetches and paginates Drive files', async () => {
			let callCount = 0;
			mockFetch = createDriveFetchMock({
				onList: () => {
					callCount++;
					if (callCount === 1) {
						return new Response(
							JSON.stringify({
								files: [MOCK_DRIVE_FILES[0]],
								nextPageToken: 'page-2-token',
							}),
							{ status: 200, headers: { 'Content-Type': 'application/json' } }
						);
					}
					return new Response(
						JSON.stringify({
							files: [MOCK_DRIVE_FILES[1]],
							nextPageToken: '',
						}),
						{ status: 200, headers: { 'Content-Type': 'application/json' } }
					);
				},
			});
			globalThis.fetch = vi.fn(mockFetch);

			const files = await fetchAllFiles('folder-root-id', 'mock-token');
			expect(files).toHaveLength(2);
			expect(files[0].id).toBe('file-id-1');
			expect(files[1].id).toBe('file-id-2');
			expect(globalThis.fetch).toHaveBeenCalledTimes(2);
		});

		it('exports fetchAllDriveFiles as an alias', () => {
			expect(fetchAllDriveFiles).toBe(fetchAllFiles);
		});

		it('deletes Drive file via DELETE request', async () => {
			await deleteDriveFile('mock-token', 'file-id-to-remove');
			expect(globalThis.fetch).toHaveBeenCalledTimes(1);
			const [url, options] = globalThis.fetch.mock.calls[0];
			expect(url).toBe('https://www.googleapis.com/drive/v3/files/file-id-to-remove');
			expect(options.method).toBe('DELETE');
			expect(options.headers.Authorization).toBe('Bearer mock-token');
		});

		it('silently ignores 404 when file does not exist on Drive', async () => {
			mockFetch = createDriveFetchMock({
				onDelete: () => new Response(null, { status: 404 }),
			});
			globalThis.fetch = vi.fn(mockFetch);

			await expect(deleteDriveFile('mock-token', 'missing-file-id')).resolves.toBeUndefined();
		});

		it('throws on 500 server error when deleting file', async () => {
			mockFetch = createDriveFetchMock({
				onDelete: () =>
					new Response(JSON.stringify({ error: { message: 'Internal Drive Error' } }), {
						status: 500,
						headers: { 'Content-Type': 'application/json' },
					}),
			});
			globalThis.fetch = vi.fn(mockFetch);

			await expect(deleteDriveFile('mock-token', 'file-id')).rejects.toThrow(
				'Drive delete failed (500): Internal Drive Error'
			);
		});
	});
});
