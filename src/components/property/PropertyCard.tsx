import { useState } from 'react';
import { Star, MapPin, Users, Wifi, Car } from 'lucide-react';
import { type Property } from '@/types';
import { formatCurrency, fallbackImageHandler } from '@/utils';
import { IMAGE_PLACEHOLDER } from '@/constants/images';

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get the lowest room price
  const lowestPrice = property.rooms.length > 0
    ? Math.min(...property.rooms.map(room => room.baseRate || 0))
    : 0;

  // Get first 3 amenities for display
  const displayAmenities = property.amenities.slice(0, 3);

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === property.gallery.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div
      className={`group bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:shadow-2xl ${
        isHovered ? 'ring-2 ring-primary-500' : ''
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Gallery */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={property.gallery[currentImageIndex] || property.heroImage || IMAGE_PLACEHOLDER}
          alt={property.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(event) => fallbackImageHandler(event, IMAGE_PLACEHOLDER)}
        />

        {/* Image Navigation */}
        {property.gallery.length > 1 && (
          <>
            <button
              onClick={handleImageClick}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-1 hover:bg-opacity-100 transition-all"
              aria-label="Next image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {property.gallery.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Featured Badge */}
        {property.featured && (
          <div className="absolute top-4 left-4 bg-secondary-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
            Featured
          </div>
        )}

        {/* Price Tag */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg">
          <div className="text-xs text-gray-300">Starting from</div>
          <div className="text-lg font-bold">{formatCurrency(lowestPrice)}</div>
          <div className="text-xs text-gray-300">per night</div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
            {property.name}
          </h3>
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">4.8</span>
            <span className="text-gray-500">(124)</span>
          </div>
        </div>

        {property.tagline && (
          <p className="text-gray-600 text-sm mb-3">{property.tagline}</p>
        )}

        <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
          <MapPin className="w-4 h-4" />
          <span>Wayanad, Kerala</span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-4">
          {displayAmenities.map((amenity, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs"
            >
              {getAmenityIcon(amenity)}
              {amenity}
            </span>
          ))}
          {property.amenities.length > 3 && (
            <span className="text-gray-500 text-xs">
              +{property.amenities.length - 3} more
            </span>
          )}
        </div>

        {/* Quick Info */}
        <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>2-4 Guests</span>
            </div>
            <div className="flex items-center gap-1">
              <Car className="w-4 h-4" />
              <span>Parking</span>
            </div>
          </div>
          <div className="text-primary-600 font-medium">
            View Details →
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get icon for amenity
const getAmenityIcon = (amenity: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'Free WiFi': <Wifi className="w-3 h-3" />,
    'WiFi': <Wifi className="w-3 h-3" />,
    'Parking': <Car className="w-3 h-3" />,
    // Add more as needed
  };

  return iconMap[amenity] || <div className="w-3 h-3 rounded-full bg-gray-400" />;
};