import { propertyService, cityService, stayTypeService } from '../lib/firestore';
import type { Property, City, StayType, RouteResolver } from '../types';

// URL slug validation patterns
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 100;

// Utility functions for slug validation
export const slugUtils = {
  /**
   * Validates if a slug follows the correct format
   */
  isValidSlug(slug: string): boolean {
    return (
      typeof slug === 'string' &&
      slug.length > 0 &&
      slug.length <= MAX_SLUG_LENGTH &&
      SLUG_PATTERN.test(slug)
    );
  },

  /**
   * Generates a URL-friendly slug from a string
   */
  generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  },

  /**
   * Extracts slug from URL path
   */
  extractSlugFromPath(path: string): string | null {
    const segments = path.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    return lastSegment && this.isValidSlug(lastSegment) ? lastSegment : null;
  }
};

// Property resolution utilities
export const propertyResolver = {
  /**
   * Resolves property by slug with validation
   */
  async resolveBySlug(slug: string): Promise<Property | null> {
    if (!slugUtils.isValidSlug(slug)) {
      console.warn(`Invalid property slug format: ${slug}`);
      return null;
    }

    try {
      const property = await propertyService.getBySlug(slug);
      
      if (property && !property.active) {
        console.warn(`Property ${slug} is inactive`);
        return null;
      }

      return property;
    } catch (error) {
      console.error(`Error resolving property ${slug}:`, error);
      return null;
    }
  },

  /**
   * Resolves property with related data (city, stay types)
   */
  async resolveWithRelatedData(slug: string): Promise<{
    property: Property | null;
    city: City | null;
    stayTypes: StayType[];
  }> {
    const property = await this.resolveBySlug(slug);
    
    if (!property) {
      return { property: null, city: null, stayTypes: [] };
    }

    try {
      const [city, stayTypes] = await Promise.all([
        cityService.getBySlug(property.city_slug),
        stayTypeService.getByProperty(property.id)
      ]);

      return {
        property,
        city,
        stayTypes: stayTypes.filter(st => st.active)
      };
    } catch (error) {
      console.error(`Error loading related data for property ${slug}:`, error);
      return { property, city: null, stayTypes: [] };
    }
  },

  /**
   * Validates property accessibility
   */
  async validateAccess(slug: string): Promise<{
    isValid: boolean;
    reason?: string;
    property?: Property;
  }> {
    if (!slugUtils.isValidSlug(slug)) {
      return { isValid: false, reason: 'Invalid slug format' };
    }

    const property = await propertyService.getBySlug(slug);
    
    if (!property) {
      return { isValid: false, reason: 'Property not found' };
    }

    if (!property.active) {
      return { isValid: false, reason: 'Property is inactive', property };
    }

    return { isValid: true, property };
  }
};

// City resolution utilities
export const cityResolver = {
  /**
   * Resolves city by slug with validation
   */
  async resolveBySlug(slug: string): Promise<City | null> {
    if (!slugUtils.isValidSlug(slug)) {
      console.warn(`Invalid city slug format: ${slug}`);
      return null;
    }

    try {
      return await cityService.getBySlug(slug);
    } catch (error) {
      console.error(`Error resolving city ${slug}:`, error);
      return null;
    }
  },

  /**
   * Resolves city with properties
   */
  async resolveWithProperties(slug: string): Promise<{
    city: City | null;
    properties: Property[];
  }> {
    const city = await this.resolveBySlug(slug);
    
    if (!city) {
      return { city: null, properties: [] };
    }

    try {
      const properties = await propertyService.getByCity(slug);
      return {
        city,
        properties: properties.filter(p => p.active)
      };
    } catch (error) {
      console.error(`Error loading properties for city ${slug}:`, error);
      return { city, properties: [] };
    }
  },

  /**
   * Validates city accessibility
   */
  async validateAccess(slug: string): Promise<{
    isValid: boolean;
    reason?: string;
    city?: City;
  }> {
    if (!slugUtils.isValidSlug(slug)) {
      return { isValid: false, reason: 'Invalid slug format' };
    }

    const city = await cityService.getBySlug(slug);
    
    if (!city) {
      return { isValid: false, reason: 'City not found' };
    }

    return { isValid: true, city };
  }
};

// Stay type resolution utilities
export const stayTypeResolver = {
  /**
   * Resolves stay type by property and type slug
   */
  async resolveByPropertyAndType(
    propertySlug: string, 
    stayTypeSlug: string
  ): Promise<StayType | null> {
    if (!slugUtils.isValidSlug(propertySlug) || !slugUtils.isValidSlug(stayTypeSlug)) {
      console.warn(`Invalid slug format: ${propertySlug}/${stayTypeSlug}`);
      return null;
    }

    try {
      // First resolve the property
      const property = await propertyService.getBySlug(propertySlug);
      
      if (!property || !property.active) {
        return null;
      }

      // Then resolve the stay type
      const stayType = await stayTypeService.getByPropertyAndType(property.id, stayTypeSlug);
      
      if (stayType && !stayType.active) {
        console.warn(`Stay type ${stayTypeSlug} is inactive`);
        return null;
      }

      return stayType;
    } catch (error) {
      console.error(`Error resolving stay type ${propertySlug}/${stayTypeSlug}:`, error);
      return null;
    }
  },

  /**
   * Validates stay type accessibility
   */
  async validateAccess(
    propertySlug: string, 
    stayTypeSlug: string
  ): Promise<{
    isValid: boolean;
    reason?: string;
    stayType?: StayType;
    property?: Property;
  }> {
    if (!slugUtils.isValidSlug(propertySlug) || !slugUtils.isValidSlug(stayTypeSlug)) {
      return { isValid: false, reason: 'Invalid slug format' };
    }

    const property = await propertyService.getBySlug(propertySlug);
    
    if (!property) {
      return { isValid: false, reason: 'Property not found' };
    }

    if (!property.active) {
      return { isValid: false, reason: 'Property is inactive', property };
    }

    const stayType = await stayTypeService.getByPropertyAndType(property.id, stayTypeSlug);
    
    if (!stayType) {
      return { isValid: false, reason: 'Stay type not found', property };
    }

    if (!stayType.active) {
      return { isValid: false, reason: 'Stay type is inactive', stayType, property };
    }

    return { isValid: true, stayType, property };
  }
};

// Main route resolver implementation
export const routeResolver: RouteResolver = {
  resolveProperty: propertyResolver.resolveBySlug,
  resolveCity: cityResolver.resolveBySlug,
  resolveStayType: stayTypeResolver.resolveByPropertyAndType,
  
  async generateSitemap() {
    try {
      const [properties, cities] = await Promise.all([
        propertyService.getAll(),
        cityService.getAll()
      ]);
      
      const entries = [
        {
          url: '/',
          lastmod: new Date().toISOString(),
          changefreq: 'daily' as const,
          priority: 1.0
        }
      ];
      
      // Add property pages
      properties.forEach(property => {
        entries.push({
          url: `/properties/${property.slug}`,
          lastmod: property.updated_at.toISOString(),
          changefreq: 'weekly' as const,
          priority: 0.8
        });
      });
      
      // Add city pages
      cities.forEach(city => {
        entries.push({
          url: `/locations/${city.slug}`,
          lastmod: city.updated_at.toISOString(),
          changefreq: 'weekly' as const,
          priority: 0.7
        });
      });
      
      return entries;
    } catch (error) {
      console.error('Error generating sitemap:', error);
      return [];
    }
  }
};

// Export all resolvers
export default {
  slugUtils,
  propertyResolver,
  cityResolver,
  stayTypeResolver,
  routeResolver
};