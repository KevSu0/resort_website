import { databaseService } from './databaseService';
import { type Place, type PlaceCategory } from '../types/entities';

export interface PlaceFilters {
  propertyId?: string;
  category?: PlaceCategory;
  search?: string;
}

export interface PlaceStats {
  total: number;
  byProperty: Record<string, number>;
  byCategory: Record<PlaceCategory, number>;
}

export class PlaceService {
  async loadPlaces(filters?: PlaceFilters): Promise<Place[]> {
    try {
      let places = await databaseService.getAll<Place>('places');

      // Apply filters
      if (filters) {
        if (filters.propertyId) {
          places = places.filter(p => p.propertyId === filters.propertyId);
        }
        if (filters.category) {
          places = places.filter(p => p.category === filters.category);
        }
        if (filters.search) {
          const search = filters.search.toLowerCase();
          places = places.filter(p =>
            p.name.toLowerCase().includes(search) ||
            p.description.toLowerCase().includes(search) ||
            p.location.address.toLowerCase().includes(search)
          );
        }
      }

      // Sort by creation date (newest first)
      return places.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Failed to load places:', error);
      throw new Error('Failed to load places');
    }
  }

  async getPlace(id: string): Promise<Place | null> {
    try {
      return await databaseService.read<Place>('places', id) || null;
    } catch (error) {
      console.error('Failed to get place:', error);
      throw new Error('Failed to get place');
    }
  }

  async createPlace(place: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Generate slug if not provided
      const slug = place.slug || this.generateSlug(place.name);

      const newPlace: Place = {
        ...place,
        slug,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return await databaseService.create('places', newPlace);
    } catch (error) {
      console.error('Failed to create place:', error);
      throw new Error('Failed to create place');
    }
  }

  async updatePlace(id: string, updates: Partial<Place>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Update slug if name changed
      if (updates.name && !updates.slug) {
        const existing = await this.getPlace(id);
        if (existing && existing.name !== updates.name) {
          updateData.slug = this.generateSlug(updates.name);
        }
      }

      await databaseService.update('places', id, updateData);
    } catch (error) {
      console.error('Failed to update place:', error);
      throw new Error('Failed to update place');
    }
  }

  async deletePlace(id: string): Promise<void> {
    try {
      await databaseService.delete('places', id);
    } catch (error) {
      console.error('Failed to delete place:', error);
      throw new Error('Failed to delete place');
    }
  }

  async duplicatePlace(id: string): Promise<string> {
    try {
      const original = await this.getPlace(id);
      if (!original) {
        throw new Error('Place not found');
      }

      const duplicate: Omit<Place, 'id' | 'createdAt' | 'updatedAt'> = {
        ...original,
        name: `${original.name} (Copy)`,
        slug: `${original.slug}-copy`
      };

      return await this.createPlace(duplicate);
    } catch (error) {
      console.error('Failed to duplicate place:', error);
      throw new Error('Failed to duplicate place');
    }
  }

  async getPlacesByProperty(propertyId: string): Promise<Place[]> {
    try {
      return await this.loadPlaces({ propertyId });
    } catch (error) {
      console.error('Failed to get places by property:', error);
      throw new Error('Failed to get places by property');
    }
  }

  async getPlaceStats(): Promise<PlaceStats> {
    try {
      const places = await this.loadPlaces();
      const stats: PlaceStats = {
        total: places.length,
        byProperty: {},
        byCategory: {
          ATTRACTION: 0,
          RESTAURANT: 0,
          ACTIVITY: 0,
          SHOPPING: 0,
          TRANSPORT: 0,
          HEALTHCARE: 0,
          OTHER: 0
        }
      };

      places.forEach(place => {
        stats.byCategory[place.category]++;
        stats.byProperty[place.propertyId] = (stats.byProperty[place.propertyId] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Failed to get place stats:', error);
      throw new Error('Failed to get place stats');
    }
  }

  async validateSlug(slug: string, propertyId: string, excludeId?: string): Promise<boolean> {
    try {
      const places = await this.loadPlaces({ propertyId });
      return !places.some(p => p.slug === slug && p.id !== excludeId);
    } catch (error) {
      console.error('Failed to validate place slug:', error);
      return false;
    }
  }

  // Nearby attractions suggestions
  async getNearbySuggestions(): Promise<Array<{ name: string; category: PlaceCategory; description: string }>> {
    try {
      return [
        {
          name: 'Edakkal Caves',
          category: 'ATTRACTION',
          description: 'Ancient cave dwelling with prehistoric petroglyphs'
        },
        {
          name: 'Chembra Peak',
          category: 'ATTRACTION',
          description: 'Highest peak in Wayanad with trekking trails'
        },
        {
          name: 'Banasura Sagar Dam',
          category: 'ATTRACTION',
          description: 'Second largest earth dam in Asia'
        },
        {
          name: 'Soochipara Falls',
          category: 'ATTRACTION',
          description: 'Three-tiered waterfall with swimming pool'
        },
        {
          name: 'Wayanad Wildlife Sanctuary',
          category: 'ATTRACTION',
          description: 'Protected area with diverse flora and fauna'
        },
        {
          name: 'Tholpetty Wildlife Sanctuary',
          category: 'ATTRACTION',
          description: 'Wildlife sanctuary with jeep safari tours'
        },
        {
          name: 'Pookode Lake',
          category: 'ATTRACTION',
          description: 'Natural freshwater lake with boating facilities'
        },
        {
          name: 'Lakkidi Viewpoint',
          category: 'ATTRACTION',
          description: 'Scenic viewpoint with panoramic valley views'
        },
        {
          name: 'Chain Tree',
          category: 'ATTRACTION',
          description: 'Historical chained ficus tree with local legend'
        },
        {
          name: 'Jain Temple',
          category: 'ATTRACTION',
          description: 'Ancient Jain temple with intricate architecture'
        }
      ];
    } catch (error) {
      console.error('Failed to get nearby suggestions:', error);
      return [];
    }
  }

  // Export methods
  async exportPlaces(propertyId?: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const places = await this.loadPlaces(propertyId ? { propertyId } : undefined);

      if (format === 'json') {
        return JSON.stringify(places, null, 2);
      } else {
        // CSV format
        const headers = [
          'ID', 'Name', 'Property ID', 'Category', 'Slug',
          'Distance (km)', 'Contact', 'Website', 'Created At'
        ];

        const rows = places.map(place => [
          place.id,
          `"${place.name}"`,
          place.propertyId,
          place.category,
          place.slug,
          place.distance,
          place.contact.phone || '',
          place.contact.website || '',
          place.createdAt
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
      }
    } catch (error) {
      console.error('Failed to export places:', error);
      throw new Error('Failed to export places');
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

export const placeService = new PlaceService();