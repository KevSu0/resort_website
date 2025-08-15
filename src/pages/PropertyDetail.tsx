import React from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import { MapPin, Star, Users, Wifi, Car, Coffee, Waves, Calendar, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';
import { Section, Card, Grid } from '../components/Layout';

import { PropertyLoaderData } from '../router/loaders';

export default function PropertyDetail() {
  const { property, city, stayTypes } = useLoaderData() as PropertyLoaderData;

  const amenityIcons: Record<string, React.ComponentType<{ className: string }>> = {
    'WiFi': Wifi,
    'Pool': Waves,
    'Parking': Car,
    'Restaurant': Coffee,
    'Spa': Star
  };

  const allImages = stayTypes.flatMap(st => st.details.images);
  const allAmenities = stayTypes.flatMap(st => st.details.amenities);

  return (
    <Layout>
      {/* Breadcrumb */}
      <Section className="bg-gray-50 py-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link to="/properties" className="hover:text-blue-600">Properties</Link>
          <span>/</span>
          <Link to={`/locations/${city.slug}`} className="hover:text-blue-600">
            {city.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{property.name}</span>
        </div>
      </Section>

      {/* Property Header */}
      <Section>
        <div className="mb-6">
          <Link 
            to="/properties"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Properties
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {property.name}
              </h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{city.name}, {city.country}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Property Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {allImages.map((image, index) => (
            <div key={index} className={`${index === 0 ? 'md:col-span-2 lg:row-span-2' : ''} relative overflow-hidden rounded-lg`}>
              <img 
                src={image} 
                alt={`${property.name} - Image ${index + 1}`}
                className="w-full h-64 md:h-80 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Property Details */}
      <Section>
        <Grid className="grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            <Card className="p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">About This Property</h2>
              <p className="text-gray-600 leading-relaxed">
                {property.branding.description}
              </p>
            </Card>

            {/* Amenities */}
            <Card className="p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {allAmenities.map((amenity) => {
                  const Icon = amenityIcons[amenity] || Star;
                  return (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Icon className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Location */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Location</h2>
              <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2" />
                  <p>Interactive map would be displayed here</p>
                  <p className="text-sm">{city.name}, {city.country}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guests
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                      <option value="1">1 Guest</option>
                      <option value="2">2 Guests</option>
                      <option value="3">3 Guests</option>
                      <option value="4">4 Guests</option>
                    </select>
                  </div>
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Now
                </button>
              </form>
              
              <div className="mt-4 text-center text-sm text-gray-500">
                Free cancellation up to 24 hours before check-in
              </div>
            </Card>
          </div>
        </Grid>
      </Section>
    </Layout>
  );
}