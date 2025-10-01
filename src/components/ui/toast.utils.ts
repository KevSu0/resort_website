export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// Internal state for toast management
let internalToasts: Toast[] = [];
let internalListeners: (() => void)[] = [];

const updateToasts = (newToasts: Toast[]) => {
  internalToasts = newToasts;
  internalListeners.forEach(listener => listener());
};

// Global toast API
let toastCount = 0;

const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = `toast-${++toastCount}`;
  const newToast: Toast = { ...toast, id };
  updateToasts([...internalToasts, newToast]);
  return id;
};

export const toast = {
  success: (title: string, message?: string) => addToast({ type: 'success', title, message }),
  error: (title: string, message?: string) => addToast({ type: 'error', title, message }),
  warning: (title: string, message?: string) => addToast({ type: 'warning', title, message }),
  info: (title: string, message?: string) => addToast({ type: 'info', title, message })
};

export const updateToastsState = (newToasts: Toast[]) => {
  updateToasts(newToasts);
};

export const addToastListener = (listener: () => void) => {
  internalListeners.push(listener);
  return () => {
    internalListeners = internalListeners.filter(l => l !== listener);
  };
};

export const getCurrentToasts = () => [...internalToasts];