import React from 'react';
import SearchBar from './SearchBar';
import { HeroSection } from './Layout';
import type { SearchFilters } from '../types';

export function HomeHero() {
  const handleSearch = (filters: SearchFilters) => {
    console.log('Search filters:', filters);
    // Handle search logic here
  };

  return (
    <HeroSection className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Discover Your Perfect
          <span className="block text-yellow-400">Resort Experience</span>
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
          Explore our collection of luxury resorts, from mountain retreats to beachfront paradises
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <SearchBar onSearch={handleSearch} variant="hero" />
      </div>
    </HeroSection>
  );
}
