import React, { useState, useMemo } from 'react';
import { MapPin, Star, Wifi, Car, Coffee, Waves, Dumbbell, Utensils, Heart, Users, Filter } from 'lucide-react';
import { Card } from './Layout';
import FilterPanel from './FilterPanel';
import type { Property } from '../types';
import type { SearchFilters } from '../router/loaders';

interface SearchResultsGridProps {
  properties: Property[];
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  viewMode?: 'grid' | 'list';
  showFilters?: boolean;
  className?: string;
}

interface PropertyCardProps {
  property: Property;
  viewMode: 'grid' | 'list';
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, viewMode }) => {
  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi className="w-4 h-4" />;
      case 'parking': return <Car className="w-4 h-4" />;
      case 'pool': return <Waves className="w-4 h-4" />;
      case 'gym': return <Dumbbell className="w-4 h-4" />;
      case 'spa': return <Heart className="w-4 h-4" />;
      case 'restaurant': return <Utensils className="w-4 h-4" />;
      default: return <Coffee className="w-4 h-4" />;
    }
  };


  if (viewMode === 'list') {
    return (
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex gap-6">
          <div className="w-48 h-32 flex-shrink-0">
            <img
              src={property.branding.hero_image || `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`luxury ${property.stay_types[0]} resort ${property.name} exterior view`)}&image_size=landscape_4_3`}
              alt={property.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{property.name}</h3>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{property.location.address}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  ${property.priceRange.min}-${property.priceRange.max}/night
                </div>
                <div className="text-sm text-gray-500">per night</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{property.rating}</span>
                <span className="text-sm text-gray-500">({property.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Users className="w-4 h-4" />
                <span className="text-sm">{property.stay_types.join(', ')} accommodation</span>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {property.branding.description}
            </p>

            <div className="flex items-center gap-3">
              {property.amenities?.slice(0, 4).map((amenity, index) => (
                <div key={index} className="flex items-center gap-1 text-gray-500">
                  {getAmenityIcon(amenity)}
                  <span className="text-xs capitalize">{amenity}</span>
                </div>
              ))}
              {property.amenities && property.amenities.length > 4 && (
                <span className="text-xs text-gray-500">+{property.amenities.length - 4} more</span>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative">
        <img
          src={property.branding.hero_image || `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`luxury ${property.stay_types[0]} resort ${property.name} exterior view`)}&image_size=landscape_4_3`}
          alt={property.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">{property.rating}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{property.name}</h3>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              ${property.priceRange.min}-${property.priceRange.max}
            </div>
            <div className="text-xs text-gray-500">per night</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <MapPin className="w-4 h-4" />
          <span className="text-sm line-clamp-1">{property.location.address}</span>
        </div>
        
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1 text-gray-500">
            <Users className="w-4 h-4" />
            <span className="text-xs">{property.stay_types.join(', ')}</span>
          </div>
          <span className="text-xs text-gray-500">({property.reviewCount} reviews)</span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {property.branding.description}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          {property.amenities?.slice(0, 3).map((amenity, index) => (
            <div key={index} className="flex items-center gap-1 text-gray-500">
              {getAmenityIcon(amenity)}
              <span className="text-xs capitalize">{amenity}</span>
            </div>
          ))}
          {property.amenities && property.amenities.length > 3 && (
            <span className="text-xs text-gray-500">+{property.amenities.length - 3}</span>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function SearchResultsGrid({
  properties,
  filters,
  onFiltersChange,
  viewMode = 'grid',
  showFilters = true,
  className = ''
}: SearchResultsGridProps) {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(showFilters);

  // Filter properties based on current filters
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      // Text search
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const matchesQuery = 
          property.name.toLowerCase().includes(query) ||
          property.branding.description.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // Property type filter
      if (filters.propertyTypes && filters.propertyTypes.length > 0) {
        const propertyType = property.stay_types.join(' ').toLowerCase();
        if (!filters.propertyTypes.some(type => propertyType.includes(type.toLowerCase()))) {
          return false;
        }
      }

      // Price range filter
      if (filters.priceRange) {
        const [min, max] = filters.priceRange;
        const minPrice = property.priceRange.min;
        const maxPrice = property.priceRange.max;
        // Check if property price range overlaps with filter range
        if (maxPrice < min || minPrice > max) {
          return false;
        }
      }

      // Rating filter
      if (filters.rating && property.rating < filters.rating) {
        return false;
      }

      // Capacity filter (placeholder - MockProperty doesn't have capacity field)
      if (filters.capacity) {
        // For now, assume all properties can accommodate the requested capacity
        // In a real implementation, you'd add a capacity field to MockProperty
        return true;
      }

      // Amenities filter
      if (filters.amenities?.length) {
        const hasAllAmenities = filters.amenities.every(amenity => 
          property.amenities?.includes(amenity)
        );
        if (!hasAllAmenities) {
          return false;
        }
      }

      // Special features filters
      if (filters.accessibility) {
        const hasAccessibility = property.amenities?.some(amenity => 
          amenity.toLowerCase().includes('accessible') || amenity.toLowerCase().includes('wheelchair')
        );
        if (!hasAccessibility) return false;
      }
      if (filters.petFriendly) {
        const isPetFriendly = property.amenities?.some(amenity => 
          amenity.toLowerCase().includes('pet') || amenity.toLowerCase().includes('dog')
        );
        if (!isPetFriendly) return false;
      }
      if (filters.businessFriendly) {
        const isBusinessFriendly = property.amenities?.some(amenity => 
          amenity.toLowerCase().includes('wifi') || amenity.toLowerCase().includes('business') || 
          amenity.toLowerCase().includes('conference') || amenity.toLowerCase().includes('meeting')
        );
        if (!isBusinessFriendly) return false;
      }
      if (filters.familyFriendly) {
        const isFamilyFriendly = property.amenities?.some(amenity => 
          amenity.toLowerCase().includes('family') || amenity.toLowerCase().includes('kids') || 
          amenity.toLowerCase().includes('children') || amenity.toLowerCase().includes('playground')
        );
        if (!isFamilyFriendly) return false;
      }

      return true;
    });
  }, [properties, filters]);

  // Sort properties based on sortBy filter
  const sortedProperties = useMemo(() => {
    const sorted = [...filteredProperties];
    
    switch (filters.sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.priceRange.min - b.priceRange.min);
      case 'price-high':
        return sorted.sort((a, b) => b.priceRange.max - a.priceRange.max);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'newest':
        return sorted.sort((a, b) => b.id.localeCompare(a.id));
      case 'distance':
        // For now, just return as-is. In a real app, you'd calculate distance from user location
        return sorted;
      case 'relevance':
      default:
        return sorted;
    }
  }, [filteredProperties, filters.sortBy]);

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.propertyTypes?.length) count++;
    if (filters.priceRange) count++;
    if (filters.rating) count++;
    if (filters.amenities?.length) count++;
    if (filters.accessibility) count++;
    if (filters.petFriendly) count++;
    if (filters.businessFriendly) count++;
    if (filters.familyFriendly) count++;
    if (filters.checkIn) count++;
    if (filters.checkOut) count++;
    if (filters.capacity) count++;
    return count;
  };

  return (
    <div className={`flex gap-6 ${className}`}>
      {/* Filter Panel */}
      {showFilters && (
        <div className={`transition-all duration-300 ${isFilterPanelOpen ? 'w-80' : 'w-0 overflow-hidden'}`}>
          <FilterPanel
            filters={filters}
            onFiltersChange={onFiltersChange}
            onClose={() => setIsFilterPanelOpen(false)}
            isOpen={isFilterPanelOpen}
          />
        </div>
      )}

      {/* Results */}
      <div className="flex-1">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {sortedProperties.length} {sortedProperties.length === 1 ? 'Property' : 'Properties'} Found
            </h2>
            {!isFilterPanelOpen && showFilters && (
              <button
                onClick={() => setIsFilterPanelOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {getActiveFilterCount() > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>
            )}
          </div>
          
          {filters.query && (
            <div className="text-sm text-gray-600">
              Results for <span className="font-medium">"{filters.query}"</span>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {getActiveFilterCount() > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filters.propertyTypes?.map(type => (
                <span key={type} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {type}
                  <button
                    onClick={() => {
                      const newTypes = filters.propertyTypes?.filter(t => t !== type) || [];
                      onFiltersChange({ ...filters, propertyTypes: newTypes });
                    }}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
              {filters.priceRange && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  ${filters.priceRange[0]} - ${filters.priceRange[1]}
                  <button
                    onClick={() => onFiltersChange({ ...filters, priceRange: undefined })}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.rating && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {filters.rating}+ stars
                  <button
                    onClick={() => onFiltersChange({ ...filters, rating: undefined })}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Results Grid/List */}
        {sortedProperties.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-6'
          }>
            {sortedProperties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Filter className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search criteria to find more results.
            </p>
            <button
              onClick={() => onFiltersChange({ query: filters.query, city: filters.city })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}