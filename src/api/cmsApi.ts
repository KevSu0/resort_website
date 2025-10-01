import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { auditService } from '../services/auditService';
import { logger } from '../lib/logger';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]:
    | string
    | number
    | boolean
    | Date
    | { operator: string; value: unknown }
    | undefined
    | null;
}

export interface WebhookPayload {
  event: string;
  data: WebhookData;
  timestamp: Timestamp;
  userId: string;
  resourceId?: string;
}

/**
 * Webhook data interface
 */
export interface WebhookData {
  collection: string;
  documentId?: string;
  data?: unknown;
  previousData?: unknown;
  deletedData?: unknown;
  hard?: boolean;
  userId: string;
}

class CmsApi {
  private readonly API_VERSION = 'v1';
  private readonly DEFAULT_PAGE_SIZE = 20;
  private readonly MAX_PAGE_SIZE = 100;

  // Generic CRUD operations

  async getAll<T>(
    collectionName: string,
    pagination: PaginationParams = {},
    filters: FilterParams = {}
  ): Promise<ApiResponse<T[]>> {
    try {
      const {
        page = 1,
        limit: pageSize = this.DEFAULT_PAGE_SIZE,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = pagination;

      const actualLimit = Math.min(pageSize, this.MAX_PAGE_SIZE);
      const offset = (page - 1) * actualLimit;

      let q = collection(db, collectionName);
      const constraints = [];

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (value instanceof Date) {
            constraints.push(where(key, '>=', Timestamp.fromDate(value)));
          } else if (typeof value === 'object' && value.operator) {
            constraints.push(where(key, value.operator, value.value));
          } else {
            constraints.push(where(key, '==', value));
          }
        }
      });

      // Apply sorting
      if (sortBy) {
        constraints.push(orderBy(sortBy, sortOrder));
      }

      // Apply pagination
      constraints.push(limit(actualLimit));
      if (offset > 0) {
        // Note: startAfter requires a document snapshot
        // In a real implementation, you would need to handle this properly
        // For now, we'll keep it simple
      }

      q = query(q, ...constraints);

      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];

      // Get total count for pagination (simplified)
      const countQuery = query(collection(db, collectionName));
      const countSnapshot = await getDocs(countQuery);
      const totalItems = countSnapshot.size;

      const totalPages = Math.ceil(totalItems / actualLimit);

      return {
        success: true,
        data: documents,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: actualLimit
        }
      };
    } catch (error) {
      logger.logApiError(
        error instanceof Error ? error : new Error(String(error)),
        'GETALL',
        collectionName,
        { module: 'CmsApi', function: 'getAll', collectionName, pagination, filters }
      );
      return {
        success: false,
        error: `Failed to fetch ${collectionName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async getById<T>(collectionName: string, id: string): Promise<ApiResponse<T>> {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          success: true,
          data: { id: docSnap.id, ...docSnap.data() } as T
        };
      } else {
        return {
          success: false,
          error: `Document with ID ${id} not found in ${collectionName}`
        };
      }
    } catch (error) {
      logger.logApiError(
        error instanceof Error ? error : new Error(String(error)),
        'GETBYID',
        `${collectionName}/${id}`,
        { module: 'CmsApi', function: 'getById', collectionName, id }
      );
      return {
        success: false,
        error: `Failed to fetch ${collectionName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async create<T>(
    collectionName: string,
    data: Partial<T>,
    userId: string,
    options: {
      audit?: boolean;
      timestamps?: boolean;
    } = {}
  ): Promise<ApiResponse<T>> {
    try {
      const { audit = true, timestamps = true } = options;

      const docData = {
        ...data,
        ...(timestamps && {
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      };

      const docRef = await addDoc(collection(db, collectionName), docData);
      const newDoc = { id: docRef.id, ...docData } as T;

      // Log audit entry
      if (audit) {
        await auditService.logDataChange(
          userId,
          'CREATE',
          collectionName,
          docRef.id,
          null,
          data
        );
      }

      // Trigger webhook
      await this.triggerWebhook('create', {
        collection: collectionName,
        documentId: docRef.id,
        data: newDoc,
        userId
      });

      return {
        success: true,
        data: newDoc,
        message: `${collectionName.slice(0, -1)} created successfully`
      };
    } catch (error) {
      logger.logApiError(
        error instanceof Error ? error : new Error(String(error)),
        'CREATE',
        collectionName,
        { module: 'CmsApi', function: 'create', collectionName, userId, data }
      );
      return {
        success: false,
        error: `Failed to create ${collectionName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async update<T>(
    collectionName: string,
    id: string,
    data: Partial<T>,
    userId: string,
    options: {
      audit?: boolean;
      timestamps?: boolean;
    } = {}
  ): Promise<ApiResponse<T>> {
    try {
      const { audit = true, timestamps = true } = options;

      // Get current document for audit
      let currentDoc: Record<string, unknown> | null = null;
      if (audit) {
        const currentDocRef = doc(db, collectionName, id);
        const currentDocSnap = await getDoc(currentDocRef);
        if (currentDocSnap.exists()) {
          currentDoc = { id: currentDocSnap.id, ...currentDocSnap.data() };
        }
      }

      const docRef = doc(db, collectionName, id);
      const updateData = {
        ...data,
        ...(timestamps && { updatedAt: serverTimestamp() })
      };

      await updateDoc(docRef, updateData);
      const updatedDoc = { id, ...updateData } as T;

      // Log audit entry
      if (audit && currentDoc) {
        await auditService.logDataChange(
          userId,
          'UPDATE',
          collectionName,
          id,
          currentDoc,
          updatedDoc
        );
      }

      // Trigger webhook
      await this.triggerWebhook('update', {
        collection: collectionName,
        documentId: id,
        data: updatedDoc,
        previousData: currentDoc,
        userId
      });

      return {
        success: true,
        data: updatedDoc,
        message: `${collectionName.slice(0, -1)} updated successfully`
      };
    } catch (error) {
      logger.logApiError(
        error instanceof Error ? error : new Error(String(error)),
        'UPDATE',
        `${collectionName}/${id}`,
        { module: 'CmsApi', function: 'update', collectionName, id, userId, data }
      );
      return {
        success: false,
        error: `Failed to update ${collectionName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async delete(
    collectionName: string,
    id: string,
    userId: string,
    options: {
      audit?: boolean;
      hard?: boolean;
    } = {}
  ): Promise<ApiResponse> {
    try {
      const { audit = true, hard = false } = options;

      // Get current document for audit
      let currentDoc: Record<string, unknown> | null = null;
      if (audit) {
        const currentDocRef = doc(db, collectionName, id);
        const currentDocSnap = await getDoc(currentDocRef);
        if (currentDocSnap.exists()) {
          currentDoc = { id: currentDocSnap.id, ...currentDocSnap.data() };
        }
      }

      const docRef = doc(db, collectionName, id);

      if (hard) {
        await deleteDoc(docRef);
      } else {
        // Soft delete
        await updateDoc(docRef, {
          deletedAt: serverTimestamp(),
          deletedBy: userId
        });
      }

      // Log audit entry
      if (audit && currentDoc) {
        await auditService.logDataChange(
          userId,
          'DELETE',
          collectionName,
          id,
          currentDoc,
          null
        );
      }

      // Trigger webhook
      await this.triggerWebhook('delete', {
        collection: collectionName,
        documentId: id,
        deletedData: currentDoc,
        hard,
        userId
      });

      return {
        success: true,
        message: `${collectionName.slice(0, -1)} deleted successfully`
      };
    } catch (error) {
      logger.logApiError(
        error instanceof Error ? error : new Error(String(error)),
        'DELETE',
        `${collectionName}/${id}`,
        { module: 'CmsApi', function: 'delete', collectionName, id, userId, options }
      );
      return {
        success: false,
        error: `Failed to delete ${collectionName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Advanced query methods

  async search<T>(
    collectionName: string,
    searchTerm: string,
    searchFields: string[],
    pagination: PaginationParams = {}
  ): Promise<ApiResponse<T[]>> {
    try {
      // Note: Firebase doesn't support full-text search natively
      // In a real implementation, you would:
      // 1. Use Algolia or another search service
      // 2. Or implement a server-side search function
      // For now, we'll do a simple client-side search

      const allDocsResponse = await this.getAll<T>(collectionName, { limit: 1000 });

      if (!allDocsResponse.success || !allDocsResponse.data) {
        return allDocsResponse;
      }

      const searchResults = allDocsResponse.data.filter((doc: Record<string, unknown>) =>
        searchFields.some(field => {
          const value = doc[field];
          return value &&
                 typeof value === 'string' &&
                 value.toLowerCase().includes(searchTerm.toLowerCase());
        })
      );

      // Apply pagination to search results
      const { page = 1, limit: pageSize = this.DEFAULT_PAGE_SIZE } = pagination;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedResults = searchResults.slice(startIndex, endIndex);

      return {
        success: true,
        data: paginatedResults,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(searchResults.length / pageSize),
          totalItems: searchResults.length,
          itemsPerPage: pageSize
        }
      };
    } catch (error) {
      logger.logApiError(
        error instanceof Error ? error : new Error(String(error)),
        'SEARCH',
        collectionName,
        { module: 'CmsApi', function: 'search', collectionName, searchTerm, searchFields, pagination }
      );
      return {
        success: false,
        error: `Failed to search ${collectionName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Webhook management

  private async triggerWebhook(event: string, payload: WebhookData): Promise<void> {
    try {
      // In a real implementation, you would:
      // 1. Get registered webhook URLs from database
      // 2. Send HTTP POST requests to those URLs
      // 3. Handle retries and failures
      logger.info(`Triggering webhook for event: ${event}`, {
        module: 'CmsApi',
        function: 'triggerWebhook',
        event,
        payload,
        category: 'webhook'
      });

      // Placeholder for webhook implementation
      const webhookPayload: WebhookPayload = {
        event,
        data: payload,
        timestamp: Timestamp.now(),
        userId: payload.userId,
        resourceId: payload.documentId
      };

      // Log webhook payload for debugging
      logger.debug('Webhook payload prepared:', { webhookPayload });

      // Send to webhook URLs (implementation would go here)
    } catch (error) {
      logger.logApiError(
        error instanceof Error ? error : new Error(String(error)),
        'WEBHOOK',
        'webhook-trigger',
        { module: 'CmsApi', function: 'triggerWebhook', event, payload }
      );
      // Don't throw here to avoid breaking the main operation
    }
  }

  // Export functionality

  async exportData(
    collectionName: string,
    format: 'json' | 'csv' = 'json',
    filters: FilterParams = {}
  ): Promise<ApiResponse<Blob>> {
    try {
      const response = await this.getAll(collectionName, { limit: 10000 }, filters);

      if (!response.success || !response.data) {
        return response as ApiResponse<Blob>;
      }

      let blob: Blob;

      if (format === 'csv') {
        const csvContent = this.convertToCSV(response.data);
        blob = new Blob([csvContent], { type: 'text/csv' });
      } else {
        const jsonContent = JSON.stringify(response.data, null, 2);
        blob = new Blob([jsonContent], { type: 'application/json' });
      }

      return {
        success: true,
        data: blob,
        message: `${collectionName} data exported successfully`
      };
    } catch (error) {
      logger.logApiError(
        error instanceof Error ? error : new Error(String(error)),
        'EXPORT',
        collectionName,
        { module: 'CmsApi', function: 'exportData', collectionName, format, filters }
      );
      return {
        success: false,
        error: `Failed to export ${collectionName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private convertToCSV(data: Record<string, unknown>[]): string {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(',')
      )
    ];

    return csvRows.join('\n');
  }

  // Analytics and reporting

  async getCollectionStats(collectionName: string): Promise<ApiResponse<{
    totalDocuments: number;
    lastUpdated: Date | null;
    fieldStats: Record<string, {
      totalCount: number;
      uniqueCount: number;
      type: string;
      hasNulls: boolean;
    }>;
  }>> {
    try {
      const response = await this.getAll(collectionName, { limit: 10000 });

      if (!response.success || !response.data) {
        return response as ApiResponse<{
          totalDocuments: number;
          lastUpdated: Date | null;
          fieldStats: Record<string, {
            totalCount: number;
            uniqueCount: number;
            type: string;
            hasNulls: boolean;
          }>;
        }>;
      }

      const stats = {
        totalDocuments: response.data.length,
        lastUpdated: null as Date | null,
        fieldStats: {} as Record<string, {
          totalCount: number;
          uniqueCount: number;
          type: string;
          hasNulls: boolean;
        }>
      };

      // Analyze fields
      if (response.data.length > 0) {
        const sampleDoc = response.data[0];
        Object.keys(sampleDoc).forEach(field => {
          const values = response.data.map((doc: Record<string, unknown>) => doc[field]).filter(v => v != null);
          stats.fieldStats[field] = {
            totalCount: values.length,
            uniqueCount: new Set(values).size,
            type: typeof values[0],
            hasNulls: values.length < response.data.length
          };
        });

        // Find last updated document
        const docsWithTimestamp = response.data.filter((doc: Record<string, unknown>) =>
          doc.updatedAt || doc.createdAt
        ) as Array<{ updatedAt?: Timestamp; createdAt?: Timestamp }>;

        if (docsWithTimestamp.length > 0) {
          const latestDoc = docsWithTimestamp.reduce((latest, doc) => {
            const docTime = (doc.updatedAt || doc.createdAt).toDate();
            const latestTime = (latest.updatedAt || latest.createdAt).toDate();
            return docTime > latestTime ? doc : latest;
          });

          stats.lastUpdated = (latestDoc.updatedAt || latestDoc.createdAt).toDate();
        }
      }

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      logger.logApiError(
        error instanceof Error ? error : new Error(String(error)),
        'STATS',
        collectionName,
        { module: 'CmsApi', function: 'getCollectionStats', collectionName }
      );
      return {
        success: false,
        error: `Failed to get stats: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

export const cmsApi = new CmsApi();
export default cmsApi;