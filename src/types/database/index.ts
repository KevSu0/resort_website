import { PrismaClient } from '../../generated/prisma';

// ============================================================================
// DATABASE OPERATION TYPES
// ============================================================================

/**
 * Strongly typed query parameters
 */
export interface QueryParameters {
  [key: string]: string | number | boolean | Date | null | undefined;
}

/**
 * Strongly typed query result
 */
export interface TypedQueryResult<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
}

/**
 * Generic database entity interface
 */
export interface DatabaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Prisma model types based on schema
 */
export type PrismaModel = PrismaClient[keyof Pick<PrismaClient, 
  'brand' | 'site' | 'user' | 'siteUser' | 'session' | 'page' | 
  'contentBlock' | 'navigation' | 'navigationItem' | 'media' | 
  'contentVersion' | 'workflow' | 'workflowItem' | 'workflowStep' | 
  'brandSetting' | 'siteSetting' | 'auditLog'
>];

/**
 * Dynamic model access interface
 */
export interface PrismaModels {
  brand: PrismaClient['brand'];
  site: PrismaClient['site'];
  user: PrismaClient['user'];
  siteUser: PrismaClient['siteUser'];
  session: PrismaClient['session'];
  page: PrismaClient['page'];
  contentBlock: PrismaClient['contentBlock'];
  navigation: PrismaClient['navigation'];
  navigationItem: PrismaClient['navigationItem'];
  media: PrismaClient['media'];
  contentVersion: PrismaClient['contentVersion'];
  workflow: PrismaClient['workflow'];
  workflowItem: PrismaClient['workflowItem'];
  workflowStep: PrismaClient['workflowStep'];
  brandSetting: PrismaClient['brandSetting'];
  siteSetting: PrismaClient['siteSetting'];
  auditLog: PrismaClient['auditLog'];
}

/**
 * Table name union type for type-safe table operations
 */
export type TableName = keyof PrismaModels;

/**
 * Generic database operation types
 */
export interface DatabaseOperation<T extends DatabaseEntity> {
  create: Partial<T>;
  update: Partial<T>;
  where: QueryParameters;
}

/**
 * Transaction operations interface
 */
export interface TransactionOperations {
  query<T>(sql: string, params?: QueryParameters): Promise<TypedQueryResult<T>>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

/**
 * Where clause parser result type
 */
export interface ParsedWhereClause {
  [field: string]:
    | string
    | number
    | boolean
    | Date
    | {
        equals?: string | number | boolean | Date;
        contains?: string;
        startsWith?: string;
        endsWith?: string;
        gt?: number | Date;
        gte?: number | Date;
        lt?: number | Date;
        lte?: number | Date;
        in?: (string | number | boolean | Date)[]
      }
    | undefined;
}

/**
 * Database operation context
 */
export interface DatabaseOperationContext {
  table: TableName;
  operation: 'create' | 'read' | 'update' | 'delete';
  userId?: string;
  timestamp: Date;
}

/**
 * Type-safe escape value function
 */
export type EscapeValueFunction = <T>(value: T) => T;

/**
 * Type-safe identifier escaper
 */
export type IdentifierEscaper = (identifier: string) => string;

// ============================================================================
// DATABASE ENTITY TYPES (Based on Prisma Schema)
// ============================================================================

/**
 * Brand entity type
 */
export interface BrandEntity extends DatabaseEntity {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  domain?: string;
  subdomain?: string;
  settings?: Record<string, unknown>;
  isActive: boolean;
}

/**
 * Site entity type
 */
export interface SiteEntity extends DatabaseEntity {
  brandId: string;
  name: string;
  slug: string;
  title: string;
  description?: string;
  domain?: string;
  subdomain?: string;
  language: string;
  timezone: string;
  theme?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  isActive: boolean;
  isDefault: boolean;
}

/**
 * User entity type
 */
export interface UserEntity extends DatabaseEntity {
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
  status: string;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  lastLoginAt?: Date;
  passwordHash: string;
  resetToken?: string;
  resetTokenExpires?: Date;
  preferences?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  brandId: string;
  siteIds: string[];
}

/**
 * Page entity type
 */
export interface PageEntity extends DatabaseEntity {
  siteId: string;
  title: string;
  slug: string;
  path: string;
  content?: Record<string, unknown>;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  template?: string;
  layout?: Record<string, unknown>;
  status: string;
  visibility: string;
  publishedAt?: Date;
  scheduledFor?: Date;
  parentId?: string;
  sortOrder: number;
  tags: string[];
  settings?: Record<string, unknown>;
}

/**
 * Content Block entity type
 */
export interface ContentBlockEntity extends DatabaseEntity {
  siteId: string;
  pageId?: string;
  name: string;
  type: string;
  content: Record<string, unknown>;
  configuration?: Record<string, unknown>;
  order: number;
  container?: string;
  isActive: boolean;
}

/**
 * Media entity type
 */
export interface MediaEntity extends DatabaseEntity {
  siteId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  caption?: string;
  description?: string;
  tags: string[];
  folder?: string;
  url: string;
  thumbnails?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  isActive: boolean;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for database entities
 */
export function isDatabaseEntity(obj: unknown): obj is DatabaseEntity {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof (obj as Record<string, unknown>).id === 'string' &&
    'createdAt' in obj &&
    (obj as Record<string, unknown>).createdAt instanceof Date &&
    'updatedAt' in obj &&
    (obj as Record<string, unknown>).updatedAt instanceof Date
  );
}

/**
 * Type guard for brand entities
 */
export function isBrandEntity(obj: unknown): obj is BrandEntity {
  return (
    isDatabaseEntity(obj) &&
    'name' in obj &&
    typeof (obj as Record<string, unknown>).name === 'string' &&
    'slug' in obj &&
    typeof (obj as Record<string, unknown>).slug === 'string' &&
    'isActive' in obj &&
    typeof (obj as Record<string, unknown>).isActive === 'boolean'
  );
}

/**
 * Type guard for site entities
 */
export function isSiteEntity(obj: unknown): obj is SiteEntity {
  return (
    isDatabaseEntity(obj) &&
    'brandId' in obj &&
    typeof (obj as Record<string, unknown>).brandId === 'string' &&
    'name' in obj &&
    typeof (obj as Record<string, unknown>).name === 'string' &&
    'slug' in obj &&
    typeof (obj as Record<string, unknown>).slug === 'string'
  );
}

/**
 * Type guard for user entities
 */
export function isUserEntity(obj: unknown): obj is UserEntity {
  return (
    isDatabaseEntity(obj) &&
    'email' in obj &&
    typeof (obj as Record<string, unknown>).email === 'string' &&
    'firstName' in obj &&
    typeof (obj as Record<string, unknown>).firstName === 'string' &&
    'lastName' in obj &&
    typeof (obj as Record<string, unknown>).lastName === 'string'
  );
}

/**
 * Type guard for page entities
 */
export function isPageEntity(obj: unknown): obj is PageEntity {
  return (
    isDatabaseEntity(obj) &&
    'siteId' in obj &&
    typeof (obj as Record<string, unknown>).siteId === 'string' &&
    'title' in obj &&
    typeof (obj as Record<string, unknown>).title === 'string' &&
    'slug' in obj &&
    typeof (obj as Record<string, unknown>).slug === 'string'
  );
}

/**
 * Type guard for content block entities
 */
export function isContentBlockEntity(obj: unknown): obj is ContentBlockEntity {
  return (
    isDatabaseEntity(obj) &&
    'siteId' in obj &&
    typeof (obj as Record<string, unknown>).siteId === 'string' &&
    'name' in obj &&
    typeof (obj as Record<string, unknown>).name === 'string' &&
    'type' in obj &&
    typeof (obj as Record<string, unknown>).type === 'string'
  );
}

/**
 * Type guard for media entities
 */
export function isMediaEntity(obj: unknown): obj is MediaEntity {
  return (
    isDatabaseEntity(obj) &&
    'siteId' in obj &&
    typeof (obj as Record<string, unknown>).siteId === 'string' &&
    'filename' in obj &&
    typeof (obj as Record<string, unknown>).filename === 'string' &&
    'mimeType' in obj &&
    typeof (obj as Record<string, unknown>).mimeType === 'string'
  );
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract entity type from table name
 */
export type EntityTypeFromTable<T extends TableName> = 
  T extends 'brand' ? BrandEntity :
  T extends 'site' ? SiteEntity :
  T extends 'user' ? UserEntity :
  T extends 'page' ? PageEntity :
  T extends 'contentBlock' ? ContentBlockEntity :
  T extends 'media' ? MediaEntity :
  DatabaseEntity;

/**
 * Create operation type for specific table
 */
export type CreateOperation<T extends TableName> = 
  Omit<EntityTypeFromTable<T>, keyof DatabaseEntity>;

/**
 * Update operation type for specific table
 */
export type UpdateOperation<T extends TableName> = 
  Partial<EntityTypeFromTable<T>>;

/**
 * Where clause type for specific table
 */
export type WhereClause<T extends TableName> = 
  Partial<Pick<EntityTypeFromTable<T>, keyof EntityTypeFromTable<T>>> & {
  id?: string;
  createdAt?: Date | { gte?: Date; lte?: Date };
  updatedAt?: Date | { gte?: Date; lte?: Date };
};