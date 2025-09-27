import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsPage } from '../../../pages/admin/SettingsPage';
import * as settingsService from '../../../admin/services/settingsService';
import * as databaseService from '../../../admin/services/databaseService';
import * as fileStorageService from '../../../admin/services/fileStorage';

// Mock the services
jest.mock('../../../admin/services/settingsService');
jest.mock('../../../admin/services/databaseService');
jest.mock('../../../admin/services/fileStorage');
jest.mock('../../../admin/components/auth', () => ({
  useAuthContext: () => ({
    user: { email: 'admin@example.com', name: 'Admin User' }
  })
}));
jest.mock('../../../admin/components/ui/toast', () => ({
  useToast: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn()
  })
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    (settingsService.getSettings as jest.Mock).mockResolvedValue({
      siteName: 'Wayanad Nature Resorts',
      siteUrl: 'https://wayanad-nature-resort.local',
      adminEmail: 'admin@example.com',
      timezone: 'Asia/Kolkata',
      sessionTimeout: 15,
      maxLoginAttempts: 5,
      apiRateLimit: 60,
      fileUploadLimit: 10,
      debugMode: false,
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      twoFactorAuth: false,
      featureFlags: {
        enableBetaFeatures: false,
        enableDebugMode: false,
        enableOfflineMode: true,
      },
      storageQuota: {
        used: 45,
        limit: 100,
        warningThreshold: 80,
      },
    });

    (fileStorageService.getStorageUsage as jest.Mock).mockResolvedValue({
      used: 45,
      limit: 100,
      breakdown: {
        media: 30,
        content: 10,
        settings: 5,
        other: 0
      }
    });

    (databaseService.runIntegrityCheck as jest.Mock).mockResolvedValue({
      passed: true,
      issues: [],
      storeCounts: {
        enquiries: 10,
        media: 25,
        properties: 5
      },
      checkResults: {}
    });
  });

  it('renders without crashing', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Manage your application settings and preferences.')).toBeInTheDocument();
  });

  it('loads settings on mount', async () => {
    render(<SettingsPage />);
    await waitFor(() => {
      expect(settingsService.getSettings).toHaveBeenCalled();
      expect(fileStorageService.getStorageUsage).toHaveBeenCalled();
    });
  });

  it('displays general settings tab by default', async () => {
    render(<SettingsPage />);
    await waitFor(() => {
      expect(screen.getByLabelText('Site Name')).toHaveValue('Wayanad Nature Resorts');
      expect(screen.getByLabelText('Site URL')).toHaveValue('https://wayanad-nature-resort.local');
      expect(screen.getByLabelText('Admin Email')).toHaveValue('admin@example.com');
    });
  });

  it('switches between tabs', async () => {
    render(<SettingsPage />);

    // Click on Notifications tab
    fireEvent.click(screen.getByText('Notifications'));
    expect(screen.getByText('Notification Preferences')).toBeInTheDocument();

    // Click on Security tab
    fireEvent.click(screen.getByText('Security'));
    expect(screen.getByText('Security Settings')).toBeInTheDocument();

    // Click on Advanced tab
    fireEvent.click(screen.getByText('Advanced'));
    expect(screen.getByText('Advanced Settings')).toBeInTheDocument();
  });

  it('saves settings when save button is clicked', async () => {
    const mockShowSuccess = jest.fn();
    (jest.requireMock('../../../admin/components/ui/toast').useToast as jest.Mock)
      .mockReturnValue({ showSuccess: mockShowSuccess, showError: jest.fn() });

    render(<SettingsPage />);
    await waitFor(() => {
      // Update a setting
      fireEvent.change(screen.getByLabelText('Site Name'), {
        target: { value: 'New Resort Name' }
      });
    });

    // Click save
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(settingsService.saveSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          siteName: 'New Resort Name'
        })
      );
      expect(mockShowSuccess).toHaveBeenCalledWith('Settings Saved', 'Your settings have been saved successfully.');
    });
  });

  it('resets settings to defaults', async () => {
    render(<SettingsPage />);

    // Change a value
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Site Name'), {
        target: { value: 'Modified Name' }
      });
    });

    // Click reset
    fireEvent.click(screen.getByText('Reset to Defaults'));

    // Should revert to original value
    await waitFor(() => {
      expect(screen.getByLabelText('Site Name')).toHaveValue('Wayanad Nature Resorts');
    });
  });

  it('displays storage usage with warning when approaching limit', async () => {
    // Mock high storage usage
    (fileStorageService.getStorageUsage as jest.Mock).mockResolvedValue({
      used: 85,
      limit: 100,
      breakdown: {
        media: 60,
        content: 20,
        settings: 5,
        other: 0
      }
    });

    render(<SettingsPage />);
    await waitFor(() => {
      expect(screen.getByText('Warning: Approaching storage limit')).toBeInTheDocument();
    });
  });

  it('displays storage usage with critical warning when nearly full', async () => {
    // Mock critical storage usage
    (fileStorageService.getStorageUsage as jest.Mock).mockResolvedValue({
      used: 96,
      limit: 100,
      breakdown: {
        media: 70,
        content: 20,
        settings: 6,
        other: 0
      }
    });

    render(<SettingsPage />);
    await waitFor(() => {
      expect(screen.getByText('Critical: Storage almost full!')).toBeInTheDocument();
    });
  });

  it('runs integrity check when button is clicked', async () => {
    const mockShowSuccess = jest.fn();
    (jest.requireMock('../../../admin/components/ui/toast').useToast as jest.Mock)
      .mockReturnValue({ showSuccess: mockShowSuccess, showError: jest.fn() });

    render(<SettingsPage />);

    // Navigate to Advanced tab
    fireEvent.click(screen.getByText('Advanced'));

    // Click integrity check button
    fireEvent.click(screen.getByText('Run Check'));

    await waitFor(() => {
      expect(databaseService.runIntegrityCheck).toHaveBeenCalled();
      expect(mockShowSuccess).toHaveBeenCalledWith('Integrity Check', 'All checks passed successfully!');
    });
  });

  it('displays integrity check issues when found', async () => {
    // Mock integrity check with issues
    (databaseService.runIntegrityCheck as jest.Mock).mockResolvedValue({
      passed: false,
      issues: ['Missing object store: users', 'Invalid data in enquiries'],
      storeCounts: {},
      checkResults: {}
    });

    render(<SettingsPage />);

    // Navigate to Advanced tab
    fireEvent.click(screen.getByText('Advanced'));

    // Click integrity check button
    fireEvent.click(screen.getByText('Run Check'));

    await waitFor(() => {
      expect(screen.getByText('2 issues found')).toBeInTheDocument();
      expect(screen.getByText('Issues: Missing object store: users, Invalid data in enquiries')).toBeInTheDocument();
    });
  });

  it('handles failed integrity check', async () => {
    const mockShowError = jest.fn();
    (jest.requireMock('../../../admin/components/ui/toast').useToast as jest.Mock)
      .mockReturnValue({ showSuccess: jest.fn(), showError: mockShowError });

    (databaseService.runIntegrityCheck as jest.Mock).mockRejectedValue(new Error('Database error'));

    render(<SettingsPage />);

    // Navigate to Advanced tab
    fireEvent.click(screen.getByText('Advanced'));

    // Click integrity check button
    fireEvent.click(screen.getByText('Run Check'));

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Error', 'Failed to run integrity check.');
    });
  });

  it('disables save button when loading', async () => {
    (settingsService.saveSettings as jest.Mock).mockImplementation(() =>
      new Promise(resolve => setTimeout(resolve, 1000))
    );

    render(<SettingsPage />);

    // Make a change and click save
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Site Name'), {
        target: { value: 'Test' }
      });
    });

    fireEvent.click(screen.getByText('Save Changes'));

    // Button should be disabled and show loading state
    expect(screen.getByText('Saving...')).toBeDisabled();
  });

  it('toggles feature flags', async () => {
    render(<SettingsPage />);

    // Navigate to Advanced tab
    fireEvent.click(screen.getByText('Advanced'));

    // Toggle debug mode
    const debugModeSwitch = screen.getByLabelText('Debug Mode');
    fireEvent.click(debugModeSwitch);

    await waitFor(() => {
      expect(debugModeSwitch).toBeChecked();
    });
  });

  it('updates notification preferences', async () => {
    render(<SettingsPage />);

    // Navigate to Notifications tab
    fireEvent.click(screen.getByText('Notifications'));

    // Toggle email notifications
    const emailSwitch = screen.getByLabelText('Email Notifications');
    fireEvent.click(emailSwitch);

    await waitFor(() => {
      expect(emailSwitch).not.toBeChecked();
    });
  });
});