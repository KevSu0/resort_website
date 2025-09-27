/**
 * Offline Queue Service
 *
 * Manages offline operations and ensures they are processed when online.
 * Specifically handles enquiry timeline events that need to be synced.
 */

export interface QueuedOperation {
  id: string;
  type: 'timeline_event' | 'status_update' | 'note_add';
  entityType: 'enquiry';
  entityId: string;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  status?: string;
  action: string;
  notes: string;
  by: string;
  metadata?: Record<string, any>;
}

export class OfflineQueueService {
  private static instance: OfflineQueueService;
  private queue: QueuedOperation[] = [];
  private isProcessing = false;
  private readonly QUEUE_KEY = 'offline_queue';
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 5000; // 5 seconds

  private constructor() {
    this.loadQueue();
    this.setupOnlineListener();
  }

  static getInstance(): OfflineQueueService {
    if (!OfflineQueueService.instance) {
      OfflineQueueService.instance = new OfflineQueueService();
    }
    return OfflineQueueService.instance;
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(this.QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue(): void {
    try {
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  /**
   * Setup online/offline event listeners
   */
  private setupOnlineListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.processQueue();
      });

      window.addEventListener('offline', () => {
        console.log('Application went offline - operations will be queued');
      });
    }
  }

  /**
   * Add a timeline event to the queue
   */
  async addTimelineEvent(
    enquiryId: string,
    event: Omit<TimelineEvent, 'id' | 'timestamp'>
  ): Promise<string> {
    const operation: QueuedOperation = {
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'timeline_event',
      entityType: 'enquiry',
      entityId: enquiryId,
      data: {
        ...event,
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      },
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: this.MAX_RETRIES
    };

    this.queue.push(operation);
    this.saveQueue();

    // Try to process immediately if online
    if (navigator.onLine) {
      this.processQueue();
    }

    return operation.id;
  }

  /**
   * Process the queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // Process in order
      for (let i = 0; i < this.queue.length; i++) {
        const operation = this.queue[i];

        if (navigator.onLine) {
          try {
            await this.processOperation(operation);
            // Remove successful operation
            this.queue.splice(i, 1);
            i--;
            this.saveQueue();
          } catch (error) {
            console.error(`Failed to process operation ${operation.id}:`, error);

            operation.retryCount++;
            if (operation.retryCount >= operation.maxRetries) {
              console.error(`Max retries exceeded for operation ${operation.id}`);
              // Could move to a failed queue or notify user
              this.queue.splice(i, 1);
              i--;
              this.saveQueue();
            }
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single operation
   */
  private async processOperation(operation: QueuedOperation): Promise<void> {
    switch (operation.type) {
      case 'timeline_event':
        await this.processTimelineEvent(operation);
        break;
      case 'status_update':
        await this.processStatusUpdate(operation);
        break;
      case 'note_add':
        await this.processNoteAdd(operation);
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  /**
   * Process timeline event operation
   */
  private async processTimelineEvent(operation: QueuedOperation): Promise<void> {
    // This would update the enquiry in IndexedDB
    // For now, we'll simulate success
    console.log('Processing timeline event:', operation.data);

    // In a real implementation, this would:
    // 1. Open IndexedDB transaction
    // 2. Get the enquiry
    // 3. Add the timeline event
    // 4. Save the enquiry
    // 5. Emit activity event for dashboard

    return Promise.resolve();
  }

  /**
   * Process status update operation
   */
  private async processStatusUpdate(operation: QueuedOperation): Promise<void> {
    console.log('Processing status update:', operation.data);
    return Promise.resolve();
  }

  /**
   * Process note add operation
   */
  private async processNoteAdd(operation: QueuedOperation): Promise<void> {
    console.log('Processing note add:', operation.data);
    return Promise.resolve();
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    pending: number;
    processing: boolean;
    lastSync?: Date;
  } {
    return {
      pending: this.queue.length,
      processing: this.isProcessing,
      lastSync: this.queue.length > 0 ? new Date(Math.max(...this.queue.map(op => op.timestamp))) : undefined
    };
  }

  /**
   * Clear the queue (use carefully)
   */
  clearQueue(): void {
    this.queue = [];
    this.saveQueue();
  }

  /**
   * Retry failed operations
   */
  async retryFailed(): Promise<void> {
    this.queue.forEach(op => op.retryCount = 0);
    this.saveQueue();
    await this.processQueue();
  }

  /**
   * Generate timeline events for quick actions
   */
  generateWhatsAppEvent(phone: string): TimelineEvent {
    return {
      action: 'WhatsApp',
      notes: `Initiated WhatsApp chat to ${phone}`,
      by: 'Local Admin',
      metadata: {
        method: 'whatsapp',
        phone,
        url: `https://wa.me/${phone.replace(/\D/g, '')}`
      }
    };
  }

  generateEmailEvent(email: string): TimelineEvent {
    return {
      action: 'Email',
      notes: `Sent email to ${email}`,
      by: 'Local Admin',
      metadata: {
        method: 'email',
        email
      }
    };
  }

  generateCallEvent(phone: string): TimelineEvent {
    return {
      action: 'Call',
      notes: `Called ${phone}`,
      by: 'Local Admin',
      metadata: {
        method: 'call',
        phone
      }
    };
  }
}