import React, { createContext, useState, useCallback } from 'react';
import { Loading, LoadingOverlay } from './Loading';
import { cn } from '../lib/utils';

interface LoadingContextType {
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
  loadingStates: Record<string, boolean>;
  setLoading: (key: string, loading: boolean) => void;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  isLoading: (key: string) => boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);


interface LoadingProviderProps {
  children: React.ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [globalLoading, setGlobalLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }));
  }, []);

  const startLoading = useCallback((key: string) => {
    setLoading(key, true);
  }, [setLoading]);

  const stopLoading = useCallback((key: string) => {
    setLoading(key, false);
  }, [setLoading]);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const value = {
    globalLoading,
    setGlobalLoading,
    loadingStates,
    setLoading,
    startLoading,
    stopLoading,
    isLoading
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {globalLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Loading size="lg" text="Loading..." variant="default" color="primary" />
        </div>
      )}
    </LoadingContext.Provider>
  );
};

// Page Transition Loading Component
export const PageTransitionLoading: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ isLoading, children, className = '' }) => {
  return (
    <div className={cn('relative min-h-screen', className)}>
      {isLoading && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loading size="xl" variant="shimmer" color="primary" />
            <p className="text-lg text-gray-600 animate-fade-in">Preparing your experience...</p>
          </div>
        </div>
      )}
      <div className={cn(isLoading && 'opacity-0 pointer-events-none transition-opacity duration-300')}>
        {children}
      </div>
    </div>
  );
};

// Route Loading Component
export const RouteLoading: React.FC<{
  isLoading: boolean;
  text?: string;
  children?: React.ReactNode;
}> = ({ isLoading, text = 'Loading page...', children }) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center space-y-6">
        <Loading size="xl" variant="dots" color="primary" />
        <div className="space-y-2">
          <p className="text-lg text-gray-700 font-medium">{text}</p>
          <p className="text-sm text-gray-500">Please wait a moment</p>
        </div>
      </div>
    </div>
  );
};
// Section Loading Component
export const SectionLoading: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
  className?: string;
  overlay?: boolean;
}> = ({ isLoading, children, text, className = '', overlay = true }) => {
  if (overlay) {
    return (
      <LoadingOverlay isLoading={isLoading} text={text} className={className}>
        {children}
      </LoadingOverlay>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
          <Loading text={text} size="md" />
        </div>
      )}
      <div className={cn(isLoading && 'opacity-30 pointer-events-none transition-opacity duration-200')}>
        {children}
      </div>
    </div>
  );
};

// Form Loading Component
export const FormLoading: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
  className?: string;
}> = ({ isLoading, children, text = 'Submitting...', className = '' }) => {
  return (
    <div className={cn('relative', className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
          <div className="text-center space-y-3">
            <Loading size="md" variant="dots" color="primary" />
            <p className="text-sm text-gray-600">{text}</p>
          </div>
        </div>
      )}
      <div className={cn(isLoading && 'opacity-50 pointer-events-none transition-opacity duration-200')}>
        {children}
      </div>
    </div>
  );
};

// Button Loading Component
export const ButtonLoading: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}> = ({ isLoading, children, loadingText, className = '' }) => {
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      {isLoading && (
        <Loading size="sm" variant="dots" color="primary" />
      )}
      <span className={cn(isLoading && 'opacity-70')}>
        {isLoading ? loadingText || 'Loading...' : children}
      </span>
    </div>
  );
};
