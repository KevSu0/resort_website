import React from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import { MapPin, Star, Users, Calendar, Filter, Wifi, Car, Coffee, Waves } from 'lucide-react';
import Layout from '../components/Layout';
import { Section, Card, Grid, HeroSection } from '../components/Layout';
import { PropertyGrid } from '../components/PropertyGrid';
import SearchBar from '../components/SearchBar';
import type { StayTypeLoaderData, SearchFilters } from '../router/loaders';

export default function StayTypePage() {
  const { property, stayType, city, allStayTypes } = useLoaderData() as StayTypeLoaderData;

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
    <Layout>
      {/* Breadcrumbs */}
      <Section className="py-4 border-b">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/stay-types" className="hover:text-blue-600 transition-colors">
            Stay Types
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{stayType.type_name}</span>
        </nav>
      </Section>

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
        
        {/* <PropertyGrid properties={properties} /> */}
      </Section>
    </Layout>
  );
}