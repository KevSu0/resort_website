import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  CreditCard,
  Shield,
  Globe,
  IndianRupee,
  AlertCircle,
  Eye
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { contentService } from '../../services/contentService';
import { type SiteSettings } from '../../types/entities';
import { useAuth } from '../../../hooks/admin/useAuth';

export const SettingsEditor: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const draft = await contentService.loadDraft();
      setSettings(draft.settings);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings || !user) return;

    setSaving(true);
    setErrors([]);

    try {
      // Validate
      if (!settings.phones || settings.phones.length === 0) {
        setErrors(['At least one phone number is required']);
        return;
      }
      if (!settings.email) {
        setErrors(['Email address is required']);
        return;
      }

      await contentService.updateSettings(settings);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Save failed']);
    } finally {
      setSaving(false);
    }
  };

  const addPhone = () => {
    if (!settings) return;
    setSettings({
      ...settings,
      phones: [...settings.phones, '']
    });
  };

  const updatePhone = (index: number, value: string) => {
    if (!settings) return;
    const phones = [...settings.phones];
    phones[index] = value;
    setSettings({ ...settings, phones });
  };

  const removePhone = (index: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      phones: settings.phones.filter((_, i) => i !== index)
    });
  };

  const currencies = [
    { code: 'INR', symbol: '₹', locale: 'en-IN' },
    { code: 'USD', symbol: '$', locale: 'en-US' },
    { code: 'EUR', symbol: '€', locale: 'en-EU' },
    { code: 'GBP', symbol: '£', locale: 'en-GB' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Site Settings</h1>
          <p className="text-gray-600">Configure your resort website settings</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(previewMode === 'edit' ? 'preview' : 'edit')}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode === 'edit' ? 'Preview' : 'Edit'}
          </Button>

          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Please fix the following errors:</span>
          </div>
          <ul className="list-disc list-inside text-red-700">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Form */}
      <div className="space-y-6">
        {/* Contact Information */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Numbers *
              </label>
              {settings.phones.map((phone, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => updatePhone(index, e.target.value)}
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="+91 98765 43210"
                    required
                  />
                  {settings.phones.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removePhone(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addPhone}
                className="mt-2"
              >
                Add Phone Number
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Number
              </label>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="info@resorts.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-gray-400 mt-3" />
                <textarea
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  placeholder="Full address"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Legal Pages */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Legal Pages</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Privacy Policy URL
              </label>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={settings.legal.privacy}
                  onChange={(e) => setSettings({
                    ...settings,
                    legal: { ...settings.legal, privacy: e.target.value }
                  })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="/privacy"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Terms & Conditions URL
              </label>
              <input
                type="text"
                value={settings.legal.terms}
                onChange={(e) => setSettings({
                  ...settings,
                  legal: { ...settings.legal, terms: e.target.value }
                })}
                className="w-full border rounded px-3 py-2"
                placeholder="/terms"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cancellation Policy URL
              </label>
              <input
                type="text"
                value={settings.legal.cancellation}
                onChange={(e) => setSettings({
                  ...settings,
                  legal: { ...settings.legal, cancellation: e.target.value }
                })}
                className="w-full border rounded px-3 py-2"
                placeholder="/cancellation"
              />
            </div>
          </div>
        </div>

        {/* Booking Configuration */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Booking Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Level Agreement
              </label>
              <textarea
                value={settings.booking.sla}
                onChange={(e) => setSettings({
                  ...settings,
                  booking: { ...settings.booking, sla: e.target.value }
                })}
                className="w-full border rounded px-3 py-2"
                rows={2}
                placeholder="We respond within 24 hours"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Methods
              </label>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={settings.booking.paymentMethods.join(', ')}
                  onChange={(e) => setSettings({
                    ...settings,
                    booking: {
                      ...settings.booking,
                      paymentMethods: e.target.value.split(',').map(m => m.trim()).filter(Boolean)
                    }
                  })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Credit Card, Debit Card, UPI"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cancellation Policy
              </label>
              <textarea
                value={settings.booking.cancellationPolicy}
                onChange={(e) => setSettings({
                  ...settings,
                  booking: { ...settings.booking, cancellationPolicy: e.target.value }
                })}
                className="w-full border rounded px-3 py-2"
                rows={2}
                placeholder="Free cancellation up to 48 hours before check-in"
              />
            </div>
          </div>
        </div>

        {/* Currency Settings */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Currency Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency Code
              </label>
              <div className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-gray-400" />
                <select
                  value={settings.currency.code}
                  onChange={(e) => {
                    const currency = currencies.find(c => c.code === e.target.value);
                    if (currency) {
                      setSettings({
                        ...settings,
                        currency: {
                          code: currency.code,
                          symbol: currency.symbol,
                          locale: currency.locale
                        }
                      });
                    }
                  }}
                  className="w-full border rounded px-3 py-2"
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={settings.currency.symbol}
                readOnly
                className="w-full border rounded px-3 py-2 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Locale
              </label>
              <input
                type="text"
                value={settings.currency.locale}
                readOnly
                className="w-full border rounded px-3 py-2 bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Feature Flags */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Feature Flags</h2>
          <div className="space-y-3">
            {Object.entries(settings.featureFlags).map(([key, value]) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={value as boolean}
                  onChange={(e) => setSettings({
                    ...settings,
                    featureFlags: {
                      ...settings.featureFlags,
                      [key]: e.target.checked
                    }
                  })}
                  className="rounded text-primary-600"
                />
                <span className="text-sm capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Discount Settings */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Discount Settings</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Discount Cap (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.maxDiscountCapPercent}
              onChange={(e) => setSettings({
                ...settings,
                maxDiscountCapPercent: parseInt(e.target.value) || 25
              })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};