import { type Enquiry } from '../types/entities';
import { OfflineQueueService } from './offlineQueueService';
import { fileStorageService } from './fileStorage';

export class EnquiriesService {
  async loadEnquiries(): Promise<Enquiry[]> {
    return await fileStorageService.loadEnquiries() || [];
  }

  async saveEnquiries(enquiries: Enquiry[]): Promise<void> {
    await fileStorageService.saveEnquiries(enquiries);
  }

  async createEnquiry(enquiry: Omit<Enquiry, 'id' | 'refCode' | 'createdAt' | 'updatedAt' | 'timeline'>): Promise<Enquiry> {
    const enquiries = await this.loadEnquiries();

    // Generate refCode in format ENQ-YYYY-NNNN
    const year = new Date().getFullYear();
    const yearEnquiries = enquiries.filter(e => (e.refCode || '').startsWith(`ENQ-${year}`));
    const sequence = String(yearEnquiries.length + 1).padStart(4, '0');
    const refCode = `ENQ-${year}-${sequence}`;

    const newEnquiry: Enquiry = {
      ...enquiry,
      id: Date.now().toString(),
      refCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [{
        id: '1',
        timestamp: new Date().toISOString(),
        status: 'New',
        notes: 'Enquiry received',
        by: 'System'
      }]
    };

    enquiries.push(newEnquiry);
    await this.saveEnquiries(enquiries);
    return newEnquiry;
  }

  async updateEnquiry(id: string, updates: Partial<Enquiry>): Promise<Enquiry> {
    const enquiries = await this.loadEnquiries();
    const index = enquiries.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Enquiry not found');

    const oldStatus = enquiries[index].status;
    const newStatus = updates.status;

    // Add timeline entry if status changed
    if (newStatus && newStatus !== oldStatus) {
      const timelineEntry: EnquiryTimeline = {
        id: String(enquiries[index].timeline.length + 1),
        timestamp: new Date().toISOString(),
        status: newStatus,
        notes: updates.notes || `Status updated to ${newStatus}`,
        by: updates.updatedBy || 'Admin'
      };
      updates.timeline = [...enquiries[index].timeline, timelineEntry];
    }

    enquiries[index] = { ...enquiries[index], ...updates, updatedAt: new Date().toISOString() };
    await this.saveEnquiries(enquiries);
    return enquiries[index];
  }

  async deleteEnquiry(id: string): Promise<void> {
    const enquiries = await this.loadEnquiries();
    const index = enquiries.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Enquiry not found');

    enquiries.splice(index, 1);
    await this.saveEnquiries(enquiries);
  }

  async getEnquiriesByStatus(status: EnquiryStatus): Promise<Enquiry[]> {
    const enquiries = await this.loadEnquiries();
    return enquiries.filter(e => e.status === status);
  }

  async getEnquiriesByDateRange(startDate: Date, endDate: Date): Promise<Enquiry[]> {
    const enquiries = await this.loadEnquiries();
    return enquiries.filter(e => {
      const created = new Date(e.createdAt);
      return created >= startDate && created <= endDate;
    });
  }

  async getEnquiryStats(): Promise<{
    total: number;
    byStatus: Record<EnquiryStatus, number>;
    byMonth: { month: string; count: number }[];
  }> {
    const enquiries = await this.loadEnquiries();

    const byStatus = {
      NEW: 0,
      CONTACTED: 0,
      CONFIRMED: 0,
      DECLINED: 0,
      CANCELLED: 0
    } as Record<EnquiryStatus, number>;

    const byMonth: { [key: string]: number } = {};

    enquiries.forEach(enquiry => {
      // Count by status
      byStatus[enquiry.status]++;

      // Count by month
      const month = new Date(enquiry.createdAt).toISOString().substring(0, 7);
      byMonth[month] = (byMonth[month] || 0) + 1;
    });

    const sortedMonths = Object.entries(byMonth)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      total: enquiries.length,
      byStatus,
      byMonth: sortedMonths
    };
  }

  async searchEnquiries(query: string): Promise<Enquiry[]> {
    const enquiries = await this.loadEnquiries();
    const lowerQuery = query.toLowerCase();

    return enquiries.filter(e =>
      (e.refCode || '').toLowerCase().includes(lowerQuery) ||
      (e.fullName || e.name || '').toLowerCase().includes(lowerQuery) ||
      (e.email && e.email.toLowerCase().includes(lowerQuery)) ||
      e.phone.toLowerCase().includes(lowerQuery) ||
      (e.propertyId || e.propertyName || '').toLowerCase().includes(lowerQuery) ||
      (e.notes && e.notes.toLowerCase().includes(lowerQuery))
    );
  }

  // Timeline management with offline support
  async addTimelineEvent(
    enquiryId: string,
    event: {
      action: string;
      notes: string;
      by?: string;
      status?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    const offlineQueue = OfflineQueueService.getInstance();
    const eventId = await offlineQueue.addTimelineEvent(enquiryId, {
      ...event,
      by: event.by || 'Local Admin'
    });

    // For immediate UI feedback, update the enquiry locally
    try {
      const enquiries = await this.loadEnquiries();
      const index = enquiries.findIndex(e => e.id === enquiryId);
      if (index !== -1) {
        const timelineEntry: EnquiryTimeline = {
          id: `event_${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: event.status || event.action,
          notes: event.notes,
          by: event.by || 'Local Admin'
        };
        enquiries[index].timeline.push(timelineEntry);
        enquiries[index].updatedAt = new Date().toISOString();
        await this.saveEnquiries(enquiries);
      }
    } catch (error) {
      console.error('Failed to update local timeline:', error);
    }

    console.log(`Timeline event queued: ${eventId}`);
  }

  // Quick action methods
  async logWhatsAppAction(enquiryId: string, phone: string): Promise<void> {
    await this.addTimelineEvent(enquiryId, {
      action: 'WhatsApp',
      notes: `Initiated WhatsApp chat to ${phone}`,
      by: 'Admin',
      metadata: {
        method: 'whatsapp',
        phone,
        url: `https://wa.me/${phone.replace(/\D/g, '')}`
      }
    });
  }

  async logEmailAction(enquiryId: string, email: string): Promise<void> {
    await this.addTimelineEvent(enquiryId, {
      action: 'Email',
      notes: `Sent email to ${email}`,
      by: 'Admin',
      metadata: {
        method: 'email',
        email
      }
    });
  }

  async logCallAction(enquiryId: string, phone: string): Promise<void> {
    await this.addTimelineEvent(enquiryId, {
      action: 'Call',
      notes: `Called ${phone}`,
      by: 'Admin',
      metadata: {
        method: 'call',
        phone
      }
    });
  }

  async updateEnquiryStatus(
    enquiryId: string,
    newStatus: 'NEW' | 'CONTACTED' | 'FOLLOW_UP' | 'CONFIRMED' | 'DECLINED' | 'CANCELLED',
    notes?: string
  ): Promise<void> {
    const enquiries = await this.loadEnquiries();
    const index = enquiries.findIndex(e => e.id === enquiryId);

    if (index === -1) throw new Error('Enquiry not found');

    const enquiry = enquiries[index];
    const oldStatus = enquiry.status;

    // Update status
    enquiry.status = newStatus;
    enquiry.updatedAt = new Date().toISOString();

    // Add timeline event
    const timelineEvent = {
      action: 'Status Update',
      notes: notes || `Status changed from ${oldStatus} to ${newStatus}`,
      status: newStatus,
      metadata: {
        oldStatus,
        newStatus
      }
    };

    await this.addTimelineEvent(enquiryId, timelineEvent);

    // Save the enquiry
    enquiries[index] = enquiry;
    await this.saveEnquiries(enquiries);
  }

  async getOfflineQueueStatus() {
    const offlineQueue = OfflineQueueService.getInstance();
    return offlineQueue.getQueueStatus();
  }
}

export const enquiriesService = new EnquiriesService();