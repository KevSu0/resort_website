import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  X,
  MapPin,
  Plus,
  AlertCircle,
  Eye
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { MediaEditor } from './MediaEditor';
import { contentService } from '../../services/contentService';
import { mediaService } from '../../services/mediaService';
import { type Place } from '../../types/entities';
import { useAuth } from '../../../hooks/admin/useAuth';

interface PropertyOption {
  id: string;
  name: string;
}

export const PlaceEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [place, setPlace] = useState<Place | null>(null);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    loadProperties();
    if (id) {
      loadPlace();
    } else {
      // Create new place
      setPlace({
        id: '',
        propertyId: '',
        name: '',
        type: 'Restaurant',
        description: '',
        location: '',
        hours: '',
        images: [],
        featured: false,
        createdAt: '',
        updatedAt: ''
      });
    }
  }, [id]);

  const loadProperties = async () => {
    try {
      const draft = await contentService.loadDraft();
      setProperties(draft.properties.map(p => ({ id: p.id, name: p.name })));
    } catch (err) {
      console.error('Failed to load properties:', err);
    }
  };

  const loadPlace = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const draft = await contentService.loadDraft();
      const plc = draft.places.find(p => p.id === id);
      if (plc) {
        setPlace(plc);
      } else {
        navigate('/admin/content');
      }
    } catch (err) {
      console.error('Failed to load place:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!place || !user) return;

    setSaving(true);
    setErrors([]);

    try {
      // Validate
      if (!place.name) {
        setErrors(['Name is required']);
        return;
      }
      if (!place.propertyId) {
        setErrors(['Property is required']);
        return;
      }

      if (id) {
        await contentService.updatePlace(id, place);
      } else {
        await contentService.createPlace(place);
        navigate('/admin/content');
      }
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Save failed']);
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = async (media: any) => {
    if (!place) return;

    setPlace({
      ...place,
      images: [...place.images, media.id]
    });

    // Track usage
    await mediaService.updateMediaUsage(media.id, 'Place', place.id || 'new', 'images', 'add');
  };

  const handleImageRemove = async (mediaId: string) => {
    if (!place) return;

    setPlace({
      ...place,
      images: place.images.filter(id => id !== mediaId)
    });

    // Update usage
    await mediaService.updateMediaUsage(mediaId, 'Place', place.id || 'new', 'images', 'remove');
  };

  const placeTypes = ['Restaurant', 'Bar', 'Spa', 'Gym', 'Pool', 'Activity', 'Attraction', 'Shop'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!place) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {id ? 'Edit Place' : 'New Place'}
          </h1>
          <p className="text-gray-600">
            {id ? 'Update place information' : 'Add a new place or attraction'}
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
                Property *
              </label>
              <select
                value={place.propertyId}
                onChange={(e) => setPlace({ ...place, propertyId: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select a property</option>
                {properties.map(prop => (
                  <option key={prop.id} value={prop.id}>{prop.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                value={place.type}
                onChange={(e) => setPlace({ ...place, type: e.target.value as any })}
                className="w-full border rounded px-3 py-2"
                required
              >
                {placeTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={place.name}
                onChange={(e) => setPlace({ ...place, name: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={place.description}
                onChange={(e) => setPlace({ ...place, description: e.target.value })}
                className="w-full border rounded px-3 py-2"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={place.location}
                  onChange={(e) => setPlace({ ...place, location: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., Ground Floor, Near Lobby"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hours
              </label>
              <input
                type="text"
                value={place.hours}
                onChange={(e) => setPlace({ ...place, hours: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g., 6:00 AM - 10:00 PM"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Images</h2>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              Add images to showcase this place
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowMediaPicker(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Images
            </Button>
          </div>

          {place.images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {place.images.map((mediaId) => (
                <div key={mediaId} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={`data:image/jpeg;base64,${localStorage.getItem(`assets/images/${mediaId}.jpg`)?.split(',')[1] || ''}`}
                      alt="Place"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => handleImageRemove(mediaId)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No images added
            </div>
          )}
        </div>

        {/* Options */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Options</h2>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={place.featured}
              onChange={(e) => setPlace({ ...place, featured: e.target.checked })}
              className="rounded text-primary-600"
            />
            <span className="text-sm">Feature this place on property page</span>
          </label>
        </div>
      </div>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl h-[80vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Select Images</h3>
              <Button variant="ghost" onClick={() => setShowMediaPicker(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <MediaEditor
                onSelect={handleImageSelect}
                multiSelect={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};