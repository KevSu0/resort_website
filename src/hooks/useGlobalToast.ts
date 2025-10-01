import { useEffect } from 'react';
import { useToast } from './useToast';

// Global toast instance for non-component usage
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let globalToast: ReturnType<typeof useToast> | null = null;

export const useGlobalToast = () => {
  const toastInstance = useToast();
  useEffect(() => {
    globalToast = toastInstance;
    return () => {
      globalToast = null;
    };
  }, [toastInstance]);
  return toastInstance;
};