import { ErrorInfo } from "react";

// Functional error boundary hook for specific use cases
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by error handler:', error, errorInfo);

    // In a real app, you might want to report this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: reportError(error, errorInfo);
    }
  };
}
