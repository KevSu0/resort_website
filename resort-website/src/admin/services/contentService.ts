import { type DraftContent } from '../types/admin';
import { type Property, type RoomType, type Place, type Offer, type PromoCode, type Referrer } from '../types/entities';
import { fileStorageService } from './fileStorage';
import { generateSlug } from '../../utils/admin';
import { v4 as uuidv4 } from 'uuid';

export class ContentService {
  async loadDraft(): Promise<DraftContent> {
    const draft = await fileStorageService.loadDraft();
    if (!draft) {
      // Initialize with empty draft
      const emptyDraft: DraftContent = {
        properties: [],
        rooms: [],
        places: [],
        offers: [],
        promoCodes: [],
        referrers: [],
        landing: {
          hero: {
            title: 'Welcome to Wayanad Nature Resorts',
            subtitle: 'Experience luxury in the lap of nature',
            backgroundImage: '',
            ctaText: 'Explore Properties',
            ctaLink: '/#featured',
          },
          usps: [],
          testimonials: [],
          faqs: [],
          seo: {
            title: 'Wayanad Nature Resorts - Luxury Treehouses & Resorts',
            description: 'Experience luxury in our premium treehouses and resorts in Wayanad, Kerala',
          },
        },
        settings: await fileStorageService.loadSettings() || {
          phones: ['+91 98765 43210'],
          whatsapp: '+919876543210',
          email: 'info@wayanadresorts.com',
          address: 'Wayanad, Kerala, India',
          legal: {
            privacy: '/privacy',
            terms: '/terms',
            cancellation: '/cancellation',
          },
          booking: {
            sla: 'We respond within 24 hours',
            paymentMethods: ['Credit Card', 'Debit Card', 'UPI'],
            cancellationPolicy: 'Free cancellation up to 48 hours before check-in',
          },
          featureFlags: {
            enableReferrals: false,
            enablePromos: false,
            enableI18n: false,
            enableAnalytics: false,
            enableVideo: false,
          },
          maxDiscountCapPercent: 25,
          currency: {
            code: 'INR',
            symbol: '₹',
            locale: 'en-IN',
          },
          updatedAt: new Date().toISOString(),
        },
      };
      await this.saveDraft(emptyDraft);
      return emptyDraft;
    }
    return draft;
  }

  async saveDraft(draft: DraftContent): Promise<void> {
    await fileStorageService.saveDraft(draft);
  }

  // Property CRUD
  async createProperty(property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> {
    const draft = await this.loadDraft();
    const newProperty: Property = {
      ...property,
      id: uuidv4(),
      slug: await this.generateUniqueSlug(property.name, draft.properties.map(p => p.slug)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    draft.properties.push(newProperty);
    await this.saveDraft(draft);
    return newProperty;
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    const draft = await this.loadDraft();
    const index = draft.properties.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Property not found');

    // Update slug if name changed
    if (updates.name && updates.name !== draft.properties[index].name) {
      updates.slug = await this.generateUniqueSlug(updates.name, draft.properties.map(p => p.slug));
    }

    draft.properties[index] = { ...draft.properties[index], ...updates, updatedAt: new Date().toISOString() };
    await this.saveDraft(draft);
    return draft.properties[index];
  }

  async deleteProperty(id: string): Promise<void> {
    const draft = await this.loadDraft();
    // Check if property has rooms
    const hasRooms = draft.rooms.some(r => r.propertyId === id);
    if (hasRooms) {
      throw new Error('Cannot delete property: it has associated rooms');
    }

    draft.properties = draft.properties.filter(p => p.id !== id);
    // Also delete related places
    draft.places = draft.places.filter(p => p.propertyId !== id);
    await this.saveDraft(draft);
  }

  // Room CRUD
  async createRoom(room: Omit<RoomType, 'id' | 'createdAt' | 'updatedAt'>): Promise<RoomType> {
    const draft = await this.loadDraft();
    const newRoom: RoomType = {
      ...room,
      id: uuidv4(),
      slug: await this.generateUniqueSlug(room.name, draft.rooms.filter(r => r.propertyId === room.propertyId).map(r => r.slug)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    draft.rooms.push(newRoom);
    await this.saveDraft(draft);
    return newRoom;
  }

  async updateRoom(id: string, updates: Partial<RoomType>): Promise<RoomType> {
    const draft = await this.loadDraft();
    const index = draft.rooms.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Room not found');

    // Update slug if name changed
    if (updates.name && updates.name !== draft.rooms[index].name) {
      const propertyId = draft.rooms[index].propertyId;
      updates.slug = await this.generateUniqueSlug(
        updates.name,
        draft.rooms.filter(r => r.propertyId === propertyId).map(r => r.slug)
      );
    }

    draft.rooms[index] = { ...draft.rooms[index], ...updates, updatedAt: new Date().toISOString() };
    await this.saveDraft(draft);
    return draft.rooms[index];
  }

  async deleteRoom(id: string): Promise<void> {
    const draft = await this.loadDraft();
    draft.rooms = draft.rooms.filter(r => r.id !== id);
    await this.saveDraft(draft);
  }

  // Place CRUD
  async createPlace(place: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>): Promise<Place> {
    const draft = await this.loadDraft();
    const newPlace: Place = {
      ...place,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    draft.places.push(newPlace);
    await this.saveDraft(draft);
    return newPlace;
  }

  async updatePlace(id: string, updates: Partial<Place>): Promise<Place> {
    const draft = await this.loadDraft();
    const index = draft.places.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Place not found');

    draft.places[index] = { ...draft.places[index], ...updates, updatedAt: new Date().toISOString() };
    await this.saveDraft(draft);
    return draft.places[index];
  }

  async deletePlace(id: string): Promise<void> {
    const draft = await this.loadDraft();
    draft.places = draft.places.filter(p => p.id !== id);
    await this.saveDraft(draft);
  }

  // Offer CRUD
  async createOffer(offer: Omit<Offer, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<Offer> {
    const draft = await this.loadDraft();
    const newOffer: Offer = {
      ...offer,
      id: uuidv4(),
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    draft.offers.push(newOffer);
    await this.saveDraft(draft);
    return newOffer;
  }

  async updateOffer(id: string, updates: Partial<Offer>): Promise<Offer> {
    const draft = await this.loadDraft();
    const index = draft.offers.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Offer not found');

    draft.offers[index] = { ...draft.offers[index], ...updates, updatedAt: new Date().toISOString() };
    await this.saveDraft(draft);
    return draft.offers[index];
  }

  async deleteOffer(id: string): Promise<void> {
    const draft = await this.loadDraft();
    draft.offers = draft.offers.filter(o => o.id !== id);
    await this.saveDraft(draft);
  }

  // Promo Code CRUD
  async createPromoCode(promo: Omit<PromoCode, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<PromoCode> {
    const draft = await this.loadDraft();
    const newPromo: PromoCode = {
      ...promo,
      id: uuidv4(),
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    draft.promoCodes.push(newPromo);
    await this.saveDraft(draft);
    return newPromo;
  }

  async updatePromoCode(id: string, updates: Partial<PromoCode>): Promise<PromoCode> {
    const draft = await this.loadDraft();
    const index = draft.promoCodes.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Promo code not found');

    // Ensure code remains unique
    if (updates.code && updates.code !== draft.promoCodes[index].code) {
      const codeExists = draft.promoCodes.some(p => p.id !== id && p.code === updates.code);
      if (codeExists) {
        throw new Error('Promo code already exists');
      }
    }

    draft.promoCodes[index] = { ...draft.promoCodes[index], ...updates, updatedAt: new Date().toISOString() };
    await this.saveDraft(draft);
    return draft.promoCodes[index];
  }

  async deletePromoCode(id: string): Promise<void> {
    const draft = await this.loadDraft();
    draft.promoCodes = draft.promoCodes.filter(p => p.id !== id);
    await this.saveDraft(draft);
  }

  // Referrer CRUD
  async createReferrer(referrer: Omit<Referrer, 'id' | 'createdAt' | 'updatedAt' | 'totals'>): Promise<Referrer> {
    const draft = await this.loadDraft();
    const newReferrer: Referrer = {
      ...referrer,
      id: uuidv4(),
      totals: {
        attributions: 0,
        confirmed: 0,
        pending: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Ensure code is unique
    const codeExists = draft.referrers.some(r => r.code === newReferrer.code);
    if (codeExists) {
      throw new Error('Referrer code already exists');
    }

    draft.referrers.push(newReferrer);
    await this.saveDraft(draft);
    return newReferrer;
  }

  async updateReferrer(id: string, updates: Partial<Referrer>): Promise<Referrer> {
    const draft = await this.loadDraft();
    const index = draft.referrers.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Referrer not found');

    // Ensure code remains unique
    if (updates.code && updates.code !== draft.referrers[index].code) {
      const codeExists = draft.referrers.some(r => r.id !== id && r.code === updates.code);
      if (codeExists) {
        throw new Error('Referrer code already exists');
      }
    }

    draft.referrers[index] = { ...draft.referrers[index], ...updates, updatedAt: new Date().toISOString() };
    await this.saveDraft(draft);
    return draft.referrers[index];
  }

  async deleteReferrer(id: string): Promise<void> {
    const draft = await this.loadDraft();
    draft.referrers = draft.referrers.filter(r => r.id !== id);
    await this.saveDraft(draft);
  }

  // Settings
  async updateSettings(settings: any): Promise<void> {
    const draft = await this.loadDraft();
    draft.settings = { ...draft.settings, ...settings, updatedAt: new Date().toISOString() };
    await this.saveDraft(draft);
  }

  // Landing Content
  async updateLandingContent(landing: any): Promise<void> {
    const draft = await this.loadDraft();
    draft.landing = { ...draft.landing, ...landing };
    await this.saveDraft(draft);
  }

  // Validation helpers
  async validateProperty(property: Partial<Property>): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!property.name) errors.push('Name is required');
    if (!property.slug) errors.push('Slug is required');
    if (!property.description) errors.push('Description is required');
    if (!property.address) errors.push('Address is required');
    if (!property.heroImage) errors.push('Hero image is required');
    if (!property.amenities || property.amenities.length === 0) errors.push('At least one amenity is required');

    return { valid: errors.length === 0, errors };
  }

  async validateRoom(room: Partial<RoomType>): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!room.name) errors.push('Name is required');
    if (!room.slug) errors.push('Slug is required');
    if (!room.capacity || room.capacity < 1) errors.push('Valid capacity is required');
    if (!room.baseRateBand) errors.push('Base rate band is required');
    if (!room.description) errors.push('Description is required');

    return { valid: errors.length === 0, errors };
  }

  private async generateUniqueSlug(name: string, existingSlugs: string[]): Promise<string> {
    let slug = generateSlug(name);
    let counter = 1;

    while (existingSlugs.includes(slug)) {
      slug = `${generateSlug(name)}-${counter}`;
      counter++;
    }

    return slug;
  }
}

export const contentService = new ContentService();