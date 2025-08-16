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
import { enquiryService } from '../lib/firestore';
import { toast } from '../hooks/useToast';

export default function PropertyPage() {
  const { property, city, stayTypes, breadcrumbs } = useLoaderData() as PropertyLoaderData;

  const allImages = stayTypes.flatMap(st => st.details.images);
  const allAmenities = stayTypes.flatMap(st => st.details.amenities);

  const startingPrice = stayTypes.reduce((min, st) => {
    return st.details.price_range.min < min ? st.details.price_range.min : min;
  }, Infinity);

  const maxGuests = stayTypes.reduce((max, st) => {
    return st.details.capacity > max ? st.details.capacity : max;
  }, 0);

  const handleBookingSubmit = async (bookingData: any) => {
    try {
      await enquiryService.create({
        property_id: property.id,
        property_name: property.name,
        city: city?.name || '',
        customer: {
          name: 'Anonymous User', // Placeholder
          email: 'anonymous@example.com', // Placeholder
        },
        booking_details: {
          check_in: bookingData.checkIn,
          check_out: bookingData.checkOut,
          guests: bookingData.guests,
          message: 'New enquiry from website.',
        },
        status: 'new'
      });
      toast({
        title: 'Enquiry Sent!',
        description: 'Thank you for your interest. We will get back to you shortly.',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: 'There was an error sending your enquiry. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <PropertyImageGallery images={allImages} propertyName={property.name} />
          <BookingSidebar 
            pricePerNight={startingPrice}
            maxGuests={maxGuests}
            onBookingSubmit={handleBookingSubmit}
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