import { describe, it, expect } from 'vitest';
import {
  getFileCategory,
  isAllSubjectsPyq,
  getFileSubjectCode,
  getFileFolderName,
  getFileSection,
  getFileLeafName,
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
    expect(getFileCategory({ name: 'Custom/folder/file.pdf' })).toBe('');
    expect(getFileCategory({})).toBe('');
    expect(getFileCategory(null)).toBe('');
  });

  it('detects all subjects PYQs properly', () => {
    expect(isAllSubjectsPyq({ category: 'pyq', allSubjects: true })).toBe(true);
    expect(isAllSubjectsPyq({ name: 'PYQ/1st Year/AllSubjects/paper.pdf' })).toBe(true);
    expect(isAllSubjectsPyq({ category: 'notes', allSubjects: true })).toBe(false);
    expect(isAllSubjectsPyq(null)).toBe(false);
    expect(isAllSubjectsPyq({})).toBe(false);
  });

  it('extracts subject codes correctly', () => {
    expect(getFileSubjectCode({ subjectCode: 'BCS301' })).toBe('BCS301');
    expect(getFileSubjectCode({ category: 'pyq', allSubjects: true })).toBe('ALL');
    expect(getFileSubjectCode({ name: 'Notes/2nd Year/3rd Sem/CS/BCS301/Unit 1/doc.pdf' })).toBe(
      'BCS301'
    );
    expect(getFileSubjectCode({ name: 'Direct/21CS32/file.pdf' })).toBe('21CS32');
    expect(getFileSubjectCode({ name: 'DirectOnly' })).toBe('');
    expect(getFileSubjectCode(null)).toBe('');
  });

  it('extracts folder name accurately with all fallbacks', () => {
    expect(getFileFolderName({ folderName: 'Unit 1' })).toBe('Unit 1');
    expect(
      getFileFolderName({ name: 'Notes/2nd Year/3rd Sem/CS/BCS301/Unit 1/doc.pdf' }, 'BCS301')
    ).toBe('Unit 1');
    expect(getFileFolderName({ name: 'FolderA/BCS301/doc.pdf' }, 'BCS301')).toBe('FolderA');
    expect(getFileFolderName({ name: 'SingleFolder/doc.pdf' }, 'BCS301')).toBe('SingleFolder');
    expect(getFileFolderName({ name: '' }, 'BCS301')).toBe('Other');
    expect(getFileFolderName(null)).toBe('Other');
  });

  it('extracts section name with fallback to Gen', () => {
    expect(getFileSection({ section: 'A' })).toBe('A');
    expect(
      getFileSection({ name: 'Notes/2nd Year/3rd Sem/CS/BCS301/Unit 1/B/doc.pdf' }, 'BCS301')
    ).toBe('B');
    expect(getFileSection({ name: 'Custom/BCS301/C/doc.pdf' }, 'BCS301')).toBe('C');
    expect(getFileSection({ name: 'Custom/NoSubject/doc.pdf' }, 'BCS301')).toBe('Gen');
    expect(getFileSection(null)).toBe('Gen');
  });

  it('extracts leaf filename properly across path formats', () => {
    expect(
      getFileLeafName({ name: 'Notes/2nd Year/3rd Sem/CS/BCS301/Unit 1/A/Doc.pdf' }, 'BCS301')
    ).toBe('Doc.pdf');
    expect(getFileLeafName({ name: 'Notes/Short/Doc.pdf' })).toBe('Doc.pdf');
    expect(getFileLeafName({ name: 'Custom/Folder/BCS301/SectionA/MyFile.pdf' }, 'BCS301')).toBe(
      'MyFile.pdf'
    );
    expect(getFileLeafName({ name: 'Custom/SingleFile.pdf' }, 'BCS301')).toBe('SingleFile.pdf');
    expect(getFileLeafName(null)).toBe('');
  });

  it('formats clean view name without extension', () => {
    expect(getFileViewName('OperatingSystems_Module1.pdf')).toBe('OperatingSystems_Module1');
    expect(getFileViewName('Notes.docx')).toBe('Notes');
    expect(getFileViewName('')).toBe('');
    expect(getFileViewName(null)).toBe('');
  });
});
