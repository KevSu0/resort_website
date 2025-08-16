import React, { useState, useEffect } from 'react';
import { Filter, X, MapPin, Users, Star, Wifi, Car, Coffee, Waves, Dumbbell, Utensils, Accessibility, Heart, Briefcase, Baby } from 'lucide-react';
import { Card } from './Layout';
import type { SearchFilters } from '../router/loaders';

interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClose?: () => void;
  isOpen?: boolean;
  className?: string;
}

const PROPERTY_TYPES = [
  { value: 'resort', label: 'Resort', icon: Waves },
  { value: 'hotel', label: 'Hotel', icon: Coffee },
  { value: 'villa', label: 'Villa', icon: MapPin },
  { value: 'apartment', label: 'Apartment', icon: MapPin }
];

const AMENITIES = [
  { value: 'wifi', label: 'Free WiFi', icon: Wifi },
  { value: 'parking', label: 'Parking', icon: Car },
  { value: 'pool', label: 'Swimming Pool', icon: Waves },
  { value: 'gym', label: 'Fitness Center', icon: Dumbbell },
  { value: 'spa', label: 'Spa & Wellness', icon: Heart },
  { value: 'restaurant', label: 'Restaurant', icon: Utensils },
  { value: 'room-service', label: 'Room Service', icon: Coffee },
  { value: 'concierge', label: 'Concierge', icon: Briefcase }
];

const FEATURES = [
  { value: 'accessibility', label: 'Wheelchair Accessible', icon: Accessibility, key: 'accessibility' },
  { value: 'pet-friendly', label: 'Pet Friendly', icon: Heart, key: 'petFriendly' },
  { value: 'business-friendly', label: 'Business Center', icon: Briefcase, key: 'businessFriendly' },
  { value: 'family-friendly', label: 'Family Friendly', icon: Baby, key: 'familyFriendly' }
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'distance', label: 'Nearest First' },
  { value: 'newest', label: 'Newest First' }
];

export default function FilterPanel({ 
  filters, 
  onFiltersChange, 
  onClose, 
  isOpen = true, 
  className = '' 
}: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    propertyType: true,
    price: true,
    rating: false,
    amenities: false,
    features: false,
    dates: false
  });

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const updateFilters = (updates: Partial<SearchFilters>) => {
    const newFilters = { ...localFilters, ...updates };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePropertyTypeChange = (type: string, checked: boolean) => {
    const currentTypes = localFilters.propertyTypes || [];
    const newTypes = checked 
      ? [...currentTypes, type]
      : currentTypes.filter(t => t !== type);
    updateFilters({ propertyTypes: newTypes });
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const currentAmenities = localFilters.amenities || [];
    const newAmenities = checked 
      ? [...currentAmenities, amenity]
      : currentAmenities.filter(a => a !== amenity);
    updateFilters({ amenities: newAmenities });
  };

  const handleFeatureChange = (feature: typeof FEATURES[0], checked: boolean) => {
    if (feature.key === 'accessibility') {
      updateFilters({ accessibility: checked });
    } else if (feature.key === 'petFriendly') {
      updateFilters({ petFriendly: checked });
    } else if (feature.key === 'businessFriendly') {
      updateFilters({ businessFriendly: checked });
    } else if (feature.key === 'familyFriendly') {
      updateFilters({ familyFriendly: checked });
    }
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    updateFilters({ priceRange: [min, max] });
  };

  const clearAllFilters = () => {
    const clearedFilters: SearchFilters = {
      query: localFilters.query,
      city: localFilters.city
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.propertyTypes?.length) count++;
    if (localFilters.priceRange) count++;
    if (localFilters.rating) count++;
    if (localFilters.amenities?.length) count++;
    if (localFilters.accessibility) count++;
    if (localFilters.petFriendly) count++;
    if (localFilters.businessFriendly) count++;
    if (localFilters.familyFriendly) count++;
    if (localFilters.checkIn) count++;
    if (localFilters.checkOut) count++;
    return count;
  };

  if (!isOpen) return null;

  return (
    <Card className={`w-full max-w-sm bg-white shadow-lg ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            {getActiveFilterCount() > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {getActiveFilterCount()}
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
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort by
            </label>
            <select
              value={localFilters.sortBy || 'relevance'}
              onChange={(e) => updateFilters({ sortBy: e.target.value as 'relevance' | 'price-low' | 'price-high' | 'rating' | 'distance' | 'newest' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Property Type */}
          <div>
            <button
              onClick={() => toggleSection('propertyType')}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-sm font-medium text-gray-700">Property Type</span>
              <span className={`transform transition-transform ${expandedSections.propertyType ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.propertyType && (
              <div className="mt-3 space-y-2">
                {PROPERTY_TYPES.map(type => {
                  const Icon = type.icon;
                  return (
                    <label key={type.value} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localFilters.propertyTypes?.includes(type.value) || false}
                        onChange={(e) => handlePropertyTypeChange(type.value, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{type.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Price Range */}
          <div>
            <button
              onClick={() => toggleSection('price')}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-sm font-medium text-gray-700">Price Range</span>
              <span className={`transform transition-transform ${expandedSections.price ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.price && (
              <div className="mt-3 space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Min Price</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={localFilters.priceRange?.[0] || ''}
                      onChange={(e) => {
                        const min = parseInt(e.target.value) || 0;
                        const max = localFilters.priceRange?.[1] || 1000;
                        handlePriceRangeChange(min, max);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Max Price</label>
                    <input
                      type="number"
                      placeholder="1000"
                      value={localFilters.priceRange?.[1] || ''}
                      onChange={(e) => {
                        const max = parseInt(e.target.value) || 1000;
                        const min = localFilters.priceRange?.[0] || 0;
                        handlePriceRangeChange(min, max);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rating */}
          <div>
            <button
              onClick={() => toggleSection('rating')}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-sm font-medium text-gray-700">Minimum Rating</span>
              <span className={`transform transition-transform ${expandedSections.rating ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.rating && (
              <div className="mt-3">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => updateFilters({ rating: rating })}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-colors ${
                        localFilters.rating === rating
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${localFilters.rating === rating ? 'fill-current' : ''}`} />
                      <span className="text-sm">{rating}+</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Amenities */}
          <div>
            <button
              onClick={() => toggleSection('amenities')}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-sm font-medium text-gray-700">Amenities</span>
              <span className={`transform transition-transform ${expandedSections.amenities ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.amenities && (
              <div className="mt-3 space-y-2">
                {AMENITIES.map(amenity => {
                  const Icon = amenity.icon;
                  return (
                    <label key={amenity.value} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localFilters.amenities?.includes(amenity.value) || false}
                        onChange={(e) => handleAmenityChange(amenity.value, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{amenity.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Special Features */}
          <div>
            <button
              onClick={() => toggleSection('features')}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-sm font-medium text-gray-700">Special Features</span>
              <span className={`transform transition-transform ${expandedSections.features ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.features && (
              <div className="mt-3 space-y-2">
                {FEATURES.map(feature => {
                  const Icon = feature.icon;
                  const isChecked = feature.key === 'accessibility' ? localFilters.accessibility :
                                   feature.key === 'petFriendly' ? localFilters.petFriendly :
                                   feature.key === 'businessFriendly' ? localFilters.businessFriendly :
                                   feature.key === 'familyFriendly' ? localFilters.familyFriendly : false;
                  return (
                    <label key={feature.value} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked || false}
                        onChange={(e) => handleFeatureChange(feature, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{feature.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Check-in/Check-out Dates */}
          <div>
            <button
              onClick={() => toggleSection('dates')}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-sm font-medium text-gray-700">Dates</span>
              <span className={`transform transition-transform ${expandedSections.dates ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.dates && (
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Check-in</label>
                  <input
                    type="date"
                    value={localFilters.checkIn || ''}
                    onChange={(e) => updateFilters({ checkIn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Check-out</label>
                  <input
                    type="date"
                    value={localFilters.checkOut || ''}
                    onChange={(e) => updateFilters({ checkOut: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Guests
            </label>
            <input
              type="number"
              min="1"
              placeholder="Number of guests"
              value={localFilters.capacity || ''}
              onChange={(e) => updateFilters({ capacity: parseInt(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}