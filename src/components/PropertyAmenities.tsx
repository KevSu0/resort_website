import React from 'react';
import { Grid } from './Layout';

interface PropertyAmenitiesProps {
  amenities: string[];
}

export function PropertyAmenities({ amenities }: PropertyAmenitiesProps) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h3>
      <Grid className="grid-cols-2 md:grid-cols-3 gap-4">
        {amenities.map((amenity) => (
          <div key={amenity} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">{amenity}</span>
          </div>
        ))}
      </Grid>
    </div>
  );
}
