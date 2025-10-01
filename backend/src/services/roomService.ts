import { logger } from '@/utils/logger.js';
import { propertyService } from './propertyService.js';
import { Room, Property } from '@prisma/client';

// Mock data storage (in production, this would use Prisma)
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

// Mock storage - will be synchronized with propertyService
let rooms: MockRoom[] = [];

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

// Room creation/update interface
interface CreateRoomData {
  propertyId: string;
  name: string;
  type: string;
  capacity: number;
  basePrice: number;
  size?: number;
  bedType?: string;
  amenities?: string[];
  images?: string[];
  sortOrder?: number;
}

interface UpdateRoomData extends Partial<CreateRoomData> {
  isActive?: boolean;
}

interface RoomSearchOptions {
  propertyId: string;
  type?: string;
  capacity?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  isActive?: boolean;
}

/**
 * Room Management Service
 * Provides comprehensive business logic for room operations
 */
export class RoomService {
  /**
   * Create a new room
   */
  async createRoom(data: CreateRoomData): Promise<MockRoom> {
    try {
      // Verify property exists
      const property = await propertyService.getPropertyById(data.propertyId, '');
      if (!property) {
        throw new Error('Property not found');
      }

      const room: MockRoom = {
        id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        amenities: data.amenities || [],
        images: data.images || [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      rooms.push(room);
      logger.info('Room created successfully', { roomId: room.id, name: room.name });

      return room;
    } catch (error) {
      logger.error('Failed to create room', error);
      throw new Error('Failed to create room');
    }
  }

  /**
   * Get room by ID
   */
  async getRoomById(id: string, propertyId: string): Promise<MockRoom | null> {
    try {
      const room = rooms.find(r => r.id === id && r.propertyId === propertyId);
      return room || null;
    } catch (error) {
      logger.error('Failed to get room', error);
      throw new Error('Failed to get room');
    }
  }

  /**
   * Get rooms for a property with pagination and filtering
   */
  async getRooms(
    propertyId: string,
    options: PaginationOptions & {
      type?: string;
      isActive?: boolean;
      capacity?: number;
    }
  ): Promise<PaginatedResult<MockRoom>> {
    try {
      let filteredRooms = rooms.filter(r => r.propertyId === propertyId);

      // Apply filters
      if (options.type) {
        filteredRooms = filteredRooms.filter(r => r.type === options.type);
      }
      if (options.isActive !== undefined) {
        filteredRooms = filteredRooms.filter(r => r.isActive === options.isActive);
      }
      if (options.capacity) {
        filteredRooms = filteredRooms.filter(r => r.capacity >= options.capacity!);
      }

      // Apply sorting
      const sortBy = options.sortBy || 'sortOrder';
      const sortOrder = options.sortOrder || 'asc';
      filteredRooms.sort((a, b) => {
        const aValue = a[sortBy as keyof MockRoom];
        const bValue = b[sortBy as keyof MockRoom];

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Apply pagination
      const total = filteredRooms.length;
      const totalPages = Math.ceil(total / options.limit);
      const startIndex = (options.page - 1) * options.limit;
      const endIndex = startIndex + options.limit;
      const data = filteredRooms.slice(startIndex, endIndex);

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
      logger.error('Failed to get rooms', error);
      throw new Error('Failed to get rooms');
    }
  }

  /**
   * Update room
   */
  async updateRoom(id: string, propertyId: string, data: UpdateRoomData): Promise<MockRoom | null> {
    try {
      const roomIndex = rooms.findIndex(r => r.id === id && r.propertyId === propertyId);
      if (roomIndex === -1) {
        return null;
      }

      rooms[roomIndex] = {
        ...rooms[roomIndex],
        ...data,
        updatedAt: new Date()
      };

      logger.info('Room updated successfully', { roomId: id });
      return rooms[roomIndex];
    } catch (error) {
      logger.error('Failed to update room', error);
      throw new Error('Failed to update room');
    }
  }

  /**
   * Delete room
   */
  async deleteRoom(id: string, propertyId: string): Promise<boolean> {
    try {
      const roomIndex = rooms.findIndex(r => r.id === id && r.propertyId === propertyId);
      if (roomIndex === -1) {
        return false;
      }

      rooms.splice(roomIndex, 1);

      logger.info('Room deleted successfully', { roomId: id });
      return true;
    } catch (error) {
      logger.error('Failed to delete room', error);
      throw new Error('Failed to delete room');
    }
  }

  /**
   * Search rooms with advanced filtering
   */
  async searchRooms(options: RoomSearchOptions): Promise<MockRoom[]> {
    try {
      let filteredRooms = rooms.filter(r => r.propertyId === options.propertyId && r.isActive);

      // Type filter
      if (options.type) {
        filteredRooms = filteredRooms.filter(r => r.type === options.type);
      }

      // Capacity filter
      if (options.capacity) {
        filteredRooms = filteredRooms.filter(r => r.capacity >= options.capacity);
      }

      // Price filter
      if (options.minPrice) {
        filteredRooms = filteredRooms.filter(r => r.basePrice >= options.minPrice);
      }
      if (options.maxPrice) {
        filteredRooms = filteredRooms.filter(r => r.basePrice <= options.maxPrice);
      }

      // Amenities filter
      if (options.amenities && options.amenities.length > 0) {
        filteredRooms = filteredRooms.filter(r =>
          options.amenities!.every(amenity => r.amenities.includes(amenity))
        );
      }

      // Active status filter
      if (options.isActive !== undefined) {
        filteredRooms = filteredRooms.filter(r => r.isActive === options.isActive);
      }

      return filteredRooms.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    } catch (error) {
      logger.error('Failed to search rooms', error);
      throw new Error('Failed to search rooms');
    }
  }

  /**
   * Get room types for a property
   */
  async getRoomTypes(propertyId: string): Promise<string[]> {
    try {
      const types = new Set<string>();
      rooms
        .filter(r => r.propertyId === propertyId && r.isActive)
        .forEach(r => types.add(r.type));

      return Array.from(types);
    } catch (error) {
      logger.error('Failed to get room types', error);
      throw new Error('Failed to get room types');
    }
  }

  /**
   * Get room capacity range for a property
   */
  async getRoomCapacityRange(propertyId: string): Promise<{ min: number; max: number }> {
    try {
      const activeRooms = rooms.filter(r => r.propertyId === propertyId && r.isActive);

      if (activeRooms.length === 0) {
        return { min: 0, max: 0 };
      }

      const capacities = activeRooms.map(r => r.capacity);
      return {
        min: Math.min(...capacities),
        max: Math.max(...capacities)
      };
    } catch (error) {
      logger.error('Failed to get room capacity range', error);
      throw new Error('Failed to get room capacity range');
    }
  }

  /**
   * Get room price range for a property
   */
  async getRoomPriceRange(propertyId: string): Promise<{ min: number; max: number }> {
    try {
      const activeRooms = rooms.filter(r => r.propertyId === propertyId && r.isActive);

      if (activeRooms.length === 0) {
        return { min: 0, max: 0 };
      }

      const prices = activeRooms.map(r => r.basePrice);
      return {
        min: Math.min(...prices),
        max: Math.max(...prices)
      };
    } catch (error) {
      logger.error('Failed to get room price range', error);
      throw new Error('Failed to get room price range');
    }
  }

  /**
   * Get popular amenities for a property
   */
  async getPopularAmenities(propertyId: string): Promise<Array<{ amenity: string; count: number }>> {
    try {
      const amenityCount: Record<string, number> = {};
      rooms
        .filter(r => r.propertyId === propertyId && r.isActive)
        .forEach(room => {
          room.amenities.forEach(amenity => {
            amenityCount[amenity] = (amenityCount[amenity] || 0) + 1;
          });
        });

      return Object.entries(amenityCount)
        .map(([amenity, count]) => ({ amenity, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      logger.error('Failed to get popular amenities', error);
      throw new Error('Failed to get popular amenities');
    }
  }

  /**
   * Update room sort order
   */
  async updateRoomSortOrder(propertyId: string, roomOrders: Array<{ id: string; sortOrder: number }>): Promise<boolean> {
    try {
      for (const { id, sortOrder } of roomOrders) {
        const roomIndex = rooms.findIndex(r => r.id === id && r.propertyId === propertyId);
        if (roomIndex !== -1) {
          rooms[roomIndex].sortOrder = sortOrder;
          rooms[roomIndex].updatedAt = new Date();
        }
      }

      logger.info('Room sort orders updated successfully', { propertyId });
      return true;
    } catch (error) {
      logger.error('Failed to update room sort orders', error);
      throw new Error('Failed to update room sort orders');
    }
  }

  /**
   * Bulk update rooms
   */
  async bulkUpdateRooms(
    propertyId: string,
    updates: Array<{ id: string; data: UpdateRoomData }>
  ): Promise<MockRoom[]> {
    try {
      const updatedRooms: MockRoom[] = [];

      for (const { id, data } of updates) {
        const roomIndex = rooms.findIndex(r => r.id === id && r.propertyId === propertyId);
        if (roomIndex !== -1) {
          rooms[roomIndex] = {
            ...rooms[roomIndex],
            ...data,
            updatedAt: new Date()
          };
          updatedRooms.push(rooms[roomIndex]);
        }
      }

      logger.info('Bulk room update completed', {
        propertyId,
        updatedCount: updatedRooms.length
      });

      return updatedRooms;
    } catch (error) {
      logger.error('Failed to bulk update rooms', error);
      throw new Error('Failed to bulk update rooms');
    }
  }

  /**
   * Get room statistics for a property
   */
  async getRoomStatistics(propertyId: string): Promise<{
    totalRooms: number;
    activeRooms: number;
    averageCapacity: number;
    averagePrice: number;
    roomTypes: Record<string, number>;
    totalCapacity: number;
  }> {
    try {
      const propertyRooms = rooms.filter(r => r.propertyId === propertyId);
      const activeRooms = propertyRooms.filter(r => r.isActive);

      const roomTypes: Record<string, number> = {};
      let totalCapacity = 0;
      let totalPrice = 0;

      activeRooms.forEach(room => {
        roomTypes[room.type] = (roomTypes[room.type] || 0) + 1;
        totalCapacity += room.capacity;
        totalPrice += room.basePrice;
      });

      return {
        totalRooms: propertyRooms.length,
        activeRooms: activeRooms.length,
        averageCapacity: activeRooms.length > 0 ? Math.round(totalCapacity / activeRooms.length) : 0,
        averagePrice: activeRooms.length > 0 ? Math.round(totalPrice / activeRooms.length) : 0,
        roomTypes,
        totalCapacity
      };
    } catch (error) {
      logger.error('Failed to get room statistics', error);
      throw new Error('Failed to get room statistics');
    }
  }
}

// Export singleton instance
export const roomService = new RoomService();