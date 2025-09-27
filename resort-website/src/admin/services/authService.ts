import { type AdminUser, type LoginCredentials, type Session } from '../types/admin';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import {
  validatePassword,
  RateLimiter,
  SessionManager,
  logSecurityEvent,
  type SecurityEvent,
  sanitizeInput
} from '../utils/security';

const ADMIN_USERS_KEY = 'admin_users';
const SESSION_KEY = 'admin_session';
const SESSION_DURATION = 15 * 60 * 1000; // 15 minutes

class AuthService {
  private users: AdminUser[] = [];
  public loginRateLimiter: RateLimiter;

  constructor() {
    this.loadUsers();
    this.loginRateLimiter = new RateLimiter('login_attempts');
    SessionManager.cleanup();
    this.loginRateLimiter.cleanup();

    // Create default admin user in development if no users exist
    if (this.users.length === 0 && process.env.NODE_ENV === 'development') {
      this.createDefaultAdmin();
    }
  }

  private loadUsers(): void {
    const usersData = localStorage.getItem(ADMIN_USERS_KEY);
    if (usersData) {
      try {
        this.users = JSON.parse(usersData);
      } catch (error) {
        console.error('Failed to load admin users:', error);
        this.users = [];
      }
    }
  }

  private saveUsers(): void {
    localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(this.users));
  }

  
  async login(credentials: LoginCredentials): Promise<{ user: AdminUser; session: Session } | null> {
    const sanitizedUsername = sanitizeInput(credentials.username);
    const user = this.users.find(u => u.username === sanitizedUsername);

    // Check rate limiting
    if (!this.loginRateLimiter.isAllowed(sanitizedUsername)) {
      const lockoutTime = this.loginRateLimiter.getLockoutTimeRemaining(sanitizedUsername);
      throw new Error(`Account locked. Try again in ${Math.ceil(lockoutTime / 60000)} minutes.`);
    }

    if (!user) {
      this.loginRateLimiter.recordAttempt(sanitizedUsername);
      logSecurityEvent({
        type: 'LOGIN_FAILED',
        timestamp: new Date().toISOString(),
        details: { username: sanitizedUsername, reason: 'User not found' }
      });
      return null;
    }

    const isPasswordValid = bcrypt.compareSync(credentials.password, user.passwordHash);
    if (!isPasswordValid) {
      this.loginRateLimiter.recordAttempt(sanitizedUsername);
      const remainingAttempts = this.loginRateLimiter.getRemainingAttempts(sanitizedUsername);
      logSecurityEvent({
        type: 'LOGIN_FAILED',
        userId: user.id,
        timestamp: new Date().toISOString(),
        details: { username: sanitizedUsername, reason: 'Invalid password', remainingAttempts }
      });

      if (remainingAttempts === 0) {
        throw new Error('Account locked due to too many failed attempts.');
      }

      return null;
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    this.saveUsers();

    // Create enhanced session
    const enhancedSession = SessionManager.createSession(
      user.id,
      this.getClientIP(),
      this.getUserAgent()
    );

    // Convert to legacy session format for compatibility
    const session: Session = {
      token: enhancedSession.token,
      userId: enhancedSession.userId,
      expiresAt: enhancedSession.expiresAt,
    };

    logSecurityEvent({
      type: 'LOGIN_SUCCESS',
      userId: user.id,
      timestamp: new Date().toISOString(),
      details: { username: sanitizedUsername }
    });

    return { user, session };
  }

  logout(): void {
    const session = this.getCurrentSession();
    if (session) {
      logSecurityEvent({
        type: 'LOGOUT',
        userId: session.userId,
        timestamp: new Date().toISOString()
      });
    }
    SessionManager.logout();
  }

  getCurrentSession(): Session | null {
    const enhancedSession = SessionManager.getCurrentSession();
    if (!enhancedSession) {
      return null;
    }

    // Check if session expired due to inactivity
    if (!SessionManager.extendSession()) {
      logSecurityEvent({
        type: 'SESSION_EXPIRED',
        userId: enhancedSession.userId,
        timestamp: new Date().toISOString()
      });
      return null;
    }

    // Update activity
    SessionManager.updateActivity();

    // Return legacy format for compatibility
    return {
      token: enhancedSession.token,
      userId: enhancedSession.userId,
      expiresAt: enhancedSession.expiresAt
    };
  }

  getCurrentUser(): AdminUser | null {
    const session = this.getCurrentSession();
    if (!session) {
      return null;
    }

    return this.users.find(u => u.id === session.userId) || null;
  }

  isAuthenticated(): boolean {
    return this.getCurrentSession() !== null;
  }

  extendSession(): void {
    if (!SessionManager.extendSession()) {
      this.logout();
    }
  }

  async createUser(userData: Omit<AdminUser, 'id' | 'createdAt' | 'passwordHash'> & { password: string }): Promise<AdminUser> {
    // Validate password strength
    const passwordValidation = validatePassword(userData.password, {
      name: userData.name,
      email: userData.email
    });

    if (passwordValidation.score < 60) {
      throw new Error('Password is too weak. Please choose a stronger password.');
    }

    if (!passwordValidation.isValid) {
      throw new Error(`Password requirements not met: ${passwordValidation.errors.join(', ')}`);
    }

    const user: AdminUser = {
      ...userData,
      id: uuidv4(),
      passwordHash: bcrypt.hashSync(userData.password, 10),
      createdAt: new Date().toISOString(),
    };

    this.users.push(user);
    this.saveUsers();
    return user;
  }

  updateUser(userId: string, updates: Partial<AdminUser>): boolean {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return false;
    }

    this.users[userIndex] = { ...this.users[userIndex], ...updates, updatedAt: new Date().toISOString() };
    this.saveUsers();
    return true;
  }

  deleteUser(userId: string): boolean {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return false;
    }

    this.users.splice(userIndex, 1);
    this.saveUsers();
    return true;
  }

  async register(userData: { name: string; email: string; password: string }): Promise<AdminUser> {
    // Validate password strength
    const passwordValidation = validatePassword(userData.password, {
      name: userData.name,
      email: userData.email
    });

    if (passwordValidation.score < 60) {
      throw new Error('Password is too weak. Please choose a stronger password.');
    }

    if (!passwordValidation.isValid) {
      throw new Error(`Password requirements not met: ${passwordValidation.errors.join(', ')}`);
    }

    // Check if user already exists
    const sanitizedEmail = sanitizeInput(userData.email);
    if (this.users.some(u => u.username === sanitizedEmail)) {
      throw new Error('User with this email already exists');
    }

    const user: AdminUser = {
      id: uuidv4(),
      username: sanitizedEmail,
      email: sanitizedEmail,
      name: sanitizeInput(userData.name),
      passwordHash: bcrypt.hashSync(userData.password, 10),
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
    };

    this.users.push(user);
    this.saveUsers();
    return user;
  }

  isSetupComplete(): boolean {
    return localStorage.getItem('admin_setup_complete') === 'true';
  }

  getAllUsers(): AdminUser[] {
    return this.users.map(u => ({
      ...u,
      passwordHash: '[REDACTED]'
    }));
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return false;
    }

    const user = this.users[userIndex];

    // Verify current password
    const isCurrentPasswordValid = bcrypt.compareSync(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      logSecurityEvent({
        type: 'LOGIN_FAILED',
        userId,
        timestamp: new Date().toISOString(),
        details: { reason: 'Invalid current password for password change' }
      });
      return false;
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword, {
      name: user.name,
      email: user.email
    });

    if (passwordValidation.score < 60) {
      throw new Error('New password is too weak. Please choose a stronger password.');
    }

    if (!passwordValidation.isValid) {
      throw new Error(`New password requirements not met: ${passwordValidation.errors.join(', ')}`);
    }

    // Check if new password is same as current
    if (bcrypt.compareSync(newPassword, user.passwordHash)) {
      throw new Error('New password must be different from current password');
    }

    // Update password
    this.users[userIndex].passwordHash = bcrypt.hashSync(newPassword, 10);
    this.users[userIndex].updatedAt = new Date().toISOString();
    this.saveUsers();

    // Invalidate all sessions for this user
    SessionManager.logoutAllSessions(userId);

    logSecurityEvent({
      type: 'PASSWORD_CHANGE',
      userId,
      timestamp: new Date().toISOString()
    });

    return true;
  }

  private getClientIP(): string {
    // In a real application, this would come from the request
    // For local storage, we'll use a placeholder
    return '127.0.0.1';
  }

  private getUserAgent(): string {
    // In a real application, this would come from the request
    // For local storage, we'll use a placeholder
    return navigator?.userAgent || 'Unknown';
  }

  resetRateLimiter() {
    this.loginRateLimiter = new RateLimiter('login_attempts');
  }

  private createDefaultAdmin(): void {
    const defaultAdmin: AdminUser = {
      id: uuidv4(),
      username: 'admin',
      email: 'admin@wayanad-nature-resort.local',
      name: 'Default Admin',
      passwordHash: bcrypt.hashSync('Admin123!@#', 10),
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
    };

    this.users.push(defaultAdmin);
    this.saveUsers();

    // Mark setup as complete since we have a default admin
    localStorage.setItem('admin_setup_complete', 'true');

    console.log('Default admin user created:');
    console.log('Username: admin');
    console.log('Password: Admin123!@#');
  }
}

export const authService = new AuthService();