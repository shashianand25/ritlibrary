import { describe, it, expect } from 'vitest';
import {
	isValidEmail,
	validateEventPayload,
	validateUploadPayload,
} from '../src/utils/validators.js';
import {
	emailSchema,
	checkAdminSchema,
	addAdminSchema,
	removeAdminSchema,
	eventCreationSchema,
	uploadMetadataSchema,
	registerFileSchema,
} from '../src/schemas.js';

describe('Backend Validators & Zod Schemas', () => {
	describe('Legacy validator wrappers', () => {
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

	describe('Zod Admin Email Schemas', () => {
		it('validates emailSchema correctly', () => {
			expect(emailSchema.parse('test@domain.com')).toBe('test@domain.com');
			expect(() => emailSchema.parse('not-email')).toThrow();
			expect(() => emailSchema.parse('')).toThrow();
		});

		it('validates checkAdminSchema correctly', () => {
			const result = checkAdminSchema.parse({ email: 'admin@college.edu' });
			expect(result.email).toBe('admin@college.edu');
			expect(() => checkAdminSchema.parse({ email: 'bad' })).toThrow();
			expect(() => checkAdminSchema.parse({})).toThrow();
		});

		it('validates addAdminSchema and removeAdminSchema', () => {
			expect(addAdminSchema.parse({ newAdminEmail: 'new@college.edu' })).toEqual({
				newAdminEmail: 'new@college.edu',
			});
			expect(() => addAdminSchema.parse({ newAdminEmail: 'invalid' })).toThrow();

			expect(removeAdminSchema.parse({ removeEmail: 'rem@college.edu' })).toEqual({
				removeEmail: 'rem@college.edu',
			});
			expect(() => removeAdminSchema.parse({ removeEmail: 'invalid' })).toThrow();
		});
	});

	describe('Zod Event Creation Schema', () => {
		it('parses valid event creation payloads with defaults', () => {
			const parsed = eventCreationSchema.parse({
				title: 'Hackathon 2026',
				description: 'Annual college coding event',
				category: 'HACKATHON',
				date: '2026-09-15',
			});
			expect(parsed.title).toBe('Hackathon 2026');
			expect(parsed.description).toBe('Annual college coding event');
			expect(parsed.category).toBe('hackathon');
			expect(parsed.date).toBe('2026-09-15');
			expect(parsed.venue).toBe('');
			expect(parsed.link).toBe('');
		});

		it('rejects short title, short description, or invalid category', () => {
			expect(() =>
				eventCreationSchema.parse({
					title: 'A',
					description: 'Short',
					category: 'workshop',
				})
			).toThrow();
		});
	});

	describe('Zod File Upload Metadata Schema', () => {
		it('parses valid upload metadata and normalizes section', () => {
			const parsed = uploadMetadataSchema.parse({
				year: '3rd Year',
				sem: '5',
				branch: 'ISE',
				subjectCode: '18IS51',
				folderName: 'Module 1',
				section: 'section b',
				allSubjects: 'TRUE',
			});
			expect(parsed.year).toBe('3rd Year');
			expect(parsed.section).toBe('SECTION B');
			expect(parsed.allSubjects).toBe(true);
			expect(parsed.category).toBe('Notes');
		});

		it('rejects upload metadata missing required fields', () => {
			expect(() =>
				uploadMetadataSchema.parse({
					year: '3rd Year',
					sem: '5',
					// missing branch, subjectCode, folderName
				})
			).toThrow();
		});
	});

	describe('Zod Register File Schema', () => {
		it('parses valid register-file metadata', () => {
			const parsed = registerFileSchema.parse({
				id: 'file-123',
				name: 'Algorithms.pdf',
			});
			expect(parsed.id).toBe('file-123');
			expect(parsed.name).toBe('Algorithms.pdf');
			expect(parsed.mimeType).toBe('');
			expect(parsed.previewUrl).toBe('');
		});

		it('rejects missing id or name', () => {
			expect(() => registerFileSchema.parse({ id: '', name: 'Test.pdf' })).toThrow();
			expect(() => registerFileSchema.parse({ id: '123' })).toThrow();
		});
	});
});
