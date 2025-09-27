import { databaseService } from './databaseService';
import { logger } from '../utils/logger';

// Settings interface
export interface Settings {
  siteName: string;
  siteUrl: string;
  adminEmail: string;
  timezone: string;
  sessionTimeout: number;
  maxLoginAttempts: number;
  apiRateLimit: number;
  fileUploadLimit: number;
  debugMode: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  twoFactorAuth: boolean;
  featureFlags: {
    enableBetaFeatures: boolean;
    enableDebugMode: boolean;
    enableOfflineMode: boolean;
  };
  storageQuota: {
    used: number;
    limit: number;
    warningThreshold: number;
  };
}

const SETTINGS_STORE = 'admin_settings';
const SETTINGS_KEY = 'app_settings';

export const settingsService = {
  /**
   * Get all settings
   */
  async getSettings(): Promise<Settings | null> {
    try {
      const db = await databaseService.getDB();
      const settings = await db.get(SETTINGS_STORE, SETTINGS_KEY);
      return settings || null;
    } catch (error) {
      logger.error('Failed to get settings:', error);
      throw error;
    }
  },

  /**
   * Save settings
   */
  async saveSettings(settings: Settings): Promise<void> {
    try {
      const db = await databaseService.getDB();
      await db.put(SETTINGS_STORE, settings, SETTINGS_KEY);
      logger.info('Settings saved successfully');
    } catch (error) {
      logger.error('Failed to save settings:', error);
      throw error;
    }
  },

  /**
   * Update specific setting
   */
  async updateSetting<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
    try {
      const currentSettings = await this.getSettings() || {} as Settings;
      const updatedSettings = {
        ...currentSettings,
        [key]: value
      };
      await this.saveSettings(updatedSettings);
    } catch (error) {
      logger.error(`Failed to update setting ${key}:`, error);
      throw error;
    }
  },

  /**
   * Reset settings to defaults
   */
  async resetSettings(): Promise<void> {
    const defaultSettings: Settings = {
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
    };

    try {
      await this.saveSettings(defaultSettings);
      logger.info('Settings reset to defaults');
    } catch (error) {
      logger.error('Failed to reset settings:', error);
      throw error;
    }
  },

  /**
   * Initialize settings with defaults if not exists
   */
  async initializeSettings(): Promise<void> {
    try {
      const existing = await this.getSettings();
      if (!existing) {
        await this.resetSettings();
      }
    } catch (error) {
      logger.error('Failed to initialize settings:', error);
      throw error;
    }
  },

  /**
   * Export settings as JSON
   */
  async exportSettings(): Promise<string> {
    try {
      const settings = await this.getSettings();
      return JSON.stringify(settings, null, 2);
    } catch (error) {
      logger.error('Failed to export settings:', error);
      throw error;
    }
  },

  /**
   * Import settings from JSON
   */
  async importSettings(jsonData: string): Promise<void> {
    try {
      const settings = JSON.parse(jsonData) as Settings;

      // Validate settings structure
      if (!this.validateSettings(settings)) {
        throw new Error('Invalid settings format');
      }

      await this.saveSettings(settings);
      logger.info('Settings imported successfully');
    } catch (error) {
      logger.error('Failed to import settings:', error);
      throw error;
    }
  },

  /**
   * Validate settings structure
   */
  validateSettings(settings: any): settings is Settings {
    const requiredFields = [
      'siteName', 'siteUrl', 'adminEmail', 'timezone',
      'sessionTimeout', 'maxLoginAttempts', 'apiRateLimit',
      'fileUploadLimit', 'debugMode', 'emailNotifications',
      'pushNotifications', 'smsNotifications', 'twoFactorAuth',
      'featureFlags', 'storageQuota'
    ];

    return requiredFields.every(field => field in settings);
  }
};