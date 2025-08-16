import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth, signIn, signOut, getAuthState } from './useAuth';
import { MockDataService } from '../lib/mockData';

// Mock the data service to avoid actual async calls in auth tests
vi.mock('../lib/mockData', () => ({
  MockDataService: {
    getUserById: vi.fn(),
  },
}));

describe('useAuth hook', () => {
  beforeEach(() => {
    // Reset the auth store before each test
    act(() => {
      getAuthState().user = null;
      getAuthState().loading = false;
      getAuthState().error = null;
    });
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle successful sign-in', async () => {
    const mockAdminUser = { id: 'admin1', email: 'admin@luxury-resorts.com', role: 'group_admin' };
    (MockDataService.getUserById as vi.Mock).mockResolvedValue(mockAdminUser);

    await act(async () => {
      await signIn('admin@luxury-resorts.com', 'password');
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toEqual(mockAdminUser);
    expect(result.current.error).toBeNull();
    expect(MockDataService.getUserById).toHaveBeenCalledWith('admin1');
  });

  it('should handle failed sign-in with wrong password', async () => {
    await act(async () => {
      await expect(signIn('admin@luxury-resorts.com', 'wrongpassword')).rejects.toThrow('Invalid email or password');
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe('Invalid email or password');
  });

  it('should handle failed sign-in with wrong email', async () => {
    await act(async () => {
      await expect(signIn('wrong@email.com', 'password')).rejects.toThrow('Invalid email or password');
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe('Invalid email or password');
  });

  it('should handle sign-out', async () => {
    // First, sign in a user
    const mockAdminUser = { id: 'admin1', email: 'admin@luxury-resorts.com', role: 'group_admin' };
    (MockDataService.getUserById as vi.Mock).mockResolvedValue(mockAdminUser);
    await act(async () => {
      await signIn('admin@luxury-resorts.com', 'password');
    });

    let result = renderHook(() => useAuth()).result;
    expect(result.current.user).not.toBeNull();

    // Then, sign out
    await act(async () => {
      await signOut();
    });

    result = renderHook(() => useAuth()).result;
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
