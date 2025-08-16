import React from 'react';
import { useLoaderData } from 'react-router-dom';
import { MapPin, Users, Coffee, Waves, Filter } from 'lucide-react';
import { Section, HeroSection } from '../components/Layout';
import { Breadcrumb } from '../components/Breadcrumb';
import SearchBar from '../components/SearchBar';
import type { StayTypeLoaderData, SearchFilters } from '../router/loaders';

export default function StayTypePage() {
  const { stayType } = useLoaderData() as StayTypeLoaderData;

  const handleSearch = (filters: SearchFilters) => {
    console.log('Search filters:', filters);
    // Handle search logic here
  };

  const getStayTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'resort':
        return <Waves className="w-6 h-6" />;
      case 'hotel':
        return <Coffee className="w-6 h-6" />;
      case 'villa':
        return <Users className="w-6 h-6" />;
      default:
        return <MapPin className="w-6 h-6" />;
    }
  };

  return (
    <>
      {/* Breadcrumbs */}
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Stay Types', href: '/stay-types' },
        { label: stayType.type_name, href: `/stay-types/${stayType.slug}`, isActive: true }
      ]} />

      {/* Stay Type Hero */}
      <HeroSection 
        className="bg-cover bg-center bg-gray-900 text-white relative"
        backgroundImage={stayType.details.images[0]}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              {getStayTypeIcon(stayType.type_name)}
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {stayType.type_name}
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            {stayType.details.description}
          </p>
        </div>
      </HeroSection>

      {/* Search Section */}
      <Section className="bg-white border-b">
        <div className="max-w-4xl mx-auto">
          <SearchBar onSearch={handleSearch} />
        </div>
      </Section>

      {/* Properties Section */}
      <Section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {stayType.type_name} Properties
            </h2>
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filter & Sort
          </button>
        </div>
        
      </Section>
    </>
  );
}