import { useState, useRef, useCallback } from 'react';
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
  AlertCircle,
  FileImage,
  X
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
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    await processFiles(Array.from(files));
    event.target.value = ''; // Reset input
  };

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const processFiles = async (files: File[]) => {
    // Filter to only images and videos
    const validFiles = files.filter(file =>
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (validFiles.length === 0) {
      alert('Please select valid image or video files');
      return;
    }

    // Add to upload queue
    setUploadQueue(prev => [...prev, ...validFiles]);

    // Process each file
    for (const file of validFiles) {
      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const current = prev[file.name] || 0;
            if (current >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return { ...prev, [file.name]: current + 10 };
          });
        }, 100);

        const alt = prompt(`Enter alt text for ${file.name}:`, file.name.replace(/\.[^/.]+$/, ''));
        if (alt === null) {
          // User cancelled
          clearInterval(progressInterval);
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[file.name];
            return newProgress;
          });
          continue;
        }

        await uploadMedia(file, alt || file.name);

        // Complete progress
        clearInterval(progressInterval);
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

        // Remove from queue after delay
        setTimeout(() => {
          setUploadQueue(prev => prev.filter(f => f.name !== file.name));
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[file.name];
            return newProgress;
          });
        }, 1000);
      } catch (err) {
        alert(`Failed to upload ${file.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setUploadQueue(prev => prev.filter(f => f.name !== file.name));
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }
    }
  };

  const removeFromQueue = (fileName: string) => {
    setUploadQueue(prev => prev.filter(f => f.name !== fileName));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
  };

  const handleDelete = async (mediaId: string) => {
    try {
      await deleteMedia(mediaId);
      setShowDeleteConfirm(null);
      setSelectedMedia(prev => prev.filter(id => id !== mediaId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleBulkDelete = async () => {
    try {
      for (const mediaId of selectedMedia) {
        await deleteMedia(mediaId);
      }
      setSelectedMedia([]);
      setShowBulkDeleteConfirm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bulk delete failed');
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
      className={`relative group cursor-pointer border-2 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg ${
        selectedMedia.includes(media.id) ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200 hover:border-gray-300'
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
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <Video className="w-16 h-16 text-gray-400" />
          </div>
        )}

        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200">
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => { e.stopPropagation(); handleEdit(media); }}
              className="bg-white/90 hover:bg-white text-gray-700 border-gray-300"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => { e.stopPropagation(); copyReference(media); }}
              className="bg-white/90 hover:bg-white text-gray-700 border-gray-300"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(media.id); }}
              className="bg-red-500/90 hover:bg-red-500 text-white border-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white">
        <p className="text-sm font-medium text-gray-900 truncate" title={media.originalName}>
          {media.originalName}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {formatBytes(media.bytes)}
          {media.usedBy && media.usedBy.length > 0 && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Used {media.usedBy.length}x
            </span>
          )}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Media Library</h2>
          <p className="text-sm text-gray-600 mt-1">
            {mediaItems.length} items
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
              className="rounded-r-none border-r border-gray-300"
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
            className="px-4 py-2"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-3">Uploading {uploadQueue.length} file{uploadQueue.length > 1 ? 's' : ''}...</h3>
          <div className="space-y-2">
            {uploadQueue.map((file) => (
              <div key={file.name} className="flex items-center justify-between bg-white rounded-lg p-3">
                <div className="flex items-center gap-3 flex-1">
                  <FileImage className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress[file.name] || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 w-10">
                      {uploadProgress[file.name] || 0}%
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromQueue(file.name)}
                  className="text-red-600 hover:text-red-700 ml-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drag and Drop Zone */}
      <div
        ref={dropZoneRef}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Drag and drop files here
        </h3>
        <p className="text-gray-600 mb-4">or</p>
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="mx-auto"
        >
          <Upload className="w-4 h-4 mr-2" />
          Browse Files
        </Button>
        <p className="text-xs text-gray-500 mt-4">
          Supported formats: JPG, PNG, WebP, AVIF (images), MP4 (videos)<br />
          Max file size: 1.5MB for hero images, 1MB for gallery, 20MB for videos
        </p>
      </div>

      {/* Bulk Actions Bar */}
      {selectedMedia.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedMedia.length} item{selectedMedia.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMedia([])}
              >
                Clear Selection
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowBulkDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filters.kind}
            onChange={(e) => updateFilters({ kind: e.target.value as any })}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={filters.unused}
            onChange={(e) => updateFilters({ unused: e.target.checked })}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          Show unused only
        </label>

        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search media..."
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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

      {/* Media grid/list */}
      {!loading && (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6'
          : 'space-y-3'
        }>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Edit Media</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={editingMedia.alt}
                  onChange={(e) => setEditingMedia({ ...editingMedia, alt: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Required for accessibility
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditingMedia(null)} className="px-4 py-2">
                  Cancel
                </Button>
                <Button onClick={saveEdit} className="px-4 py-2">
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Confirm Delete</h3>

            <div className="space-y-6">
              <p className="text-gray-600">Are you sure you want to delete this media item? This action cannot be undone.</p>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(showDeleteConfirm)} className="px-4 py-2">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk delete confirmation */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Confirm Bulk Delete</h3>

            <div className="space-y-6">
              <p className="text-gray-600">
                Are you sure you want to delete {selectedMedia.length} selected media items? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowBulkDeleteConfirm(false)} className="px-4 py-2">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleBulkDelete} className="px-4 py-2">
                  Delete {selectedMedia.length} Items
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};