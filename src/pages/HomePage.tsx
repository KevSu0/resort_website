import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, Users, Calendar, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import { Section, Card, Grid, HeroSection } from '../components/Layout';
import PropertyCard from '../components/PropertyCard';
import CityCard from '../components/CityCard';
import { AdvancedSearchBar } from '../components/SearchBar';
import type { Property, City, SearchFilters } from '../types';

// Mock data for demonstration
const featuredProperties: Property[] = [
  {
    id: '1',
    name: 'Luxury Mountain Resort',
    slug: 'luxury-mountain-resort',
    description: 'Experience breathtaking mountain views and world-class amenities at our premier mountain resort.',
    shortDescription: 'Premier mountain resort with stunning views',
    images: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20mountain%20resort%20with%20snow%20capped%20peaks%20and%20modern%20architecture&image_size=landscape_16_9',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20resort%20lobby%20with%20mountain%20views&image_size=landscape_4_3'
    ],
    location: {
      address: '123 Mountain View Drive',
      city: 'Aspen',
      state: 'Colorado',
      country: 'USA',
      coordinates: { lat: 39.1911, lng: -106.8175 }
    },
    amenities: ['Spa', 'Ski Access', 'Fine Dining', 'Fitness Center'],
    capacity: { min: 2, max: 8 },
    priceRange: { min: 500, max: 1200 },
    rating: 4.8,
    reviewCount: 245,
    stayTypes: ['luxury', 'ski'],
    isActive: true,
    isFeatured: true,
    seo: {
      title: 'Luxury Mountain Resort - Premium Ski Resort in Aspen',
      description: 'Book your stay at our luxury mountain resort in Aspen. World-class amenities, stunning views, and direct ski access.',
      keywords: ['luxury resort', 'mountain resort', 'ski resort', 'Aspen accommodation']
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Beachfront Paradise Villa',
    slug: 'beachfront-paradise-villa',
    description: 'Relax in luxury at our stunning beachfront villa with private beach access and ocean views.',
    shortDescription: 'Luxury beachfront villa with private beach',
    images: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20beachfront%20villa%20with%20infinity%20pool%20and%20ocean%20views&image_size=landscape_16_9',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20beach%20villa%20interior%20with%20ocean%20views&image_size=landscape_4_3'
    ],
    location: {
      address: '456 Ocean Drive',
      city: 'Malibu',
      state: 'California',
      country: 'USA',
      coordinates: { lat: 34.0259, lng: -118.7798 }
    },
    amenities: ['Private Beach', 'Infinity Pool', 'Ocean View', 'Concierge'],
    capacity: { min: 4, max: 12 },
    priceRange: { min: 800, max: 2000 },
    rating: 4.9,
    reviewCount: 189,
    stayTypes: ['luxury', 'beach'],
    isActive: true,
    isFeatured: true,
    seo: {
      title: 'Beachfront Paradise Villa - Luxury Beach Resort in Malibu',
      description: 'Experience ultimate luxury at our beachfront villa in Malibu. Private beach access, infinity pool, and stunning ocean views.',
      keywords: ['beachfront villa', 'luxury beach resort', 'Malibu accommodation', 'private beach']
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const featuredCities: City[] = [
  {
    id: '1',
    name: 'Aspen',
    slug: 'aspen',
    state: 'Colorado',
    country: 'USA',
    description: 'World-renowned ski destination with luxury resorts and stunning mountain scenery.',
    shortDescription: 'Premier ski destination in Colorado',
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=aspen%20colorado%20mountain%20town%20with%20snow%20and%20ski%20slopes&image_size=landscape_16_9',
    propertyCount: 12,
    coordinates: { lat: 39.1911, lng: -106.8175 },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Malibu',
    slug: 'malibu',
    state: 'California',
    country: 'USA',
    description: 'Stunning coastal city with beautiful beaches and luxury oceanfront properties.',
    shortDescription: 'Luxury coastal destination in California',
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=malibu%20california%20coastline%20with%20luxury%20beachfront%20homes&image_size=landscape_16_9',
    propertyCount: 8,
    coordinates: { lat: 34.0259, lng: -118.7798 },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default function HomePage() {
  const handleSearch = (filters: SearchFilters) => {
    console.log('Search filters:', filters);
    // Handle search logic here
  };

  return (
    <Layout>
      {/* Hero Section */}
      <HeroSection className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Your Perfect
            <span className="block text-yellow-400">Resort Experience</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
            Explore our collection of luxury resorts, from mountain retreats to beachfront paradises
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <AdvancedSearchBar onSearch={handleSearch} />
        </div>
      </HeroSection>

      {/* Featured Properties */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Properties
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Handpicked luxury accommodations that offer exceptional experiences
          </p>
        </div>
        
        <Grid className="grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} variant="featured" />
          ))}
        </Grid>
        
        <div className="text-center">
          <Link
            to="/properties"
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Search className="mr-2 w-4 h-4" />
            Browse All Properties
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
            Explore our most sought-after locations around the world
          </p>
        </div>
        
        <Grid className="grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {featuredCities.map((city) => (
            <CityCard key={city.id} city={city} variant="hero" />
          ))}
        </Grid>
        
        <div className="text-center">
          <Link
            to="/cities"
            className="inline-flex items-center px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            <MapPin className="mr-2 w-4 h-4" />
            Explore All Destinations
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
            Experience the difference with our premium amenities and exceptional service
          </p>
        </div>
        
        <Grid className="grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Luxury Amenities</h3>
            <p className="text-gray-600">
              World-class facilities including spas, fine dining, and exclusive experiences
            </p>
          </Card>
          
          <Card className="text-center p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Personalized Service</h3>
            <p className="text-gray-600">
              Dedicated concierge and staff to ensure your stay exceeds expectations
            </p>
          </Card>
          
          <Card className="text-center p-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Prime Locations</h3>
            <p className="text-gray-600">
              Carefully selected destinations offering the best of nature and luxury
            </p>
          </Card>
        </Grid>
      </Section>

      {/* Call to Action */}
      <Section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Book Your Dream Getaway?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied guests who have experienced luxury redefined
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/properties"
              className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              <Calendar className="mr-2 w-4 h-4" />
              Book Now
            </Link>
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