import { useState, useEffect, useCallback } from 'react';
import { logger } from '../lib/logger';

interface LoadingState {
  [key: string]: boolean;
}

interface UseLoadingReturn {
  isLoading: boolean;
  loadingStates: LoadingState;
  setLoading: (key: string, loading: boolean) => void;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  isSpecificLoading: (key: string) => boolean;
  clearAllLoading: () => void;
}

export const useLoading = (initialLoading: string[] = []): UseLoadingReturn => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>(() => {
    const initial: LoadingState = {};
    initialLoading.forEach(key => {
      initial[key] = true;
    });
    return initial;
  });

  const isLoading = Object.values(loadingStates).some(Boolean);

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => {
      if (!loading && prev[key] === undefined) {
        return prev;
      }
      return {
        ...prev,
        [key]: loading
      };
    });
  }, []);

  const startLoading = useCallback((key: string) => {
    setLoading(key, true);
  }, [setLoading]);

  const stopLoading = useCallback((key: string) => {
    setLoading(key, false);
  }, [setLoading]);

  const isSpecificLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const clearAllLoading = useCallback(() => {
    setLoadingStates({});
  }, []);

  return {
    isLoading,
    loadingStates,
    setLoading,
    startLoading,
    stopLoading,
    isSpecificLoading,
    clearAllLoading
  };
};

// Async operation wrapper with automatic loading state management
export const useAsyncOperation = () => {
  const { startLoading, stopLoading, isSpecificLoading } = useLoading();

  const executeAsync = useCallback(async <T,>(
    operation: () => Promise<T>,
    loadingKey: string
  ): Promise<T | null> => {
    try {
      startLoading(loadingKey);
      const result = await operation();
      return result;
    } catch (error) {
      logger.error(`Async operation [${loadingKey}] failed`, {
        module: 'useLoading',
        function: 'executeAsync',
        loadingKey,
        error: error instanceof Error ? error.message : String(error),
        category: 'async'
      });
      return null;
    } finally {
      stopLoading(loadingKey);
    }
  }, [startLoading, stopLoading]);

  return {
    executeAsync,
    isSpecificLoading
  };
};

// Image loading hook
export const useImageLoading = () => {
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const loadImage = useCallback((src: string) => {
    if (loadingImages.has(src) || imageErrors.has(src)) {
      return;
    }

    setLoadingImages(prev => new Set(prev).add(src));

    const img = new Image();
    img.onload = () => {
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(src);
        return newSet;
      });
      setImageErrors(prev => {
        const newSet = new Set(prev);
        newSet.delete(src);
        return newSet;
      });
    };

    img.onerror = () => {
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(src);
        return newSet;
      });
      setImageErrors(prev => new Set(prev).add(src));
    };

    img.src = src;
  }, [loadingImages, imageErrors]);

  const isImageLoading = useCallback((src: string) => {
    return loadingImages.has(src);
  }, [loadingImages]);

  const hasImageError = useCallback((src: string) => {
    return imageErrors.has(src);
  }, [imageErrors]);

  return {
    loadImage,
    isImageLoading,
    hasImageError,
    loadingImages: Array.from(loadingImages),
    imageErrors: Array.from(imageErrors)
  };
};

// Debounced loading hook for search/filter operations
export const useDebouncedLoading = (delay: number = 300) => {
  const [debounceLoading, setDebounceLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const triggerDebouncedLoading = useCallback((operation: () => void) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    setDebounceLoading(true);

    const newTimer = setTimeout(() => {
      operation();
      setDebounceLoading(false);
    }, delay);

    setDebounceTimer(newTimer);
  }, [debounceTimer, delay]);

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return {
    debounceLoading,
    triggerDebouncedLoading
  };
};