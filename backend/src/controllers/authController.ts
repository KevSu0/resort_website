import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { JWTService, TokenPair } from '../services/jwt';
import { PasswordService } from '../services/password';
import { getUserPermissions } from '../middleware/rbac';

const prisma = new PrismaClient();

// In-memory store for failed login attempts (in production, use Redis)
const failedLoginAttempts = new Map<string, { count: number; lastAttempt: Date; lockedUntil?: Date }>();

// Account lockout settings
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

interface LoginRequest {
  email: string;
  password: string;
  siteId?: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    brandId: string;
    siteIds: string[];
    permissions: string[];
    emailVerified: boolean;
  };
  tokens?: TokenPair;
  session?: {
    id: string;
    expiresAt: string;
  };
}

/**
 * Check if account is locked due to failed login attempts
 */
const isAccountLocked = (email: string): boolean => {
  const attempts = failedLoginAttempts.get(email);
  if (!attempts) return false;

  if (attempts.lockedUntil && attempts.lockedUntil > new Date()) {
    return true;
  }

  // Reset if lockout period has passed
  if (attempts.lockedUntil && attempts.lockedUntil <= new Date()) {
    failedLoginAttempts.delete(email);
  }

  return false;
};

/**
 * Record failed login attempt
 */
const recordFailedAttempt = (email: string): void => {
  const attempts = failedLoginAttempts.get(email) || { count: 0, lastAttempt: new Date() };
  attempts.count++;
  attempts.lastAttempt = new Date();

  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    attempts.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
  }

  failedLoginAttempts.set(email, attempts);
};

/**
 * Clear failed login attempts on successful login
 */
const clearFailedAttempts = (email: string): void => {
  failedLoginAttempts.delete(email);
};

/**
 * Get time remaining for account lockout
 */
const getLockoutTimeRemaining = (email: string): number => {
  const attempts = failedLoginAttempts.get(email);
  if (!attempts?.lockedUntil) return 0;

  const remaining = attempts.lockedUntil.getTime() - Date.now();
  return Math.max(0, Math.floor(remaining / 1000)); // Return in seconds
};

/**
 * User login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, siteId, rememberMe }: LoginRequest = req.body;

    // Input validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required',
        code: 'MISSING_CREDENTIALS',
      } as LoginResponse);
      return;
    }

    // Check account lockout
    if (isAccountLocked(email)) {
      const timeRemaining = getLockoutTimeRemaining(email);
      res.status(429).json({
        success: false,
        message: `Account locked due to too many failed attempts. Try again in ${timeRemaining} seconds.`,
        code: 'ACCOUNT_LOCKED',
        timeRemaining,
      } as LoginResponse);
      return;
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
        siteUsers: {
          include: {
            site: {
              select: {
                id: true,
                name: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      recordFailedAttempt(email);
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
      } as LoginResponse);
      return;
    }

    // Check if user account is active
    if (user.status !== 'ACTIVE') {
      recordFailedAttempt(email);
      res.status(401).json({
        success: false,
        message: 'Account is not active',
        code: 'ACCOUNT_INACTIVE',
      } as LoginResponse);
      return;
    }

    // Check if brand is active
    if (!user.brand.isActive) {
      recordFailedAttempt(email);
      res.status(401).json({
        success: false,
        message: 'Brand account is not active',
        code: 'BRAND_INACTIVE',
      } as LoginResponse);
      return;
    }

    // Verify password
    const isPasswordValid = await PasswordService.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      recordFailedAttempt(email);
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
      } as LoginResponse);
      return;
    }

    // Check email verification
    if (!user.emailVerified) {
      recordFailedAttempt(email);
      res.status(401).json({
        success: false,
        message: 'Email address not verified. Please check your email.',
        code: 'EMAIL_NOT_VERIFIED',
      } as LoginResponse);
      return;
    }

    // Check site access if siteId is provided
    let accessibleSites = user.siteUsers.filter((su: any) => su.site.isActive && su.isActive);
    let selectedSiteId = siteId;

    if (siteId) {
      const siteAccess = accessibleSites.find((su: any) => su.siteId === siteId);
      if (!siteAccess) {
        recordFailedAttempt(email);
        res.status(401).json({
          success: false,
          message: 'Access denied to specified site',
          code: 'SITE_ACCESS_DENIED',
        } as LoginResponse);
        return;
      }
    } else if (accessibleSites.length > 0) {
      // Auto-select first available site
      selectedSiteId = accessibleSites[0].siteId;
    } else {
      // Check if user has brand-level access
      const hasBrandAccess = ['BRAND_ADMIN', 'SUPER_ADMIN'].includes(user.role);
      if (!hasBrandAccess) {
        recordFailedAttempt(email);
        res.status(401).json({
          success: false,
          message: 'No site access available',
          code: 'NO_SITE_ACCESS',
        } as LoginResponse);
        return;
      }
    }

    // Clear failed attempts on successful authentication
    clearFailedAttempts(email);

    // Create session
    const sessionExpiresAt = rememberMe
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress,
        expiresAt: sessionExpiresAt,
        isActive: true,
      },
    });

    // Get site role if site access is granted
    const siteRole = selectedSiteId
      ? accessibleSites.find((su: any) => su.siteId === selectedSiteId)?.role
      : undefined;

    // Generate JWT tokens
    const tokenPayload: any = {
      userId: user.id,
      email: user.email,
      role: user.role,
      brandId: user.brandId,
      sessionId: session.id,
    };

    if (selectedSiteId) {
      tokenPayload.siteId = selectedSiteId;
    }

    const tokens = JWTService.generateTokenPair(tokenPayload, session.id);

    // Get user permissions
    const permissions = getUserPermissions(user.role, siteRole);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log successful login
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    console.log(`User logged in: ${user.email} from ${clientIp}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        brandId: user.brandId,
        siteIds: accessibleSites.map((su: any) => su.siteId),
        permissions,
        emailVerified: user.emailVerified,
      },
      tokens,
      session: {
        id: session.id,
        expiresAt: session.expiresAt.toISOString(),
      },
    } as LoginResponse);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login',
      code: 'LOGIN_ERROR',
    } as LoginResponse);
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required',
        code: 'REFRESH_TOKEN_REQUIRED',
      });
      return;
    }

    // Verify refresh token
    const tokenData = JWTService.verifyRefreshToken(refreshToken);

    // Find session
    const session = await prisma.session.findUnique({
      where: {
        id: tokenData.sessionId,
      },
      include: {
        user: {
          include: {
            brand: {
              select: { isActive: true },
            },
            siteUsers: {
              include: {
                site: {
                  select: { id: true, isActive: true },
                },
              },
            },
          },
        },
      },
    });

    if (!session || !session.isActive) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired session',
        code: 'SESSION_INVALID',
      });
      return;
    }

    // Check if session has expired
    if (new Date() > session.expiresAt) {
      res.status(401).json({
        success: false,
        message: 'Session expired',
        code: 'SESSION_EXPIRED',
      });
      return;
    }

    // Check if user account is still active
    if (session.user.status !== 'ACTIVE' || !session.user.brand.isActive) {
      res.status(401).json({
        success: false,
        message: 'User account is not active',
        code: 'ACCOUNT_INACTIVE',
      });
      return;
    }

    // Get active site access
    const accessibleSites = session.user.siteUsers.filter((su: any) => su.site.isActive && su.isActive);
    const selectedSiteId = accessibleSites.find((su: any) => su.siteId === session.user.siteIds[0])?.siteId;

    // Get site role
    const siteRole = selectedSiteId
      ? accessibleSites.find((su: any) => su.siteId === selectedSiteId)?.role
      : undefined;

    // Generate new access token
    const tokenPayload: any = {
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
      brandId: session.user.brandId,
      sessionId: session.id,
    };

    if (selectedSiteId) {
      tokenPayload.siteId = selectedSiteId;
    }

    const newAccessToken = JWTService.generateAccessToken(tokenPayload);

    // Update session activity
    await prisma.session.update({
      where: { id: session.id },
      data: { updatedAt: new Date() },
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error('Token refresh error:', error);

    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        res.status(401).json({
          success: false,
          message: 'Refresh token has expired',
          code: 'REFRESH_TOKEN_EXPIRED',
        });
        return;
      }

      if (error.message.includes('invalid')) {
        res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
          code: 'REFRESH_TOKEN_INVALID',
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
      code: 'REFRESH_ERROR',
    });
  }
};

/**
 * User logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const sessionId = req.session?.id;

    if (sessionId) {
      // Deactivate session
      await prisma.session.update({
        where: { id: sessionId },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });
    }

    // If refresh token is provided, mark it as used (in production, you might want to maintain a blacklist)
    if (refreshToken) {
      try {
        // Verify refresh token to get session info
        const tokenData = JWTService.verifyRefreshToken(refreshToken);

        // Deactivate the session associated with the refresh token
        await prisma.session.update({
          where: { id: tokenData.sessionId },
          data: {
            isActive: false,
            updatedAt: new Date(),
          },
        });
      } catch (error) {
        // Refresh token is invalid, but that's okay for logout
        console.log('Invalid refresh token provided during logout:', error);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout',
      code: 'LOGOUT_ERROR',
    });
  }
};

/**
 * Get current user info
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        brandId: true,
        emailVerified: true,
        lastLoginAt: true,
        preferences: true,
        createdAt: true,
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        siteUsers: {
          include: {
            site: {
              select: {
                id: true,
                name: true,
                slug: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
      return;
    }

    // Get active sites
    const activeSites = user.siteUsers.filter((su: any) => su.site.isActive && su.isActive);

    // Get current site role
    const userSiteId = req.user?.siteId;
    const currentSiteRole = userSiteId
      ? activeSites.find((su: any) => su.siteId === userSiteId)?.role
      : undefined;

    // Get permissions
    const permissions = getUserPermissions(user.role, currentSiteRole);

    res.status(200).json({
      success: true,
      user: {
        ...user,
        siteUsers: activeSites,
        permissions,
        currentSiteId: req.user?.siteId,
        currentSiteRole,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information',
      code: 'GET_USER_ERROR',
    });
  }
};