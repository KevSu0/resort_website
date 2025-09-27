import {
  validatePassword,
  RateLimiter,
  SessionManager,
  sanitizeInput,
  sanitizeHtml,
  logSecurityEvent,
  SECURITY_CONFIG,
} from '../../utils/security';

describe('Security Utils', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('validatePassword', () => {
    it('should reject passwords that are too long', () => {
      const longPassword = 'a'.repeat(SECURITY_CONFIG.PASSWORD.MAX_LENGTH + 1);
      const result = validatePassword(longPassword);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        `Password must be less than ${SECURITY_CONFIG.PASSWORD.MAX_LENGTH} characters`
      );
    });

    it('should reject passwords with repeating characters', () => {
      const result = validatePassword('SecurePaaaassword1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password cannot contain repeating characters');
    });

    it('should reject passwords with sequential numbers', () => {
      const result = validatePassword('SecurePassword123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password cannot contain sequential numbers');
    });

    it('should reject passwords with keyboard patterns', () => {
      const result = validatePassword('qwertyPassword1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password cannot contain keyboard patterns');
    });

    it('should reject passwords containing user email', () => {
      const result = validatePassword('my-email-is-secure1!', {
        name: 'Test User',
        email: 'my-email@example.com',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password cannot contain your email');
    });

    it('should reject passwords containing user name', () => {
      const result = validatePassword('this is mytest userpassword1!', {
        name: 'Test User',
        email: 'email@example.com',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password cannot contain your name');
    });

    it('should reject password without a lowercase letter', () => {
        const result = validatePassword('THISISAPASSWORD1!');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });
  });

  describe('RateLimiter', () => {
    it('should correctly report remaining attempts', () => {
      const limiter = new RateLimiter('test');
      const id = 'test-id';
      expect(limiter.getRemainingAttempts(id)).toBe(SECURITY_CONFIG.RATE_LIMITING.MAX_ATTEMPTS);
      limiter.recordAttempt(id);
      expect(limiter.getRemainingAttempts(id)).toBe(SECURITY_CONFIG.RATE_LIMITING.MAX_ATTEMPTS - 1);
    });

    it('should return 0 for lockout time if not locked', () => {
      const limiter = new RateLimiter('test');
      const id = 'test-id';
      expect(limiter.getLockoutTimeRemaining(id)).toBe(0);
    });

    it('should return lockout time when locked', () => {
      const limiter = new RateLimiter('test');
      const id = 'test-id';
      for (let i = 0; i < SECURITY_CONFIG.RATE_LIMITING.MAX_ATTEMPTS; i++) {
        limiter.recordAttempt(id);
      }
      const lockoutTime = limiter.getLockoutTimeRemaining(id);
      expect(lockoutTime).toBeGreaterThan(0);
      expect(lockoutTime).toBeLessThanOrEqual(SECURITY_CONFIG.RATE_LIMITING.LOCKOUT_DURATION);
    });

    it('should return 0 lockout time for an entry that is not locked', () => {
        const limiter = new RateLimiter('test');
        const id = 'test-id';
        limiter.recordAttempt(id); // 1 attempt, not locked
        expect(limiter.getLockoutTimeRemaining(id)).toBe(0);
    });

    it('should return false from isAllowed when locked', () => {
        const limiter = new RateLimiter('test');
        const id = 'test-id';
        for (let i = 0; i < SECURITY_CONFIG.RATE_LIMITING.MAX_ATTEMPTS; i++) {
          limiter.recordAttempt(id);
        }
        // The account is now locked
        expect(limiter.isAllowed(id)).toBe(false);
      });

    it('should be allowed and reset entry after window has passed', () => {
        jest.useFakeTimers();
        const limiter = new RateLimiter('test');
        const id = 'test-id';
        limiter.recordAttempt(id); // 1 attempt

        // Fast-forward time
        jest.advanceTimersByTime(SECURITY_CONFIG.RATE_LIMITING.WINDOW_MS + 1);

        expect(limiter.isAllowed(id)).toBe(true);
        // The entry should be deleted by the isAllowed call
        const entries = JSON.parse(localStorage.getItem('rate_limit_test') || '[]');
        expect(entries.length).toBe(0);
    });

    it('should reset attempts after window passes', () => {
        jest.useFakeTimers();
        const limiter = new RateLimiter('test');
        const id = 'test-id';
        limiter.recordAttempt(id);
        expect(limiter.getRemainingAttempts(id)).toBe(SECURITY_CONFIG.RATE_LIMITING.MAX_ATTEMPTS - 1);

        // Fast-forward time
        jest.advanceTimersByTime(SECURITY_CONFIG.RATE_LIMITING.WINDOW_MS + 1);

        expect(limiter.getRemainingAttempts(id)).toBe(SECURITY_CONFIG.RATE_LIMITING.MAX_ATTEMPTS);
    });

    it('should cleanup expired entries', () => {
        jest.useFakeTimers();
        const limiter = new RateLimiter('test');
        const id1 = 'test-id-1';
        const id2 = 'test-id-2';

        limiter.recordAttempt(id1);

        // Fast-forward time
        jest.advanceTimersByTime(SECURITY_CONFIG.RATE_LIMITING.WINDOW_MS * 3);
        limiter.recordAttempt(id2);
        limiter.cleanup();

        const entries = JSON.parse(localStorage.getItem('rate_limit_test') || '[]');
        expect(entries.length).toBe(1);
        expect(entries[0][0]).toBe(id2);
    });
  });

  describe('SessionManager', () => {
    it('should create and retrieve a session', () => {
      const session = SessionManager.createSession('user-1');
      const currentSession = SessionManager.getCurrentSession();
      expect(currentSession).toEqual(session);
    });

    it('should return null for expired session', () => {
        jest.useFakeTimers();
        SessionManager.createSession('user-1');

        // Fast-forward time to expire session
        jest.advanceTimersByTime(SECURITY_CONFIG.SESSION.ABSOLUTE_TIMEOUT + 1);

        const currentSession = SessionManager.getCurrentSession();
        expect(currentSession).toBeNull();
    });

    it('should logout and remove session', () => {
      SessionManager.createSession('user-1');
      SessionManager.logout();
      const currentSession = SessionManager.getCurrentSession();
      expect(currentSession).toBeNull();
    });

    it('should logout all sessions for a user', () => {
        SessionManager.createSession('user-1');
        SessionManager.createSession('user-2');
        SessionManager.logoutAllSessions('user-1');
        const sessions = SessionManager.getAllSessions();
        expect(sessions.length).toBe(1);
        expect(sessions[0].userId).toBe('user-2');
    });

    it('should cleanup expired sessions', () => {
        jest.useFakeTimers();
        SessionManager.createSession('user-1');
        jest.advanceTimersByTime(SECURITY_CONFIG.SESSION.ABSOLUTE_TIMEOUT + 1);
        SessionManager.createSession('user-2');
        SessionManager.cleanup();
        const sessions = SessionManager.getAllSessions();
        expect(sessions.length).toBe(1);
        expect(sessions[0].userId).toBe('user-2');
    });

    it('should enforce max sessions per user', () => {
        const userId = 'user-max-sessions';
        for (let i = 0; i < SECURITY_CONFIG.SESSION.MAX_SESSIONS_PER_USER; i++) {
            SessionManager.createSession(userId);
        }
        let sessions = SessionManager.getAllSessions().filter(s => s.userId === userId);
        expect(sessions.length).toBe(SECURITY_CONFIG.SESSION.MAX_SESSIONS_PER_USER);

        // This one should evict the oldest
        SessionManager.createSession(userId);
        sessions = SessionManager.getAllSessions().filter(s => s.userId === userId);
        expect(sessions.length).toBe(SECURITY_CONFIG.SESSION.MAX_SESSIONS_PER_USER);
    });

    it('should extend session if active', () => {
      jest.useFakeTimers();
      const session = SessionManager.createSession('user-1');
      const initialExpiresAt = new Date(session.expiresAt).getTime();

      // Fast-forward time, but not enough to cause inactivity timeout
      jest.advanceTimersByTime(SECURITY_CONFIG.SESSION.INACTIVITY_TIMEOUT - 1);

      const extended = SessionManager.extendSession();
      expect(extended).toBe(true);

      const updatedSession = SessionManager.getCurrentSession();
      const newExpiresAt = new Date(updatedSession!.expiresAt).getTime();
      expect(newExpiresAt).toBeGreaterThan(initialExpiresAt);
    });

    it('should not extend and logout if session is inactive', () => {
        jest.useFakeTimers();
        SessionManager.createSession('user-1');

        // Fast-forward time past inactivity timeout
        jest.advanceTimersByTime(SECURITY_CONFIG.SESSION.INACTIVITY_TIMEOUT + 1);

        const extended = SessionManager.extendSession();
        expect(extended).toBe(false);
        expect(SessionManager.getCurrentSession()).toBeNull();
    });

    it('should update last activity time', () => {
        jest.useFakeTimers();
        const session = SessionManager.createSession('user-1');
        const initialActivity = new Date(session.lastActivity).getTime();

        jest.advanceTimersByTime(10000); // 10 seconds
        SessionManager.updateActivity();

        const updatedSession = SessionManager.getCurrentSession();
        const newActivity = new Date(updatedSession!.lastActivity).getTime();
        expect(newActivity).toBeGreaterThan(initialActivity);
    });

    it('should not do anything when updating activity for a non-existent session', () => {
        expect(() => SessionManager.updateActivity()).not.toThrow();
    });

    it('should not extend a non-existent session', () => {
        expect(SessionManager.extendSession()).toBe(false);
    });

    it('should handle logoutAllSessions when current session belongs to the user', () => {
        const user1 = 'user-1';
        const user2 = 'user-2';
        SessionManager.createSession(user1); // This will be the current session
        SessionManager.createSession(user2);

        SessionManager.logoutAllSessions(user1);

        expect(SessionManager.getCurrentSession()).toBeNull();
        const sessions = SessionManager.getAllSessions();
        expect(sessions.length).toBe(1);
        expect(sessions[0].userId).toBe(user2);
    });

    it('should explicitly evict the oldest session to cover the branch', () => {
        jest.useFakeTimers();
        const userId = 'user-eviction-test';
        const sessionsToCreate = SECURITY_CONFIG.SESSION.MAX_SESSIONS_PER_USER;
        let firstSessionToken = '';

        for (let i = 0; i < sessionsToCreate; i++) {
            const session = SessionManager.createSession(userId);
            if (i === 0) {
                firstSessionToken = session.token;
            }
            jest.advanceTimersByTime(1000); // ensure creation timestamps are different
        }

        // This call should evict the first session
        SessionManager.createSession(userId);

        const sessions = SessionManager.getAllSessions();
        const sessionTokens = sessions.map(s => s.token);

        expect(sessions.length).toBe(sessionsToCreate);
        expect(sessionTokens).not.toContain(firstSessionToken);
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize basic input by removing brackets', () => {
      const dirty = '<script>alert("xss")</script> Some text';
      const clean = 'scriptalert("xss")/script Some text';
      expect(sanitizeInput(dirty)).toBe(clean);
    });

    it('should sanitize html input by removing script tags and handlers', () => {
      const dirty = '<p onclick="alert(1)">Click me</p><script>bad</script><iframe></iframe>';
      const clean = '<p >Click me</p>';
      expect(sanitizeHtml(dirty)).toBe(clean);
    });
  });

  describe('SecurityEventLogger', () => {
    it('should log an event to localStorage', () => {
      const event = { type: 'LOGIN_SUCCESS' as const, userId: 'user-1', timestamp: new Date().toISOString() };
      logSecurityEvent(event);
      const events = JSON.parse(localStorage.getItem('security_events') || '[]');
      expect(events.length).toBe(1);
      expect(events[0].type).toBe('LOGIN_SUCCESS');
    });

    it('should trim the log to 1000 events', () => {
      for (let i = 0; i < 1005; i++) {
        logSecurityEvent({ type: 'LOGOUT', timestamp: new Date().toISOString() });
      }
      const events = JSON.parse(localStorage.getItem('security_events') || '[]');
      expect(events.length).toBe(1000);
    });
  });
});
