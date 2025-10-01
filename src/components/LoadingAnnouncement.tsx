import React, { useEffect, useRef } from 'react';
import { useLoadingAnnouncement, useLoadingFocus } from '../hooks/useLoadingAnnouncement';

interface LoadingAnnouncementProps {
  message?: string;
  politeness?: 'polite' | 'assertive' | 'off';
}

export const LoadingAnnouncement: React.FC<LoadingAnnouncementProps> = ({
  message = 'Loading content',
  politeness = 'polite'
}) => {
  const announcementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (announcementRef.current) {
      // Clear previous content
      announcementRef.current.textContent = '';

      // Add new content after a small delay to ensure screen readers register the change
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = message;
        }
      }, 100);
    }
  }, [message]);

  return (
    <div
      ref={announcementRef}
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    />
  );
};

// Reduced motion loading indicator
export const ReducedMotionLoading: React.FC<{
  show: boolean;
  children?: React.ReactNode;
}> = ({ show, children }) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (!show) return children;

  if (prefersReducedMotion) {
    // Show a static loading indicator for users who prefer reduced motion
    return (
      <div className="flex items-center justify-center p-4" role="status" aria-label="Loading">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export { useLoadingAnnouncement, useLoadingFocus };