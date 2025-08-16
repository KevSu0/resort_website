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
  SitemapEntry,
  Offer,
  Referral,
  ResortGroup,
  Enquiry
} from '../types';
import { MockDataService } from './mockData';

// Flag to determine if we should use mock data
const USE_MOCK_DATA = import.meta.env.DEV;

// Multi-property configuration
export const RESORT_GROUP_CONFIG = {
  id: 'luxury-resorts-group',
  name: 'Luxury Resorts Group',
  description: 'Premium resort destinations worldwide',
  website: 'https://luxury-resorts.com',
  contact_email: 'info@luxury-resorts.com'
};

// Collections
const COLLECTIONS = {
  PROPERTIES: 'properties',
  CITIES: 'cities',
  STAY_TYPES: 'stay_types',
  RESORT_GROUP: 'resort_group',
  ENQUIRIES: 'enquiries',
  OFFERS: 'offers',
  REFERRALS: 'referrals',
  USERS: 'users',
  SEO_CONTENT: 'seo_content',
  SYSTEM_PROMPTS: 'system_prompts',
  ANALYTICS: 'analytics'
} as const;

import { User } from '../types';
import { addDoc, updateDoc } from 'firebase/firestore';

// Enhanced User Service with Role-Based Access Control
export const userService = {
  create: async (user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> => {
    if (USE_MOCK_DATA) {
      return MockDataService.createUser(user);
    }
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.USERS), {
        ...user,
        created_at: new Date(),
        updated_at: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  },

  getById: async (id: string): Promise<User | null> => {
    if (USE_MOCK_DATA) {
      return MockDataService.getUserById(id);
    }
    try {
      const docRef = doc(db, COLLECTIONS.USERS, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  update: async (id: string, updates: Partial<User>): Promise<boolean> => {
    if (USE_MOCK_DATA) {
      return MockDataService.updateUser(id, updates);
    }
    try {
      const docRef = doc(db, COLLECTIONS.USERS, id);
      await updateDoc(docRef, {
        ...updates,
        updated_at: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  },

  getByRole: async (role: string): Promise<User[]> => {
    if (USE_MOCK_DATA) {
      return MockDataService.getUsersByRole(role);
    }
    try {
      const q = query(
        collection(db, COLLECTIONS.USERS),
        where('role', '==', role)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
    } catch (error) {
      console.error('Error fetching users by role:', error);
      return [];
    }
  },

  hasPermission: (user: User, action: string, resourceId?: string): boolean => {
    // Group Admin has all permissions
    if (user.role === 'group_admin') return true;
    
    // Check specific permissions based on role and action
    switch (action) {
      case 'manage_property':
        return user.role === 'property_manager' && 
               (!resourceId || user.permissions?.properties?.includes(resourceId));
      
      case 'manage_city':
        return user.role === 'city_manager' && 
               (!resourceId || user.permissions?.cities?.includes(resourceId));
      
      case 'manage_seo':
        return user.role === 'seo_manager' || user.permissions?.can_manage_seo === true;
      
      case 'edit_content':
        return user.role === 'content_editor' || user.permissions?.can_edit_content === true;
      
      case 'view_analytics':
        return user.permissions?.can_view_analytics === true;
      
      default:
        return false;
    }
  }
};

// Enquiry Service
export const enquiryService = {
  create: async (enquiry: Omit<Enquiry, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> => {
    if (USE_MOCK_DATA) {
      return MockDataService.createEnquiry(enquiry);
    }
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.ENQUIRIES), {
        ...enquiry,
        created_at: new Date(),
        updated_at: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating enquiry:', error);
      return null;
    }
  },
  getAll: async (): Promise<Enquiry[]> => {
    if (USE_MOCK_DATA) {
      return MockDataService.getEnquiries();
    }
    try {
      const q = query(collection(db, COLLECTIONS.ENQUIRIES), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Enquiry[];
    } catch (error) {
      console.error('Error getting enquiries:', error);
      return [];
    }
  },
  update: async (id: string, updates: Partial<Enquiry>): Promise<boolean> => {
    if (USE_MOCK_DATA) {
      return MockDataService.updateEnquiry(id, updates);
    }
    try {
      const docRef = doc(db, COLLECTIONS.ENQUIRIES, id);
      await updateDoc(docRef, {
        ...updates,
        updated_at: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error updating enquiry:', error);
      return false;
    }
  }
};

// Property Operations
export const propertyService = {
  async getBySlug(slug: string): Promise<Property | null> {
    if (USE_MOCK_DATA) {
      return MockDataService.getProperty(slug);
    }
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
      
      const firstDoc = querySnapshot.docs[0];
      return { id: firstDoc.id, ...firstDoc.data() } as Property;
    } catch (error) {
      console.error('Error fetching property by slug:', error);
      return null;
    }
  },

  async getById(id: string): Promise<Property | null> {
    if (USE_MOCK_DATA) {
      return MockDataService.getPropertyById(id);
    }
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
    if (USE_MOCK_DATA) {
      return MockDataService.getPropertiesByCity(citySlug);
    }
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
    if (USE_MOCK_DATA) {
      return MockDataService.getProperties();
    }
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
  },

  async getFeatured(limitCount: number = 3): Promise<Property[]> {
    if (USE_MOCK_DATA) {
      return MockDataService.getFeaturedProperties(limitCount);
    }
    try {
      const q = query(
        collection(db, COLLECTIONS.PROPERTIES),
        where('active', '==', true),
        where('featured', '==', true),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Property[];
    } catch (error) {
      console.error('Error fetching featured properties:', error);
      return [];
    }
  },

  async create(property: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    if (USE_MOCK_DATA) {
      return MockDataService.createProperty(property);
    }
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.PROPERTIES), {
        ...property,
        created_at: new Date(),
        updated_at: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating property:', error);
      return null;
    }
  },

  async update(id: string, updates: Partial<Property>): Promise<boolean> {
    if (USE_MOCK_DATA) {
      return MockDataService.updateProperty(id, updates);
    }
    try {
      const docRef = doc(db, COLLECTIONS.PROPERTIES, id);
      await updateDoc(docRef, {
        ...updates,
        updated_at: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error updating property:', error);
      return false;
    }
  }
};

// City Operations
export const cityService = {
  async getBySlug(slug: string): Promise<City | null> {
    if (USE_MOCK_DATA) {
      return MockDataService.getCityBySlug(slug);
    }
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
    if (USE_MOCK_DATA) {
      return MockDataService.getAllCities();
    }
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
    if (USE_MOCK_DATA) {
      return MockDataService.getStayTypeByPropertyAndType(propertyId, stayType);
    }
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
      
      const firstDoc = querySnapshot.docs[0];
      return { id: firstDoc.id, ...firstDoc.data() } as StayType;
    } catch (error) {
      console.error('Error fetching stay type:', error);
      return null;
    }
  },

  async getByProperty(propertyId: string): Promise<StayType[]> {
    if (USE_MOCK_DATA) {
      return MockDataService.getStayTypesByProperty(propertyId);
    }
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
    if (USE_MOCK_DATA) {
      const mockProperties = await MockDataService.searchProperties(filters.query || '');
      const mockCitiesData = await MockDataService.getAllCities();
      return {
        properties: mockProperties.slice(0, 5), // Limit to 5 results
        cities: mockCitiesData,
        stayTypes: [],
        total: mockProperties.length
      };
    }
    try {
      const constraints: QueryConstraint[] = [where('active', '==', true)];
      
      if (filters.city) {
        constraints.push(where('city_slug', '==', filters.city));
      }
      
      if (filters.capacity) {
        const stayTypesQuery = query(
          collection(db, COLLECTIONS.STAY_TYPES),
          where('details.capacity', '>=', filters.capacity)
        );
        const stayTypesSnapshot = await getDocs(stayTypesQuery);
        const propertyIds = [
          ...new Set(
            stayTypesSnapshot.docs.map((doc) => doc.data().property_id)
          ),
        ];
        if (propertyIds.length > 0) {
          constraints.push(where('__name__', 'in', propertyIds));
        } else {
          // No stay types match capacity, so return no properties
          return {
            properties: [],
            cities: [],
            stayTypes: [],
            total: 0,
          };
        }
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

// Resort Group Service
export const resortGroupService = {
  get: async (): Promise<ResortGroup | null> => {
    if (USE_MOCK_DATA) {
      return MockDataService.getResortGroup();
    }
    try {
      const docSnapshot = await getDoc(doc(db, COLLECTIONS.RESORT_GROUP, RESORT_GROUP_CONFIG.id));
      return docSnapshot.exists() ? { id: docSnapshot.id, ...docSnapshot.data() } as ResortGroup : null;
    } catch (error) {
      console.error('Error fetching resort group:', error);
      return null;
    }
  }
};

// Referral Service
export const referralService = {
  create: async (referral: Omit<Referral, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> => {
    if (USE_MOCK_DATA) {
      return MockDataService.createReferral();
    }
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.REFERRALS), {
        ...referral,
        created_at: new Date(),
        updated_at: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating referral:', error);
      return null;
    }
  },

  getByCode: async (code: string): Promise<Referral | null> => {
    if (USE_MOCK_DATA) {
      return MockDataService.getReferralByCode(code);
    }
    try {
      const q = query(
        collection(db, COLLECTIONS.REFERRALS),
        where('referral_code', '==', code),
        where('status', '==', 'pending')
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return null;
      
      const firstDoc = querySnapshot.docs[0];
      return { id: firstDoc.id, ...firstDoc.data() } as Referral;
    } catch (error) {
      console.error('Error fetching referral by code:', error);
      return null;
    }
  },

  getByUser: async (userId: string): Promise<Referral[]> => {
    if (USE_MOCK_DATA) {
      return MockDataService.getReferralsByUser(userId);
    }
    try {
      const q = query(
        collection(db, COLLECTIONS.REFERRALS),
        where('referrer_id', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Referral[];
    } catch (error) {
      console.error('Error fetching user referrals:', error);
      return [];
    }
  }
};

// Offer Service
export const offerService = {
  getActive: async (): Promise<Offer[]> => {
    if (USE_MOCK_DATA) {
      return MockDataService.getPromotionalOffers();
    }
    try {
      const q = query(
        collection(db, COLLECTIONS.OFFERS),
        where('active', '==', true),
        where('valid_until', '>=', new Date())
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Offer[];
    } catch (error) {
      console.error('Error fetching active offers:', error);
      return [];
    }
  },

  getByProperty: async (propertyId: string): Promise<Offer[]> => {
    if (USE_MOCK_DATA) {
      return MockDataService.getOffersByProperty(propertyId);
    }
    try {
      const q = query(
        collection(db, COLLECTIONS.OFFERS),
        where('active', '==', true),
        where('applicable_properties', 'array-contains', propertyId),
        where('valid_until', '>=', new Date())
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Offer[];
    } catch (error) {
      console.error('Error fetching property offers:', error);
      return [];
    }
  }
};

export const generateSitemap = async (): Promise<SitemapEntry[]> => {
  const sitemap: SitemapEntry[] = [];

  // Add homepage
  sitemap.push({
    url: '/',
    lastmod: new Date().toISOString(),
    changefreq: 'daily',
    priority: 1.0
  });

  // Add property pages
  const properties = await propertyService.getAll();
  properties.forEach(property => {
    sitemap.push({
      url: `/properties/${property.slug}`,
      lastmod: property.updated_at.toISOString(),
      changefreq: 'weekly',
      priority: 0.8
    });
  });

  // Add city pages
  const cities = await cityService.getAll();
  cities.forEach(city => {
    sitemap.push({
      url: `/cities/${city.slug}`,
      lastmod: city.updated_at.toISOString(),
      changefreq: 'weekly',
      priority: 0.7
    });
  });

  return sitemap;
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