import React from 'react';
import { Building } from 'lucide-react';
import { Property } from '../types';
import PropertyCard from './PropertyCard';

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
