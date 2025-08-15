import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, Users, Calendar, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import { HeroSection, Section, Card, Grid } from '../components/Layout';
import SearchBar from '../components/SearchBar';
import { FeaturedCities } from '../components/FeaturedCities';
import { PropertyGrid } from '../components/PropertyGrid';
import { featuredProperties, featuredCities } from '../lib/mockData';
import type { SearchFilters } from '../types';

export default function Home() {
  const handleSearch = (filters: SearchFilters) => {
    console.log('Search filters:', filters);
    // Handle search logic here
  };

  return (
    <Layout>
      {/* Hero Section */}
      <HeroSection className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Your Perfect
            <span className="block text-yellow-300">Resort Experience</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Explore our collection of premium resorts and unique accommodations worldwide
          </p>
          
          {/* Advanced Search */}
          <div className="max-w-4xl mx-auto">
            <SearchBar onSearch={handleSearch} variant="hero" />
          </div>
        </div>
      </HeroSection>

      {/* Featured Properties */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Properties
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Handpicked accommodations that offer exceptional experiences
          </p>
        </div>
        
        <PropertyGrid properties={featuredProperties} variant="featured" />
        
        <div className="text-center mt-12">
          <Link
            to="/properties"
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View All Properties
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </Section>

      {/* Featured Cities */}
      <Section className="bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Popular Destinations
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore amazing cities and discover unique accommodations
          </p>
        </div>
        
        <FeaturedCities cities={featuredCities} />
        
        <div className="text-center mt-12">
          <Link
            to="/cities"
            className="inline-flex items-center px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Explore All Cities
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </Section>

      {/* Why Choose Us */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Our Resorts?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're committed to providing exceptional experiences at every property
          </p>
        </div>
        
        <Grid className="grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Premium Quality
            </h3>
            <p className="text-gray-600">
              Every property is carefully selected and maintained to ensure the highest standards of comfort and luxury.
            </p>
          </Card>
          
          <Card className="text-center p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Prime Locations
            </h3>
            <p className="text-gray-600">
              Our resorts are strategically located in the world's most beautiful and sought-after destinations.
            </p>
          </Card>
          
          <Card className="text-center p-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Exceptional Service
            </h3>
            <p className="text-gray-600">
              Our dedicated team is committed to making your stay memorable with personalized attention and care.
            </p>
          </Card>
        </Grid>
      </Section>

      {/* Call to Action */}
      <Section className="bg-gradient-to-r from-gray-900 to-blue-900 text-white">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of satisfied guests who have discovered their perfect getaway with us.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/properties"
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Search className="mr-2 w-4 h-4" />
              Browse Properties
            </Link>
            
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-gray-900 transition-colors font-medium"
            >
              <Calendar className="mr-2 w-4 h-4" />
              Plan Your Trip
            </Link>
          </div>
        </div>
      </Section>
    </Layout>
  );
}