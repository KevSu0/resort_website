import React from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast, ToastProps as ToastData, ToastVariant } from '../../hooks/useToast';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';

const toastVariants: Record<ToastVariant, { icon: React.ElementType, className: string }> = {
  default: {
    icon: Info,
    className: 'bg-white border-gray-200 text-gray-900',
  },
  destructive: {
    icon: AlertTriangle,
    className: 'bg-red-50 border-red-200 text-red-900',
  },
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-900',
  },
};

const Toast: React.FC<ToastData & { onDismiss: () => void }> = ({ title, description, variant = 'default', onDismiss }) => {
  const { icon: Icon, className } = toastVariants[variant];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={clsx(
        'relative w-full max-w-sm p-4 border rounded-lg shadow-lg flex items-start space-x-4',
        className
      )}
    >
      <Icon className="w-6 h-6 mt-1" />
      <div className="flex-1">
        {title && <h3 className="font-semibold">{title}</h3>}
        {description && <p className="text-sm opacity-90">{description}</p>}
      </div>
      <button onClick={onDismiss} className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-0 right-0 z-50 p-4 w-full max-w-sm">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onDismiss={() => dismiss(toast.id!)} />
        ))}
      </AnimatePresence>
    </div>
  );
};
