import bcrypt from 'bcryptjs';

// Security constants
export const SECURITY_CONFIG = {
  PASSWORD: {
    MIN_LENGTH: 12,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    COMMON_PASSWORDS: [
      'password', '123456', '12345678', '123456789', '12345',
      'qwerty', 'abc123', 'password1', 'admin', 'welcome',
      'letmein', 'monkey', 'dragon', 'baseball', 'football'
    ]
  },
  RATE_LIMITING: {
    MAX_ATTEMPTS: 5,
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    LOCKOUT_DURATION: 30 * 60 * 1000 // 30 minutes
  },
  SESSION: {
    INACTIVITY_TIMEOUT: 15 * 60 * 1000, // 15 minutes
    ABSOLUTE_TIMEOUT: 8 * 60 * 60 * 1000, // 8 hours
    MAX_SESSIONS_PER_USER: 3
  }
};

// Password validation
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  score: number; // 0-100
}

export function validatePassword(password: string, userInfo?: { name?: string; email?: string }): PasswordValidationResult {
  const errors: string[] = [];
  let score = 100;

  // Length check
  if (password.length < SECURITY_CONFIG.PASSWORD.MIN_LENGTH) {
    errors.push(`Password must be at least ${SECURITY_CONFIG.PASSWORD.MIN_LENGTH} characters long`);
    score -= 30;
  }

  if (password.length > SECURITY_CONFIG.PASSWORD.MAX_LENGTH) {
    errors.push(`Password must be less than ${SECURITY_CONFIG.PASSWORD.MAX_LENGTH} characters`);
    score -= 10;
  }

  // Character requirements
  if (SECURITY_CONFIG.PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
    score -= 15;
  }

  if (SECURITY_CONFIG.PASSWORD.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
    score -= 15;
  }

  if (SECURITY_CONFIG.PASSWORD.REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
    score -= 15;
  }

  if (SECURITY_CONFIG.PASSWORD.REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
    score -= 15;
  }

  // Common password check
  const lowerPassword = password.toLowerCase();
  if (SECURITY_CONFIG.PASSWORD.COMMON_PASSWORDS.includes(lowerPassword)) {
    errors.push('Password is too common');
    score -= 50;
  }

  // Personal information check
  if (userInfo) {
    if (userInfo.name && lowerPassword.includes(userInfo.name.toLowerCase())) {
      errors.push('Password cannot contain your name');
      score -= 25;
    }
    if (userInfo.email) {
      const emailParts = userInfo.email.split('@')[0].toLowerCase();
      if (lowerPassword.includes(emailParts)) {
        errors.push('Password cannot contain your email');
        score -= 25;
      }
    }
  }

  // Pattern checks
  if (/(\w)\1{2,}/.test(password)) {
    errors.push('Password cannot contain repeating characters');
    score -= 10;
  }

  if (/123|234|345|456|567|678|789|890|098|987|876|765|654|543|432|321|210/.test(password)) {
    errors.push('Password cannot contain sequential numbers');
    score -= 10;
  }

  // Keyboard patterns
  if (/qwerty|asdfgh|zxcvbn/.test(lowerPassword)) {
    errors.push('Password cannot contain keyboard patterns');
    score -= 15;
  }

  return {
    isValid: errors.length === 0,
    errors,
    score: Math.max(0, score)
  };
}

// Rate limiting
interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lockedUntil?: number;
}

export class RateLimiter {
  private storageKey: string;

  constructor(key: string) {
    this.storageKey = `rate_limit_${key}`;
  }

  private getEntries(): Map<string, RateLimitEntry> {
    const data = localStorage.getItem(this.storageKey);
    return data ? new Map(JSON.parse(data)) : new Map();
  }

  private saveEntries(entries: Map<string, RateLimitEntry>): void {
    localStorage.setItem(this.storageKey, JSON.stringify([...entries]));
  }

  isAllowed(identifier: string): boolean {
    const entries = this.getEntries();
    const entry = entries.get(identifier);
    const now = Date.now();

    if (!entry) {
      return true;
    }

    // Check if locked out
    if (entry.lockedUntil && now < entry.lockedUntil) {
      return false;
    }

    // Reset if window has passed
    if (now - entry.firstAttempt > SECURITY_CONFIG.RATE_LIMITING.WINDOW_MS) {
      entries.delete(identifier);
      this.saveEntries(entries);
      return true;
    }

    return entry.attempts < SECURITY_CONFIG.RATE_LIMITING.MAX_ATTEMPTS;
  }

  recordAttempt(identifier: string): boolean {
    const entries = this.getEntries();
    const now = Date.now();
    let entry = entries.get(identifier);

    if (!entry) {
      entry = {
        attempts: 1,
        firstAttempt: now
      };
    } else {
      // Reset if window has passed
      if (now - entry.firstAttempt > SECURITY_CONFIG.RATE_LIMITING.WINDOW_MS) {
        entry = {
          attempts: 1,
          firstAttempt: now
        };
      } else {
        entry.attempts++;

        // Lock if max attempts reached
        if (entry.attempts >= SECURITY_CONFIG.RATE_LIMITING.MAX_ATTEMPTS) {
          entry.lockedUntil = now + SECURITY_CONFIG.RATE_LIMITING.LOCKOUT_DURATION;
        }
      }
    }

    entries.set(identifier, entry);
    this.saveEntries(entries);

    return entry.attempts < SECURITY_CONFIG.RATE_LIMITING.MAX_ATTEMPTS;
  }

  getRemainingAttempts(identifier: string): number {
    const entries = this.getEntries();
    const entry = entries.get(identifier);
    const now = Date.now();

    if (!entry || now - entry.firstAttempt > SECURITY_CONFIG.RATE_LIMITING.WINDOW_MS) {
      return SECURITY_CONFIG.RATE_LIMITING.MAX_ATTEMPTS;
    }

    return Math.max(0, SECURITY_CONFIG.RATE_LIMITING.MAX_ATTEMPTS - entry.attempts);
  }

  getLockoutTimeRemaining(identifier: string): number {
    const entries = this.getEntries();
    const entry = entries.get(identifier);
    const now = Date.now();

    if (!entry || !entry.lockedUntil) {
      return 0;
    }

    return Math.max(0, entry.lockedUntil - now);
  }

  cleanup(): void {
    const entries = this.getEntries();
    const now = Date.now();

    for (const [key, entry] of entries) {
      // Remove expired entries
      if (now - entry.firstAttempt > SECURITY_CONFIG.RATE_LIMITING.WINDOW_MS * 2) {
        entries.delete(key);
      }
    }

    this.saveEntries(entries);
  }
}

// Session management enhancements
export interface EnhancedSession {
  token: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
  lastActivity: string;
  ipAddress?: string;
  userAgent?: string;
}

export class SessionManager {
  private static readonly SESSIONS_KEY = 'admin_sessions';
  private static readonly CURRENT_SESSION_KEY = 'admin_current_session';

  static getAllSessions(): EnhancedSession[] {
    const data = localStorage.getItem(this.SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  }

  static saveSessions(sessions: EnhancedSession[]): void {
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
  }

  static createSession(userId: string, ipAddress?: string, userAgent?: string): EnhancedSession {
    const sessions = this.getAllSessions();
    const now = new Date();

    // Remove expired sessions
    const activeSessions = sessions.filter(s => new Date(s.expiresAt) > now);

    // Enforce max sessions per user
    const userSessions = activeSessions.filter(s => s.userId === userId);
    if (userSessions.length >= SECURITY_CONFIG.SESSION.MAX_SESSIONS_PER_USER) {
      // Remove oldest session
      const oldestSession = userSessions.reduce((oldest, current) =>
        new Date(current.createdAt) < new Date(oldest.createdAt) ? current : oldest
      );
      const index = activeSessions.findIndex(s => s.token === oldestSession.token);
      if (index > -1) {
        activeSessions.splice(index, 1);
      }
    }

    const session: EnhancedSession = {
      token: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
      userId,
      createdAt: now.toISOString(),
      lastActivity: now.toISOString(),
      expiresAt: new Date(now.getTime() + SECURITY_CONFIG.SESSION.ABSOLUTE_TIMEOUT).toISOString(),
      ipAddress,
      userAgent
    };

    activeSessions.push(session);
    this.saveSessions(activeSessions);

    // Set as current session
    localStorage.setItem(this.CURRENT_SESSION_KEY, session.token);

    return session;
  }

  static getCurrentSession(): EnhancedSession | null {
    const currentToken = localStorage.getItem(this.CURRENT_SESSION_KEY);
    if (!currentToken) return null;

    const sessions = this.getAllSessions();
    const session = sessions.find(s => s.token === currentToken);

    if (!session || new Date(session.expiresAt) < new Date()) {
      this.logout();
      return null;
    }

    return session;
  }

  static updateActivity(): void {
    const session = this.getCurrentSession();
    if (session) {
      session.lastActivity = new Date().toISOString();
      const sessions = this.getAllSessions();
      const index = sessions.findIndex(s => s.token === session.token);
      if (index > -1) {
        sessions[index] = session;
        this.saveSessions(sessions);
      }
    }
  }

  static extendSession(): boolean {
    const session = this.getCurrentSession();
    if (!session) return false;

    const now = new Date();
    const lastActivity = new Date(session.lastActivity);

    // Check if session is still active
    if (now.getTime() - lastActivity.getTime() > SECURITY_CONFIG.SESSION.INACTIVITY_TIMEOUT) {
      this.logout();
      return false;
    }

    // Extend session
    session.expiresAt = new Date(now.getTime() + SECURITY_CONFIG.SESSION.ABSOLUTE_TIMEOUT).toISOString();
    const sessions = this.getAllSessions();
    const index = sessions.findIndex(s => s.token === session.token);
    if (index > -1) {
      sessions[index] = session;
      this.saveSessions(sessions);
    }

    return true;
  }

  static logout(): void {
    const currentToken = localStorage.getItem(this.CURRENT_SESSION_KEY);
    if (currentToken) {
      const sessions = this.getAllSessions();
      const filteredSessions = sessions.filter(s => s.token !== currentToken);
      this.saveSessions(filteredSessions);
      localStorage.removeItem(this.CURRENT_SESSION_KEY);
    }
  }

  static logoutAllSessions(userId: string): void {
    const sessions = this.getAllSessions();
    const filteredSessions = sessions.filter(s => s.userId !== userId);
    this.saveSessions(filteredSessions);
    localStorage.removeItem(this.CURRENT_SESSION_KEY);
  }

  static cleanup(): void {
    const sessions = this.getAllSessions();
    const now = new Date();
    const activeSessions = sessions.filter(s => new Date(s.expiresAt) > now);
    this.saveSessions(activeSessions);
  }
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - for production, consider using DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=["'][^"']*["']/gi, '');
}

// Security event logging
export interface SecurityEvent {
  type: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'SESSION_EXPIRED';
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  details?: any;
}

export function logSecurityEvent(event: SecurityEvent): void {
  const events: SecurityEvent[] = JSON.parse(localStorage.getItem('security_events') || '[]');
  events.push(event);

  // Keep only last 1000 events
  if (events.length > 1000) {
    events.splice(0, events.length - 1000);
  }

  localStorage.setItem('security_events', JSON.stringify(events));
}