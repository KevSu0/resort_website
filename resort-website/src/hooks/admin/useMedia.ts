import { useState, useEffect } from 'react';
import { type Media } from '../../admin/types/entities';
import { mediaService } from '../../admin/services/mediaService';
import { fileStorageService } from '../../admin/services/fileStorage';

interface UseMediaOptions {
  autoLoad?: boolean;
}

export const useMedia = (options: UseMediaOptions = {}) => {
  const { autoLoad = true } = options;
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    kind: 'all' as 'all' | 'image' | 'video',
    unused: false,
    propertyId: '',
  });

  // Load media items
  const loadMedia = async () => {
    setLoading(true);
    setError(null);

    try {
      const manifest = await fileStorageService.loadMediaManifest();
      const items = Object.values(manifest);

      // Apply filters
      let filtered = items;
      if (filters.kind !== 'all') {
        filtered = filtered.filter(item => item.kind === filters.kind);
      }
      if (filters.unused) {
        filtered = filtered.filter(item => !item.usedBy || item.usedBy.length === 0);
      }

      setMediaItems(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  // Upload media
  const uploadMedia = async (file: File, alt: string, type: 'hero' | 'gallery' | 'video' = 'gallery') => {
    try {
      const newMedia = await mediaService.uploadMedia(file, alt, type);
      await loadMedia(); // Refresh list
      return newMedia;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      throw err;
    }
  };

  // Replace media
  const replaceMedia = async (mediaId: string, file: File) => {
    try {
      const updatedMedia = await mediaService.replaceMedia(mediaId, file);
      await loadMedia(); // Refresh list
      return updatedMedia;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Replace failed');
      throw err;
    }
  };

  // Delete media
  const deleteMedia = async (mediaId: string) => {
    try {
      await mediaService.deleteMedia(mediaId);
      await loadMedia(); // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      throw err;
    }
  };

  // Update media metadata
  const updateMedia = async (mediaId: string, updates: Partial<Media>) => {
    try {
      const media = await fileStorageService.loadMedia(mediaId);
      if (!media) {
        throw new Error('Media not found');
      }

      const updated = { ...media, ...updates };
      const manifest = await fileStorageService.loadMediaManifest();
      manifest[mediaId] = updated;
      const key = 'data/media-manifest.json';
      localStorage.setItem(key, JSON.stringify(manifest, null, 2));

      await loadMedia(); // Refresh list
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
      throw err;
    }
  };

  // Get media file URL
  const getMediaUrl = async (mediaId: string): Promise<string | null> => {
    try {
      return await fileStorageService.getMediaFile(mediaId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get media URL');
      return null;
    }
  };

  // Update filters
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Load on mount if autoLoad is true
  useEffect(() => {
    if (autoLoad) {
      loadMedia();
    }
  }, [autoLoad, filters]);

  return {
    mediaItems,
    loading,
    error,
    filters,
    uploadMedia,
    replaceMedia,
    deleteMedia,
    updateMedia,
    getMediaUrl,
    updateFilters,
    refresh: loadMedia,
  };
};