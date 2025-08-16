import React, { useState, useEffect } from 'react';
import { ChevronDown, MapPin, Star, ExternalLink } from 'lucide-react';
import { ResortGroup, Property } from '../types';
import { propertyService } from '../lib/firestore';

interface MultiPropertySelectorProps {
  resortGroup: ResortGroup;
  currentProperty: Property | null;
  onPropertyChange?: (property: Property) => void;
}

export function MultiPropertySelector({ 
  resortGroup, 
  currentProperty, 
  onPropertyChange 
}: MultiPropertySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const allProperties = await propertyService.getAll();
        setProperties(allProperties);
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  const handlePropertySelect = (property: Property) => {
    setIsOpen(false);
    if (onPropertyChange) {
      onPropertyChange(property);
    } else {
      // Navigate to property homepage
      window.location.href = `/properties/${property.slug}`;
    }
  };

  if (loading || !resortGroup.settings?.multi_property_enabled) {
    return null;
  }

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-4">
            {resortGroup.branding?.logo && (
              <img 
                src={resortGroup.branding.logo} 
                alt={resortGroup.name}
                className="h-8 w-auto"
              />
            )}
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {resortGroup.name}
              </h1>
              <p className="text-sm text-gray-500">
                {properties.length} Premium Destinations
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span>
                {currentProperty ? currentProperty.name : 'All Properties'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Choose Your Destination
                  </h3>
                  <p className="text-sm text-gray-500">
                    Explore our luxury properties worldwide
                  </p>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {/* All Properties Option */}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      window.location.href = '/';
                    }}
                    className="w-full text-left p-4 hover:bg-gray-50 border-b border-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">All Properties</div>
                        <div className="text-sm text-gray-500">Browse all destinations</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>

                  {/* Individual Properties */}
                  {properties.map((property) => (
                    <button
                      key={property.id}
                      onClick={() => handlePropertySelect(property)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                        currentProperty?.id === property.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {property.branding?.hero_image && (
                          <img 
                            src={property.branding.hero_image} 
                            alt={property.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900 truncate">
                              {property.name}
                            </h4>
                            {property.rating && (
                              <div className="flex items-center">
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span className="text-xs text-gray-500 ml-1">
                                  {property.rating}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span className="truncate">{property.city_slug}</span>
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-2">
                            {property.branding?.description}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}