import { eventCreationSchema } from '../schemas.js';
import { requireDeleter, requireUploader } from '../utils/auth.js';
import { getEventsFromR2, saveEventsToR2 } from '../services/r2.js';
import { CORS, jsonRes, slugify, assetUrl } from '../utils/response.js';
import logger from '../utils/logger.js';

export async function handleListEvents(env, url) {
	const events = await getEventsFromR2(env);
	return jsonRes(
		events.map((event) => ({
			...event,
			imageUrl: event.imageKey ? assetUrl(url.origin, event.imageKey) : event.imageUrl,
		}))
	);
}

export async function handleGetEventAsset(url, env) {
	const key = decodeURIComponent(url.pathname.replace('/api/events/assets/', ''));
	const obj = await env.EVENTS_BUCKET.get(key);
	if (!obj) return new Response('Not Found', { status: 404, headers: CORS });
	return new Response(obj.body, {
		headers: {
			...CORS,
			'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	});
}

export async function handleCreateEvent(request, env, url) {
	const { email, response } = await requireUploader(request, env);
	if (response) return response;

	let formData;
	try {
		formData = await request.formData();
	} catch {
		return jsonRes({ error: 'Bad form data' }, 400);
	}

	const image = formData.get('image');
	if (!image) return jsonRes({ error: 'Banner image is required' }, 400);

	const validated = eventCreationSchema.parse({
		title: formData.get('title'),
		description: formData.get('description'),
		category: formData.get('category') || undefined,
		date: formData.get('date') || undefined,
		venue: formData.get('venue') || undefined,
		link: formData.get('link') || undefined,
		createdBy: formData.get('createdBy') || undefined,
	});

	const { title, description, category, date, venue, link } = validated;
	const createdBy = validated.createdBy || email;

	const now = new Date().toISOString();
	const id = `${Date.now()}-${crypto.randomUUID()}`;
	const ext = image.name?.includes('.') ? image.name.split('.').pop().toLowerCase() : 'jpg';
	const imageKey = `events/${slugify(title)}-${id}/banner.${ext}`;
	await env.EVENTS_BUCKET.put(imageKey, await image.arrayBuffer(), {
		httpMetadata: { contentType: image.type || 'application/octet-stream' },
	});

	const event = {
		id,
		title,
		description,
		category,
		date,
		venue,
		link,
		imageKey,
		imageUrl: assetUrl(url.origin, imageKey),
		createdBy,
		createdByEmail: email,
		createdAt: now,
	};

	const events = await getEventsFromR2(env);
	events.unshift(event);
	await saveEventsToR2(env, events);
	return jsonRes({ success: true, event });
}

export async function handleDeleteEvent(request, env, url) {
	const { email, response } = await requireDeleter(request, env);
	if (response) return response;

	const eventId = decodeURIComponent(url.pathname.replace('/api/events/', '')).trim();
	if (!eventId || eventId === 'assets') return jsonRes({ error: 'Missing event id' }, 400);

	const events = await getEventsFromR2(env);
	const target = events.find((e) => e?.id === eventId);
	if (!target) return jsonRes({ error: 'Event not found' }, 404);

	if (target.imageKey) await env.EVENTS_BUCKET.delete(target.imageKey);
	const nextEvents = events.filter((e) => e?.id !== eventId);
	await saveEventsToR2(env, nextEvents);
	logger.info(`Deleted event ${eventId} by ${email}`);
	return jsonRes({ success: true, id: eventId });
}

export default {
	handleListEvents,
	handleGetEventAsset,
	handleCreateEvent,
	handleDeleteEvent,
};
