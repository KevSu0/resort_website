
export interface LoadingContextType {
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
  loadingStates: Record<string, boolean>;
  setLoading: (key: string, loading: boolean) => void;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  isLoading: (key: string) => boolean;
}

// This is a placeholder - the actual LoadingContext should be moved to a separate context file
// For now, we'll create a simple implementation that can be updated later

export const useLoadingContext = () => {
  // This should be replaced with the actual context import once it's moved
  throw new Error('useLoadingContext must be used within LoadingProvider. Please move LoadingContext to a separate file first.');
};