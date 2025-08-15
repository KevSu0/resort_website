import React from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import { MapPin, Star, Users, Calendar, ArrowLeft, Filter } from 'lucide-react';
import Layout from '../components/Layout';
import { Section, Card, Grid, HeroSection } from '../components/Layout';
import PropertyCard from '../components/PropertyCard';
import { AdvancedSearchBar } from '../components/SearchBar';
import type { CityLoaderData } from '../router/loaders';

export default function CityPage() {
  const { city, properties } = useLoaderData() as CityLoaderData;

  const handleSearch = (filters: any) => {
    console.log('Search filters:', filters);
    // Handle search logic here
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
          <Link to="/cities" className="hover:text-blue-600 transition-colors">
            Cities
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{city.name}</span>
        </nav>
      </Section>

      {/* City Hero */}
      <HeroSection 
        className="bg-cover bg-center bg-gray-900 text-white relative"
        style={{ backgroundImage: `url(${city.image})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {city.name}
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-2">
            {city.state}, {city.country}
          </p>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            {city.description}
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{city.propertyCount} Properties</span>
            </div>
          </div>
        </div>
      </HeroSection>

      {/* Search Section */}
      <Section className="bg-white border-b">
        <div className="max-w-4xl mx-auto">
          <AdvancedSearchBar onSearch={handleSearch} />
        </div>
      </Section>

      {/* City Stats */}
      <Section className="bg-gray-50">
        <Grid className="grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {city.propertyCount}
            </div>
            <div className="text-gray-600">Available Properties</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">
              4.8
            </div>
            <div className="text-gray-600">Average Rating</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              500+
            </div>
            <div className="text-gray-600">Happy Guests</div>
          </Card>
        </Grid>
      </Section>

      {/* Properties Section */}
      <Section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Properties in {city.name}
            </h2>
            <p className="text-gray-600">
              {properties.length} properties available
            </p>
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>
        
        {properties.length > 0 ? (
          <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </Grid>
        ) : (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No properties found
            </h3>
            <p className="text-gray-600 mb-6">
              We don't have any properties in {city.name} at the moment.
            </p>
            <Link
              to="/properties"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse All Properties
            </Link>
          </div>
        )}
      </Section>

      {/* City Information */}
      <Section className="bg-gray-50">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              About {city.name}
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                {city.description}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {city.shortDescription} Discover luxury accommodations and world-class amenities 
                in one of the most sought-after destinations.
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Location Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-gray-700">{city.name}, {city.state}, {city.country}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-gray-700">{city.propertyCount} luxury properties</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Map Section */}
      <Section>
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Explore {city.name}
          </h2>
          <p className="text-gray-600">
            Interactive map showing property locations and nearby attractions
          </p>
        </div>
        
        <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Interactive map coming soon</p>
            <p className="text-sm text-gray-500 mt-2">
              Coordinates: {city.coordinates.lat}, {city.coordinates.lng}
            </p>
          </div>
        </div>
      </Section>

      {/* Call to Action */}
      <Section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Experience {city.name}?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Book your perfect accommodation and start planning your unforgettable getaway
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium">
              <Calendar className="mr-2 w-4 h-4" />
              Book Now
            </button>
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-medium"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </Section>
    </Layout>
  );
}