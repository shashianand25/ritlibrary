import { z } from 'zod';
import { cleanPathSegment, normalizeSection } from './utils/response.js';

export { z };

export const emailSchema = z
	.string({ required_error: 'Invalid email' })
	.trim()
	.email('Invalid email address');

export const checkAdminSchema = z.object({
	email: emailSchema,
});

export const addAdminSchema = z.object({
	newAdminEmail: emailSchema,
});

export const removeAdminSchema = z.object({
	removeEmail: emailSchema,
});

export const eventCreationSchema = z.object({
	title: z.preprocess(
		(val) => (val === null || val === undefined ? '' : String(val)),
		z.string().trim().min(2, 'Title must be at least 2 characters long')
	),
	description: z.preprocess(
		(val) => (val === null || val === undefined ? '' : String(val)),
		z.string().trim().min(5, 'Description must be at least 5 characters long')
	),
	category: z.preprocess(
		(val) => (val === null || val === undefined ? 'event' : String(val)),
		z
			.string()
			.trim()
			.toLowerCase()
			.refine((val) => ['hackathon', 'event', 'challenge'].includes(val), {
				message: 'Category must be one of: hackathon, event, challenge',
			})
			.default('event')
	),
	date: z.preprocess(
		(val) => (val === null || val === undefined ? '' : String(val)),
		z.string().trim().optional().default('')
	),
	venue: z.preprocess(
		(val) => (val === null || val === undefined ? '' : String(val)),
		z.string().trim().optional().default('')
	),
	link: z.preprocess(
		(val) => (val === null || val === undefined ? '' : String(val)),
		z.string().trim().optional().default('')
	),
	createdBy: z.preprocess(
		(val) => (val === null || val === undefined ? undefined : String(val)),
		z.string().trim().optional()
	),
});

const requiredField = (name) =>
	z.preprocess(
		(val) => (val === null || val === undefined ? '' : String(val)),
		z.string().trim().min(1, `Field '${name}' is required`)
	);

export const uploadMetadataSchema = z.object({
	category: z.preprocess(
		(val) => (val === null || val === undefined ? 'Notes' : String(val)),
		z.string().trim().default('Notes')
	),
	year: requiredField('year'),
	sem: requiredField('sem'),
	branch: requiredField('branch'),
	subjectCode: requiredField('subjectCode'),
	folderName: requiredField('folderName'),
	section: z.preprocess(
		(val) => (val === null || val === undefined ? 'Gen' : String(val)),
		z
			.string()
			.trim()
			.transform((val) => normalizeSection(val))
			.default('Gen')
	),
	allSubjects: z.preprocess(
		(val) => (val === null || val === undefined ? false : val),
		z
			.union([z.boolean(), z.string()])
			.transform((val) => String(val).toLowerCase() === 'true')
			.default(false)
	),
	uploaderName: z.preprocess(
		(val) => (val === null || val === undefined ? undefined : String(val)),
		z
			.string()
			.trim()
			.transform((val) => (val ? cleanPathSegment(val) : undefined))
			.optional()
	),
});

export const registerFileSchema = z.object({
	id: z.preprocess(
		(val) => (val === null || val === undefined ? '' : String(val)),
		z.string().trim().min(1, 'Missing id or name')
	),
	name: z.preprocess(
		(val) => (val === null || val === undefined ? '' : String(val)),
		z.string().trim().min(1, 'Missing id or name')
	),
	mimeType: z.preprocess(
		(val) => (val === null || val === undefined ? '' : String(val)),
		z.string().optional().default('')
	),
	previewUrl: z.preprocess(
		(val) => (val === null || val === undefined ? '' : String(val)),
		z.string().optional().default('')
	),
});
