import { describe, it, expect } from 'vitest';
import {
  getFileCategory,
  isAllSubjectsPyq,
  getFileSubjectCode,
  getFileFolderName,
  getFileSection,
  getFileViewName,
} from '../utils/fileHelpers.js';

describe('fileHelpers utility suite', () => {
  it('identifies file category accurately', () => {
    expect(getFileCategory({ category: 'Notes' })).toBe('notes');
    expect(getFileCategory({ category: 'PYQ' })).toBe('pyq');
    expect(getFileCategory({ name: 'Notes/2nd Year/3rd Sem/CS/BCS301/Unit 1/doc.pdf' })).toBe(
      'notes'
    );
    expect(getFileCategory({ name: 'PYQ/2nd Year/3rd Sem/CS/BCS301/CIE1/paper.pdf' })).toBe('pyq');
    expect(getFileCategory(null)).toBe('');
  });

  it('detects all subjects PYQs properly', () => {
    expect(isAllSubjectsPyq({ category: 'pyq', allSubjects: true })).toBe(true);
    expect(isAllSubjectsPyq({ name: 'PYQ/1st Year/AllSubjects/paper.pdf' })).toBe(true);
    expect(isAllSubjectsPyq({ category: 'notes', allSubjects: true })).toBe(false);
  });

  it('extracts subject codes correctly', () => {
    expect(getFileSubjectCode({ subjectCode: 'BCS301' })).toBe('BCS301');
    expect(getFileSubjectCode({ category: 'pyq', allSubjects: true })).toBe('ALL');
    expect(getFileSubjectCode({ name: 'Notes/2nd Year/3rd Sem/CS/BCS301/Unit 1/doc.pdf' })).toBe(
      'BCS301'
    );
    expect(getFileSubjectCode(null)).toBe('');
  });

  it('extracts folder name accurately', () => {
    expect(getFileFolderName({ folderName: 'Unit 1' })).toBe('Unit 1');
    expect(
      getFileFolderName({ name: 'Notes/2nd Year/3rd Sem/CS/BCS301/Unit 1/doc.pdf' }, 'BCS301')
    ).toBe('Unit 1');
    expect(getFileFolderName(null)).toBe('Other');
  });

  it('extracts section name with fallback to Gen', () => {
    expect(getFileSection({ section: 'A' })).toBe('A');
    expect(getFileSection(null)).toBe('Gen');
  });

  it('formats clean view name without extension', () => {
    expect(getFileViewName('OperatingSystems_Module1.pdf')).toBe('OperatingSystems_Module1');
    expect(getFileViewName('Notes.docx')).toBe('Notes');
    expect(getFileViewName('')).toBe('');
  });
});
