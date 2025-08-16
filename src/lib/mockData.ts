import { isDevelopmentMode } from './firebase';

// Import types from the main types file
import type { Property, ResortGroup, PromotionalOffer as Offer } from '../types';

// Simplified interfaces for mock data that extend the main types
export interface MockProperty extends Omit<Property, 'city_slug' | 'stay_types' | 'branding' | 'managers' | 'created_at' | 'updated_at'> {
  city: string;
  citySlug: string;
  stayType: string;
  stayTypeSlug: string;
  description: string;
  shortDescription: string;
  images: string[];
  amenities: string[];
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  rating: number;
  reviewCount: number;
  featured: boolean;
}

export interface MockResortGroup extends Omit<ResortGroup, 'brand_description' | 'property_ids' | 'created_at' | 'updated_at'> {
  slug: string;
  description: string;
  logo: string;
  properties: MockProperty[];
  cities: string[];
  stayTypes: string[];
  settings?: {
    referral_system_enabled: boolean;
  };
}

export interface PromotionalOffer {
  id: string;
  title: string;
  description: string;
  discount_percentage: number;
  valid_from: string;
  valid_until: string;
  minimum_nights?: number;
  promo_code?: string;
  property_ids: string[];
  active: boolean;
}

export interface ReferralData {
  id: string;
  code: string;
  userId: string;
  referredUsers: string[];
  totalRewards: number;
  active: boolean;
}

// Mock resort group data
export const mockResortGroup: MockResortGroup = {
  id: 'luxury-resorts-group',
  name: 'Luxury Resorts Group',
  slug: 'luxury-resorts',
  description: 'Premium resort experiences across multiple destinations',
  logo: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20resort%20logo%20elegant%20minimalist%20design&image_size=square',
  cities: ['bali', 'maldives', 'santorini', 'dubai'],
  stayTypes: ['villa', 'suite', 'bungalow', 'penthouse'],
  settings: {
    referral_system_enabled: true
  },
  properties: [
    {
      id: 'bali-ocean-villa',
      name: 'Bali Ocean Villa',
      slug: 'bali-ocean-villa',
      city: 'Bali',
      citySlug: 'bali',
      stayType: 'Villa',
      stayTypeSlug: 'villa',
      description: 'Luxurious oceanfront villa with private pool and stunning sunset views',
      shortDescription: 'Oceanfront villa with private pool',
      images: [
        'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20bali%20oceanfront%20villa%20private%20pool%20sunset%20tropical&image_size=landscape_16_9',
        'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=bali%20villa%20interior%20luxury%20bedroom%20ocean%20view&image_size=landscape_16_9'
      ],
      amenities: ['Private Pool', 'Ocean View', 'Butler Service', 'Spa', 'Restaurant'],
      priceRange: { min: 500, max: 1200, currency: 'USD' },
      location: {
        address: 'Seminyak Beach, Bali, Indonesia',
        coordinates: {
          lat: -8.3405,
          lng: 115.0920
        }
      },
      rating: 4.8,
      reviewCount: 245,
      featured: true,
      active: true
    },
    {
      id: 'maldives-water-suite',
      name: 'Maldives Water Suite',
      slug: 'maldives-water-suite',
      city: 'Maldives',
      citySlug: 'maldives',
      stayType: 'Suite',
      stayTypeSlug: 'suite',
      description: 'Overwater suite with glass floor and direct lagoon access',
      shortDescription: 'Overwater suite with glass floor',
      images: [
        'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=maldives%20overwater%20suite%20glass%20floor%20lagoon%20luxury&image_size=landscape_16_9',
        'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=maldives%20water%20suite%20interior%20luxury%20ocean%20view&image_size=landscape_16_9'
      ],
      amenities: ['Glass Floor', 'Direct Lagoon Access', 'Snorkeling', 'Spa', 'Fine Dining'],
      priceRange: { min: 800, max: 2000, currency: 'USD' },
      location: {
        address: 'North Malé Atoll, Maldives',
        coordinates: {
          lat: 3.2028,
          lng: 73.2207
        }
      },
      rating: 4.9,
      reviewCount: 189,
      featured: true,
      active: true
    },
    {
      id: 'santorini-cliff-suite',
      name: 'Santorini Cliff Suite',
      slug: 'santorini-cliff-suite',
      city: 'Santorini',
      citySlug: 'santorini',
      stayType: 'Suite',
      stayTypeSlug: 'suite',
      description: 'Cliffside suite with infinity pool and caldera views',
      shortDescription: 'Cliffside suite with infinity pool',
      images: [
        'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=santorini%20cliffside%20suite%20infinity%20pool%20caldera%20view%20white%20architecture&image_size=landscape_16_9',
        'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=santorini%20suite%20interior%20luxury%20aegean%20sea%20view&image_size=landscape_16_9'
      ],
      amenities: ['Infinity Pool', 'Caldera View', 'Wine Cellar', 'Spa', 'Concierge'],
      priceRange: { min: 600, max: 1500, currency: 'USD' },
      location: {
        address: 'Oia, Santorini, Greece',
        coordinates: {
          lat: 36.3932,
          lng: 25.4615
        }
      },
      rating: 4.7,
      reviewCount: 156,
      featured: false,
      active: true
    }
  ]
};

// Mock promotional offers
export const mockPromotionalOffers: PromotionalOffer[] = [
  {
    id: 'summer-escape-2024',
    title: 'Summer Escape 2024',
    description: 'Save up to 30% on your summer getaway',
    discount_percentage: 30,
    valid_from: '2024-06-01',
    valid_until: '2024-08-31',
    minimum_nights: 3,
    promo_code: 'SUMMER30',
    property_ids: ['bali-ocean-villa', 'maldives-water-suite'],
    active: true
  },
  {
    id: 'early-bird-special',
    title: 'Early Bird Special',
    description: 'Book 60 days in advance and save 20%',
    discount_percentage: 20,
    valid_from: '2024-01-01',
    valid_until: '2024-12-31',
    minimum_nights: 2,
    promo_code: 'EARLY20',
    property_ids: ['santorini-cliff-suite'],
    active: true
  }
];

// Mock referral data
export const mockReferralData: ReferralData = {
  id: 'user-referral-001',
  code: 'LUXURY2024',
  userId: 'demo-user',
  referredUsers: ['user-001', 'user-002'],
  totalRewards: 150,
  active: true
};

// Mock data service functions
export class MockDataService {
  static async getResortGroup(): Promise<MockResortGroup> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockResortGroup;
  }

  static async getProperties(): Promise<MockProperty[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockResortGroup.properties;
  }

  static async getProperty(slug: string): Promise<MockProperty | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockResortGroup.properties.find(p => p.slug === slug) || null;
  }

  static async getPropertiesByCity(citySlug: string): Promise<MockProperty[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockResortGroup.properties.filter(p => p.citySlug === citySlug);
  }

  static async getPropertiesByStayType(stayTypeSlug: string): Promise<MockProperty[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockResortGroup.properties.filter(p => p.stayTypeSlug === stayTypeSlug);
  }

  static async getPromotionalOffers(): Promise<PromotionalOffer[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockPromotionalOffers;
  }

  static async getReferralData(userId: string): Promise<ReferralData | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockReferralData;
  }

  static async searchProperties(query: string): Promise<MockProperty[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const lowercaseQuery = query.toLowerCase();
    return mockResortGroup.properties.filter(p => 
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.city.toLowerCase().includes(lowercaseQuery) ||
      p.stayType.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery)
    );
  }
}

// Export flag for development mode
export { isDevelopmentMode };