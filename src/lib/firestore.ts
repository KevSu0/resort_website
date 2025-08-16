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
  ResortGroup
} from '../types';
import { DataService } from '../services/dataService';

// Flag to determine if we should use mock data
const USE_MOCK_DATA = process.env.NODE_ENV === 'development';

// Multi-property configuration
export const RESORT_GROUP_CONFIG = {
  id: 'luxury-resorts-group',
  name: 'Luxury Resorts Group',
  description: 'Premium resort destinations worldwide',
  website: 'https://luxury-resorts.com',
  contact_email: 'info@luxury-resorts.com'
};

// Helper function to check if Firebase is available
const isFirebaseAvailable = async (): Promise<boolean> => {
  try {
    // Try a simple operation to test Firebase connectivity
    await getDocs(query(collection(db, 'test'), limit(1)));
    return true;
  } catch (error) {
    console.warn('Firebase unavailable, using mock data:', error);
    return false;
  }
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
      console.log('Mock: Creating user', user);
      return 'mock-user-id';
    }

    if (!await isFirebaseAvailable()) return null;
    
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
      return {
        id,
        uid: id,
        email: 'user@example.com',
        name: 'John Doe',
        role: 'guest' as const,
        permissions: {
          properties: [],
          cities: [],
          can_manage_seo: false,
          can_edit_content: false,
          can_view_analytics: false
        },
        preferences: {
          currency: 'USD',
          language: 'en'
        },
        created_at: new Date('2024-01-01'),
        updated_at: new Date(),
        last_login: new Date('2024-01-15')
      } as User;
    }

    if (!await isFirebaseAvailable()) return null;
    
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
      console.log('Mock: Updating user', id, updates);
      return true;
    }

    if (!await isFirebaseAvailable()) return false;
    
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
      return ([
        {
          id: 'admin1',
          uid: 'admin1',
          email: 'admin@luxury-resorts.com',
          name: 'Resort Admin',
          role: 'group_admin' as const,
          permissions: {
            properties: ['prop1', 'prop2', 'prop3'],
            cities: ['miami', 'aspen', 'new-york'],
            can_manage_seo: true,
            can_edit_content: true,
            can_view_analytics: true
          },
          preferences: {
            currency: 'USD',
            language: 'en'
          },
          created_at: new Date('2024-01-01'),
          updated_at: new Date(),
          last_login: new Date('2024-01-15')
        }
      ] as User[]).filter(user => user.role === role);
    }

    if (!await isFirebaseAvailable()) return [];
    
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

// Property Operations
export const propertyService = {
  async getBySlug(slug: string): Promise<Property | null> {
    try {
      if (USE_MOCK_DATA && !(await isFirebaseAvailable())) {
        const properties = await DataService.getProperties();
        return properties.find(p => p.name.toLowerCase().replace(/\s+/g, '-') === slug) || null;
      }
      
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
      if (USE_MOCK_DATA) {
        const properties = await DataService.getProperties();
        return properties.find(p => p.name.toLowerCase().replace(/\s+/g, '-') === slug) || null;
      }
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
      if (USE_MOCK_DATA && !(await isFirebaseAvailable())) {
        const properties = await DataService.getProperties();
        return properties.filter(p => p.active);
      }
      
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
      if (USE_MOCK_DATA) {
        const properties = await DataService.getProperties();
        return properties.filter(p => p.active);
      }
      return [];
    }
  }
};

// City Operations
// Mock cities data
const mockCities: City[] = [
  {
    id: 'miami',
    slug: 'miami',
    name: 'Miami',
    state: 'Florida',
    country: 'USA',
    seo_data: {
      meta_title: 'Miami Luxury Resorts - Premium Accommodations',
      meta_description: 'Vibrant coastal city with beautiful beaches',
      keywords: ['miami', 'beach', 'luxury', 'resort']
    },
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=miami%20skyline%20beach%20luxury&image_size=landscape_16_9',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'aspen',
    slug: 'aspen',
    name: 'Aspen',
    state: 'Colorado',
    country: 'USA',
    seo_data: {
      meta_title: 'Aspen Mountain Resorts - Ski & Luxury',
      meta_description: 'Premier mountain resort destination',
      keywords: ['aspen', 'mountain', 'ski', 'luxury']
    },
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=aspen%20mountains%20snow%20luxury%20resort&image_size=landscape_16_9',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'new-york',
    slug: 'new-york',
    name: 'New York',
    state: 'New York',
    country: 'USA',
    seo_data: {
      meta_title: 'New York City Hotels - Urban Luxury',
      meta_description: 'The city that never sleeps',
      keywords: ['new york', 'city', 'urban', 'luxury']
    },
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=new%20york%20city%20skyline%20luxury&image_size=landscape_16_9',
    created_at: new Date(),
    updated_at: new Date()
  }
];

export const cityService = {
  async getBySlug(slug: string): Promise<City | null> {
    try {
      if (USE_MOCK_DATA && !(await isFirebaseAvailable())) {
        return mockCities.find(city => city.slug === slug) || null;
      }
      
      const docRef = doc(db, COLLECTIONS.CITIES, slug);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return { slug: docSnap.id, ...docSnap.data() } as City;
    } catch (error) {
      console.error('Error fetching city by slug:', error);
      if (USE_MOCK_DATA) {
        return mockCities.find(city => city.slug === slug) || null;
      }
      return null;
    }
  },

  async getAll(): Promise<City[]> {
    try {
      if (USE_MOCK_DATA && !(await isFirebaseAvailable())) {
        return mockCities;
      }
      
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.CITIES));
      
      return querySnapshot.docs.map(doc => ({
        slug: doc.id,
        ...doc.data()
      })) as City[];
    } catch (error) {
      console.error('Error fetching all cities:', error);
      if (USE_MOCK_DATA) {
        return mockCities;
      }
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
      
      const firstDoc = querySnapshot.docs[0];
      return { id: firstDoc.id, ...firstDoc.data() } as StayType;
    } catch (error) {
      console.error('Error fetching stay type:', error);
      return null;
    }
  },

  async getByProperty(propertyId: string): Promise<StayType[]> {
    try {
      if (USE_MOCK_DATA && !(await isFirebaseAvailable())) {
        // Return basic mock stay types
        return [
          {
            id: `${propertyId}-suite`,
            property_id: propertyId,
            slug: 'luxury-suite',
            type_name: 'Luxury Suite',
            details: {
              capacity: 2,
              description: 'Luxurious suite with premium amenities',
              amenities: ['WiFi', 'AC', 'TV'],
              price_range: {
                min: 400,
                max: 600,
                currency: 'USD'
              },
              images: [
                'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20hotel%20suite%20interior%20elegant&image_size=landscape_16_9',
                'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20hotel%20bedroom%20modern&image_size=landscape_16_9'
              ]
            },
            active: true,
            created_at: new Date('2024-01-01'),
            updated_at: new Date()
          },
          {
            id: `${propertyId}-villa`,
            property_id: propertyId,
            slug: 'private-villa',
            type_name: 'Private Villa',
            details: {
              capacity: 4,
              description: 'Private villa with exclusive facilities',
              amenities: ['WiFi', 'AC', 'TV', 'Kitchen'],
              price_range: {
                min: 1000,
                max: 1500,
                currency: 'USD'
              },
              images: [
                'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20private%20villa%20resort&image_size=landscape_16_9',
                'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=villa%20interior%20luxury%20bedroom&image_size=landscape_16_9'
              ]
            },
            active: true,
            created_at: new Date('2024-01-01'),
            updated_at: new Date()
          }
        ];
      }
      
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
      if (USE_MOCK_DATA) {
        // Return basic mock stay types on error
        return [
          {
            id: `${propertyId}-suite`,
            property_id: propertyId,
            slug: 'luxury-suite',
            type_name: 'Luxury Suite',
            details: {
              capacity: 2,
              description: 'Luxurious suite with premium amenities',
              amenities: ['WiFi', 'AC', 'TV'],
              price_range: {
                min: 400,
                max: 600,
                currency: 'USD'
              },
              images: [
                'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20suite%20hotel%20room&image_size=landscape_16_9',
                'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=suite%20bathroom%20luxury%20amenities&image_size=landscape_16_9'
              ]
            },
            active: true,
            created_at: new Date('2024-01-01'),
            updated_at: new Date()
          }
        ];
      }
      return [];
    }
  }
};

// Search Operations
export const searchService = {
  async search(filters: SearchFilters): Promise<SearchResult> {
    try {
      // Use mock data if Firebase is unavailable
      if (USE_MOCK_DATA && !(await isFirebaseAvailable())) {
        // Return basic mock search results
        const mockProperties = await propertyService.getAll();
        const mockCitiesData = await cityService.getAll();
        return {
          properties: mockProperties.slice(0, 5), // Limit to 5 results
          cities: mockCitiesData,
          stayTypes: [],
          total: mockProperties.length
        };
      }
      
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
      // Fallback to mock data on error
      if (USE_MOCK_DATA) {
        return {
          properties: [],
          cities: mockCities,
          stayTypes: [],
          total: 0
        };
      }
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
      return {
        id: RESORT_GROUP_CONFIG.id,
        name: RESORT_GROUP_CONFIG.name,
        brand_description: RESORT_GROUP_CONFIG.description || 'Luxury resort group',
        description: RESORT_GROUP_CONFIG.description,
        website: RESORT_GROUP_CONFIG.website,
        contact_email: RESORT_GROUP_CONFIG.contact_email,
        property_ids: (await propertyService.getAll()).map(p => p.id),
        branding: {
          logo: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20resort%20logo%20elegant&image_size=square',
          primary_color: '#1a365d',
          secondary_color: '#2d3748'
        },
        settings: {
          multi_property_enabled: true,
          referral_system_enabled: true,
          ai_seo_enabled: true
        },
        created_at: new Date('2024-01-01'),
        updated_at: new Date()
      };
    }

    if (!await isFirebaseAvailable()) return null;
    
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
      console.log('Mock: Creating referral', referral);
      return 'mock-referral-id';
    }

    if (!await isFirebaseAvailable()) return null;
    
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
      return {
        id: 'mock-referral-1',
        referrer_id: 'user1',
        referee_email: 'referee@example.com',
        referral_code: code,
        status: 'pending',
        reward_amount: 50,
        currency: 'USD',
        total_rewards: 150,
        created_at: new Date('2024-01-01')
      };
    }

    if (!await isFirebaseAvailable()) return null;
    
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
      return [];
    }

    if (!await isFirebaseAvailable()) return [];
    
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
      return [
        {
          id: 'offer1',
          property_id: 'prop1',
          title: 'Early Bird Special',
          description: 'Book 30 days in advance and save 20%',
          discount_type: 'percentage',
          discount_value: 20,
          valid_from: new Date('2024-01-01'),
          valid_until: new Date('2024-12-31'),
          applicable_properties: ['prop1', 'prop2'],
          terms_conditions: 'Minimum 3 nights stay required. Must be booked 30 days in advance.',
          active: true,
          created_by: 'admin1',
          created_at: new Date('2024-01-01'),
          updated_at: new Date()
        }
      ];
    }

    if (!await isFirebaseAvailable()) return [];
    
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
      return (await offerService.getActive()).filter(offer => 
        offer.applicable_properties.includes(propertyId)
      );
    }

    if (!await isFirebaseAvailable()) return [];
    
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