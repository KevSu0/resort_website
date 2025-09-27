import { databaseService } from './databaseService';
import { type RoomType, type RoomCategory } from '../types/entities';

export interface RoomFilters {
  propertyId?: string;
  type?: RoomCategory;
  search?: string;
}

export interface RoomStats {
  total: number;
  byProperty: Record<string, number>;
  byType: Record<RoomCategory, number>;
}

export class RoomService {
  async loadRooms(filters?: RoomFilters): Promise<RoomType[]> {
    try {
      let rooms = await databaseService.getAll<RoomType>('rooms');

      // Apply filters
      if (filters) {
        if (filters.propertyId) {
          rooms = rooms.filter(r => r.propertyId === filters.propertyId);
        }
        if (filters.type) {
          rooms = rooms.filter(r => r.type === filters.type);
        }
        if (filters.search) {
          const search = filters.search.toLowerCase();
          rooms = rooms.filter(r =>
            r.name.toLowerCase().includes(search) ||
            r.description.toLowerCase().includes(search)
          );
        }
      }

      // Sort by creation date (newest first)
      return rooms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Failed to load rooms:', error);
      throw new Error('Failed to load rooms');
    }
  }

  async getRoom(id: string): Promise<RoomType | null> {
    try {
      return await databaseService.read<RoomType>('rooms', id) || null;
    } catch (error) {
      console.error('Failed to get room:', error);
      throw new Error('Failed to get room');
    }
  }

  async getRoomBySlug(propertyId: string, slug: string): Promise<RoomType | null> {
    try {
      const all = await this.loadRooms({ propertyId });
      return all.find(r => r.slug === slug) || null;
    } catch (error) {
      console.error('Failed to get room by slug:', error);
      throw new Error('Failed to get room by slug');
    }
  }

  async createRoom(room: Omit<RoomType, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Generate slug if not provided
      const slug = room.slug || this.generateSlug(room.name);

      const newRoom: RoomType = {
        ...room,
        slug,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return await databaseService.create('rooms', newRoom);
    } catch (error) {
      console.error('Failed to create room:', error);
      throw new Error('Failed to create room');
    }
  }

  async updateRoom(id: string, updates: Partial<RoomType>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Update slug if name changed
      if (updates.name && !updates.slug) {
        const existing = await this.getRoom(id);
        if (existing && existing.name !== updates.name) {
          updateData.slug = this.generateSlug(updates.name);
        }
      }

      await databaseService.update('rooms', id, updateData);
    } catch (error) {
      console.error('Failed to update room:', error);
      throw new Error('Failed to update room');
    }
  }

  async deleteRoom(id: string): Promise<void> {
    try {
      await databaseService.delete('rooms', id);
    } catch (error) {
      console.error('Failed to delete room:', error);
      throw new Error('Failed to delete room');
    }
  }

  async duplicateRoom(id: string): Promise<string> {
    try {
      const original = await this.getRoom(id);
      if (!original) {
        throw new Error('Room not found');
      }

      const duplicate: Omit<RoomType, 'id' | 'createdAt' | 'updatedAt'> = {
        ...original,
        name: `${original.name} (Copy)`,
        slug: `${original.slug}-copy`
      };

      return await this.createRoom(duplicate);
    } catch (error) {
      console.error('Failed to duplicate room:', error);
      throw new Error('Failed to duplicate room');
    }
  }

  async getRoomsByProperty(propertyId: string): Promise<RoomType[]> {
    try {
      return await this.loadRooms({ propertyId });
    } catch (error) {
      console.error('Failed to get rooms by property:', error);
      throw new Error('Failed to get rooms by property');
    }
  }

  async getRoomStats(): Promise<RoomStats> {
    try {
      const rooms = await this.loadRooms();
      const stats: RoomStats = {
        total: rooms.length,
        byProperty: {},
        byType: {
          STANDARD: 0,
          DELUXE: 0,
          SUITE: 0,
          VILLA: 0,
          TREEHOUSE: 0,
          COTTAGE: 0
        }
      };

      rooms.forEach(room => {
        stats.byType[room.type]++;
        stats.byProperty[room.propertyId] = (stats.byProperty[room.propertyId] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Failed to get room stats:', error);
      throw new Error('Failed to get room stats');
    }
  }

  async validateSlug(slug: string, propertyId: string, excludeId?: string): Promise<boolean> {
    try {
      const rooms = await this.loadRooms({ propertyId });
      return !rooms.some(r => r.slug === slug && r.id !== excludeId);
    } catch (error) {
      console.error('Failed to validate room slug:', error);
      return false;
    }
  }

  // Room amenities
  async getRoomAmenities(): Promise<Array<{ id: string; name: string; category: string }>> {
    try {
      return [
        { id: 'king-bed', name: 'King Size Bed', category: 'comfort' },
        { id: 'queen-bed', name: 'Queen Size Bed', category: 'comfort' },
        { id: 'twin-beds', name: 'Twin Beds', category: 'comfort' },
        { id: 'sofa-bed', name: 'Sofa Bed', category: 'comfort' },
        { id: 'ac', name: 'Air Conditioning', category: 'comfort' },
        { id: 'heater', name: 'Room Heater', category: 'comfort' },
        { id: 'wifi', name: 'Free WiFi', category: 'technology' },
        { id: 'tv', name: 'Smart TV', category: 'entertainment' },
        { id: 'minibar', name: 'Mini Bar', category: 'facility' },
        { id: 'coffee', name: 'Coffee/Tea Maker', category: 'facility' },
        { id: 'balcony', name: 'Private Balcony', category: 'feature' },
        { id: 'terrace', name: 'Private Terrace', category: 'feature' },
        { id: 'view', name: 'Mountain View', category: 'feature' },
        { id: 'garden', name: 'Garden View', category: 'feature' },
        { id: 'bathtub', name: 'Bathtub', category: 'bathroom' },
        { id: 'shower', name: 'Rain Shower', category: 'bathroom' },
        { id: 'hairdryer', name: 'Hair Dryer', category: 'bathroom' },
        { id: 'safe', name: 'Safe Deposit Box', category: 'security' },
        { id: 'desk', name: 'Work Desk', category: 'facility' },
        { id: 'wardrobe', name: 'Wardrobe', category: 'storage' }
      ];
    } catch (error) {
      console.error('Failed to get room amenities:', error);
      return [];
    }
  }

  // Export methods
  async exportRooms(propertyId?: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const rooms = await this.loadRooms(propertyId ? { propertyId } : undefined);

      if (format === 'json') {
        return JSON.stringify(rooms, null, 2);
      } else {
        // CSV format
        const headers = [
          'ID', 'Name', 'Property ID', 'Type', 'Slug',
          'Base Price', 'Max Guests', 'Created At'
        ];

        const rows = rooms.map(room => [
          room.id,
          `"${room.name}"`,
          room.propertyId,
          room.type,
          room.slug,
          room.pricing.baseRate,
          room.occupancy.maxGuests,
          room.createdAt
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
      }
    } catch (error) {
      console.error('Failed to export rooms:', error);
      throw new Error('Failed to export rooms');
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}

export const roomService = new RoomService();