import React from 'react';

interface PropertyImageGalleryProps {
  images: string[];
  propertyName: string;
}

export function PropertyImageGallery({ images, propertyName }: PropertyImageGalleryProps) {
  return (
    <div className="lg:col-span-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <img
            src={images[0]}
            alt={propertyName}
            className="w-full h-64 md:h-80 object-cover rounded-lg"
          />
        </div>
        {images.slice(1, 3).map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${propertyName} ${index + 2}`}
            className="w-full h-32 md:h-40 object-cover rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}
