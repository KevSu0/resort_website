import React from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import { MapPin, Star, Users, Calendar, ArrowLeft, Filter } from 'lucide-react';
import Layout from '../components/Layout';
import { Section, Card, Grid, HeroSection } from '../components/Layout';
import { PropertyCard } from '../components/PropertyCard';
import { AdvancedSearchBar } from '../components/SearchBar';
import type { StayType, Property } from '../types';

interface StayTypeDetailData {
  stayType: StayType;
  properties: Property[];
  totalProperties: number;
  relatedStayTypes: StayType[];
}

export default function StayTypeDetail() {
  const { stayType, properties, totalProperties, relatedStayTypes } = useLoaderData() as StayTypeDetailData;

  return (
    <Layout>
      {/* Breadcrumb */}
      <Section className="bg-gray-50 py-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link to="/stay-types" className="hover:text-blue-600">Stay Types</Link>
          <span>/</span>
          <span className="text-gray-900">{stayType.name}</span>
        </div>
      </Section>

      {/* Stay Type Hero */}
      <HeroSection 
        backgroundImage={stayType.image}
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
            {stayType.name}
          </h1>
          <div className="flex items-center justify-center space-x-4 text-lg">
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              <span>{totalProperties} Properties</span>
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-400 fill-current" />
              <span>4.5+ Average Rating</span>
            </div>
          </div>
          <p className="mt-4 text-xl max-w-3xl mx-auto">
            {stayType.description}
          </p>
        </div>
      </HeroSection>

      {/* Search Section */}
      <Section className="bg-white border-b">
        <div className="max-w-4xl mx-auto">
          <AdvancedSearchBar 
            onSearch={(filters) => {
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
            What Makes {stayType.name} Special
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
              {stayType.name} Properties
            </h2>
            <p className="text-lg text-gray-600">
              {totalProperties} {stayType.name.toLowerCase()} available
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
        <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </Grid>

        {/* Load More */}
        {properties.length < totalProperties && (
          <div className="text-center">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Load More Properties
            </button>
          </div>
        )}
      </Section>

      {/* Popular Destinations for this Stay Type */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Popular Destinations for {stayType.name}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the most sought-after locations for this type of accommodation
          </p>
        </div>

        <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Bali', properties: Math.floor(totalProperties * 0.3), image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20bali%20resort%20destination%20tropical%20paradise&image_size=landscape_4_3' },
            { name: 'Maldives', properties: Math.floor(totalProperties * 0.25), image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=maldives%20luxury%20resort%20overwater%20bungalows&image_size=landscape_4_3' },
            { name: 'Thailand', properties: Math.floor(totalProperties * 0.25), image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=thailand%20beach%20resort%20tropical%20luxury&image_size=landscape_4_3' },
            { name: 'Greece', properties: Math.floor(totalProperties * 0.2), image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=greece%20santorini%20luxury%20hotel%20mediterranean&image_size=landscape_4_3' }
          ].map((destination) => (
            <Card key={destination.name} className="overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src={destination.image} 
                alt={destination.name}
                className="w-full h-32 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{destination.name}</h3>
                <p className="text-sm text-gray-600">{destination.properties} properties</p>
                <Link 
                  to={`/city/${destination.name.toLowerCase()}`}
                  className="mt-2 block text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Explore
                </Link>
              </div>
            </Card>
          ))}
        </Grid>
      </Section>

      {/* Related Stay Types */}
      {relatedStayTypes.length > 0 && (
        <Section className="bg-gray-50">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Similar Stay Types
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              You might also be interested in these accommodation types
            </p>
          </div>
          
          <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedStayTypes.slice(0, 3).map((relatedStayType) => (
              <Card key={relatedStayType.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <img 
                  src={relatedStayType.image} 
                  alt={relatedStayType.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {relatedStayType.name}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {relatedStayType.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">
                      {relatedStayType.propertyCount} properties
                    </span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm">4.5+</span>
                    </div>
                  </div>
                  <Link 
                    to={`/stay-type/${relatedStayType.slug}`}
                    className="block w-full text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Explore {relatedStayType.name}
                  </Link>
                </div>
              </Card>
            ))}
          </Grid>
        </Section>
      )}

      {/* Call to Action */}
      <Section className="bg-blue-600 text-white">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Book Your {stayType.name}?
          </h2>
          <p className="text-xl mb-6">
            Browse our selection of {totalProperties} {stayType.name.toLowerCase()} and find your perfect accommodation
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
              Get Recommendations
            </Link>
          </div>
        </div>
      </Section>
    </Layout>
  );
}