import { NextFunction, Request, Response } from 'express';
import { InputSanitizer } from '../utils/sanitizer';
import { useState } from 'react';

// Middleware configuration
export interface SanitizationMiddlewareOptions {
  // Fields to skip sanitization
  skipFields?: string[];
  // Fields that contain HTML
  htmlFields?: string[];
  // Whether to sanitize URL parameters
  sanitizeQuery?: boolean;
  // Whether to sanitize request body
  sanitizeBody?: boolean;
  // Whether to sanitize response data
  sanitizeResponse?: boolean;
  // Custom field sanitizers
  fieldSanitizers?: Record<string, (value: any) => any>;
  // Enable threat detection
  enableThreatDetection?: boolean;
  // Action to take on threat detection
  onThreatDetected?: (threats: string[], req: Request) => void;
}

// Default options
const DEFAULT_OPTIONS: Required<SanitizationMiddlewareOptions> = {
  skipFields: ['password', 'currentPassword', 'newPassword', 'token', 'secret', 'apiKey'],
  htmlFields: [
    'description', 'content', 'notes', 'terms', 'message', 'comment',
    'bio', 'about', 'summary', 'details', 'richText'
  ],
  sanitizeQuery: true,
  sanitizeBody: true,
  sanitizeResponse: false,
  fieldSanitizers: {},
  enableThreatDetection: true,
  onThreatDetected: (threats, req) => {
    console.warn(`Security threats detected: ${threats.join(', ')}`, {
      path: req.path,
      method: req.method,
      ip: req.ip
    });
  }
};

/**
 * Express middleware for input sanitization
 */
export function createSanitizationMiddleware(options: SanitizationMiddlewareOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  return function sanitizationMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
      // Sanitize query parameters
      if (config.sanitizeQuery && req.query) {
        req.query = sanitizeQueryParams(req.query, config);
      }

      // Sanitize request body
      if (config.sanitizeBody && req.body) {
        req.body = sanitizeRequestBody(req.body, config);
      }

      // Override res.json to sanitize response
      if (config.sanitizeResponse) {
        const originalJson = res.json;
        res.json = function(body) {
          const sanitized = sanitizeRequestBody(body, config);
          return originalJson.call(this, sanitized);
        };
      }

      next();
    } catch (error) {
      console.error('Sanitization middleware error:', error);
      next(error);
    }
  };
}

/**
 * Sanitize query parameters
 */
function sanitizeQueryParams(query: any, config: Required<SanitizationMiddlewareOptions>): any {
  const result: any = {};

  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string') {
      // Query parameters are always plain text
      result[key] = InputSanitizer.sanitizeText(value);

      // Check for threats
      if (config.enableThreatDetection) {
        const threats = InputSanitizer.detectThreats(value);
        if (threats.threats.length > 0) {
          config.onThreatDetected(threats.threats, { path: '', method: 'GET' } as any);
        }
      }
    } else if (Array.isArray(value)) {
      result[key] = value.map(v =>
        typeof v === 'string' ? InputSanitizer.sanitizeText(v) : v
      );
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Sanitize request body
 */
function sanitizeRequestBody(body: any, config: Required<SanitizationMiddlewareOptions>): any {
  if (typeof body !== 'object' || body === null) {
    return body;
  }

  return InputSanitizer.sanitizeObject(body, {
    sanitizeKeys: true,
    skipKeys: config.skipFields,
    htmlFields: config.htmlFields
  });
}

/**
 * React Hook for form input sanitization
 */
export function useSanitizedInput<T = string>(
  initialValue: T,
  options: {
    type?: 'text' | 'html' | 'email' | 'phone' | 'number' | 'url' | 'json';
    enableThreatDetection?: boolean;
    onThreatDetected?: (threats: string[]) => void;
  } = {}
): [
  T,
  (value: T) => void,
  { threats: string[]; hasThreats: boolean }
] {
  const {
    type = 'text',
    enableThreatDetection = true,
    onThreatDetected = console.warn
  } = options;

  const [value, setValue] = useState<T>(initialValue);
  const [threats, setThreats] = useState<string[]>([]);

  const sanitizeValue = (input: any): T => {
    if (typeof input !== 'string') {
      return input;
    }

    let sanitized: string;

    switch (type) {
      case 'html':
        sanitized = InputSanitizer.sanitizeHtml(input);
        break;
      case 'email':
        sanitized = InputSanitizer.sanitizeEmail(input);
        break;
      case 'phone':
        sanitized = InputSanitizer.sanitizePhone(input);
        break;
      case 'number':
        sanitized = String(InputSanitizer.sanitizeNumber(input));
        break;
      case 'url':
        sanitized = InputSanitizer.sanitizeUrl(input);
        break;
      case 'json':
        sanitized = JSON.stringify(InputSanitizer.sanitizeJson(input));
        break;
      default:
        sanitized = InputSanitizer.sanitizeText(input);
    }

    return sanitized as T;
  };

  const setValueWithSanitization = (input: T) => {
    const sanitized = sanitizeValue(input);

    // Check for threats if enabled
    if (enableThreatDetection && typeof sanitized === 'string') {
      const threatDetection = InputSanitizer.detectThreats(sanitized);
      setThreats(threatDetection.threats);

      if (threatDetection.threats.length > 0) {
        onThreatDetected(threatDetection.threats);
      }
    } else {
      setThreats([]);
    }

    setValue(sanitized);
  };

  return [
    value,
    setValueWithSanitization,
    {
      threats,
      hasThreats: threats.length > 0
    }
  ];
}

/**
 * Higher-order component for sanitizing props
 */
export function withSanitizedProps<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    skipProps?: string[];
    htmlProps?: string[];
  } = {}
) {
  return function SanitizedComponent(props: P) {
    const sanitizedProps = InputSanitizer.sanitizeObject(props, {
      sanitizeKeys: false,
      skipKeys: options.skipProps,
      htmlFields: options.htmlProps
    });

    return <Component {...sanitizedProps as P} />;
  };
}

/**
 * Sanitize file upload metadata
 */
export function sanitizeFileMetadata(file: File): {
  name: string;
  type: string;
  size: number;
  lastModified: number;
} {
  return {
    name: InputSanitizer.sanitizeText(file.name),
    type: InputSanitizer.sanitizeText(file.type),
    size: file.size,
    lastModified: file.lastModified
  };
}

/**
 * Sanitize error messages
 */
export function sanitizeErrorMessage(error: any): string {
  let message = 'An error occurred';

  if (typeof error === 'string') {
    message = error;
  } else if (error?.message) {
    message = error.message;
  } else if (error?.toString) {
    message = error.toString();
  }

  return InputSanitizer.sanitizeText(message);
}