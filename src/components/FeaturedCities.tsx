import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { City } from '../types';
import { CityGrid } from './CityGrid';

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
