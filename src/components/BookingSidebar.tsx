import React from 'react';
import { Star } from 'lucide-react';
import { Card } from './Layout';
import type { Property, StayType } from '../types';

interface BookingSidebarProps {
  property: Property;
  stayTypes: StayType[];
}

export function BookingSidebar({ property, stayTypes }: BookingSidebarProps) {
  const firstStayType = stayTypes?.[0];
  if (!firstStayType) {
    return null; // Or some fallback UI
  }
  const { price_range, capacity } = firstStayType.details;

  return (
    <div className="lg:col-span-1">
      <Card className="sticky top-8 p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-gray-900">
              ${price_range.min} - ${price_range.max}
            </span>
            <div className="flex items-center">
              {/* Rating and review count are not available on the Property or StayType type */}
            </div>
          </div>
          <p className="text-gray-600">per night</p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-in
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-out
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Guests
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              {Array.from({ length: capacity }, (_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1} guest{i + 1 > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
          Book Now
        </button>
      </Card>
    </div>
  );
}
