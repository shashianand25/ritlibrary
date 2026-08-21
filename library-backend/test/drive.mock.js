/**
 * Test mock fixtures & fetch stub for Google OAuth and Drive API endpoints.
 * Guarantees hermetic test execution with zero live external network calls.
 */

export const MOCK_SERVICE_ACCOUNT = {
	type: 'service_account',
	project_id: 'rit-test-project',
	private_key_id: 'test-key-id-001',
	private_key: `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCyNj+hT1fD8Cvw
OYwONWxzV1q1uLMvVEYLp4RUyE136Bu3KHo6WYBcsRK9L3pNpSmxcwGoMdMugQ9R
YjTBQM8S2q4wAKmOeEYj4uTkMT/Hv1kUco6q78GIz9RMneEIzntBz1w+1cACQy0Z
fxeRwQYFgc57X4dlBZ11fqyMbjiDou6mcV1qIUEXeE4CAUHKW/bpxiOj0TAKNxCn
01OG/t5S40HV0jts6d3YLonhOAvEusp7ZrJzXVCZXRaTjCBBRCZ9BC59xuVdTNr/
ItjAMv96cIPyCA23iI+f4j2GeInoMj5ygrF0Mhw/EP3Vx+PI4YKTd1oGoaN/bqNx
F7Hq+CJDAgMBAAECggEASnL8SRTe6uWiTXSVDHiICnVjWUhEXxDbRFIip9KX/nAy
Z+VajpbGV7LHy84ST26gyNdtSUkrWqGi9xJKTLOY7lz56ObV7sVTM/m9OpFSfk1z
VuX2sPWBSfjczXclRCsSde89L6jXUnqi1CRygbr8G3/bdVH2u57JZYTaa74+EMtl
Md184MlU7hZvVD+WTqrzr3oHs0q8Mxptk7sMhyvJTzddG9qjbkdJi+vagJlY1W7a
urwKIw4UX30pE9x8A/bTg4w4fDnPRCPw3sI0DK0tuK+//tAme66/fNIH4YZxMI5N
qPvlgYyCC6GMZn3ucNFAO+ZQ8i6MQRy+RHv23D5ksQKBgQDgDUh+CDlaLFp6DCtt
UPX1o2hurE02djVdysxmq6p9ngBS45NyI/HcEcUTFuTpnDuakKTI8hh6rBb6D/ei
a7F1VXaQqxegKmEE5/YpclY0sxQlwg5v7eFgu9lkgtK8CnZ/6LuJd78ngqE2bh3u
gUvZofB4XecxGsionTe8DjmqcQKBgQDLn6NFkgfKH+aa8v0l3Mbbmk6pEya4ACgo
7e+iuFP+nIqDT87I0+BWiNTGTn1KVF8wRrO/WjqbY1TtLWf5tXl8+v3c8+Yx1Hwi
42CXNZPMlHi1EOqVM2/KL7BBZGvbkugm6f9sHkwgqIYp2t36zt1MLTzzBKSQFXgb
m6dEBANp8wKBgBtwRQJ6S1vJtsLfnqniklykyHNVUpdq3po/7cxdFaIQqYV9LV97
G3GSE4qE8T/SzFHfiO67B1huntm8/ty7R55Q+xY4fco1pnANYE4vHHOTwtHk9BOt
FD7egn8Wrmws89oyTFVHfvd9vfSGg8/jscBTXrm+9kNDPnO33U2AiHthAoGAJ0aO
dp/ZMsp+b4rI+2GfVcJow8H26OzW0jY6z7cgNG87ZGKjbyc3EVnpOKrxDcJCbgxl
JVahEVHSksD8WjT/zvSWvOSqlRf4Lb6P5fqmnIJS2hH+PXMjb+tM4wAcscifUMo3
w0IAyxfWcQJPaM437zaWmAVgPI53kVOvqrXfdrMCgYA6/KeN5KvUKICrYS4nyFMv
/N7WFJQkzJxOlb3D1g1w3DC/i/0tRUZsVcXv/KspefPjUHj1Q/jpqoe7Hz/JVLn7
+QaW7c/dAKBxquujffmK1ZANsn1yNQXQAkmFR0jYgh7NkGOrM1Tfeydg3sXOSpUK
30X1oWbILDaUfA+51xwU9w==
-----END PRIVATE KEY-----
`,
	client_email: 'test-sa@rit-test-project.iam.gserviceaccount.com',
	client_id: '100000000000000000001',
};

export const MOCK_AUTH_TOKEN = 'mock-oauth2-access-token-xyz789';
export const MOCK_USER_AUTH_TOKEN = 'mock-user-oauth2-access-token-abc123';

export const MOCK_AUTH_RESPONSE = {
	access_token: MOCK_AUTH_TOKEN,
	token_type: 'Bearer',
	expires_in: 3600,
};

export const MOCK_UPLOADED_FILE = {
	id: 'mock-drive-file-id-54321',
	name: 'Unit1/21CS32/Gen/sample.pdf',
	mimeType: 'application/pdf',
};

export const MOCK_DRIVE_FILES = [
	{ id: 'file-id-1', name: 'Unit1/21CS32/Gen/notes1.pdf', mimeType: 'application/pdf' },
	{ id: 'file-id-2', name: 'Unit2/21CS32/Gen/notes2.pdf', mimeType: 'application/pdf' },
];

export function parseMultipartBody(bodyBytes, boundary = 'rit_lib_boundary') {
	const decoder = new TextDecoder('utf-8');
	const rawText = decoder.decode(bodyBytes);
	const delimiter = `--${boundary}`;
	const endDelimiter = `--${boundary}--`;

	const isValidBoundary = rawText.startsWith(delimiter) && rawText.trimEnd().endsWith(endDelimiter);

	const rawParts = rawText.split(delimiter).filter((p) => p && p.trim() !== '--');

	let metadata = null;
	let fileContentType = null;
	let filePayload = null;

	if (rawParts.length >= 1) {
		const metaPart = rawParts[0];
		const headerEnd = metaPart.indexOf('\r\n\r\n');
		if (headerEnd !== -1) {
			const jsonStr = metaPart.slice(headerEnd + 4).replace(/\r\n$/, '');
			try {
				metadata = JSON.parse(jsonStr);
			} catch {}
		}
	}

	if (rawParts.length >= 2) {
		const filePart = rawParts[1];
		const headerEnd = filePart.indexOf('\r\n\r\n');
		if (headerEnd !== -1) {
			const headerStr = filePart.slice(0, headerEnd);
			const match = headerStr.match(/Content-Type:\s*([^\r\n]+)/i);
			if (match) fileContentType = match[1].trim();
			filePayload = filePart.slice(headerEnd + 4).replace(/\r\n$/, '');
		}
	}

	return {
		rawText,
		isValidBoundary,
		metadata,
		fileContentType,
		filePayload,
	};
}

export function createDriveFetchMock(options = {}) {
	const calls = [];

	const mockFetch = async (input, init = {}) => {
		const urlStr = typeof input === 'string' ? input : input?.url || '';
		const method = (
			init.method ||
			(typeof input !== 'string' ? input?.method : 'GET') ||
			'GET'
		).toUpperCase();
		const headers = new Headers(init.headers || (typeof input !== 'string' ? input?.headers : {}));
		const body = init.body || (typeof input !== 'string' ? input?.body : null);

		const callRecord = {
			url: urlStr,
			method,
			headers,
			body,
		};
		calls.push(callRecord);

		if (options.routes && options.routes[urlStr]) {
			return options.routes[urlStr](callRecord);
		}

		if (urlStr.startsWith('https://oauth2.googleapis.com/token')) {
			if (options.onToken) return options.onToken(callRecord);
			const bodyStr =
				typeof body === 'string'
					? body
					: body instanceof URLSearchParams
						? body.toString()
						: ArrayBuffer.isView(body) || body instanceof ArrayBuffer
							? new TextDecoder().decode(body)
							: String(body || '');
			const isUserRefresh = bodyStr.includes('grant_type=refresh_token');
			return new Response(
				JSON.stringify({
					access_token: isUserRefresh ? MOCK_USER_AUTH_TOKEN : MOCK_AUTH_TOKEN,
					token_type: 'Bearer',
					expires_in: 3600,
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } }
			);
		}

		if (urlStr.startsWith('https://www.googleapis.com/upload/drive/v3/files')) {
			if (options.onUpload) return options.onUpload(callRecord);
			return new Response(JSON.stringify(MOCK_UPLOADED_FILE), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		if (urlStr.startsWith('https://www.googleapis.com/drive/v3/files')) {
			if (method === 'DELETE') {
				if (options.onDelete) return options.onDelete(callRecord);
				return new Response(null, { status: 204 });
			}

			if (options.onList) return options.onList(callRecord);
			return new Response(
				JSON.stringify({
					files: MOCK_DRIVE_FILES,
					nextPageToken: '',
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } }
			);
		}

		throw new Error(`[Zero Network Call Violation] Unmocked network call attempted to: ${urlStr}`);
	};

	mockFetch.calls = calls;
	mockFetch.getCallsFor = (pattern) =>
		calls.filter((c) => (typeof pattern === 'string' ? c.url.includes(pattern) : pattern(c)));
	mockFetch.reset = () => {
		calls.length = 0;
	};

	return mockFetch;
}
