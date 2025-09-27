import { useCallback, useEffect, useState } from 'react';

export interface ToastOptions {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface Toast extends ToastOptions {
  id: string;
}

const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((options: ToastOptions) => {
    const id = options.id || generateId();
    const toast: Toast = {
      id,
      ...options
    };

    setToasts(prev => [...prev, toast]);

    // Auto-remove after duration
    if (options.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, options.duration || 5000);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Helper methods
  const success = useCallback(
    (title: string, message?: string, duration?: number) =>
      addToast({ type: 'success', title, message, duration }),
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string, duration?: number) =>
      addToast({ type: 'error', title, message, duration }),
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string, duration?: number) =>
      addToast({ type: 'warning', title, message, duration }),
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string, duration?: number) =>
      addToast({ type: 'info', title, message, duration }),
    [addToast]
  );

  // Update toast
  const updateToast = useCallback(
    (id: string, updates: Partial<ToastOptions>) => {
      setToasts(prev =>
        prev.map(toast =>
          toast.id === id ? { ...toast, ...updates } : toast
        )
      );
    },
    []
  );

  // Keyboard shortcut to dismiss all
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Shift + D to dismiss all
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'd') {
        clearAllToasts();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearAllToasts]);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    updateToast,
    success,
    error,
    warning,
    info
  };
};