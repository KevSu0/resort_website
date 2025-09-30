import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastComponent: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  };

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={`max-w-sm w-full ${bgColors[toast.type]} border rounded-lg shadow-lg p-4 mb-2 transform transition-all duration-300 ease-in-out`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${iconColors[toast.type]}`} />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900">{toast.title}</h3>
          {toast.message && (
            <div className="mt-1 text-sm text-gray-500">{toast.message}</div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={() => onDismiss(toast.id)}
            className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

let toastCount = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${++toastCount}`;
    const newToast: Toast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (title: string, message?: string) => {
    return addToast({ type: 'success', title, message });
  };

  const error = (title: string, message?: string) => {
    return addToast({ type: 'error', title, message });
  };

  const warning = (title: string, message?: string) => {
    return addToast({ type: 'warning', title, message });
  };

  const info = (title: string, message?: string) => {
    return addToast({ type: 'info', title, message });
  };

  return {
    toasts,
    success,
    error,
    warning,
    info,
    dismiss: dismissToast,
    add: addToast
  };
};

export const ToastContainer: React.FC = () => {
  const { toasts, dismiss } = useToast();

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>,
    document.body
  );
};

// Global toast instance for non-component usage
let globalToast: ReturnType<typeof useToast> | null = null;

export const toast = {
  success: (title: string, message?: string) => globalToast?.success(title, message),
  error: (title: string, message?: string) => globalToast?.error(title, message),
  warning: (title: string, message?: string) => globalToast?.warning(title, message),
  info: (title: string, message?: string) => globalToast?.info(title, message)
};

// Hook to set global toast instance
export const useGlobalToast = () => {
  const toastInstance = useToast();
  useEffect(() => {
    globalToast = toastInstance;
    return () => {
      globalToast = null;
    };
  }, [toastInstance]);
  return toastInstance;
};