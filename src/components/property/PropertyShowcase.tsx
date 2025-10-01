import { useEffect, useState } from 'react';
import { PropertySummary } from './PropertySummary';
import { type Property } from '@/types';
import { storageService } from '@/services/storage';

export function PropertyShowcase() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProperties = () => {
      try {
        const allProperties = storageService.getProperties();
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
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Discover Our Resorts</h2>
            <p className="text-xl text-gray-600">Each property offers a unique experience</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-xl mb-4"></div>
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose Your Perfect Getaway
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From luxury treehouses to serene lakefront retreats, discover the perfect accommodation for your Wayanad adventure
          </p>
          <div className="w-24 h-1 bg-primary-600 mx-auto mt-6"></div>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {properties.map((property, index) => (
            <div
              key={property.id}
              className={`animate-fade-in`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <PropertySummary property={property} />
            </div>
          ))}
        </div>

        {/* Quick Comparison */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Quick Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {properties.map((property) => (
              <div key={property.id} className="text-center">
                <h4 className="font-bold text-lg mb-4">{property.name}</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Starting from</span>
                    <span className="font-medium">
                      {formatCurrency(
                        Math.min(...property.rooms.map(room => room.baseRate || 0))
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Types</span>
                    <span className="font-medium">{property.rooms.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Guests</span>
                    <span className="font-medium">
                      {Math.max(...property.rooms.map(room => room.capacity))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating</span>
                    <span className="font-medium">4.8/5</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};