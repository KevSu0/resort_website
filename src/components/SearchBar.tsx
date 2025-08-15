import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Calendar, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SearchFilters } from '../types';

interface SearchBarProps {
  variant?: 'default' | 'compact' | 'hero';
  placeholder?: string;
  onSearch?: (filters: SearchFilters) => void;
  className?: string;
}

interface SearchSuggestion {
  id: string;
  type: 'property' | 'city' | 'stay-type';
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export default function SearchBar({ 
  variant = 'default', 
  placeholder = 'Search properties, cities, or stay types...', 
  onSearch,
  className = '' 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    propertyType: '',
    priceRange: { min: 0, max: 10000 },
    amenities: []
  });
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Mock search suggestions - in real app, this would come from API
  const mockSuggestions: SearchSuggestion[] = [
    {
      id: '1',
      type: 'city',
      name: 'Bali',
      slug: 'bali',
      description: '15 properties available'
    },
    {
      id: '2',
      type: 'property',
      name: 'Ocean View Resort',
      slug: 'ocean-view-resort',
      description: 'Luxury beachfront resort'
    },
    {
      id: '3',
      type: 'stay-type',
      name: 'Beach Resort',
      slug: 'beach-resort',
      description: '8 properties available'
    }
  ];

  // Handle search input changes
  const handleInputChange = (value: string) => {
    setQuery(value);
    setFilters(prev => ({ ...prev, query: value }));
    
    if (value.length > 2) {
      setIsLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        const filtered = mockSuggestions.filter(item => 
          item.name.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered);
        setIsLoading(false);
        setIsOpen(true);
      }, 300);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.name);
    setIsOpen(false);
    
    // Navigate based on suggestion type
    switch (suggestion.type) {
      case 'property':
        navigate(`/property/${suggestion.slug}`);
        break;
      case 'city':
        navigate(`/city/${suggestion.slug}`);
        break;
      case 'stay-type':
        navigate(`/stay-type/${suggestion.slug}`);
        break;
    }
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    
    if (onSearch) {
      onSearch(filters);
    } else {
      // Navigate to search results page
      const searchParams = new URLSearchParams();
      if (filters.query) searchParams.set('q', filters.query);
      if (filters.location) searchParams.set('location', filters.location);
      if (filters.checkIn) searchParams.set('checkin', filters.checkIn);
      if (filters.checkOut) searchParams.set('checkout', filters.checkOut);
      if (filters.guests > 1) searchParams.set('guests', filters.guests.toString());
      
      navigate(`/search?${searchParams.toString()}`);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const baseClasses = {
    default: 'w-full max-w-md',
    compact: 'w-full max-w-sm',
    hero: 'w-full max-w-2xl'
  };

  const inputClasses = {
    default: 'h-10 pl-10 pr-4',
    compact: 'h-8 pl-8 pr-3 text-sm',
    hero: 'h-12 pl-12 pr-4 text-lg'
  };

  const iconClasses = {
    default: 'w-4 h-4 left-3',
    compact: 'w-3 h-3 left-2.5',
    hero: 'w-5 h-5 left-4'
  };

  return (
    <div ref={searchRef} className={`relative ${baseClasses[variant]} ${className}`}>
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 ${iconClasses[variant]}`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full ${inputClasses[variant]} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white`}
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      {isOpen && (query.length > 2) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <span className="mt-2 block">Searching...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {suggestion.type === 'city' && <MapPin className="w-4 h-4 text-gray-400" />}
                      {suggestion.type === 'property' && <Search className="w-4 h-4 text-gray-400" />}
                      {suggestion.type === 'stay-type' && <Users className="w-4 h-4 text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {suggestion.name}
                      </div>
                      {suggestion.description && (
                        <div className="text-sm text-gray-500 truncate">
                          {suggestion.description}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {suggestion.type.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
              
              {/* View All Results */}
              <button
                onClick={handleSearch}
                className="w-full px-4 py-3 text-left border-t border-gray-200 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
              >
                <div className="flex items-center justify-center space-x-2 text-blue-600 font-medium">
                  <Search className="w-4 h-4" />
                  <span>View all results for "{query}"</span>
                </div>
              </button>
            </>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <span>No results found for "{query}"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Advanced Search Component
export function AdvancedSearchBar({ onSearch, className = '' }: { onSearch?: (filters: SearchFilters) => void; className?: string }) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    propertyType: '',
    priceRange: { min: 0, max: 10000 },
    amenities: []
  });

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSearch) {
      onSearch(filters);
    } else {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== 'priceRange' && key !== 'amenities') {
          searchParams.set(key, value.toString());
        }
      });
      
      if (filters.priceRange.min > 0) searchParams.set('minPrice', filters.priceRange.min.toString());
      if (filters.priceRange.max < 10000) searchParams.set('maxPrice', filters.priceRange.max.toString());
      if (filters.amenities.length > 0) searchParams.set('amenities', filters.amenities.join(','));
      
      navigate(`/search?${searchParams.toString()}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`bg-white p-6 rounded-lg shadow-lg ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Where to?"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Check-in */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-in
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={filters.checkIn}
              onChange={(e) => setFilters(prev => ({ ...prev, checkIn: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Check-out */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-out
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={filters.checkOut}
              onChange={(e) => setFilters(prev => ({ ...prev, checkOut: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Guests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Guests
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filters.guests}
              onChange={(e) => setFilters(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          type="submit"
          className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
        >
          <Search className="w-4 h-4" />
          <span>Search</span>
        </button>
      </div>
    </form>
  );
}