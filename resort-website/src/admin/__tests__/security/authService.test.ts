import { authService } from '../../services/authService';
import { validatePassword, SECURITY_CONFIG } from '../../utils/security';

// Mock crypto
Object.defineProperty(window, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid',
  },
});

// Mock navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'test-user-agent',
  },
});

describe('AuthService', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    authService.resetRateLimiter();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('Authentication', () => {
    it('should login successfully with valid credentials', async () => {
      // Create a test user
      await authService.createUser({
        username: 'test@example.com',
        email: 'test@example.com',
        name: 'Test User',
        password: 'SecurePass!4815',
        role: 'ADMIN',
      });

      // Attempt login
      const result = await authService.login({
        username: 'test@example.com',
        password: 'SecurePass!4815',
      });

      expect(result).toBeTruthy();
      expect(result?.user.username).toBe('test@example.com');
      expect(result?.user.role).toBe('ADMIN');
    });

    it('should fail login with invalid password', async () => {
      // Create a test user
      await authService.createUser({
        username: 'test@example.com',
        email: 'test@example.com',
        name: 'Test User',
        password: 'SecurePass!4815',
        role: 'ADMIN',
      });

      // Attempt login with wrong password
      const result = await authService.login({
        username: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(result).toBeNull();
    });

    it('should fail login with non-existent user', async () => {
      const result = await authService.login({
        username: 'nonexistent@example.com',
        password: 'SecurePass!4815',
      });

      expect(result).toBeNull();
    });

    it('should rate limit login attempts and lock account', async () => {
      const username = 'ratelimit@example.com';
      await authService.createUser({
        username: username,
        email: username,
        name: 'Rate Limit User',
        password: 'SecurePass!4815',
        role: 'ADMIN',
      });

      const { MAX_ATTEMPTS } = SECURITY_CONFIG.RATE_LIMITING;

      // Perform MAX_ATTEMPTS - 1 failed logins
      for (let i = 0; i < MAX_ATTEMPTS - 1; i++) {
        const result = await authService.login({
          username,
          password: 'wrongpassword',
        });
        expect(result).toBeNull();
      }

      // The MAX_ATTEMPTS attempt should fail and throw the "too many attempts" error
      await expect(
        authService.login({
          username,
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Account locked due to too many failed attempts.');

      // The next attempt should fail and throw the "try again later" error
      await expect(
        authService.login({
          username,
          password: 'wrongpassword',
        })
      ).rejects.toThrow(/Account locked. Try again in \d+ minutes./);
    });
  });

  describe('User Management', () => {
    it('should create user with valid password', async () => {
      const user = await authService.createUser({
        username: 'test@example.com',
        email: 'test@example.com',
        name: 'Test User',
        password: 'AnotherSecurePass!4815',
        role: 'ADMIN',
      });

      expect(user.id).toBeDefined();
      expect(user.username).toBe('test@example.com');
      expect(user.role).toBe('ADMIN');
    });

    it('should reject user with weak password', async () => {
      await expect(authService.createUser({
        username: 'test@example.com',
        email: 'test@example.com',
        name: 'Test User',
        password: 'weak',
        role: 'ADMIN',
      })).rejects.toThrow('Password is too weak. Please choose a stronger password.');
    });

    it('should update user information', async () => {
      const user = await authService.createUser({
        username: 'update@example.com',
        email: 'update@example.com',
        name: 'Update User',
        password: 'SecurePass!4815',
        role: 'ADMIN',
      });
      const result = authService.updateUser(user.id, { name: 'Updated Name' });
      expect(result).toBe(true);
      const updatedUser = authService.getAllUsers().find(u => u.id === user.id);
      expect(updatedUser?.name).toBe('Updated Name');
    });

    it('should delete a user', async () => {
      const user = await authService.createUser({
        username: 'delete@example.com',
        email: 'delete@example.com',
        name: 'Delete User',
        password: 'SecurePass!4815',
        role: 'ADMIN',
      });
      const result = authService.deleteUser(user.id);
      expect(result).toBe(true);
      const deletedUser = authService.getAllUsers().find(u => u.id === user.id);
      expect(deletedUser).toBeUndefined();
    });

    it('should not delete a non-existent user', () => {
        const result = authService.deleteUser('non-existent-id');
        expect(result).toBe(false);
    });
  });

  describe('Password Validation', () => {
    it('should validate strong password', () => {
      const result = validatePassword('ThisIsAVerySecure_Password!9816', {
        name: 'Some User',
        email: 'some.user@example.com',
      });

      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(80);
    });

    it('should reject password with personal info', () => {
      const result = validatePassword('MyPasswordIs Test User 1!', {
        name: 'Test User',
        email: 'another@example.com',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password cannot contain your name');
    });

    it('should reject common passwords', () => {
      const result = validatePassword('password', {
        name: 'A different name',
        email: 'another@example.com',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is too common');
    });

    it('should require minimum length', () => {
      const result = validatePassword('Short1!', {
        name: 'Test User',
        email: 'test@example.com',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 12 characters long');
    });
  });

  describe('Session Management', () => {
    it('should create session on login', async () => {
      await authService.createUser({
        username: 'test@example.com',
        email: 'test@example.com',
        name: 'Test User',
        password: 'SecurePass!4815',
        role: 'ADMIN',
      });

      const result = await authService.login({
        username: 'test@example.com',
        password: 'SecurePass!4815',
      });

      expect(result?.session.token).toBeDefined();
      expect(result?.session.userId).toBeDefined();
      expect(result?.session.expiresAt).toBeDefined();
    });

    it('should get current session', async () => {
      // Implementation would go here
    });

    it('should logout user', () => {
      // Implementation would go here
    });

    it('should check authentication status', () => {
      // Implementation would go here
    });
  });

  describe('Password Change', () => {
    it('should change password successfully', async () => {
      const user = await authService.createUser({
        username: 'test@example.com',
        email: 'test@example.com',
        name: 'Test User',
        password: 'OldSecurePassword!4815',
        role: 'ADMIN',
      });

      const result = await authService.changePassword(
        user.id,
        'OldSecurePassword!4815',
        'NewSecurePassword!9816'
      );

      expect(result).toBe(true);
    });

    it('should reject password change with wrong current password', async () => {
      const user = await authService.createUser({
        username: 'test@example.com',
        email: 'test@example.com',
        name: 'Test User',
        password: 'OldSecurePassword!4815',
        role: 'ADMIN',
      });

      await expect(authService.changePassword(
        user.id,
        'wrongpassword',
        'NewSecurePassword!9816'
      )).resolves.toBe(false);
    });

    it('should reject password change with same password', async () => {
      const user = await authService.createUser({
        username: 'test@example.com',
        email: 'test@example.com',
        name: 'Test User',
        password: 'SameSecurePassword!4815',
        role: 'ADMIN',
      });

      await expect(authService.changePassword(
        user.id,
        'SameSecurePassword!4815',
        'SameSecurePassword!4815'
      )).rejects.toThrow('New password must be different from current password');
    });
  });
});
