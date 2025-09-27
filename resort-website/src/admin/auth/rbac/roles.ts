// Role-Based Access Control (RBAC) definitions

export type Role =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'CONTENT_MANAGER'
  | 'EDITOR'
  | 'VIEWER'
  | 'GUEST';

export type Permission =
  // User Management
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'users:impersonate'
  | 'users:manage_roles'

  // Content Management
  | 'content:read'
  | 'content:write'
  | 'content:delete'
  | 'content:publish'
  | 'content:archive'

  // Media Management
  | 'media:read'
  | 'media:upload'
  | 'media:delete'
  | 'media:organize'

  // Settings
  | 'settings:read'
  | 'settings:write'
  | 'settings:manage_api'
  | 'settings:manage_integrations'

  // Analytics
  | 'analytics:read'
  | 'analytics:export'

  // System
  | 'system:read_logs'
  | 'system:manage_backups'
  | 'system:manage_maintenance'
  | 'system:view_performance';

export interface RoleDefinition {
  id: Role;
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
  level: number; // Higher number = more permissions
}

export const roleDefinitions: Record<Role, RoleDefinition> = {
  SUPER_ADMIN: {
    id: 'SUPER_ADMIN',
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    permissions: [
      // User permissions
      'users:read',
      'users:write',
      'users:delete',
      'users:impersonate',
      'users:manage_roles',

      // Content permissions
      'content:read',
      'content:write',
      'content:delete',
      'content:publish',
      'content:archive',

      // Media permissions
      'media:read',
      'media:upload',
      'media:delete',
      'media:organize',

      // Settings permissions
      'settings:read',
      'settings:write',
      'settings:manage_api',
      'settings:manage_integrations',

      // Analytics permissions
      'analytics:read',
      'analytics:export',

      // System permissions
      'system:read_logs',
      'system:manage_backups',
      'system:manage_maintenance',
      'system:view_performance'
    ],
    isSystemRole: true,
    level: 100
  },

  ADMIN: {
    id: 'ADMIN',
    name: 'Administrator',
    description: 'Full access except system-level operations',
    permissions: [
      'users:read',
      'users:write',
      'users:delete',

      'content:read',
      'content:write',
      'content:delete',
      'content:publish',
      'content:archive',

      'media:read',
      'media:upload',
      'media:delete',
      'media:organize',

      'settings:read',
      'settings:write',

      'analytics:read',
      'analytics:export'
    ],
    isSystemRole: true,
    level: 90
  },

  CONTENT_MANAGER: {
    id: 'CONTENT_MANAGER',
    name: 'Content Manager',
    description: 'Manage content and media',
    permissions: [
      'content:read',
      'content:write',
      'content:publish',
      'content:archive',

      'media:read',
      'media:upload',
      'media:organize',

      'settings:read',

      'analytics:read'
    ],
    isSystemRole: true,
    level: 70
  },

  EDITOR: {
    id: 'EDITOR',
    name: 'Editor',
    description: 'Create and edit content',
    permissions: [
      'content:read',
      'content:write',
      'media:read',
      'media:upload'
    ],
    isSystemRole: true,
    level: 50
  },

  VIEWER: {
    id: 'VIEWER',
    name: 'Viewer',
    description: 'Read-only access',
    permissions: [
      'content:read',
      'media:read',
      'settings:read',
      'analytics:read'
    ],
    isSystemRole: true,
    level: 30
  },

  GUEST: {
    id: 'GUEST',
    name: 'Guest',
    description: 'Limited access for temporary users',
    permissions: [
      'content:read'
    ],
    isSystemRole: true,
    level: 10
  }
};

// Role hierarchy for inheritance
export const roleHierarchy: Record<Role, Role[]> = {
  SUPER_ADMIN: [],
  ADMIN: ['SUPER_ADMIN'],
  CONTENT_MANAGER: ['ADMIN', 'SUPER_ADMIN'],
  EDITOR: ['CONTENT_MANAGER', 'ADMIN', 'SUPER_ADMIN'],
  VIEWER: ['EDITOR', 'CONTENT_MANAGER', 'ADMIN', 'SUPER_ADMIN'],
  GUEST: ['VIEWER', 'EDITOR', 'CONTENT_MANAGER', 'ADMIN', 'SUPER_ADMIN']
};

// Helper functions
export const getRoleLevel = (role: Role): number => {
  return roleDefinitions[role].level;
};

export const hasHigherRole = (currentRole: Role, targetRole: Role): boolean => {
  return getRoleLevel(currentRole) > getRoleLevel(targetRole);
};

export const canManageRole = (managerRole: Role, targetRole: Role): boolean => {
  return hasHigherRole(managerRole, targetRole);
};