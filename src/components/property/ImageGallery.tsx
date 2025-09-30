import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  propertyName: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, propertyName }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  if (!images.length) {
    return (
      <div className="aspect-video bg-gray-200 rounded-xl flex items-center justify-center">
        <span className="text-gray-500">No images available</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-video overflow-hidden rounded-xl group cursor-pointer"
           onClick={() => openLightbox(selectedImageIndex)}>
        <img
          src={images[selectedImageIndex]}
          alt={`${propertyName} - Image ${selectedImageIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
          {selectedImageIndex + 1} / {images.length}
        </div>

        {/* Zoom Indicator */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === selectedImageIndex
                  ? 'border-primary-600 scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={image}
                alt={`${propertyName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
             onClick={closeLightbox}>
          <div className="relative max-w-7xl max-h-full">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Lightbox Image */}
            <img
              src={images[selectedImageIndex]}
              alt={`${propertyName} - Image ${selectedImageIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />

            {/* Lightbox Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/30 transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/30 transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Lightbox Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
              {selectedImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};