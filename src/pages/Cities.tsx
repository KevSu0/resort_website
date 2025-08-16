import React, { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { Section } from '../components/Layout';
import { CityGrid } from '../components/CityGrid';
import SearchBar from '../components/SearchBar';
import { ListingPageHeader } from '../components/PageHeader';
import { SortDropdown } from '../components/SortDropdown';
import { Pagination } from '../components/Pagination';
import type { City, SearchFilters } from '../types';

interface CitiesPageData {
  cities: City[];
  totalCount: number;
  filters: SearchFilters;
}

export default function Cities() {
  const { cities, totalCount } = useLoaderData() as CitiesPageData;
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const itemsPerPage = 12;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleSearch = (newFilters: SearchFilters) => {
    // Search filters updated
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    // Handle sort logic here
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Handle pagination logic here
  };

  const sortOptions = [
    { value: 'name', label: 'Alphabetical' },
    { value: 'properties', label: 'Most Properties' },
    { value: 'popular', label: 'Most Popular' }
  ];

  return (
    <>
      <ListingPageHeader
          title="Explore Cities"
          subtitle="Discover amazing destinations around the world"
        />

      <Section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            {totalCount} Cities Available
          </h2>
          
          <SortDropdown
            options={sortOptions}
            value={sortBy}
            onChange={handleSortChange}
          />
        </div>
        
        <CityGrid cities={cities} />
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </Section>
    </>
  );
}