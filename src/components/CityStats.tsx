import React from 'react';
import { Card, Grid } from './Layout';
import type { City } from '../types';

interface CityStatsProps {
  city: City;
}

export function CityStats({ city }: CityStatsProps) {
  const propertyCount = city.property_ids.length;

  return (
    <Grid className="grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="text-center p-6">
        <div className="text-3xl font-bold text-blue-600 mb-2">
          {propertyCount}
        </div>
        <div className="text-gray-600">Available Properties</div>
      </Card>
    </Grid>
  );
}
