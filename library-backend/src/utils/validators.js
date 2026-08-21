/**
 * Backend Input Validation Schemas and Guards
 */

export function isValidEmail(email) {
	if (!email || typeof email !== 'string') return false;
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateEventPayload(data) {
	const errors = [];
	if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 2) {
		errors.push('Title must be at least 2 characters long');
	}
	if (!data.description || typeof data.description !== 'string' || data.description.trim().length < 5) {
		errors.push('Description must be at least 5 characters long');
	}
	const category = (data.category || '').toLowerCase().trim();
	if (!['hackathon', 'event', 'challenge'].includes(category)) {
		errors.push('Category must be one of: hackathon, event, challenge');
	}
	return {
		isValid: errors.length === 0,
		errors,
	};
}

export function validateUploadPayload(data) {
	const errors = [];
	const required = ['year', 'sem', 'branch', 'subjectCode', 'folderName'];
	for (const field of required) {
		if (!data[field] || String(data[field]).trim() === '') {
			errors.push(`Field '${field}' is required`);
		}
	}
	return {
		isValid: errors.length === 0,
		errors,
	};
}
