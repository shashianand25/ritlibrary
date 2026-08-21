import { useState, useCallback } from 'react';

let toastIdCounter = 0;

/**
 * Custom React hook for managing alert and feedback toast notifications
 */
export default function useToast() {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ message, type = 'info', duration = 3000 }) => {
      const id = ++toastIdCounter;
      const newToast = { id, message, type };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success: (msg, duration) => addToast({ message: msg, type: 'success', duration }),
    error: (msg, duration) => addToast({ message: msg, type: 'error', duration }),
    info: (msg, duration) => addToast({ message: msg, type: 'info', duration }),
  };
}
