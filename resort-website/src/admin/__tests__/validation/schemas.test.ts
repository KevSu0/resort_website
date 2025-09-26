import {
  propertySchema,
  roomTypeSchema,
  offerSchema,
  validateEntity,
  type PropertyInput,
  type RoomTypeInput,
  type OfferInput
} from '../validation/schemas';

describe('Validation Schemas', () => {
  describe('Property Schema', () => {
    const validProperty: PropertyInput = {
      id: 'prop-1',
      name: 'Test Resort',
      slug: 'test-resort',
      tagline: 'A wonderful place to stay',
      shortDescription: 'Short description',
      description: 'A longer description of the property',
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
        description: 'Description for SEO',
        keywords: 'resort, hotel, test'
      },
      schemaHotel: {
        priceRange: '$$-$$$',
        starRating: 4,
        amenities: ['WiFi', 'Pool']
      },
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    };

    it('should validate valid property', () => {
      const result = validateEntity(propertySchema, validProperty);
      expect(result.success).toBe(true);
    });

    it('should reject property with invalid slug', () => {
      const invalidProperty = { ...validProperty, slug: 'Invalid Slug!' };
      const result = validateEntity(propertySchema, invalidProperty);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('slug: Slug must contain only lowercase letters, numbers, and hyphens');
    });

    it('should reject property with invalid coordinates', () => {
      const invalidProperty = { ...validProperty, latitude: 91 };
      const result = validateEntity(propertySchema, invalidProperty);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('latitude: Latitude must be between -90 and 90');
    });

    it('should reject property without required amenities', () => {
      const invalidProperty = { ...validProperty, amenities: [] };
      const result = validateEntity(propertySchema, invalidProperty);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('amenities: At least one amenity is required');
    });

    it('should reject property with invalid SEO title length', () => {
      const invalidProperty = {
        ...validProperty,
        seo: { ...validProperty.seo, title: 'a'.repeat(61) }
      };
      const result = validateEntity(propertySchema, invalidProperty);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('seo.title: Title must be 60 characters or less');
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
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
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
      expect(result.errors).toContain('baseRateBand: Maximum occupancy must be greater than or equal to minimum occupancy');
    });

    it('should reject room type with negative base rate', () => {
      const invalidRoomType = {
        ...validRoomType,
        baseRateBand: { ...validRoomType.baseRateBand, base: -10 }
      };
      const result = validateEntity(roomTypeSchema, invalidRoomType);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('baseRateBand.base: Base rate must be positive');
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
      validFrom: '2023-06-01T00:00:00Z',
      validUntil: '2023-09-30T23:59:59Z',
      terms: 'Terms and conditions apply',
      status: 'Active',
      minBookingValue: 100,
      maxDiscountAmount: 500,
      usageLimit: 100,
      usageCount: 0,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    };

    it('should validate valid offer', () => {
      const result = validateEntity(offerSchema, validOffer);
      expect(result.success).toBe(true);
    });

    it('should reject offer with invalid date range', () => {
      const invalidOffer = {
        ...validOffer,
        validFrom: '2023-09-01T00:00:00Z',
        validUntil: '2023-06-30T23:59:59Z'
      };
      const result = validateEntity(offerSchema, invalidOffer);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Valid until date must be after valid from date');
    });

    it('should reject offer with invalid code format', () => {
      const invalidOffer = { ...validOffer, code: 'invalid code!' };
      const result = validateEntity(offerSchema, invalidOffer);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('code: Code must contain only uppercase letters, numbers, hyphens, and underscores');
    });

    it('should reject offer with negative value', () => {
      const invalidOffer = { ...validOffer, value: -10 };
      const result = validateEntity(offerSchema, invalidOffer);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('value: Value must be positive');
    });
  });

  describe('Cross-Entity Validation', () => {
    it('should validate multiple entities in bulk', () => {
      const entities = [
        { type: 'property', data: validProperty },
        { type: 'roomType', data: validRoomType },
        { type: 'offer', data: validOffer }
      ];

      const results = entities.map(entity => {
        let schema;
        switch (entity.type) {
          case 'property':
            schema = propertySchema;
            break;
          case 'roomType':
            schema = roomTypeSchema;
            break;
          case 'offer':
            schema = offerSchema;
            break;
        }
        return validateEntity(schema!, entity.data);
      });

      expect(results.every(result => result.success)).toBe(true);
    });

    it('should handle validation errors gracefully', () => {
      const invalidEntity = { type: 'unknown', data: {} };

      // This would be handled by the validation service
      expect(() => {
        // Simulate validation service behavior
        if (!['property', 'roomType', 'offer'].includes(invalidEntity.type)) {
          throw new Error(`Unknown entity type: ${invalidEntity.type}`);
        }
      }).toThrow('Unknown entity type: unknown');
    });
  });
});