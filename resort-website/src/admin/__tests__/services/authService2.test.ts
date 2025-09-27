import { authService as authServiceSingleton } from '../../services/authService';
import { SECURITY_CONFIG, SessionManager } from '../../utils/security';

type AuthServiceType = typeof authServiceSingleton;

describe('AuthService Extended', () => {
  let authService: AuthServiceType;

  beforeEach(() => {
    jest.resetModules();
    authService = authServiceSingleton;

    localStorage.clear();
    jest.clearAllMocks();
    jest.useRealTimers();

    // Mock console.error to suppress expected error messages
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should handle corrupted user data in localStorage', () => {
    // Since the AuthService class is not exported, we can't test it directly
    // But we can verify the error handling behavior
    const backup = localStorage.getItem('admin_users');

    // Set corrupted data
    localStorage.setItem('admin_users', 'not-a-valid-json');

    // The error should be caught and handled gracefully
    // authService should still work with empty users array
    expect(authService.getAllUsers()).toEqual([]);

    // Restore original data
    if (backup) {
      localStorage.setItem('admin_users', backup);
    } else {
      localStorage.removeItem('admin_users');
    }
  });

  it('should return null from getCurrentSession if session is expired due to inactivity', async () => {
    jest.useFakeTimers();
    const user = { username: 'test@example.com', email: 'test@example.com', name: 'Test User', password: 'StrongerPassword1!', role: 'ADMIN' as const};
    await authService.createUser(user);
    await authService.login({username: user.username, password: user.password});

    // Fast-forward past the inactivity timeout
    jest.advanceTimersByTime(SECURITY_CONFIG.SESSION.INACTIVITY_TIMEOUT + 1);

    expect(authService.getCurrentSession()).toBeNull();
  });

  it('should return null from getCurrentUser if no session exists', () => {
    expect(authService.getCurrentUser()).toBeNull();
  });

  it('should handle extendSession when no session exists', () => {
    expect(() => authService.extendSession()).not.toThrow();
  });

  it('should not update a non-existent user', () => {
    const result = authService.updateUser('non-existent-id', { name: 'New Name' });
    expect(result).toBe(false);
  });

  it('should register a new user successfully', async () => {
    const newUser = {
      name: 'New Registered User',
      email: 'register@example.com',
      password: 'A-Very-Secure-Password1!',
    };
    const user = await authService.register(newUser);
    expect(user).toBeDefined();
    expect(user.username).toBe(newUser.email);
  });

  it('should throw an error when registering a user that already exists', async () => {
    const existingUser = {
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'A-Very-Secure-Password1!',
    };
    await authService.register(existingUser);
    await expect(authService.register(existingUser)).rejects.toThrow(
      'User with this email already exists'
    );
  });

  it('should throw an error when registering with a weak password', async () => {
    const weakPasswordUser = {
      name: 'Weak PW User',
      email: 'weakpw@example.com',
      password: 'weak',
    };
    await expect(authService.register(weakPasswordUser)).rejects.toThrow(
      'Password is too weak. Please choose a stronger password.'
    );
  });

  it('should throw an error when registering with a low score password', async () => {
    const lowScoreUser = {
        name: 'qwerty',
        email: 'lowscore@example.com',
        password: 'MyPasswordIsQwerty!123',
    };
    await expect(authService.register(lowScoreUser)).rejects.toThrow(
        'Password is too weak. Please choose a stronger password.'
    );
  });

  it('should not change password for a non-existent user', async () => {
    const result = await authService.changePassword(
      'non-existent-id',
      'old-pw',
      'new-pw'
    );
    expect(result).toBe(false);
  });

  it('should return false for isSetupComplete if not set', () => {
    expect(authService.isSetupComplete()).toBe(false);
  });

  it('should redact password hashes when getting all users', async () => {
    await authService.createUser({
      username: 'test@example.com',
      email: 'test@example.com',
      name: 'Test User',
      password: 'StrongerPassword1!',
      role: 'ADMIN',
    });
    const users = authService.getAllUsers();
    expect(users[0].passwordHash).toBe('[REDACTED]');
  });

  it('should handle logout when no session exists', () => {
    expect(() => authService.logout()).not.toThrow();
  });

  it('should return a user when a valid session exists', async () => {
    // Clear any existing session
    localStorage.clear();

    // Remove all existing users
    const existingUsers = authService.getAllUsers();
    existingUsers.forEach(user => {
      authService.deleteUser(user.id);
    });

    const user = await authService.createUser({
        username: 'test-session@example.com', // Use unique username
        email: 'test-session@example.com',
        name: 'Test Session User',
        password: 'StrongerPassword1!',
        role: 'ADMIN',
      });

    await authService.login({username: 'test-session@example.com', password: 'StrongerPassword1!'});

    const currentUser = authService.getCurrentUser();
    expect(currentUser).toBeDefined();
    expect(currentUser?.id).toBe(user.id);
  });

  it('should throw error when creating user with a weak password (low score)', async () => {
    const userData = {
      username: 'test@example.com',
      email: 'test@example.com',
      name: 'qwerty',
      password: 'MyPasswordIsQwerty!123',
      role: 'ADMIN' as const,
    };
    await expect(authService.createUser(userData)).rejects.toThrow('Password is too weak. Please choose a stronger password.');
  });

  it('should handle getUserAgent when navigator is undefined', async () => {
    const originalNavigator = window.navigator;
    Object.defineProperty(window, 'navigator', {
        value: undefined,
        configurable: true,
    });

    const user = await authService.createUser({
        username: 'no-nav@example.com',
        email: 'no-nav@example.com',
        name: 'No Nav User',
        password: 'StrongerPassword1!',
        role: 'ADMIN',
    });
    await authService.login({ username: user.username, password: user.password });

    const sessions = SessionManager.getAllSessions();
    expect(sessions[0].userAgent).toBe('Unknown');

    // Restore navigator
    Object.defineProperty(window, 'navigator', {
        value: originalNavigator,
        configurable: true,
    });
  });

  it('should throw error when changing to an invalid new password', async () => {
    const user = await authService.createUser({
        username: 'changepw-invalid@example.com',
        email: 'changepw-invalid@example.com',
        name: 'Change PW Invalid',
        password: 'OldSecurePassword1!',
        role: 'ADMIN',
    });
    await expect(authService.changePassword(user.id, 'OldSecurePassword1!', 'invalid-pw')).rejects.toThrow('New password is too weak. Please choose a stronger password.');
  });

  it('should be authenticated after login', async () => {
      const user = await authService.createUser({
        username: 'isauth@example.com',
        email: 'isauth@example.com',
        name: 'Is Auth',
        password: 'StrongerPassword1!',
        role: 'ADMIN',
      });
      await authService.login({ username: user.username, password: user.password });
      expect(authService.isAuthenticated()).toBe(true);
  });

  it('should not be authenticated after logout', async () => {
    const user = await authService.createUser({
        username: 'isauth-logout@example.com',
        email: 'isauth-logout@example.com',
        name: 'Is Auth Logout',
        password: 'StrongerPassword1!',
        role: 'ADMIN',
      });
      await authService.login({ username: user.username, password: user.password });
      authService.logout();
      expect(authService.isAuthenticated()).toBe(false);
  });

  it('should throw error for invalid password with good score in createUser', async () => {
    const userData = {
        username: 'invalid-good-score@example.com',
        email: 'invalid-good-score@example.com',
        name: 'Test User',
        password: 'Thisislongandgoodpassword!', // No number
        role: 'ADMIN' as const,
    };
    await expect(authService.createUser(userData)).rejects.toThrow('Password requirements not met');
  });

  it('should throw error for invalid password with good score in register', async () => {
    const userData = {
        name: 'Test User',
        email: 'invalid-good-score-reg@example.com',
        password: 'Thisislongandgoodpassword!', // No number
    };
    await expect(authService.register(userData)).rejects.toThrow('Password requirements not met');
  });

  it('should throw error for invalid new password with good score in changePassword', async () => {
    const user = await authService.createUser({
        username: 'changepw-good-score@example.com',
        email: 'changepw-good-score@example.com',
        name: 'Test User',
        password: 'StrongerPassword1!',
        role: 'ADMIN',
    });
    await expect(authService.changePassword(user.id, 'StrongerPassword1!', 'Thisislongandgoodpassword!')).rejects.toThrow('New password requirements not met');
  });
});
