import { useContext } from 'react';
import { useAuth } from './useAuth';
import { type Role, type Permission, roleDefinitions, roleHierarchy } from '../auth/rbac/roles';

interface UseRBACReturn {
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
  canAccessResource: (resource: string, action: string) => boolean;
}

export const useRBAC = (): UseRBACReturn => {
  const { user } = useAuth();

  // Get all permissions for the user's role including inherited permissions
  const getUserPermissions = (): Permission[] => {
    if (!user?.role) return [];

    const userRole = user.role as Role;
    const permissions = new Set<Permission>();

    // Add permissions from current role
    roleDefinitions[userRole].permissions.forEach(permission => {
      permissions.add(permission);
    });

    // Add permissions from inherited roles
    roleHierarchy[userRole].forEach(inheritedRole => {
      roleDefinitions[inheritedRole].permissions.forEach(permission => {
        permissions.add(permission);
      });
    });

    return Array.from(permissions);
  };

  // Check if user has a specific permission
  const hasPermission = (permission: Permission): boolean => {
    if (!user?.role) return false;
    return getUserPermissions().includes(permission);
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  // Check if user has all of the specified permissions
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  // Check if user has a specific role
  const hasRole = (role: Role): boolean => {
    if (!user?.role) return false;
    return user.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles: Role[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  // Check if user can access a specific resource with an action
  const canAccessResource = (resource: string, action: string): boolean => {
    const permission = `${resource}:${action}` as Permission;
    return hasPermission(permission);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    canAccessResource
  };
};