export function logError(error: Error, errorInfo: React.ErrorInfo) {
  // In a real app, you would send this to an error reporting service
  console.error("ErrorBoundary caught an error", error, errorInfo);
}
