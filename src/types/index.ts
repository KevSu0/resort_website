// Multi-Property Resort Platform Types

export interface Property {
  id: string;
  slug: string;
  name: string;
  city_slug: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  stay_types: string[];
  branding: {
    logo_url?: string;
    primary_color: string;
    secondary_color: string;
    description: string;
  };
  managers: { [userId: string]: boolean };
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface City {
  slug: string;
  name: string;
  state: string;
  country: string;
  property_ids: string[];
  seo_data: SEOData;
  created_at: Date;
  updated_at: Date;
}

export interface StayType {
  id: string;
  property_id: string;
  type_name: string;
  slug: string;
  details: {
    capacity: number;
    amenities: string[];
    price_range: {
      min: number;
      max: number;
      currency: string;
    };
    images: string[];
    description: string;
  };
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SEOData {
  meta_title: string;
  meta_description: string;
  keywords: string[];
  og_title?: string;
  og_description?: string;
  og_image?: string;
  schema_markup?: object;
}

export interface ResortGroup {
  id: string;
  name: string;
  brand_description: string;
  property_ids: string[];
  created_at: Date;
  updated_at: Date;
}

export interface Enquiry {
  id: string;
  property_id: string;
  property_name: string;
  city: string;
  stay_type?: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  booking_details: {
    check_in?: string;
    check_out?: string;
    guests?: number;
    message: string;
  };
  referral_id?: string;
  offer_id?: string;
  status: 'new' | 'contacted' | 'quoted' | 'booked' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

export interface User {
  uid: string;
  email: string;
  role: 'group_admin' | 'property_manager' | 'seo_manager' | 'content_editor' | 'city_manager';
  property_access?: string[];
  city_access?: string[];
  created_at: Date;
  last_login: Date;
}

export interface Offer {
  id: string;
  property_id: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  valid_from: Date;
  valid_until: Date;
  terms_conditions: string;
  active: boolean;
  created_by: string;
  created_at: Date;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referee_email: string;
  referee_id?: string;
  property_id?: string;
  status: 'pending' | 'completed' | 'rewarded';
  reward_amount: number;
  currency: string;
  created_at: Date;
  completed_at?: Date;
}

// Route Resolution Types
export interface RouteResolver {
  resolveProperty: (slug: string) => Promise<Property | null>;
  resolveCity: (slug: string) => Promise<City | null>;
  resolveStayType: (propertyId: string, stayType: string) => Promise<StayType | null>;
  generateSitemap: () => Promise<SitemapEntry[]>;
}

export interface SitemapEntry {
  url: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

// Form Security Types
export interface FormSecurityConfig {
  honeypotField: string;
  hCaptchaRequired: boolean;
  rateLimitMs: number;
  maxSubmissionsPerHour: number;
}

// Search and Filter Types
export interface SearchFilters {
  city?: string;
  stayType?: string;
  capacity?: number;
  amenities?: string[];
  priceRange?: [number, number];
}

export interface SearchResult {
  properties: Property[];
  cities: City[];
  stayTypes: StayType[];
  total: number;
}