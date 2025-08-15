import React from 'react';
import { MapPin } from 'lucide-react';
import type { Property, City } from '../types';

interface PropertyLocationProps {
  location: Property['location'];
  city: City;
}

export function PropertyLocation({ location, city }: PropertyLocationProps) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Location</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <MapPin className="w-5 h-5 text-blue-600 mt-1" />
          <div>
            <p className="font-medium text-gray-900">{location.address}</p>
            <p className="text-gray-600">
              {city.name}, {city.state}, {city.country}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
