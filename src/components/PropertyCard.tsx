import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Wifi, Car, Coffee, Utensils, Wind } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  variant?: 'default' | 'compact' | 'featured';
  showBookingButton?: boolean;
  className?: string;
}

const amenityIcons: { [key: string]: React.ElementType } = {
  'Wifi': Wifi,
  'Parking': Car,
  'Coffee': Coffee,
  'Restaurant': Utensils,
  'Air Conditioning': Wind,
  'Default': Star
};

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
    active,
    rating,
    reviewCount,
    amenities,
    price
  } = property;

  if (!active) return null;

  const propertyUrl = `/properties/${slug}`;
  const mainImage = branding.logo_url || 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20resort%20property%20exterior%20view%20modern%20architecture&image_size=landscape_16_9';

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
          {rating && (
            <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full px-2 py-1 text-xs font-semibold flex items-center">
              <Star className="w-3 h-3 text-yellow-400 mr-1" />
              {rating.toFixed(1)}
              {reviewCount && <span className="text-gray-600 font-normal ml-1">({reviewCount})</span>}
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
          <span className="text-sm line-clamp-1">{location.address}</span>
        </div>

        {amenities && amenities.length > 0 && (
          <div className="mt-2 flex items-center space-x-2">
            {amenities.slice(0, 4).map(amenity => {
              const Icon = amenityIcons[amenity] || amenityIcons.Default;
              return <Icon key={amenity} className="w-4 h-4 text-gray-500" title={amenity} />;
            })}
            {amenities.length > 4 && (
              <span className="text-xs text-gray-500">+{amenities.length - 4} more</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
            {price ? (
                <p className="text-lg font-bold text-gray-900">
                    ${price}
                    <span className="text-sm font-normal text-gray-600">/night</span>
                </p>
            ) : (
                <div />
            )}
            {showBookingButton && (
                <Link
                    to={`${propertyUrl}/book`}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors text-center block text-sm"
                >
                    Book Now
                </Link>
            )}
        </div>
      </div>
    </div>
  );
}