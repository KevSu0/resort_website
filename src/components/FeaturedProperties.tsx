import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Section } from './Layout';
import { PropertyGrid } from './PropertyGrid';
import type { Property } from '../types';

interface FeaturedPropertiesProps {
  title?: string;
  subtitle?: string;
  properties?: Property[];
  showViewAllButton?: boolean;
  viewAllLink?: string;
  viewAllText?: string;
  variant?: 'default' | 'featured';
  className?: string;
}

export function FeaturedProperties({
  title = "Featured Properties",
  subtitle = "Handpicked accommodations that offer exceptional experiences",
  properties = [],
  showViewAllButton = true,
  viewAllLink = "/properties",
  viewAllText = "View All Properties",
  variant = "featured",
  className = ""
}: FeaturedPropertiesProps) {
  return (
    <Section className={className}>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {title}
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>
      
      <PropertyGrid properties={properties} variant={variant} />
      
      {showViewAllButton && (
        <div className="text-center mt-12">
          <Link
            to={viewAllLink}
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {viewAllText}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      )}
    </Section>
  );
}