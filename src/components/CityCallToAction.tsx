import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import type { City } from '../types';

interface CityCallToActionProps {
  city: City;
}

export function CityCallToAction({ city }: CityCallToActionProps) {
  return (
    <div className="text-center">
      <h2 className="text-2xl md:text-3xl font-bold mb-4">
        Ready to Experience {city.name}?
      </h2>
      <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
        Book your perfect accommodation and start planning your unforgettable getaway
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium">
          <Calendar className="mr-2 w-4 h-4" />
          Book Now
        </button>
        <Link
          to="/contact"
          className="inline-flex items-center px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-medium"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
