import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Wifi, Car, Coffee, Users, Calendar, DollarSign } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  variant?: 'default' | 'compact' | 'featured';
  showBookingButton?: boolean;
  className?: string;
}

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  parking: Car,
  breakfast: Coffee,
  // Add more amenity mappings as needed
};

export default function PropertyCard({ 
  property, 
  variant = 'default',
  showBookingButton = true,
  className = ''
}: PropertyCardProps) {
  const {
    id,
    name,
    slug,
    description,
    images,
    location,
    amenities,
    rating,
    reviewCount,
    priceRange,
    capacity,
    isActive
  } = property;

  if (!isActive) return null;

  const propertyUrl = `/properties/${slug}`;
  const mainImage = images?.[0] || 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20resort%20property%20exterior%20view%20modern%20architecture&image_size=landscape_16_9';

  const renderAmenities = () => {
    if (!amenities?.length) return null;
    
    const displayAmenities = variant === 'compact' ? amenities.slice(0, 3) : amenities.slice(0, 6);
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {displayAmenities.map((amenity, index) => {
          const Icon = amenityIcons[amenity.toLowerCase()] || Coffee;
          return (
            <div 
              key={index}
              className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full"
              title={amenity}
            >
              <Icon className="w-3 h-3" />
              <span className="capitalize">{amenity}</span>
            </div>
          );
        })}
        {amenities.length > displayAmenities.length && (
          <span className="text-xs text-gray-500 px-2 py-1">
            +{amenities.length - displayAmenities.length} more
          </span>
        )}
      </div>
    );
  };

  const renderRating = () => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center space-x-1">
        <Star className="w-4 h-4 text-yellow-400 fill-current" />
        <span className="text-sm font-medium text-gray-900">{rating.toFixed(1)}</span>
        {reviewCount && (
          <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
        )}
      </div>
    );
  };

  if (variant === 'compact') {
    return (
      <Link 
        to={propertyUrl}
        className={`block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden ${className}`}
      >
        <div className="flex">
          <div className="w-32 h-24 flex-shrink-0">
            <img
              src={mainImage}
              alt={name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex-1 p-3">
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{name}</h3>
            <div className="flex items-center text-xs text-gray-600 mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="line-clamp-1">{location.city}, {location.country}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              {renderRating()}
              {priceRange && (
                <div className="text-sm font-medium text-blue-600">
                  ${priceRange.min}+/night
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <div className={`bg-white rounded-xl shadow-xl overflow-hidden ${className}`}>
        <div className="relative">
          <img
            src={mainImage}
            alt={name}
            className="w-full h-64 object-cover"
            loading="lazy"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              Featured
            </span>
          </div>
          {rating && (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
              {renderRating()}
            </div>
          )}
        </div>
        
        <div className="p-6">
          <Link to={propertyUrl}>
            <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              {name}
            </h3>
          </Link>
          
          <div className="flex items-center text-gray-600 mt-2">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{location.city}, {location.country}</span>
          </div>
          
          <p className="text-gray-600 mt-3 line-clamp-2">{description}</p>
          
          {renderAmenities()}
          
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {capacity && (
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>Up to {capacity} guests</span>
                </div>
              )}
            </div>
            
            {priceRange && (
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  ${priceRange.min}
                </div>
                <div className="text-sm text-gray-500">per night</div>
              </div>
            )}
          </div>
          
          {showBookingButton && (
            <Link
              to={`${propertyUrl}/book`}
              className="w-full mt-4 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center block"
            >
              Book Now
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden ${className}`}>
      <Link to={propertyUrl} className="block">
        <div className="relative">
          <img
            src={mainImage}
            alt={name}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
          {rating && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
              {renderRating()}
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={propertyUrl}>
          <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">
            {name}
          </h3>
        </Link>
        
        <div className="flex items-center text-gray-600 mt-1">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm line-clamp-1">{location.city}, {location.country}</span>
        </div>
        
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{description}</p>
        
        {renderAmenities()}
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {capacity && (
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{capacity}</span>
              </div>
            )}
          </div>
          
          {priceRange && (
            <div className="text-right">
              <div className="font-semibold text-blue-600">
                ${priceRange.min}+
              </div>
              <div className="text-xs text-gray-500">per night</div>
            </div>
          )}
        </div>
        
        {showBookingButton && (
          <Link
            to={`${propertyUrl}/book`}
            className="w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors text-center block text-sm"
          >
            Book Now
          </Link>
        )}
      </div>
    </div>
  );
}

// Property grid component
export function PropertyGrid({ 
  properties, 
  variant = 'default',
  className = '' 
}: { 
  properties: Property[]; 
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}) {
  if (!properties.length) {
    return (
      <div className="text-center py-12">
        <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
        <p className="text-gray-600">Try adjusting your search criteria.</p>
      </div>
    );
  }

  const gridClasses = {
    default: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    compact: 'space-y-4',
    featured: 'grid grid-cols-1 lg:grid-cols-2 gap-8'
  };

  return (
    <div className={`${gridClasses[variant]} ${className}`}>
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          variant={variant}
        />
      ))}
    </div>
  );
}