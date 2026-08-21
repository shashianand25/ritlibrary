/* ── Base64 URL Helpers ── */
export const b64url = (str) => btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export const b64urlBuf = (buf) =>
	btoa(String.fromCharCode(...new Uint8Array(buf)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');

/* ── Service Account JWT Token ── */
export async function getGoogleAuthToken(env, scope = 'https://www.googleapis.com/auth/drive') {
	if (!env?.GOOGLE_SERVICE_ACCOUNT) throw new Error('GOOGLE_SERVICE_ACCOUNT is not configured');
	const sa =
		typeof env.GOOGLE_SERVICE_ACCOUNT === 'string'
			? JSON.parse(env.GOOGLE_SERVICE_ACCOUNT)
			: env.GOOGLE_SERVICE_ACCOUNT;

	const enc = new TextEncoder();
	const now = Math.floor(Date.now() / 1000);

	const headerB64 = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
	const payloadB64 = b64url(
		JSON.stringify({
			iss: sa.client_email,
			scope,
			aud: 'https://oauth2.googleapis.com/token',
			iat: now,
			exp: now + 3600,
		})
	);
	const sigInput = `${headerB64}.${payloadB64}`;

	const pem = sa.private_key.replace(
		/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g,
		''
	);
	const keyBytes = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
	const cryptoKey = await crypto.subtle.importKey(
		'pkcs8',
		keyBytes.buffer,
		{ name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
		false,
		['sign']
	);
	const sigBuf = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, enc.encode(sigInput));
	const jwt = `${sigInput}.${b64urlBuf(sigBuf)}`;

	const res = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
	});
	const data = await res.json();
	if (data.error) throw new Error(`Token error: ${data.error_description || data.error}`);
	return data.access_token;
}

/* ── Real User OAuth Refresh Token ── */
export async function getGoogleUserAuthToken(env) {
	if (!env) return null;
	const missing = [
		'GOOGLE_OAUTH_CLIENT_ID',
		'GOOGLE_OAUTH_CLIENT_SECRET',
		'GOOGLE_REFRESH_TOKEN',
	].filter((key) => !env[key]);
	if (missing.length) return null;

	const res = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			client_id: env.GOOGLE_OAUTH_CLIENT_ID,
			client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
			refresh_token: env.GOOGLE_REFRESH_TOKEN,
			grant_type: 'refresh_token',
		}),
	});
	const data = await res.json();
	if (!res.ok || !data.access_token) {
		throw new Error(
			`User OAuth token error: ${data.error_description || data.error || 'unknown error'}`
		);
	}
	return data.access_token;
}

export async function getDriveAuthToken(env) {
	return (await getGoogleUserAuthToken(env)) || (await getGoogleAuthToken(env));
}

/* ── List all files in Drive folder (paginated) ── */
export async function fetchAllFiles(folderId, token) {
	const all = [];
	let pageToken = '';
	do {
		const params = new URLSearchParams({
			q: `'${folderId}' in parents and trashed=false`,
			fields: 'nextPageToken,files(id,name,mimeType)',
			pageSize: '1000',
			...(pageToken ? { pageToken } : {}),
		});
		const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const data = await res.json();
		all.push(...(data.files || []));
		pageToken = data.nextPageToken || '';
	} while (pageToken);
	return all;
}

export const fetchAllDriveFiles = fetchAllFiles;

/* ── Upload single file to Drive (multipart) ── */
export async function uploadToDrive(token, fileName, fileBytes, mimeType, parentId) {
	if (!parentId) throw new Error('DRIVE_ROOT_ID is not configured');

	const boundary = 'rit_lib_boundary';
	const enc = new TextEncoder();
	const meta = JSON.stringify({ name: fileName, parents: [parentId] });
	const parts = [
		enc.encode(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n`),
		enc.encode(`--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`),
		new Uint8Array(fileBytes),
		enc.encode(`\r\n--${boundary}--`),
	];
	const body = new Uint8Array(parts.reduce((s, p) => s + p.byteLength, 0));
	let off = 0;
	for (const p of parts) {
		body.set(p, off);
		off += p.byteLength;
	}
	const res = await fetch(
		'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType',
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': `multipart/related; boundary=${boundary}`,
			},
			body,
		}
	);
	const data = await res.json();
	if (!res.ok) {
		const message = data?.error?.message || data?.error_description || 'Drive upload failed';
		throw new Error(`Drive upload failed (${res.status}): ${message}`);
	}
	return data;
}

/* ── Delete a file from Drive ── */
export async function deleteDriveFile(token, fileId) {
	const res = await fetch(
		`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`,
		{
			method: 'DELETE',
			headers: { Authorization: `Bearer ${token}` },
		}
	);
	if (res.status === 404) return;
	if (!res.ok) {
		let message = 'Drive delete failed';
		try {
			const data = await res.json();
			message = data?.error?.message || data?.error_description || message;
		} catch {}
		throw new Error(`Drive delete failed (${res.status}): ${message}`);
	}
}
