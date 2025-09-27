import React, { createContext, useContext, type ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from '../../../hooks/admin/useAuth';
import { useRole, type Role } from './RoleProvider';
import { usePermission, type Permission } from './PermissionProvider';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  isLoading: boolean;
  login: (credentials: any) => Promise<any>;
  logout: () => void;
  // Role-based methods
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
  // Permission-based methods
  hasPermission: (permission: Permission) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  // Combined methods
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  requireAuth: (permission?: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();
  const { hasRole, hasAnyRole } = useRole();
  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermission();

  const hasRoleWithUser = useCallback((role: Role): boolean => {
    return hasRole(role, auth.user?.role);
  }, [hasRole, auth.user]);

  const hasAnyRoleWithUser = useCallback((roles: Role[]): boolean => {
    return hasAnyRole(roles, auth.user?.role);
  }, [hasAnyRole, auth.user]);

  const hasPermissionWithUser = useCallback((permission: Permission): boolean => {
    return hasPermission(permission, auth.user?.role);
  }, [hasPermission, auth.user]);

  const hasAllPermissionsWithUser = useCallback((permissions: Permission[]): boolean => {
    return hasAllPermissions(permissions, auth.user?.role);
  }, [hasAllPermissions, auth.user]);

  const hasAnyPermissionWithUser = useCallback((permissions: Permission[]): boolean => {
    return hasAnyPermission(permissions, auth.user?.role);
  }, [hasAnyPermission, auth.user]);

  // Convenience methods
  const can = useCallback((permission: Permission): boolean => {
    return auth.isAuthenticated && hasPermissionWithUser(permission);
  }, [auth.isAuthenticated, hasPermissionWithUser]);

  const canAny = useCallback((permissions: Permission[]): boolean => {
    return auth.isAuthenticated && hasAnyPermissionWithUser(permissions);
  }, [auth.isAuthenticated, hasAnyPermissionWithUser]);

  const requireAuth = useCallback((permission?: Permission): boolean => {
    if (!auth.isAuthenticated) return false;
    if (permission && !hasPermissionWithUser(permission)) return false;
    return true;
  }, [auth.isAuthenticated, hasPermissionWithUser]);

  const value: AuthContextType = {
    ...auth,
    hasRole: hasRoleWithUser,
    hasAnyRole: hasAnyRoleWithUser,
    hasPermission: hasPermissionWithUser,
    hasAllPermissions: hasAllPermissionsWithUser,
    hasAnyPermission: hasAnyPermissionWithUser,
    can,
    canAny,
    requireAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};