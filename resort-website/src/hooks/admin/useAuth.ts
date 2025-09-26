import { useState, useEffect, useCallback } from 'react';
import { type LoginCredentials, type AuthState } from '../../admin/types/admin';
import { authService } from '../../admin/services/authService';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const user = authService.getCurrentUser();
      setAuthState({
        isAuthenticated: !!user,
        user,
        isLoading: false,
      });
    };

    checkAuth();

    // Set up session extension timer
    const extensionTimer = setInterval(() => {
      if (authService.isAuthenticated()) {
        authService.extendSession();
      }
    }, 5 * 60 * 1000); // Extend every 5 minutes

    return () => clearInterval(extensionTimer);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
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