import React from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import { MapPin, Star, Users, Calendar, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import { Section, Card, Grid, HeroSection } from '../components/Layout';
import { SearchBar } from '../components/SearchBar';
import type { StayType, Property } from '../types';

interface StayTypesData {
  stayTypes: StayType[];
  featuredProperties: Property[];
}

export default function StayTypes() {
  const { stayTypes, featuredProperties } = useLoaderData() as StayTypesData;

  return (
    <Layout>
      {/* Hero Section */}
      <HeroSection className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Find Your Perfect Stay
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            From luxury resorts to cozy boutique hotels, discover accommodations that match your travel style
          </p>
          <SearchBar variant="hero" />
        </div>
      </HeroSection>

      {/* Stay Types Grid */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Accommodation Types
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our diverse range of accommodations, each offering unique experiences and amenities
          </p>
        </div>

        <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stayTypes.map((stayType) => (
            <Card key={stayType.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="relative overflow-hidden">
                <img 
                  src={stayType.image} 
                  alt={stayType.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{stayType.propertyCount} Properties</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {stayType.name}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {stayType.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{stayType.propertyCount} properties</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                    <span>4.5+ rating</span>
                  </div>
                </div>
                
                <Link 
                  to={`/stay-type/${stayType.slug}`}
                  className="block w-full text-center bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Explore {stayType.name}
                </Link>
              </div>
            </Card>
          ))}
        </Grid>
      </Section>

      {/* Featured Properties by Stay Type */}
      <Section className="bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Properties
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Handpicked accommodations that showcase the best of each stay type
          </p>
        </div>

        <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.slice(0, 6).map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img 
                  src={property.images[0]} 
                  alt={property.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                    {property.type}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                  {property.name}
                </h3>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{property.location.city}, {property.location.country}</span>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm font-medium">{property.rating.average}</span>
                    <span className="text-sm text-gray-500 ml-1">({property.rating.count})</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      ${property.pricing.basePrice}
                    </div>
                    <div className="text-xs text-gray-500">per {property.pricing.period}</div>
                  </div>
                </div>
                
                <Link 
                  to={`/property/${property.slug}`}
                  className="block w-full text-center bg-gray-900 text-white py-2 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  View Details
                </Link>
              </div>
            </Card>
          ))}
        </Grid>
        
        <div className="text-center mt-8">
          <Link 
            to="/properties"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            View All Properties
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </Section>

      {/* Stay Type Benefits */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Different Stay Types?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Each accommodation type offers unique advantages for different travel experiences
          </p>
        </div>

        <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Luxury Resorts',
              description: 'All-inclusive experiences with premium amenities and services',
              icon: '🏖️',
              benefits: ['Spa & Wellness', 'Fine Dining', 'Concierge Service']
            },
            {
              title: 'Boutique Hotels',
              description: 'Unique character and personalized service in intimate settings',
              icon: '🏨',
              benefits: ['Local Character', 'Personal Touch', 'Unique Design']
            },
            {
              title: 'Beach Resorts',
              description: 'Direct beach access with water sports and coastal activities',
              icon: '🌊',
              benefits: ['Beach Access', 'Water Sports', 'Ocean Views']
            },
            {
              title: 'City Hotels',
              description: 'Central locations with easy access to urban attractions',
              icon: '🏙️',
              benefits: ['City Center', 'Business Facilities', 'Transport Links']
            }
          ].map((benefit, index) => (
            <Card key={index} className="p-6 text-center">
              <div className="text-4xl mb-4">{benefit.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {benefit.description}
              </p>
              <ul className="space-y-1">
                {benefit.benefits.map((item, idx) => (
                  <li key={idx} className="text-xs text-gray-500">
                    ✓ {item}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </Grid>
      </Section>

      {/* Call to Action */}
      <Section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Perfect Stay?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Browse our collection of carefully selected accommodations and book your next unforgettable experience
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/properties"
              className="px-8 py-3 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors font-medium"
            >
              <Calendar className="w-4 h-4 mr-2 inline" />
              Browse All Properties
            </Link>
            <Link 
              to="/contact"
              className="px-8 py-3 border border-white text-white rounded-md hover:bg-white hover:text-blue-600 transition-colors font-medium"
            >
              Get Personalized Recommendations
            </Link>
          </div>
        </div>
      </Section>
    </Layout>
  );
}