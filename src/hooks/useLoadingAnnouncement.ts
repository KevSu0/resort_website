import React, { useState, useRef, useCallback } from 'react';

// Hook for announcing loading states to screen readers
export const useLoadingAnnouncement = () => {
  const [announcement, setAnnouncement] = useState('');

  const announce = useCallback((message: string) => {
    setAnnouncement(message);

    // Clear announcement after it's been read
    setTimeout(() => {
      setAnnouncement('');
    }, 1000);
  }, []);

  const announceLoadingStart = useCallback((operation: string) => {
    announce(`Loading ${operation}. Please wait.`);
  }, [announce]);

  const announceLoadingEnd = useCallback((operation: string) => {
    announce(`${operation} has finished loading.`);
  }, [announce]);

  const announceError = useCallback((operation: string, error?: string) => {
    announce(`Error loading ${operation}. ${error || 'Please try again.'}`, 'assertive');
  }, [announce]);

  return {
    announcement,
    announce,
    announceLoadingStart,
    announceLoadingEnd,
    announceError
  };
};

// Focus management during loading
export const useLoadingFocus = (isLoading: boolean, focusRef?: React.RefObject<HTMLElement>) => {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (isLoading) {
      // Store current focus
      previousFocusRef.current = document.activeElement as HTMLElement;

      // If a specific focus element is provided, focus it
      if (focusRef?.current) {
        focusRef.current.focus();
      }
    } else {
      // Restore focus when loading completes
      if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
        previousFocusRef.current.focus();
      }
    }
  }, [isLoading, focusRef]);

  return {
    trapFocus: isLoading,
    restoreFocus: () => {
      if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
        previousFocusRef.current.focus();
      }
    }
  };
};