import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { X, Upload, Search, Grid, List, Image as ImageIcon, FileVideo, FileText, Filter } from 'lucide-react';

import { Button } from '../../ui/button';
import { MediaAsset } from '../../../types/cms';
import { useToast } from '../../../hooks/useToast';
import { fileStorageService } from '../../../services/fileStorage';

interface MediaManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onMediaSelect: (media: MediaAsset[]) => void;
  brandId?: string;
  siteId?: string;
  acceptedTypes?: string[];
  multiple?: boolean;
  maxFiles?: number;
}

export const MediaManager: React.FC<MediaManagerProps> = ({
  isOpen,
  onClose,
  onMediaSelect,
  brandId,
  siteId,
  acceptedTypes = ['image/*', 'video/*', 'application/pdf'],
  multiple = false,
  maxFiles = 10,
}) => {
  const [files, setFiles] = useState<MediaAsset[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'document'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  // Load media files
  const loadMedia = useCallback(async () => {
    if (!brandId || !siteId) return;

    setLoading(true);
    try {
      const mediaFiles = await fileStorageService.getMediaFiles(brandId, siteId);
      setFiles(mediaFiles);
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to load media files',
      });
    } finally {
      setLoading(false);
    }
  }, [brandId, siteId, addToast]);

  useEffect(() => {
    if (isOpen && brandId && siteId) {
      loadMedia();
    }
  }, [isOpen, brandId, siteId, loadMedia]);

  // Filter and sort files
  const filteredFiles = useMemo(() => {
    const filtered = files.filter(file => {
      const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (file.alt && file.alt.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = filterType === 'all' || file.type === filterType;

      return matchesSearch && matchesType;
    });

    // Sort files
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.filename.localeCompare(b.filename);
          break;
        case 'date':
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;
        case 'size':
          comparison = b.size - a.size;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [files, searchQuery, filterType, sortBy, sortOrder]);

  const handleFileUpload = useCallback(async (fileList: FileList) => {
    if (!brandId || !siteId) return;

    setUploading(true);
    const uploadPromises = Array.from(fileList).slice(0, maxFiles).map(async (file) => {
      try {
        const uploadedFile = await fileStorageService.uploadFile(file, brandId, siteId);
        return uploadedFile;
      } catch (error) {
        addToast({
          type: 'error',
          message: `Failed to upload ${file.name}`,
        });
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter(Boolean) as MediaAsset[];

    if (successfulUploads.length > 0) {
      setFiles(prev => [...successfulUploads, ...prev]);
      addToast({
        type: 'success',
        message: `Uploaded ${successfulUploads.length} file(s) successfully`,
      });
    }

    setUploading(false);
  }, [brandId, siteId, maxFiles, addToast]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const handleFileSelect = useCallback((file: MediaAsset) => {
    if (multiple) {
      const newSelected = new Set(selectedFiles);
      if (newSelected.has(file.id)) {
        newSelected.delete(file.id);
      } else {
        newSelected.add(file.id);
      }
      setSelectedFiles(newSelected);
    } else {
      setSelectedFiles(new Set([file.id]));
    }
  }, [multiple, selectedFiles]);

  const handleInsert = useCallback(() => {
    const selectedMediaFiles = files.filter(file => selectedFiles.has(file.id));
    onMediaSelect(selectedMediaFiles);
    onClose();
  }, [files, selectedFiles, onMediaSelect, onClose]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return ImageIcon;
      case 'video':
        return FileVideo;
      case 'document':
        return FileText;
      default:
        return FileText;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Media Manager</h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-4 p-4 border-b bg-gray-50">
          {/* Upload Button */}
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload Files'}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={acceptedTypes.join(',')}
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
          />

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('-');
                setSortBy(sort as any);
                setSortOrder(order as any);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="size-desc">Largest First</option>
              <option value="size-asc">Smallest First</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-md">
              <Button
                type="button"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div
              className={`h-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-600 mb-2">
                {dragActive ? 'Drop files here' : 'No media files found'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop files here or click the upload button
              </p>
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Select Files'}
              </Button>
            </div>
          ) : (
            <div className="h-full overflow-auto">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4">
                  {filteredFiles.map((file) => {
                    const Icon = getFileIcon(file.type);
                    const isSelected = selectedFiles.has(file.id);

                    return (
                      <div
                        key={file.id}
                        onClick={() => handleFileSelect(file)}
                        className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                          isSelected ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {file.type === 'image' ? (
                          <img
                            src={file.url}
                            alt={file.alt || file.filename}
                            className="w-full h-32 object-cover"
                          />
                        ) : (
                          <div className="w-full h-32 flex items-center justify-center bg-gray-100">
                            <Icon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}

                        <div className="p-2">
                          <p className="text-xs font-medium truncate" title={file.filename}>
                            {file.filename}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>

                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredFiles.map((file) => {
                    const Icon = getFileIcon(file.type);
                    const isSelected = selectedFiles.has(file.id);

                    return (
                      <div
                        key={file.id}
                        onClick={() => handleFileSelect(file)}
                        className={`flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className={`w-10 h-10 rounded flex items-center justify-center ${
                          isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.filename}</p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        {file.type === 'image' && (
                          <img
                            src={file.url}
                            alt={file.alt || file.filename}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <p className="text-sm text-gray-600">
            {selectedFiles.size > 0 && (
              <>
                {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
              </>
            )}
          </p>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleInsert}
              disabled={selectedFiles.size === 0}
            >
              Insert {selectedFiles.size > 0 ? `(${selectedFiles.size})` : ''}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};