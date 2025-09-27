import React, { createContext, useContext, useState, useCallback } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

interface LoadingContextType {
  isLoading: (key: string) => boolean;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  withLoading: <T>(
    key: string,
    fn: () => Promise<T>
  ) => Promise<T>;
  getLoadingKeys: () => string[];
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: React.ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});

  const isLoading = useCallback((key: string) => {
    return !!loadingStates[key];
  }, [loadingStates]);

  const startLoading = useCallback((key: string) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: true,
    }));
  }, []);

  const stopLoading = useCallback((key: string) => {
    setLoadingStates((prev) => {
      const newStates = { ...prev };
      delete newStates[key];
      return newStates;
    });
  }, []);

  const withLoading = useCallback(async <T,>(
    key: string,
    fn: () => Promise<T>
  ): Promise<T> => {
    try {
      startLoading(key);
      return await fn();
    } finally {
      stopLoading(key);
    }
  }, [startLoading, stopLoading]);

  const getLoadingKeys = useCallback(() => {
    return Object.keys(loadingStates);
  }, [loadingStates]);

  const value: LoadingContextType = {
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
    getLoadingKeys,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};