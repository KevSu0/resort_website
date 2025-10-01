import type {
  BrandEntity,
  SiteEntity,
  UserEntity,
  PageEntity,
  ContentBlockEntity,
  MediaEntity
} from '../database';

// Custom Timestamp interface to avoid Firebase dependency
export interface Timestamp {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Strongly typed API response
 */
export interface TypedApiResponse<T> {
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

/**
 * Pagination parameters with type safety
 */
export interface TypedPaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filter parameters with type safety
 */
export interface TypedFilterParams {
  [key: string]: 
    | string 
    | number 
    | boolean 
    | Date 
    | { operator: string; value: unknown }
    | undefined
    | null;
}

// ============================================================================
// WEBHOOK TYPES
// ============================================================================

/**
 * Strongly typed webhook payload
 */
export interface TypedWebhookPayload {
  event: string;
  data: WebhookData;
  timestamp: Timestamp;
  userId: string;
  resourceId?: string;
}

/**
 * Webhook data types
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

// ============================================================================
// DOCUMENT TYPES
// ============================================================================

/**
 * Base document interface
 */
export interface BaseDocument {
  id: string;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

/**
 * Brand document type
 */
export type BrandDocument = BaseDocument & Omit<BrandEntity, 'id' | 'createdAt' | 'updatedAt'>

/**
 * Site document type
 */
export type SiteDocument = BaseDocument & Omit<SiteEntity, 'id' | 'createdAt' | 'updatedAt'>

/**
 * User document type
 */
export type UserDocument = BaseDocument & Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>

/**
 * Page document type
 */
export type PageDocument = BaseDocument & Omit<PageEntity, 'id' | 'createdAt' | 'updatedAt'>

/**
 * Content Block document type
 */
export type ContentBlockDocument = BaseDocument & Omit<ContentBlockEntity, 'id' | 'createdAt' | 'updatedAt'>

/**
 * Media document type
 */
export type MediaDocument = BaseDocument & Omit<MediaEntity, 'id' | 'createdAt' | 'updatedAt'>

// ============================================================================
// COLLECTION TYPES
// ============================================================================

/**
 * Type-safe collection name mapping
 */
export type CollectionName = 
  | 'brands' 
  | 'sites' 
  | 'users' 
  | 'pages' 
  | 'contentBlocks' 
  | 'media'
  | 'navigation'
  | 'workflows'
  | 'auditLogs';

/**
 * Document type from collection name
 */
export type DocumentFromCollection<T extends CollectionName> = 
  T extends 'brands' ? BrandDocument :
  T extends 'sites' ? SiteDocument :
  T extends 'users' ? UserDocument :
  T extends 'pages' ? PageDocument :
  T extends 'contentBlocks' ? ContentBlockDocument :
  T extends 'media' ? MediaDocument :
  BaseDocument;

/**
 * Collection response type
 */
export type CollectionResponse<T extends CollectionName> = 
  TypedApiResponse<DocumentFromCollection<T>[]>;

/**
 * Document response type
 */
export type DocumentResponse<T extends CollectionName> = 
  TypedApiResponse<DocumentFromCollection<T>>;

// ============================================================================
// SEARCH TYPES
// ============================================================================

/**
 * Search parameters with type safety
 */
export interface SearchParams {
  searchTerm: string;
  searchFields: string[];
  pagination?: TypedPaginationParams;
}

/**
 * Search result type
 */
export interface SearchResult {
  id: string;
  [key: string]: unknown;
}

/**
 * Search response type
 */
export type SearchResponse = TypedApiResponse<SearchResult[]>;

// ============================================================================
// EXPORT TYPES
// ============================================================================

/**
 * Export format types
 */
export type ExportFormat = 'json' | 'csv';

/**
 * Export response type
 */
export type ExportResponse = TypedApiResponse<Blob>;

/**
 * Export data with type safety
 */
export interface ExportData {
  [key: string]: 
    | string 
    | number 
    | boolean 
    | Date 
    | null 
    | undefined
    | Array<unknown>
    | Record<string, unknown>;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

/**
 * Field statistics
 */
export interface FieldStats {
  totalCount: number;
  uniqueCount: number;
  type: string;
  hasNulls: boolean;
}

/**
 * Collection statistics
 */
export interface CollectionStats {
  totalDocuments: number;
  lastUpdated: Date | null;
  fieldStats: Record<string, FieldStats>;
}

/**
 * Stats response type
 */
export type StatsResponse = TypedApiResponse<CollectionStats>;

// ============================================================================
// OPERATION OPTIONS TYPES
// ============================================================================

/**
 * Create operation options
 */
export interface CreateOptions {
  audit?: boolean;
  timestamps?: boolean;
}

/**
 * Update operation options
 */
export interface UpdateOptions {
  audit?: boolean;
  timestamps?: boolean;
}

/**
 * Delete operation options
 */
export interface DeleteOptions {
  audit?: boolean;
  hard?: boolean;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for API responses
 */
export function isTypedApiResponse<T>(obj: unknown): obj is TypedApiResponse<T> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'success' in obj &&
    typeof (obj as { success: unknown }).success === 'boolean'
  );
}

/**
 * Type guard for webhook payloads
 */
export function isTypedWebhookPayload(obj: unknown): obj is TypedWebhookPayload {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'event' in obj &&
    typeof (obj as { event: unknown }).event === 'string' &&
    'data' in obj &&
    'timestamp' in obj &&
    typeof (obj as { timestamp: unknown }).timestamp === 'object' &&
    (obj as { timestamp: unknown }).timestamp !== null &&
    'seconds' in (obj as { timestamp: { seconds?: unknown } }).timestamp &&
    'nanoseconds' in (obj as { timestamp: { nanoseconds?: unknown } }).timestamp &&
    'userId' in obj &&
    typeof (obj as { userId: unknown }).userId === 'string'
  );
}

/**
 * Type guard for pagination params
 */
export function isTypedPaginationParams(obj: unknown): obj is TypedPaginationParams {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    (!('page' in obj) || typeof (obj as { page?: unknown }).page === 'number') &&
    (!('limit' in obj) || typeof (obj as { limit?: unknown }).limit === 'number') &&
    (!('sortBy' in obj) || typeof (obj as { sortBy?: unknown }).sortBy === 'string') &&
    (!('sortOrder' in obj) || ['asc', 'desc'].includes((obj as { sortOrder?: unknown }).sortOrder as string))
  );
}

/**
 * Type guard for filter params
 */
export function isTypedFilterParams(obj: unknown): obj is TypedFilterParams {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  for (const [, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (
      typeof value !== 'string' &&
      typeof value !== 'number' &&
      typeof value !== 'boolean' &&
      !(value instanceof Date) &&
      !(typeof value === 'object' && 'operator' in value && 'value' in value)
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Type guard for collection names
 */
export function isCollectionName(obj: unknown): obj is CollectionName {
  return (
    typeof obj === 'string' &&
    ['brands', 'sites', 'users', 'pages', 'contentBlocks', 'media', 'navigation', 'workflows', 'auditLogs'].includes(obj)
  );
}

/**
 * Type guard for export format
 */
export function isExportFormat(obj: unknown): obj is ExportFormat {
  return typeof obj === 'string' && ['json', 'csv'].includes(obj);
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract data type from API response
 */
export type ExtractApiResponseData<T> = T extends TypedApiResponse<infer U> ? U : never;

/**
 * Create a typed API response
 */
export function createTypedApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  message?: string,
  pagination?: TypedApiResponse<T>['pagination']
): TypedApiResponse<T> {
  const response: TypedApiResponse<T> = { success };
  
  if (data !== undefined) {
    response.data = data;
  }
  
  if (error !== undefined) {
    response.error = error;
  }
  
  if (message !== undefined) {
    response.message = message;
  }
  
  if (pagination !== undefined) {
    response.pagination = pagination;
  }
  
  return response;
}

/**
 * Create a success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  pagination?: TypedApiResponse<T>['pagination']
): TypedApiResponse<T> {
  return createTypedApiResponse(true, data, undefined, message, pagination);
}

/**
 * Create an error response
 */
export function createErrorResponse<T>(
  error: string,
  message?: string
): TypedApiResponse<T> {
  return createTypedApiResponse<T>(false, undefined, error, message);
}