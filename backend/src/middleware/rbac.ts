import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define permission types
export type Permission =
  // User Management
  | 'users:read' | 'users:create' | 'users:update' | 'users:delete'
  // Site Management
  | 'sites:read' | 'sites:create' | 'sites:update' | 'sites:delete'
  // Content Management
  | 'content:read' | 'content:create' | 'content:update' | 'content:delete' | 'content:publish'
  // Media Management
  | 'media:read' | 'media:create' | 'media:update' | 'media:delete'
  // Property Management
  | 'properties:read' | 'properties:create' | 'properties:update' | 'properties:delete'
  // Booking Management
  | 'bookings:read' | 'bookings:create' | 'bookings:update' | 'bookings:delete'
  // Analytics & Reports
  | 'analytics:read' | 'reports:read'
  // Settings & Configuration
  | 'settings:read' | 'settings:update'
  // System Administration
  | 'system:read' | 'system:update' | 'system:backup' | 'system:restore'
  // Audit Logs
  | 'audit:read';

// Role-based permission mappings
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: [
    // All permissions
    'users:read', 'users:create', 'users:update', 'users:delete',
    'sites:read', 'sites:create', 'sites:update', 'sites:delete',
    'content:read', 'content:create', 'content:update', 'content:delete', 'content:publish',
    'media:read', 'media:create', 'media:update', 'media:delete',
    'properties:read', 'properties:create', 'properties:update', 'properties:delete',
    'bookings:read', 'bookings:create', 'bookings:update', 'bookings:delete',
    'analytics:read', 'reports:read',
    'settings:read', 'settings:update',
    'system:read', 'system:update', 'system:backup', 'system:restore',
    'audit:read',
  ],
  BRAND_ADMIN: [
    'users:read', 'users:create', 'users:update', 'users:delete',
    'sites:read', 'sites:create', 'sites:update', 'sites:delete',
    'content:read', 'content:create', 'content:update', 'content:delete', 'content:publish',
    'media:read', 'media:create', 'media:update', 'media:delete',
    'properties:read', 'properties:create', 'properties:update', 'properties:delete',
    'bookings:read', 'bookings:create', 'bookings:update', 'bookings:delete',
    'analytics:read', 'reports:read',
    'settings:read', 'settings:update',
    'audit:read',
  ],
  SITE_ADMIN: [
    'users:read', 'users:create', 'users:update',
    'sites:read', 'sites:update',
    'content:read', 'content:create', 'content:update', 'content:delete', 'content:publish',
    'media:read', 'media:create', 'media:update', 'media:delete',
    'properties:read', 'properties:create', 'properties:update', 'properties:delete',
    'bookings:read', 'bookings:create', 'bookings:update', 'bookings:delete',
    'analytics:read', 'reports:read',
    'settings:read', 'settings:update',
    'audit:read',
  ],
  EDITOR: [
    'content:read', 'content:create', 'content:update', 'content:publish',
    'media:read', 'media:create', 'media:update', 'media:delete',
    'properties:read', 'properties:create', 'properties:update',
    'analytics:read',
  ],
  AUTHOR: [
    'content:read', 'content:create', 'content:update',
    'media:read', 'media:create', 'media:update',
    'properties:read',
  ],
  VIEWER: [
    'content:read',
    'media:read',
    'properties:read',
    'bookings:read',
    'analytics:read',
    'reports:read',
  ],
  USER: [
    'content:read',
    'properties:read',
    'bookings:read',
  ],
};

/**
 * Check if a role has a specific permission
 */
export const hasPermission = (role: string, permission: Permission): boolean => {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
};

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (role: string): Permission[] => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Middleware to check if user has required permission
 */
export const requirePermission = (permission: Permission) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    // Check user's role permissions
    const userPermissions = getRolePermissions(req.user.role);

    if (!userPermissions.includes(permission)) {
      res.status(403).json({
        success: false,
        message: `Insufficient permissions. Required permission: ${permission}`,
        code: 'PERMISSION_DENIED',
        requiredPermission: permission,
        userRole: req.user.role,
      });
      return;
    }

    // For site-specific permissions, also check site access
    if (req.user.siteId && permission !== 'system:read' && permission !== 'system:update') {
      try {
        const siteUser = await prisma.siteUser.findUnique({
          where: {
            userId_siteId: {
              userId: req.user.userId,
              siteId: req.user.siteId,
            },
          },
          select: {
            role: true,
            isActive: true,
          },
        });

        if (!siteUser || !siteUser.isActive) {
          res.status(403).json({
            success: false,
            message: 'No active access to this site',
            code: 'SITE_ACCESS_DENIED',
          });
          return;
        }

        // Use site-specific role for permission check
        const sitePermissions = getRolePermissions(siteUser.role);
        if (!sitePermissions.includes(permission)) {
          res.status(403).json({
            success: false,
            message: `Insufficient site permissions. Required permission: ${permission}`,
            code: 'SITE_PERMISSION_DENIED',
            requiredPermission: permission,
            userRole: req.user.role,
            siteRole: siteUser.role,
          });
          return;
        }
      } catch (error) {
        console.error('Site permission check error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to verify site permissions',
          code: 'SITE_PERMISSION_CHECK_FAILED',
        });
        return;
      }
    }

    next();
  };
};

/**
 * Middleware to check if user has any of the required permissions
 */
export const requireAnyPermission = (permissions: Permission[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    const userPermissions = getRolePermissions(req.user.role);
    const hasAnyPermission = permissions.some(permission => userPermissions.includes(permission));

    if (!hasAnyPermission) {
      res.status(403).json({
        success: false,
        message: `Insufficient permissions. Required any of: ${permissions.join(', ')}`,
        code: 'PERMISSION_DENIED',
        requiredPermissions: permissions,
        userRole: req.user.role,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user has all required permissions
 */
export const requireAllPermissions = (permissions: Permission[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    const userPermissions = getRolePermissions(req.user.role);
    const hasAllPermissions = permissions.every(permission => userPermissions.includes(permission));

    if (!hasAllPermissions) {
      const missingPermissions = permissions.filter(permission => !userPermissions.includes(permission));
      res.status(403).json({
        success: false,
        message: `Insufficient permissions. Missing: ${missingPermissions.join(', ')}`,
        code: 'PERMISSION_DENIED',
        requiredPermissions: permissions,
        missingPermissions,
        userRole: req.user.role,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user can access a specific resource
 */
export const requireResourceAccess = (
  resourceType: string,
  resourceIdParam: string = 'id'
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    const resourceId = req.params[resourceIdParam];
    if (!resourceId) {
      res.status(400).json({
        success: false,
        message: 'Resource ID is required',
        code: 'RESOURCE_ID_REQUIRED',
      });
      return;
    }

    try {
      let hasAccess = false;
      let resourceOwner = null;

      // Check resource-specific access based on type
      switch (resourceType) {
        case 'user':
          // Users can access their own resources or need admin permissions
          if (req.user.userId === resourceId) {
            hasAccess = true;
          } else {
            const adminRoles = ['SITE_ADMIN', 'BRAND_ADMIN', 'SUPER_ADMIN'];
            hasAccess = adminRoles.includes(req.user.role);
          }
          break;

        case 'content':
        case 'page':
          // Check if user has content permissions or owns the content
          if (hasPermission(req.user.role, 'content:read')) {
            hasAccess = true;
          } else {
            // Check if user is the content author
            const content = await prisma.page.findUnique({
              where: { id: resourceId },
              select: { id: true },
            });
            hasAccess = !!content;
          }
          break;

        case 'property':
          // Check if user has property permissions
          if (hasPermission(req.user.role, 'properties:read')) {
            hasAccess = true;
          } else {
            // Check if property belongs to user's site
            const property = await prisma.property.findFirst({
              where: {
                id: resourceId,
                siteId: req.user.siteId,
              },
              select: { id: true },
            });
            hasAccess = !!property;
          }
          break;

        default:
          // Default to permission-based access
          const permission = `${resourceType}:read` as Permission;
          hasAccess = hasPermission(req.user.role, permission);
      }

      if (!hasAccess) {
        res.status(403).json({
          success: false,
          message: `Access denied to ${resourceType} resource`,
          code: 'RESOURCE_ACCESS_DENIED',
          resourceType,
          resourceId,
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Resource access check error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify resource access',
        code: 'RESOURCE_ACCESS_CHECK_FAILED',
      });
    }
  };
};

/**
 * Get user permissions for API response
 */
export const getUserPermissions = (role: string, siteRole?: string): Permission[] => {
  const userPermissions = getRolePermissions(role);
  const sitePermissions = siteRole ? getRolePermissions(siteRole) : [];

  // Combine global and site permissions, remove duplicates
  const allPermissions = [...new Set([...userPermissions, ...sitePermissions])];
  return allPermissions;
};