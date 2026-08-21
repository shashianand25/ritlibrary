import { describe, it, expect } from 'vitest';
import { tokenizeQuery, matchesQuery, filterResources } from '../utils/searchHelpers.js';

describe('searchHelpers utility', () => {
  describe('tokenizeQuery', () => {
    it('handles empty, null, or non-string inputs', () => {
      expect(tokenizeQuery('')).toEqual([]);
      expect(tokenizeQuery(null)).toEqual([]);
      expect(tokenizeQuery(undefined)).toEqual([]);
      expect(tokenizeQuery(123)).toEqual([]);
    });

    it('splits query into trimmed, lowercase tokens', () => {
      expect(tokenizeQuery('  Data   Structures   Algorithm ')).toEqual([
        'data',
        'structures',
        'algorithm',
      ]);
    });
  });

  describe('matchesQuery', () => {
    const mockFile = {
      name: 'Unit-1-Operating-Systems.pdf',
      view: 'Operating Systems Unit 1',
      subjectCode: '21CS44',
      category: 'Notes',
    };

    it('returns true when query is empty', () => {
      expect(matchesQuery(mockFile, ['name', 'view'], '')).toBe(true);
      expect(matchesQuery(mockFile, ['name', 'view'], '   ')).toBe(true);
    });

    it('returns false when item is null or invalid', () => {
      expect(matchesQuery(null, ['name'], 'test')).toBe(false);
    });

    it('matches when all tokens are present across fields', () => {
      expect(matchesQuery(mockFile, ['name', 'view', 'subjectCode'], 'operating 21cs44')).toBe(true);
      expect(matchesQuery(mockFile, ['view'], 'systems unit')).toBe(true);
    });

    it('returns false when any token is missing', () => {
      expect(matchesQuery(mockFile, ['name', 'view'], 'operating python')).toBe(false);
    });
  });

  describe('filterResources', () => {
    const sampleFiles = [
      { id: '1', sem: '4', branch: 'CSE', subjectCode: '21CS41', name: 'Math-IV.pdf', view: 'Math IV', category: 'Notes' },
      { id: '2', sem: '4', branch: 'ISE', subjectCode: '21IS41', name: 'Math-IV-ISE.pdf', view: 'Math IV ISE', category: 'Notes' },
      { id: '3', sem: '5', branch: 'CSE', subjectCode: '21CS51', name: 'DBMS.pdf', view: 'DBMS Notes', category: 'Notes' },
    ];

    it('returns empty array when input items is not an array', () => {
      expect(filterResources(null)).toEqual([]);
      expect(filterResources(undefined)).toEqual([]);
    });

    it('filters by semester and branch', () => {
      const result = filterResources(sampleFiles, { semester: '4', branch: 'CSE' });
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('1');
    });

    it('filters by subject code', () => {
      const result = filterResources(sampleFiles, { subjectCode: '21CS51' });
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('DBMS.pdf');
    });

    it('filters by free text query across multiple fields', () => {
      const result = filterResources(sampleFiles, { query: 'math ise' });
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('2');
    });
  });
});
