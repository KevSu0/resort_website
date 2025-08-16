import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Filter, ChevronDown, ChevronUp, Map, List, Grid3X3 } from 'lucide-react';
import type { Property } from '../types';
import type { SearchFilters } from '../router/loaders';

interface FacetedDiscoveryProps {
  properties: Property[];
  onFiltersChange: (filters: SearchFilters) => void;
  onViewModeChange?: (mode: 'grid' | 'list' | 'map') => void;
  className?: string;
}

interface Facet {
  id: string;
  name: string;
  type: 'checkbox' | 'range' | 'select' | 'location';
  options?: FacetOption[];
  min?: number;
  max?: number;
  step?: number;
}

interface FacetOption {
  value: string;
  label: string;
  count: number;
}

interface LocationFilter {
  city?: string;
  region?: string;
  country?: string;
  radius?: number;
  coordinates?: { lat: number; lng: number };
}

export default function FacetedDiscovery({
  properties,
  onFiltersChange,
  onViewModeChange,
  className = ''
}: FacetedDiscoveryProps) {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [expandedFacets, setExpandedFacets] = useState<Record<string, boolean>>({
    location: true,
    propertyType: true,
    price: true,
    amenities: false,
    rating: false
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState<LocationFilter>({});

  // Generate dynamic facets based on available properties
  const facets = useMemo(() => {
    const cityOptions = Array.from(new Set(properties.map(p => p.location.address)))
      .map(city => ({
        value: city,
        label: city,
        count: properties.filter(p => p.location.address === city).length
      }))
      .sort((a, b) => b.count - a.count);

    const stayTypeOptions = Array.from(new Set(properties.flatMap(p => p.stay_types)))
      .map(type => ({
        value: type,
        label: type.charAt(0).toUpperCase() + type.slice(1),
        count: properties.filter(p => p.stay_types.includes(type)).length
      }))
      .sort((a, b) => b.count - a.count);

    const amenityOptions = Array.from(
      new Set(properties.flatMap(p => p.amenities || []))
    )
      .map(amenity => ({
        value: amenity,
        label: amenity,
        count: properties.filter(p => p.amenities?.includes(amenity)).length
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15); // Show top 15 amenities

    const priceRange = properties.reduce(
      (acc, p) => ({
        min: Math.min(acc.min, p.priceRange?.min || 0),
        max: Math.max(acc.max, p.priceRange?.max || 0)
      }),
      { min: Infinity, max: 0 }
    );

    return [
      {
        id: 'location',
        name: 'Location',
        type: 'location' as const,
        options: cityOptions
      },
      {
        id: 'propertyType',
        name: 'Property Type',
        type: 'checkbox' as const,
        options: stayTypeOptions
      },
      {
        id: 'price',
        name: 'Price Range (per night)',
        type: 'range' as const,
        min: priceRange.min,
        max: priceRange.max,
        step: 50
      },
      {
        id: 'amenities',
        name: 'Amenities',
        type: 'checkbox' as const,
        options: amenityOptions
      },
      {
        id: 'rating',
        name: 'Minimum Rating',
        type: 'select' as const,
        options: [
          { value: '1', label: '1+ Stars', count: properties.filter(p => (p.rating || 0) >= 1).length },
          { value: '2', label: '2+ Stars', count: properties.filter(p => (p.rating || 0) >= 2).length },
          { value: '3', label: '3+ Stars', count: properties.filter(p => (p.rating || 0) >= 3).length },
          { value: '4', label: '4+ Stars', count: properties.filter(p => (p.rating || 0) >= 4).length },
          { value: '5', label: '5 Stars', count: properties.filter(p => (p.rating || 0) >= 5).length }
        ]
      }
    ];
  }, [properties]);

  const toggleFacet = (facetId: string) => {
    setExpandedFacets(prev => ({
      ...prev,
      [facetId]: !prev[facetId]
    }));
  };

  const updateFilters = (updates: Partial<SearchFilters>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleCheckboxChange = (facetId: string, value: string, checked: boolean) => {
    const currentValues = filters[facetId as keyof SearchFilters] as string[] || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    
    updateFilters({ [facetId]: newValues });
  };

  const handleRangeChange = (facetId: string, min: number, max: number) => {
    updateFilters({ [facetId]: [min, max] });
  };

  const handleSelectChange = (facetId: string, value: string) => {
    updateFilters({ [facetId]: value ? parseInt(value) : undefined });
  };

  const handleLocationChange = (location: LocationFilter) => {
    setLocationFilter(location);
    updateFilters({ 
      city: location.city,
      location: location.coordinates ? {
        lat: location.coordinates.lat,
        lng: location.coordinates.lng,
        radius: location.radius || 50
      } : undefined
    });
  };

  const clearAllFilters = () => {
    setFilters({});
    setLocationFilter({});
    setSearchQuery('');
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) return true;
      return value !== undefined && value !== null && value !== '';
    }).length;
  };

  const handleViewModeChange = (mode: 'grid' | 'list' | 'map') => {
    setViewMode(mode);
    onViewModeChange?.(mode);
  };

  const renderFacet = (facet: Facet) => {
    const isExpanded = expandedFacets[facet.id];

    return (
      <div key={facet.id} className="border-b border-gray-200 last:border-b-0">
        <button
          onClick={() => toggleFacet(facet.id)}
          className="flex items-center justify-between w-full py-4 px-6 text-left hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium text-gray-900">{facet.name}</span>
          <div className="flex items-center gap-2">
            {facet.id !== 'location' && (
              <span className="text-sm text-gray-500">
                {facet.options?.filter(opt => {
                  const currentValues = filters[facet.id as keyof SearchFilters] as string[] || [];
                  return currentValues.includes(opt.value);
                }).length || 0}
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="px-6 pb-4">
            {facet.type === 'location' && (
              <LocationFacet
                options={facet.options || []}
                value={locationFilter}
                onChange={handleLocationChange}
              />
            )}

            {facet.type === 'checkbox' && facet.options && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {facet.options.map(option => {
                  const currentValues = filters[facet.id as keyof SearchFilters] as string[] || [];
                  const isChecked = currentValues.includes(option.value);
                  
                  return (
                    <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleCheckboxChange(facet.id, option.value, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="flex-1 text-sm text-gray-700">{option.label}</span>
                      <span className="text-xs text-gray-500">({option.count})</span>
                    </label>
                  );
                })}
              </div>
            )}

            {facet.type === 'range' && (
              <RangeFacet
                min={facet.min || 0}
                max={facet.max || 1000}
                step={facet.step || 1}
                value={filters[facet.id as keyof SearchFilters] as [number, number] || [facet.min || 0, facet.max || 1000]}
                onChange={(min, max) => handleRangeChange(facet.id, min, max)}
              />
            )}

            {facet.type === 'select' && facet.options && (
              <select
                value={filters[facet.id as keyof SearchFilters] as string || ''}
                onChange={(e) => handleSelectChange(facet.id, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any rating</option>
                {facet.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.count})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white ${className}`}>
      {/* Header with Search and View Controls */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Discover Properties</h2>
            {getActiveFilterCount() > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {getActiveFilterCount()} active
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties, locations, amenities..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              updateFilters({ query: e.target.value });
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 mr-2">View:</span>
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`px-3 py-2 text-sm transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              className={`px-3 py-2 text-sm transition-colors border-l border-gray-300 ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewModeChange('map')}
              className={`px-3 py-2 text-sm transition-colors border-l border-gray-300 ${
                viewMode === 'map'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Map className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Facets */}
      <div className="divide-y divide-gray-200">
        {facets.map(renderFacet)}
      </div>
    </div>
  );
}

// Location Facet Component
function LocationFacet({
  options,
  value,
  onChange
}: {
  options: FacetOption[];
  value: LocationFilter;
  onChange: (location: LocationFilter) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [radiusEnabled, setRadiusEnabled] = useState(false);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* City Search */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search cities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* City Options */}
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {filteredOptions.map(option => (
          <label key={option.value} className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="city"
              checked={value.city === option.value}
              onChange={() => onChange({ ...value, city: option.value })}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="flex-1 text-sm text-gray-700">{option.label}</span>
            <span className="text-xs text-gray-500">({option.count})</span>
          </label>
        ))}
      </div>

      {/* Radius Filter */}
      <div className="pt-2 border-t border-gray-200">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={radiusEnabled}
            onChange={(e) => {
              setRadiusEnabled(e.target.checked);
              if (!e.target.checked) {
                onChange({ ...value, radius: undefined, coordinates: undefined });
              }
            }}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Search within radius</span>
        </label>
        
        {radiusEnabled && (
          <div className="mt-2">
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={value.radius || 25}
              onChange={(e) => onChange({ ...value, radius: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5 km</span>
              <span>{value.radius || 25} km</span>
              <span>100 km</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Range Facet Component
function RangeFacet({
  min,
  max,
  step,
  value,
  onChange
}: {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (min: number, max: number) => void;
}) {
  const [localMin, setLocalMin] = useState(value[0]);
  const [localMax, setLocalMax] = useState(value[1]);

  useEffect(() => {
    setLocalMin(value[0]);
    setLocalMax(value[1]);
  }, [value]);

  const handleMinChange = (newMin: number) => {
    const clampedMin = Math.max(min, Math.min(newMin, localMax));
    setLocalMin(clampedMin);
    onChange(clampedMin, localMax);
  };

  const handleMaxChange = (newMax: number) => {
    const clampedMax = Math.min(max, Math.max(newMax, localMin));
    setLocalMax(clampedMax);
    onChange(localMin, clampedMax);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Min</label>
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={localMin}
            onChange={(e) => handleMinChange(parseInt(e.target.value) || min)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Max</label>
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={localMax}
            onChange={(e) => handleMaxChange(parseInt(e.target.value) || max)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="px-2">
        <div className="relative">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={localMin}
            onChange={(e) => handleMinChange(parseInt(e.target.value))}
            className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={localMax}
            onChange={(e) => handleMaxChange(parseInt(e.target.value))}
            className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>${min}</span>
          <span>${localMin} - ${localMax}</span>
          <span>${max}</span>
        </div>
      </div>
    </div>
  );
}