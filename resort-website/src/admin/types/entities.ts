export interface Property {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  shortDescription: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  mapUrl?: string;
  checkIn: string;
  checkOut: string;
  amenities: string[];
  heroImage: string;
  gallery: string[];
  featured: boolean;
  seo: {
    title: string;
    description: string;
    keywords?: string;
  };
  schemaHotel: {
    priceRange: string;
    starRating: number;
    amenities: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface RoomType {
  id: string;
  propertyId: string;
  name: string;
  slug: string;
  category: 'Standard' | 'Deluxe' | 'Suite' | 'Villa' | 'Cottage' | 'Treehouse';
  capacity: number;
  baseRateBand: {
    base: number;
    seasonMultiplier: number;
    minOccupancy: number;
    maxOccupancy: number;
  };
  description: string;
  amenities: string[];
  images: string[];
  featured: boolean;
  photos?: string[];
  badges?: string[];
  size?: string;
  bedType?: string;
  type?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Place {
  id: string;
  propertyId: string;
  name: string;
  description: string;
  distanceKm?: number;
  travelTime?: string;
  photo?: string;
  category?: 'attraction' | 'restaurant' | 'transport' | 'shopping';
  type: string;
  images: string[];
  location: string;
  hours: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  id: string;
  title?: string;
  description: string;
  code: string;
  type: 'Percentage' | 'Fixed' | 'FreeNight';
  value: number;
  validFrom: string;
  validUntil: string;
  terms?: string;
  status: 'Active' | 'Inactive' | 'Expired';
  minBookingValue?: number;
  maxDiscountAmount?: number;
  scope?: 'GLOBAL' | 'PROPERTY' | 'ROOM';
  scopeIds?: string[];
  blackoutDates?: string[];
  daysOfWeek?: number[];
  minNights?: number;
  minAdvanceDays?: number;
  maxAdvanceDays?: number;
  longStayNights?: number;
  longStayDiscount?: number;
  usageLimit?: number;
  usageCount?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  type: 'Percentage' | 'Fixed' | 'FreeNight' | 'Upgrade';
  value: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usageCount: number;
  customerLimit: number;
  minBookingValue: number;
  maxDiscountAmount: number;
  applicableFor?: {
    propertyIds?: string[];
    roomTypeIds?: string[];
  };
  status: 'Draft' | 'Active' | 'Expired' | 'Paused';
  discountType?: 'PERCENT' | 'FIXED';
  discountValue?: number;
  validTo?: string;
  perPhoneLimit?: number;
  scope?: 'GLOBAL' | 'PROPERTY' | 'ROOM';
  propertyId?: string;
  roomTypeId?: string;
  minNights?: number;
  minAmount?: number;
  isReferral?: boolean;
  referrerId?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Referrer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  code: string;
  commissionRate?: number;
  status?: 'Active' | 'Inactive' | 'Suspended';
  notes?: string;
  rewardType: 'PERCENT' | 'FIXED' | 'NIGHTS';
  rewardValue: number;
  maxRewards?: number;
  totals: {
    attributions: number;
    confirmed: number;
    pending: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryTimeline {
  id: string;
  timestamp: string;
  status: string;
  notes: string;
  by: string;
}

export type EnquiryStatus = 'NEW' | 'CONTACTED' | 'CONFIRMED' | 'DECLINED' | 'CANCELLED';

export interface Enquiry {
  id: string;
  refCode?: string;
  propertyId?: string;
  roomTypeId?: string;
  startDate?: string;
  endDate?: string;
  checkIn?: string;
  checkOut?: string;
  adults: number;
  children: number;
  fullName?: string;
  name?: string;
  phone: string;
  email?: string;
  location?: string;
  propertyName?: string;
  roomType?: string;
  budget?: number;
  notes?: string;
  updatedBy?: string;
  status: EnquiryStatus;
  source: 'WEBSITE' | 'PHONE' | 'EMAIL' | 'WALKIN' | 'REFERRAL';
  referrerId?: string;
  assignedTo?: string;
  timeline: EnquiryTimeline[];
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  id: string;
  kind: 'image' | 'video';
  filename: string;
  originalName: string;
  mime: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
  alt: string;
  caption?: string;
  createdAt: string;
  usedBy: {
    entityType: string;
    entityId: string;
    field: string;
  }[];
}

export interface LandingContent {
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: string;
    ctaText: string;
    ctaLink: string;
  };
  usps: {
    icon: string;
    title: string;
    description: string;
  }[];
  testimonials: {
    name: string;
    role: string;
    content: string;
    photo?: string;
    rating: number;
  }[];
  faqs: {
    question: string;
    answer: string;
    category: string;
  }[];
  seo: {
    title: string;
    description: string;
    keywords?: string;
    ogImage?: string;
  };
}

export interface SiteSettings {
  phones: string[];
  whatsapp: string;
  email: string;
  address: string;
  legal: {
    privacy: string;
    terms: string;
    cancellation: string;
  };
  booking: {
    sla: string;
    paymentMethods: string[];
    cancellationPolicy: string;
  };
  featureFlags: {
    enableReferrals: boolean;
    enablePromos: boolean;
    enableI18n: boolean;
    enableAnalytics: boolean;
    enableVideo: boolean;
  };
  maxDiscountCapPercent: number;
  currency: {
    code: string;
    symbol: string;
    locale: string;
  };
  updatedAt: string;
}