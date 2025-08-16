import React from 'react';
import { useLoaderData } from 'react-router-dom';
import { Section } from '../components/Layout';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { PropertyImageGallery } from '../components/PropertyImageGallery';
import { BookingSidebar } from '../components/BookingSidebar';
import { PropertyDescription } from '../components/PropertyDescription';
import { PropertyAmenities } from '../components/PropertyAmenities';
import { PropertyLocation } from '../components/PropertyLocation';
import { PropertyInfoSidebar } from '../components/PropertyInfoSidebar';
import type { PropertyLoaderData } from '../router/loaders';

export default function PropertyPage() {
  const { property, city, stayTypes } = useLoaderData() as PropertyLoaderData;

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Properties', path: '/properties' },
    { label: property.name, path: `/properties/${property.slug}` },
  ];

  const allImages = stayTypes.flatMap(st => st.details.images);
  const allAmenities = stayTypes.flatMap(st => st.details.amenities);

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <PropertyImageGallery images={allImages} propertyName={property.name} />
          <BookingSidebar 
            pricePerNight={299}
            maxGuests={6}
            onBookingSubmit={(bookingData) => {
              console.log('Booking submitted:', bookingData);
            }}
          />
        </div>
      </Section>

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <PropertyDescription description={property.branding.description} />
            <PropertyAmenities amenities={allAmenities} />
            <PropertyLocation location={property.location} city={city} />
          </div>
          <PropertyInfoSidebar property={property} />
        </div>
      </Section>
    </>
  );
}