import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Save,
  X,
  Plus,
  Trash2,
  Tag,
  Calendar,
  Users,
  Percent,
  DollarSign,
  Gift,
  Package
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { offersService } from '../../admin/services/offersService';
import { type Offer, type OfferType, type Applicability } from '../../admin/types/entities';
import { useAuth } from '../../hooks/admin/useAuth';

const offerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_NIGHTS', 'PACKAGE_DEAL']),
  value: z.number().min(0, 'Value must be positive'),
  code: z.string().optional(),
  validFrom: z.string().min(1, 'Valid from date is required'),
  validTo: z.string().min(1, 'Valid to date is required'),
  applicability: z.object({
    type: z.enum(['GLOBAL', 'PROPERTY', 'ROOM_TYPE']),
    propertyIds: z.array(z.string()).optional(),
    roomTypeIds: z.array(z.string()).optional()
  }),
  maxUsage: z.number().min(0).optional(),
  minStay: z.number().min(0).optional(),
  advanceBooking: z.number().min(0).optional(),
  terms: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'EXPIRED'])
});

type OfferFormData = z.infer<typeof offerSchema>;

const offerTypeIcons = {
  PERCENTAGE: Percent,
  FIXED_AMOUNT: DollarSign,
  FREE_NIGHTS: Gift,
  PACKAGE_DEAL: Package
};

const offerTypeLabels = {
  PERCENTAGE: 'Percentage Discount',
  FIXED_AMOUNT: 'Fixed Amount',
  FREE_NIGHTS: 'Free Nights',
  PACKAGE_DEAL: 'Package Deal'
};

export const OfferFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [offer, setOffer] = useState<Offer | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      applicability: {
        type: 'GLOBAL',
        propertyIds: [],
        roomTypeIds: []
      },
      status: 'DRAFT'
    }
  });

  const watchedType = watch('type');
  const watchedApplicabilityType = watch('applicability.type');

  useEffect(() => {
    if (id) {
      loadOffer();
    }
  }, [id]);

  const loadOffer = async () => {
    setLoading(true);
    try {
      const data = await offersService.getOffer(id!);
      if (data) {
        setOffer(data);
        // Set form values
        Object.entries(data).forEach(([key, value]) => {
          if (key === 'applicability') {
            setValue('applicability', value);
          } else if (key in offerSchema.shape) {
            setValue(key as keyof OfferFormData, value as any);
          }
        });
      }
    } catch (err) {
      console.error('Failed to load offer:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: OfferFormData) => {
    setSaving(true);
    try {
      if (id) {
        await offersService.updateOffer(id, data);
      } else {
        await offersService.createOffer(data);
      }
      navigate('/admin/offers');
    } catch (err) {
      console.error('Failed to save offer:', err);
    } finally {
      setSaving(false);
    }
  };

  const generateCode = async () => {
    const code = await offersService.generatePromoCode('');
    setValue('code', code);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const Icon = offerTypeIcons[watchedType];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {id ? 'Edit Offer' : 'Create New Offer'}
          </h1>
          <p className="text-gray-600 mt-2">
            {id ? 'Update offer details and settings' : 'Create a new promotional offer'}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/offers')}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Basic Information
            </h2>

            <div>
              <label className="block text-sm font-medium mb-1">Offer Name</label>
              <input
                {...register('name')}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="e.g., Summer Special 2024"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                {...register('description')}
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
                placeholder="Describe your offer..."
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Offer Type</label>
              <select
                {...register('type')}
                className="w-full px-4 py-2 border rounded-lg"
              >
                {Object.entries(offerTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {errors.type && (
                <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {watchedType === 'PERCENTAGE' ? 'Discount Percentage' :
                 watchedType === 'FIXED_AMOUNT' ? 'Discount Amount (₹)' :
                 watchedType === 'FREE_NIGHTS' ? 'Number of Free Nights' :
                 'Package Details'}
              </label>
              <input
                type="number"
                {...register('value', { valueAsNumber: true })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder={watchedType === 'PERCENTAGE' ? 'e.g., 20' :
                          watchedType === 'FIXED_AMOUNT' ? 'e.g., 1000' :
                          watchedType === 'FREE_NIGHTS' ? 'e.g., 1' :
                          'Enter package details'}
              />
              {errors.value && (
                <p className="text-sm text-red-600 mt-1">{errors.value.message}</p>
              )}
            </div>
          </div>

          {/* Offer Settings */}
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Offer Settings
            </h2>

            <div>
              <label className="block text-sm font-medium mb-1">Promo Code</label>
              <div className="flex gap-2">
                <input
                  {...register('code')}
                  className="flex-1 px-4 py-2 border rounded-lg font-mono"
                  placeholder="Optional promo code"
                />
                <Button type="button" variant="outline" onClick={generateCode}>
                  Generate
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Valid From</label>
                <input
                  type="date"
                  {...register('validFrom')}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                {errors.validFrom && (
                  <p className="text-sm text-red-600 mt-1">{errors.validFrom.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valid To</label>
                <input
                  type="date"
                  {...register('validTo')}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                {errors.validTo && (
                  <p className="text-sm text-red-600 mt-1">{errors.validTo.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Maximum Usage</label>
              <input
                type="number"
                {...register('maxUsage', { valueAsNumber: true })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Minimum Stay (nights)</label>
                <input
                  type="number"
                  {...register('minStay', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="e.g., 2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Advance Booking (days)</label>
                <input
                  type="number"
                  {...register('advanceBooking', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="e.g., 7"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Applicability */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Applicability
          </h2>

          <div>
            <label className="block text-sm font-medium mb-1">Apply To</label>
            <select
              {...register('applicability.type')}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="GLOBAL">All Properties</option>
              <option value="PROPERTY">Specific Properties</option>
              <option value="ROOM_TYPE">Specific Room Types</option>
            </select>
          </div>

          {/* Additional applicability options would go here based on selection */}
          <p className="text-sm text-gray-600">
            Configure which properties or room types this offer applies to.
          </p>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Terms & Conditions</h2>
          <textarea
            {...register('terms')}
            className="w-full px-4 py-2 border rounded-lg"
            rows={4}
            placeholder="Enter terms and conditions for this offer..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/offers')}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Offer'}
          </Button>
        </div>
      </form>
    </div>
  );
};