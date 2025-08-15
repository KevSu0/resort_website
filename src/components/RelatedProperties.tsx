import React from 'react';
import { Section, Grid } from './Layout';
import PropertyCard from './PropertyCard';
import type { Property } from '../types';

interface RelatedPropertiesProps {
  properties: Property[];
  city: string;
}

export function RelatedProperties({ properties, city }: RelatedPropertiesProps) {
  return (
    <Section className="bg-gray-50">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          You Might Also Like
        </h2>
        <p className="text-gray-600">
          Similar properties in {city}
        </p>
      </div>

      <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.slice(0, 3).map((relatedProperty) => (
          <PropertyCard key={relatedProperty.id} property={relatedProperty} />
        ))}
      </Grid>
    </Section>
  );
}
