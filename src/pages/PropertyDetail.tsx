import React from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import { MapPin, Star, ArrowLeft, Wifi, Car, Coffee, Waves } from 'lucide-react';
import { Section, Card, Grid } from '../components/Layout';
import { Breadcrumb } from '../components/Breadcrumb';
import { createPropertyBreadcrumb } from '../utils/breadcrumbs';
import { PropertyImageGallery } from '../components/PropertyImageGallery';
import { BookingSidebar } from '../components/BookingSidebar';
import { PropertyLoaderData } from '../router/loaders';

interface BookingData {
  checkIn: string;
  checkOut: string;
  guests: number;
}

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
  const allAmenities = [...new Set(stayTypes.flatMap(st => st.details.amenities))];
  
  const breadcrumbItems = createPropertyBreadcrumb({
    cityName: city.name,
    citySlug: city.slug,
    propertyName: property.name
  });

  const handleBookingSubmit = async (bookingData: BookingData) => {
    // Handle booking submission logic here
    console.log('Booking submitted:', bookingData);
    // This would typically make an API call to create the booking
  };

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

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
        <PropertyImageGallery 
          images={allImages}
          propertyName={property.name}
          className="mb-8"
        />
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
            <BookingSidebar 
              onBookingSubmit={handleBookingSubmit}
              pricePerNight={299} // This would come from property data
              maxGuests={6}
            />
          </div>
        </Grid>
      </Section>
    </>
  );
}