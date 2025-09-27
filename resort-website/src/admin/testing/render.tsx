import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../components/auth/AuthProvider';
import { RoleProvider } from '../components/auth/RoleProvider';
import { PermissionProvider } from '../components/auth/PermissionProvider';
import { ToastProvider } from '../components/ui/toast/ToastProvider';
import { LoadingProvider } from '../components/ui/loading';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <MemoryRouter>
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
    </MemoryRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as renderWithAdminProviders };