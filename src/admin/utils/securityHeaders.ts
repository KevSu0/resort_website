// Security headers configuration
export const SECURITY_HEADERS = {
  // Frame Options
  'X-Frame-Options': 'DENY',

  // MIME Type Sniffing
  'X-Content-Type-Options': 'nosniff',

  // XSS Protection
  'X-XSS-Protection': '1; mode=block',

  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions Policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',

  // HSTS (for HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Cache Control for sensitive pages
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',

  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' wss: https:",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "require-trusted-types-for 'script'",
    "upgrade-insecure-requests"
  ].join('; ')
} as const;

// CSP Report-Only for development
export const CSP_REPORT_ONLY = {
  'Content-Security-Policy-Report-Only': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'report-sample'",
    "style-src 'self' 'unsafe-inline' 'report-sample'",
    "img-src 'self' data: blob: https: 'report-sample'",
    "font-src 'self' data: 'report-sample'",
    "connect-src 'self' wss: https: 'report-sample'",
    "media-src 'self' 'report-sample'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "require-trusted-types-for 'script'",
    "report-uri /csp-violation-report-endpoint"
  ].join('; ')
};

// Security middleware for Express (if needed)
export function applySecurityHeaders(headers: Record<string, string> = {}): Record<string, string> {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return {
    ...SECURITY_HEADERS,
    // Skip HSTS in development (HTTP)
    ...(isDevelopment ? { 'Strict-Transport-Security': 'max-age=0' } : {}),
    // Add custom headers
    ...headers
  };
}

// Function to validate CSP compliance
export function validateCSPCompliance(content: string, type: 'script' | 'style' | 'img'): boolean {
  const patterns = {
    script: /<script\b[^>]*(?:src=["']([^"']*?)["']|[^>]*>([\s\S]*?)<\/script>)/gi,
    style: /<style\b[^>]*>([\s\S]*?)<\/style>|<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi,
    img: /<img\b[^>]*src=["']([^"']*?)["'][^>]*>/gi
  };

  const matches = content.match(patterns[type]);
  if (!matches) return true;

  for (const match of matches) {
    // Check for external sources
    if (type === 'script' || type === 'img') {
      const srcMatch = match.match(/src=["']([^"']*?)["']/);
      if (srcMatch && srcMatch[1] && !srcMatch[1].startsWith('data:') && !srcMatch[1].startsWith('/')) {
        // Check if it's an allowed external source
        if (!srcMatch[1].startsWith('https:')) {
          return false;
        }
      }
    }

    // Check for inline content
    if (type === 'script' && match.includes('>') && match.includes('</')) {
      // Inline script - check if it's safe
      const inlineContent = match.match(/>([\s\S]*?)<\/script>/)?.[1];
      if (inlineContent && !inlineContent.trim().match(/^(\/\*[\s\S]*?\*\/|\/\/.*$)/m)) {
        // Contains actual code, not just comments
        return false;
      }
    }
  }

  return true;
}

// Generate nonce for CSP
export function generateNonce(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
}

// Apply CSP with nonce
export function getCSPWithNonce(scriptNonce?: string, styleNonce?: string): string {
  const cspParts = [
    "default-src 'self'",
    `script-src 'self' ${scriptNonce ? `'nonce-${scriptNonce}'` : "'unsafe-inline'"} 'unsafe-eval'`,
    `style-src 'self' ${styleNonce ? `'nonce-${styleNonce}'` : "'unsafe-inline'"}`
  ];

  return cspParts.join('; ');
}

// Security header checker
export function checkSecurityHeaders(headers: Record<string, string>): {
  passed: string[];
  failed: string[];
  warnings: string[];
} {
  const passed: string[] = [];
  const failed: string[] = [];
  const warnings: string[] = [];

  // Check each required header
  const requiredHeaders = [
    { key: 'X-Frame-Options', expected: 'DENY' },
    { key: 'X-Content-Type-Options', expected: 'nosniff' },
    { key: 'X-XSS-Protection', expected: '1; mode=block' },
    { key: 'Referrer-Policy', expected: 'strict-origin-when-cross-origin' }
  ];

  for (const { key, expected } of requiredHeaders) {
    if (headers[key] === expected) {
      passed.push(key);
    } else {
      failed.push(`${key}: expected "${expected}", got "${headers[key] || 'missing'}"`);
    }
  }

  // Check CSP
  if (headers['Content-Security-Policy']) {
    const csp = headers['Content-Security-Policy'];
    if (csp.includes("default-src 'self'")) {
      passed.push('CSP default-src');
    } else {
      failed.push('CSP: missing default-src self');
    }

    if (csp.includes("script-src 'self'")) {
      passed.push('CSP script-src');
    } else {
      warnings.push('CSP: script-src could be more restrictive');
    }
  } else {
    failed.push('Content-Security-Policy missing');
  }

  // Check HSTS
  if (headers['Strict-Transport-Security']) {
    const sts = headers['Strict-Transport-Security'];
    if (sts.includes('max-age=31536000')) {
      passed.push('HSTS');
    } else {
      warnings.push('HSTS: duration less than 1 year');
    }
  } else {
    warnings.push('HSTS not set (acceptable for HTTP)');
  }

  return { passed, failed, warnings };
}