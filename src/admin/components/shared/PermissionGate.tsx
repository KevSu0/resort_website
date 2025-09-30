import { type ReactNode } from 'react';
import { useRBAC } from '../../hooks/useRBAC';
import { type Permission, type Role } from '../../../auth/rbac/roles';

interface PermissionGateProps {
  permissions?: Permission[];
  roles?: Role[];
  requireAll?: boolean; // Default: false (any permission/role is sufficient)
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * A component that conditionally renders its children based on permissions and/or roles
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  permissions,
  roles,
  requireAll = false,
  fallback = null,
  children
}) => {
  const { hasAnyPermission, hasAllPermissions, hasAnyRole } = useRBAC();

  // Check permissions if specified
  const hasRequiredPermissions = permissions
    ? requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions || [])
    : true;

  // Check roles if specified
  const hasRequiredRoles = roles
    ? hasAnyRole(roles)
    : true;

  // Render children if all requirements are met
  if (hasRequiredPermissions && hasRequiredRoles) {
    return <>{children}</>;
  }

  // Otherwise render fallback
  return <>{fallback}</>;
};