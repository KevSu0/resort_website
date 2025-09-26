import { authService } from '../../services/authService';
import { validatePassword } from '../../utils/security';

// Mock localStorage
const mockLocalStorage = {
  data: {} as Record<string, string>,
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
mockLocalStorage.getItem.mockImplementation((key: string) => mockLocalStorage.data[key]);
mockLocalStorage.setItem.mockImplementation((key: string, value: string) => {
  mockLocalStorage.data[key] = value;
});
mockLocalStorage.removeItem.mockImplementation((key: string) => {
  delete mockLocalStorage.data[key];
});
mockLocalStorage.clear.mockImplementation(() => {
  mockLocalStorage.data = {};
});


Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

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
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
    authService.resetRateLimiter();
  });

  describe('Authentication', () => {
    it('should login successfully with valid credentials', async () => {
      // Create a test user
      await authService.createUser({
        username: 'test@example.com',
        email: 'test@example.com',
        name: 'Test User',
        password: 'StrongerPassword1!',
        role: 'ADMIN',
      });

      // Attempt login
      const result = await authService.login({
        username: 'test@example.com',
        password: 'StrongerPassword1!',
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
        password: 'StrongerPassword1!',
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
        password: 'StrongerPassword1!',
      });

      expect(result).toBeNull();
    });

    it('should rate limit login attempts', async () => {
      const username = 'ratelimit@example.com';
      await authService.createUser({
        username: username,
        email: username,
        name: 'Rate Limit User',
        password: 'StrongerPassword1!',
        role: 'ADMIN',
      });

      // Attempt multiple failed logins
      for (let i = 0; i < 5; i++) {
        await authService.login({
          username,
          password: 'wrongpassword',
        });
      }

      // Next attempt should be blocked
      await expect(authService.login({
        username,
        password: 'wrongpassword',
      })).rejects.toThrow(/Account locked/);
    });
  });

  describe('User Management', () => {
    it('should create user with valid password', async () => {
      const user = await authService.createUser({
        username: 'test@example.com',
        email: 'test@example.com',
        name: 'Test User',
        password: 'AnotherSecurePassword1!',
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
      })).rejects.toThrow('Password requirements not met');
    });

    it('should update user information', () => {
      // Implementation would go here
    });

    it('should delete user', () => {
      // Implementation would go here
    });
  });

  describe('Password Validation', () => {
    it('should validate strong password', () => {
      const result = validatePassword('AnotherSecurePassword1!', {
        name: 'Another User',
        email: 'another@example.com',
      });

      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(80);
    });

    it('should reject password with personal info', () => {
      const result = validatePassword('MyPasswordIsTestUser1!', {
        name: 'Test User',
        email: 'another@example.com',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password cannot contain your name');
    });

    it('should reject common passwords', () => {
      const result = validatePassword('password123!', {
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
        password: 'StrongerPassword1!',
        role: 'ADMIN',
      });

      const result = await authService.login({
        username: 'test@example.com',
        password: 'StrongerPassword1!',
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
        password: 'OldSecurePassword1!',
        role: 'ADMIN',
      });

      const result = await authService.changePassword(
        user.id,
        'OldSecurePassword1!',
        'NewSecurePassword1!'
      );

      expect(result).toBe(true);
    });

    it('should reject password change with wrong current password', async () => {
      const user = await authService.createUser({
        username: 'test@example.com',
        email: 'test@example.com',
        name: 'Test User',
        password: 'OldSecurePassword1!',
        role: 'ADMIN',
      });

      await expect(authService.changePassword(
        user.id,
        'wrongpassword',
        'NewSecurePassword1!'
      )).resolves.toBe(false);
    });

    it('should reject password change with same password', async () => {
      const user = await authService.createUser({
        username: 'test@example.com',
        email: 'test@example.com',
        name: 'Test User',
        password: 'SameSecurePassword1!',
        role: 'ADMIN',
      });

      await expect(authService.changePassword(
        user.id,
        'SameSecurePassword1!',
        'SameSecurePassword1!'
      )).rejects.toThrow('New password must be different from current password');
    });
  });
});