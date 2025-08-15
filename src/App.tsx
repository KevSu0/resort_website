import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

export default function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
