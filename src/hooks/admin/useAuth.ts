import { useState, useEffect, useCallback } from 'react';
import { type LoginCredentials, type AuthState } from '../../admin/types/admin';
import { authService } from '../../admin/services/authService';
import { type AdminUser } from '../../admin/types/admin';
import { ADMIN_CONFIG } from '../../admin/config/adminConfig';

export const useAuth = () => {
  // Create a default admin user for development/testing
  const defaultAdmin: AdminUser = {
    ...ADMIN_CONFIG.DEFAULT_ADMIN,
    createdAt: new Date().toISOString(),
    passwordHash: '[DISABLED]',
  };

  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: !ADMIN_CONFIG.DISABLE_AUTH, // Always authenticated if auth is disabled
    user: ADMIN_CONFIG.DISABLE_AUTH ? defaultAdmin : null,
    isLoading: false,
  });

  // Check authentication status on mount
  useEffect(() => {
    if (ADMIN_CONFIG.DISABLE_AUTH) {
      // Skip authentication checks - always authenticated
      setAuthState({
        isAuthenticated: true,
        user: defaultAdmin,
        isLoading: false,
      });
    } else {
      // Normal authentication flow
      const user = authService.getCurrentUser();
      setAuthState({
        isAuthenticated: !!user,
        user,
        isLoading: false,
      });
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    if (ADMIN_CONFIG.DISABLE_AUTH) {
      // Always succeed in development mode
      return { success: true, user: defaultAdmin };
    }

    try {
      const result = await authService.login(credentials);
      if (result) {
        setAuthState({
          isAuthenticated: true,
          user: result.user,
          isLoading: false,
        });
        return { success: true, user: result.user };
      }
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }, []);

  const logout = useCallback(() => {
    if (ADMIN_CONFIG.DISABLE_AUTH) {
      // In development mode, we don't actually logout
      console.log('Logout disabled in development mode');
      return;
    }

    authService.logout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  }, []);

  return {
    ...authState,
    login,
    logout,
  };
};