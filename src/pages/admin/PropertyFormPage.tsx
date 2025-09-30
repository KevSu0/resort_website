import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Save,
  X,
  Plus,
  Trash2,
  Building,
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { propertyService } from '../../admin/services/propertyService';
import { type Property, type PropertyType, type Amenity } from '../../admin/types/entities';
import { useToast } from '../../components/ui/toast';
import { useErrorHandler } from '../../components/ErrorBoundary';

const propertySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['TREEHOUSE', 'VILLA', 'SUITE', 'DELUXE_ROOM', 'STANDARD_ROOM']),
  slug: z.string().min(1, 'Slug is required'),
  featured: z.boolean(),
  location: z.object({
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    pincode: z.string().min(1, 'Pincode is required'),
    latitude: z.number(),
    longitude: z.number()
  }),
  contact: z.object({
    phone: z.string().min(1, 'Phone is required'),
    email: z.string().email('Invalid email'),
    checkInTime: z.string().min(1, 'Check-in time is required'),
    checkOutTime: z.string().min(1, 'Check-out time is required')
  }),
  amenities: z.array(z.string()),
  heroImage: z.string().optional(),
  gallery: z.array(z.string()),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string())
  })
});

type PropertyFormData = z.infer<typeof propertySchema>;

const propertyTypeLabels = {
  TREEHOUSE: 'Treehouse',
  VILLA: 'Villa',
  SUITE: 'Suite',
  DELUXE_ROOM: 'Deluxe Room',
  STANDARD_ROOM: 'Standard Room'
};

export const PropertyFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { handleError } = useErrorHandler();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors }
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      featured: false,
      location: {
        latitude: 0,
        longitude: 0
      },
      amenities: [],
      gallery: [],
      seo: {
        keywords: []
      }
    }
  });

  const {
    fields: galleryFields,
    append: appendGallery,
    remove: removeGallery
  } = useFieldArray({
    control,
    name: 'gallery'
  });

  const watchedName = watch('name');
  const watchedType = watch('type');

  useEffect(() => {
    if (id) {
      loadProperty();
    }
    loadAmenities();
  }, [id]);

  useEffect(() => {
    // Auto-generate slug from name
    if (watchedName && !id) {
      const slug = watchedName
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setValue('slug', slug);
    }
  }, [watchedName, id, setValue]);

  const loadProperty = async () => {
    setLoading(true);
    try {
      const data = await propertyService.getProperty(id!);
      if (data) {
        setProperty(data);
        // Set form values
        Object.entries(data).forEach(([key, value]) => {
          if (key in propertySchema.shape) {
            setValue(key as keyof PropertyFormData, value as any);
          }
        });
      } else {
        navigate('/admin/content/properties');
      }
    } catch (error) {
      handleError(error, 'Failed to load property');
    } finally {
      setLoading(false);
    }
  };

  const loadAmenities = async () => {
    try {
      const amenities = await propertyService.getAmenities();
      setAvailableAmenities(amenities);
    } catch (error) {
      console.error('Failed to load amenities:', error);
    }
  };

  const onSubmit = async (data: PropertyFormData) => {
    setSaving(true);
    try {
      if (id) {
        await propertyService.updateProperty(id, data);
        toast.success('Property updated successfully');
      } else {
        await propertyService.createProperty(data);
        toast.success('Property created successfully');
      }
      navigate('/admin/content/properties');
    } catch (error) {
      handleError(error, 'Failed to save property');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isHero: boolean = false) => {
    // This would integrate with your image upload service
    // For now, we'll simulate it
    const file = e.target.files?.[0];
    if (file) {
      // Simulate upload - replace with actual upload logic
      const imageUrl = URL.createObjectURL(file);
      if (isHero) {
        setValue('heroImage', imageUrl);
      } else {
        appendGallery(imageUrl);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/content/properties')}>
            <X className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {id ? 'Edit Property' : 'Create New Property'}
            </h1>
            <p className="text-gray-600 mt-2">
              {id ? 'Update property details and settings' : 'Add a new property to your resort'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Building className="w-5 h-5" />
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Property Name *</label>
                  <input
                    {...register('name')}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., Treehouse Villa"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Property Type *</label>
                  <select
                    {...register('type')}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    {Object.entries(propertyTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  {...register('description')}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={4}
                  placeholder="Describe your property..."
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Slug *</label>
                  <input
                    {...register('slug')}
                    className="w-full px-4 py-2 border rounded-lg font-mono"
                    placeholder="property-url-slug"
                  />
                  {errors.slug && (
                    <p className="text-sm text-red-600 mt-1">{errors.slug.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Used in URLs: /properties/{watchedName?.toLowerCase().replace(/\s+/g, '-') || 'slug'}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    {...register('featured')}
                    className="rounded"
                  />
                  <label htmlFor="featured" className="text-sm font-medium">
                    Feature this property on homepage
                  </label>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Address *</label>
                  <textarea
                    {...register('location.address')}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={2}
                    placeholder="Street address"
                  />
                  {errors.location?.address && (
                    <p className="text-sm text-red-600 mt-1">{errors.location.address.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">City *</label>
                  <input
                    {...register('location.city')}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., Wayanad"
                  />
                  {errors.location?.city && (
                    <p className="text-sm text-red-600 mt-1">{errors.location.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">State *</label>
                  <input
                    {...register('location.state')}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., Kerala"
                  />
                  {errors.location?.state && (
                    <p className="text-sm text-red-600 mt-1">{errors.location.state.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Country *</label>
                  <input
                    {...register('location.country')}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., India"
                  />
                  {errors.location?.country && (
                    <p className="text-sm text-red-600 mt-1">{errors.location.country.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Pincode *</label>
                  <input
                    {...register('location.pincode')}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., 673577"
                  />
                  {errors.location?.pincode && (
                    <p className="text-sm text-red-600 mt-1">{errors.location.pincode.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Coordinates (Optional)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="any"
                      {...register('location.latitude', { valueAsNumber: true })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Latitude"
                    />
                    <input
                      type="number"
                      step="any"
                      {...register('location.longitude', { valueAsNumber: true })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Longitude"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Phone *</label>
                  <input
                    {...register('contact.phone')}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="+91 1234567890"
                  />
                  {errors.contact?.phone && (
                    <p className="text-sm text-red-600 mt-1">{errors.contact.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    {...register('contact.email')}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="resort@example.com"
                  />
                  {errors.contact?.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.contact.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Check-in Time *</label>
                  <input
                    {...register('contact.checkInTime')}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., 2:00 PM"
                  />
                  {errors.contact?.checkInTime && (
                    <p className="text-sm text-red-600 mt-1">{errors.contact.checkInTime.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Check-out Time *</label>
                  <input
                    {...register('contact.checkOutTime')}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., 11:00 AM"
                  />
                  {errors.contact?.checkOutTime && (
                    <p className="text-sm text-red-600 mt-1">{errors.contact.checkOutTime.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h2 className="text-lg font-semibold">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableAmenities.map((amenity) => (
                  <label key={amenity.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={amenity.id}
                      {...register('amenities')}
                      className="rounded"
                    />
                    <span className="text-sm">{amenity.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Hero Image */}
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h2 className="text-lg font-semibold">Hero Image</h2>
              <div className="space-y-3">
                {watch('heroImage') ? (
                  <div className="relative">
                    <img
                      src={watch('heroImage')}
                      alt="Hero"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setValue('heroImage', '')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="block w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="text-sm">Click to upload hero image</span>
                      <span className="text-xs">Recommended: 2000x1333px</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, true)}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Gallery */}
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Gallery</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendGallery('')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Image
                </Button>
              </div>
              <div className="space-y-3">
                {galleryFields.map((field, index) => (
                  <div key={field.id} className="relative">
                    {field.value ? (
                      <img
                        src={field.value}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <label className="block w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <Upload className="w-6 h-6 mb-1" />
                          <span className="text-sm">Upload image</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e)}
                        />
                      </label>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeGallery(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* SEO */}
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h2 className="text-lg font-semibold">SEO Settings</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">SEO Title</label>
                  <input
                    {...register('seo.title')}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Optional: Custom SEO title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Meta Description</label>
                  <textarea
                    {...register('seo.description')}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={3}
                    placeholder="Optional: Meta description for search engines"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/content/properties')}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Property'}
          </Button>
        </div>
      </form>
    </div>
  );
};