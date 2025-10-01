import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { JWTService, JWTPayload } from '../services/jwt';

// Extend Request interface to include user information
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      session?: {
        id: string;
        isActive: boolean;
        expiresAt: Date;
      };
    }
  }
}

const prisma = new PrismaClient();

/**
 * Authentication middleware to verify JWT tokens and set user context
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const token = JWTService.extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'TOKEN_REQUIRED',
      });
      return;
    }

    // Verify and decode the token
    const payload = JWTService.verifyAccessToken(token);

    // Check if session exists and is active
    const session = await prisma.session.findUnique({
      where: {
        id: payload.sessionId,
      },
      include: {
        user: {
          select: {
            id: true,
            status: true,
            emailVerified: true,
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

    // Check if user is active and email is verified
    if (session.user.status !== 'ACTIVE' || !session.user.emailVerified) {
      res.status(401).json({
        success: false,
        message: 'User account is not active or verified',
        code: 'ACCOUNT_INACTIVE',
      });
      return;
    }

    // Set user and session information in request
    req.user = payload;
    req.session = {
      id: session.id,
      isActive: session.isActive,
      expiresAt: session.expiresAt,
    };

    // Update last activity timestamp
    await prisma.session.update({
      where: { id: session.id },
      data: { updatedAt: new Date() },
    });

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        res.status(401).json({
          success: false,
          message: 'Access token has expired',
          code: 'TOKEN_EXPIRED',
        });
        return;
      }

      if (error.message.includes('invalid')) {
        res.status(401).json({
          success: false,
          message: 'Invalid access token',
          code: 'TOKEN_INVALID',
        });
        return;
      }
    }

    res.status(401).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_FAILED',
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token is provided
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = JWTService.extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      // No token provided, continue without authentication
      next();
      return;
    }

    // Try to authenticate but don't fail if it doesn't work
    const payload = JWTService.verifyAccessToken(token);

    const session = await prisma.session.findUnique({
      where: {
        id: payload.sessionId,
      },
      include: {
        user: {
          select: {
            id: true,
            status: true,
            emailVerified: true,
          },
        },
      },
    });

    if (session && session.isActive &&
        new Date() < session.expiresAt &&
        session.user.status === 'ACTIVE' &&
        session.user.emailVerified) {

      req.user = payload;
      req.session = {
        id: session.id,
        isActive: session.isActive,
        expiresAt: session.expiresAt,
      };

      // Update last activity
      await prisma.session.update({
        where: { id: session.id },
        data: { updatedAt: new Date() },
      });
    }

    next();
  } catch (error) {
    // Silently continue without authentication
    next();
  }
};

/**
 * Middleware to check if user has access to a specific site
 */
export const requireSiteAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTH_REQUIRED',
    });
    return;
  }

  // Get siteId from request parameters, query, or body
  const siteId = req.params.siteId ||
                 req.query.siteId as string ||
                 req.body.siteId;

  if (!siteId) {
    res.status(400).json({
      success: false,
      message: 'Site ID is required',
      code: 'SITE_ID_REQUIRED',
    });
    return;
  }

  try {
    // Check if user has access to the site
    const siteUser = await prisma.siteUser.findUnique({
      where: {
        userId_siteId: {
          userId: req.user.userId,
          siteId: siteId,
        },
      },
      include: {
        site: {
          select: {
            id: true,
            isActive: true,
          },
        },
      },
    });

    if (!siteUser || !siteUser.isActive || !siteUser.site.isActive) {
      res.status(403).json({
        success: false,
        message: 'Access denied to this site',
        code: 'SITE_ACCESS_DENIED',
      });
      return;
    }

    // Set site context in request
    req.user.siteId = siteId;

    next();
  } catch (error) {
    console.error('Site access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify site access',
      code: 'SITE_ACCESS_CHECK_FAILED',
    });
  }
};

/**
 * Middleware to check if user has specific role or higher
 */
export const requireMinimumRole = (minimumRole: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    const roleHierarchy = [
      'USER',
      'VIEWER',
      'AUTHOR',
      'EDITOR',
      'SITE_ADMIN',
      'BRAND_ADMIN',
      'SUPER_ADMIN',
    ];

    const userRoleIndex = roleHierarchy.indexOf(req.user.role);
    const requiredRoleIndex = roleHierarchy.indexOf(minimumRole);

    if (userRoleIndex === -1 || requiredRoleIndex === -1 || userRoleIndex < requiredRoleIndex) {
      res.status(403).json({
        success: false,
        message: `Insufficient privileges. Required role: ${minimumRole}`,
        code: 'INSUFFICIENT_PRIVILEGES',
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user is super admin
 */
export const requireSuperAdmin = requireMinimumRole('SUPER_ADMIN');

/**
 * Middleware to check if user is brand admin or higher
 */
export const requireBrandAdmin = requireMinimumRole('BRAND_ADMIN');

/**
 * Middleware to check if user is site admin or higher
 */
export const requireSiteAdmin = requireMinimumRole('SITE_ADMIN');

/**
 * Middleware to check if user is editor or higher
 */
export const requireEditor = requireMinimumRole('EDITOR');

/**
 * Middleware to validate that user is accessing their own resources or has admin privileges
 */
export const requireOwnershipOrAdmin = (
  resourceUserIdParam: string = 'userId'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    const resourceUserId = req.params[resourceUserIdParam] || req.query[resourceUserIdParam];
    const userId = req.user.userId;

    // Check if user is accessing their own resource or is an admin
    const adminRoles = ['SITE_ADMIN', 'BRAND_ADMIN', 'SUPER_ADMIN'];
    const isAdmin = adminRoles.includes(req.user.role);
    const isOwner = resourceUserId === userId;

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources or need admin privileges.',
        code: 'ACCESS_DENIED',
      });
      return;
    }

    next();
  };
};