import { collection, getDocs, doc, getDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { db, isDevelopmentMode } from '../lib/firebase';
import { MockDataService, MockProperty, MockResortGroup, PromotionalOffer, ReferralData } from '../lib/mockData';
import type { Property, ResortGroup } from '../types';

/**
 * Data service that handles both Firebase and mock data fallback
 * Uses mock data in development mode when Firebase emulators are unavailable
 */
export class DataService {
  private static useFirebase = !isDevelopmentMode;

  /**
   * Convert MockProperty to Property interface
   */
  private static convertMockProperty(mockProperty: MockProperty): Property {
    return {
      id: mockProperty.id,
      slug: mockProperty.slug,
      name: mockProperty.name,
      city_slug: mockProperty.citySlug,
      location: {
          address: mockProperty.location.address,
          coordinates: {
            lat: mockProperty.location.coordinates.lat,
            lng: mockProperty.location.coordinates.lng
          }
        },
      stay_types: [mockProperty.stayType],
      branding: {
        logo_url: mockProperty.images?.[0] || '',
        primary_color: '#1f2937',
        secondary_color: '#f3f4f6',
        description: mockProperty.shortDescription || mockProperty.description
      },
      managers: {},
      active: mockProperty.active,
      featured: mockProperty.featured,
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  /**
   * Convert MockResortGroup to ResortGroup interface
   */
  private static convertMockResortGroup(mockResortGroup: MockResortGroup): ResortGroup {
    return {
      id: mockResortGroup.id,
      name: mockResortGroup.name,
      brand_description: mockResortGroup.description,
      description: mockResortGroup.description,
      property_ids: mockResortGroup.properties.map(p => p.id),
      contact_email: 'info@luxuryresorts.com',
      website: 'https://luxuryresorts.com',
      logo: mockResortGroup.logo,
      branding: {
        logo: mockResortGroup.logo,
        logo_url: mockResortGroup.logo,
        primary_color: '#1f2937',
        secondary_color: '#f3f4f6'
      },
      unique_selling_points: [
        'Premium locations worldwide',
        'Exceptional service standards',
        'Luxury amenities and facilities'
      ],
      settings: mockResortGroup.settings,
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  /**
   * Get resort group information
   */
  static async getResortGroup(): Promise<ResortGroup> {
    if (!this.useFirebase) {
        const mockResortGroup = await MockDataService.getResortGroup();
        return this.convertMockResortGroup(mockResortGroup);
      }

    try {
      const docRef = doc(db, 'resortGroups', 'luxury-resorts-group');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as ResortGroup;
      } else {
        // Fallback to mock data if Firebase document doesn't exist
        const mockResortGroup = await MockDataService.getResortGroup();
        return this.convertMockResortGroup(mockResortGroup);
      }
    } catch (error) {
        console.warn('Firebase error, falling back to mock data:', error);
        const mockResortGroup = await MockDataService.getResortGroup();
        return this.convertMockResortGroup(mockResortGroup);
      }
  }

  /**
   * Get all properties
   */
  static async getProperties(): Promise<Property[]> {
    if (!this.useFirebase) {
      const mockProperties = await MockDataService.getProperties();
      return mockProperties.map(p => this.convertMockProperty(p));
    }

    try {
      const propertiesRef = collection(db, 'properties');
      const q = query(propertiesRef, where('active', '==', true), orderBy('featured', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const properties: Property[] = [];
      querySnapshot.forEach((doc) => {
        properties.push({ id: doc.id, ...doc.data() } as Property);
      });
      
      if (properties.length > 0) {
        return properties;
      } else {
        const mockProperties = await MockDataService.getProperties();
        return mockProperties.map(p => this.convertMockProperty(p));
      }
    } catch (error) {
        console.warn('Firebase error, falling back to mock data:', error);
        const mockProperties = await MockDataService.getProperties();
        return mockProperties.map(p => this.convertMockProperty(p));
      }
  }

  /**
   * Get property by slug
   */
  static async getProperty(slug: string): Promise<Property | null> {
    if (!this.useFirebase) {
        const mockProperty = await MockDataService.getProperty(slug);
        return mockProperty ? this.convertMockProperty(mockProperty) : null;
      }

    try {
      const propertiesRef = collection(db, 'properties');
      const q = query(propertiesRef, where('slug', '==', slug), where('active', '==', true), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Property;
      } else {
        const mockProperty = await MockDataService.getProperty(slug);
        return mockProperty ? this.convertMockProperty(mockProperty) : null;
      }
    } catch (error) {
        console.warn('Firebase error, falling back to mock data:', error);
        const mockProperty = await MockDataService.getProperty(slug);
        return mockProperty ? this.convertMockProperty(mockProperty) : null;
      }
  }

  /**
   * Get properties by city
   */
  static async getPropertiesByCity(citySlug: string): Promise<Property[]> {
    if (!this.useFirebase) {
      const mockProperties = await MockDataService.getPropertiesByCity(citySlug);
      return mockProperties.map(p => this.convertMockProperty(p));
    }

    try {
      const propertiesRef = collection(db, 'properties');
      const q = query(
        propertiesRef, 
        where('citySlug', '==', citySlug), 
        where('active', '==', true),
        orderBy('featured', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const properties: Property[] = [];
      querySnapshot.forEach((doc) => {
        properties.push({ id: doc.id, ...doc.data() } as Property);
      });
      
      if (properties.length > 0) {
        return properties;
      } else {
        const mockProperties = await MockDataService.getPropertiesByCity(citySlug);
        return mockProperties.map(p => this.convertMockProperty(p));
      }
    } catch (error) {
        console.warn('Firebase error, falling back to mock data:', error);
        const mockProperties = await MockDataService.getPropertiesByCity(citySlug);
        return mockProperties.map(p => this.convertMockProperty(p));
      }
  }

  /**
   * Get properties by stay type
   */
  static async getPropertiesByStayType(stayTypeSlug: string): Promise<Property[]> {
    if (!this.useFirebase) {
      const mockProperties = await MockDataService.getPropertiesByStayType(stayTypeSlug);
      return mockProperties.map(p => this.convertMockProperty(p));
    }

    try {
      const propertiesRef = collection(db, 'properties');
      const q = query(
        propertiesRef, 
        where('stayTypeSlug', '==', stayTypeSlug), 
        where('active', '==', true),
        orderBy('featured', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const properties: Property[] = [];
      querySnapshot.forEach((doc) => {
        properties.push({ id: doc.id, ...doc.data() } as Property);
      });
      
      if (properties.length > 0) {
        return properties;
      } else {
        const mockProperties = await MockDataService.getPropertiesByStayType(stayTypeSlug);
        return mockProperties.map(p => this.convertMockProperty(p));
      }
    } catch (error) {
        console.warn('Firebase error, falling back to mock data:', error);
        const mockProperties = await MockDataService.getPropertiesByStayType(stayTypeSlug);
        return mockProperties.map(p => this.convertMockProperty(p));
      }
  }

  /**
   * Get promotional offers
   */
  static async getPromotionalOffers(): Promise<PromotionalOffer[]> {
    if (!this.useFirebase) {
      return MockDataService.getPromotionalOffers();
    }

    try {
      const offersRef = collection(db, 'promotionalOffers');
      const q = query(offersRef, where('active', '==', true));
      const querySnapshot = await getDocs(q);
      
      const offers: PromotionalOffer[] = [];
      querySnapshot.forEach((doc) => {
        offers.push({ id: doc.id, ...doc.data() } as PromotionalOffer);
      });
      
      return offers.length > 0 ? offers : MockDataService.getPromotionalOffers();
    } catch (error) {
      console.warn('Firebase error, falling back to mock data:', error);
      return MockDataService.getPromotionalOffers();
    }
  }

  /**
   * Get referral data for user
   */
  static async getReferralData(userId: string): Promise<ReferralData | null> {
    if (!this.useFirebase) {
      return MockDataService.getReferralData(userId);
    }

    try {
      const referralsRef = collection(db, 'referrals');
      const q = query(referralsRef, where('userId', '==', userId), where('active', '==', true), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as ReferralData;
      } else {
        return MockDataService.getReferralData(userId);
      }
    } catch (error) {
      console.warn('Firebase error, falling back to mock data:', error);
      return MockDataService.getReferralData(userId);
    }
  }

  /**
   * Search properties
   */
  static async searchProperties(query: string): Promise<Property[]> {
    if (!this.useFirebase) {
      const mockResults = await MockDataService.searchProperties(query);
      return mockResults.map(p => this.convertMockProperty(p));
    }

    try {
      // Firebase doesn't support full-text search natively
      // For now, we'll use the mock search and later implement Algolia or similar
      const mockResults = await MockDataService.searchProperties(query);
      return mockResults.map(p => this.convertMockProperty(p));
    } catch (error) {
        console.warn('Firebase error, falling back to mock data:', error);
        const mockResults = await MockDataService.searchProperties(query);
        return mockResults.map(p => this.convertMockProperty(p));
      }
  }

  /**
   * Get featured properties
   */
  static async getFeaturedProperties(limitCount: number = 3): Promise<Property[]> {
    if (!this.useFirebase) {
      const mockProperties = await MockDataService.getProperties();
      return mockProperties.filter(p => p.featured).slice(0, limitCount).map(p => this.convertMockProperty(p));
    }

    try {
      const propertiesRef = collection(db, 'properties');
      const q = query(
        propertiesRef, 
        where('featured', '==', true), 
        where('active', '==', true),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      
      const properties: Property[] = [];
      querySnapshot.forEach((doc) => {
        properties.push({ id: doc.id, ...doc.data() } as Property);
      });
      
      if (properties.length === 0) {
          const mockProperties = await MockDataService.getProperties();
          return mockProperties.filter(p => p.featured).slice(0, limitCount).map(p => this.convertMockProperty(p));
        }
      
      return properties;
    } catch (error) {
        console.warn('Firebase error, falling back to mock data:', error);
        const mockProperties = await MockDataService.getProperties();
        return mockProperties.filter(p => p.featured).slice(0, limitCount).map(p => this.convertMockProperty(p));
      }
  }
}

// Export types for convenience
export type { Property, ResortGroup, PromotionalOffer, ReferralData };