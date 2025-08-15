import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { Section, Grid } from './Layout';
import PropertyCard from './PropertyCard';
import type { Property } from '../types';

interface FeaturedPropertiesProps {
  properties: Property[];
}

export function FeaturedProperties({ properties }: FeaturedPropertiesProps) {
  return (
    <Section>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Featured Properties
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Handpicked luxury accommodations that offer exceptional experiences
        </p>
      </div>

      <Grid className="grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} variant="featured" />
        ))}
      </Grid>

      <div className="text-center">
        <Link
          to="/properties"
          className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Search className="mr-2 w-4 h-4" />
          Browse All Properties
          <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </div>
    </Section>
  );
}
