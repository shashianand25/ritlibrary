import { describe, it, expect } from 'vitest';
import { jsonRes, cleanPathSegment, getFileViewName, normalizeSection, slugify, assetUrl } from '../src/utils/response.js';

describe('Backend Response & String Utilities', () => {
	it('formats json responses with CORS headers', async () => {
		const res = jsonRes({ status: 'ok' }, 201);
		expect(res.status).toBe(201);
		expect(res.headers.get('Content-Type')).toBe('application/json');
		expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
		const body = await res.json();
		expect(body).toEqual({ status: 'ok' });
	});

	it('cleans path segments and normalizes sections', () => {
		expect(cleanPathSegment('folder/sub\\name')).toBe('folder-sub-name');
		expect(normalizeSection('gen')).toBe('Gen');
		expect(normalizeSection('Section A')).toBe('SECTION A');
		expect(getFileViewName('LectureNotes.pdf')).toBe('LectureNotes');
	});

	it('slugifies titles and generates asset URLs correctly', () => {
		expect(slugify('Web Development Hackathon 2026!')).toBe('web-development-hackathon-2026');
		expect(assetUrl('https://api.ritlib.org', 'events/banner.png')).toBe('https://api.ritlib.org/api/events/assets/events/banner.png');
	});
});
