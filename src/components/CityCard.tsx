import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Building, ArrowRight } from 'lucide-react';
import { City } from '../types';

interface CityCardProps {
  city: City;
  variant?: 'default' | 'compact' | 'hero';
  showPropertyCount?: boolean;
  className?: string;
}

export default function CityCard({ 
  city, 
  variant = 'default',
  showPropertyCount = true,
  className = ''
}: CityCardProps) {
  const {
    name,
    slug,
    country,
    state,
    property_ids
  } = city;

  const cityUrl = `/locations/${slug}`;
  const mainImage = `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`${name} ${country} cityscape beautiful destination travel`)}&image_size=landscape_16_9`;

  const propertyCount = property_ids.length;

  if (variant === 'compact') {
    return (
      <Link 
        to={cityUrl}
        className={`block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden ${className}`}
      >
        <div className="flex">
          <div className="w-24 h-20 flex-shrink-0">
            <img
              src={mainImage}
              alt={`${name}, ${country}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex-1 p-3">
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{name}</h3>
            <div className="flex items-center text-xs text-gray-600 mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              <span>{country}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              {showPropertyCount && propertyCount && (
                <div className="flex items-center text-xs text-gray-600">
                  <Building className="w-3 h-3 mr-1" />
                  <span>{propertyCount} properties</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'hero') {
    return (
      <div className={`relative overflow-hidden rounded-2xl ${className}`}>
        <div className="absolute inset-0">
          <img
            src={mainImage}
            alt={`${name}, ${country}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
        
        <div className="relative p-8 h-80 flex flex-col justify-end text-white">
          <Link to={cityUrl}>
            <h2 className="text-3xl font-bold mb-2 hover:text-blue-200 transition-colors">
              {name}
            </h2>
          </Link>
          
          <div className="flex items-center text-white/90 mb-3">
            <MapPin className="w-5 h-5 mr-2" />
            <span className="text-lg">{country}</span>
          </div>
          
          <p className="text-white/90 mb-4 line-clamp-2">{city.seo_data.meta_description}</p>
          
          <div className="flex items-center justify-between">
            {showPropertyCount && propertyCount && (
              <div className="flex items-center text-white/90">
                <Building className="w-5 h-5 mr-2" />
                <span>{propertyCount} properties available</span>
              </div>
            )}
            
            <Link
              to={cityUrl}
              className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-4 py-2 rounded-lg"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden ${className}`}>
      <Link to={cityUrl} className="block">
        <div className="relative">
          <img
            src={mainImage}
            alt={`${name}, ${country}`}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={cityUrl}>
          <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">
            {name}
          </h3>
        </Link>
        
        <div className="flex items-center text-gray-600 mt-1">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{state}, {country}</span>
        </div>
        
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{city.seo_data.meta_description}</p>
        
        <div className="flex items-center justify-between mt-4">
          {showPropertyCount && propertyCount > 0 && (
            <div className="flex items-center text-gray-600">
              <Building className="w-4 h-4 mr-1" />
              <span className="text-sm">{propertyCount} properties</span>
            </div>
          )}
          
          <Link
            to={cityUrl}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
          >
            <span>Explore</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
