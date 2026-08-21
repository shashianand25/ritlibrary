import logger from '../utils/logger.js';

export async function getFilesFromR2(env) {
	const obj = await env.PYQ_BUCKET.get('files.json');
	if (!obj) return [];
	try {
		const parsed = JSON.parse(await obj.text());
		return Array.isArray(parsed) ? parsed : [];
	} catch (err) {
		logger.warn('Failed to parse files.json from R2', err);
		return [];
	}
}

export async function saveFilesToR2(env, files) {
	await env.PYQ_BUCKET.put('files.json', JSON.stringify(files), {
		httpMetadata: { contentType: 'application/json' },
	});
}

export async function getEventsFromR2(env) {
	const obj = await env.EVENTS_BUCKET.get('events.json');
	if (!obj) return [];
	try {
		const parsed = JSON.parse(await obj.text());
		return Array.isArray(parsed) ? parsed : [];
	} catch (err) {
		logger.warn('Failed to parse events.json from R2', err);
		return [];
	}
}

export async function saveEventsToR2(env, events) {
	await env.EVENTS_BUCKET.put('events.json', JSON.stringify(events), {
		httpMetadata: { contentType: 'application/json' },
	});
}
