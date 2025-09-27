import React, { useState, useEffect } from 'react';
import { Settings, Palette, Bell, Shield, Database, AlertTriangle, CheckCircle, Activity, HardDrive } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../admin/components/ui/card/Card';
import { Button } from '../../admin/components/ui/button/Button';
import { Input } from '../../admin/components/ui/input/Input';
import { Label } from '../../admin/components/ui/label/Label';
import { Switch } from '../../admin/components/ui/switch/Switch';
import { useAuthContext } from '../../admin/components/auth';
import { useToast } from '../../admin/components/ui/toast';
import { settingsService } from '../../admin/services/settingsService';
import { databaseService } from '../../admin/services/databaseService';
import { fileStorageService } from '../../admin/services/fileStorage';

type TabType = 'general' | 'appearance' | 'notifications' | 'security' | 'advanced';

interface Settings {
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
    limit: 100, // MB
    warningThreshold: 80, // %
  },
};

const slaSettings = {
  responseTarget: 4,
  softAlert: 2,
  hardEscalation: 6,
  dailyDigest: '09:00',
};

export const SettingsPage: React.FC = () => {
  const { user } = useAuthContext();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [integrityResults, setIntegrityResults] = useState<any>(null);

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'advanced', label: 'Advanced', icon: Database },
  ] as const;

  useEffect(() => {
    loadSettings();
    checkStorageUsage();
  }, []);

  useEffect(() => {
    setHasChanges(true);
  }, [settings]);

  const loadSettings = async () => {
    try {
      const savedSettings = await settingsService.getSettings();
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...savedSettings });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const checkStorageUsage = async () => {
    try {
      const usage = await fileStorageService.getStorageUsage();
      setSettings(prev => ({
        ...prev,
        storageQuota: {
          ...prev.storageQuota,
          used: usage.used,
        }
      }));
    } catch (error) {
      console.error('Failed to check storage usage:', error);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await settingsService.saveSettings(settings);
      showSuccess('Settings Saved', 'Your settings have been saved successfully.');
      setHasChanges(false);
    } catch (error) {
      showError('Error', 'Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const runIntegrityCheck = async () => {
    setIsChecking(true);
    try {
      const results = await databaseService.runIntegrityCheck();
      setIntegrityResults(results);

      if (results.issues.length === 0) {
        showSuccess('Integrity Check', 'All checks passed successfully!');
      } else {
        showError('Integrity Issues', `Found ${results.issues.length} issues that need attention.`);
      }
    } catch (error) {
      showError('Error', 'Failed to run integrity check.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleResetSettings = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  const storageUsagePercent = (settings.storageQuota.used / settings.storageQuota.limit) * 100;
  const isStorageWarning = storageUsagePercent >= settings.storageQuota.warningThreshold;
  const isStorageCritical = storageUsagePercent >= 95;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your application settings and preferences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      defaultValue="Wayanad Nature Resorts"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteUrl">Site URL</Label>
                    <Input
                      id="siteUrl"
                      defaultValue="https://wayanad-nature-resort.local"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={settings.adminEmail || user?.email || ''}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        adminEmail: e.target.value
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      value={settings.timezone}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        timezone: e.target.value
                      }))}
                    />
                  </div>
                </div>

                {/* SLA Settings (Read-only for v1) */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-4">Booking SLA Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="responseTarget" className="text-sm text-muted-foreground">
                        Response Target Hours
                      </Label>
                      <Input
                        id="responseTarget"
                        value={slaSettings.responseTarget}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Target time for first response to enquiries
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="softAlert" className="text-sm text-muted-foreground">
                        Soft Alert Hours
                      </Label>
                      <Input
                        id="softAlert"
                        value={slaSettings.softAlert}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Amber warning before response deadline
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hardEscalation" className="text-sm text-muted-foreground">
                        Hard Escalation Hours
                      </Label>
                      <Input
                        id="hardEscalation"
                        value={slaSettings.hardEscalation}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Red overdue pin on dashboard
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dailyDigest" className="text-sm text-muted-foreground">
                        Daily Digest Hour (IST)
                      </Label>
                      <Input
                        id="dailyDigest"
                        value={slaSettings.dailyDigest}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Morning summary notification time
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Note: SLA settings are read-only in v1. These defaults apply 24/7.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Theme management is temporarily disabled.</p>
                    <p className="text-sm">This feature will be available in a future update.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications for important events
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        emailNotifications: checked
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Push Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Browser push notifications for real-time updates
                      </p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        pushNotifications: checked
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">SMS Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        SMS alerts for critical system events
                      </p>
                    </div>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        smsNotifications: checked
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        twoFactorAuth: checked
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Session Timeout</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatically log out after inactivity (minutes)
                      </p>
                    </div>
                    <Input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        sessionTimeout: parseInt(e.target.value) || 15
                      }))}
                      className="w-20"
                      min="5"
                      max="120"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Login Attempts</h4>
                      <p className="text-sm text-muted-foreground">
                        Maximum failed login attempts before lockout
                      </p>
                    </div>
                    <Input
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        maxLoginAttempts: parseInt(e.target.value) || 5
                      }))}
                      className="w-20"
                      min="3"
                      max="10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Advanced Settings */}
          {activeTab === 'advanced' && (
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {/* Storage Quota Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2">
                        <HardDrive className="h-4 w-4" />
                        Storage Usage
                      </h4>
                      <span className="text-sm text-muted-foreground">
                        {settings.storageQuota.used.toFixed(1)} MB / {settings.storageQuota.limit} MB
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-colors ${
                            isStorageCritical
                              ? 'bg-red-500'
                              : isStorageWarning
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(storageUsagePercent, 100)}%` }}
                        />
                      </div>
                      {isStorageWarning && (
                        <div className="flex items-center gap-2 text-sm text-yellow-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span>
                            {isStorageCritical
                              ? 'Critical: Storage almost full!'
                              : 'Warning: Approaching storage limit'
                            }
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="warningThreshold" className="text-sm">
                        Warning Threshold (%)
                      </Label>
                      <Input
                        id="warningThreshold"
                        type="number"
                        value={settings.storageQuota.warningThreshold}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          storageQuota: {
                            ...prev.storageQuota,
                            warningThreshold: parseInt(e.target.value) || 80
                          }
                        }))}
                        className="w-20"
                        min="50"
                        max="95"
                      />
                    </div>
                  </div>

                  {/* Feature Flags */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Feature Flags</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="betaFeatures" className="text-sm">
                          Enable Beta Features
                        </Label>
                        <Switch
                          id="betaFeatures"
                          checked={settings.featureFlags.enableBetaFeatures}
                          onCheckedChange={(checked) => setSettings(prev => ({
                            ...prev,
                            featureFlags: {
                              ...prev.featureFlags,
                              enableBetaFeatures: checked
                            }
                          }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="debugMode" className="text-sm">
                          Debug Mode
                        </Label>
                        <Switch
                          id="debugMode"
                          checked={settings.featureFlags.enableDebugMode}
                          onCheckedChange={(checked) => setSettings(prev => ({
                            ...prev,
                            featureFlags: {
                              ...prev.featureFlags,
                              enableDebugMode: checked
                            }
                          }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="offlineMode" className="text-sm">
                          Offline Mode
                        </Label>
                        <Switch
                          id="offlineMode"
                          checked={settings.featureFlags.enableOfflineMode}
                          onCheckedChange={(checked) => setSettings(prev => ({
                            ...prev,
                            featureFlags: {
                              ...prev.featureFlags,
                              enableOfflineMode: checked
                            }
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Other Settings */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="apiRateLimit">API Rate Limit (requests/minute)</Label>
                      <Input
                        id="apiRateLimit"
                        type="number"
                        value={settings.apiRateLimit}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          apiRateLimit: parseInt(e.target.value) || 60
                        }))}
                        min="10"
                        max="1000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="uploadLimit">File Upload Limit (MB)</Label>
                      <Input
                        id="uploadLimit"
                        type="number"
                        value={settings.fileUploadLimit}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          fileUploadLimit: parseInt(e.target.value) || 10
                        }))}
                        min="1"
                        max="100"
                      />
                    </div>
                  </div>

                  {/* Integrity Check */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Database Integrity
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Check database consistency and repair issues
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={runIntegrityCheck}
                        disabled={isChecking}
                      >
                        {isChecking ? 'Checking...' : 'Run Check'}
                      </Button>
                    </div>

                    {integrityResults && (
                      <div className="mt-3 p-3 rounded-md bg-muted">
                        <div className="flex items-center gap-2 mb-2">
                          {integrityResults.issues.length === 0 ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-600">
                                All checks passed
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              <span className="text-sm font-medium text-yellow-600">
                                {integrityResults.issues.length} issues found
                              </span>
                            </>
                          )}
                        </div>
                        {integrityResults.issues.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Issues: {integrityResults.issues.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save/Reset Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleResetSettings}
              disabled={isLoading}
            >
              Reset to Defaults
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={isLoading || !hasChanges}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};