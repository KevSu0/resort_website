// Advanced input sanitization utilities

// XSS prevention patterns
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^>]*>/gi,
  /<applet\b[^>]*>/gi,
  /<form\b[^>]*>/gi,
  /<input\b[^>]*>/gi,
  /<meta\b[^>]*>/gi,
  /<link\b[^>]*>/gi,
  /expression\s*\(/gi,
  /vbscript:/gi,
  /data:text\/html/gi,
  /data:text\/javascript/gi
];

// SQL injection patterns
const SQL_INJECTION_PATTERNS = [
  /(\s|^)(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|UNION|WHERE|OR|AND)(\s|$)/gi,
  /['"]\s*OR\s*['"]1['"]\s*=\s*['"]1/i,
  /['"]\s*AND\s*['"]1['"]\s*=\s*['"]1/i,
  /['"]\s*;\s*DROP/i,
  /['"]\s*;\s*--/i,
  /\/\*.*\*\//g,
  /--.*$/gm,
  /xp_cmdshell/i,
  /sp_executesql/i,
  /WAITFOR\s+DELAY/i,
  /BULK\s+INSERT/i
];

// Path traversal patterns
const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//g,
  /\.\.\\/g,
  /~\//g,
  /~\\/g,
  /\.\//g,
  /\.\.\\/
];

// Command injection patterns
const COMMAND_INJECTION_PATTERNS = [
  /[;&|`$(){}[\]<>\n\r]/g,
  /\/bin\/sh/gi,
  /cmd\.exe/gi,
  /powershell\.exe/gi,
  /bash/gi,
  /sh\s+-c/gi,
  /eval\s*\(/gi,
  /exec\s*\(/gi,
  /system\s*\(/gi,
  /shell_exec\s*\(/gi,
  /passthru\s*\(/gi,
  /popen\s*\(/gi
];

// Sanitization options
export interface SanitizeOptions {
  allowHtml?: boolean;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  stripComments?: boolean;
  preserveFormatting?: boolean;
}

// Default allowed tags for rich text
const DEFAULT_ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'i', 'b', 'u', 's', 'del', 'ins',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'blockquote', 'pre', 'code',
  'a', 'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'div', 'span'
];

// Default allowed attributes
const DEFAULT_ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'title', 'target'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  p: ['class'],
  div: ['class'],
  span: ['class'],
  code: ['class'],
  pre: ['class']
};

export class InputSanitizer {
  /**
   * Sanitize plain text input
   */
  static sanitizeText(input: string): string {
    if (typeof input !== 'string') return '';

    // Remove control characters except newlines and tabs
    let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Escape HTML entities
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    // Remove potential XSS patterns
    XSS_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Trim whitespace
    sanitized = sanitized.trim();

    // Normalize multiple spaces
    sanitized = sanitized.replace(/\s+/g, ' ');

    return sanitized;
  }

  /**
   * Sanitize HTML content
   */
  static sanitizeHtml(html: string, options: SanitizeOptions = {}): string {
    if (typeof html !== 'string') return '';

    const {
      allowHtml = true,
      allowedTags = DEFAULT_ALLOWED_TAGS,
      allowedAttributes = DEFAULT_ALLOWED_ATTRIBUTES,
      stripComments = true,
      preserveFormatting = true
    } = options;

    if (!allowHtml) {
      return this.sanitizeText(html);
    }

    let sanitized = html;

    // Remove HTML comments
    if (stripComments) {
      sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, '');
    }

    // Remove dangerous tags and attributes
    XSS_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // If preserving formatting, apply more lenient sanitization
    if (preserveFormatting) {
      // Remove script tags and their content
      sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

      // Remove inline event handlers
      sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

      // Remove javascript: URLs
      sanitized = sanitized.replace(/javascript\s*:\s*[^\s]*/gi, '');
    } else {
      // Strict sanitization - remove all HTML tags
      sanitized = this.sanitizeText(sanitized);
    }

    return sanitized.trim();
  }

  /**
   * Sanitize SQL input
   */
  static sanitizeSql(input: string): string {
    if (typeof input !== 'string') return '';

    let sanitized = input;

    // Remove SQL injection patterns
    SQL_INJECTION_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, match => match.replace(/[^a-zA-Z0-9\s]/g, ''));
    });

    // Escape special characters
    sanitized = sanitized.replace(/'/g, "''");
    sanitized = sanitized.replace(/"/g, '""');

    return sanitized.trim();
  }

  /**
   * Sanitize file path
   */
  static sanitizePath(path: string): string {
    if (typeof path !== 'string') return '';

    let sanitized = path;

    // Remove path traversal patterns
    PATH_TRAVERSAL_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Normalize path separators
    sanitized = sanitized.replace(/[/\\]+/g, '/');

    // Remove leading/trailing slashes
    sanitized = sanitized.replace(/^\/+|\/+$/g, '');

    return sanitized;
  }

  /**
   * Sanitize URL
   */
  static sanitizeUrl(url: string): string {
    if (typeof url !== 'string') return '';

    try {
      // Try to parse as URL
      new URL(url);

      // Remove javascript: protocol
      url = url.replace(/^javascript:/i, '');

      // Remove potentially dangerous characters
      url = url.replace(/[\s<>"']/g, '');

      return url;
    } catch {
      // If not a valid URL, treat as relative path
      return this.sanitizePath(url);
    }
  }

  /**
   * Sanitize email address
   */
  static sanitizeEmail(email: string): string {
    if (typeof email !== 'string') return '';

    // Remove potentially dangerous characters
    let sanitized = email.toLowerCase().trim();

    // Remove control characters
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

    // Remove quotes and other potentially problematic characters
    sanitized = sanitized.replace(/["'`]/g, '');

    // Basic email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(sanitized)) {
      return '';
    }

    return sanitized;
  }

  /**
   * Sanitize phone number
   */
  static sanitizePhone(phone: string): string {
    if (typeof phone !== 'string') return '';

    // Remove all non-digit characters except + and -
    let sanitized = phone.replace(/[^\d+-]/g, '');

    // Remove multiple consecutive non-digit characters
    sanitized = sanitized.replace(/[+-]{2,}/g, '');

    // Ensure starts with + for international numbers
    if (sanitized.startsWith('-')) {
      sanitized = sanitized.substring(1);
    }

    return sanitized.trim();
  }

  /**
   * Sanitize numeric input
   */
  static sanitizeNumber(input: string | number): number {
    if (typeof input === 'number') {
      return isNaN(input) ? 0 : input;
    }

    // Remove non-numeric characters except decimal point and minus
    const sanitized = input.replace(/[^\d.-]/g, '');

    const parsed = parseFloat(sanitized);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Sanitize integer input
   */
  static sanitizeInteger(input: string | number): number {
    const num = this.sanitizeNumber(input);
    return Math.floor(num);
  }

  /**
   * Sanitize boolean input
   */
  static sanitizeBoolean(input: any): boolean {
    if (typeof input === 'boolean') return input;

    if (typeof input === 'string') {
      const lower = input.toLowerCase().trim();
      return ['true', '1', 'yes', 'on'].includes(lower);
    }

    return Boolean(input);
  }

  /**
   * Sanitize JSON input
   */
  static sanitizeJson(input: string): any {
    try {
      const parsed = JSON.parse(input);

      // Recursively sanitize all string values
      const sanitizeObject = (obj: any): any => {
        if (typeof obj === 'string') {
          return this.sanitizeText(obj);
        } else if (Array.isArray(obj)) {
          return obj.map(sanitizeObject);
        } else if (obj && typeof obj === 'object') {
          const result: any = {};
          for (const [key, value] of Object.entries(obj)) {
            // Sanitize object keys as well
            const sanitizedKey = this.sanitizeText(key);
            result[sanitizedKey] = sanitizeObject(value);
          }
          return result;
        }
        return obj;
      };

      return sanitizeObject(parsed);
    } catch {
      return null;
    }
  }

  /**
   * Sanitize command line arguments
   */
  static sanitizeCommand(input: string): string {
    if (typeof input !== 'string') return '';

    let sanitized = input;

    // Remove command injection patterns
    COMMAND_INJECTION_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Escape shell metacharacters
    sanitized = sanitized.replace(/([;&|`$(){}[\]<>\n\r])/g, '\\$1');

    return sanitized.trim();
  }

  /**
   * Bulk sanitize an object
   */
  static sanitizeObject(obj: Record<string, any>, options: {
    sanitizeKeys?: boolean;
    skipKeys?: string[];
    htmlFields?: string[];
  } = {}): Record<string, any> {
    const {
      sanitizeKeys = true,
      skipKeys = ['password', 'token', 'secret', 'key'],
      htmlFields = ['description', 'content', 'notes', 'terms']
    } = options;

    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      // Skip sensitive keys
      if (skipKeys.includes(key.toLowerCase())) {
        result[sanitizeKeys ? this.sanitizeText(key) : key] = '[REDACTED]';
        continue;
      }

      const sanitizedKey = sanitizeKeys ? this.sanitizeText(key) : key;

      if (typeof value === 'string') {
        // Use HTML sanitization for HTML fields
        if (htmlFields.includes(key.toLowerCase())) {
          result[sanitizedKey] = this.sanitizeHtml(value);
        } else {
          result[sanitizedKey] = this.sanitizeText(value);
        }
      } else if (Array.isArray(value)) {
        result[sanitizedKey] = value.map(item => {
          if (typeof item === 'string') {
            return htmlFields.includes(key.toLowerCase())
              ? this.sanitizeHtml(item)
              : this.sanitizeText(item);
          }
          return item;
        });
      } else if (value && typeof value === 'object') {
        result[sanitizedKey] = this.sanitizeObject(value, options);
      } else {
        result[sanitizedKey] = value;
      }
    }

    return result;
  }

  /**
   * Check if input contains potential security threats
   */
  static detectThreats(input: string): {
    hasXss: boolean;
    hasSqlInjection: boolean;
    hasPathTraversal: boolean;
    hasCommandInjection: boolean;
    threats: string[];
  } {
    const threats: string[] = [];
    let hasXss = false;
    let hasSqlInjection = false;
    let hasPathTraversal = false;
    let hasCommandInjection = false;

    // Check for XSS
    XSS_PATTERNS.forEach(pattern => {
      if (pattern.test(input)) {
        hasXss = true;
        threats.push('XSS attack detected');
      }
    });

    // Check for SQL injection
    SQL_INJECTION_PATTERNS.forEach(pattern => {
      if (pattern.test(input)) {
        hasSqlInjection = true;
        threats.push('SQL injection detected');
      }
    });

    // Check for path traversal
    PATH_TRAVERSAL_PATTERNS.forEach(pattern => {
      if (pattern.test(input)) {
        hasPathTraversal = true;
        threats.push('Path traversal detected');
      }
    });

    // Check for command injection
    COMMAND_INJECTION_PATTERNS.forEach(pattern => {
      if (pattern.test(input)) {
        hasCommandInjection = true;
        threats.push('Command injection detected');
      }
    });

    return {
      hasXss,
      hasSqlInjection,
      hasPathTraversal,
      hasCommandInjection,
      threats: [...new Set(threats)]
    };
  }
}