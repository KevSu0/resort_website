import { logger } from '@/utils/logger.js';
import {
  Property,
  Room,
  Availability,
  Pricing,
  Review,
  PropertyView,
  PropertyType,
  PropertyStatus,
  AvailabilityStatus,
  PricingType
} from '@prisma/client';

// Mock data storage (will be replaced with Prisma client)
interface MockProperty extends Property {
  id: string;
  siteId: string;
  name: string;
  description: string;
  type: PropertyType;
  category: string;
  status: PropertyStatus;
  capacity: number;
  basePrice: number;
  currency: string;
  address: any;
  coordinates?: any;
  images: string[];
  amenities: string[];
  policies?: any;
  checkInTime: string;
  checkOutTime: string;
  minStay: number;
  maxStay?: number;
  isActive: boolean;
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface MockRoom extends Room {
  id: string;
  propertyId: string;
  name: string;
  type: string;
  capacity: number;
  basePrice: number;
  size?: number;
  bedType?: string;
  amenities: string[];
  images: string[];
  isActive: boolean;
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface MockAvailability extends Availability {
  id: string;
  propertyId: string;
  roomId?: string;
  date: Date;
  available: boolean;
  bookedCount: number;
  maxBookings: number;
  priceOverride?: number;
  status: AvailabilityStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface MockPricing extends Pricing {
  id: string;
  propertyId: string;
  roomId?: string;
  name: string;
  type: PricingType;
  amount: number;
  currency: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  season?: string;
  minStay?: number;
  maxStay?: number;
  dayOfWeek?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Mock storage
let properties: MockProperty[] = [];
let rooms: MockRoom[] = [];
let availability: MockAvailability[] = [];
let pricing: MockPricing[] = [];
let reviews: any[] = [];
let propertyViews: any[] = [];

// Pagination interface
interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Property creation/update interface
interface CreatePropertyData {
  siteId: string;
  name: string;
  description: string;
  type: PropertyType;
  category: string;
  capacity: number;
  basePrice: number;
  currency?: string;
  address: any;
  coordinates?: any;
  images?: string[];
  amenities?: string[];
  policies?: any;
  checkInTime?: string;
  checkOutTime?: string;
  minStay?: number;
  maxStay?: number;
  sortOrder?: number;
}

interface UpdatePropertyData extends Partial<CreatePropertyData> {
  status?: PropertyStatus;
  isActive?: boolean;
}

interface PropertySearchOptions {
  siteId: string;
  query?: string;
  type?: PropertyType;
  status?: PropertyStatus;
  category?: string;
  minCapacity?: number;
  maxCapacity?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  checkIn?: Date;
  checkOut?: Date;
  adults?: number;
  children?: number;
}

interface PropertyAnalytics {
  totalProperties: number;
  activeProperties: number;
  averageOccupancy: number;
  totalRevenue: number;
  averageRating: number;
  totalViews: number;
  propertyTypes: Record<string, number>;
  popularAmenities: Array<{ amenity: string; count: number }>;
  bookingTrends: Array<{ date: string; bookings: number; revenue: number }>;
}

/**
 * Property Management Service
 * Provides comprehensive business logic for property operations
 */
export class PropertyService {
  /**
   * Create a new property
   */
  async createProperty(data: CreatePropertyData): Promise<MockProperty> {
    try {
      const property: MockProperty = {
        id: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        currency: data.currency || 'USD',
        images: data.images || [],
        amenities: data.amenities || [],
        checkInTime: data.checkInTime || '15:00',
        checkOutTime: data.checkOutTime || '11:00',
        minStay: data.minStay || 1,
        isActive: true,
        status: PropertyStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      properties.push(property);
      logger.info('Property created successfully', { propertyId: property.id, name: property.name });

      return property;
    } catch (error) {
      logger.error('Failed to create property', error);
      throw new Error('Failed to create property');
    }
  }

  /**
   * Get property by ID
   */
  async getPropertyById(id: string, siteId: string): Promise<MockProperty | null> {
    try {
      const property = properties.find(p => p.id === id && p.siteId === siteId);
      if (!property) {
        return null;
      }

      // Track property view
      await this.trackPropertyView(id, siteId);

      return property;
    } catch (error) {
      logger.error('Failed to get property', error);
      throw new Error('Failed to get property');
    }
  }

  /**
   * Get properties with pagination and filtering
   */
  async getProperties(
    siteId: string,
    options: PaginationOptions & {
      status?: PropertyStatus;
      type?: PropertyType;
      isActive?: boolean;
      category?: string;
    }
  ): Promise<PaginatedResult<MockProperty>> {
    try {
      let filteredProperties = properties.filter(p => p.siteId === siteId);

      // Apply filters
      if (options.status) {
        filteredProperties = filteredProperties.filter(p => p.status === options.status);
      }
      if (options.type) {
        filteredProperties = filteredProperties.filter(p => p.type === options.type);
      }
      if (options.isActive !== undefined) {
        filteredProperties = filteredProperties.filter(p => p.isActive === options.isActive);
      }
      if (options.category) {
        filteredProperties = filteredProperties.filter(p => p.category === options.category);
      }

      // Apply sorting
      const sortBy = options.sortBy || 'createdAt';
      const sortOrder = options.sortOrder || 'desc';
      filteredProperties.sort((a, b) => {
        const aValue = a[sortBy as keyof MockProperty];
        const bValue = b[sortBy as keyof MockProperty];

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Apply pagination
      const total = filteredProperties.length;
      const totalPages = Math.ceil(total / options.limit);
      const startIndex = (options.page - 1) * options.limit;
      const endIndex = startIndex + options.limit;
      const data = filteredProperties.slice(startIndex, endIndex);

      return {
        data,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          totalPages,
          hasNext: options.page < totalPages,
          hasPrev: options.page > 1
        }
      };
    } catch (error) {
      logger.error('Failed to get properties', error);
      throw new Error('Failed to get properties');
    }
  }

  /**
   * Update property
   */
  async updateProperty(id: string, siteId: string, data: UpdatePropertyData): Promise<MockProperty | null> {
    try {
      const propertyIndex = properties.findIndex(p => p.id === id && p.siteId === siteId);
      if (propertyIndex === -1) {
        return null;
      }

      properties[propertyIndex] = {
        ...properties[propertyIndex],
        ...data,
        updatedAt: new Date()
      };

      logger.info('Property updated successfully', { propertyId: id });
      return properties[propertyIndex];
    } catch (error) {
      logger.error('Failed to update property', error);
      throw new Error('Failed to update property');
    }
  }

  /**
   * Delete property
   */
  async deleteProperty(id: string, siteId: string): Promise<boolean> {
    try {
      const propertyIndex = properties.findIndex(p => p.id === id && p.siteId === siteId);
      if (propertyIndex === -1) {
        return false;
      }

      // Remove associated rooms, availability, and pricing
      rooms = rooms.filter(r => r.propertyId !== id);
      availability = availability.filter(a => a.propertyId !== id);
      pricing = pricing.filter(p => p.propertyId !== id);

      properties.splice(propertyIndex, 1);

      logger.info('Property deleted successfully', { propertyId: id });
      return true;
    } catch (error) {
      logger.error('Failed to delete property', error);
      throw new Error('Failed to delete property');
    }
  }

  /**
   * Search properties with advanced filtering
   */
  async searchProperties(options: PropertySearchOptions): Promise<PaginatedResult<MockProperty>> {
    try {
      let filteredProperties = properties.filter(p => p.siteId === options.siteId && p.isActive);

      // Text search
      if (options.query) {
        const query = options.query.toLowerCase();
        filteredProperties = filteredProperties.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        );
      }

      // Type filter
      if (options.type) {
        filteredProperties = filteredProperties.filter(p => p.type === options.type);
      }

      // Status filter
      if (options.status) {
        filteredProperties = filteredProperties.filter(p => p.status === options.status);
      }

      // Category filter
      if (options.category) {
        filteredProperties = filteredProperties.filter(p => p.category === options.category);
      }

      // Capacity filter
      if (options.minCapacity) {
        filteredProperties = filteredProperties.filter(p => p.capacity >= options.minCapacity!);
      }
      if (options.maxCapacity) {
        filteredProperties = filteredProperties.filter(p => p.capacity <= options.maxCapacity!);
      }

      // Price filter
      if (options.minPrice) {
        filteredProperties = filteredProperties.filter(p => p.basePrice >= options.minPrice!);
      }
      if (options.maxPrice) {
        filteredProperties = filteredProperties.filter(p => p.basePrice <= options.maxPrice!);
      }

      // Amenities filter
      if (options.amenities && options.amenities.length > 0) {
        filteredProperties = filteredProperties.filter(p =>
          options.amenities!.every(amenity => p.amenities.includes(amenity))
        );
      }

      // Availability check (if dates provided)
      if (options.checkIn && options.checkOut) {
        const availableProperties = await this.checkAvailability(
          filteredProperties.map(p => p.id),
          options.checkIn,
          options.checkOut,
          options.adults || 1,
          options.children || 0
        );
        filteredProperties = filteredProperties.filter(p =>
          availableProperties.includes(p.id)
        );
      }

      // Mock pagination (default to first page, 20 results)
      const page = 1;
      const limit = 20;
      const total = filteredProperties.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = 0;
      const endIndex = limit;
      const data = filteredProperties.slice(startIndex, endIndex);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logger.error('Failed to search properties', error);
      throw new Error('Failed to search properties');
    }
  }

  /**
   * Check property availability
   */
  async checkAvailability(
    propertyIds: string[],
    checkIn: Date,
    checkOut: Date,
    adults: number = 1,
    children: number = 0
  ): Promise<string[]> {
    try {
      const availableProperties: string[] = [];

      for (const propertyId of propertyIds) {
        const property = properties.find(p => p.id === propertyId);
        if (!property) continue;

        // Check capacity
        const totalGuests = adults + children;
        if (property.capacity < totalGuests) continue;

        // Check availability for each date
        let isAvailable = true;
        const currentDate = new Date(checkIn);

        while (currentDate < checkOut) {
          const dayAvailability = availability.find(a =>
            a.propertyId === propertyId &&
            a.date.toDateString() === currentDate.toDateString()
          );

          if (!dayAvailability || !dayAvailability.available ||
              dayAvailability.bookedCount >= dayAvailability.maxBookings) {
            isAvailable = false;
            break;
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }

        if (isAvailable) {
          availableProperties.push(propertyId);
        }
      }

      return availableProperties;
    } catch (error) {
      logger.error('Failed to check availability', error);
      throw new Error('Failed to check availability');
    }
  }

  /**
   * Get property analytics
   */
  async getPropertyAnalytics(siteId: string, propertyId?: string): Promise<PropertyAnalytics> {
    try {
      let targetProperties = properties.filter(p => p.siteId === siteId);
      if (propertyId) {
        targetProperties = targetProperties.filter(p => p.id === propertyId);
      }

      const totalProperties = targetProperties.length;
      const activeProperties = targetProperties.filter(p => p.isActive).length;

      // Mock analytics data
      const analytics: PropertyAnalytics = {
        totalProperties,
        activeProperties,
        averageOccupancy: 75.5, // Mock data
        totalRevenue: 125000, // Mock data
        averageRating: 4.3, // Mock data
        totalViews: propertyViews.filter(v =>
          targetProperties.some(p => p.id === v.propertyId)
        ).length,
        propertyTypes: this.getPropertyTypeDistribution(targetProperties),
        popularAmenities: this.getPopularAmenities(targetProperties),
        bookingTrends: this.getMockBookingTrends()
      };

      return analytics;
    } catch (error) {
      logger.error('Failed to get property analytics', error);
      throw new Error('Failed to get property analytics');
    }
  }

  /**
   * Track property view
   */
  private async trackPropertyView(propertyId: string, siteId: string): Promise<void> {
    try {
      const view = {
        id: `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        propertyId,
        siteId,
        viewedAt: new Date()
      };
      propertyViews.push(view);
    } catch (error) {
      logger.error('Failed to track property view', error);
    }
  }

  /**
   * Get property type distribution
   */
  private getPropertyTypeDistribution(properties: MockProperty[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    properties.forEach(property => {
      distribution[property.type] = (distribution[property.type] || 0) + 1;
    });
    return distribution;
  }

  /**
   * Get popular amenities
   */
  private getPopularAmenities(properties: MockProperty[]): Array<{ amenity: string; count: number }> {
    const amenityCount: Record<string, number> = {};
    properties.forEach(property => {
      property.amenities.forEach(amenity => {
        amenityCount[amenity] = (amenityCount[amenity] || 0) + 1;
      });
    });

    return Object.entries(amenityCount)
      .map(([amenity, count]) => ({ amenity, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Get mock booking trends
   */
  private getMockBookingTrends(): Array<{ date: string; bookings: number; revenue: number }> {
    const trends = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      trends.push({
        date: date.toISOString().split('T')[0],
        bookings: Math.floor(Math.random() * 10) + 1,
        revenue: Math.floor(Math.random() * 5000) + 1000
      });
    }

    return trends;
  }
}

// Export singleton instance
export const propertyService = new PropertyService();