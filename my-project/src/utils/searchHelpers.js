/**
 * Utility functions for searching, filtering, and tokenizing queries across academic resources
 */

/**
 * Normalizes and splits a search string into lowercase search terms
 * @param {string} query
 * @returns {string[]}
 */
export function tokenizeQuery(query) {
  if (!query || typeof query !== 'string') return [];
  return query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((term) => term.length > 0);
}

/**
 * Checks if all query tokens match against the given searchable fields
 * @param {Object} item
 * @param {string[]} fields
 * @param {string} query
 * @returns {boolean}
 */
export function matchesQuery(item, fields, query) {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return true;
  if (!item || typeof item !== 'object') return false;

  const combinedSearchText = fields
    .map((field) => String(item[field] || '').toLowerCase())
    .join(' ');

  return tokens.every((token) => combinedSearchText.includes(token));
}

/**
 * Filters a list of resources by semester, branch, subject code, and optional text search
 * @param {Array<Object>} items
 * @param {Object} filters
 * @returns {Array<Object>}
 */
export function filterResources(items, { semester, branch, subjectCode, query } = {}) {
  if (!Array.isArray(items)) return [];

  return items.filter((item) => {
    if (semester && String(item.sem || item.semester) !== String(semester)) {
      return false;
    }
    if (branch && item.branch && item.branch.toLowerCase() !== branch.toLowerCase()) {
      return false;
    }
    if (
      subjectCode &&
      item.subjectCode &&
      !item.subjectCode.toLowerCase().includes(subjectCode.toLowerCase())
    ) {
      return false;
    }
    if (query) {
      return matchesQuery(item, ['name', 'view', 'subjectCode', 'folderName', 'category'], query);
    }
    return true;
  });
}
