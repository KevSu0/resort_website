import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, Users, Calendar, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import { HeroSection, Section, Card, Grid } from '../components/Layout';
import { AdvancedSearchBar } from '../components/SearchBar';
import { FeaturedCities } from '../components/CityCard';
import PropertyCard from '../components/PropertyCard';

// Mock data for demonstration
const featuredProperties = [
  {
    id: '1',
    name: 'Ocean Breeze Resort',
    slug: 'ocean-breeze-resort',
    description: 'Luxury beachfront resort with stunning ocean views',
    images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20beachfront%20resort%20with%20ocean%20views%20modern%20architecture&image_size=landscape_16_9'],
    location: {
      city: 'Bali',
      country: 'Indonesia',
      coordinates: { lat: -8.3405, lng: 115.0920 }
    },
    pricing: {
      basePrice: 299,
      currency: 'USD',
      period: 'night'
    },
    rating: {
      average: 4.8,
      count: 324
    },
    amenities: ['Pool', 'Spa', 'Restaurant', 'WiFi'],
    propertyType: 'resort',
    resortGroup: 'premium-resorts',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Mountain View Lodge',
    slug: 'mountain-view-lodge',
    description: 'Cozy mountain retreat perfect for nature lovers',
    images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20mountain%20lodge%20wooden%20architecture%20forest%20setting&image_size=landscape_16_9'],
    location: {
      city: 'Aspen',
      country: 'USA',
      coordinates: { lat: 39.1911, lng: -106.8175 }
    },
    pricing: {
      basePrice: 189,
      currency: 'USD',
      period: 'night'
    },
    rating: {
      average: 4.6,
      count: 156
    },
    amenities: ['Fireplace', 'Hiking', 'Restaurant', 'WiFi'],
    propertyType: 'lodge',
    resortGroup: 'mountain-retreats',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const featuredCities = [
  {
    id: '1',
    name: 'Bali',
    slug: 'bali',
    country: 'Indonesia',
    description: 'Tropical paradise with beautiful beaches and rich culture',
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=bali%20tropical%20paradise%20rice%20terraces%20temples&image_size=landscape_4_3',
    propertyCount: 15,
    coordinates: { lat: -8.3405, lng: 115.0920 },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Aspen',
    slug: 'aspen',
    country: 'USA',
    description: 'Premier ski destination with luxury mountain resorts',
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=aspen%20colorado%20ski%20resort%20snowy%20mountains&image_size=landscape_4_3',
    propertyCount: 8,
    coordinates: { lat: 39.1911, lng: -106.8175 },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default function Home() {
  const handleSearch = (filters: any) => {
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
            <AdvancedSearchBar onSearch={handleSearch} />
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
        
        <Grid className="grid-cols-1 md:grid-cols-2 gap-8">
          {featuredProperties.map((property) => (
            <PropertyCard 
              key={property.id} 
              property={property} 
              variant="featured"
            />
          ))}
        </Grid>
        
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