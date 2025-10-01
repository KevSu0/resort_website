/**
 * Type Guards for Runtime Validation
 * 
 * This file contains type guard functions that help validate data structures
 * at runtime, ensuring type safety throughout the application.
 */

// ============================================================================
// PRIMITIVE TYPE GUARDS
// ============================================================================

/**
 * Checks if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Checks if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Checks if a value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Checks if a value is a Date object
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Checks if a value is null
 */
export function isNull(value: unknown): value is null {
  return value === null;
}

/**
 * Checks if a value is undefined
 */
export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

/**
 * Checks if a value is null or undefined
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

// ============================================================================
// ARRAY TYPE GUARDS
// ============================================================================

/**
 * Checks if a value is an array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Checks if a value is an array of strings
 */
export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

/**
 * Checks if a value is an array of numbers
 */
export function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every(isNumber);
}

// ============================================================================
// OBJECT TYPE GUARDS
// ============================================================================

/**
 * Checks if a value is a plain object (not null, not array, not a function)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && 
         typeof value === 'object' && 
         !Array.isArray(value) && 
         !(value instanceof Date);
}

/**
 * Checks if a value is a plain object with specific keys
 */
export function isObjectWithKeys<T extends Record<string, unknown>>(
  value: unknown,
  keys: (keyof T)[]
): value is T {
  if (!isObject(value)) {
    return false;
  }
  
  return keys.every(key => key in value);
}

// ============================================================================
// DATABASE ENTITY TYPE GUARDS
// ============================================================================

/**
 * Checks if a value is a database entity (has id, createdAt, updatedAt)
 */
export function isDatabaseEntity(value: unknown): value is {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
} {
  return isObjectWithKeys(value, ['id', 'createdAt', 'updatedAt']) &&
         isString(value.id) &&
         isDate(value.createdAt) &&
         isDate(value.updatedAt);
}

/**
 * Checks if a value is a brand entity
 */
export function isBrandEntity(value: unknown): value is {
  id: string;
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
  createdAt: Date;
  updatedAt: Date;
} {
  return isDatabaseEntity(value) &&
         isObjectWithKeys(value, ['name', 'slug', 'isActive']) &&
         isString(value.name) &&
         isString(value.slug) &&
         isBoolean(value.isActive);
}

/**
 * Checks if a value is a site entity
 */
export function isSiteEntity(value: unknown): value is {
  id: string;
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
  createdAt: Date;
  updatedAt: Date;
} {
  return isDatabaseEntity(value) &&
         isObjectWithKeys(value, ['brandId', 'name', 'slug', 'title', 'language', 'timezone', 'isActive', 'isDefault']) &&
         isString(value.brandId) &&
         isString(value.name) &&
         isString(value.slug) &&
         isString(value.title) &&
         isString(value.language) &&
         isString(value.timezone) &&
         isBoolean(value.isActive) &&
         isBoolean(value.isDefault);
}

/**
 * Checks if a value is a user entity
 */
export function isUserEntity(value: unknown): value is {
  id: string;
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
  createdAt: Date;
  updatedAt: Date;
} {
  return isDatabaseEntity(value) &&
         isObjectWithKeys(value, ['email', 'firstName', 'lastName', 'passwordHash', 'brandId', 'siteIds']) &&
         isString(value.email) &&
         isString(value.firstName) &&
         isString(value.lastName) &&
         isString(value.passwordHash) &&
         isString(value.brandId) &&
         isStringArray(value.siteIds);
}

// ============================================================================
// CMS TYPE GUARDS
// ============================================================================

/**
 * Checks if a value is a content block
 */
export function isContentBlock(value: unknown): value is {
  id: string;
  type: string;
  content: Record<string, unknown>;
  attributes?: Record<string, unknown>;
  children?: unknown[];
  order: number;
  created_at: Date;
  updated_at: Date;
} {
  return isObjectWithKeys(value, ['id', 'type', 'content', 'order', 'created_at', 'updated_at']) &&
         isString(value.id) &&
         isString(value.type) &&
         isObject(value.content) &&
         isNumber(value.order) &&
         isDate(value.created_at) &&
         isDate(value.updated_at);
}

/**
 * Checks if a value is a rich content node
 */
export function isRichContentNode(value: unknown): value is {
  id: string;
  type: string;
  content?: string;
  attrs?: Record<string, unknown>;
  children?: unknown[];
  marks?: Array<{
    type: string;
    attrs?: Record<string, unknown>;
  }>;
} {
  return isObjectWithKeys(value, ['id', 'type']) &&
         isString(value.id) &&
         isString(value.type);
}

/**
 * Checks if a value is a media asset
 */
export function isMediaAsset(value: unknown): value is {
  id: string;
  url: string;
  type: 'image' | 'video' | 'document' | 'audio';
  filename: string;
  size: number;
  mimeType: string;
  alt?: string;
  caption?: string;
  metadata?: Record<string, unknown>;
} {
  return isObjectWithKeys(value, ['id', 'url', 'type', 'filename', 'size', 'mimeType']) &&
         isString(value.id) &&
         isString(value.url) &&
         isString(value.type) && ['image', 'video', 'document', 'audio'].includes(value.type) &&
         isString(value.filename) &&
         isNumber(value.size) &&
         isString(value.mimeType);
}

/**
 * Checks if a value is a template variable
 */
export function isTemplateVariable(value: unknown): value is {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'image' | 'video' | 'richtext' | 'component' | 'array' | 'object';
  label: string;
  description?: string;
  required?: boolean;
  default?: unknown;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
} {
  return isObjectWithKeys(value, ['name', 'type', 'label']) &&
         isString(value.name) &&
         isString(value.type) && ['text', 'number', 'boolean', 'image', 'video', 'richtext', 'component', 'array', 'object'].includes(value.type) &&
         isString(value.label);
}

/**
 * Checks if a value is a form field
 */
export function isFormField(value: unknown): value is {
  id: string;
  type: string;
  name: string;
  label: string;
  required: boolean;
  placeholder?: string;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
    custom?: string;
  };
  conditional?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';
    value: unknown;
    action: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'optional';
  };
  attributes?: Record<string, unknown>;
  order: number;
} {
  return isObjectWithKeys(value, ['id', 'type', 'name', 'label', 'required', 'order']) &&
         isString(value.id) &&
         isString(value.type) &&
         isString(value.name) &&
         isString(value.label) &&
         isBoolean(value.required) &&
         isNumber(value.order);
}

// ============================================================================
// API TYPE GUARDS
// ============================================================================

/**
 * Checks if a value is an API response
 */
export function isApiResponse<T>(value: unknown): value is {
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
} {
  return isObject(value) &&
         'success' in value &&
         isBoolean(value.success);
}

/**
 * Checks if a value is a webhook payload
 */
export function isWebhookPayload(value: unknown): value is {
  event: string;
  data: {
    collection: string;
    documentId?: string;
    data?: unknown;
    previousData?: unknown;
    deletedData?: unknown;
    hard?: boolean;
    userId: string;
  };
  timestamp: {
    seconds: number;
    nanoseconds: number;
  };
  userId: string;
  resourceId?: string;
} {
  return isObject(value) &&
         'event' in value &&
         'data' in value &&
         'timestamp' in value &&
         'userId' in value &&
         isString(value.event) &&
         isObject(value.data) &&
         isString(value.data.collection) &&
         isString(value.data.userId) &&
         isObject(value.timestamp) &&
         'seconds' in value.timestamp &&
         'nanoseconds' in value.timestamp &&
         isNumber(value.timestamp.seconds) &&
         isNumber(value.timestamp.nanoseconds) &&
         isString(value.userId);
}

// ============================================================================
// UTILITY TYPE GUARDS
// ============================================================================

/**
 * Type guard that checks if a value is not null or undefined
 */
export function isNotNil<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard that checks if a value has a specific property
 */
export function hasProperty<K extends string | number | symbol>(
  obj: unknown,
  prop: K
): obj is Record<K, unknown> {
  return isObject(obj) && prop in obj;
}

/**
 * Type guard that checks if a value is a specific string literal
 */
export function isStringLiteral<T extends string>(
  value: unknown,
  literals: T[]
): value is T {
  return isString(value) && literals.includes(value as T);
}

/**
 * Type guard that checks if a value is a specific record type
 */
export function isRecordOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T
): value is Record<string, T> {
  if (!isObject(value)) {
    return false;
  }
  
  return Object.values(value).every(guard);
}

/**
 * Type guard that checks if a value is a specific array type
 */
export function isArrayOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T
): value is T[] {
  return Array.isArray(value) && value.every(guard);
}