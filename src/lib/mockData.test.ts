import { describe, it, expect, beforeEach } from 'vitest';
import { MockDataService } from './mockData';
import { mockResortGroup } from './mockData';

// Reset mock data before each test to ensure isolation
beforeEach(() => {
  // This is a simplified reset. A more robust solution might involve deep cloning.
  mockResortGroup.properties = [
    { id: 'bali-ocean-villa', name: 'Bali Ocean Villa', slug: 'bali-ocean-villa', city: 'Bali', citySlug: 'bali', stayType: 'Villa', stayTypeSlug: 'villa', description: 'Luxurious oceanfront villa', shortDescription: 'Oceanfront villa', images: [], amenities: [], price: 500, priceRange: { min: 500, max: 1200, currency: 'USD' }, location: { address: 'Seminyak Beach, Bali, Indonesia', coordinates: { lat: -8.3405, lng: 115.0920 } }, rating: 4.8, reviewCount: 245, featured: true, active: true },
    { id: 'maldives-water-suite', name: 'Maldives Water Suite', slug: 'maldives-water-suite', city: 'Maldives', citySlug: 'maldives', stayType: 'Suite', stayTypeSlug: 'suite', description: 'Overwater suite', shortDescription: 'Overwater suite', images: [], amenities: [], price: 800, priceRange: { min: 800, max: 2000, currency: 'USD' }, location: { address: 'North Malé Atoll, Maldives', coordinates: { lat: 3.2028, lng: 73.2207 } }, rating: 4.9, reviewCount: 189, featured: true, active: true },
  ];
});

describe('MockDataService', () => {
  it('should get all properties', async () => {
    const properties = await MockDataService.getProperties();
    expect(properties).toHaveLength(2);
    expect(properties[0].name).toBe('Bali Ocean Villa');
  });

  it('should get a single property by slug', async () => {
    const property = await MockDataService.getProperty('bali-ocean-villa');
    expect(property).not.toBeNull();
    expect(property?.name).toBe('Bali Ocean Villa');
  });

  it('should return null for a non-existent property slug', async () => {
    const property = await MockDataService.getProperty('non-existent-slug');
    expect(property).toBeNull();
  });

  it('should get a single property by ID', async () => {
    const property = await MockDataService.getPropertyById('maldives-water-suite');
    expect(property).not.toBeNull();
    expect(property?.name).toBe('Maldives Water Suite');
  });

  it('should create a new property', async () => {
    const initialProperties = await MockDataService.getProperties();
    const initialLength = initialProperties.length;

    const newPropertyData = {
      name: 'Test Property',
      slug: 'test-property',
      price: 300,
      active: true,
      featured: false,
      city_slug: 'bali',
      location: { address: 'Test Address', coordinates: { lat: 0, lng: 0 } },
      stay_types: ['test'],
      branding: { description: 'Test desc', primary_color: '#fff', secondary_color: '#000' },
      managers: {},
    };

    const newPropertyId = await MockDataService.createProperty(newPropertyData);
    const properties = await MockDataService.getProperties();

    expect(properties).toHaveLength(initialLength + 1);
    const newProperty = await MockDataService.getPropertyById(newPropertyId);
    expect(newProperty?.name).toBe('Test Property');
  });

  it('should update a property', async () => {
    const propertyId = 'bali-ocean-villa';
    const updates = { name: 'Updated Bali Villa' };

    const success = await MockDataService.updateProperty(propertyId, updates);
    expect(success).toBe(true);

    const updatedProperty = await MockDataService.getPropertyById(propertyId);
    expect(updatedProperty?.name).toBe('Updated Bali Villa');
  });

  it('should create and retrieve an enquiry', async () => {
    let enquiries = await MockDataService.getEnquiries();
    expect(enquiries).toHaveLength(0);

    const newEnquiryData = {
      property_id: 'bali-ocean-villa',
      property_name: 'Bali Ocean Villa',
      city: 'Bali',
      customer: { name: 'John Doe', email: 'john@doe.com' },
      booking_details: { message: 'Test enquiry' },
      status: 'new' as const,
    };

    await MockDataService.createEnquiry(newEnquiryData);
    enquiries = await MockDataService.getEnquiries();
    expect(enquiries).toHaveLength(1);
    expect(enquiries[0].customer.name).toBe('John Doe');
  });
});
