import { type Property, type RoomType, type Place, type Enquiry, type Offer, type PromoCode, type Referrer } from '../types';
import { logger } from '../lib/logger';

export class LocalStorageService {
  private readonly STORAGE_KEYS = {
    PROPERTIES: 'resort_properties',
    ROOMS: 'resort_rooms',
    PLACES: 'resort_places',
    ENQUIRIES: 'resort_enquiries',
    OFFERS: 'resort_offers',
    PROMO_CODES: 'resort_promo_codes',
    REFERRERS: 'resort_referrers',
  };

  // Helper methods
  private getStorageData<T>(key: string, defaultValue: T[]): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      logger.error('Error reading from localStorage', {
        module: 'LocalStorageService',
        function: 'getStorageData',
        error: error instanceof Error ? error.message : String(error),
        key,
        category: 'storage'
      });
      return defaultValue;
    }
  }

  private setStorageData<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      logger.error('Error writing to localStorage', {
        module: 'LocalStorageService',
        function: 'setStorageData',
        error: error instanceof Error ? error.message : String(error),
        key,
        category: 'storage'
      });
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        // Handle storage quota exceeded
        logger.warn('LocalStorage quota exceeded. Consider clearing old data', {
          module: 'LocalStorageService',
          function: 'setStorageData',
          key,
          category: 'storage'
        });
      }
    }
  }

  // Properties
  getProperties(): Property[] {
    return this.getStorageData(this.STORAGE_KEYS.PROPERTIES, []);
  }

  saveProperties(properties: Property[]): void {
    this.setStorageData(this.STORAGE_KEYS.PROPERTIES, properties);
  }

  getPropertyBySlug(slug: string): Property | undefined {
    const properties = this.getProperties();
    return properties.find(p => p.slug === slug);
  }

  // Rooms
  getRooms(): RoomType[] {
    return this.getStorageData(this.STORAGE_KEYS.ROOMS, []);
  }

  saveRooms(rooms: RoomType[]): void {
    this.setStorageData(this.STORAGE_KEYS.ROOMS, rooms);
  }

  getRoomsByPropertyId(propertyId: string): RoomType[] {
    const rooms = this.getRooms();
    return rooms.filter(r => r.propertyId === propertyId);
  }

  getRoomBySlug(propertyId: string, roomSlug: string): RoomType | undefined {
    const rooms = this.getRoomsByPropertyId(propertyId);
    return rooms.find(r => r.slug === roomSlug);
  }

  // Places
  getPlaces(): Place[] {
    return this.getStorageData(this.STORAGE_KEYS.PLACES, []);
  }

  savePlaces(places: Place[]): void {
    this.setStorageData(this.STORAGE_KEYS.PLACES, places);
  }

  getPlacesByPropertyId(propertyId: string): Place[] {
    const places = this.getPlaces();
    return places.filter(p => p.propertyId === propertyId);
  }

  // Enquiries
  getEnquiries(): Enquiry[] {
    return this.getStorageData(this.STORAGE_KEYS.ENQUIRIES, []);
  }

  saveEnquiries(enquiries: Enquiry[]): void {
    this.setStorageData(this.STORAGE_KEYS.ENQUIRIES, enquiries);
  }

  saveEnquiry(enquiry: Enquiry): void {
    const enquiries = this.getEnquiries();
    enquiries.push(enquiry);
    this.saveEnquiries(enquiries);
  }

  updateEnquiry(id: string, updates: Partial<Enquiry>): void {
    const enquiries = this.getEnquiries();
    const index = enquiries.findIndex(e => e.id === id);
    if (index !== -1) {
      enquiries[index] = { ...enquiries[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveEnquiries(enquiries);
    }
  }

  getEnquiryByRefCode(refCode: string): Enquiry | undefined {
    const enquiries = this.getEnquiries();
    return enquiries.find(e => e.refCode === refCode);
  }

  
  // Offers
  getOffers(): Offer[] {
    return this.getStorageData(this.STORAGE_KEYS.OFFERS, []);
  }

  saveOffers(offers: Offer[]): void {
    this.setStorageData(this.STORAGE_KEYS.OFFERS, offers);
  }

  getActiveOffers(): Offer[] {
    const now = new Date().toISOString();
    const offers = this.getOffers();
    return offers.filter(o =>
      o.isActive &&
      o.validFrom <= now &&
      o.validTo >= now
    );
  }

  // Promo Codes
  getPromoCodes(): PromoCode[] {
    return this.getStorageData(this.STORAGE_KEYS.PROMO_CODES, []);
  }

  savePromoCodes(promoCodes: PromoCode[]): void {
    this.setStorageData(this.STORAGE_KEYS.PROMO_CODES, promoCodes);
  }

  getPromoCodeByCode(code: string): PromoCode | undefined {
    const promoCodes = this.getPromoCodes();
    return promoCodes.find(p => p.code === code.toUpperCase());
  }

  // Referrers
  getReferrers(): Referrer[] {
    return this.getStorageData(this.STORAGE_KEYS.REFERRERS, []);
  }

  saveReferrers(referrers: Referrer[]): void {
    this.setStorageData(this.STORAGE_KEYS.REFERRERS, referrers);
  }

  getReferrerByCode(code: string): Referrer | undefined {
    const referrers = this.getReferrers();
    return referrers.find(r => r.code === code.toUpperCase());
  }

  // Utility methods
  clearAllData(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  exportData(): string {
    const data: Record<string, unknown> = {};
    Object.entries(this.STORAGE_KEYS).forEach(([name, key]) => {
      const value = localStorage.getItem(key);
      if (value) {
        data[name] = JSON.parse(value);
      }
    });
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      Object.entries(this.STORAGE_KEYS).forEach(([name, key]) => {
        if (data[name]) {
          localStorage.setItem(key, JSON.stringify(data[name]));
        }
      });
    } catch (error) {
      logger.error('Error importing data', {
        module: 'LocalStorageService',
        function: 'importData',
        error: error instanceof Error ? error.message : String(error),
        category: 'storage'
      });
      throw new Error('Invalid data format');
    }
  }
}

// Export singleton instance
export const storageService = new LocalStorageService();