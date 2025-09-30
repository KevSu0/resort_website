import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { SettingsPage } from '../../../pages/admin/SettingsPage';
import { renderWithAdminProviders } from '../../testing/render';
import { settingsService } from '../../services/settingsService';
import { databaseService } from '../../services/databaseService';
import { fileStorageService } from '../../services/fileStorage';
import { useToast } from '../../hooks/useToast';

// Mock the toast hook, as it's a UI dependency.
// Services will be spied on.
jest.mock('../../hooks/useToast');

const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();

const mockSettings = {
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
};

describe('SettingsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Use jest.spyOn to mock the service methods
        jest.spyOn(settingsService, 'getSettings').mockResolvedValue(mockSettings);
        jest.spyOn(settingsService, 'saveSettings').mockResolvedValue({ success: true });
        jest.spyOn(fileStorageService, 'getStorageUsage').mockResolvedValue({
            used: 45,
            limit: 100,
            breakdown: { media: 30, content: 10, settings: 5, other: 0 },
        });
        jest.spyOn(databaseService, 'runIntegrityCheck').mockResolvedValue({ passed: true, issues: [] });

        // Mock the toast hook implementation
        (useToast as jest.Mock).mockReturnValue({
            showSuccess: mockShowSuccess,
            showError: mockShowError,
        });
    });

    const renderPage = () => renderWithAdminProviders(<SettingsPage />);

    it('shows loading state initially and then renders settings', async () => {
        renderPage();
        expect(screen.getByText(/Loading settings.../i)).toBeInTheDocument();

        expect(await screen.findByRole('heading', { name: /Settings/i, level: 1 })).toBeInTheDocument();
        expect(settingsService.getSettings).toHaveBeenCalledTimes(1);
        expect(fileStorageService.getStorageUsage).toHaveBeenCalledTimes(1);
        expect(await screen.findByLabelText('Site Name')).toHaveValue(mockSettings.siteName);
    });

    it('allows editing and saving settings', async () => {
        renderPage();
        await screen.findByRole('heading', { name: /General Settings/i });

        const siteNameInput = await screen.findByLabelText('Site Name');

        await act(async () => {
            fireEvent.change(siteNameInput, { target: { value: 'New Resort Name' } });
        });

        expect(siteNameInput).toHaveValue('New Resort Name');

        const saveButton = screen.getByRole('button', { name: /Save Changes/i });
        expect(saveButton).not.toBeDisabled();

        await act(async () => {
            fireEvent.click(saveButton);
        });

        await waitFor(() => {
            expect(settingsService.saveSettings).toHaveBeenCalledWith(expect.objectContaining({ siteName: 'New Resort Name' }));
            expect(mockShowSuccess).toHaveBeenCalledWith('Settings Saved', 'Your settings have been saved successfully.');
        });
    });

    it('resets changes when reset button is clicked', async () => {
        renderPage();
        await screen.findByRole('heading', { name: /General Settings/i });

        const siteNameInput = await screen.findByLabelText('Site Name');

        await act(async () => {
            fireEvent.change(siteNameInput, { target: { value: 'A temporary change' } });
        });
        expect(siteNameInput).toHaveValue('A temporary change');

        const resetButton = screen.getByRole('button', { name: /Reset/i });
        await act(async () => {
            fireEvent.click(resetButton);
        });

        await waitFor(() => {
            expect(siteNameInput).toHaveValue(mockSettings.siteName);
        });
        expect(screen.getByRole('button', { name: /Save Changes/i })).toBeDisabled();
    });

    it('handles integrity check correctly', async () => {
        renderPage();
        await screen.findByRole('heading', { name: /General Settings/i });

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /Advanced/i }));
        });

        const runCheckButton = await screen.findByRole('button', { name: /Run Check/i });
        await act(async () => {
            fireEvent.click(runCheckButton);
        });

        await waitFor(() => {
            expect(databaseService.runIntegrityCheck).toHaveBeenCalled();
            expect(mockShowSuccess).toHaveBeenCalledWith('Integrity Check', 'All checks passed successfully!');
        });
    });
});