import { checkAdminSchema, addAdminSchema, removeAdminSchema, z } from '../schemas.js';
import { requireAdmin, checkIsAdmin } from '../utils/auth.js';
import { listAdminsFromDb, addAdminToDb, removeAdminFromDb } from '../db.js';
import { jsonRes } from '../utils/response.js';

export async function handleCheckAdmin(request, env) {
	let body;
	try {
		body = await request.json();
	} catch {
		return jsonRes({ isAdmin: false, error: 'Bad JSON' }, 400);
	}
	try {
		const { email } = checkAdminSchema.parse(body);
		const isAdmin = await checkIsAdmin(email, env);
		return jsonRes({ isAdmin }, isAdmin ? 200 : 403);
	} catch (err) {
		if (err instanceof z.ZodError || err?.name === 'ZodError') {
			return jsonRes({ isAdmin: false, error: 'Invalid email' }, 400);
		}
		throw err;
	}
}

export async function handleAdminsRoute(request, env) {
	const { response } = await requireAdmin(request, env);
	if (response) return response;

	if (request.method === 'GET') {
		const dbAdmins = await listAdminsFromDb(env);
		const bootstrapAdmins = (env.ADMIN_EMAILS || '')
			.split(',')
			.map((e) => e.trim().toLowerCase())
			.filter(Boolean);
		return jsonRes({ dbAdmins, bootstrapAdmins });
	}

	if (request.method === 'POST') {
		let body;
		try {
			body = await request.json();
		} catch {
			return jsonRes({ error: 'Bad JSON' }, 400);
		}
		const { newAdminEmail } = addAdminSchema.parse(body);
		await addAdminToDb(newAdminEmail, env);
		return jsonRes({ success: true, email: newAdminEmail.toLowerCase() });
	}

	if (request.method === 'DELETE') {
		let body;
		try {
			body = await request.json();
		} catch {
			return jsonRes({ error: 'Bad JSON' }, 400);
		}
		const { removeEmail } = removeAdminSchema.parse(body);
		await removeAdminFromDb(removeEmail, env);
		return jsonRes({ success: true });
	}

	return jsonRes({ error: 'Method Not Allowed' }, 405);
}

export default {
	handleCheckAdmin,
	handleAdminsRoute,
};
