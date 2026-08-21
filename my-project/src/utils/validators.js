/**
 * Input validation and sanitization utilities
 */

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Sanitize path segment to prevent traversal and invalid characters
 * @param {string} value
 * @returns {string}
 */
export function sanitizePathSegment(value) {
  if (!value || typeof value !== 'string') return '';
  return value
    .replace(/\.\./g, '')
    .replace(/^[\\/.-]+|[\\/.-]+$/g, '')
    .replace(/[\\/]+/g, '-')
    .replace(/[^\w\s.-]/gi, '')
    .trim();
}

/**
 * Validate upload metadata
 * @param {object} meta
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateUploadMeta(meta) {
  const errors = [];
  if (!meta) {
    return { valid: false, errors: ['No metadata provided'] };
  }

  if (!meta.file) errors.push('File is required');
  if (!meta.year) errors.push('Year is required');
  if (!meta.sem) errors.push('Semester is required');
  if (!meta.branch) errors.push('Branch is required');
  if (!meta.subjectCode) errors.push('Subject code is required');
  if (!meta.folderName && !meta.folder) errors.push('Folder is required');

  return {
    valid: errors.length === 0,
    errors,
  };
}
