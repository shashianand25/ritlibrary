/**
 * Backend Input Validation Schemas and Guards
 */

import { emailSchema, eventCreationSchema, uploadMetadataSchema } from '../schemas.js';

export function isValidEmail(email) {
	if (!email || typeof email !== 'string') return false;
	return emailSchema.safeParse(email).success;
}

export function validateEventPayload(data) {
	const result = eventCreationSchema.safeParse(data || {});
	if (result.success) {
		return {
			isValid: true,
			errors: [],
		};
	}
	return {
		isValid: false,
		errors: result.error.errors.map((e) => e.message),
	};
}

export function validateUploadPayload(data) {
	const result = uploadMetadataSchema.safeParse(data || {});
	if (result.success) {
		return {
			isValid: true,
			errors: [],
		};
	}
	return {
		isValid: false,
		errors: result.error.errors.map((e) => e.message),
	};
}
