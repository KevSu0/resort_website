import React from 'react';
import { Star, MapPin, Wifi, Car, Utensils, Dumbbell, Heart, Share2, ExternalLink } from 'lucide-react';
import type { Property } from '../types';

interface SearchResultsListProps {
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
  className?: string;
}

interface PropertyListItemProps {
  property: Property;
  onSelect?: (property: Property) => void;
}

export default function SearchResultsList({
  properties,
  onPropertySelect,
  className = ''
}: SearchResultsListProps) {
  if (properties.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-400 mb-4">
          <MapPin className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
        <p className="text-gray-600">Try adjusting your filters or search criteria.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {properties.map((property) => (
        <PropertyListItem
          key={property.id}
          property={property}
          onSelect={onPropertySelect}
        />
      ))}
    </div>
  );
}

function PropertyListItem({ property, onSelect }: PropertyListItemProps) {
  const handleClick = () => {
    onSelect?.(property);
  };

  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) {
      return <Wifi className="w-4 h-4" />;
    }
    if (amenityLower.includes('parking') || amenityLower.includes('garage')) {
      return <Car className="w-4 h-4" />;
    }
    if (amenityLower.includes('restaurant') || amenityLower.includes('dining')) {
      return <Utensils className="w-4 h-4" />;
    }
    if (amenityLower.includes('gym') || amenityLower.includes('fitness')) {
      return <Dumbbell className="w-4 h-4" />;
    }
    return null;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : i < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md overflow-hidden">
      <div className="flex">
        {/* Property Image */}
        <div className="flex-shrink-0 w-64 h-48 relative">
          <img
            src={property.branding.hero_image || ''}
            alt={property.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3">
            <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
              {property.stay_types.join(', ')}
            </span>
          </div>
          <div className="absolute top-3 right-3 flex gap-2">
            <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
              <Heart className="w-4 h-4 text-gray-600" />
            </button>
            <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
              <Share2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Property Details */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-1 hover:text-blue-600 cursor-pointer transition-colors">
                {property.name}
              </h3>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{property.location.address}</span>
                <span className="mx-2 text-gray-400">•</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                ${property.priceRange?.min}-${property.priceRange?.max}
              </div>
              <div className="text-sm text-gray-600">per night</div>
            </div>
          </div>

          {/* Rating and Reviews */}
          <div className="flex items-center mb-3">
            <div className="flex items-center mr-3">
              {renderStars(property.rating)}
            </div>
            <span className="text-sm font-medium text-gray-900 mr-1">
              {property.rating}
            </span>
            <span className="text-sm text-gray-600">
              ({property.reviewCount} reviews)
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-700 text-sm mb-4 line-clamp-2">
            {property.branding.description}
          </p>

          {/* Amenities */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {property.amenities?.slice(0, 6).map((amenity, index) => {
                const icon = getAmenityIcon(amenity);
                return (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                  >
                    {icon}
                    <span>{amenity}</span>
                  </div>
                );
              })}
              {property.amenities && property.amenities.length > 6 && (
                <div className="flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                  +{property.amenities.length - 6} more
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={handleClick}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                View Details
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                Check Availability
              </button>
            </div>
            
            <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium">
              <ExternalLink className="w-4 h-4" />
              View on Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
