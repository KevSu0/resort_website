import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  blur?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
  blur = true,
}) => {
  if (!isLoading) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-opacity ${
        blur ? 'backdrop-blur-sm' : ''
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center space-y-4 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {message}
        </p>
      </div>
    </div>
  );
};