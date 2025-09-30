import {
  propertySchema,
  roomTypeSchema,
  offerSchema,
  validateEntity,
} from '../../../src/admin/validation/schemas';
import { type PropertyInput, type RoomTypeInput, type OfferInput } from '../../../src/admin/validation/schemas';

describe('Validation Schemas', () => {
  describe('Property Schema', () => {
    const validProperty: PropertyInput = {
      id: 'prop-1',
      name: 'Test Resort',
      slug: 'test-resort',
      tagline: 'A wonderful place to stay',
      shortDescription: 'This is a short description of the test resort.',
      description: 'A longer description of the property that is definitely more than twenty characters.',
      address: '123 Test St, Test City',
      latitude: 12.34,
      longitude: 56.78,
      mapUrl: 'https://maps.example.com',
      checkIn: '14:00',
      checkOut: '11:00',
      amenities: ['WiFi', 'Pool', 'Parking'],
      heroImage: 'hero.jpg',
      gallery: ['img1.jpg', 'img2.jpg'],
      featured: true,
      seo: {
        title: 'Test Resort - Best Place',
        description: 'Description for SEO that is not too long.',
        keywords: 'resort, hotel, test'
      },
      schemaHotel: {
        priceRange: '$$-$$$',
        starRating: 4,
        amenities: ['WiFi', 'Pool']
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should validate valid property', () => {
      const result = validateEntity(propertySchema, validProperty);
      expect(result.success).toBe(true);
    });

    it('should reject property with invalid slug', () => {
      const invalidProperty = { ...validProperty, slug: 'Invalid Slug!' };
      const result = validateEntity(propertySchema, invalidProperty);
      expect(result.success).toBe(false);
    });

    it('should reject property with invalid coordinates', () => {
      const invalidProperty = { ...validProperty, latitude: 91 };
      const result = validateEntity(propertySchema, invalidProperty);
      expect(result.success).toBe(false);
    });

    it('should reject property without required amenities', () => {
      const invalidProperty = { ...validProperty, amenities: [] };
      const result = validateEntity(propertySchema, invalidProperty);
      expect(result.success).toBe(false);
    });

    it('should reject property with invalid SEO title length', () => {
      const invalidProperty = {
        ...validProperty,
        seo: { ...validProperty.seo, title: 'a'.repeat(61) }
      };
      const result = validateEntity(propertySchema, invalidProperty);
      expect(result.success).toBe(false);
    });
  });

  describe('RoomType Schema', () => {
    const validRoomType: RoomTypeInput = {
      id: 'room-1',
      propertyId: 'prop-1',
      name: 'Deluxe Room',
      slug: 'deluxe-room',
      category: 'Deluxe',
      capacity: 2,
      baseRateBand: {
        base: 100,
        seasonMultiplier: 1.2,
        minOccupancy: 1,
        maxOccupancy: 2
      },
      description: 'A luxurious room with all amenities',
      amenities: ['AC', 'TV', 'Mini-bar'],
      images: ['room1.jpg', 'room2.jpg'],
      featured: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should validate valid room type', () => {
      const result = validateEntity(roomTypeSchema, validRoomType);
      expect(result.success).toBe(true);
    });

    it('should reject room type with invalid occupancy', () => {
      const invalidRoomType = {
        ...validRoomType,
        baseRateBand: { ...validRoomType.baseRateBand, maxOccupancy: 0 }
      };
      const result = validateEntity(roomTypeSchema, invalidRoomType);
      expect(result.success).toBe(false);
    });

    it('should reject room type with negative base rate', () => {
      const invalidRoomType = {
        ...validRoomType,
        baseRateBand: { ...validRoomType.baseRateBand, base: -10 }
      };
      const result = validateEntity(roomTypeSchema, invalidRoomType);
      expect(result.success).toBe(false);
    });
  });

  describe('Offer Schema', () => {
    const validOffer: OfferInput = {
      id: 'offer-1',
      title: 'Summer Special',
      description: 'Get 20% off on summer bookings',
      code: 'SUMMER20',
      type: 'Percentage',
      value: 20,
      validFrom: new Date().toISOString(),
      validUntil: new Date(new Date().getTime() + 1000 * 60 * 60 * 24).toISOString(),
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should validate valid offer', () => {
      const result = validateEntity(offerSchema, validOffer);
      expect(result.success).toBe(true);
    });

    it('should reject offer with invalid date range', () => {
      const invalidOffer = {
        ...validOffer,
        validFrom: new Date(new Date().getTime() + 1000 * 60 * 60 * 24).toISOString(),
        validUntil: new Date().toISOString(),
      };
      const result = validateEntity(offerSchema, invalidOffer);
      expect(result.success).toBe(false);
    });

    it('should reject offer with invalid code format', () => {
      const invalidOffer = { ...validOffer, code: 'invalid code!' };
      const result = validateEntity(offerSchema, invalidOffer);
      expect(result.success).toBe(false);
    });

    it('should reject offer with negative value', () => {
      const invalidOffer = { ...validOffer, value: -10 };
      const result = validateEntity(offerSchema, invalidOffer);
      expect(result.success).toBe(false);
    });
  });
});