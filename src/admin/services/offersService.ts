import { databaseService } from './databaseService';
import { type Offer, type PromoCode, type OfferType, type OfferStatus } from '../types/entities';

export interface OfferFilters {
  type?: OfferType;
  status?: OfferStatus;
  validFrom?: string;
  validTo?: string;
  search?: string;
}

export interface OfferStats {
  total: number;
  active: number;
  expired: number;
  draft: number;
  scheduled: number;
  byType: Record<OfferType, number>;
}

export class OffersService {
  async loadOffers(filters?: OfferFilters): Promise<Offer[]> {
    try {
      let offers = await databaseService.getAll<Offer>('offers');

      // Apply filters
      if (filters) {
        if (filters.type) {
          offers = offers.filter(o => o.type === filters.type);
        }
        if (filters.status) {
          offers = offers.filter(o => o.status === filters.status);
        }
        if (filters.validFrom) {
          offers = offers.filter(o => o.validFrom >= filters.validFrom!);
        }
        if (filters.validTo) {
          offers = offers.filter(o => o.validTo <= filters.validTo!);
        }
        if (filters.search) {
          const search = filters.search.toLowerCase();
          offers = offers.filter(o =>
            o.name.toLowerCase().includes(search) ||
            o.description.toLowerCase().includes(search) ||
            o.code?.toLowerCase().includes(search)
          );
        }
      }

      // Sort by creation date (newest first)
      return offers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Failed to load offers:', error);
      throw new Error('Failed to load offers');
    }
  }

  async getOffer(id: string): Promise<Offer | null> {
    try {
      return await databaseService.read<Offer>('offers', id) || null;
    } catch (error) {
      console.error('Failed to get offer:', error);
      throw new Error('Failed to get offer');
    }
  }

  async createOffer(offer: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const newOffer: Offer = {
        ...offer,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return await databaseService.create('offers', newOffer);
    } catch (error) {
      console.error('Failed to create offer:', error);
      throw new Error('Failed to create offer');
    }
  }

  async updateOffer(id: string, updates: Partial<Offer>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await databaseService.update('offers', id, updateData);
    } catch (error) {
      console.error('Failed to update offer:', error);
      throw new Error('Failed to update offer');
    }
  }

  async deleteOffer(id: string): Promise<void> {
    try {
      await databaseService.delete('offers', id);
    } catch (error) {
      console.error('Failed to delete offer:', error);
      throw new Error('Failed to delete offer');
    }
  }

  async duplicateOffer(id: string): Promise<string> {
    try {
      const original = await this.getOffer(id);
      if (!original) {
        throw new Error('Offer not found');
      }

      const duplicate: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'> = {
        ...original,
        name: `${original.name} (Copy)`,
        code: original.code ? `${original.code}-COPY` : undefined,
        status: 'DRAFT',
        usageCount: 0,
        maxUsage: original.maxUsage
      };

      return await this.createOffer(duplicate);
    } catch (error) {
      console.error('Failed to duplicate offer:', error);
      throw new Error('Failed to duplicate offer');
    }
  }

  async getOfferStats(): Promise<OfferStats> {
    try {
      const offers = await this.loadOffers();
      const now = new Date();

      const stats: OfferStats = {
        total: offers.length,
        active: 0,
        expired: 0,
        draft: 0,
        scheduled: 0,
        byType: {
          PERCENTAGE: 0,
          FIXED_AMOUNT: 0,
          FREE_NIGHTS: 0,
          PACKAGE_DEAL: 0
        }
      };

      offers.forEach(offer => {
        // Count by type
        stats.byType[offer.type]++;

        // Count by status
        if (offer.status === 'DRAFT') {
          stats.draft++;
        } else if (offer.status === 'ACTIVE') {
          if (new Date(offer.validTo) < now) {
            stats.expired++;
          } else {
            stats.active++;
          }
        } else if (offer.status === 'EXPIRED') {
          stats.expired++;
        } else if (offer.status === 'SCHEDULED') {
          stats.scheduled++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Failed to get offer stats:', error);
      throw new Error('Failed to get offer stats');
    }
  }

  async validateOfferCode(code: string): Promise<boolean> {
    try {
      const offers = await this.loadOffers();
      const existing = offers.find(o => o.code === code && o.status !== 'DELETED');
      return !existing;
    } catch (error) {
      console.error('Failed to validate offer code:', error);
      throw new Error('Failed to validate offer code');
    }
  }

  // Promo Code methods
  async loadPromoCodes(offerId?: string): Promise<PromoCode[]> {
    try {
      let promoCodes = await databaseService.getAll<PromoCode>('promoCodes');

      if (offerId) {
        promoCodes = promoCodes.filter(pc => pc.offerId === offerId);
      }

      return promoCodes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Failed to load promo codes:', error);
      throw new Error('Failed to load promo codes');
    }
  }

  async createPromoCode(promoCode: Omit<PromoCode, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const newPromoCode: PromoCode = {
        ...promoCode,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return await databaseService.create('promoCodes', newPromoCode);
    } catch (error) {
      console.error('Failed to create promo code:', error);
      throw new Error('Failed to create promo code');
    }
  }

  async updatePromoCode(id: string, updates: Partial<PromoCode>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await databaseService.update('promoCodes', id, updateData);
    } catch (error) {
      console.error('Failed to update promo code:', error);
      throw new Error('Failed to update promo code');
    }
  }

  async deletePromoCode(id: string): Promise<void> {
    try {
      await databaseService.delete('promoCodes', id);
    } catch (error) {
      console.error('Failed to delete promo code:', error);
      throw new Error('Failed to delete promo code');
    }
  }

  async generatePromoCode(offerId: string, prefix: string = '', length: number = 8): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = prefix;

    while (code.length < length) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Ensure uniqueness
    const isValid = await this.validatePromoCode(code);
    if (!isValid) {
      // If code exists, generate a new one with random suffix
      return this.generatePromoCode(offerId, prefix, length + 2);
    }

    return code;
  }

  private async validatePromoCode(code: string): Promise<boolean> {
    try {
      const promoCodes = await this.loadPromoCodes();
      const existing = promoCodes.find(pc => pc.code === code && pc.status !== 'DELETED');
      return !existing;
    } catch (error) {
      console.error('Failed to validate promo code:', error);
      return false;
    }
  }

  // Export methods
  async exportOffers(format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const offers = await this.loadOffers();

      if (format === 'json') {
        return JSON.stringify(offers, null, 2);
      } else {
        // CSV format
        const headers = [
          'ID', 'Name', 'Type', 'Status', 'Code', 'Value',
          'Valid From', 'Valid To', 'Usage Count', 'Max Usage'
        ];

        const rows = offers.map(offer => [
          offer.id,
          `"${offer.name}"`,
          offer.type,
          offer.status,
          offer.code || '',
          offer.value,
          offer.validFrom,
          offer.validTo,
          offer.usageCount,
          offer.maxUsage || ''
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
      }
    } catch (error) {
      console.error('Failed to export offers:', error);
      throw new Error('Failed to export offers');
    }
  }

  // Bulk promo code generation
  async generateBulkPromoCodes(offerId: string, options: {
    prefix?: string;
    length?: number;
    quantity?: number;
  } = {}): Promise<PromoCode[]> {
    const {
      prefix = 'WN',
      length = 8,
      quantity = 1
    } = options;

    const promoCodes: PromoCode[] = [];

    for (let i = 0; i < quantity; i++) {
      // Generate random code
      const randomPart = Math.random().toString(36).substring(2, length + 2).toUpperCase();
      const code = `${prefix}${randomPart}`;

      const promoCode: PromoCode = {
        id: crypto.randomUUID(),
        offerId,
        code,
        status: 'ACTIVE',
        usageCount: 0,
        maxUsage: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      promoCodes.push(promoCode);
    }

    // Save all promo codes
    for (const promoCode of promoCodes) {
      await databaseService.create('promoCodes', promoCode);
    }

    return promoCodes;
  }

  // Bulk generate promo codes with validation
  async bulkGeneratePromoCodes(offerId: string, request: {
    codes: string[];
    maxUsage?: number;
  }): Promise<{ success: string[]; errors: { code: string; error: string }[] }> {
    const success: string[] = [];
    const errors: { code: string; error: string }[] = [];

    // Get existing promo codes to check for duplicates
    const existingPromoCodes = await this.loadPromoCodes(offerId);
    const existingCodes = new Set(existingPromoCodes.map(pc => pc.code));

    for (const code of request.codes) {
      // Validate code format
      if (!/^[A-Z0-9-_]+$/.test(code)) {
        errors.push({ code, error: 'Invalid code format. Use only uppercase letters, numbers, hyphens, and underscores' });
        continue;
      }

      // Check for duplicates
      if (existingCodes.has(code)) {
        errors.push({ code, error: 'Code already exists' });
        continue;
      }

      // Create promo code
      try {
        const promoCode: PromoCode = {
          id: crypto.randomUUID(),
          offerId,
          code,
          status: 'ACTIVE',
          usageCount: 0,
          maxUsage: request.maxUsage || 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await databaseService.create('promoCodes', promoCode);
        success.push(code);
        existingCodes.add(code);
      } catch (error) {
        errors.push({ code, error: 'Failed to create promo code' });
      }
    }

    return { success, errors };
  }

  // Offer lifecycle management
  async activateOffer(offerId: string): Promise<void> {
    const offer = await this.getOffer(offerId);
    if (!offer) {
      throw new Error('Offer not found');
    }

    // Check if offer is valid for activation
    const now = new Date();
    if (new Date(offer.validTo) < now) {
      throw new Error('Cannot activate expired offer');
    }

    await this.updateOffer(offerId, { status: 'ACTIVE' });
  }

  async deactivateOffer(offerId: string): Promise<void> {
    const offer = await this.getOffer(offerId);
    if (!offer) {
      throw new Error('Offer not found');
    }

    await this.updateOffer(offerId, { status: 'DRAFT' });
  }

  async expireOffer(offerId: string): Promise<void> {
    await this.updateOffer(offerId, { status: 'EXPIRED' });
  }

  // Check for conflicting offers
  async checkOfferConflicts(offer: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>, excludeId?: string): Promise<{
    hasConflicts: boolean;
    conflicts: Array<{
      offer: Offer;
      type: 'DATE_OVERLAP' | 'CODE_CONFLICT';
    }>;
  }> {
    const conflicts: Array<{
      offer: Offer;
      type: 'DATE_OVERLAP' | 'CODE_CONFLICT';
    }> = [];

    const offers = await this.loadOffers();

    for (const existingOffer of offers) {
      if (excludeId && existingOffer.id === excludeId) {
        continue;
      }

      // Check for date overlap
      const newStart = new Date(offer.validFrom);
      const newEnd = new Date(offer.validTo);
      const existingStart = new Date(existingOffer.validFrom);
      const existingEnd = new Date(existingOffer.validTo);

      if (
        existingOffer.status === 'ACTIVE' &&
        newStart <= existingEnd &&
        newEnd >= existingStart
      ) {
        conflicts.push({
          offer: existingOffer,
          type: 'DATE_OVERLAP'
        });
      }

      // Check for code conflict
      if (offer.code && existingOffer.code === offer.code) {
        conflicts.push({
          offer: existingOffer,
          type: 'CODE_CONFLICT'
        });
      }
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts
    };
  }
}

export const offersService = new OffersService();