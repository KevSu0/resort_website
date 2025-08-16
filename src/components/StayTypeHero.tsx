import React from 'react';
import { HeroSection } from './Layout';
import SearchBar from './SearchBar';
import type { SearchFilters } from '../types';

interface StayTypeHeroProps {
  title?: string;
  subtitle?: string;
  showSearchBar?: boolean;
  onSearch?: (filters: SearchFilters) => void;
  className?: string;
}

export function StayTypeHero({
  title = "Find Your Perfect Stay",
  subtitle = "From luxury resorts to cozy boutique hotels, discover accommodations that match your travel style",
  showSearchBar = true,
  onSearch,
  className = "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
}: StayTypeHeroProps) {
  const handleSearch = (filters: SearchFilters) => {
    if (onSearch) {
      onSearch(filters);
    } else {
      console.log('Search filters:', filters);
    }
  };

  return (
    <HeroSection className={className}>
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          {title}
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          {subtitle}
        </p>
        {showSearchBar && (
          <SearchBar variant="hero" onSearch={handleSearch} />
        )}
      </div>
    </HeroSection>
  );
}

export default StayTypeHero;