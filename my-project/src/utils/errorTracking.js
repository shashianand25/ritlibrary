/**
 * Minimal Sentry Error Tracking SDK and Reporter for React Frontend
 */

let initialized = false;
let currentDsn = null;
let currentEnvironment = 'production';
let currentRelease = '1.3.0';

export const Sentry = {
  init({ dsn, environment = 'production', release = '1.3.0' } = {}) {
    if (!dsn || typeof dsn !== 'string' || !dsn.trim()) {
      initialized = false;
      currentDsn = null;
      return false;
    }
    currentDsn = dsn.trim();
    currentEnvironment = environment;
    currentRelease = release;
    initialized = true;

    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        Sentry.captureException(event.error || new Error(event.message));
      });
      window.addEventListener('unhandledrejection', (event) => {
        Sentry.captureException(event.reason || new Error('Unhandled Promise Rejection'));
      });
    }
    return true;
  },

  captureException(error, context = {}) {
    if (!initialized || !currentDsn) {
      return null;
    }

    const payload = {
      event_id: (typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2)
      ).replace(/-/g, ''),
      timestamp: new Date().toISOString(),
      platform: 'javascript',
      environment: currentEnvironment,
      release: currentRelease,
      level: 'error',
      exception: {
        values: [
          {
            type: error?.name || 'Error',
            value: error?.message || String(error),
            stacktrace: error?.stack ? { frames: [] } : undefined,
          },
        ],
      },
      extra: context,
    };

    return payload;
  },

  captureMessage(message, level = 'info') {
    if (!initialized || !currentDsn) {
      return null;
    }

    return {
      message,
      level,
      timestamp: new Date().toISOString(),
    };
  },

  isEnabled() {
    return initialized && !!currentDsn;
  },

  reset() {
    initialized = false;
    currentDsn = null;
  },
};

export const initErrorTracking = (dsn = import.meta.env?.VITE_SENTRY_DSN) => {
  return Sentry.init({ dsn });
};

export default Sentry;
