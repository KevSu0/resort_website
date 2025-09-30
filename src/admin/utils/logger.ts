// Structured logging utility

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  userId?: string;
  sessionId?: string;
  requestId?: string;
  tags?: string[];
  duration?: number;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LoggerConfig {
  level: LogLevel;
  maxEntries?: number;
  persistToLocalStorage?: boolean;
  enableConsole?: boolean;
  enableStructuredLogging?: boolean;
  context?: Record<string, any>;
}

// Default configuration
const DEFAULT_CONFIG: LoggerConfig = {
  level: 'info',
  maxEntries: 1000,
  persistToLocalStorage: true,
  enableConsole: true,
  enableStructuredLogging: true,
  context: {}
};

// Log levels in order of severity
const LOG_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];
const LOG_LEVEL_VALUES: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  fatal: 50
};

class Logger {
  private _config: LoggerConfig;
  private logs: LogEntry[] = [];
  private storageKey = 'admin_logs';

  constructor(config: Partial<LoggerConfig> = {}) {
    this._config = { ...DEFAULT_CONFIG, ...config };
    this.loadLogs();
  }

  get config(): LoggerConfig {
    return this._config;
  }

  private loadLogs(): void {
    if (this._config.persistToLocalStorage) {
      try {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          this.logs = JSON.parse(stored);
        }
      } catch (error) {
        console.error('Failed to load logs from localStorage:', error);
      }
    }
  }

  private saveLogs(): void {
    if (this._config.persistToLocalStorage) {
      try {
        // Keep only the most recent logs
        const trimmedLogs = this.logs.slice(-this._config.maxEntries!);
        localStorage.setItem(this.storageKey, JSON.stringify(trimmedLogs));
      } catch (error) {
        console.error('Failed to save logs to localStorage:', error);
      }
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_VALUES[level] >= LOG_LEVEL_VALUES[this._config.level];
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error | { name: string; message: string; stack?: string }
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: {
        ...this._config.context,
        ...context
      }
    };

    if (error) {
      entry.error = {
        name: error.name || 'UnknownError',
        message: error.message || 'Unknown error occurred',
        stack: error.stack,
        code: (error as any).code
      };
    }

    // Add user context if available
    try {
      const session = localStorage.getItem('admin_current_session');
      if (session) {
        entry.sessionId = session;
      }
    } catch {
      // Ignore localStorage access errors
    }

    return entry;
  }

  private logToConsole(entry: LogEntry): void {
    if (!this._config.enableConsole) return;

    const consoleMethod = entry.level === 'fatal' ? 'error' : entry.level;
    const args: any[] = [entry.message];

    if (entry.context && Object.keys(entry.context).length > 0) {
      args.push('\nContext:', entry.context);
    }

    if (entry.error) {
      args.push('\nError:', entry.error);
    }

     
    console[consoleMethod](...args);
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    this.logToConsole(entry);
    this.saveLogs();

    // Keep logs in memory under limit
    if (this.logs.length > this._config.maxEntries!) {
      this.logs = this.logs.slice(-this._config.maxEntries!);
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('debug')) {
      this.addLog(this.createLogEntry('debug', message, context));
    }
  }

  info(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('info')) {
      this.addLog(this.createLogEntry('info', message, context));
    }
  }

  warn(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('warn')) {
      this.addLog(this.createLogEntry('warn', message, context));
    }
  }

  error(message: string, error?: Error | { name: string; message: string; stack?: string }, context?: Record<string, any>): void {
    if (this.shouldLog('error')) {
      this.addLog(this.createLogEntry('error', message, context, error));
    }
  }

  fatal(message: string, error?: Error | { name: string; message: string; stack?: string }, context?: Record<string, any>): void {
    if (this.shouldLog('fatal')) {
      this.addLog(this.createLogEntry('fatal', message, context, error));
    }
  }

  // Performance logging
  time(label: string): void {
    performance.mark(`logger:${label}:start`);
  }

  timeEnd(label: string, context?: Record<string, any>): void {
    try {
      performance.mark(`logger:${label}:end`);
      performance.measure(`logger:${label}`, `logger:${label}:start`, `logger:${label}:end`);
      const measures = performance.getEntriesByName(`logger:${label}`);
      const duration = measures[0]?.duration || 0;
      performance.clearMarks(`logger:${label}:start`);
      performance.clearMarks(`logger:${label}:end`);
      performance.clearMeasures(`logger:${label}`);

      this.info(`Timer: ${label}`, { ...context, duration: Math.round(duration) });
    } catch (error) {
      this.error(`Failed to measure time for label: ${label}`, error as Error);
    }
  }

  // Get logs with filtering
  getLogs(options?: {
    level?: LogLevel;
    limit?: number;
    since?: Date;
    tags?: string[];
    userId?: string;
  }): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (options) {
      if (options.level) {
        filteredLogs = filteredLogs.filter(log => log.level === options.level);
      }

      if (options.since) {
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= options.since!);
      }

      if (options.tags && options.tags.length > 0) {
        filteredLogs = filteredLogs.filter(log =>
          log.tags?.some(tag => options.tags!.includes(tag))
        );
      }

      if (options.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === options.userId);
      }
    }

    if (options?.limit) {
      filteredLogs = filteredLogs.slice(-options.limit);
    }

    return filteredLogs.reverse(); // Most recent first
  }

  // Export logs
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    const logs = this.getLogs();

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    }

    if (format === 'csv') {
      const headers = ['timestamp', 'level', 'message', 'context', 'error'];
      const rows = logs.map(log => [
        log.timestamp,
        log.level,
        log.message.replace(/"/g, '""'),
        JSON.stringify(log.context || {}).replace(/"/g, '""'),
        JSON.stringify(log.error || {}).replace(/"/g, '""')
      ]);

      return [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    }

    return '';
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
    if (this._config.persistToLocalStorage) {
      localStorage.removeItem(this.storageKey);
    }
  }

  // Get log statistics
  getStats(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    oldestLog?: string;
    newestLog?: string;
  } {
    const byLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      fatal: 0
    };

    this.logs.forEach(log => {
      byLevel[log.level]++;
    });

    return {
      total: this.logs.length,
      byLevel,
      oldestLog: this.logs[0]?.timestamp,
      newestLog: this.logs[this.logs.length - 1]?.timestamp
    };
  }

  // Update configuration
  updateConfig(config: Partial<LoggerConfig>): void {
    this._config = { ...this._config, ...config };
  }
}

// Create default logger instance
export const logger = new Logger();

// Create a child logger with additional context
export function createChildLogger(context: Record<string, any>, config?: Partial<LoggerConfig>): Logger {
  return new Logger({
    ...config,
    context: {
      ...logger.config.context,
      ...context
    }
  });
}

// Performance measurement decorator
export function logPerformance(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const label = `${target.constructor.name}.${propertyKey}`;
    logger.time(label);

    try {
      const result = await method.apply(this, args);
      logger.timeEnd(label, { args: args.length });
      return result;
    } catch (error) {
      logger.timeEnd(label, { args: args.length, error: true });
      throw error;
    }
  };
}

// Error logging utility
export function logError(error: Error, context?: Record<string, any>): void {
  logger.error(error.message, error, context);
}

// Unhandled error handlers
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    logger.error('Unhandled error', event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', {
      name: 'UnhandledRejection',
      message: event.reason?.message || String(event.reason),
      stack: event.reason?.stack
    } as Error);
  });
}