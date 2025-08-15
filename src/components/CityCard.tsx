import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Building, Users, Star, ArrowRight } from 'lucide-react';
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
    id,
    name,
    slug,
    country,
    description,
    images,
    propertyCount,
    averageRating,
    popularStayTypes,
    isActive
  } = city;

  if (!isActive) return null;

  const cityUrl = `/cities/${slug}`;
  const mainImage = images?.[0] || `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`${name} ${country} cityscape beautiful destination travel`)}&image_size=landscape_16_9`;

  const renderStayTypes = () => {
    if (!popularStayTypes?.length) return null;
    
    const displayTypes = variant === 'compact' ? popularStayTypes.slice(0, 2) : popularStayTypes.slice(0, 4);
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {displayTypes.map((stayType, index) => (
          <span 
            key={index}
            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
          >
            {stayType}
          </span>
        ))}
        {popularStayTypes.length > displayTypes.length && (
          <span className="text-xs text-gray-500 px-2 py-1">
            +{popularStayTypes.length - displayTypes.length} more
          </span>
        )}
      </div>
    );
  };

  const renderRating = () => {
    if (!averageRating) return null;
    
    return (
      <div className="flex items-center space-x-1">
        <Star className="w-4 h-4 text-yellow-400 fill-current" />
        <span className="text-sm font-medium text-gray-900">{averageRating.toFixed(1)}</span>
      </div>
    );
  };

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
              {renderRating()}
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
          <div className="mb-4">
            {renderRating()}
          </div>
          
          <Link to={cityUrl}>
            <h2 className="text-3xl font-bold mb-2 hover:text-blue-200 transition-colors">
              {name}
            </h2>
          </Link>
          
          <div className="flex items-center text-white/90 mb-3">
            <MapPin className="w-5 h-5 mr-2" />
            <span className="text-lg">{country}</span>
          </div>
          
          <p className="text-white/90 mb-4 line-clamp-2">{description}</p>
          
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
          {averageRating && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
              {renderRating()}
            </div>
          )}
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
          <span className="text-sm">{country}</span>
        </div>
        
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{description}</p>
        
        {renderStayTypes()}
        
        <div className="flex items-center justify-between mt-4">
          {showPropertyCount && propertyCount && (
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

// City grid component
export function CityGrid({ 
  cities, 
  variant = 'default',
  className = '' 
}: { 
  cities: City[]; 
  variant?: 'default' | 'compact' | 'hero';
  className?: string;
}) {
  if (!cities.length) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No cities found</h3>
        <p className="text-gray-600">Try adjusting your search criteria.</p>
      </div>
    );
  }

  const gridClasses = {
    default: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    compact: 'space-y-4',
    hero: 'grid grid-cols-1 lg:grid-cols-2 gap-8'
  };

  return (
    <div className={`${gridClasses[variant]} ${className}`}>
      {cities.map((city) => (
        <CityCard
          key={city.id}
          city={city}
          variant={variant}
        />
      ))}
    </div>
  );
}

// Featured cities section
export function FeaturedCities({ 
  cities, 
  title = 'Popular Destinations',
  className = '' 
}: { 
  cities: City[];
  title?: string;
  className?: string;
}) {
  if (!cities.length) return null;

  return (
    <section className={`py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing destinations with our curated selection of cities
          </p>
        </div>
        
        <CityGrid cities={cities} variant="default" />
        
        <div className="text-center mt-8">
          <Link
            to="/cities"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <span>View All Cities</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}