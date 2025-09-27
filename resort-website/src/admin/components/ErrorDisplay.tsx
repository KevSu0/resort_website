import React from 'react';
import { AlertCircle, Info, AlertTriangle, XCircle, RefreshCw, HelpCircle } from 'lucide-react';
import { ErrorConfig, getErrorConfig, getErrorStyles } from '../utils/errorMessages';

interface ErrorDisplayProps {
  error?: Error | string;
  code?: string;
  customMessage?: string;
  context?: any;
  className?: string;
  showDetails?: boolean;
  onDismiss?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  code,
  customMessage,
  context,
  className = '',
  showDetails = false,
  onDismiss,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  // Get error configuration
  const errorConfig = React.useMemo(() => {
    if (code) {
      return getErrorConfig(code, customMessage);
    }

    // Try to extract code from error message if it's in format ERROR_XXX
    if (typeof error === 'string') {
      const match = error.match(/([A-Z]+_\d+)/);
      if (match) {
        return getErrorConfig(match[1], error);
      }
    }

    // Use generic error
    return getErrorConfig('UNKNOWN_001', error?.toString() || customMessage);
  }, [error, code, customMessage]);

  const styles = getErrorStyles(errorConfig.severity);

  const Icon = {
    info: Info,
    warning: AlertTriangle,
    error: AlertCircle,
    critical: XCircle,
  }[errorConfig.severity];

  return (
    <div
      className={`border rounded-lg p-4 ${styles.container} ${className}`}
      role="alert"
      aria-live={errorConfig.severity === 'critical' ? 'assertive' : 'polite'}
    >
      <div className="flex items-start">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${styles.icon}`} />
        <div className="ml-3 flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className={`text-sm font-medium ${styles.title}`}>
                {errorConfig.title}
              </h3>
              <p className={`mt-1 text-sm ${styles.message}`}>
                {errorConfig.message}
              </p>
              {errorConfig.suggestion && (
                <p className={`mt-1 text-sm ${styles.message} italic`}>
                  💡 {errorConfig.suggestion}
                </p>
              )}
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className={`ml-4 p-1 rounded hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-${styles.icon.replace('text-', '')}`}
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Recovery actions */}
          {errorConfig.recoveryActions && errorConfig.recoveryActions.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {errorConfig.recoveryActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`px-3 py-1 text-sm font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    action.primary
                      ? `${styles.button} text-white`
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Technical details */}
          {(errorConfig.technicalCode || showDetails) && (
            <div className="mt-4">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center text-xs text-gray-600 hover:text-gray-800 focus:outline-none"
                aria-expanded={expanded}
              >
                <HelpCircle className="w-3 h-3 mr-1" />
                Technical Details
              </button>
              {expanded && (
                <div className="mt-2 p-3 bg-black/5 rounded text-xs font-mono">
                  {errorConfig.technicalCode && (
                    <div>
                      <span className="text-gray-600">Code: </span>
                      <span>{errorConfig.technicalCode}</span>
                    </div>
                  )}
                  {error instanceof Error && error.stack && (
                    <div className="mt-2">
                      <span className="text-gray-600">Stack: </span>
                      <pre className="whitespace-pre-wrap mt-1">{error.stack}</pre>
                    </div>
                  )}
                  {context && (
                    <div className="mt-2">
                      <span className="text-gray-600">Context: </span>
                      <pre className="whitespace-pre-wrap mt-1">
                        {JSON.stringify(context, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Form field error component
interface FieldErrorProps {
  message: string;
  id?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({ message, id }) => (
  <div id={id} className="mt-1 text-sm text-red-600 flex items-start">
    <AlertCircle className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
    <span>{message}</span>
  </div>
);

// Toast error component
interface ToastErrorProps {
  message: string;
  onRetry?: () => void;
}

export const ToastError: React.FC<ToastErrorProps> = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
    <XCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
    <div className="flex-1">
      <p className="text-sm text-red-800">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 text-sm text-red-700 hover:text-red-900 font-medium flex items-center"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Retry
        </button>
      )}
    </div>
  </div>
);

// Error boundary fallback component
interface ErrorFallbackProps {
  error: Error;
  onReset?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => (
  <div className="min-h-[400px] flex items-center justify-center p-4">
    <div className="max-w-md w-full text-center">
      <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Something went wrong
      </h2>
      <p className="text-gray-600 mb-6">
        We encountered an unexpected error. Please try refreshing the page.
      </p>
      <div className="space-y-3">
        <button
          onClick={() => window.location.reload()}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Refresh Page
        </button>
        {onReset && (
          <button
            onClick={onReset}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Try Again
          </button>
        )}
      </div>
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-6 text-left">
          <summary className="cursor-pointer text-sm text-gray-600">
            Error details
          </summary>
          <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  </div>
);