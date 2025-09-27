import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  X,
  MapPin,
  Star,
  Image as ImageIcon,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Eye,
  Code
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { MediaEditor } from './MediaEditor';
import { contentService } from '../../services/contentService';
import { mediaService } from '../../services/mediaService';
import { type Property } from '../../types/entities';
import { useAuth } from '../../../hooks/admin/useAuth';
import { CoordinatePreview } from '../shared/CoordinatePreview';

export const PropertyEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    if (id) {
      loadProperty();
    } else {
      // Create new property
      setProperty({
        id: '',
        name: '',
        slug: '',
        tagline: '',
        shortDescription: '',
        description: '',
        address: '',
        latitude: 0,
        longitude: 0,
        checkIn: '2:00 PM',
        checkOut: '11:00 AM',
        amenities: [],
        heroImage: '',
        gallery: [],
        featured: false,
        seo: {
          title: '',
          description: '',
          keywords: '',
        },
        schemaHotel: {
          priceRange: '',
          starRating: 4,
          amenities: [],
        },
        createdAt: '',
        updatedAt: '',
      });
    }
  }, [id]);

  const loadProperty = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const draft = await contentService.loadDraft();
      const prop = draft.properties.find(p => p.id === id);
      if (prop) {
        setProperty(prop);
      } else {
        navigate('/admin/content');
      }
    } catch (err) {
      console.error('Failed to load property:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!property || !user) return;

    setSaving(true);
    setErrors([]);

    try {
      // Validate
      const validation = await contentService.validateProperty(property);
      if (!validation.valid) {
        setErrors(validation.errors);
        return;
      }

      if (id) {
        await contentService.updateProperty(id, property);
      } else {
        await contentService.createProperty(property);
        navigate('/admin/content');
      }
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Save failed']);
    } finally {
      setSaving(false);
    }
  };

  const handleMediaSelect = async (media: any) => {
    if (!property) return;

    // Update hero image
    setProperty({ ...property, heroImage: media.id });
    setShowMediaPicker(false);

    // Track usage
    await mediaService.updateMediaUsage(media.id, 'Property', property.id || 'new', 'heroImage', 'add');
  };

  const handleGalleryAdd = async (media: any) => {
    if (!property) return;

    setProperty({
      ...property,
      gallery: [...property.gallery, media.id]
    });

    // Track usage
    await mediaService.updateMediaUsage(media.id, 'Property', property.id || 'new', 'gallery', 'add');
  };

  const handleGalleryRemove = async (mediaId: string) => {
    if (!property) return;

    setProperty({
      ...property,
      gallery: property.gallery.filter(id => id !== mediaId)
    });

    // Update usage
    await mediaService.updateMediaUsage(mediaId, 'Property', property.id || 'new', 'gallery', 'remove');
  };

  const handleAmenityToggle = (amenity: string) => {
    if (!property) return;

    setProperty({
      ...property,
      amenities: property.amenities.includes(amenity)
        ? property.amenities.filter(a => a !== amenity)
        : [...property.amenities, amenity]
    });
  };

  const commonAmenities = [
    'Free WiFi', 'Swimming Pool', 'Spa', 'Restaurant', 'Bar',
    'Room Service', 'Air Conditioning', 'Parking', 'Gym', 'Laundry',
    '24/7 Front Desk', 'Concierge', 'Airport Shuttle', 'Pet Friendly'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!property) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {id ? 'Edit Property' : 'New Property'}
          </h1>
          <p className="text-gray-600">
            {id ? 'Update property information' : 'Add a new property to your portfolio'}
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
                Property Name *
              </label>
              <input
                type="text"
                value={property.name}
                onChange={(e) => setProperty({ ...property, name: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <input
                type="text"
                value={property.slug}
                onChange={(e) => setProperty({ ...property, slug: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="auto-generated"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={property.tagline}
                onChange={(e) => setProperty({ ...property, tagline: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="Short, catchy description"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description
              </label>
              <textarea
                value={property.shortDescription}
                onChange={(e) => setProperty({ ...property, shortDescription: e.target.value })}
                className="w-full border rounded px-3 py-2"
                rows={3}
                placeholder="Brief overview for listings"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Description *
              </label>
              <textarea
                value={property.description}
                onChange={(e) => setProperty({ ...property, description: e.target.value })}
                className="w-full border rounded px-3 py-2"
                rows={6}
                required
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Location</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <textarea
                value={property.address}
                onChange={(e) => setProperty({ ...property, address: e.target.value })}
                className="w-full border rounded px-3 py-2"
                rows={3}
                required
              />
            </div>
          </div>

          <CoordinatePreview
            latitude={property.latitude}
            longitude={property.longitude}
            onCoordinatesChange={(lat, lng) => setProperty({ ...property, latitude: lat, longitude: lng })}
          />
        </div>

        {/* Media */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Media</h2>

          {/* Hero Image */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hero Image *
            </label>
            {property.heroImage ? (
              <div className="relative group">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={`data:image/jpeg;base64,${localStorage.getItem(`media/${property.heroImage}.jpg`)?.split(',')[1] || ''}`}
                    alt="Hero"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setProperty({ ...property, heroImage: '' })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowMediaPicker(true)}
                className="w-full aspect-video border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
              >
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Select Hero Image</p>
                </div>
              </button>
            )}
          </div>

          {/* Gallery */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Gallery Images
              </label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowMediaPicker(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Images
              </Button>
            </div>

            {property.gallery.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.gallery.map((mediaId) => (
                  <div key={mediaId} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={`data:image/jpeg;base64,${localStorage.getItem(`media/${mediaId}.jpg`)?.split(',')[1] || ''}`}
                        alt="Gallery"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => handleGalleryRemove(mediaId)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No gallery images added
              </div>
            )}
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {commonAmenities.map((amenity) => (
              <label key={amenity} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={property.amenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="rounded text-primary-600"
                />
                <span className="text-sm">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Check-in/out */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Check-in / Check-out</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-in Time
              </label>
              <input
                type="text"
                value={property.checkIn}
                onChange={(e) => setProperty({ ...property, checkIn: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="2:00 PM"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-out Time
              </label>
              <input
                type="text"
                value={property.checkOut}
                onChange={(e) => setProperty({ ...property, checkOut: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="11:00 AM"
              />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">SEO</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SEO Title
              </label>
              <input
                type="text"
                value={property.seo.title}
                onChange={(e) => setProperty({
                  ...property,
                  seo: { ...property.seo, title: e.target.value }
                })}
                className="w-full border rounded px-3 py-2"
                placeholder="Custom title for search engines"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <textarea
                value={property.seo.description}
                onChange={(e) => setProperty({
                  ...property,
                  seo: { ...property.seo, description: e.target.value }
                })}
                className="w-full border rounded px-3 py-2"
                rows={3}
                placeholder="Description for search results"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keywords
              </label>
              <input
                type="text"
                value={property.seo.keywords || ''}
                onChange={(e) => setProperty({
                  ...property,
                  seo: { ...property.seo, keywords: e.target.value }
                })}
                className="w-full border rounded px-3 py-2"
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Options</h2>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={property.featured}
              onChange={(e) => setProperty({ ...property, featured: e.target.checked })}
              className="rounded text-primary-600"
            />
            <span className="text-sm">Feature this property on homepage</span>
          </label>
        </div>
      </div>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl h-[80vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Select Media</h3>
              <Button variant="ghost" onClick={() => setShowMediaPicker(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <MediaEditor
                onSelect={(media) => {
                  if (property.heroImage === '') {
                    handleMediaSelect(media);
                  } else {
                    handleGalleryAdd(media);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};