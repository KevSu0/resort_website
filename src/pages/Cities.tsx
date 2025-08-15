import React from 'react';
import { useLoaderData } from 'react-router-dom';
import Layout from '../components/Layout';
import { Section } from '../components/Layout';
import { CityGrid } from '../components/CityCard';
import SearchBar from '../components/SearchBar';
import type { City, SearchFilters } from '../types';

interface CitiesPageData {
  cities: City[];
  totalCount: number;
  filters: SearchFilters;
}

export default function Cities() {
  const { cities, totalCount, filters } = useLoaderData() as CitiesPageData;

  const handleSearch = (newFilters: SearchFilters) => {
    console.log('Search filters:', newFilters);
  };

  return (
    <Layout>
      <Section className="bg-gray-50">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore Cities
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing destinations around the world
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBar 
            variant="hero" 
            placeholder="Search cities..."
            onSearch={handleSearch}
          />
        </div>
      </Section>

      <Section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            {totalCount} Cities Available
          </h2>
          
          <div className="flex items-center space-x-4">
            <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="name">Alphabetical</option>
              <option value="properties">Most Properties</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
        
        <CityGrid cities={cities} />
        
        {/* Pagination */}
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
              Next
            </button>
          </div>
        </div>
      </Section>
    </Layout>
  );
}