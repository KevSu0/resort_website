import React from 'react';
import { ToastProvider } from './ui/toast/ToastProvider';
import { LoadingProvider } from './ui/loading/LoadingProvider';
import { RoleProvider } from './auth/RoleProvider';
import { PermissionProvider } from './auth/PermissionProvider';
import { AuthProvider } from './auth/AuthProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <LoadingProvider>
      <ToastProvider>
        <RoleProvider>
          <PermissionProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </PermissionProvider>
        </RoleProvider>
      </ToastProvider>
    </LoadingProvider>
  );
};