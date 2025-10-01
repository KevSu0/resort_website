import jwt from 'jsonwebtoken';
import { securityConfig } from '../config/environment';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  siteId?: string;
  brandId: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JWTService {
  private static readonly ACCESS_TOKEN_EXPIRES_IN = '15m';
  private static readonly REFRESH_TOKEN_EXPIRES_IN = '7d';

  /**
   * Generate an access token for user authentication
   */
  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, securityConfig.jwtSecret, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
      issuer: 'resort-backend',
      audience: 'resort-admin',
    });
  }

  /**
   * Generate a refresh token for session management
   */
  static generateRefreshToken(userId: string, sessionId: string): string {
    return jwt.sign(
      {
        userId,
        sessionId,
        type: 'refresh',
      },
      securityConfig.jwtSecret,
      {
        expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
        issuer: 'resort-backend',
        audience: 'resort-admin',
      }
    );
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokenPair(
    payload: Omit<JWTPayload, 'iat' | 'exp'>,
    sessionId: string
  ): TokenPair {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload.userId, sessionId);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Verify and decode an access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, securityConfig.jwtSecret, {
        issuer: 'resort-backend',
        audience: 'resort-admin',
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Verify and decode a refresh token
   */
  static verifyRefreshToken(token: string): { userId: string; sessionId: string } {
    try {
      const decoded = jwt.verify(token, securityConfig.jwtSecret, {
        issuer: 'resort-backend',
        audience: 'resort-admin',
      }) as any;

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token type');
      }

      return {
        userId: decoded.userId,
        sessionId: decoded.sessionId,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      } else {
        throw new Error('Refresh token verification failed');
      }
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Get token expiration date
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Check if token will expire within the given time window (in seconds)
   */
  static isTokenExpiringSoon(token: string, windowSeconds: number = 300): boolean {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return true;

    const now = new Date();
    const timeUntilExpiration = expiration.getTime() - now.getTime();
    const windowMilliseconds = windowSeconds * 1000;

    return timeUntilExpiration <= windowMilliseconds;
  }
}