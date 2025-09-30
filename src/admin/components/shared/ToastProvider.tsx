import { useToast } from '../../hooks/useToast';
import { Toast, ToastContainer } from './Toast';
import { useEffect } from 'react';

export const ToastProvider: React.FC = () => {
  const { toasts, removeToast } = useToast();

  // Create container element if it doesn't exist
  useEffect(() => {
    if (!document.getElementById('toast-container')) {
      const container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(container);
    }

    return () => {
      // Clean up container on unmount
      const container = document.getElementById('toast-container');
      if (container && container.children.length === 0) {
        container.remove();
      }
    };
  }, []);

  return (
    <ToastContainer>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={removeToast}
        />
      ))}
    </ToastContainer>
  );
};