import React from 'react';
import { useLoaderData } from 'react-router-dom';
import Layout from '../components/Layout';
import { Section, Grid } from '../components/Layout';
import PropertyCard, { PropertyGrid } from '../components/PropertyCard';
import { AdvancedSearchBar } from '../components/SearchBar';
import type { Property, SearchFilters } from '../types';

interface PropertiesPageData {
  properties: Property[];
  totalCount: number;
  filters: SearchFilters;
}

export default function Properties() {
  const { properties, totalCount, filters } = useLoaderData() as PropertiesPageData;

  const handleSearch = (newFilters: SearchFilters) => {
    // This would typically update the URL and trigger a new data load
    console.log('Search filters:', newFilters);
  };

  return (
    <Layout>
      <Section className="bg-gray-50">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            All Properties
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our complete collection of premium accommodations
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto mb-8">
          <AdvancedSearchBar onSearch={handleSearch} />
        </div>
      </Section>

      <Section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            {totalCount} Properties Found
          </h2>
          
          <div className="flex items-center space-x-4">
            <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
        
        <PropertyGrid properties={properties} />
        
        {/* Pagination would go here */}
        <div className="mt-12 flex justify-center">
          <div className="flex space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
              1
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              2
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              3
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </Section>
    </Layout>
  );
}