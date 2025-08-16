import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import SearchResultsGrid from '../components/SearchResultsGrid';
import SearchResultsList from '../components/SearchResultsList';
import MapView from '../components/MapView';
import FacetedDiscovery from '../components/FacetedDiscovery';
import { Card } from '../components/Layout';
import type { SearchFilters } from '../router/loaders';
import type { Property } from '../types';
import { propertyService } from '../lib/firestore';

export default function SearchPage() {
  const [, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [selectedProperty, setSelectedProperty] = useState<Property | undefined>();
  const [useFacetedDiscovery, setUseFacetedDiscovery] = useState(true);
  
  // Load properties on component mount
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const propertiesData = await propertyService.getAll();
        setProperties(propertiesData);
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProperties();
  }, []);

  const [filters, setFilters] = useState<SearchFilters>({});

  useEffect(() => {
    const filtered = properties;
    // Apply filters here
    setFilteredProperties(filtered);
  }, [properties, filters]);

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    if (newFilters.query) params.set('q', newFilters.query);
    if (newFilters.city) params.set('city', newFilters.city);
    if (newFilters.capacity) params.set('capacity', newFilters.capacity.toString());
    if (newFilters.priceRange) {
      params.set('minPrice', newFilters.priceRange[0].toString());
      params.set('maxPrice', newFilters.priceRange[1].toString());
    }
    if (newFilters.amenities?.length) {
      params.set('amenities', newFilters.amenities.join(','));
    }
    if (newFilters.propertyTypes?.length) {
      params.set('types', newFilters.propertyTypes.join(','));
    }
    if (newFilters.rating) params.set('rating', newFilters.rating.toString());
    if (newFilters.sortBy && newFilters.sortBy !== 'relevance') params.set('sortBy', newFilters.sortBy);
    if (newFilters.checkIn) params.set('checkIn', newFilters.checkIn);
    if (newFilters.checkOut) params.set('checkOut', newFilters.checkOut);
    if (newFilters.accessibility) params.set('accessibility', 'true');
    if (newFilters.petFriendly) params.set('petFriendly', 'true');
    if (newFilters.businessFriendly) params.set('businessFriendly', 'true');
    if (newFilters.familyFriendly) params.set('familyFriendly', 'true');
    
    setSearchParams(params);
  };

  const handleViewModeChange = (mode: 'grid' | 'list' | 'map') => {
    setViewMode(mode);
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    // Navigate to property detail page or show modal
    console.log('Selected property:', property);
  };

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const renderResults = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading properties...</p>
        </div>
      );
    }

    switch (viewMode) {
      case 'list':
        return (
          <SearchResultsList
            properties={filteredProperties}
            onPropertySelect={handlePropertySelect}
          />
        );
      case 'map':
        return (
          <MapView
            properties={filteredProperties}
            selectedProperty={selectedProperty}
            onPropertySelect={handlePropertySelect}
            className="h-[600px]"
          />
        );
      default:
        return (
          <SearchResultsGrid
            properties={filteredProperties}
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <SearchBar
            onSearch={handleSearch}
            className="mb-4"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v4.586a1 1 0 01-.293.707l-2 2A1 1 0 0111 21v-6.586a1 1 0 00-.293-.707L4.293 7.293A1 1 0 014 6.586V4z" />
                </svg>
                Filters
              </button>
              
              <button
                onClick={() => setUseFacetedDiscovery(!useFacetedDiscovery)}
                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  useFacetedDiscovery
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Enhanced Discovery
              </button>
              
              <span className="text-sm text-gray-600">
                {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 flex-shrink-0">
              <Card className="sticky top-24">
                {useFacetedDiscovery ? (
                  <FacetedDiscovery
                    properties={properties}
                    onFiltersChange={handleFiltersChange}
                    onViewModeChange={handleViewModeChange}
                  />
                ) : (
                  <FilterPanel
                     filters={filters}
                     onFiltersChange={handleFiltersChange}
                   />
                )}
              </Card>
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            {renderResults()}
          </div>
        </div>
      </div>
    </div>
  );
}