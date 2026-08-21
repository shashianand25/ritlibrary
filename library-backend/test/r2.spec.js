import { describe, it, expect, vi } from 'vitest';
import {
	getFilesFromR2,
	saveFilesToR2,
	getEventsFromR2,
	saveEventsToR2,
} from '../src/services/r2.js';

describe('Backend R2 Storage Service', () => {
	it('retrieves and parses files.json from PYQ_BUCKET', async () => {
		const mockFiles = [{ id: 'f1', name: 'Notes.pdf' }];
		const env = {
			PYQ_BUCKET: {
				get: vi.fn().mockResolvedValue({
					text: async () => JSON.stringify(mockFiles),
				}),
			},
		};

		const files = await getFilesFromR2(env);
		expect(files).toEqual(mockFiles);
		expect(env.PYQ_BUCKET.get).toHaveBeenCalledWith('files.json');
	});

	it('returns empty array if files.json does not exist or has invalid JSON', async () => {
		const envMissing = {
			PYQ_BUCKET: { get: vi.fn().mockResolvedValue(null) },
		};
		expect(await getFilesFromR2(envMissing)).toEqual([]);

		const envCorrupt = {
			PYQ_BUCKET: {
				get: vi.fn().mockResolvedValue({
					text: async () => 'INVALID_JSON',
				}),
			},
		};
		expect(await getFilesFromR2(envCorrupt)).toEqual([]);
	});

	it('saves files to PYQ_BUCKET with correct headers', async () => {
		const filesToSave = [{ id: 'f2', name: 'PYQ.pdf' }];
		const putMock = vi.fn().mockResolvedValue({});
		const env = { PYQ_BUCKET: { put: putMock } };

		await saveFilesToR2(env, filesToSave);
		expect(putMock).toHaveBeenCalledWith('files.json', JSON.stringify(filesToSave), {
			httpMetadata: { contentType: 'application/json' },
		});
	});

	it('retrieves and saves events.json from EVENTS_BUCKET', async () => {
		const mockEvents = [{ id: 'e1', title: 'Hackathon 2026' }];
		const putMock = vi.fn().mockResolvedValue({});
		const env = {
			EVENTS_BUCKET: {
				get: vi.fn().mockResolvedValue({
					text: async () => JSON.stringify(mockEvents),
				}),
				put: putMock,
			},
		};

		const events = await getEventsFromR2(env);
		expect(events).toEqual(mockEvents);

		await saveEventsToR2(env, mockEvents);
		expect(putMock).toHaveBeenCalledWith('events.json', JSON.stringify(mockEvents), {
			httpMetadata: { contentType: 'application/json' },
		});
	});
});
