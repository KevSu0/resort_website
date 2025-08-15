import type { Property, City } from '../types';

export const featuredProperties: Property[] = [
  {
    id: '1',
    name: 'Luxury Mountain Resort',
    slug: 'luxury-mountain-resort',
    city_slug: 'aspen',
    location: {
      address: '123 Mountain View Drive',
      coordinates: { lat: 39.1911, lng: -106.8175 }
    },
    stay_types: ['luxury', 'ski'],
    branding: {
      primary_color: '#000000',
      secondary_color: '#FFFFFF',
      description: 'Experience breathtaking mountain views and world-class amenities at our premier mountain resort.'
    },
    managers: {},
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '2',
    name: 'Beachfront Paradise Villa',
    slug: 'beachfront-paradise-villa',
    city_slug: 'malibu',
    location: {
      address: '456 Ocean Drive',
      coordinates: { lat: 34.0259, lng: -118.7798 }
    },
    stay_types: ['luxury', 'beach'],
    branding: {
      primary_color: '#000000',
      secondary_color: '#FFFFFF',
      description: 'Relax in luxury at our stunning beachfront villa with private beach access and ocean views.'
    },
    managers: {},
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  }
];

export const featuredCities: City[] = [
  {
    name: 'Aspen',
    slug: 'aspen',
    state: 'Colorado',
    country: 'USA',
    property_ids: ['1'],
    seo_data: {
      meta_title: 'Aspen',
      meta_description: 'World-renowned ski destination with luxury resorts and stunning mountain scenery.',
      keywords: ['aspen', 'ski', 'resort']
    },
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Malibu',
    slug: 'malibu',
    state: 'California',
    country: 'USA',
    property_ids: ['2'],
    seo_data: {
      meta_title: 'Malibu',
      meta_description: 'Stunning coastal city with beautiful beaches and luxury oceanfront properties.',
      keywords: ['malibu', 'beach', 'resort']
    },
    created_at: new Date(),
    updated_at: new Date()
  }
];
