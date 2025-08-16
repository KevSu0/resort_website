
// Import types from the main types file
import type { Property, ResortGroup, Offer, City, StayType, User, Referral, Enquiry } from '../types';

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


// MOCK DATA
const mockCities: City[] = [
  {
    id: 'bali',
    slug: 'bali',
    name: 'Bali',
    state: 'Bali',
    country: 'Indonesia',
    seo_data: {
      meta_title: 'Bali Luxury Resorts',
      meta_description: 'Island of the Gods',
      keywords: ['bali', 'luxury', 'resort']
    },
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=bali%20landscape&image_size=landscape_16_9',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'maldives',
    slug: 'maldives',
    name: 'Maldives',
    state: '',
    country: 'Maldives',
    seo_data: {
      meta_title: 'Maldives Luxury Resorts',
      meta_description: 'The sunny side of life',
      keywords: ['maldives', 'luxury', 'resort']
    },
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=maldives%20beach&image_size=landscape_16_9',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'santorini',
    slug: 'santorini',
    name: 'Santorini',
    state: 'South Aegean',
    country: 'Greece',
    seo_data: {
      meta_title: 'Santorini Luxury Resorts',
      meta_description: 'The jewel of the Aegean',
      keywords: ['santorini', 'luxury', 'resort']
    },
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=santorini%20landscape&image_size=landscape_16_9',
    created_at: new Date(),
    updated_at: new Date()
  }
];

const mockStayTypes: StayType[] = [
    {
        id: `bali-ocean-villa-suite`,
        property_id: 'bali-ocean-villa',
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
        id: `maldives-water-suite-villa`,
        property_id: 'maldives-water-suite',
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
      price: 500,
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
      price: 800,
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
      price: 600,
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

export const mockOffers: Offer[] = [
  {
    id: 'summer-escape-2024',
    property_id: 'bali-ocean-villa',
    title: 'Summer Escape 2024',
    description: 'Save up to 30% on your summer getaway',
    discount_type: 'percentage',
    discount_value: 30,
    valid_from: new Date('2024-06-01'),
    valid_until: new Date('2024-08-31'),
    terms_conditions: 'Minimum 3 nights stay required.',
    applicable_properties: ['bali-ocean-villa', 'maldives-water-suite'],
    active: true,
    created_by: 'admin',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'early-bird-special',
    property_id: 'santorini-cliff-suite',
    title: 'Early Bird Special',
    description: 'Book 60 days in advance and save 20%',
    discount_type: 'percentage',
    discount_value: 20,
    valid_from: new Date('2024-01-01'),
    valid_until: new Date('2024-12-31'),
    terms_conditions: 'Minimum 2 nights stay required.',
    applicable_properties: ['santorini-cliff-suite'],
    active: true,
    created_by: 'admin',
    created_at: new Date(),
    updated_at: new Date()
  }
];

export const mockReferral: Referral = {
  id: 'user-referral-001',
  referral_code: 'LUXURY2024',
  referrer_id: 'demo-user',
  referee_email: 'test@test.com',
  status: 'completed',
  reward_amount: 150,
  total_rewards: 150,
  currency: 'USD',
  created_at: new Date(),
};

const mockUsers: User[] = [
    {
        id: 'admin1',
        uid: 'admin1',
        email: 'admin@luxury-resorts.com',
        name: 'Resort Admin',
        role: 'group_admin' as const,
        permissions: {
        properties: ['bali-ocean-villa', 'maldives-water-suite', 'santorini-cliff-suite'],
        cities: ['bali', 'maldives', 'santorini'],
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
]

// MOCK DATA SERVICE
export class MockDataService {
  private static async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Resort Group
  static async getResortGroup(): Promise<ResortGroup> {
    await this.delay(100);
    return convertMockResortGroupToResortGroup(mockResortGroup);
  }

  // Properties
  static async getProperties(): Promise<Property[]> {
    await this.delay(100);
    return mockResortGroup.properties.map(convertMockPropertyToProperty);
  }

  static async getProperty(slug: string): Promise<Property | null> {
    await this.delay(100);
    const mock = mockResortGroup.properties.find(p => p.slug === slug);
    return mock ? convertMockPropertyToProperty(mock) : null;
  }

  static async getPropertyById(id: string): Promise<Property | null> {
    await this.delay(100);
    const mock = mockResortGroup.properties.find(p => p.id === id);
    return mock ? convertMockPropertyToProperty(mock) : null;
  }

  static async getPropertiesByCity(citySlug: string): Promise<Property[]> {
    await this.delay(100);
    return mockResortGroup.properties.filter(p => p.citySlug === citySlug).map(convertMockPropertyToProperty);
  }

  static async getPropertiesByStayType(stayTypeSlug: string): Promise<Property[]> {
    await this.delay(100);
    return mockResortGroup.properties.filter(p => p.stayTypeSlug === stayTypeSlug).map(convertMockPropertyToProperty);
  }

  static async getFeaturedProperties(limitCount: number = 3): Promise<Property[]> {
    await this.delay(.1);
    return mockResortGroup.properties.filter(p => p.featured).slice(0, limitCount).map(convertMockPropertyToProperty);
  }

  static async searchProperties(query: string): Promise<Property[]> {
    await this.delay(100);
    const lowercaseQuery = query.toLowerCase();
    if (!lowercaseQuery) return [];
    return mockResortGroup.properties.filter(p => 
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.city.toLowerCase().includes(lowercaseQuery) ||
      p.stayType.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery)
    ).map(convertMockPropertyToProperty);
  }

  // Cities
  static async getAllCities(): Promise<City[]> {
    await this.delay(100);
    return mockCities;
  }

  static async getCityBySlug(slug: string): Promise<City | null> {
    await this.delay(100);
    return mockCities.find(c => c.slug === slug) || null;
  }

  // Stay Types
  static async getStayTypesByProperty(propertyId: string): Promise<StayType[]> {
    await this.delay(100);
    return mockStayTypes.filter(st => st.property_id === propertyId);
  }

  static async getStayTypeByPropertyAndType(propertyId: string, stayTypeSlug: string): Promise<StayType | null> {
    await this.delay(100);
    return mockStayTypes.find(st => st.property_id === propertyId && st.slug === stayTypeSlug) || null;
  }

  // Offers
  static async getPromotionalOffers(): Promise<Offer[]> {
    await this.delay(100);
    return mockOffers;
  }

  static async getOffersByProperty(propertyId: string): Promise<Offer[]> {
    await this.delay(100);
    return mockOffers.filter(o => o.applicable_properties.includes(propertyId));
  }

  // Users
  static async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
      await this.delay(100);
      const newUser = { ...user, id: `mock-user-${mockUsers.length + 1}`, created_at: new Date(), updated_at: new Date() };
      mockUsers.push(newUser as User);
      return newUser.id;
  }

  static async getUserById(id: string): Promise<User | null> {
      await this.delay(100);
      return mockUsers.find(u => u.id === id) || null;
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<boolean> {
    await this.delay(100);
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex > -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
        return true;
    }
    return false;
  }

  static async getUsersByRole(role: string): Promise<User[]> {
      await this.delay(100);
      return mockUsers.filter(u => u.role === role);
  }

  // Referrals
  static async createReferral(): Promise<string> {
      await this.delay(100);
      return 'mock-referral-id';
  }

  static async getReferralByCode(code: string): Promise<Referral | null> {
      await this.delay(100);
      if (mockReferral.referral_code === code) {
          return mockReferral;
      }
      return null;
  }

  static async getReferralsByUser(userId: string): Promise<Referral[]> {
      await this.delay(100);
      if (mockReferral.referrer_id === userId) {
        return [mockReferral];
      }
      return [];
  }

  // Enquiries
  static async createEnquiry(enquiry: Omit<Enquiry, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    await this.delay(100);
    const newEnquiry = {
      ...enquiry,
      id: `mock-enquiry-${mockEnquiries.length + 1}`,
      created_at: new Date(),
      updated_at: new Date(),
      status: 'new' as const
    };
    mockEnquiries.push(newEnquiry);
    return newEnquiry.id;
  }

  static async getEnquiries(): Promise<Enquiry[]> {
    await this.delay(100);
    return mockEnquiries;
  }

  static async updateEnquiry(id: string, updates: Partial<Enquiry>): Promise<boolean> {
    await this.delay(100);
    const enquiryIndex = mockEnquiries.findIndex(e => e.id === id);
    if (enquiryIndex > -1) {
        mockEnquiries[enquiryIndex] = { ...mockEnquiries[enquiryIndex], ...updates };
        return true;
    }
    return false;
  }

  static async createProperty(property: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    await this.delay(100);
    const newProperty = {
        ...property,
        id: `mock-prop-${mockResortGroup.properties.length + 1}`,
        created_at: new Date(),
        updated_at: new Date()
    } as Property;
    mockResortGroup.properties.push(convertPropertyToMockProperty(newProperty));
    return newProperty.id;
  }

  static async updateProperty(id: string, updates: Partial<Property>): Promise<boolean> {
    await this.delay(100);
    const propIndex = mockResortGroup.properties.findIndex(p => p.id === id);
    if (propIndex > -1) {
        mockResortGroup.properties[propIndex] = { ...mockResortGroup.properties[propIndex], ...convertPropertyToMockProperty(updates as Property) };
        return true;
    }
    return false;
  }
}

const mockEnquiries: Enquiry[] = [];

function convertMockResortGroupToResortGroup(mock: MockResortGroup): ResortGroup {
    return {
        id: mock.id,
        name: mock.name,
        brand_description: mock.description,
        property_ids: mock.properties.map(p => p.id),
        created_at: new Date(),
        updated_at: new Date(),
        settings: mock.settings
    }
}

function convertMockPropertyToProperty(mock: MockProperty): Property {
    return {
        ...mock,
        city_slug: mock.citySlug,
        stay_types: [mock.stayType],
        branding: {
            description: mock.description,
            primary_color: '#1a3a0f',
            secondary_color: '#4a7c59',
        },
        managers: {},
        created_at: new Date(),
        updated_at: new Date()
    };
}

function convertPropertyToMockProperty(property: Property): MockProperty {
    return {
        id: property.id,
        slug: property.slug,
        name: property.name,
        city: '', // This needs to be resolved, as Property does not have city.
        citySlug: property.city_slug,
        stayType: property.stay_types[0],
        stayTypeSlug: '', // This needs to be resolved.
        description: property.branding.description,
        shortDescription: property.branding.description.substring(0, 100),
        images: [property.branding.hero_image || ''],
        amenities: property.amenities || [],
        priceRange: property.priceRange || { min: 0, max: 0, currency: 'USD' },
        location: property.location,
        rating: property.rating || 0,
        reviewCount: property.reviewCount || 0,
        featured: property.featured,
        active: property.active
    };
}
