import React from 'react';
import { Link } from 'react-router-dom';
import { Filter, MapPin } from 'lucide-react';
import { Grid } from './Layout';
import PropertyCard from './PropertyCard';
import type { Property, City } from '../types';

interface CityPropertiesProps {
  properties: Property[];
  city: City;
}

export function CityProperties({ properties, city }: CityPropertiesProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Properties in {city.name}
          </h2>
          <p className="text-gray-600">
            {properties.length} properties available
          </p>
        </div>
        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </button>
      </div>

      {properties.length > 0 ? (
        <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </Grid>
      ) : (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No properties found
          </h3>
          <p className="text-gray-600 mb-6">
            We don't have any properties in {city.name} at the moment.
          </p>
          <Link
            to="/properties"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Properties
          </Link>
        </div>
      )}
    </div>
  );
}
