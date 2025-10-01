import bcrypt from 'bcryptjs';
import { securityConfig } from '../config/environment';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export class PasswordService {
  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(securityConfig.bcryptRounds);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Verify a password against its hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error('Failed to verify password');
    }
  }

  /**
   * Validate password strength according to security requirements
   */
  static validatePasswordStrength(password: string): PasswordValidationResult {
    const errors: string[] = [];

    // Minimum length requirement
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    // Maximum length requirement
    if (password.length > 128) {
      errors.push('Password must not exceed 128 characters');
    }

    // Uppercase letter requirement
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Lowercase letter requirement
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Number requirement
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // Special character requirement
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Common password patterns to avoid
    if (this.isCommonPassword(password)) {
      errors.push('Password is too common. Please choose a more secure password');
    }

    // Check for sequential characters
    if (this.hasSequentialChars(password)) {
      errors.push('Password should not contain sequential characters');
    }

    // Check for repeated characters
    if (this.hasRepeatedChars(password)) {
      errors.push('Password should not contain too many repeated characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if password is commonly used (basic check)
   */
  private static isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password',
      '123456',
      '123456789',
      'qwerty',
      'abc123',
      'password123',
      'admin',
      'letmein',
      'welcome',
      'monkey',
      '1234567890',
      'password1',
      '123123',
      'qwerty123',
      'password!',
      'admin123',
    ];

    const lowercasedPassword = password.toLowerCase();
    return commonPasswords.some(common =>
      lowercasedPassword.includes(common) || common.includes(lowercasedPassword)
    );
  }

  /**
   * Check for sequential characters (123, abc, etc.)
   */
  private static hasSequentialChars(password: string): boolean {
    const sequences = [
      '0123456789',
      'abcdefghijklmnopqrstuvwxyz',
      'qwertyuiop',
      'asdfghjkl',
      'zxcvbnm',
    ];

    const lowercasedPassword = password.toLowerCase();

    for (const sequence of sequences) {
      for (let i = 0; i <= sequence.length - 3; i++) {
        const seq = sequence.substring(i, i + 3);
        if (lowercasedPassword.includes(seq)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check for repeated characters (aaa, 111, etc.)
   */
  private static hasRepeatedChars(password: string): boolean {
    // Check for 3 or more consecutive identical characters
    const repeatedPattern = /(.)\1\1/;
    return repeatedPattern.test(password);
  }

  /**
   * Generate a secure random password
   */
  static generateSecurePassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const allChars = uppercase + lowercase + numbers + special;
    let password = '';

    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password to avoid predictable patterns
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  /**
   * Generate a password reset token
   */
  static generateResetToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }
    return token;
  }

  /**
   * Generate email verification token
   */
  static generateEmailVerificationToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }
    return token;
  }
}