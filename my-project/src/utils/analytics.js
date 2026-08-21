import logger from './logger.js';

const STORAGE_KEY = 'ritlib_download_events';

/**
 * Records a file download or preview interaction event
 * @param {Object} fileData
 * @returns {Object} event record
 */
export function trackDownload(fileData = {}) {
  const event = {
    id: fileData.id || 'unknown',
    fileName: fileData.name || fileData.view || 'unnamed',
    category: fileData.category || 'Notes',
    timestamp: new Date().toISOString(),
  };

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      list.push(event);
      // Keep only last 50 events locally
      if (list.length > 50) list.shift();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  } catch (err) {
    logger.warn('Failed to record download analytics event', err);
  }

  logger.info(`Tracked download: ${event.fileName}`, event);
  return event;
}

/**
 * Retrieves the history of recent download events
 * @returns {Array<Object>}
 */
export function getDownloadHistory() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }
  } catch {
    return [];
  }
  return [];
}

/**
 * Clears the stored download analytics
 */
export function clearDownloadHistory() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
}
