import React from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import { MapPin, Star, Users, Calendar, ArrowLeft, Wifi, Car, Utensils, Waves } from 'lucide-react';
import Layout from '../components/Layout';
import { Section, Card, Grid } from '../components/Layout';
import PropertyCard from '../components/PropertyCard';
import type { PropertyLoaderData } from '../router/loaders';

// Amenity icons mapping
const amenityIcons: Record<string, React.ComponentType<any>> = {
  'Spa': Waves,
  'Ski Access': MapPin,
  'Fine Dining': Utensils,
  'Fitness Center': Users,
  'Private Beach': Waves,
  'Infinity Pool': Waves,
  'Ocean View': MapPin,
  'Concierge': Users,
  'WiFi': Wifi,
  'Parking': Car
};

export default function PropertyPage() {
  const { property, relatedProperties } = useLoaderData() as PropertyLoaderData;

  const getAmenityIcon = (amenity: string) => {
    const IconComponent = amenityIcons[amenity] || MapPin;
    return <IconComponent className="w-5 h-5" />;
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
          <Link to="/properties" className="hover:text-blue-600 transition-colors">
            Properties
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{property.name}</span>
        </nav>
      </Section>

      {/* Property Header */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Images */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <img
                  src={property.images[0]}
                  alt={property.name}
                  className="w-full h-64 md:h-80 object-cover rounded-lg"
                />
              </div>
              {property.images.slice(1, 3).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${property.name} ${index + 2}`}
                  className="w-full h-32 md:h-40 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ${property.priceRange.min} - ${property.priceRange.max}
                  </span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium">{property.rating}</span>
                    <span className="ml-1 text-sm text-gray-500">({property.reviewCount})</span>
                  </div>
                </div>
                <p className="text-gray-600">per night</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guests
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {Array.from({ length: property.capacity.max - property.capacity.min + 1 }, (_, i) => (
                      <option key={i} value={property.capacity.min + i}>
                        {property.capacity.min + i} guest{property.capacity.min + i > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Book Now
              </button>
            </Card>
          </div>
        </div>
      </Section>

      {/* Property Details */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Property</h2>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h3>
              <Grid className="grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-blue-600">
                      {getAmenityIcon(amenity)}
                    </div>
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </Grid>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Location</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">{property.location.address}</p>
                    <p className="text-gray-600">
                      {property.location.city}, {property.location.state}, {property.location.country}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Property Info Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Capacity</span>
                  <span className="font-medium">{property.capacity.min}-{property.capacity.max} guests</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="font-medium">{property.rating}/5</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reviews</span>
                  <span className="font-medium">{property.reviewCount} reviews</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stay Types</span>
                  <div className="flex flex-wrap gap-1">
                    {property.stayTypes.map((type) => (
                      <span key={type} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* Related Properties */}
      {relatedProperties && relatedProperties.length > 0 && (
        <Section className="bg-gray-50">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              You Might Also Like
            </h2>
            <p className="text-gray-600">
              Similar properties in {property.location.city}
            </p>
          </div>
          
          <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProperties.slice(0, 3).map((relatedProperty) => (
              <PropertyCard key={relatedProperty.id} property={relatedProperty} />
            ))}
          </Grid>
        </Section>
      )}
    </Layout>
  );
}