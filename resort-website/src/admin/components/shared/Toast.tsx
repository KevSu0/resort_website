import { useEffect, useState, type ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

const typeStyles = {
  success: {
    container: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    icon: 'text-green-500 dark:text-green-400',
    title: 'text-green-800 dark:text-green-200',
    message: 'text-green-700 dark:text-green-300',
    progress: 'bg-green-500'
  },
  error: {
    container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    icon: 'text-red-500 dark:text-red-400',
    title: 'text-red-800 dark:text-red-200',
    message: 'text-red-700 dark:text-red-300',
    progress: 'bg-red-500'
  },
  warning: {
    container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    icon: 'text-yellow-500 dark:text-yellow-400',
    title: 'text-yellow-800 dark:text-yellow-200',
    message: 'text-yellow-700 dark:text-yellow-300',
    progress: 'bg-yellow-500'
  },
  info: {
    container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    icon: 'text-blue-500 dark:text-blue-400',
    title: 'text-blue-800 dark:text-blue-200',
    message: 'text-blue-700 dark:text-blue-300',
    progress: 'bg-blue-500'
  }
};

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (duration === 0) return; // Don't auto-dismiss

    const startTime = Date.now();
    const endTime = startTime + duration;

    const updateProgress = () => {
      if (isPaused) return;

      const remaining = Math.max(0, endTime - Date.now());
      const newProgress = (remaining / duration) * 100;
      setProgress(newProgress);

      if (remaining > 0) {
        requestAnimationFrame(updateProgress);
      } else {
        onClose(id);
      }
    };

    const animationId = requestAnimationFrame(updateProgress);

    return () => cancelAnimationFrame(animationId);
  }, [duration, id, isPaused, onClose]);

  const Icon = icons[type];
  const styles = typeStyles[type];

  return (
    <div
      className={`max-w-sm w-full pointer-events-auto rounded-lg shadow-lg border p-4 ${styles.container} transform transition-all duration-300 ease-out translate-x-0 opacity-100`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${styles.icon}`} />
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${styles.title}`}>{title}</p>
          {message && (
            <p className={`mt-1 text-sm ${styles.message}`}>{message}</p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className={`inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.icon.replace('text', 'focus:ring')}`}
            onClick={() => onClose(id)}
            aria-label="Close notification"
          >
            <span className="sr-only">Close</span>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      {duration > 0 && (
        <div className={`mt-3 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${isPaused ? 'opacity-50' : ''}`}>
          <div
            className={`h-full ${styles.progress} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

interface ToastContainerProps {
  children: ReactNode;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ children }) => {
  const container = document.getElementById('toast-container');

  if (!container) {
    return null;
  }

  return createPortal(children, container);
};