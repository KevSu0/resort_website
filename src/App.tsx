import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import './index.css';

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <RouterProvider router={router} />
      </Suspense>
    </ErrorBoundary>
  );
}
