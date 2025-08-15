import React from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import { MapPin, Star, Users, Calendar, ArrowLeft, Filter, Wifi, Car, Coffee, Waves } from 'lucide-react';
import Layout from '../components/Layout';
import { Section, Card, Grid, HeroSection } from '../components/Layout';
import PropertyCard from '../components/PropertyCard';
import { AdvancedSearchBar } from '../components/SearchBar';
import type { StayTypeLoaderData } from '../router/loaders';

export default function StayTypePage() {
  const { stayType, properties, totalProperties, relatedStayTypes } = useLoaderData() as StayTypeLoaderData;

  const handleSearch = (filters: any) => {
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
          <span className="text-gray-900 font-medium">{stayType.name}</span>
        </nav>
      </Section>

      {/* Stay Type Hero */}
      <HeroSection 
        className="bg-cover bg-center bg-gray-900 text-white relative"
        style={{ backgroundImage: `url(${stayType.image})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              {getStayTypeIcon(stayType.name)}
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {stayType.name}
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            {stayType.description}
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{totalProperties} Properties</span>
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1 text-yellow-400" />
              <span>4.8 Average Rating</span>
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

      {/* Stay Type Features */}
      <Section className="bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Why Choose {stayType.name}?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the unique features and amenities that make our {stayType.name.toLowerCase()} properties exceptional
          </p>
        </div>
        
        <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
              <Wifi className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Premium Amenities</h3>
            <p className="text-sm text-gray-600">
              High-speed WiFi, luxury furnishings, and modern conveniences
            </p>
          </Card>
          
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Personalized Service</h3>
            <p className="text-sm text-gray-600">
              Dedicated staff and concierge services for an exceptional stay
            </p>
          </Card>
          
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
              <Car className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Prime Locations</h3>
            <p className="text-sm text-gray-600">
              Strategic locations with easy access to attractions and transport
            </p>
          </Card>
          
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto mb-4">
              <Coffee className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Dining Excellence</h3>
            <p className="text-sm text-gray-600">
              World-class restaurants and room service available 24/7
            </p>
          </Card>
        </Grid>
      </Section>

      {/* Properties Section */}
      <Section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {stayType.name} Properties
            </h2>
            <p className="text-gray-600">
              {properties.length} of {totalProperties} properties shown
            </p>
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filter & Sort
          </button>
        </div>
        
        {properties.length > 0 ? (
          <>
            <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </Grid>
            
            {/* Load More Button */}
            {properties.length < totalProperties && (
              <div className="text-center">
                <button className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Load More Properties ({totalProperties - properties.length} remaining)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
              {getStayTypeIcon(stayType.name)}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {stayType.name.toLowerCase()} properties found
            </h3>
            <p className="text-gray-600 mb-6">
              We don't have any {stayType.name.toLowerCase()} properties available at the moment.
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

      {/* Popular Destinations */}
      <Section className="bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Popular {stayType.name} Destinations
          </h2>
          <p className="text-gray-600">
            Explore the most sought-after locations for {stayType.name.toLowerCase()} stays
          </p>
        </div>
        
        <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mock popular destinations */}
          {[
            { name: 'Miami Beach', count: 12, image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Miami%20Beach%20luxury%20resort%20oceanfront%20palm%20trees%20sunset&image_size=landscape_4_3' },
            { name: 'Aspen', count: 8, image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Aspen%20mountain%20luxury%20resort%20snow%20winter%20landscape&image_size=landscape_4_3' },
            { name: 'Napa Valley', count: 15, image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Napa%20Valley%20vineyard%20luxury%20resort%20wine%20country&image_size=landscape_4_3' }
          ].map((destination, index) => (
            <Card key={index} className="group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-cover bg-center" style={{ backgroundImage: `url(${destination.image})` }}>
                <div className="w-full h-full bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all flex items-end">
                  <div className="p-4 text-white">
                    <h3 className="font-semibold text-lg">{destination.name}</h3>
                    <p className="text-sm text-gray-200">{destination.count} {stayType.name.toLowerCase()} properties</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </Grid>
      </Section>

      {/* Related Stay Types */}
      {relatedStayTypes && relatedStayTypes.length > 0 && (
        <Section>
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Other Stay Types
            </h2>
            <p className="text-gray-600">
              Explore different accommodation styles for your perfect getaway
            </p>
          </div>
          
          <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedStayTypes.map((relatedType) => (
              <Link key={relatedType.id} to={`/stay-types/${relatedType.slug}`}>
                <Card className="group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-cover bg-center" style={{ backgroundImage: `url(${relatedType.image})` }}>
                    <div className="w-full h-full bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="p-3 bg-white bg-opacity-20 rounded-full w-fit mx-auto mb-3">
                          {getStayTypeIcon(relatedType.name)}
                        </div>
                        <h3 className="font-semibold text-lg">{relatedType.name}</h3>
                        <p className="text-sm text-gray-200 mt-1">{relatedType.shortDescription}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </Grid>
        </Section>
      )}

      {/* Call to Action */}
      <Section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Book Your {stayType.name}?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Experience luxury and comfort with our premium {stayType.name.toLowerCase()} accommodations
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
              Get Assistance
            </Link>
          </div>
        </div>
      </Section>
    </Layout>
  );
}