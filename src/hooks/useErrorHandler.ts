import { useToast } from './useToast';

export const useErrorHandler = () => {
  const toast = useToast();

  const handleError = (error: Error, context?: string) => {
    console.error('Error caught by handler:', error, { context });

    toast.error(
      'An error occurred',
      error.message || 'Please try again or contact support'
    );

    // In production, send error to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // sendErrorToTrackingService(error, context);
    }
  };

  return { handleError };
};