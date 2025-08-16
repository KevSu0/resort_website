import { create } from 'zustand';
import { MockDataService } from '../lib/mockData';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      // In a real app, this would be a call to a Firebase auth endpoint.
      // Here, we simulate it by checking against a mock user.
      if (email === 'admin@luxury-resorts.com' && password === 'password') {
        const mockAdmin = await MockDataService.getUserById('admin1');
        if (mockAdmin) {
          set({ user: mockAdmin, loading: false });
          return;
        }
      }
      throw new Error('Invalid email or password');
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An unknown error occurred.';
      set({ error, loading: false });
      throw err;
    }
  },
  signOut: async () => {
    set({ user: null, loading: false });
  },
}));

// Custom hook that provides a simplified interface to the store
export function useAuth() {
  const { user, loading, error } = useAuthStore();
  return { user, loading, error };
}

// Exporting signIn and signOut functions directly for use in components
export const signIn = useAuthStore.getState().signIn;
export const signOut = useAuthStore.getState().signOut;

// This function can be used in loaders or other places outside of React components.
export function getAuthState() {
  return useAuthStore.getState();
}
