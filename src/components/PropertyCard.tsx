import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Wifi, Car, Coffee, Users, Building } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  variant?: 'default' | 'compact' | 'featured';
  showBookingButton?: boolean;
  className?: string;
}

export default function PropertyCard({ 
  property, 
  variant = 'default',
  showBookingButton = true,
  className = ''
}: PropertyCardProps) {
  const {
    name,
    slug,
    location,
    branding,
    active
  } = property;

  if (!active) return null;

  const propertyUrl = `/properties/${slug}`;
  const mainImage = branding.logo_url || 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20resort%20property%20exterior%20view%20modern%20architecture&image_size=landscape_16_9';

  // NOTE: Amenities, price, capacity, rating and review count are not available on the Property type.
  // This information is on the StayType level, and would require fetching all stay types for each property.
  // To avoid performance issues, this information has been removed from the card.

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
              <span className="line-clamp-1">{location.address}</span>
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
        </div>
        
        <div className="p-6">
          <Link to={propertyUrl}>
            <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              {name}
            </h3>
          </Link>
          
          <div className="flex items-center text-gray-600 mt-2">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{location.address}</span>
          </div>
          
          <p className="text-gray-600 mt-3 line-clamp-2">{branding.description}</p>
          
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
          <span className="text-sm line-clamp-1">{location.address}</span>
        </div>
        
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{branding.description}</p>
        
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