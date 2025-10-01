import React from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';

export function withErrorHandling<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithErrorHandling(props: P) {
    return (
      <ErrorBoundary
        fallback={
          <div className="p-4 text-center">
            <p className="text-gray-600">This component failed to load.</p>
          </div>
        }
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}