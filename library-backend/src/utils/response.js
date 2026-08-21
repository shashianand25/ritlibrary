export const CORS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET,HEAD,POST,DELETE,OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	'Access-Control-Max-Age': '86400',
};

export const jsonRes = (data, status = 200) =>
	new Response(JSON.stringify(data), {
		status,
		headers: { ...CORS, 'Content-Type': 'application/json' },
	});

export const cleanPathSegment = (value) =>
	String(value || '')
		.replace(/[\\/]+/g, '-')
		.trim();

export const getFileViewName = (fileName) => String(fileName || '').replace(/\.[^/.]+$/, '');

export const normalizeSection = (value) => {
	const section = cleanPathSegment(value || 'Gen');
	if (!section || section.toLowerCase() === 'gen') return 'Gen';
	return section.toUpperCase();
};

export const slugify = (value) =>
	String(value || '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80) || 'event';

export const assetUrl = (origin, key) => `${origin}/api/events/assets/${key.split('/').map(encodeURIComponent).join('/')}`;
