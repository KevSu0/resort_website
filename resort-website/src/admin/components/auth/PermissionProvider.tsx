import React, { createContext, useContext, type ReactNode } from 'react';
import type { Role } from './RoleProvider';

export type Permission =
  | 'view_dashboard'
  | 'view_analytics'
  | 'view_reports'
  | 'view_settings'
  | 'view_users'
  | 'view_media'
  | 'create_content'
  | 'edit_content'
  | 'delete_content'
  | 'publish_content'
  | 'manage_users'
  | 'manage_roles'
  | 'manage_settings'
  | 'manage_system'
  | 'export_data'
  | 'import_data'
  | 'audit_logs';

export const rolePermissions: Record<Role, Permission[]> = {
  VIEWER: [
    'view_dashboard',
    'view_analytics',
    'view_reports',
    'view_media',
  ],
  EDITOR: [
    'view_dashboard',
    'view_analytics',
    'view_reports',
    'view_media',
    'create_content',
    'edit_content',
    'publish_content',
  ],
  MANAGER: [
    'view_dashboard',
    'view_analytics',
    'view_reports',
    'view_settings',
    'view_users',
    'view_media',
    'create_content',
    'edit_content',
    'delete_content',
    'publish_content',
    'export_data',
    'import_data',
  ],
  ADMIN: [
    'view_dashboard',
    'view_analytics',
    'view_reports',
    'view_settings',
    'view_users',
    'view_media',
    'create_content',
    'edit_content',
    'delete_content',
    'publish_content',
    'manage_users',
    'manage_roles',
    'manage_settings',
    'export_data',
    'import_data',
    'audit_logs',
  ],
  SUPER_ADMIN: [
    'view_dashboard',
    'view_analytics',
    'view_reports',
    'view_settings',
    'view_users',
    'view_media',
    'create_content',
    'edit_content',
    'delete_content',
    'publish_content',
    'manage_users',
    'manage_roles',
    'manage_settings',
    'manage_system',
    'export_data',
    'import_data',
    'audit_logs',
  ],
};

interface PermissionContextType {
  hasPermission: (permission: Permission, userRole?: Role) => boolean;
  hasAllPermissions: (permissions: Permission[], userRole?: Role) => boolean;
  hasAnyPermission: (permissions: Permission[], userRole?: Role) => boolean;
  getPermissions: (role: Role) => Permission[];
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
};

interface PermissionProviderProps {
  children: ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const hasPermission = (permission: Permission, userRole?: Role): boolean => {
    if (!userRole) return false;

    const permissions = rolePermissions[userRole] || [];
    return permissions.includes(permission);
  };

  const hasAllPermissions = (permissions: Permission[], userRole?: Role): boolean => {
    if (!userRole) return false;

    return permissions.every(permission => hasPermission(permission, userRole));
  };

  const hasAnyPermission = (permissions: Permission[], userRole?: Role): boolean => {
    if (!userRole) return false;

    return permissions.some(permission => hasPermission(permission, userRole));
  };

  const getPermissions = (role: Role): Permission[] => {
    return rolePermissions[role] || [];
  };

  const value: PermissionContextType = {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    getPermissions,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};