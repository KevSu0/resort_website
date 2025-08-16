import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PropertyPage from './PropertyPage';
import type { PropertyLoaderData } from '../router/loaders';

// Mock router hooks
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useLoaderData: vi.fn(),
  };
});

// Mock child components
vi.mock('../components/Breadcrumbs', () => ({ Breadcrumbs: () => <div data-testid="breadcrumbs" /> }));
vi.mock('../components/PropertyImageGallery', () => ({ PropertyImageGallery: () => <div data-testid="image-gallery" /> }));
vi.mock('../components/BookingSidebar', () => ({ BookingSidebar: () => <div data-testid="booking-sidebar" /> }));

const mockLoaderData: PropertyLoaderData = {
  property: {
    id: 'test-prop',
    name: 'Sunset Valley Resort',
    slug: 'sunset-valley-resort',
    branding: { description: 'Experience tranquility.', primary_color: '', secondary_color: '' },
    location: { address: '123 Valley Rd', coordinates: { lat: 0, lng: 0 } },
    active: true,
    city_slug: 'test-city',
    stay_types: ['villa'],
    managers: {},
    featured: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
  city: { id: 'test-city', name: 'Test City', slug: 'test-city', country: 'Testland' },
  stayTypes: [
    {
      id: 'st1',
      details: {
        amenities: ['Pool', 'WiFi'],
        images: ['img1.jpg'],
        capacity: 2,
        price_range: { min: 100, max: 200, currency: 'USD'},
        description: 'A lovely villa'
      },
      property_id: 'test-prop',
      type_name: 'Villa',
      slug: 'villa',
      active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
  ],
  breadcrumbs: [],
};

describe('PropertyPage', () => {
  it('renders property details and key components', async () => {
    const { useLoaderData } = vi.mocked(await import('react-router-dom'));
    useLoaderData.mockReturnValue(mockLoaderData);

    render(
      <MemoryRouter>
        <PropertyPage />
      </MemoryRouter>
    );

    // Check for property name and description
    expect(screen.getByText('Experience tranquility.')).toBeInTheDocument();

    // Check that child components are rendered
    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
    expect(screen.getByTestId('image-gallery')).toBeInTheDocument();
    expect(screen.getByTestId('booking-sidebar')).toBeInTheDocument();

    // Check for amenities from stayTypes
    expect(screen.getByText('Pool')).toBeInTheDocument();
    expect(screen.getByText('WiFi')).toBeInTheDocument();
  });
});
