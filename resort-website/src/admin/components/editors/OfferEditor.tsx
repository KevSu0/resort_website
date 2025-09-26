import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  Percent,
  Calendar,
  Tag,
  AlertCircle,
  Eye
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { contentService } from '../../services/contentService';
import { type Offer } from '../../types/entities';
import { useAuth } from '../../../hooks/admin/useAuth';

export const OfferEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    if (id) {
      loadOffer();
    } else {
      // Create new offer
      setOffer({
        id: '',
        code: '',
        type: 'Percentage',
        value: 0,
        description: '',
        terms: '',
        validFrom: '',
        validUntil: '',
        minBookingValue: 0,
        maxDiscountAmount: 0,
        usageLimit: 0,
        usageCount: 0,
        status: 'Active',
        createdAt: '',
        updatedAt: ''
      });
    }
  }, [id]);

  const loadOffer = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const draft = await contentService.loadDraft();
      const offr = draft.offers.find(o => o.id === id);
      if (offr) {
        setOffer(offr);
      } else {
        navigate('/admin/content');
      }
    } catch (err) {
      console.error('Failed to load offer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!offer || !user) return;

    setSaving(true);
    setErrors([]);

    try {
      // Validate
      if (!offer.code) {
        setErrors(['Offer code is required']);
        return;
      }
      if (!offer.description) {
        setErrors(['Description is required']);
        return;
      }
      if (!offer.validFrom || !offer.validUntil) {
        setErrors(['Valid dates are required']);
        return;
      }
      if (new Date(offer.validFrom) >= new Date(offer.validUntil)) {
        setErrors(['End date must be after start date']);
        return;
      }

      if (id) {
        await contentService.updateOffer(id, offer);
      } else {
        await contentService.createOffer(offer);
        navigate('/admin/content');
      }
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Save failed']);
    } finally {
      setSaving(false);
    }
  };

  const offerTypes = ['Percentage', 'Fixed', 'FreeNight', 'Upgrade'];
  const offerStatuses = ['Draft', 'Active', 'Expired', 'Paused'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!offer) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {id ? 'Edit Offer' : 'New Offer'}
          </h1>
          <p className="text-gray-600">
            {id ? 'Update offer details' : 'Create a new promotional offer'}
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
                Offer Code *
              </label>
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={offer.code}
                  onChange={(e) => setOffer({ ...offer, code: e.target.value.toUpperCase() })}
                  className="w-full border rounded px-3 py-2 uppercase"
                  placeholder="SUMMER2024"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                value={offer.type}
                onChange={(e) => setOffer({ ...offer, type: e.target.value as any })}
                className="w-full border rounded px-3 py-2"
                required
              >
                {offerTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value *
              </label>
              <div className="flex items-center gap-2">
                {offer.type === 'Percentage' ? (
                  <Percent className="w-5 h-5 text-gray-400" />
                ) : (
                  <span className="text-gray-400">₹</span>
                )}
                <input
                  type="number"
                  min="0"
                  step={offer.type === 'Percentage' ? 1 : 100}
                  value={offer.value}
                  onChange={(e) => setOffer({ ...offer, value: parseInt(e.target.value) || 0 })}
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
                value={offer.status}
                onChange={(e) => setOffer({ ...offer, status: e.target.value as any })}
                className="w-full border rounded px-3 py-2"
              >
                {offerStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={offer.description}
                onChange={(e) => setOffer({ ...offer, description: e.target.value })}
                className="w-full border rounded px-3 py-2"
                rows={3}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Terms & Conditions
              </label>
              <textarea
                value={offer.terms}
                onChange={(e) => setOffer({ ...offer, terms: e.target.value })}
                className="w-full border rounded px-3 py-2"
                rows={4}
                placeholder="Terms and conditions for this offer..."
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
                  value={offer.validFrom}
                  onChange={(e) => setOffer({ ...offer, validFrom: e.target.value })}
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
                  value={offer.validUntil}
                  onChange={(e) => setOffer({ ...offer, validUntil: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Booking Conditions */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Booking Conditions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  value={offer.minBookingValue}
                  onChange={(e) => setOffer({ ...offer, minBookingValue: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Discount
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">₹</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={offer.maxDiscountAmount}
                  onChange={(e) => setOffer({ ...offer, maxDiscountAmount: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="No limit"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usage Limit
              </label>
              <input
                type="number"
                min="0"
                value={offer.usageLimit}
                onChange={(e) => setOffer({ ...offer, usageLimit: parseInt(e.target.value) || 0 })}
                className="w-full border rounded px-3 py-2"
                placeholder="0 = Unlimited"
              />
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        {id && (
          <div className="bg-gray-50 rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Usage Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{offer.usageCount || 0}</div>
                <div className="text-sm text-gray-600">Times Used</div>
              </div>
              {(offer.usageLimit || 0) > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {(offer.usageLimit || 0) - (offer.usageCount || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Remaining Uses</div>
                </div>
              )}
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {offer.status === 'Active' ? 'Active' : 'Inactive'}
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