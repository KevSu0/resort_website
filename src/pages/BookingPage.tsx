import React from 'react';
import { useLoaderData } from 'react-router-dom';
import { Section, PageContainer } from '../components/Layout';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { BookingSidebar } from '../components/BookingSidebar';
import { PropertyImageGallery } from '../components/PropertyImageGallery';
import type { PropertyLoaderData } from '../router/loaders';
import { MockDataService } from '../lib/mockData';
import { toast } from '../hooks/useToast';

interface BookingData {
  checkIn: string;
  checkOut: string;
  guests: number;
}

export default function BookingPage() {
  const { property, city, stayTypes } = useLoaderData() as PropertyLoaderData;

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Properties', path: '/properties' },
    { label: property.name, path: `/properties/${property.slug}` },
    { label: 'Book', path: `/properties/${property.slug}/book` },
  ];

  const allImages = stayTypes.flatMap(st => st.details.images);

  const startingPrice = property.price;

  const maxGuests = stayTypes.reduce((max, st) => {
    return st.details.capacity > max ? st.details.capacity : max;
  }, 0);

  const handleBookingSubmit = async (bookingData: BookingData) => {
    try {
      await MockDataService.createEnquiry({
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
          message: 'New enquiry from booking page.',
        },
        status: 'new'
      });
      toast({
        title: 'Enquiry Sent!',
        description: 'Thank you for your interest. We will get back to you shortly.',
        variant: 'success'
      });
    } catch {
      toast({
        title: 'Submission Failed',
        description: 'There was an error sending your enquiry. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <PageContainer>
      <Breadcrumbs items={breadcrumbItems} />
      <Section>
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Book Your Stay at {property.name}</h1>
            <p className="text-lg text-gray-600">Confirm your details to send an enquiry.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <PropertyImageGallery images={allImages} propertyName={property.name} />
            </div>
          <BookingSidebar
            pricePerNight={startingPrice}
            maxGuests={maxGuests}
            onBookingSubmit={handleBookingSubmit}
          />
        </div>
      </Section>
    </PageContainer>
  );
}
