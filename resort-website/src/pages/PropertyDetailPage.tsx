import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { MapPin, Star } from 'lucide-react';
import { type Property, type RoomType, type Place } from '../types';
import { storageService } from '../services/storage';
import { formatCurrency } from '../utils';
import { Layout } from '../components/Layout';
import { PageTransition } from '../components/PageTransition';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ImageGallery } from '../components/property/ImageGallery';
import { AmenitiesDisplay } from '../components/property/AmenitiesDisplay';
import { NearbyPlaces } from '../components/property/NearbyPlaces';
import { RoomTypes } from '../components/property/RoomTypes';

export const PropertyDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      const propertyData = storageService.getPropertyBySlug(slug);
      if (propertyData) {
        setProperty(propertyData);
        setRooms(storageService.getRoomsByPropertyId(propertyData.id));
        setPlaces(storageService.getPlacesByPropertyId(propertyData.id));
      }
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <PageTransition>
        <div className="min-h-screen bg-white">
          {/* Breadcrumbs */}
          <div className="bg-gray-50 py-4 border-b">
            <div className="container">
              <Breadcrumbs property={property || undefined} />
            </div>
          </div>

      {/* Hero Section with Gallery */}
      <section className="relative">
        <div className="container py-4">
          <div className="text-white max-w-3xl relative z-10 -mt-20 mb-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">{property.name}</h1>
            {property.tagline && (
              <p className="text-xl mb-6 text-gray-600">{property.tagline}</p>
            )}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{property.address}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>4.8 (124 reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="bg-gray-100 py-8">
          <div className="container">
            <ImageGallery images={property.gallery} propertyName={property.name} />
          </div>
        </div>
      </section>

      {/* Property Info */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Description */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">About This Property</h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {property.description}
                </p>
              </div>

              {/* Amenities */}
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Amenities & Features</h3>
                <AmenitiesDisplay amenities={property.amenities} />
              </div>

              {/* Nearby Places */}
              {places.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Nearby Attractions</h3>
                  <NearbyPlaces places={places} />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Property Info Card */}
              <div className="bg-gray-50 rounded-xl p-6 sticky top-6">
                <div className="mb-6">
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    {formatCurrency(rooms[0]?.baseRate || 0)}
                  </div>
                  <div className="text-gray-600">per night</div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Check-in</span>
                    <span className="font-medium">{property.checkIn || '2:00 PM'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Check-out</span>
                    <span className="font-medium">{property.checkOut || '11:00 AM'}</span>
                  </div>
                </div>

                <button className="btn-primary w-full mb-4">
                  Check Availability
                </button>

                <button className="btn-outline w-full">
                  Contact Property
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Room Types */}
      {rooms.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">Accommodation Options</h2>
            <RoomTypes rooms={rooms} />
          </div>
        </section>
      )}
        </div>
      </PageTransition>
    </Layout>
  );
};

