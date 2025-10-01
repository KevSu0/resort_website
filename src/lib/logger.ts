export const enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LogContext {
  module?: string;
  function?: string;
  userId?: string;
  requestId?: string;
  [key: string]: unknown;
}

export interface LoggerConfig {
  level: LogLevel;
  format: 'json' | 'simple';
  transports: Array<{
    type: 'console';
    options?: Record<string, unknown>;
  }>;
  metadata?: Record<string, unknown>;
}

type LogPayload = {
  level: LogLevel;
  message: string;
  timestamp: string;
} & LogContext;

class Logger {
  private static readonly levelPriority: Record<LogLevel, number> = {
    [LogLevel.ERROR]: 0,
    [LogLevel.WARN]: 1,
    [LogLevel.INFO]: 2,
    [LogLevel.DEBUG]: 3
  };

  private static readonly consoleMap: Record<LogLevel, (message?: unknown, ...optionalParams: unknown[]) => void> = {
    [LogLevel.ERROR]: console.error.bind(console),
    [LogLevel.WARN]: console.warn.bind(console),
    [LogLevel.INFO]: console.info.bind(console),
    [LogLevel.DEBUG]: console.debug ? console.debug.bind(console) : console.log.bind(console)
  };

  private readonly level: LogLevel;
  private readonly format: 'json' | 'simple';
  private readonly transports: LoggerConfig['transports'];
  private defaultContext: LogContext;

  constructor(config?: Partial<LoggerConfig>) {
    const defaultConfig: LoggerConfig = {
      level: LogLevel.INFO,
      format: 'json',
      transports: [
        {
          type: 'console',
          options: {
            colorize: true,
            prettyPrint: true
          }
        }
      ]
    };

    const finalConfig: LoggerConfig = {
      ...defaultConfig,
      ...config,
      transports: config?.transports ?? defaultConfig.transports
    };

    this.level = finalConfig.level;
    this.format = finalConfig.format;
    this.transports = finalConfig.transports;
    this.defaultContext = finalConfig.metadata ? { ...finalConfig.metadata } : {};
  }

  setDefaultContext(context: LogContext): void {
    this.defaultContext = { ...this.defaultContext, ...context };
  }

  private shouldLog(level: LogLevel): boolean {
    return Logger.levelPriority[level] <= Logger.levelPriority[this.level];
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): LogPayload {
    const combinedContext = { ...this.defaultContext, ...context };

    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...combinedContext
    };
  }

  private emit(level: LogLevel, payload: LogPayload): void {
    if (!this.transports.some(transport => transport.type === 'console')) {
      return;
    }

    const logMethod = Logger.consoleMap[level];

    if (this.format === 'json') {
      logMethod(JSON.stringify(payload));
      return;
    }

    const { timestamp, message, ...metadata } = payload;
    const metaKeys = Object.keys(metadata);
    const metaSuffix = metaKeys.length > 0 ? ` ${JSON.stringify(metadata)}` : '';
    logMethod(`${timestamp} [${level}]: ${message}${metaSuffix}`);
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const payload = this.formatMessage(level, message, context);
    this.emit(level, payload);
  }

  error(message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  // Database-specific logging methods
  logDatabaseQuery(query: string, params?: unknown[], duration?: number, context?: LogContext): void {
    this.debug('Database query executed', {
      ...context,
      query,
      params: params || [],
      duration,
      category: 'database'
    });
  }

  logDatabaseError(error: Error, operation: string, context?: LogContext): void {
    this.error('Database operation failed', {
      ...context,
      operation,
      error: error.message,
      stack: error.stack,
      category: 'database'
    });
  }

  logDatabaseConnection(connectionDetails: Record<string, unknown>, context?: LogContext): void {
    this.info('Database connection established', {
      ...context,
      connectionDetails,
      category: 'database'
    });
  }

  // API-specific logging methods
  logApiRequest(method: string, url: string, userId?: string, context?: LogContext): void {
    this.info('API request initiated', {
      ...context,
      method,
      url,
      userId,
      category: 'api'
    });
  }

  logApiResponse(method: string, url: string, statusCode: number, duration?: number, context?: LogContext): void {
    this.info('API request completed', {
      ...context,
      method,
      url,
      statusCode,
      duration,
      category: 'api'
    });
  }

  logApiError(error: Error, method: string, url: string, context?: LogContext): void {
    this.error('API request failed', {
      ...context,
      method,
      url,
      error: error.message,
      stack: error.stack,
      category: 'api'
    });
  }

  // Cache-specific logging methods
  logCacheOperation(operation: 'get' | 'set' | 'delete' | 'clear', key: string, hit?: boolean, context?: LogContext): void {
    this.debug('Cache operation', {
      ...context,
      operation,
      key,
      hit,
      category: 'cache'
    });
  }

  logCacheError(error: Error, operation: string, key?: string, context?: LogContext): void {
    this.warn('Cache operation failed', {
      ...context,
      operation,
      key,
      error: error.message,
      category: 'cache'
    });
  }

  // Performance monitoring
  logPerformance(operation: string, duration: number, context?: LogContext): void {
    this.info('Performance metric', {
      ...context,
      operation,
      duration,
      category: 'performance'
    });
  }

  // Security logging
  logSecurityEvent(event: string, userId?: string, details?: Record<string, unknown>, context?: LogContext): void {
    this.warn('Security event', {
      ...context,
      event,
      userId,
      details,
      category: 'security'
    });
  }

  // Create child logger with additional context
  child(context: LogContext): Logger {
    const childLogger = new Logger({
      level: this.level,
      format: this.format,
      transports: this.transports,
      metadata: { ...this.defaultContext, ...context }
    });

    return childLogger;
  }
}

// Create default logger instance
const isDevelopment = import.meta.env.MODE === 'development';
const isTest = import.meta.env.MODE === 'test';

const defaultLogger = new Logger({
  level: isDevelopment ? LogLevel.DEBUG : isTest ? LogLevel.ERROR : LogLevel.INFO,
  format: isDevelopment ? 'simple' : 'json',
  transports: [
    {
      type: 'console',
      options: {
        colorize: isDevelopment,
        prettyPrint: isDevelopment
      }
    }
  ]
});

// Export singleton instance and class
export const logger = defaultLogger;
export { Logger };
export default logger;
