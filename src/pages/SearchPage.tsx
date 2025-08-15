import React, { useState, useEffect, useMemo } from 'react';
import { useLoaderData, Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin, Star, Grid3X3, List } from 'lucide-react';
import Layout from '../components/Layout';
import { Section, Card, Grid } from '../components/Layout';
import { PropertyGrid } from '../components/PropertyGrid';
import SearchBar from '../components/SearchBar';
import type { Property, SearchFilters, SearchResult } from '../types';

export default function SearchPage() {
  const { results } = useLoaderData() as { results: SearchResult };
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');

  const query = searchParams.get('q') || '';

  const handleSearch = (filters: SearchFilters) => {
    const newParams = new URLSearchParams();
    if (filters.city) newParams.set('city', filters.city);
    if (filters.capacity) newParams.set('capacity', filters.capacity.toString());
    if (filters.priceRange) newParams.set('price', filters.priceRange.join('-'));
    if (filters.amenities) newParams.set('amenities', filters.amenities.join(','));
    setSearchParams(newParams);
  };

  const handleSort = (value: string) => {
    setSortBy(value);
    // Implement sorting logic here
  };

  return (
    <Layout>
      {/* Search Header */}
      <Section className="bg-gray-50 border-b">
        <div className="max-w-4xl mx-auto">
          <SearchBar
            onSearch={handleSearch}
          />
        </div>
      </Section>

      {/* Search Results */}
      <Section>
        {/* Results Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {query ? `Search Results for "${query}"` : 'Search Results'}
            </h1>
            <p className="text-gray-600">
              {`${results.total} properties found`}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>
            
            {/* Filter Button */}
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Search Results */}
        {results.properties.length > 0 && (
          <PropertyGrid properties={results.properties} />
        )}

        {/* No Results */}
        {results.properties.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No properties found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or browse our featured properties
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Featured Properties
            </Link>
          </div>
        )}

        {/* Pagination */}
        {results.properties.length > 0 && (
          <div className="flex justify-center mt-12">
            <nav className="flex items-center space-x-2">
              <button className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded">
                1
              </button>
              <button className="px-3 py-2 text-gray-700 hover:text-gray-900">
                2
              </button>
              <button className="px-3 py-2 text-gray-700 hover:text-gray-900">
                3
              </button>
              <button className="px-3 py-2 text-gray-700 hover:text-gray-900">
                Next
              </button>
            </nav>
          </div>
        )}
      </Section>

      {/* Search Tips */}
      <Section className="bg-gray-50">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Search Tips
          </h2>
          <p className="text-gray-600">
            Get better results with these helpful search tips
          </p>
        </div>
        
        <Grid className="grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center p-6">
            <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Be Specific with Location</h3>
            <p className="text-sm text-gray-600">
              Include city names, neighborhoods, or landmarks for more accurate results
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Use Filters</h3>
            <p className="text-sm text-gray-600">
              Narrow down results by price, rating, amenities, and property type
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <Search className="w-8 h-8 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Try Different Keywords</h3>
            <p className="text-sm text-gray-600">
              Use synonyms or related terms if you don't find what you're looking for
            </p>
          </Card>
        </Grid>
      </Section>
    </Layout>
  );
}