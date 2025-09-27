import React, { createContext, useContext, type ReactNode } from 'react';
import type { AdminUser } from '../types/admin';

export type Role = AdminUser['role'] | 'SUPER_ADMIN';

export const roleHierarchy: Record<Role, number> = {
  'VIEWER': 1,
  'EDITOR': 2,
  'MANAGER': 3,
  'ADMIN': 4,
  'SUPER_ADMIN': 5,
};

interface RoleContextType {
  hasRole: (requiredRole: Role, userRole?: Role) => boolean;
  hasAnyRole: (requiredRoles: Role[], userRole?: Role) => boolean;
  getRoleLevel: (role: Role) => number;
  isHigherRole: (roleA: Role, roleB: Role) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

interface RoleProviderProps {
  children: ReactNode;
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
  const hasRole = (requiredRole: Role, userRole?: Role): boolean => {
    if (!userRole) return false;

    const userLevel = roleHierarchy[userRole];
    const requiredLevel = roleHierarchy[requiredRole];

    return userLevel >= requiredLevel;
  };

  const hasAnyRole = (requiredRoles: Role[], userRole?: Role): boolean => {
    if (!userRole) return false;

    return requiredRoles.some(role => hasRole(role, userRole));
  };

  const getRoleLevel = (role: Role): number => {
    return roleHierarchy[role];
  };

  const isHigherRole = (roleA: Role, roleB: Role): boolean => {
    return roleHierarchy[roleA] > roleHierarchy[roleB];
  };

  const value: RoleContextType = {
    hasRole,
    hasAnyRole,
    getRoleLevel,
    isHigherRole,
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};