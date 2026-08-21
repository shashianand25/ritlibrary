import router from './router.js';
import { getDriveAuthToken, fetchAllDriveFiles } from './services/drive.js';
import { getFilesFromR2, saveFilesToR2 } from './services/r2.js';
import logger from './utils/logger.js';

export default {
	async fetch(request, env, ctx) {
		return router.fetch(request, env, ctx);
	},

	/* ── CRON: Rebuild files.json from Drive every 10 min ── */
	async scheduled(event, env, ctx) {
		ctx.waitUntil(
			(async () => {
				try {
					logger.info('Starting scheduled Drive scan cron');
					const token = await getDriveAuthToken(env);
					const existing = await getFilesFromR2(env);
					const existingById = new Map(existing.map((f) => [f.id, f]));
					const drives = await fetchAllDriveFiles(env.DRIVE_ROOT_ID, token);
					const files = drives.map((f) => ({
						...(existingById.get(f.id) || {}),
						id: f.id,
						name: f.name,
						mimeType: f.mimeType,
						previewUrl: `https://drive.google.com/file/d/${f.id}/preview`,
					}));
					await saveFilesToR2(env, files);
					logger.info(`Scheduled scan saved ${files.length} files to R2`);
				} catch (err) {
					logger.error('Scheduled Drive scan failed', err);
				}
			})(),
		);
	},
};
