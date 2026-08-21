import { describe, it, expect } from 'vitest';
import { isValidEmail, validateEventPayload, validateUploadPayload } from '../src/utils/validators.js';

describe('Backend Validators', () => {
	it('validates email formats accurately', () => {
		expect(isValidEmail('student@rit.edu')).toBe(true);
		expect(isValidEmail('admin.user+tag@domain.co.in')).toBe(true);
		expect(isValidEmail('invalid-email')).toBe(false);
		expect(isValidEmail('')).toBe(false);
		expect(isValidEmail(null)).toBe(false);
	});

	it('validates event creation payload correctly', () => {
		const valid = validateEventPayload({
			title: 'Annual Hackathon 2026',
			description: 'Campus-wide hackathon for engineering students',
			category: 'hackathon',
		});
		expect(valid.isValid).toBe(true);
		expect(valid.errors.length).toBe(0);

		const invalid = validateEventPayload({
			title: 'A',
			description: 'Bad',
			category: 'unsupported',
		});
		expect(invalid.isValid).toBe(false);
		expect(invalid.errors.length).toBeGreaterThan(0);
	});

	it('validates file upload form fields', () => {
		const valid = validateUploadPayload({
			year: '2nd Year',
			sem: '3',
			branch: 'cse',
			subjectCode: '21CS32',
			folderName: 'Unit 1',
		});
		expect(valid.isValid).toBe(true);

		const invalid = validateUploadPayload({
			year: '',
			sem: '3',
		});
		expect(invalid.isValid).toBe(false);
	});
});
