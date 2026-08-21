import { checkAdminInDb } from '../db/admins.js';
import { jsonRes } from './response.js';

const PUBLIC_UPLOADS_ENABLED = true;
const PUBLIC_DELETES_ENABLED = true;

/**
 * Verify Firebase ID token → return email or null
 */
export async function verifyIdToken(idToken, firebaseApiKey) {
	if (!idToken || !firebaseApiKey) return null;
	try {
		const res = await fetch(
			`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ idToken }),
			}
		);
		if (!res.ok) return null;
		const data = await res.json();
		return data.users?.[0]?.email || null;
	} catch {
		return null;
	}
}

export async function checkIsAdmin(email, env) {
	if (!email) return false;
	// 1. Check bootstrap list
	const bootstrapAdmins = (env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase());
	if (bootstrapAdmins.includes(email.toLowerCase())) return true;

	// 2. Check Postgres DB
	return await checkAdminInDb(email, env);
}

export async function requireAdmin(request, env) {
	const authHeader = request.headers.get('Authorization') || '';
	const idToken = authHeader.replace(/^Bearer\s+/i, '').trim();
	if (!idToken) return { response: jsonRes({ error: 'Missing token' }, 401) };

	const email = await verifyIdToken(idToken, env.FIREBASE_API_KEY);
	if (!email) return { response: jsonRes({ error: 'Invalid token' }, 401) };

	const isAdmin = await checkIsAdmin(email, env);
	if (!isAdmin) return { response: jsonRes({ error: 'Forbidden' }, 403) };

	return { email };
}

export async function requireDeleter(request, env) {
	if (!PUBLIC_DELETES_ENABLED) return requireAdmin(request, env);

	const authHeader = request.headers.get('Authorization') || '';
	const idToken = authHeader.replace(/^Bearer\s+/i, '').trim();
	if (!idToken) return { email: 'public-showcase' };

	const email = await verifyIdToken(idToken, env.FIREBASE_API_KEY);
	return { email: email || 'public-showcase' };
}

export async function requireUploader(request, env) {
	const authHeader = request.headers.get('Authorization') || '';
	const idToken = authHeader.replace(/^Bearer\s+/i, '').trim();
	if (!idToken) return { response: jsonRes({ error: 'Missing token' }, 401) };

	const email = await verifyIdToken(idToken, env.FIREBASE_API_KEY);
	if (!email) return { response: jsonRes({ error: 'Invalid token' }, 401) };

	if (!PUBLIC_UPLOADS_ENABLED) {
		const isAdmin = await checkIsAdmin(email, env);
		if (!isAdmin) return { response: jsonRes({ error: 'Forbidden' }, 403) };
	}

	return { email };
}
