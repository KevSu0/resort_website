import React from 'react';
import { MapPin } from 'lucide-react';
import { City } from '../types';
import CityCard from './CityCard';

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
          key={city.slug}
          city={city}
          variant={variant}
        />
      ))}
    </div>
  );
}
