export interface Property {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  checkIn?: string;
  checkOut?: string;
  heroImage: string;
  gallery: string[];
  amenities: string[];
  featured: boolean;
  rooms: RoomType[];
  places: Place[];
  createdAt: string;
  updatedAt: string;
}

export interface RoomType {
  id: string;
  propertyId: string;
  name: string;
  slug: string;
  description: string;
  capacity: number;
  baseRate?: number;
  amenities: string[];
  photos: string[];
}

export interface Place {
  id: string;
  propertyId: string;
  name: string;
  description?: string;
  distanceKm?: number;
  travelTime?: string;
  photo?: string;
}

export interface Enquiry {
  id: string;
  refCode: string;
  propertyId: string;
  roomTypeId?: string;
  startDate: string;
  endDate?: string;
  adults: number;
  children: number;
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
  status: EnquiryStatus;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export type EnquiryStatus = 'NEW' | 'CONTACTED' | 'CONFIRMED' | 'DECLINED';

export interface Admin {
  id: string;
  email: string;
  name?: string;
  role: 'ADMIN';
  createdAt: string;
}

export interface Offer {
  id: string;
  title: string;
  description?: string;
  scope: 'GLOBAL' | 'PROPERTY' | 'ROOM';
  propertyId?: string;
  roomTypeId?: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  validFrom: string;
  validTo: string;
  blackoutDates: string[];
  daysOfWeek: number[];
  minNights?: number;
  minAdvanceDays?: number;
  maxAdvanceDays?: number;
  longStayNights?: number;
  usageLimit?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  description?: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  validFrom?: string;
  validTo?: string;
  usageLimit?: number;
  perPhoneLimit?: number;
  scope: 'GLOBAL' | 'PROPERTY' | 'ROOM';
  propertyId?: string;
  roomTypeId?: string;
  minNights?: number;
  isReferral: boolean;
  referrerId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Referrer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  code: string;
  rewardType?: 'FLAT_CREDIT' | 'PERCENT' | 'GIFT' | 'NONE';
  rewardValue?: number;
  maxRewards?: number;
  totalAttributions: number;
  totalConfirmed: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryFormData {
  propertyId: string;
  roomTypeId?: string;
  startDate: string;
  endDate?: string;
  adults: number;
  children: number;
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
  promoCode?: string;
  referralCode?: string;
}