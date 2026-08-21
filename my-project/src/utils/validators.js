/**
 * Input validation and sanitization utilities
 */

export const MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

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
 * Validate file size limit
 * @param {number} sizeBytes
 * @param {number} [maxSize]
 * @returns {boolean}
 */
export function isValidFileSize(sizeBytes, maxSize = MAX_UPLOAD_SIZE_BYTES) {
  if (typeof sizeBytes !== 'number' || isNaN(sizeBytes)) return false;
  return sizeBytes > 0 && sizeBytes <= maxSize;
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
 * @param {Record<string, any>} [meta]
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateUploadMeta(meta) {
  const errors = [];
  if (!meta) {
    return { valid: false, errors: ['No metadata provided'] };
  }

  if (!meta.file) {
    errors.push('File is required');
  } else if (meta.file.size && meta.file.size > MAX_UPLOAD_SIZE_BYTES) {
    errors.push('File size exceeds maximum allowed limit of 50MB');
  }

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
