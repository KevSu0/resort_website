import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';
import type { 
  Property, 
  City, 
  StayType, 
  SearchFilters, 
  SearchResult,
  RouteResolver,
  SitemapEntry
} from '../types';

// Collections
const COLLECTIONS = {
  PROPERTIES: 'properties',
  CITIES: 'cities',
  STAY_TYPES: 'stay_types',
  RESORT_GROUP: 'resort_group',
  ENQUIRIES: 'enquiries',
  OFFERS: 'offers',
  REFERRALS: 'referrals'
} as const;

// Property Operations
export const propertyService = {
  async getBySlug(slug: string): Promise<Property | null> {
    try {
      const q = query(
        collection(db, COLLECTIONS.PROPERTIES),
        where('slug', '==', slug),
        where('active', '==', true),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Property;
    } catch (error) {
      console.error('Error fetching property by slug:', error);
      return null;
    }
  },

  async getById(id: string): Promise<Property | null> {
    try {
      const docRef = doc(db, COLLECTIONS.PROPERTIES, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return { id: docSnap.id, ...docSnap.data() } as Property;
    } catch (error) {
      console.error('Error fetching property by ID:', error);
      return null;
    }
  },

  async getByCity(citySlug: string): Promise<Property[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.PROPERTIES),
        where('city_slug', '==', citySlug),
        where('active', '==', true),
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Property[];
    } catch (error) {
      console.error('Error fetching properties by city:', error);
      return [];
    }
  },

  async getAll(): Promise<Property[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.PROPERTIES),
        where('active', '==', true),
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Property[];
    } catch (error) {
      console.error('Error fetching all properties:', error);
      return [];
    }
  }
};

// City Operations
export const cityService = {
  async getBySlug(slug: string): Promise<City | null> {
    try {
      const docRef = doc(db, COLLECTIONS.CITIES, slug);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return { slug: docSnap.id, ...docSnap.data() } as City;
    } catch (error) {
      console.error('Error fetching city by slug:', error);
      return null;
    }
  },

  async getAll(): Promise<City[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.CITIES));
      
      return querySnapshot.docs.map(doc => ({
        slug: doc.id,
        ...doc.data()
      })) as City[];
    } catch (error) {
      console.error('Error fetching all cities:', error);
      return [];
    }
  }
};

// Stay Type Operations
export const stayTypeService = {
  async getByPropertyAndType(propertyId: string, stayType: string): Promise<StayType | null> {
    try {
      const q = query(
        collection(db, COLLECTIONS.STAY_TYPES),
        where('property_id', '==', propertyId),
        where('slug', '==', stayType),
        where('active', '==', true),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as StayType;
    } catch (error) {
      console.error('Error fetching stay type:', error);
      return null;
    }
  },

  async getByProperty(propertyId: string): Promise<StayType[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.STAY_TYPES),
        where('property_id', '==', propertyId),
        where('active', '==', true),
        orderBy('type_name')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StayType[];
    } catch (error) {
      console.error('Error fetching stay types by property:', error);
      return [];
    }
  }
};

// Search Operations
export const searchService = {
  async search(filters: SearchFilters): Promise<SearchResult> {
    try {
      const constraints: QueryConstraint[] = [where('active', '==', true)];
      
      if (filters.city) {
        constraints.push(where('city_slug', '==', filters.city));
      }
      
      if (filters.capacity) {
        // This would require a compound query with stay_types
        // For now, we'll handle capacity filtering client-side
      }
      
      const q = query(
        collection(db, COLLECTIONS.PROPERTIES),
        ...constraints,
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(q);
      const properties = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Property[];
      
      // Get related cities
      const cityPromises = [...new Set(properties.map(p => p.city_slug))]
        .map(citySlug => cityService.getBySlug(citySlug));
      
      const cities = (await Promise.all(cityPromises))
        .filter(city => city !== null) as City[];
      
      // Get stay types for filtered properties
      const stayTypePromises = properties.map(p => stayTypeService.getByProperty(p.id));
      const stayTypesArrays = await Promise.all(stayTypePromises);
      const stayTypes = stayTypesArrays.flat();
      
      return {
        properties,
        cities,
        stayTypes,
        total: properties.length
      };
    } catch (error) {
      console.error('Error performing search:', error);
      return {
        properties: [],
        cities: [],
        stayTypes: [],
        total: 0
      };
    }
  }
};

// Route Resolver Implementation
export const routeResolver: RouteResolver = {
  resolveProperty: propertyService.getBySlug,
  resolveCity: cityService.getBySlug,
  resolveStayType: stayTypeService.getByPropertyAndType,
  
  async generateSitemap(): Promise<SitemapEntry[]> {
    try {
      const [properties, cities] = await Promise.all([
        propertyService.getAll(),
        cityService.getAll()
      ]);
      
      const entries: SitemapEntry[] = [
        {
          url: '/',
          lastmod: new Date().toISOString(),
          changefreq: 'daily',
          priority: 1.0
        }
      ];
      
      // Add property pages
      properties.forEach(property => {
        entries.push({
          url: `/properties/${property.slug}`,
          lastmod: property.updated_at.toISOString(),
          changefreq: 'weekly',
          priority: 0.8
        });
      });
      
      // Add city pages
      cities.forEach(city => {
        entries.push({
          url: `/locations/${city.slug}`,
          lastmod: city.updated_at.toISOString(),
          changefreq: 'weekly',
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