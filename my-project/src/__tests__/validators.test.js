import { describe, it, expect } from 'vitest';
import { isValidEmail, sanitizePathSegment, validateUploadMeta } from '../utils/validators.js';

describe('validators utility suite', () => {
  it('validates email addresses properly', () => {
    expect(isValidEmail('student@rit.edu')).toBe(true);
    expect(isValidEmail('admin.team@college.ac.in')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail(null)).toBe(false);
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
  });
});
