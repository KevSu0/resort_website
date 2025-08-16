import React from 'react';
import { useLoaderData } from 'react-router-dom';
import { Section } from '../components/Layout';
import { Breadcrumb, createCityBreadcrumb } from '../components/Breadcrumb';
import { CityHero } from '../components/CityHero';
import SearchBar from '../components/SearchBar';
import { CityStats } from '../components/CityStats';
import { CityProperties } from '../components/CityProperties';
import { CityInformation } from '../components/CityInformation';
import { CityMap } from '../components/CityMap';
import { CityCallToAction } from '../components/CityCallToAction';
import type { CityLoaderData } from '../router/loaders';
import type { SearchFilters } from '../types';

export default function CityPage() {
  const { city, properties } = useLoaderData() as CityLoaderData;

  const handleSearch = (filters: SearchFilters) => {
    console.log('Search filters:', filters);
    // Handle search logic here
  };

  return (
    <>
      <Breadcrumb items={createCityBreadcrumb({ cityName: city.name })} />
      <CityHero city={city} />

      <Section className="bg-white border-b">
        <div className="max-w-4xl mx-auto">
          <SearchBar onSearch={handleSearch} />
        </div>
      </Section>

      <Section className="bg-gray-50">
        <CityStats city={city} />
      </Section>

      <Section>
        <CityProperties properties={properties} city={city} />
      </Section>

      <Section className="bg-gray-50">
        <CityInformation city={city} />
      </Section>

      <Section>
        <CityMap city={city} />
      </Section>

      <Section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <CityCallToAction city={city} />
      </Section>
    </>
  );
}