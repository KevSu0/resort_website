import React from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import { MapPin, Users, Calendar, ArrowLeft, Filter } from 'lucide-react';
import Layout from '../components/Layout';
import { Section, Card, Grid, HeroSection } from '../components/Layout';
import { PropertyGrid } from '../components/PropertyGrid';
import SearchBar from '../components/SearchBar';
import type { City, Property, SearchFilters } from '../types';

interface CityDetailData {
  city: City;
  properties: Property[];
}

export default function CityDetail() {
  const { city, properties } = useLoaderData() as CityDetailData;
  const totalProperties = city.property_ids.length;
  const mainImage = `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`${city.name} ${city.country} cityscape beautiful destination travel`)}&image_size=landscape_16_9`;

  return (
    <Layout>
      {/* Breadcrumb */}
      <Section className="bg-gray-50 py-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link to="/cities" className="hover:text-blue-600">Cities</Link>
          <span>/</span>
          <span className="text-gray-900">{city.name}</span>
        </div>
      </Section>

      {/* City Hero */}
      <HeroSection 
        backgroundImage={mainImage}
        className="relative h-96 flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 text-center text-white">
          <Link 
            to="/cities"
            className="inline-flex items-center text-white hover:text-gray-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cities
          </Link>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {city.name}
          </h1>
          <div className="flex items-center justify-center space-x-4 text-lg">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{city.country}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              <span>{totalProperties} Properties</span>
            </div>
          </div>
          <p className="mt-4 text-xl max-w-2xl mx-auto">
            {city.seo_data.meta_description}
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

      {/* City Stats */}
      <Section>
        <Grid className="grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{totalProperties}</div>
            <div className="text-gray-600">Properties</div>
          </Card>
        </Grid>
      </Section>

      {/* Properties Section */}
      <Section>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Properties in {city.name}
            </h2>
            <p className="text-lg text-gray-600">
              {totalProperties} accommodations available
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
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

      {/* City Information */}
      <Section className="bg-gray-50">
        <Grid className="grid-cols-1 lg:grid-cols-2 gap-8">
          {/* About the City */}
          <Card className="p-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              About {city.name}
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              {city.seo_data.meta_description}
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Located in {city.country}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">{totalProperties} properties available</span>
              </div>
            </div>
          </Card>
        </Grid>
      </Section>

      {/* Map Section */}
      <Section>
        <Card className="p-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            {city.name} Map
          </h3>
          <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2" />
              <p>Interactive map showing properties in {city.name}</p>
              <p className="text-sm">Map integration would be displayed here</p>
            </div>
          </div>
        </Card>
      </Section>

      {/* Call to Action */}
      <Section className="bg-blue-600 text-white">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Book Your Stay in {city.name}?
          </h2>
          <p className="text-xl mb-6">
            Browse our selection of {totalProperties} properties and find your perfect accommodation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors font-medium">
              <Calendar className="w-4 h-4 mr-2 inline" />
              Book Now
            </button>
            <Link 
              to="/contact"
              className="px-8 py-3 border border-white text-white rounded-md hover:bg-white hover:text-blue-600 transition-colors font-medium"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </Section>
    </Layout>
  );
}