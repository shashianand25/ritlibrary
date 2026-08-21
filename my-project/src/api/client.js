import logger from '../utils/logger.js';

const WORKER_BASE_URL =
  import.meta.env.VITE_WORKER_URL || 'https://library-backend.ritlibrary.workers.dev';

/**
 * Standard JSON HTTP helper with authorization headers
 */
async function request(endpoint, options = {}) {
  const url = `${WORKER_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let parsedError;
      try {
        parsedError = JSON.parse(errorBody);
      } catch {
        parsedError = { message: errorBody || `HTTP error ${response.status}` };
      }
      throw new Error(
        parsedError.error || parsedError.message || `Request failed with status ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    logger.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * Health Check API method
 */
export async function checkHealth() {
  return await request('/api/health');
}

/**
 * Admin API methods
 */
export async function checkAdmin(idToken) {
  try {
    const data = await request('/api/check-admin', {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    return Boolean(data.isAdmin);
  } catch (e) {
    logger.warn('checkAdmin failed:', e);
    return false;
  }
}

export async function getAdmins(idToken) {
  return await request('/api/admins', {
    headers: { Authorization: `Bearer ${idToken}` },
  });
}

export async function addAdmin(email, idToken) {
  return await request('/api/admins', {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ newAdminEmail: email }),
  });
}

export async function removeAdmin(email, idToken) {
  return await request('/api/admins', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ removeEmail: email }),
  });
}

/**
 * Files & Resources API methods
 */
export async function fetchFileIndex() {
  return await request('/api/files');
}

export async function uploadResource(formData, idToken) {
  const url = `${WORKER_BASE_URL}/api/upload`;
  const headers = idToken ? { Authorization: `Bearer ${idToken}` } : {};

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Upload failed');
    }

    return await response.json();
  } catch (error) {
    logger.error('API Error [uploadResource]:', error);
    throw error;
  }
}

export async function deleteResource(fileId, idToken) {
  return await request(`/api/files/${encodeURIComponent(fileId)}`, {
    method: 'DELETE',
    headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
  });
}

/**
 * Events API methods
 */
export async function fetchEvents() {
  return await request('/api/events');
}

export async function createEvent(formDataOrJson, idToken) {
  const isFormData = typeof FormData !== 'undefined' && formDataOrJson instanceof FormData;
  const url = `${WORKER_BASE_URL}/api/events`;
  const headers = idToken ? { Authorization: `Bearer ${idToken}` } : {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: isFormData ? formDataOrJson : JSON.stringify(formDataOrJson),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Event upload failed');
    return data;
  } catch (error) {
    logger.error('API Error [createEvent]:', error);
    throw error;
  }
}

export async function deleteEvent(eventId, idToken) {
  return await request(`/api/events/${encodeURIComponent(eventId)}`, {
    method: 'DELETE',
    headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
  });
}

export default {
  checkHealth,
  checkAdmin,
  getAdmins,
  addAdmin,
  removeAdmin,
  fetchFileIndex,
  uploadResource,
  deleteResource,
  fetchEvents,
  createEvent,
  deleteEvent,
};
