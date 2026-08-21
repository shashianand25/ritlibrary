import {
  isValidEmail,
  isValidFileSize,
  sanitizePathSegment,
  validateUploadMeta,
  MAX_UPLOAD_SIZE_BYTES,
} from '../utils/validators.js';

describe('validators utility suite', () => {
  it('validates email addresses properly', () => {
    expect(isValidEmail('student@rit.edu')).toBe(true);
    expect(isValidEmail('admin.team@college.ac.in')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail(null)).toBe(false);
  });

  it('validates file sizes accurately within 50MB limit', () => {
    expect(isValidFileSize(1024)).toBe(true);
    expect(isValidFileSize(MAX_UPLOAD_SIZE_BYTES)).toBe(true);
    expect(isValidFileSize(MAX_UPLOAD_SIZE_BYTES + 1)).toBe(false);
    expect(isValidFileSize(0)).toBe(false);
    expect(isValidFileSize(-100)).toBe(false);
    expect(isValidFileSize(NaN)).toBe(false);
    expect(isValidFileSize('not-a-number')).toBe(false);
  });

  it('sanitizes path segments securely', () => {
    expect(sanitizePathSegment('../Unit 1/test')).toBe('Unit 1-test');
    expect(sanitizePathSegment('Safe_Folder-123')).toBe('Safe_Folder-123');
    expect(sanitizePathSegment(null)).toBe('');
  });

  it('validates upload metadata', () => {
    const validMeta = {
      file: new File([''], 'notes.pdf'),
      year: '2nd Year',
      sem: '3',
      branch: 'CS',
      subjectCode: 'BCS301',
      folderName: 'Unit 1',
    };
    expect(validateUploadMeta(validMeta).valid).toBe(true);

    const invalidMeta = {
      file: null,
      year: '',
    };
    const res = validateUploadMeta(invalidMeta);
    expect(res.valid).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);

    const oversizedFile = { size: MAX_UPLOAD_SIZE_BYTES + 1000, name: 'large.pdf' };
    const oversizedMeta = {
      ...validMeta,
      file: oversizedFile,
    };
    const sizeRes = validateUploadMeta(oversizedMeta);
    expect(sizeRes.valid).toBe(false);
    expect(sizeRes.errors).toContain('File size exceeds maximum allowed limit of 50MB');
  });
});
