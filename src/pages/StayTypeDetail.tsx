import React, { useState } from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import { Users, ArrowLeft, Filter } from 'lucide-react';
import { Section, Card, Grid, HeroSection } from '../components/Layout';
import { PropertyGrid } from '../components/PropertyGrid';
import { Breadcrumb } from '../components/Breadcrumb';
import { createStayTypeBreadcrumb } from '../utils/breadcrumbs';
import SortDropdown from '../components/SortDropdown';
import { propertySortOptions } from '../utils/sorting';
import SearchBar from '../components/SearchBar';
import type { StayType, Property, SearchFilters } from '../types';

interface StayTypeDetailData {
  stayType: StayType;
  properties: Property[];
}

export default function StayTypeDetail() {
  const { stayType, properties } = useLoaderData() as StayTypeDetailData;
  const [sortBy, setSortBy] = useState('recommended');
  const totalProperties = properties.length;
  const mainImage = stayType.details.images[0];

  const handleSortChange = (value: string) => {
    setSortBy(value);
    console.log('Sort by:', value);
    // Handle sorting logic here
  };

  return (
    <>
      <Breadcrumb items={createStayTypeBreadcrumb({ stayTypeName: stayType.type_name })} />

      {/* Stay Type Hero */}
      <HeroSection 
        backgroundImage={mainImage}
        className="relative h-96 flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 text-center text-white">
          <Link 
            to="/stay-types"
            className="inline-flex items-center text-white hover:text-gray-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Stay Types
          </Link>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {stayType.type_name}
          </h1>
          <div className="flex items-center justify-center space-x-4 text-lg">
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              <span>{totalProperties} Properties</span>
            </div>
          </div>
          <p className="mt-4 text-xl max-w-3xl mx-auto">
            {stayType.details.description}
          </p>
        </div>
      </HeroSection>

      {/* Search Section */}
      <Section className="bg-white border-b">
        <div className="max-w-4xl mx-auto">
          <SearchBar
            onSearch={(filters: SearchFilters) => {
              console.log('Search filters:', filters);
              // Handle search logic here
            }}
          />
        </div>
      </Section>

      {/* Stay Type Features */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Makes {stayType.type_name} Special
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the unique features and amenities that define this accommodation type
          </p>
        </div>

        <Grid className="grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            {
              title: 'Premium Amenities',
              description: 'Carefully curated facilities and services designed for comfort and luxury',
              icon: '✨'
            },
            {
              title: 'Unique Experience',
              description: 'Distinctive atmosphere and character that sets this stay type apart',
              icon: '🎯'
            },
            {
              title: 'Exceptional Service',
              description: 'Personalized attention and professional hospitality standards',
              icon: '🏆'
            }
          ].map((feature, index) => (
            <Card key={index} className="p-6 text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </Card>
          ))}
        </Grid>
      </Section>

      {/* Properties Section */}
      <Section className="bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {stayType.type_name} Properties
            </h2>
            <p className="text-lg text-gray-600">
              {totalProperties} {stayType.type_name.toLowerCase()} available
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            <SortDropdown 
              options={propertySortOptions}
              value={sortBy} 
              onChange={handleSortChange} 
            />
          </div>
        </div>

        {/* Properties Grid */}
        <PropertyGrid properties={properties} />

        {/* Load More */}
        {properties.length < totalProperties && (
          <div className="text-center">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Load More Properties
            </button>
          </div>
        )}
      </Section>
    </>
  );
}