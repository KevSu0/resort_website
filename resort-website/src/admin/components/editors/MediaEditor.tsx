import { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Video,
  Trash2,
  Edit,
  Copy,
  Search,
  Filter,
  Grid,
  List,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useMedia } from '../../../hooks/admin/useMedia';
import { type Media } from '../../types/entities';
import { formatBytes } from '../../../utils';

interface MediaEditorProps {
  onSelect?: (media: Media) => void;
  multiSelect?: boolean;
}

export const MediaEditor: React.FC<MediaEditorProps> = ({ onSelect, multiSelect = false }) => {
  const {
    mediaItems,
    loading,
    error,
    filters,
    uploadMedia,
    deleteMedia,
    updateMedia,
    updateFilters
  } = useMedia();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const alt = prompt('Enter alt text for this image:');
      if (alt === null) return; // User cancelled

      await uploadMedia(file, alt || file.name);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      event.target.value = ''; // Reset input
    }
  };

  const handleDelete = async (mediaId: string) => {
    try {
      await deleteMedia(mediaId);
      setShowDeleteConfirm(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleEdit = (media: Media) => {
    setEditingMedia(media);
  };

  const saveEdit = async () => {
    if (!editingMedia) return;

    try {
      await updateMedia(editingMedia.id, { alt: editingMedia.alt });
      setEditingMedia(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const copyReference = (media: Media) => {
    const ref = `media:${media.id}`;
    navigator.clipboard.writeText(ref);
    alert('Media reference copied to clipboard');
  };

  const toggleSelect = (mediaId: string) => {
    if (multiSelect) {
      setSelectedMedia(prev =>
        prev.includes(mediaId)
          ? prev.filter(id => id !== mediaId)
          : [...prev, mediaId]
      );
    } else if (onSelect) {
      const media = mediaItems.find(m => m.id === mediaId);
      if (media) onSelect(media);
    }
  };

  const MediaItem = ({ media }: { media: Media }) => (
    <div
      className={`relative group cursor-pointer border rounded-lg overflow-hidden transition-all hover:shadow-md ${
        selectedMedia.includes(media.id) ? 'ring-2 ring-primary-500' : ''
      }`}
      onClick={() => toggleSelect(media.id)}
    >
      <div className="aspect-square bg-gray-100 relative">
        {media.kind === 'image' ? (
          <img
            src={`data:${media.mime};base64,${localStorage.getItem(`media/${media.id}.${media.filename.split('.').pop()}`)?.split(',')[1] || ''}`}
            alt={media.alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="w-12 h-12 text-gray-400" />
          </div>
        )}

        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity">
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => { e.stopPropagation(); handleEdit(media); }}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => { e.stopPropagation(); copyReference(media); }}
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(media.id); }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-2">
        <p className="text-sm font-medium truncate" title={media.originalName}>
          {media.originalName}
        </p>
        <p className="text-xs text-gray-500">
          {formatBytes(media.bytes)}
          {media.usedBy && media.usedBy.length > 0 && (
            <span className="ml-2 text-green-600">
              • Used {media.usedBy.length}x
            </span>
          )}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Media Library</h2>
          <p className="text-sm text-gray-600">
            {mediaItems.length} items
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex border rounded-md">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Upload button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filters.kind}
            onChange={(e) => updateFilters({ kind: e.target.value as any })}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.unused}
            onChange={(e) => updateFilters({ unused: e.target.checked })}
          />
          Show unused only
        </label>

        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search media..."
            className="pl-9 pr-4 py-1 border rounded text-sm w-64"
          />
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Media grid */}
      {!loading && (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4' : 'space-y-2'}>
          {mediaItems.map((media) => (
            <MediaItem key={media.id} media={media} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && mediaItems.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No media items</h3>
          <p className="text-gray-600 mb-4">Upload images and videos to get started</p>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Media
          </Button>
        </div>
      )}

      {/* Edit modal */}
      {editingMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Media</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={editingMedia.alt}
                  onChange={(e) => setEditingMedia({ ...editingMedia, alt: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Required for accessibility
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingMedia(null)}>
                  Cancel
                </Button>
                <Button onClick={saveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>

            <div className="space-y-4">
              <p>Are you sure you want to delete this media item?</p>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(showDeleteConfirm)}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};