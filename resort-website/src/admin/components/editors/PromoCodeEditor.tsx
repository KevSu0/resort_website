import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  X,
  Percent,
  Calendar,
  Tag,
  Users,
  AlertCircle,
  Eye
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { contentService } from '../../services/contentService';
import { type PromoCode } from '../../types/entities';
import { useAuth } from '../../../hooks/admin/useAuth';

export const PromoCodeEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [promo, setPromo] = useState<PromoCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    if (id) {
      loadPromo();
    } else {
      // Create new promo code
      setPromo({
        id: '',
        code: '',
        type: 'Percentage',
        value: 0,
        description: '',
        validFrom: '',
        validUntil: '',
        usageLimit: 0,
        usageCount: 0,
        customerLimit: 0,
        minBookingValue: 0,
        maxDiscountAmount: 0,
        applicableFor: {
          propertyIds: [],
          roomTypeIds: []
        },
        status: 'Draft',
        createdAt: '',
        updatedAt: ''
      });
    }
  }, [id]);

  const loadPromo = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const draft = await contentService.loadDraft();
      const prm = draft.promoCodes.find(p => p.id === id);
      if (prm) {
        setPromo(prm);
      } else {
        navigate('/admin/content');
      }
    } catch (err) {
      console.error('Failed to load promo code:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!promo || !user) return;

    setSaving(true);
    setErrors([]);

    try {
      // Validate
      if (!promo.code) {
        setErrors(['Promo code is required']);
        return;
      }
      if (!promo.description) {
        setErrors(['Description is required']);
        return;
      }
      if (!promo.validFrom || !promo.validUntil) {
        setErrors(['Valid dates are required']);
        return;
      }
      if (new Date(promo.validFrom) >= new Date(promo.validUntil)) {
        setErrors(['End date must be after start date']);
        return;
      }

      if (id) {
        await contentService.updatePromoCode(id, promo);
      } else {
        await contentService.createPromoCode(promo);
        navigate('/admin/content');
      }
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Save failed']);
    } finally {
      setSaving(false);
    }
  };

  const handleApplicableForChange = (type: 'Property' | 'RoomType', value: string) => {
    if (!promo) return;

    const key = `${type.toLowerCase()}Ids` as keyof NonNullable<typeof promo.applicableFor>;
    const current = promo.applicableFor?.[key] as string[] || [];

    if (current.includes(value)) {
      setPromo({
        ...promo,
        applicableFor: {
          ...promo.applicableFor,
          [key]: current.filter(v => v !== value)
        }
      });
    } else {
      setPromo({
        ...promo,
        applicableFor: {
          ...promo.applicableFor,
          [key]: [...current, value]
        }
      });
    }
  };

  const promoTypes = ['Percentage', 'Fixed', 'FreeNight', 'Upgrade'];
  const promoStatuses = ['Draft', 'Active', 'Expired', 'Paused'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!promo) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {id ? 'Edit Promo Code' : 'New Promo Code'}
          </h1>
          <p className="text-gray-600">
            {id ? 'Update promo code details' : 'Create a new promotional code'}
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
                Promo Code *
              </label>
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={promo.code}
                  onChange={(e) => setPromo({ ...promo, code: e.target.value.toUpperCase() })}
                  className="w-full border rounded px-3 py-2 uppercase"
                  placeholder="SAVE20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                value={promo.type}
                onChange={(e) => setPromo({ ...promo, type: e.target.value as any })}
                className="w-full border rounded px-3 py-2"
                required
              >
                {promoTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value *
              </label>
              <div className="flex items-center gap-2">
                {promo.type === 'Percentage' ? (
                  <Percent className="w-5 h-5 text-gray-400" />
                ) : (
                  <span className="text-gray-400">₹</span>
                )}
                <input
                  type="number"
                  min="0"
                  step={promo.type === 'Percentage' ? 1 : 100}
                  value={promo.value}
                  onChange={(e) => setPromo({ ...promo, value: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={promo.status}
                onChange={(e) => setPromo({ ...promo, status: e.target.value as any })}
                className="w-full border rounded px-3 py-2"
              >
                {promoStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={promo.description}
                onChange={(e) => setPromo({ ...promo, description: e.target.value })}
                className="w-full border rounded px-3 py-2"
                rows={3}
                required
              />
            </div>
          </div>
        </div>

        {/* Validity Period */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Validity Period</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid From *
              </label>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <input
                  type="datetime-local"
                  value={promo.validFrom}
                  onChange={(e) => setPromo({ ...promo, validFrom: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid Until *
              </label>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <input
                  type="datetime-local"
                  value={promo.validUntil}
                  onChange={(e) => setPromo({ ...promo, validUntil: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Usage Limits */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Usage Limits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Usage Limit
              </label>
              <input
                type="number"
                min="0"
                value={promo.usageLimit}
                onChange={(e) => setPromo({ ...promo, usageLimit: parseInt(e.target.value) || 0 })}
                className="w-full border rounded px-3 py-2"
                placeholder="0 = Unlimited"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Per Customer Limit
              </label>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  value={promo.customerLimit}
                  onChange={(e) => setPromo({ ...promo, customerLimit: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="0 = Unlimited"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Booking Value
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">₹</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={promo.minBookingValue}
                  onChange={(e) => setPromo({ ...promo, minBookingValue: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Discount Caps */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Discount Caps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Discount Amount
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">₹</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={promo.maxDiscountAmount}
                  onChange={(e) => setPromo({ ...promo, maxDiscountAmount: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="No limit"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        {id && (
          <div className="bg-gray-50 rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Usage Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{promo.usageCount}</div>
                <div className="text-sm text-gray-600">Times Used</div>
              </div>
              {promo.usageLimit > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {promo.usageLimit - promo.usageCount}
                  </div>
                  <div className="text-sm text-gray-600">Remaining Uses</div>
                </div>
              )}
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {promo.customerLimit > 0 ? `${promo.customerLimit}x` : 'Unlimited'}
                </div>
                <div className="text-sm text-gray-600">Per Customer</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {promo.status === 'Active' ? 'Active' : 'Inactive'}
                </div>
                <div className="text-sm text-gray-600">Current Status</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};