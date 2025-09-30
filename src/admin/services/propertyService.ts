import { databaseService } from './databaseService';
import { type Property, type PropertyType, type Amenity } from '../types/entities';
import { getAmenitiesByCategory } from '../reference/amenities';

export interface PropertyFilters {
  type?: PropertyType;
  featured?: boolean;
  search?: string;
}

export interface PropertyStats {
  total: number;
  byType: Record<PropertyType, number>;
  featured: number;
}

export class PropertyService {
  async loadProperties(filters?: PropertyFilters): Promise<Property[]> {
    try {
      let properties = await databaseService.getAll<Property>('properties');

      // Apply filters
      if (filters) {
        if (filters.type) {
          properties = properties.filter(p => p.type === filters.type);
        }
        if (filters.featured !== undefined) {
          properties = properties.filter(p => p.featured === filters.featured);
        }
        if (filters.search) {
          const search = filters.search.toLowerCase();
          properties = properties.filter(p =>
            p.name.toLowerCase().includes(search) ||
            p.description.toLowerCase().includes(search) ||
            p.location.city.toLowerCase().includes(search)
          );
        }
      }

      // Sort by creation date (newest first)
      return properties.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Failed to load properties:', error);
      throw new Error('Failed to load properties');
    }
  }

  async getProperty(id: string): Promise<Property | null> {
    try {
      return await databaseService.read<Property>('properties', id) || null;
    } catch (error) {
      console.error('Failed to get property:', error);
      throw new Error('Failed to get property');
    }
  }

  async getPropertyBySlug(slug: string): Promise<Property | null> {
    try {
      const all = await this.loadProperties();
      return all.find(p => p.slug === slug) || null;
    } catch (error) {
      console.error('Failed to get property by slug:', error);
      throw new Error('Failed to get property by slug');
    }
  }

  async createProperty(property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Generate slug if not provided
      const slug = property.slug || this.generateSlug(property.name);

      const newProperty: Property = {
        ...property,
        slug,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return await databaseService.create('properties', newProperty);
    } catch (error) {
      console.error('Failed to create property:', error);
      throw new Error('Failed to create property');
    }
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Update slug if name changed
      if (updates.name && !updates.slug) {
        const existing = await this.getProperty(id);
        if (existing && existing.name !== updates.name) {
          updateData.slug = this.generateSlug(updates.name);
        }
      }

      await databaseService.update('properties', id, updateData);
    } catch (error) {
      console.error('Failed to update property:', error);
      throw new Error('Failed to update property');
    }
  }

  async deleteProperty(id: string): Promise<void> {
    try {
      // Delete associated rooms and places
      const rooms = await databaseService.getAll('rooms', undefined, 'propertyId');
      const places = await databaseService.getAll('places', undefined, 'propertyId');

      for (const room of rooms) {
        if (room.propertyId === id) {
          await databaseService.delete('rooms', room.id);
        }
      }

      for (const place of places) {
        if (place.propertyId === id) {
          await databaseService.delete('places', place.id);
        }
      }

      await databaseService.delete('properties', id);
    } catch (error) {
      console.error('Failed to delete property:', error);
      throw new Error('Failed to delete property');
    }
  }

  async duplicateProperty(id: string): Promise<string> {
    try {
      const original = await this.getProperty(id);
      if (!original) {
        throw new Error('Property not found');
      }

      const duplicate: Omit<Property, 'id' | 'createdAt' | 'updatedAt'> = {
        ...original,
        name: `${original.name} (Copy)`,
        slug: `${original.slug}-copy`,
        featured: false
      };

      return await this.createProperty(duplicate);
    } catch (error) {
      console.error('Failed to duplicate property:', error);
      throw new Error('Failed to duplicate property');
    }
  }

  async getPropertyStats(): Promise<PropertyStats> {
    try {
      const properties = await this.loadProperties();
      const stats: PropertyStats = {
        total: properties.length,
        byType: {
          TREEHOUSE: 0,
          VILLA: 0,
          SUITE: 0,
          DELUXE_ROOM: 0,
          STANDARD_ROOM: 0
        },
        featured: 0
      };

      properties.forEach(property => {
        stats.byType[property.type]++;
        if (property.featured) {
          stats.featured++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Failed to get property stats:', error);
      throw new Error('Failed to get property stats');
    }
  }

  async validateSlug(slug: string, excludeId?: string): Promise<boolean> {
    try {
      const properties = await this.loadProperties();
      return !properties.some(p => p.slug === slug && p.id !== excludeId);
    } catch (error) {
      console.error('Failed to validate slug:', error);
      return false;
    }
  }

  // Amenity management
  async getAmenities(): Promise<Amenity[]> {
    try {
      const amenitiesByCategory = getAmenitiesByCategory();
      const amenities: Amenity[] = [];

      // Flatten the amenities object into an array
      Object.values(amenitiesByCategory).forEach(categoryAmenities => {
        amenities.push(...categoryAmenities);
      });

      return amenities.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Failed to get amenities:', error);
      return [];
    }
  }

  // Export methods
  async exportProperties(format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const properties = await this.loadProperties();

      if (format === 'json') {
        return JSON.stringify(properties, null, 2);
      } else {
        // CSV format
        const headers = [
          'ID', 'Name', 'Type', 'Slug', 'Featured', 'City',
          'Created At', 'Updated At'
        ];

        const rows = properties.map(property => [
          property.id,
          `"${property.name}"`,
          property.type,
          property.slug,
          property.featured,
          property.location.city,
          property.createdAt,
          property.updatedAt
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
      }
    } catch (error) {
      console.error('Failed to export properties:', error);
      throw new Error('Failed to export properties');
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

export const propertyService = new PropertyService();