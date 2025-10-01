import { logger } from '@/utils/logger.js';
import { Availability, AvailabilityStatus } from '@prisma/client';

// Mock data storage (in production, this would use Prisma)
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

// Mock storage
let availability: MockAvailability[] = [];

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

// Availability management interfaces
interface CreateAvailabilityData {
  propertyId: string;
  roomId?: string;
  date: Date;
  available: boolean;
  maxBookings?: number;
  priceOverride?: number;
  status?: AvailabilityStatus;
}

interface UpdateAvailabilityData extends Partial<CreateAvailabilityData> {
  bookedCount?: number;
}

interface AvailabilityQuery {
  propertyId?: string;
  roomId?: string;
  startDate: Date;
  endDate: Date;
  includeBooked?: boolean;
}

interface BulkAvailabilityUpdate {
  propertyId: string;
  roomId?: string;
  dates: Date[];
  updates: Partial<UpdateAvailabilityData>;
}

interface AvailabilityCalendar {
  date: string;
  available: boolean;
  status: AvailabilityStatus;
  bookedCount: number;
  maxBookings: number;
  price: number;
  priceOverride?: number;
}

/**
 * Availability Management Service
 * Provides comprehensive business logic for availability operations
 */
export class AvailabilityService {
  /**
   * Create or update availability for a specific date
   */
  async setAvailability(data: CreateAvailabilityData): Promise<MockAvailability> {
    try {
      // Check if availability already exists for this date
      const existingIndex = availability.findIndex(a =>
        a.propertyId === data.propertyId &&
        a.roomId === data.roomId &&
        a.date.toDateString() === data.date.toDateString()
      );

      const availabilityData: MockAvailability = {
        id: existingIndex !== -1 ? availability[existingIndex].id : `avail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        propertyId: data.propertyId,
        roomId: data.roomId,
        date: data.date,
        available: data.available,
        bookedCount: existingIndex !== -1 ? availability[existingIndex].bookedCount : 0,
        maxBookings: data.maxBookings || 1,
        priceOverride: data.priceOverride,
        status: data.status || (data.available ? AvailabilityStatus.AVAILABLE : AvailabilityStatus.UNAVAILABLE),
        createdAt: existingIndex !== -1 ? availability[existingIndex].createdAt : new Date(),
        updatedAt: new Date()
      };

      if (existingIndex !== -1) {
        availability[existingIndex] = availabilityData;
      } else {
        availability.push(availabilityData);
      }

      logger.info('Availability set successfully', {
        propertyId: data.propertyId,
        roomId: data.roomId,
        date: data.date.toISOString(),
        available: data.available
      });

      return availabilityData;
    } catch (error) {
      logger.error('Failed to set availability', error);
      throw new Error('Failed to set availability');
    }
  }

  /**
   * Get availability for a specific date
   */
  async getAvailability(propertyId: string, date: Date, roomId?: string): Promise<MockAvailability | null> {
    try {
      const availabilityRecord = availability.find(a =>
        a.propertyId === propertyId &&
        a.roomId === roomId &&
        a.date.toDateString() === date.toDateString()
      );

      return availabilityRecord || null;
    } catch (error) {
      logger.error('Failed to get availability', error);
      throw new Error('Failed to get availability');
    }
  }

  /**
   * Get availability for a date range
   */
  async getAvailabilityRange(
    query: AvailabilityQuery,
    options: PaginationOptions = { page: 1, limit: 100 }
  ): Promise<PaginatedResult<MockAvailability>> {
    try {
      let filteredAvailability = availability.filter(a => {
        if (query.propertyId && a.propertyId !== query.propertyId) return false;
        if (query.roomId && a.roomId !== query.roomId) return false;
        if (a.date < query.startDate || a.date > query.endDate) return false;
        if (!query.includeBooked && a.bookedCount >= a.maxBookings) return false;
        return true;
      });

      // Apply sorting
      const sortBy = options.sortBy || 'date';
      const sortOrder = options.sortOrder || 'asc';
      filteredAvailability.sort((a, b) => {
        const aValue = a[sortBy as keyof MockAvailability];
        const bValue = b[sortBy as keyof MockAvailability];

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Apply pagination
      const total = filteredAvailability.length;
      const totalPages = Math.ceil(total / options.limit);
      const startIndex = (options.page - 1) * options.limit;
      const endIndex = startIndex + options.limit;
      const data = filteredAvailability.slice(startIndex, endIndex);

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
      logger.error('Failed to get availability range', error);
      throw new Error('Failed to get availability range');
    }
  }

  /**
   * Get availability calendar
   */
  async getAvailabilityCalendar(
    propertyId: string,
    startDate: Date,
    endDate: Date,
    roomId?: string
  ): Promise<AvailabilityCalendar[]> {
    try {
      const calendar: AvailabilityCalendar[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const availabilityRecord = availability.find(a =>
          a.propertyId === propertyId &&
          a.roomId === roomId &&
          a.date.toDateString() === currentDate.toDateString()
        );

        // Default availability if not found
        const defaultPrice = 100; // This should come from property/room base price
        const calendarDay: AvailabilityCalendar = {
          date: currentDate.toISOString().split('T')[0],
          available: availabilityRecord ? availabilityRecord.available : true,
          status: availabilityRecord ? availabilityRecord.status : AvailabilityStatus.AVAILABLE,
          bookedCount: availabilityRecord ? availabilityRecord.bookedCount : 0,
          maxBookings: availabilityRecord ? availabilityRecord.maxBookings : 1,
          price: availabilityRecord?.priceOverride || defaultPrice,
          priceOverride: availabilityRecord?.priceOverride
        };

        calendar.push(calendarDay);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return calendar;
    } catch (error) {
      logger.error('Failed to get availability calendar', error);
      throw new Error('Failed to get availability calendar');
    }
  }

  /**
   * Update availability
   */
  async updateAvailability(
    propertyId: string,
    date: Date,
    data: UpdateAvailabilityData,
    roomId?: string
  ): Promise<MockAvailability | null> {
    try {
      const availabilityIndex = availability.findIndex(a =>
        a.propertyId === propertyId &&
        a.roomId === roomId &&
        a.date.toDateString() === date.toDateString()
      );

      if (availabilityIndex === -1) {
        return null;
      }

      availability[availabilityIndex] = {
        ...availability[availabilityIndex],
        ...data,
        updatedAt: new Date()
      };

      logger.info('Availability updated successfully', {
        propertyId,
        roomId,
        date: date.toISOString()
      });

      return availability[availabilityIndex];
    } catch (error) {
      logger.error('Failed to update availability', error);
      throw new Error('Failed to update availability');
    }
  }

  /**
   * Bulk update availability
   */
  async bulkUpdateAvailability(data: BulkAvailabilityUpdate): Promise<MockAvailability[]> {
    try {
      const updatedRecords: MockAvailability[] = [];

      for (const date of data.dates) {
        const existingIndex = availability.findIndex(a =>
          a.propertyId === data.propertyId &&
          a.roomId === data.roomId &&
          a.date.toDateString() === date.toDateString()
        );

        const availabilityData: MockAvailability = {
          id: existingIndex !== -1 ? availability[existingIndex].id : `avail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          propertyId: data.propertyId,
          roomId: data.roomId,
          date: date,
          available: data.updates.available ?? true,
          bookedCount: existingIndex !== -1 ? availability[existingIndex].bookedCount : 0,
          maxBookings: data.updates.maxBookings || 1,
          priceOverride: data.updates.priceOverride,
          status: data.updates.status || AvailabilityStatus.AVAILABLE,
          createdAt: existingIndex !== -1 ? availability[existingIndex].createdAt : new Date(),
          updatedAt: new Date()
        };

        if (existingIndex !== -1) {
          availability[existingIndex] = availabilityData;
        } else {
          availability.push(availabilityData);
        }

        updatedRecords.push(availabilityData);
      }

      logger.info('Bulk availability update completed', {
        propertyId: data.propertyId,
        roomId: data.roomId,
        updatedCount: updatedRecords.length
      });

      return updatedRecords;
    } catch (error) {
      logger.error('Failed to bulk update availability', error);
      throw new Error('Failed to bulk update availability');
    }
  }

  /**
   * Book availability (decrease available count)
   */
  async bookAvailability(
    propertyId: string,
    date: Date,
    quantity: number = 1,
    roomId?: string
  ): Promise<boolean> {
    try {
      const availabilityIndex = availability.findIndex(a =>
        a.propertyId === propertyId &&
        a.roomId === roomId &&
        a.date.toDateString() === date.toDateString()
      );

      if (availabilityIndex === -1) {
        // Create default availability if not exists
        const newAvailability: MockAvailability = {
          id: `avail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          propertyId,
          roomId,
          date,
          available: true,
          bookedCount: quantity,
          maxBookings: 1,
          status: AvailabilityStatus.AVAILABLE,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        availability.push(newAvailability);
        return true;
      }

      const availabilityRecord = availability[availabilityIndex];

      // Check if booking is possible
      if (!availabilityRecord.available ||
          availabilityRecord.bookedCount + quantity > availabilityRecord.maxBookings) {
        return false;
      }

      availabilityRecord.bookedCount += quantity;
      availabilityRecord.updatedAt = new Date();

      // Update status if fully booked
      if (availabilityRecord.bookedCount >= availabilityRecord.maxBookings) {
        availabilityRecord.status = AvailabilityStatus.UNAVAILABLE;
        availabilityRecord.available = false;
      }

      logger.info('Availability booked successfully', {
        propertyId,
        roomId,
        date: date.toISOString(),
        quantity,
        remainingBookings: availabilityRecord.maxBookings - availabilityRecord.bookedCount
      });

      return true;
    } catch (error) {
      logger.error('Failed to book availability', error);
      throw new Error('Failed to book availability');
    }
  }

  /**
   * Release availability (increase available count)
   */
  async releaseAvailability(
    propertyId: string,
    date: Date,
    quantity: number = 1,
    roomId?: string
  ): Promise<boolean> {
    try {
      const availabilityIndex = availability.findIndex(a =>
        a.propertyId === propertyId &&
        a.roomId === roomId &&
        a.date.toDateString() === date.toDateString()
      );

      if (availabilityIndex === -1) {
        return false;
      }

      const availabilityRecord = availability[availabilityIndex];

      // Ensure we don't go below 0
      const newBookedCount = Math.max(0, availabilityRecord.bookedCount - quantity);
      availabilityRecord.bookedCount = newBookedCount;
      availabilityRecord.updatedAt = new Date();

      // Update status if now available
      if (newBookedCount < availabilityRecord.maxBookings) {
        availabilityRecord.status = AvailabilityStatus.AVAILABLE;
        availabilityRecord.available = true;
      }

      logger.info('Availability released successfully', {
        propertyId,
        roomId,
        date: date.toISOString(),
        quantity,
        currentBookings: availabilityRecord.bookedCount
      });

      return true;
    } catch (error) {
      logger.error('Failed to release availability', error);
      throw new Error('Failed to release availability');
    }
  }

  /**
   * Check if dates are available for booking
   */
  async checkAvailability(
    propertyId: string,
    startDate: Date,
    endDate: Date,
    quantity: number = 1,
    roomId?: string
  ): Promise<boolean> {
    try {
      const currentDate = new Date(startDate);

      while (currentDate < endDate) {
        const availabilityRecord = availability.find(a =>
          a.propertyId === propertyId &&
          a.roomId === roomId &&
          a.date.toDateString() === currentDate.toDateString()
        );

        // If no availability record exists, assume available
        if (!availabilityRecord) {
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }

        // Check if available for this date
        if (!availabilityRecord.available ||
            availabilityRecord.bookedCount + quantity > availabilityRecord.maxBookings) {
          return false;
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return true;
    } catch (error) {
      logger.error('Failed to check availability', error);
      throw new Error('Failed to check availability');
    }
  }

  /**
   * Get availability statistics
   */
  async getAvailabilityStatistics(
    propertyId: string,
    startDate: Date,
    endDate: Date,
    roomId?: string
  ): Promise<{
    totalDays: number;
    availableDays: number;
    bookedDays: number;
    occupancyRate: number;
    averageBookings: number;
    totalBookings: number;
  }> {
    try {
      const filteredAvailability = availability.filter(a => {
        if (a.propertyId !== propertyId) return false;
        if (roomId && a.roomId !== roomId) return false;
        if (a.date < startDate || a.date > endDate) return false;
        return true;
      });

      const totalDays = filteredAvailability.length;
      const availableDays = filteredAvailability.filter(a => a.available).length;
      const bookedDays = filteredAvailability.filter(a => a.bookedCount > 0).length;
      const totalBookings = filteredAvailability.reduce((sum, a) => sum + a.bookedCount, 0);
      const occupancyRate = totalDays > 0 ? (bookedDays / totalDays) * 100 : 0;
      const averageBookings = totalDays > 0 ? totalBookings / totalDays : 0;

      return {
        totalDays,
        availableDays,
        bookedDays,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        averageBookings: Math.round(averageBookings * 100) / 100,
        totalBookings
      };
    } catch (error) {
      logger.error('Failed to get availability statistics', error);
      throw new Error('Failed to get availability statistics');
    }
  }

  /**
   * Delete availability records
   */
  async deleteAvailability(
    propertyId: string,
    startDate: Date,
    endDate: Date,
    roomId?: string
  ): Promise<number> {
    try {
      const initialCount = availability.length;
      availability = availability.filter(a => {
        if (a.propertyId !== propertyId) return true;
        if (roomId && a.roomId !== roomId) return true;
        if (a.date < startDate || a.date > endDate) return true;
        return false;
      });

      const deletedCount = initialCount - availability.length;

      logger.info('Availability records deleted', {
        propertyId,
        roomId,
        deletedCount
      });

      return deletedCount;
    } catch (error) {
      logger.error('Failed to delete availability records', error);
      throw new Error('Failed to delete availability records');
    }
  }
}

// Export singleton instance
export const availabilityService = new AvailabilityService();