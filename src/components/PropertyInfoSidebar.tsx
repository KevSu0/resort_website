import React from 'react';
import { Card } from './Layout';
import type { Property } from '../types';

interface PropertyInfoSidebarProps {
  property: Property;
}

export function PropertyInfoSidebar({ property }: PropertyInfoSidebarProps) {
  // NOTE: Capacity, rating and review count are not available on the Property type.
  // This information is on the StayType level, and would require fetching all stay types for each property.
  // To avoid performance issues, this information has been removed from the sidebar.

  return (
    <div className="lg:col-span-1">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Stay Types</span>
            <div className="flex flex-wrap gap-1">
              {property.stay_types.map((type) => (
                <span key={type} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
