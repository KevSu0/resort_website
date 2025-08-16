import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Calendar, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SearchFilters } from '../types';
import { propertyService, cityService, stayTypeService } from '../lib/firestore';

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
  const [filters, setFilters] = useState<SearchFilters>({});
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Fetch search suggestions from services
  const fetchSuggestions = async (searchQuery: string): Promise<SearchSuggestion[]> => {
    try {
      const [properties, cities] = await Promise.all([
        propertyService.getAll(),
        cityService.getAll()
      ]);
      
      const suggestions: SearchSuggestion[] = [];
      const query = searchQuery.toLowerCase();
      
      // Add matching cities
      cities
        .filter(city => city.name.toLowerCase().includes(query))
        .slice(0, 3)
        .forEach(city => {
          suggestions.push({
            id: city.slug,
            type: 'city',
            name: city.name,
            slug: city.slug,
            description: `${properties.filter(p => p.city_slug === city.slug).length} properties available`
          });
        });
      
      // Add matching properties
      properties
        .filter(property => property.name.toLowerCase().includes(query))
        .slice(0, 3)
        .forEach(property => {
          suggestions.push({
            id: property.id,
            type: 'property',
            name: property.name,
            slug: property.slug,
            description: property.branding.description || 'Luxury resort property'
          });
        });
      
      // Get stay types for all properties and find matches
      const stayTypePromises = properties.map(p => stayTypeService.getByProperty(p.id));
      const stayTypesArrays = await Promise.all(stayTypePromises);
      const allStayTypes = stayTypesArrays.flat();
      
      // Add matching stay types (unique by name)
      const uniqueStayTypes = allStayTypes.reduce((acc, stayType) => {
        if (!acc.find(st => st.type_name === stayType.type_name) && 
            stayType.type_name.toLowerCase().includes(query)) {
          acc.push(stayType);
        }
        return acc;
      }, [] as typeof allStayTypes)
      .slice(0, 2);
      
      uniqueStayTypes.forEach(stayType => {
        const count = allStayTypes.filter(st => st.type_name === stayType.type_name).length;
        suggestions.push({
          id: stayType.id,
          type: 'stay-type',
          name: stayType.type_name,
          slug: stayType.slug,
          description: `${count} properties available`
        });
      });
      
      return suggestions.slice(0, 6); // Limit to 6 total suggestions
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  };

  // Handle search input changes
  const handleInputChange = async (value: string) => {
    setQuery(value);
    
    if (value.length > 2) {
      setIsLoading(true);
      try {
        const suggestions = await fetchSuggestions(value);
        setSuggestions(suggestions);
        setIsOpen(true);
      } catch (error) {
        console.error('Error loading suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
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
        navigate(`/properties/${suggestion.slug}`);
        break;
      case 'city':
        navigate(`/locations/${suggestion.slug}`);
        break;
      case 'stay-type':
        navigate(`/stay-types/${suggestion.slug}`);
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
      if (query) searchParams.set('q', query);
      
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