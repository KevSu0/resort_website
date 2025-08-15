import React from 'react';
import { MapPin } from 'lucide-react';
import type { City } from '../types';

interface CityMapProps {
  city: City;
}

export function CityMap({ city }: CityMapProps) {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Explore {city.name}
        </h2>
        <p className="text-gray-600">
          Interactive map showing property locations and nearby attractions
        </p>
      </div>

      <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Interactive map coming soon</p>
        </div>
      </div>
    </div>
  );
}
