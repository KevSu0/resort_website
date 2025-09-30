import { logger } from '../utils/logger';
import { createChildLogger } from '../utils/logger';
import { InputSanitizer } from '../utils/sanitizer';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  route?: string;
  [key: string]: any;
}

export interface ErrorReport {
  id: string;
  timestamp: string;
  type: 'client' | 'server' | 'network';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack?: string;
  context: ErrorContext;
  userAgent?: string;
  url?: string;
  handled: boolean;
  resolved: boolean;
  resolutionNotes?: string;
}

export interface ErrorHandlerOptions {
  enableAlerts?: boolean;
  enableLogging?: boolean;
  enableReporting?: boolean;
  reportThreshold?: 'low' | 'medium' | 'high' | 'critical';
  customHandlers?: Record<string, (error: Error, context: ErrorContext) => void>;
}

const DEFAULT_OPTIONS: Required<ErrorHandlerOptions> = {
  enableAlerts: true,
  enableLogging: true,
  enableReporting: true,
  reportThreshold: 'medium',
  customHandlers: {}
};

class ErrorService {
  private options: Required<ErrorHandlerOptions>;
  private logger = createChildLogger({ service: 'errorService' });
  private errorReports: ErrorReport[] = [];
  private storageKey = 'admin_error_reports';

  constructor(options: ErrorHandlerOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.loadErrorReports();
    this.setupGlobalHandlers();
  }

  private loadErrorReports(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.errorReports = JSON.parse(stored);
      }
    } catch (error) {
      this.logger.error('Failed to load error reports', error);
    }
  }

  private saveErrorReports(): void {
    try {
      // Keep only last 100 error reports
      const trimmed = this.errorReports.slice(-100);
      localStorage.setItem(this.storageKey, JSON.stringify(trimmed));
    } catch (error) {
      this.logger.error('Failed to save error reports', error);
    }
  }

  private setupGlobalHandlers(): void {
    // Handle uncaught errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.handleError(
          event.error || new Error(event.message),
          {
            type: 'uncaught',
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          },
          false
        );
      });

      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.handleError(
          event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
          { type: 'unhandledRejection' },
          false
        );
      });
    }
  }

  private determineSeverity(error: Error, context: ErrorContext): 'low' | 'medium' | 'high' | 'critical' {
    // Critical errors
    if (error.name === 'TypeError' && error.message.includes('null')) {
      return 'critical';
    }

    // High severity errors
    if (error.name === 'NetworkError' || error.name === 'AbortError') {
      return 'high';
    }

    // Medium severity errors
    if (error.name === 'ValidationError' || error.name === 'NotFoundError') {
      return 'medium';
    }

    // Default to low
    return 'low';
  }

  private createErrorReport(
    error: Error,
    context: ErrorContext,
    handled: boolean
  ): ErrorReport {
    return {
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: context.type || 'client',
      severity: this.determineSeverity(error, context),
      message: InputSanitizer.sanitizeText(error.message),
      stack: error.stack,
      context: {
        ...context,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
      },
      handled,
      resolved: false
    };
  }

  handleError(
    error: Error,
    context: ErrorContext = {},
    handled: boolean = true
  ): ErrorReport {
    // Sanitize context
    const sanitizedContext = InputSanitizer.sanitizeObject(context, {
      skipKeys: ['password', 'token', 'secret', 'key'],
      sanitizeKeys: true
    }) as ErrorContext;

    // Create error report
    const report = this.createErrorReport(error, sanitizedContext, handled);

    // Add to reports
    this.errorReports.push(report);
    this.saveErrorReports();

    // Log the error
    if (this.options.enableLogging) {
      const logLevel = report.severity === 'critical' ? 'fatal' :
                     report.severity === 'high' ? 'error' :
                     report.severity === 'medium' ? 'warn' : 'info';

      this.logger[logLevel](
        `Error: ${report.message}`,
        {
          errorId: report.id,
          severity: report.severity,
          handled,
          context: sanitizedContext
        },
        error
      );
    }

    // Check if we should report this error
    if (
      this.options.enableReporting &&
      this.shouldReport(report) &&
      !handled
    ) {
      this.reportError(report);
    }

    // Show alert for critical errors
    if (this.options.enableAlerts && report.severity === 'critical') {
      this.showAlert(report);
    }

    // Run custom handlers
    const handlerKey = `${context.component || 'global'}.${context.action || 'default'}`;
    const customHandler = this.options.customHandlers[handlerKey];
    if (customHandler) {
      try {
        customHandler(error, sanitizedContext);
      } catch (handlerError) {
        this.logger.error('Error in custom error handler', handlerError);
      }
    }

    return report;
  }

  private shouldReport(report: ErrorReport): boolean {
    const thresholdIndex = ['low', 'medium', 'high', 'critical'].indexOf(this.options.reportThreshold);
    const severityIndex = ['low', 'medium', 'high', 'critical'].indexOf(report.severity);
    return severityIndex >= thresholdIndex;
  }

  private reportError(report: ErrorReport): void {
    // In a real application, this would send to an error tracking service
    // For now, we'll just log it
    this.logger.info('Error report generated', {
      errorId: report.id,
      severity: report.severity,
      message: report.message
    });

    // Example implementation for error tracking services:
    // - Sentry: Sentry.captureException(error)
    // - LogRocket: LogRocket.captureException(error)
    // - Custom API: fetch('/api/errors', { method: 'POST', body: JSON.stringify(report) })
  }

  private showAlert(report: ErrorReport): void {
    if (typeof window === 'undefined') return;

    // Create toast notification
    const alertId = `alert_${report.id}`;
    const alert = document.createElement('div');
    alert.id = alertId;
    alert.className = 'fixed top-4 right-4 z-50 max-w-md bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg';
    alert.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Critical Error</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>${report.message}</p>
          </div>
          <div class="mt-4">
            <button onclick="document.getElementById('${alertId}').remove()" class="bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 rounded text-sm font-medium">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(alert);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      const element = document.getElementById(alertId);
      if (element) {
        element.remove();
      }
    }, 10000);
  }

  // API for handling different types of errors
  handleNetworkError(error: Error, context: ErrorContext = {}): ErrorReport {
    return this.handleError(error, { ...context, type: 'network' });
  }

  handleValidationError(error: Error, context: ErrorContext = {}): ErrorReport {
    return this.handleError(error, { ...context, type: 'validation' });
  }

  handleAuthError(error: Error, context: ErrorContext = {}): ErrorReport {
    return this.handleError(error, { ...context, type: 'auth' });
  }

  handleApiError(error: Error, context: ErrorContext = {}): ErrorReport {
    return this.handleError(error, { ...context, type: 'api' });
  }

  // Get error reports
  getErrorReports(options?: {
    severity?: 'low' | 'medium' | 'high' | 'critical';
    handled?: boolean;
    resolved?: boolean;
    limit?: number;
  }): ErrorReport[] {
    let filtered = [...this.errorReports];

    if (options) {
      if (options.severity) {
        filtered = filtered.filter(r => r.severity === options.severity);
      }
      if (options.handled !== undefined) {
        filtered = filtered.filter(r => r.handled === options.handled);
      }
      if (options.resolved !== undefined) {
        filtered = filtered.filter(r => r.resolved === options.resolved);
      }
      if (options.limit) {
        filtered = filtered.slice(-options.limit);
      }
    }

    return filtered.reverse();
  }

  // Resolve an error
  resolveError(errorId: string, resolutionNotes?: string): boolean {
    const report = this.errorReports.find(r => r.id === errorId);
    if (!report) return false;

    report.resolved = true;
    report.resolutionNotes = resolutionNotes;
    this.saveErrorReports();

    this.logger.info('Error resolved', { errorId, resolutionNotes });

    return true;
  }

  // Get error statistics
  getErrorStats(): {
    total: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    resolvedCount: number;
    criticalCount: number;
  } {
    const stats = {
      total: this.errorReports.length,
      bySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      },
      byType: {} as Record<string, number>,
      resolvedCount: 0,
      criticalCount: 0
    };

    this.errorReports.forEach(report => {
      stats.bySeverity[report.severity]++;
      stats.byType[report.type] = (stats.byType[report.type] || 0) + 1;
      if (report.resolved) stats.resolvedCount++;
      if (report.severity === 'critical') stats.criticalCount++;
    });

    return stats;
  }

  // Clear error reports
  clearErrorReports(): void {
    this.errorReports = [];
    this.saveErrorReports();
  }

  // Update options
  updateOptions(options: Partial<ErrorHandlerOptions>): void {
    this.options = { ...this.options, ...options };
  }
}

// Create singleton instance
export const errorService = new ErrorService();

// Hook for using error service in components
export function useErrorService() {
  return {
    handleError: errorService.handleError.bind(errorService),
    handleNetworkError: errorService.handleNetworkError.bind(errorService),
    handleValidationError: errorService.handleValidationError.bind(errorService),
    handleAuthError: errorService.handleAuthError.bind(errorService),
    handleApiError: errorService.handleApiError.bind(errorService),
    errorReports: errorService.getErrorReports(),
    stats: errorService.getErrorStats()
  };
}

// Decorator for auto-error handling
export function catchErrors(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    try {
      return await method.apply(this, args);
    } catch (error) {
      errorService.handleError(error as Error, {
        component: target.constructor.name,
        action: propertyKey,
        args: args.length
      });
      throw error;
    }
  };
}

// Wrapper function for async operations
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: ErrorContext = {}
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    errorService.handleError(error as Error, context);
    throw error;
  }
}