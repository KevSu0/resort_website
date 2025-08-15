import React from 'react';
import { MapPin, Users } from 'lucide-react';
import type { City } from '../types';

interface CityInformationProps {
  city: City;
}

export function CityInformation({ city }: CityInformationProps) {
  const propertyCount = city.property_ids.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          About {city.name}
        </h2>
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 leading-relaxed mb-4">
            {city.seo_data.meta_description}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Location Details
        </h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <MapPin className="w-5 h-5 text-blue-600 mr-3" />
            <span className="text-gray-700">{city.name}, {city.state}, {city.country}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-gray-700">{propertyCount} luxury properties</span>
          </div>
        </div>
      </div>
    </div>
  );
}
