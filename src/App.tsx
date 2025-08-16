import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';
import { router } from './router';
import { ErrorFallback } from './components/ErrorFallback';
import { NetworkStatusIndicator } from './components/NetworkStatusIndicator';
import LoadingSpinner from './components/LoadingSpinner';
import './index.css';

export default function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <NetworkStatusIndicator />
        <Suspense fallback={<LoadingSpinner />}>
          <RouterProvider router={router} />
        </Suspense>
      </ErrorBoundary>
    </HelmetProvider>
  );
}
