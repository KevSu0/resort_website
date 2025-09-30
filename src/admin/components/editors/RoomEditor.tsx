import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  X,
  Users,
  Bed,
  MapPin,
  Star,
  Image as ImageIcon,
  Plus,
  Trash2,
  AlertCircle,
  Eye,
  IndianRupee
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { MediaEditor } from './MediaEditor';
import { contentService } from '../../services/contentService';
import { mediaService } from '../../services/mediaService';
import { type RoomType } from '../../types/entities';
import { useAuth } from '../../../hooks/admin/useAuth';

interface PropertyOption {
  id: string;
  name: string;
}

export const RoomEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState<RoomType | null>(null);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    loadProperties();
    if (id) {
      loadRoom();
    } else {
      // Create new room
      setRoom({
        id: '',
        propertyId: '',
        name: '',
        slug: '',
        category: 'Standard',
        capacity: 2,
        baseRateBand: {
          base: 0,
          seasonMultiplier: 1.0,
          minOccupancy: 1,
          maxOccupancy: 2
        },
        description: '',
        amenities: [],
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

  const loadRoom = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const draft = await contentService.loadDraft();
      const rm = draft.rooms.find(r => r.id === id);
      if (rm) {
        setRoom(rm);
      } else {
        navigate('/admin/content');
      }
    } catch (err) {
      console.error('Failed to load room:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!room || !user) return;

    setSaving(true);
    setErrors([]);

    try {
      // Validate
      const validation = await contentService.validateRoom(room);
      if (!validation.valid) {
        setErrors(validation.errors);
        return;
      }

      if (id) {
        await contentService.updateRoom(id, room);
      } else {
        await contentService.createRoom(room);
        navigate('/admin/content');
      }
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Save failed']);
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = async (media: any) => {
    if (!room) return;

    setRoom({
      ...room,
      images: [...room.images, media.id]
    });

    // Track usage
    await mediaService.updateMediaUsage(media.id, 'Room', room.id || 'new', 'images', 'add');
  };

  const handleImageRemove = async (mediaId: string) => {
    if (!room) return;

    setRoom({
      ...room,
      images: room.images.filter(id => id !== mediaId)
    });

    // Update usage
    await mediaService.updateMediaUsage(mediaId, 'Room', room.id || 'new', 'images', 'remove');
  };

  const handleAmenityToggle = (amenity: string) => {
    if (!room) return;

    setRoom({
      ...room,
      amenities: room.amenities.includes(amenity)
        ? room.amenities.filter(a => a !== amenity)
        : [...room.amenities, amenity]
    });
  };

  const roomCategories = ['Standard', 'Deluxe', 'Suite', 'Villa', 'Cottage', 'Treehouse'];
  const roomAmenities = [
    'Air Conditioning', 'WiFi', 'TV', 'Mini Bar', 'Tea/Coffee Maker',
    'Balcony', 'Bathtub', 'Shower', 'Safe', 'Hair Dryer', 'Room Service',
    'Kitchenette', 'Fireplace', 'Jacuzzi', 'Mountain View', 'Garden View'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {id ? 'Edit Room' : 'New Room'}
          </h1>
          <p className="text-gray-600">
            {id ? 'Update room information' : 'Add a new room type'}
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
                value={room.propertyId}
                onChange={(e) => setRoom({ ...room, propertyId: e.target.value })}
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
                Category *
              </label>
              <select
                value={room.category}
                onChange={(e) => setRoom({ ...room, category: e.target.value as any })}
                className="w-full border rounded px-3 py-2"
                required
              >
                {roomCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Name *
              </label>
              <input
                type="text"
                value={room.name}
                onChange={(e) => setRoom({ ...room, name: e.target.value })}
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
                value={room.slug}
                onChange={(e) => setRoom({ ...room, slug: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="auto-generated"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity *
              </label>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  value={room.capacity}
                  onChange={(e) => setRoom({ ...room, capacity: parseInt(e.target.value) || 1 })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Rate *
              </label>
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={room.baseRateBand.base}
                  onChange={(e) => setRoom({
                    ...room,
                    baseRateBand: {
                      ...room.baseRateBand,
                      base: parseInt(e.target.value) || 0
                    }
                  })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={room.description}
                onChange={(e) => setRoom({ ...room, description: e.target.value })}
                className="w-full border rounded px-3 py-2"
                rows={4}
                required
              />
            </div>
          </div>
        </div>

        {/* Rate Configuration */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Rate Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Season Multiplier
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={room.baseRateBand.seasonMultiplier}
                onChange={(e) => setRoom({
                  ...room,
                  baseRateBand: {
                    ...room.baseRateBand,
                    seasonMultiplier: parseFloat(e.target.value) || 1.0
                  }
                })}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Occupancy
              </label>
              <input
                type="number"
                min="1"
                value={room.baseRateBand.minOccupancy}
                onChange={(e) => setRoom({
                  ...room,
                  baseRateBand: {
                    ...room.baseRateBand,
                    minOccupancy: parseInt(e.target.value) || 1
                  }
                })}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Occupancy
              </label>
              <input
                type="number"
                min="1"
                value={room.baseRateBand.maxOccupancy}
                onChange={(e) => setRoom({
                  ...room,
                  baseRateBand: {
                    ...room.baseRateBand,
                    maxOccupancy: parseInt(e.target.value) || 2
                  }
                })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Images</h2>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              Add images to showcase the room
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

          {room.images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {room.images.map((mediaId) => (
                <div key={mediaId} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={`data:image/jpeg;base64,${localStorage.getItem(`media/${mediaId}.jpg`)?.split(',')[1] || ''}`}
                      alt="Room"
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

        {/* Amenities */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {roomAmenities.map((amenity) => (
              <label key={amenity} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={room.amenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="rounded text-primary-600"
                />
                <span className="text-sm">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Options</h2>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={room.featured}
              onChange={(e) => setRoom({ ...room, featured: e.target.checked })}
              className="rounded text-primary-600"
            />
            <span className="text-sm">Feature this room on property page</span>
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