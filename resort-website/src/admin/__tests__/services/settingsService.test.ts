import { settingsService } from '../../services/settingsService';
import { databaseService } from '../../services/databaseService';
import { logger } from '../../utils/logger';

// Mock dependencies
jest.mock('../../services/databaseService');
jest.mock('../../utils/logger');

describe('settingsService', () => {
  const mockSettings = {
    siteName: 'Test Resort',
    siteUrl: 'https://test-resort.local',
    adminEmail: 'admin@test.com',
    timezone: 'Asia/Kolkata',
    sessionTimeout: 30,
    maxLoginAttempts: 3,
    apiRateLimit: 100,
    fileUploadLimit: 20,
    debugMode: true,
    emailNotifications: false,
    pushNotifications: false,
    smsNotifications: true,
    twoFactorAuth: true,
    featureFlags: {
      enableBetaFeatures: true,
      enableDebugMode: true,
      enableOfflineMode: false,
    },
    storageQuota: {
      used: 50,
      limit: 200,
      warningThreshold: 90,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    it('retrieves settings from database', async () => {
      (databaseService.get as jest.Mock).mockResolvedValue({
        get: jest.fn().mockResolvedValue(mockSettings)
      });

      const result = await settingsService.getSettings();

      expect(databaseService.get).toHaveBeenCalledWith('admin_settings', 'app_settings');
      expect(result).toEqual(mockSettings);
    });

    it('returns null when no settings exist', async () => {
      (databaseService.get as jest.Mock).mockResolvedValue({
        get: jest.fn().mockResolvedValue(undefined)
      });

      const result = await settingsService.getSettings();

      expect(result).toBeNull();
    });

    it('handles database errors', async () => {
      const error = new Error('Database error');
      (databaseService.get as jest.Mock).mockRejectedValue(error);

      await expect(settingsService.getSettings()).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith('Failed to get settings:', error);
    });
  });

  describe('saveSettings', () => {
    it('saves settings to database', async () => {
      (databaseService.get as jest.Mock).mockResolvedValue({
        put: jest.fn().mockResolvedValue(undefined)
      });

      await settingsService.saveSettings(mockSettings);

      expect(databaseService.get).toHaveBeenCalledWith('admin_settings', 'app_settings');
      expect(logger.info).toHaveBeenCalledWith('Settings saved successfully');
    });

    it('handles save errors', async () => {
      const error = new Error('Save failed');
      (databaseService.get as jest.Mock).mockResolvedValue({
        put: jest.fn().mockRejectedValue(error)
      });

      await expect(settingsService.saveSettings(mockSettings)).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith('Failed to save settings:', error);
    });
  });

  describe('updateSetting', () => {
    beforeEach(() => {
      (databaseService.get as jest.Mock).mockResolvedValue({
        get: jest.fn().mockResolvedValue(mockSettings),
        put: jest.fn().mockResolvedValue(undefined)
      });
    });

    it('updates a single setting', async () => {
      await settingsService.updateSetting('sessionTimeout', 60);

      expect(databaseService.get).toHaveBeenCalledWith('admin_settings', 'app_settings');
      expect(databaseService.get('admin_settings', 'app_settings').put).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockSettings,
          sessionTimeout: 60
        })
      );
    });

    it('handles update errors', async () => {
      const error = new Error('Update failed');
      (databaseService.get as jest.Mock).mockResolvedValue({
        get: jest.fn().mockResolvedValue(mockSettings),
        put: jest.fn().mockRejectedValue(error)
      });

      await expect(settingsService.updateSetting('sessionTimeout', 60)).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith('Failed to update setting sessionTimeout:', error);
    });

    it('creates default settings if none exist', async () => {
      (databaseService.get as jest.Mock).mockResolvedValue({
        get: jest.fn().mockResolvedValue(null),
        put: jest.fn().mockResolvedValue(undefined)
      });

      await settingsService.updateSetting('sessionTimeout', 60);

      expect(databaseService.get('admin_settings', 'app_settings').put).toHaveBeenCalledWith(
        expect.objectContaining({
          siteName: 'Wayanad Nature Resorts',
          sessionTimeout: 60
        })
      );
    });
  });

  describe('resetSettings', () => {
    it('resets to default settings', async () => {
      (databaseService.get as jest.Mock).mockResolvedValue({
        put: jest.fn().mockResolvedValue(undefined)
      });

      await settingsService.resetSettings();

      expect(databaseService.get('admin_settings', 'app_settings').put).toHaveBeenCalledWith(
        expect.objectContaining({
          siteName: 'Wayanad Nature Resorts',
          siteUrl: 'https://wayanad-nature-resort.local',
          adminEmail: '',
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
            used: 0,
            limit: 100,
            warningThreshold: 80,
          },
        })
      );
      expect(logger.info).toHaveBeenCalledWith('Settings reset to defaults');
    });
  });

  describe('initializeSettings', () => {
    it('does nothing if settings already exist', async () => {
      (databaseService.get as jest.Mock).mockResolvedValue({
        get: jest.fn().mockResolvedValue(mockSettings)
      });

      await settingsService.initializeSettings();

      expect(databaseService.get('admin_settings', 'app_settings').put).not.toHaveBeenCalled();
    });

    it('initializes with defaults if no settings exist', async () => {
      (databaseService.get as jest.Mock).mockResolvedValue({
        get: jest.fn().mockResolvedValue(null),
        put: jest.fn().mockResolvedValue(undefined)
      });

      await settingsService.initializeSettings();

      expect(databaseService.get('admin_settings', 'app_settings').put).toHaveBeenCalled();
    });
  });

  describe('exportSettings', () => {
    it('exports settings as JSON', async () => {
      (databaseService.get as jest.Mock).mockResolvedValue({
        get: jest.fn().mockResolvedValue(mockSettings)
      });

      const result = await settingsService.exportSettings();

      expect(result).toBe(JSON.stringify(mockSettings, null, 2));
    });

    it('handles export errors', async () => {
      const error = new Error('Export failed');
      (databaseService.get as jest.Mock).mockRejectedValue(error);

      await expect(settingsService.exportSettings()).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith('Failed to export settings:', error);
    });
  });

  describe('importSettings', () => {
    const validJson = JSON.stringify(mockSettings, null, 2);

    it('imports valid settings', async () => {
      (databaseService.get as jest.Mock).mockResolvedValue({
        put: jest.fn().mockResolvedValue(undefined)
      });

      await settingsService.importSettings(validJson);

      expect(databaseService.get('admin_settings', 'app_settings').put).toHaveBeenCalledWith(mockSettings);
      expect(logger.info).toHaveBeenCalledWith('Settings imported successfully');
    });

    it('rejects invalid JSON', async () => {
      await expect(settingsService.importSettings('invalid json')).rejects.toThrow();
    });

    it('rejects invalid settings structure', async () => {
      const invalidSettings = { invalid: 'structure' };
      const invalidJson = JSON.stringify(invalidSettings);

      await expect(settingsService.importSettings(invalidJson)).rejects.toThrow('Invalid settings format');
    });

    it('handles import errors', async () => {
      const error = new Error('Import failed');
      (databaseService.get as jest.Mock).mockResolvedValue({
        put: jest.fn().mockRejectedValue(error)
      });

      await expect(settingsService.importSettings(validJson)).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith('Failed to import settings:', error);
    });
  });

  describe('validateSettings', () => {
    it('validates correct settings structure', () => {
      const isValid = settingsService.validateSettings(mockSettings);
      expect(isValid).toBe(true);
    });

    it('rejects settings missing required fields', () => {
      const invalidSettings = { ...mockSettings };
      delete (invalidSettings as any).siteName;

      const isValid = settingsService.validateSettings(invalidSettings);
      expect(isValid).toBe(false);
    });

    it('rejects non-object input', () => {
      const isValid = settingsService.validateSettings(null);
      expect(isValid).toBe(false);

      const isValid2 = settingsService.validateSettings('string');
      expect(isValid2).toBe(false);

      const isValid3 = settingsService.validateSettings(123);
      expect(isValid3).toBe(false);
    });
  });
});