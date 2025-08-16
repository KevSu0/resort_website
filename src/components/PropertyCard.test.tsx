import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PropertyCard from './PropertyCard';
import type { Property } from '../types';

const mockProperty: Property = {
  id: 'test-prop',
  slug: 'test-property',
  name: 'Test Property',
  city_slug: 'test-city',
  location: {
    address: '123 Test St, Test City',
    coordinates: { lat: 0, lng: 0 },
  },
  stay_types: ['villa'],
  branding: {
    description: 'A beautiful test property.',
    primary_color: '#fff',
    secondary_color: '#000',
  },
  managers: {},
  active: true,
  featured: false,
  rating: 4.5,
  reviewCount: 100,
  price: 250,
  created_at: new Date(),
  updated_at: new Date(),
};

describe('PropertyCard', () => {
  it('renders property information correctly', () => {
    render(
      <MemoryRouter>
        <PropertyCard property={mockProperty} />
      </MemoryRouter>
    );

    // Check for property name
    expect(screen.getByText('Test Property')).toBeInTheDocument();

    // Check for location
    expect(screen.getByText('123 Test St, Test City')).toBeInTheDocument();

    // Check for rating and review count
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(100)')).toBeInTheDocument();

    // Check for price
    expect(screen.getByText('$250')).toBeInTheDocument();
    expect(screen.getByText('/night')).toBeInTheDocument();
  });

  it('renders the book now button with the correct link', () => {
    render(
      <MemoryRouter>
        <PropertyCard property={mockProperty} />
      </MemoryRouter>
    );

    const bookNowButton = screen.getByRole('link', { name: /book now/i });
    expect(bookNowButton).toBeInTheDocument();
    expect(bookNowButton).toHaveAttribute('href', '/properties/test-property/book');
  });

  it('does not render if property is inactive', () => {
    const inactiveProperty = { ...mockProperty, active: false };
    const { container } = render(
      <MemoryRouter>
        <PropertyCard property={inactiveProperty} />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });
});
