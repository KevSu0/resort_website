import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  X,
  Users,
  Link,
  BarChart3,
  AlertCircle,
  Eye,
  Copy
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { contentService } from '../../services/contentService';
import { type Referrer } from '../../types/entities';
import { useAuth } from '../../../hooks/admin/useAuth';

export const ReferrerEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [referrer, setReferrer] = useState<Referrer | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      loadReferrer();
    } else {
      // Create new referrer
      setReferrer({
        id: '',
        name: '',
        email: '',
        phone: '',
        code: '',
        commissionRate: 10,
        status: 'Active',
        notes: '',
        rewardType: 'PERCENT',
        rewardValue: 10,
        isActive: true,
        totals: {
          attributions: 0,
          confirmed: 0,
          pending: 0
        },
        createdAt: '',
        updatedAt: ''
      });
    }
  }, [id]);

  const loadReferrer = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const draft = await contentService.loadDraft();
      const ref = draft.referrers.find(r => r.id === id);
      if (ref) {
        setReferrer(ref);
      } else {
        navigate('/admin/content');
      }
    } catch (err) {
      console.error('Failed to load referrer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!referrer || !user) return;

    setSaving(true);
    setErrors([]);

    try {
      // Validate
      if (!referrer.name) {
        setErrors(['Name is required']);
        return;
      }
      if (!referrer.code) {
        setErrors(['Referrer code is required']);
        return;
      }
      if (!referrer.email && !referrer.phone) {
        setErrors(['Email or phone is required']);
        return;
      }

      if (id) {
        await contentService.updateReferrer(id, referrer);
      } else {
        await contentService.createReferrer(referrer);
        navigate('/admin/content');
      }
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Save failed']);
    } finally {
      setSaving(false);
    }
  };

  const copyReferralLink = async () => {
    if (!referrer) return;

    const link = `${window.location.origin}?ref=${referrer.code}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const referrerStatuses = ['Active', 'Paused', 'Inactive'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!referrer) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {id ? 'Edit Referrer' : 'New Referrer'}
          </h1>
          <p className="text-gray-600">
            {id ? 'Update referrer information' : 'Add a new referral partner'}
          </p>
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
        {/* Basic Info */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={referrer.name}
                  onChange={(e) => setReferrer({ ...referrer, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referrer Code *
              </label>
              <input
                type="text"
                value={referrer.code}
                onChange={(e) => setReferrer({ ...referrer, code: e.target.value.toUpperCase() })}
                className="w-full border rounded px-3 py-2 uppercase"
                placeholder="REF123"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={referrer.email}
                onChange={(e) => setReferrer({ ...referrer, email: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="contact@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={referrer.phone}
                onChange={(e) => setReferrer({ ...referrer, phone: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commission Rate (%)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">%</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={referrer.commissionRate}
                  onChange={(e) => setReferrer({ ...referrer, commissionRate: parseFloat(e.target.value) || 0 })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={referrer.status}
                onChange={(e) => setReferrer({ ...referrer, status: e.target.value as any })}
                className="w-full border rounded px-3 py-2"
              >
                {referrerStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={referrer.notes}
                onChange={(e) => setReferrer({ ...referrer, notes: e.target.value })}
                className="w-full border rounded px-3 py-2"
                rows={3}
                placeholder="Additional notes about this referrer..."
              />
            </div>
          </div>
        </div>

        {/* Referral Link */}
        {id && (
          <div className="bg-blue-50 rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Referral Link</h2>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white border rounded px-3 py-2 font-mono text-sm">
                {window.location.origin}?ref={referrer.code}
              </div>
              <Button
                variant="outline"
                onClick={copyReferralLink}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Share this link with the referrer to track referrals
            </p>
          </div>
        )}

        {/* Performance Statistics */}
        {id && (
          <div className="bg-gray-50 rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Performance Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{referrer.totals.attributions}</div>
                <div className="text-sm text-gray-600">Total Attributions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{referrer.totals.confirmed}</div>
                <div className="text-sm text-gray-600">Confirmed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{referrer.totals.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {referrer.totals.attributions > 0
                    ? Math.round((referrer.totals.confirmed / referrer.totals.attributions) * 100)
                    : 0}%
                </div>
                <div className="text-sm text-gray-600">Conversion Rate</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};