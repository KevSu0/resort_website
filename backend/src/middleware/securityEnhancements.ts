import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Enhanced rate limiting configurations
export const createRateLimit = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes default
    max: options.max || 100, // Default limit
    message: {
      success: false,
      message: options.message || 'Too many requests, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    skipFailedRequests: options.skipFailedRequests || false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        message: options.message || 'Too many requests, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((options.windowMs || 15 * 60 * 1000) / 1000),
      });
    },
  });
};

// Specific rate limiters for different endpoints
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
});

export const passwordResetRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset requests per hour
  message: 'Too many password reset attempts, please try again later.',
});

export const registrationRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registration attempts per hour
  message: 'Too many registration attempts, please try again later.',
});

export const generalApiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests, please try again later.',
});

export const uploadRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: 'Too many upload attempts, please try again later.',
});

// Account lockout service
export class AccountLockoutService {
  private static lockoutData = new Map<string, {
    attempts: number;
    lastAttempt: Date;
    lockedUntil?: Date;
    lockoutLevel: number;
  }>();

  private static readonly MAX_ATTEMPTS = [5, 4, 3]; // Progressive: 5, then 4, then 3
  private static readonly LOCKOUT_DURATIONS = [
    15 * 60 * 1000,  // 15 minutes
    30 * 60 * 1000,  // 30 minutes
    60 * 60 * 1000,  // 1 hour
  ];

  static isLocked(identifier: string): { isLocked: boolean; timeRemaining?: number; level?: number } {
    const data = this.lockoutData.get(identifier);

    if (!data) {
      return { isLocked: false };
    }

    // Check if lockout has expired
    if (data.lockedUntil && data.lockedUntil <= new Date()) {
      this.lockoutData.delete(identifier);
      return { isLocked: false };
    }

    if (data.lockedUntil && data.lockedUntil > new Date()) {
      const timeRemaining = Math.ceil((data.lockedUntil.getTime() - Date.now()) / 1000);
      return {
        isLocked: true,
        timeRemaining,
        level: data.lockoutLevel
      };
    }

    return { isLocked: false };
  }

  static recordFailedAttempt(identifier: string): {
    isLocked: boolean;
    timeRemaining?: number;
    attemptsRemaining?: number;
  } {
    const data = this.lockoutData.get(identifier) || {
      attempts: 0,
      lastAttempt: new Date(),
      lockoutLevel: 0,
    };

    data.attempts++;
    data.lastAttempt = new Date();

    const maxAttempts = this.MAX_ATTEMPTS[Math.min(data.lockoutLevel, this.MAX_ATTEMPTS.length - 1)] || 5;

    if (data.attempts >= maxAttempts) {
      const lockoutDuration = this.LOCKOUT_DURATIONS[Math.min(data.lockoutLevel, this.LOCKOUT_DURATIONS.length - 1)] || 15 * 60 * 1000;
      data.lockedUntil = new Date(Date.now() + lockoutDuration);
      data.lockoutLevel = Math.min(data.lockoutLevel + 1, this.MAX_ATTEMPTS.length);

      this.lockoutData.set(identifier, data);

      return {
        isLocked: true,
        timeRemaining: Math.ceil(lockoutDuration / 1000),
      };
    }

    this.lockoutData.set(identifier, data);

    return {
      isLocked: false,
      attemptsRemaining: maxAttempts - data.attempts,
    };
  }

  static clearFailedAttempts(identifier: string): void {
    this.lockoutData.delete(identifier);
  }

  static getRemainingAttempts(identifier: string): number {
    const data = this.lockoutData.get(identifier);
    if (!data) {
      return this.MAX_ATTEMPTS[0] || 5;
    }

    const maxAttempts = this.MAX_ATTEMPTS[Math.min(data.lockoutLevel, this.MAX_ATTEMPTS.length - 1)] || 5;
    return Math.max(0, maxAttempts - data.attempts);
  }
}

// Input sanitization and validation middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  // Remove potential XSS threats from request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// Recursive sanitization function
function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[sanitizeString(key)] = sanitizeObject(value);
  }

  return sanitized;
}

// String sanitization
function sanitizeString(str: string): string {
  return str
    // Remove potentially dangerous characters
    .replace(/[<>]/g, '')
    // Remove potential script injection attempts
    .replace(/javascript:/gi, '')
    // Remove potential on* event handlers
    .replace(/on\w+=/gi, '')
    // Trim whitespace
    .trim();
}

// IP-based security middleware
export const ipSecurity = (req: Request, res: Response, next: NextFunction): void => {
  const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';

  // Log IP for security monitoring
  console.log(`Request from IP: ${clientIp} for ${req.method} ${req.path}`);

  // Add client IP to request headers for use in other middleware
  req.headers['x-client-ip'] = clientIp as string;

  next();
};

// CORS security middleware
export const corsSecurity = (req: Request, res: Response, next: NextFunction): void => {
  const origin = req.headers.origin;
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];

  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
};

// Request size limiting middleware
export const requestSizeLimit = (maxSize: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = req.headers['content-length'];

    if (contentLength) {
      const sizeInBytes = parseInt(contentLength);
      const maxSizeInBytes = parseSize(maxSize);

      if (sizeInBytes > maxSizeInBytes) {
        res.status(413).json({
          success: false,
          message: 'Request entity too large',
          code: 'PAYLOAD_TOO_LARGE',
          maxSize,
        });
        return;
      }
    }

    next();
  };
};

// Parse size string to bytes
function parseSize(size: string): number {
  const units: Record<string, number> = {
    'b': 1,
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024,
  };

  const match = size.toLowerCase().match(/^(\d+)(b|kb|mb|gb)$/);
  if (!match) {
    throw new Error('Invalid size format');
  }

  const [, amount, unit] = match;
  if (!unit) throw new Error('Invalid size unit');
  // @ts-ignore - TypeScript has issues with indexed access but this is safe
  return parseInt(amount) * (units[unit] || 1);
}

// Security headers middleware using Helmet
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// Suspicious activity detection
export class SuspiciousActivityDetector {
  private static suspiciousIPs = new Map<string, {
    attempts: number;
    lastActivity: Date;
    flaggedAt?: Date;
  }>();

  static recordSuspiciousActivity(ip: string, activity: string): void {
    const data = this.suspiciousIPs.get(ip) || {
      attempts: 0,
      lastActivity: new Date(),
    };

    data.attempts++;
    data.lastActivity = new Date();

    // Flag IP if too many suspicious activities
    if (data.attempts >= 10 && !data.flaggedAt) {
      data.flaggedAt = new Date();
      console.warn(`Suspicious activity detected from IP: ${ip}, Activity: ${activity}`);
    }

    this.suspiciousIPs.set(ip, data);
  }

  static isSuspicious(ip: string): boolean {
    const data = this.suspiciousIPs.get(ip);
    return data ? !!data.flaggedAt : false;
  }

  static clearSuspiciousFlag(ip: string): void {
    const data = this.suspiciousIPs.get(ip);
    if (data) {
      delete data.flaggedAt;
      data.attempts = 0;
    }
  }
}

// Middleware to check for suspicious activity
export const suspiciousActivityCheck = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || req.connection.remoteAddress;

  if (ip && SuspiciousActivityDetector.isSuspicious(ip)) {
    res.status(429).json({
      success: false,
      message: 'Suspicious activity detected. Access temporarily restricted.',
      code: 'SUSPICIOUS_ACTIVITY',
    });
    return;
  }

  next();
};