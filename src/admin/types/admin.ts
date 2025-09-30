import type {
  Property,
  RoomType,
  Place,
  Offer,
  PromoCode,
  Referrer,
  LandingContent,
  SiteSettings,
  Media,
} from './entities';

// Re-export types for convenience
export type {
  Property,
  RoomType,
  Place,
  Offer,
  PromoCode,
  Referrer,
  Media,
  SiteSettings,
  Enquiry,
  LandingContent
} from './entities';

export type Role = 'ADMIN' | 'EDITOR';

export interface AdminUser {
  id: string;
  username: string;
  email?: string;
  name?: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  isLoading: boolean;
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: string;
}

export interface Snapshot {
  id: string;
  label: string;
  timestamp: string;
  data: any;
  createdBy: string;
}

export interface PublishOptions {
  label: string;
  createSnapshot: boolean;
}

export interface DraftContent {
  properties: Property[];
  rooms: RoomType[];
  places: Place[];
  offers: Offer[];
  promoCodes: PromoCode[];
  referrers: Referrer[];
  landing: LandingContent;
  settings: SiteSettings;
}

export interface PublishedContent extends DraftContent {
  publishedAt: string;
  version: string;
}

export interface MediaUploadOptions {
  file: File;
  alt?: string;
  kind?: 'image' | 'video';
}

export interface MediaValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export interface ExportOptions {
  includeMedia: boolean;
  includeSnapshots: boolean;
  snapshotId?: string;
}

export interface ImportResult {
  success: boolean;
  message: string;
  diff?: ImportDiff;
  errors?: string[];
  backupId?: string;
}

export interface ImportDiff {
  added: number;
  modified: number;
  removed: number;
  details: DiffDetail[];
  amenityDuplicates?: number;
  amenityNormalized?: number;
}

export interface DiffDetail {
  type: 'added' | 'modified' | 'removed';
  entity: string;
  id: string;
  name: string;
}