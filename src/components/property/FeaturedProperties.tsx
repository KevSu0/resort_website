import { useEffect, useState } from 'react';
import { PropertyCard } from './PropertyCard';
import { PropertyCardSkeleton } from '@/components/Loading';
import { type Property } from '@/types';
import { storageService } from '@/services/storage';

interface FeaturedPropertiesProps {
  onPropertyClick?: (property: Property) => void;
}

export function FeaturedProperties({
  onPropertyClick,
}: FeaturedPropertiesProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load properties from local storage
    const loadProperties = () => {
      try {
        const allProperties = storageService.getProperties();
        // Show all properties, not just featured ones
        setProperties(allProperties);
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Properties</h2>
            <div className="w-20 h-1 bg-primary-600 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (properties.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Properties</h2>
          <p className="text-gray-600">No featured properties available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="featured" className="py-16 bg-gray-50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Exclusive Resorts
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from our three unique properties, each offering a distinct experience of Wayanad's natural beauty
          </p>
          <div className="w-20 h-1 bg-primary-600 mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onClick={() => onPropertyClick?.(property)}
            />
          ))}
        </div>

        {/* View All Properties Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => {
              // Navigate to all properties page
              console.log('Navigate to all properties');
            }}
            className="btn-outline text-lg px-8 py-3 hover:scale-[1.02] transition-transform duration-fast ease-out"
          >
            View All Properties
          </button>
        </div>
      </div>
    </section>
  );
};