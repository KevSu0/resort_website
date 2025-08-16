import React, { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { Section } from '../components/Layout';
import { PropertyGrid } from '../components/PropertyGrid';
import SearchBar from '../components/SearchBar';
import { ListingPageHeader } from '../components/PageHeader';
import { SortDropdown, propertySortOptions } from '../components/SortDropdown';
import { Pagination } from '../components/Pagination';
import type { Property, SearchFilters } from '../types';

interface PropertiesPageData {
  properties: Property[];
  totalCount: number;
  filters: SearchFilters;
}

export default function Properties() {
  const { properties, totalCount } = useLoaderData() as PropertiesPageData;
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleSearch = (newFilters: SearchFilters) => {
    // This would typically update the URL and trigger a new data load
    // Search filters updated
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    // This would typically update the URL and trigger a new data load
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // This would typically update the URL and trigger a new data load
  };

  return (
    <>
      <ListingPageHeader
        title="All Properties"
        subtitle="Discover our complete collection of premium accommodations"
      >
        <div className="max-w-4xl mx-auto">
          <SearchBar onSearch={handleSearch} />
        </div>
      </ListingPageHeader>

      <Section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            {totalCount} Properties Found
          </h2>
          
          <div className="flex items-center space-x-4">
            <SortDropdown
              options={propertySortOptions}
              value={sortBy}
              onChange={handleSortChange}
              label=""
              className="min-w-[200px]"
            />
          </div>
        </div>
        
        <PropertyGrid properties={properties} />
        
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="mt-12"
          />
        )}
      </Section>
    </>
  );
}