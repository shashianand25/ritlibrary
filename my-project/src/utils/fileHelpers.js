/**
 * File parsing, categorization, and path extraction utilities
 */

/**
 * Get category from file object or path
 * @param {object} file
 * @returns {string} 'notes' | 'pyq' | ''
 */
export function getFileCategory(file) {
  if (!file) return '';
  if (file.category) return String(file.category).toLowerCase();
  const first = file.name?.split(/[/\\]/).filter(Boolean)[0]?.toLowerCase() || '';
  if (first === 'notes') return 'notes';
  if (first === 'pyq') return 'pyq';
  return '';
}

/**
 * Check if a PYQ file applies to all subjects
 * @param {object} file
 * @returns {boolean}
 */
export function isAllSubjectsPyq(file) {
  if (!file) return false;
  const parts =
    file.name
      ?.split(/[/\\]/)
      .filter(Boolean)
      .map((p) => p.toLowerCase()) || [];
  return (
    getFileCategory(file) === 'pyq' && (file.allSubjects === true || parts.includes('allsubjects'))
  );
}

/**
 * Extract subject code from file metadata or structured path
 * @param {object} file
 * @returns {string}
 */
export function getFileSubjectCode(file) {
  if (!file) return '';
  if (isAllSubjectsPyq(file)) return 'ALL';
  if (file.subjectCode) return file.subjectCode;
  const parts = file.name?.split(/[/\\]/).filter(Boolean) || [];
  const first = parts[0]?.toLowerCase();
  if (first === 'notes' || first === 'pyq') return parts[4] || '';
  return parts[1] || '';
}

/**
 * Extract folder name from file metadata or structured path
 * @param {object} file
 * @param {string} [currentSubjectCode='']
 * @returns {string}
 */
export function getFileFolderName(file, currentSubjectCode = '') {
  if (!file) return 'Other';
  if (file.folderName) return file.folderName;
  const parts = file.name?.split(/[/\\]/).filter(Boolean) || [];
  const first = parts[0]?.toLowerCase();
  if (first === 'notes' || first === 'pyq') return parts[5] || 'Other';
  const codeIndex = parts.findIndex(
    (p) => p.toLowerCase() === (currentSubjectCode || '').toLowerCase()
  );
  return codeIndex > 0 ? parts[codeIndex - 1] : parts[0] || 'Other';
}

/**
 * Extract section tag from file metadata or structured path
 * @param {object} file
 * @param {string} [currentSubjectCode='']
 * @returns {string}
 */
export function getFileSection(file, currentSubjectCode = '') {
  if (!file) return 'Gen';
  if (file.section) return file.section;
  const parts = file.name?.split(/[/\\]/).filter(Boolean) || [];
  const first = parts[0]?.toLowerCase();
  if (first === 'notes' || first === 'pyq') return parts[6] || 'Gen';
  const codeIndex = parts.findIndex(
    (p) => p.toLowerCase() === (currentSubjectCode || '').toLowerCase()
  );
  return codeIndex >= 0 ? parts[codeIndex + 1] || 'Gen' : 'Gen';
}

/**
 * Extract clean leaf filename
 * @param {object} file
 * @param {string} [currentSubjectCode='']
 * @returns {string}
 */
export function getFileLeafName(file, currentSubjectCode = '') {
  if (!file) return '';
  const parts = file.name?.split(/[/\\]/).filter(Boolean) || [];
  const first = parts[0]?.toLowerCase();
  if (first === 'notes' || first === 'pyq') {
    return parts[7] || parts[parts.length - 1] || file.name || '';
  }
  const codeIndex = parts.findIndex(
    (p) => p.toLowerCase() === (currentSubjectCode || '').toLowerCase()
  );
  return codeIndex >= 0
    ? parts[codeIndex + 2] || parts[parts.length - 1] || file.name || ''
    : parts[parts.length - 1] || file.name || '';
}

/**
 * Format raw view name without extension
 * @param {string} fileName
 * @returns {string}
 */
export function getFileViewName(fileName) {
  return String(fileName || '').replace(/\.[^/.]+$/, '');
}
