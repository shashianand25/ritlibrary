import { Pool } from '@neondatabase/serverless';
import logger from './utils/logger.js';

let poolInstance = null;
let isDbInitialized = false;

export function getPool(env) {
	if (!poolInstance && env?.DATABASE_URL) {
		poolInstance = new Pool({ connectionString: env.DATABASE_URL });
	}
	return poolInstance;
}

export async function initDb(env) {
	if (isDbInitialized || !env?.DATABASE_URL) return;
	try {
		const pool = getPool(env);
		if (!pool) return;
		await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
		isDbInitialized = true;
	} catch (err) {
		logger.error('Failed to initialize database table', err);
	}
}

export async function checkAdminInDb(email, env) {
	if (!email || !env?.DATABASE_URL) return false;
	try {
		await initDb(env);
		const pool = getPool(env);
		if (!pool) return false;
		const res = await pool.query('SELECT email FROM admins WHERE email = $1', [
			email.toLowerCase(),
		]);
		return res.rows.length > 0;
	} catch (err) {
		logger.error('Error checking admin in database', err);
		return false;
	}
}

export async function checkIsAdmin(email, env) {
	if (!email) return false;
	// 1. Check bootstrap
	const bootstrapAdmins = (env?.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase());
	if (bootstrapAdmins.includes(email.toLowerCase())) return true;

	// 2. Check DB
	return await checkAdminInDb(email, env);
}

export async function listAdminsFromDb(env) {
	if (!env?.DATABASE_URL) return [];
	try {
		await initDb(env);
		const pool = getPool(env);
		if (!pool) return [];
		const res = await pool.query('SELECT email, created_at FROM admins ORDER BY created_at DESC');
		return res.rows;
	} catch (err) {
		logger.error('Error querying admins from database', err);
		throw err;
	}
}

export async function addAdminToDb(email, env) {
	if (!env?.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
	await initDb(env);
	const pool = getPool(env);
	if (!pool) return;
	await pool.query('INSERT INTO admins (email) VALUES ($1) ON CONFLICT DO NOTHING', [
		email.toLowerCase(),
	]);
}

export async function removeAdminFromDb(email, env) {
	if (!env?.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
	await initDb(env);
	const pool = getPool(env);
	if (!pool) return;
	await pool.query('DELETE FROM admins WHERE email = $1', [email.toLowerCase()]);
}
