import React, { useState, useEffect, useReducer, useCallback } from 'react';
import { Settings, Palette, Bell, Shield, Database, AlertTriangle, CheckCircle, Activity, HardDrive } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../admin/components/ui/card/Card';
import { Button } from '../../admin/components/ui/button/Button';
import { Input } from '../../admin/components/ui/input/Input';
import { Label } from '../../admin/components/ui/label/Label';
import { Switch } from '../../admin/components/ui/switch/Switch';
import { useAuthContext } from '../../admin/components/auth';
import { useToast } from '../../admin/hooks/useToast';
import { settingsService } from '../../admin/services/settingsService';
import { databaseService } from '../../admin/services/databaseService';
import { fileStorageService } from '../../admin/services/fileStorage';

type TabType = 'general' | 'appearance' | 'notifications' | 'security' | 'advanced';

interface SettingsData {
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

const defaultSettings: SettingsData = {
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

type State = {
    isLoading: boolean;
    isSaving: boolean;
    isChecking: boolean;
    settings: SettingsData;
    initialSettings: SettingsData;
    integrityResults: any | null;
};

type Action =
    | { type: 'LOAD_START' }
    | { type: 'LOAD_SUCCESS'; payload: { settings: SettingsData; usage: number } }
    | { type: 'LOAD_FAILURE' }
    | { type: 'UPDATE_SETTINGS'; payload: Partial<SettingsData> | ((current: SettingsData) => SettingsData) }
    | { type: 'SAVE_START' }
    | { type: 'SAVE_SUCCESS'; payload: SettingsData }
    | { type: 'SAVE_FAILURE' }
    | { type: 'RESET_SETTINGS' }
    | { type: 'CHECK_START' }
    | { type: 'CHECK_SUCCESS'; payload: any }
    | { type: 'CHECK_FAILURE' };

const settingsReducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'LOAD_START':
            return { ...state, isLoading: true };
        case 'LOAD_SUCCESS':
            const loadedSettings = { ...defaultSettings, ...action.payload.settings, storageQuota: { ...defaultSettings.storageQuota, used: action.payload.usage } };
            return { ...state, isLoading: false, settings: loadedSettings, initialSettings: loadedSettings };
        case 'LOAD_FAILURE':
            return { ...state, isLoading: false };
        case 'UPDATE_SETTINGS':
            const newSettings = typeof action.payload === 'function' ? action.payload(state.settings) : { ...state.settings, ...action.payload };
            return { ...state, settings: newSettings };
        case 'SAVE_START':
            return { ...state, isSaving: true };
        case 'SAVE_SUCCESS':
            return { ...state, isSaving: false, initialSettings: action.payload, settings: action.payload };
        case 'SAVE_FAILURE':
            return { ...state, isSaving: false };
        case 'RESET_SETTINGS':
            return { ...state, settings: state.initialSettings };
        case 'CHECK_START':
            return { ...state, isChecking: true };
        case 'CHECK_SUCCESS':
            return { ...state, isChecking: false, integrityResults: action.payload };
        case 'CHECK_FAILURE':
            return { ...state, isChecking: false };
        default:
            return state;
    }
};

export const SettingsPage: React.FC = () => {
    const { user } = useAuthContext();
    const { showSuccess, showError } = useToast();
    const [activeTab, setActiveTab] = useState<TabType>('general');

    const [state, dispatch] = useReducer(settingsReducer, {
        isLoading: true,
        isSaving: false,
        isChecking: false,
        settings: defaultSettings,
        initialSettings: defaultSettings,
        integrityResults: null,
    });

    const hasChanges = React.useMemo(() =>
        JSON.stringify(state.settings) !== JSON.stringify(state.initialSettings),
        [state.settings, state.initialSettings]
    );

    const loadInitialData = useCallback(async () => {
        dispatch({ type: 'LOAD_START' });
        try {
            const [savedSettings, usage] = await Promise.all([
                settingsService.getSettings(),
                fileStorageService.getStorageUsage(),
            ]);
            dispatch({ type: 'LOAD_SUCCESS', payload: { settings: savedSettings, usage: usage?.used ?? 0 } });
        } catch (error) {
            console.error('Failed to load initial settings data:', error);
            showError('Error', 'Failed to load settings data.');
            dispatch({ type: 'LOAD_FAILURE' });
        }
    }, [showError]);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    const handleUpdateSettings = (update: Partial<SettingsData> | ((current: SettingsData) => SettingsData)) => {
        dispatch({ type: 'UPDATE_SETTINGS', payload: update });
    };

    const handleSaveSettings = async () => {
        dispatch({ type: 'SAVE_START' });
        try {
            await settingsService.saveSettings(state.settings);
            dispatch({ type: 'SAVE_SUCCESS', payload: state.settings });
            showSuccess('Settings Saved', 'Your settings have been saved successfully.');
        } catch (error) {
            showError('Error', 'Failed to save settings. Please try again.');
            dispatch({ type: 'SAVE_FAILURE' });
        }
    };

    const runIntegrityCheck = async () => {
        dispatch({ type: 'CHECK_START' });
        try {
            const results = await databaseService.runIntegrityCheck();
            dispatch({ type: 'CHECK_SUCCESS', payload: results });
            if (results.issues.length === 0) {
                showSuccess('Integrity Check', 'All checks passed successfully!');
            } else {
                showError('Integrity Issues', `Found ${results.issues.length} issues that need attention.`);
            }
        } catch (error) {
            showError('Error', 'Failed to run integrity check.');
            dispatch({ type: 'CHECK_FAILURE' });
        }
    };

    const handleResetSettings = () => dispatch({ type: 'RESET_SETTINGS' });

    const storageUsagePercent = (state.settings.storageQuota.used / state.settings.storageQuota.limit) * 100;
    const isStorageWarning = storageUsagePercent >= state.settings.storageQuota.warningThreshold;
    const isStorageCritical = storageUsagePercent >= 95;

    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'advanced', label: 'Advanced', icon: Database },
    ] as const;

    if (state.isLoading) {
        return <div className="p-6">Loading settings...</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">Manage your application settings and preferences.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-1">
                    <CardHeader><CardTitle className="text-lg">Settings</CardTitle></CardHeader>
                    <CardContent className="space-y-1">
                        {tabs.map((tab) => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left text-sm transition-colors ${activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
                                <tab.icon className="h-4 w-4" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </CardContent>
                </Card>

                <div className="lg:col-span-3 space-y-6">
                    {activeTab === 'general' && (
                        <Card>
                            <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="siteName">Site Name</Label>
                                        <Input id="siteName" value={state.settings.siteName} onChange={(e) => handleUpdateSettings({ siteName: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="siteUrl">Site URL</Label>
                                        <Input id="siteUrl" value={state.settings.siteUrl} onChange={(e) => handleUpdateSettings({ siteUrl: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="adminEmail">Admin Email</Label>
                                        <Input id="adminEmail" type="email" value={state.settings.adminEmail || user?.email || ''} onChange={(e) => handleUpdateSettings({ adminEmail: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="timezone">Timezone</Label>
                                        <Input id="timezone" value={state.settings.timezone} onChange={(e) => handleUpdateSettings({ timezone: e.target.value })} />
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t">
                                    <h4 className="font-medium mb-4">Booking SLA Settings</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="responseTarget" className="text-sm text-muted-foreground">Response Target Hours</Label>
                                            <Input id="responseTarget" value={slaSettings.responseTarget} disabled className="bg-muted" />
                                            <p className="text-xs text-muted-foreground">Target time for first response to enquiries</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="softAlert" className="text-sm text-muted-foreground">Soft Alert Hours</Label>
                                            <Input id="softAlert" value={slaSettings.softAlert} disabled className="bg-muted" />
                                            <p className="text-xs text-muted-foreground">Amber warning before response deadline</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="hardEscalation" className="text-sm text-muted-foreground">Hard Escalation Hours</Label>
                                            <Input id="hardEscalation" value={slaSettings.hardEscalation} disabled className="bg-muted" />
                                            <p className="text-xs text-muted-foreground">Red overdue pin on dashboard</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="dailyDigest" className="text-sm text-muted-foreground">Daily Digest Hour (IST)</Label>
                                            <Input id="dailyDigest" value={slaSettings.dailyDigest} disabled className="bg-muted" />
                                            <p className="text-xs text-muted-foreground">Morning summary notification time</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-4">Note: SLA settings are read-only in v1. These defaults apply 24/7.</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {activeTab === 'appearance' && (
                        <Card>
                            <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="text-center py-8 text-muted-foreground">
                                    <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Theme management is temporarily disabled.</p>
                                    <p className="text-sm">This feature will be available in a future update.</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {activeTab === 'notifications' && (
                        <Card>
                            <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Email Notifications</h4>
                                        <p className="text-sm text-muted-foreground">Receive email notifications for important events</p>
                                    </div>
                                    <Switch checked={state.settings.emailNotifications} onCheckedChange={(checked) => handleUpdateSettings({ emailNotifications: checked })} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Push Notifications</h4>
                                        <p className="text-sm text-muted-foreground">Browser push notifications for real-time updates</p>
                                    </div>
                                    <Switch checked={state.settings.pushNotifications} onCheckedChange={(checked) => handleUpdateSettings({ pushNotifications: checked })} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">SMS Notifications</h4>
                                        <p className="text-sm text-muted-foreground">SMS alerts for critical system events</p>
                                    </div>
                                    <Switch checked={state.settings.smsNotifications} onCheckedChange={(checked) => handleUpdateSettings({ smsNotifications: checked })} />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {activeTab === 'security' && (
                         <Card>
                            <CardHeader><CardTitle>Security Settings</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Two-Factor Authentication</h4>
                                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                                    </div>
                                    <Switch checked={state.settings.twoFactorAuth} onCheckedChange={(checked) => handleUpdateSettings({ twoFactorAuth: checked })} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Session Timeout</h4>
                                        <p className="text-sm text-muted-foreground">Automatically log out after inactivity (minutes)</p>
                                    </div>
                                    <Input type="number" value={state.settings.sessionTimeout} onChange={(e) => handleUpdateSettings({ sessionTimeout: parseInt(e.target.value) || 15 })} className="w-20" min="5" max="120" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Login Attempts</h4>
                                        <p className="text-sm text-muted-foreground">Maximum failed login attempts before lockout</p>
                                    </div>
                                    <Input type="number" value={state.settings.maxLoginAttempts} onChange={(e) => handleUpdateSettings({ maxLoginAttempts: parseInt(e.target.value) || 5 })} className="w-20" min="3" max="10" />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {activeTab === 'advanced' && (
                        <Card>
                            <CardHeader><CardTitle>Advanced Settings</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium flex items-center gap-2"><HardDrive className="h-4 w-4" />Storage Usage</h4>
                                        <span className="text-sm text-muted-foreground">{state.settings.storageQuota.used.toFixed(1)} MB / {state.settings.storageQuota.limit} MB</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className={`h-2 rounded-full transition-colors ${isStorageCritical ? 'bg-red-500' : isStorageWarning ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(storageUsagePercent, 100)}%` }} />
                                    </div>
                                    {isStorageWarning && (
                                        <div className="flex items-center gap-2 text-sm text-yellow-600">
                                            <AlertTriangle className="h-4 w-4" />
                                            <span>{isStorageCritical ? 'Critical: Storage almost full!' : 'Warning: Approaching storage limit'}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <h4 className="font-medium">Feature Flags</h4>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="betaFeatures" className="text-sm">Enable Beta Features</Label>
                                        <Switch id="betaFeatures" checked={state.settings.featureFlags.enableBetaFeatures} onCheckedChange={(checked) => handleUpdateSettings(s => ({...s, featureFlags: {...s.featureFlags, enableBetaFeatures: checked }}))} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="debugMode" className="text-sm">Debug Mode</Label>
                                        <Switch id="debugMode" checked={state.settings.featureFlags.enableDebugMode} onCheckedChange={(checked) => handleUpdateSettings(s => ({...s, featureFlags: {...s.featureFlags, enableDebugMode: checked }}))} />
                                    </div>
                                </div>
                                <div className="pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium flex items-center gap-2"><Activity className="h-4 w-4" />Database Integrity</h4>
                                            <p className="text-sm text-muted-foreground">Check database consistency and repair issues</p>
                                        </div>
                                        <Button variant="outline" onClick={runIntegrityCheck} disabled={state.isChecking}>{state.isChecking ? 'Checking...' : 'Run Check'}</Button>
                                    </div>
                                    {state.integrityResults && (
                                        <div className="mt-3 p-3 rounded-md bg-muted">
                                            <div className="flex items-center gap-2 mb-2">
                                                {state.integrityResults.issues.length === 0 ? (
                                                    <><CheckCircle className="h-4 w-4 text-green-600" /><span className="text-sm font-medium text-green-600">All checks passed</span></>
                                                ) : (
                                                    <><AlertTriangle className="h-4 w-4 text-yellow-600" /><span className="text-sm font-medium text-yellow-600">{state.integrityResults.issues.length} issues found</span></>
                                                )}
                                            </div>
                                            {state.integrityResults.issues.length > 0 && <div className="text-xs text-muted-foreground">Issues: {state.integrityResults.issues.join(', ')}</div>}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleResetSettings} disabled={state.isSaving || !hasChanges}>Reset</Button>
                        <Button onClick={handleSaveSettings} disabled={state.isSaving || !hasChanges}>{state.isSaving ? 'Saving...' : 'Save Changes'}</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};