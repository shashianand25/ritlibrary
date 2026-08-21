import { CORS, jsonRes, getFileViewName, slugify, assetUrl } from './utils/response.js';
import {
	checkAdminSchema,
	addAdminSchema,
	removeAdminSchema,
	eventCreationSchema,
	uploadMetadataSchema,
	registerFileSchema,
	z,
} from './schemas.js';
import { requireAdmin, requireUploader, requireDeleter, checkIsAdmin } from './utils/auth.js';
import { listAdminsFromDb, addAdminToDb, removeAdminFromDb } from './db.js';
import { getDriveAuthToken, uploadToDrive, deleteDriveFile } from './drive.js';
import { getFilesFromR2, saveFilesToR2, getEventsFromR2, saveEventsToR2 } from './services/r2.js';
import logger from './utils/logger.js';

export async function handleRequest(request, env, _ctx) {
	try {
		if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

		const url = new URL(request.url);

		/* GET / — serve files.json from R2 */
		if (request.method === 'GET' && url.pathname === '/') {
			const files = await getFilesFromR2(env);
			return jsonRes(files);
		}

		/* GET /api/drive-root — exposes folder ID for client uploads */
		if (request.method === 'GET' && url.pathname === '/api/drive-root') {
			return jsonRes({ folderId: env.DRIVE_ROOT_ID });
		}

		/* GET /api/events — serve events from R2 */
		if (request.method === 'GET' && url.pathname === '/api/events') {
			const events = await getEventsFromR2(env);
			return jsonRes(
				events.map((event) => ({
					...event,
					imageUrl: event.imageKey ? assetUrl(url.origin, event.imageKey) : event.imageUrl,
				}))
			);
		}

		/* GET /api/events/assets/... — serve event banner image */
		if (request.method === 'GET' && url.pathname.startsWith('/api/events/assets/')) {
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

		/* DELETE /api/events/:id — remove event */
		if (request.method === 'DELETE' && url.pathname.startsWith('/api/events/')) {
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

		/* POST /api/check-admin */
		if (url.pathname === '/api/check-admin' && request.method === 'POST') {
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

		/* ADMIN MANAGEMENT ROUTES */
		if (url.pathname === '/api/admins') {
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
		}

		/* POST /api/register-file */
		if (url.pathname === '/api/register-file' && request.method === 'POST') {
			const { response } = await requireAdmin(request, env);
			if (response) return response;

			let body;
			try {
				body = await request.json();
			} catch {
				return jsonRes({ error: 'Bad JSON' }, 400);
			}

			const { id, name, mimeType, previewUrl } = registerFileSchema.parse(body);
			const newEntry = { id, name, mimeType: mimeType || '', previewUrl: previewUrl || '' };
			const files = await getFilesFromR2(env);
			files.push(newEntry);
			await saveFilesToR2(env, files);
			logger.info(`Registered file ${name}`);
			return jsonRes({ success: true, file: newEntry });
		}

		/* DELETE /api/files/:id */
		if (request.method === 'DELETE' && url.pathname.startsWith('/api/files/')) {
			const { email, response } = await requireDeleter(request, env);
			if (response) return response;

			const fileId = decodeURIComponent(url.pathname.replace('/api/files/', '')).trim();
			if (!fileId) return jsonRes({ error: 'Missing file id' }, 400);

			const files = await getFilesFromR2(env);
			const target = files.find((f) => f?.id === fileId);
			if (!target) return jsonRes({ error: 'File not found' }, 404);

			const token = await getDriveAuthToken(env);
			await deleteDriveFile(token, fileId);
			const nextFiles = files.filter((f) => f?.id !== fileId);
			await saveFilesToR2(env, nextFiles);
			logger.info(`Deleted file ${fileId} by ${email}`);
			return jsonRes({ success: true, id: fileId });
		}

		/* POST /api/events */
		if (url.pathname === '/api/events' && request.method === 'POST') {
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

		/* POST /api/upload */
		if (url.pathname === '/api/upload' && request.method === 'POST') {
			const { email, response } = await requireUploader(request, env);
			if (response) return response;

			let formData;
			try {
				formData = await request.formData();
			} catch {
				return jsonRes({ error: 'Bad form data' }, 400);
			}

			const file = formData.get('file');
			if (!file) return jsonRes({ error: 'File is required' }, 400);

			const validated = uploadMetadataSchema.parse({
				category: formData.get('category') || undefined,
				year: formData.get('year') || undefined,
				sem: formData.get('sem') || undefined,
				branch: formData.get('branch') || undefined,
				subjectCode: formData.get('subjectCode') || undefined,
				folderName: formData.get('folderName') || undefined,
				section: formData.get('section') || undefined,
				allSubjects: formData.get('allSubjects') || undefined,
				uploaderName: formData.get('uploaderName') || undefined,
			});

			const { category, year, sem, branch, subjectCode, folderName, section, allSubjects } =
				validated;
			const uploaderName = validated.uploaderName || email;

			const driveName = allSubjects
				? `${folderName}/allsubjects/${subjectCode}/${section}/${file.name}`
				: `${folderName}/${subjectCode}/${section}/${file.name}`;

			const token = await getDriveAuthToken(env);
			const fileBytes = await file.arrayBuffer();
			const driveFile = await uploadToDrive(
				token,
				driveName,
				fileBytes,
				file.type,
				env.DRIVE_ROOT_ID
			);
			if (!driveFile.id) return jsonRes({ error: 'Drive upload failed' }, 500);

			const newEntry = {
				id: driveFile.id,
				name: driveName,
				view: getFileViewName(file.name),
				category,
				year,
				sem,
				branch,
				subjectCode,
				folderName,
				section,
				allSubjects,
				uploaderName,
				uploaderEmail: email,
				mimeType: file.type,
				previewUrl: `https://drive.google.com/file/d/${driveFile.id}/preview`,
			};

			const files = await getFilesFromR2(env);
			files.push(newEntry);
			await saveFilesToR2(env, files);
			return jsonRes({ success: true, file: newEntry });
		}

		return jsonRes({ error: 'Not Found' }, 404);
	} catch (err) {
		if (err instanceof z.ZodError || err?.name === 'ZodError') {
			const errorMsg = err.errors?.map((e) => e.message).join(', ') || 'Validation error';
			return jsonRes({ error: errorMsg }, 400);
		}
		logger.error('Unhandled worker error', err);
		return jsonRes({ error: err.message || 'Internal server error' }, 500);
	}
}

export default {
	fetch: handleRequest,
};
