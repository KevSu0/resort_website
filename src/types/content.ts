import { z } from 'zod';

// Content Block Types
export const ContentBlockType = z.enum([
  'paragraph',
  'heading',
  'image',
  'video',
  'quote',
  'list',
  'table',
  'code',
  'divider',
  'button',
  'embed',
  'gallery',
  'testimonial',
  'feature',
  'accordion',
  'tab',
  'form',
  'spacer',
  'text',
  'hero',
  'features',
  'cta',
  'map'
]);

export type ContentBlockType = z.infer<typeof ContentBlockType>;

// Content Block Schema
export const ContentBlockSchema = z.object({
  id: z.string().uuid(),
  type: ContentBlockType,
  content: z.record(z.string(), z.unknown()),
  attributes: z.record(z.string(), z.unknown()).optional(),
  children: z.array(z.unknown()).optional(),
  order: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type ContentBlock = z.infer<typeof ContentBlockSchema>;

// Content Version Schema
export const ContentVersionSchema = z.object({
  id: z.string().uuid(),
  contentId: z.string().uuid(),
  version: z.number(),
  title: z.string(),
  blocks: z.array(ContentBlockSchema),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdBy: z.string(),
  createdAt: z.string().datetime(),
  publishedAt: z.string().datetime().optional(),
  isCurrent: z.boolean().default(false)
});

export type ContentVersion = z.infer<typeof ContentVersionSchema>;

// Content Schema
export const ContentSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  type: z.enum(['page', 'post', 'section', 'component']),
  status: z.enum(['draft', 'review', 'published', 'archived']),
  visibility: z.enum(['public', 'private', 'password_protected']),
  password: z.string().optional(),
  templateId: z.string().uuid().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  ogImage: z.string().optional(),
  tags: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  currentVersion: z.number().default(1),
  versions: z.array(ContentVersionSchema),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdBy: z.string(),
  updatedBy: z.string().optional(),
  publishedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type Content = z.infer<typeof ContentSchema>;

// Content Template Schema
export const ContentTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['page', 'post', 'section', 'component']),
  category: z.string().optional(),
  thumbnail: z.string().optional(),
  blocks: z.array(ContentBlockSchema),
  variables: z.array(z.object({
    name: z.string(),
    type: z.enum(['text', 'image', 'link', 'color', 'number']),
    defaultValue: z.unknown(),
    required: z.boolean().default(false)
  })).default([]),
  isActive: z.boolean().default(true),
  isSystem: z.boolean().default(false),
  usageCount: z.number().default(0),
  createdBy: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type ContentTemplate = z.infer<typeof ContentTemplateSchema>;

// Media Library Schema
export const MediaLibrarySchema = z.object({
  id: z.string().uuid(),
  filename: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  tags: z.array(z.string()).default([]),
  folder: z.string().optional(),
  url: z.string(),
  thumbnailUrl: z.string().optional(),
  uploadedBy: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type MediaLibrary = z.infer<typeof MediaLibrarySchema>;

// Form Builder Schema
export const FormFieldSchema = z.object({
  id: z.string().uuid(),
  type: z.enum([
    'text',
    'email',
    'tel',
    'textarea',
    'number',
    'date',
    'time',
    'datetime',
    'select',
    'multiselect',
    'checkbox',
    'radio',
    'file',
    'range',
    'rating',
    'hidden'
  ]),
  name: z.string(),
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  disabled: z.boolean().default(false),
  options: z.array(z.object({
    label: z.string(),
    value: z.string()
  })).optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    custom: z.string().optional()
  }).optional(),
  conditional: z.object({
    field: z.string(),
    operator: z.enum(['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than']),
    value: z.unknown()
  }).optional(),
  order: z.number()
});

export type FormField = z.infer<typeof FormFieldSchema>;

export const FormBuilderSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  fields: z.array(FormFieldSchema),
  settings: z.object({
    submitButtonText: z.string().default('Submit'),
    successMessage: z.string().default('Form submitted successfully!'),
    errorMessage: z.string().default('Error submitting form. Please try again.'),
    redirectUrl: z.string().optional(),
    emailNotifications: z.array(z.string()).default([]),
    storeSubmissions: z.boolean().default(true)
  }),
  isActive: z.boolean().default(true),
  submissions: z.number().default(0),
  createdBy: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type FormBuilder = z.infer<typeof FormBuilderSchema>;

// Content Preview Device Types
export const DeviceType = z.enum(['desktop', 'tablet', 'mobile']);
export type DeviceType = z.infer<typeof DeviceType>;

export const PreviewDeviceSchema = z.object({
  type: DeviceType,
  name: z.string(),
  width: z.number(),
  height: z.number(),
  scale: z.number().default(1)
});

export type PreviewDevice = z.infer<typeof PreviewDeviceSchema>;

// Content Search and Filter
export const ContentFilterSchema = z.object({
  type: z.enum(['page', 'post', 'section', 'component']).optional(),
  status: z.enum(['draft', 'review', 'published', 'archived']).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
  dateRange: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional()
  }).optional(),
  search: z.string().optional()
});

export type ContentFilter = z.infer<typeof ContentFilterSchema>;

// Content Editor Settings
export const EditorSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).default('light'),
  fontSize: z.number().default(16),
  lineHeight: z.number().default(1.6),
  showWordCount: z.boolean().default(true),
  showReadingTime: z.boolean().default(true),
  autoSave: z.boolean().default(true),
  autoSaveInterval: z.number().default(30000), // 30 seconds
  enableSpellCheck: z.boolean().default(true),
  enableGrammarCheck: z.boolean().default(false),
  customCSS: z.string().optional()
});

export type EditorSettings = z.infer<typeof EditorSettingsSchema>;

// Content Analytics
export const ContentAnalyticsSchema = z.object({
  contentId: z.string().uuid(),
  views: z.number().default(0),
  uniqueViews: z.number().default(0),
  averageReadTime: z.number().default(0),
  bounceRate: z.number().default(0),
  shares: z.object({
    facebook: z.number().default(0),
    twitter: z.number().default(0),
    linkedin: z.number().default(0),
    email: z.number().default(0)
  }),
  conversions: z.number().default(0),
  lastUpdated: z.string().datetime()
});

export type ContentAnalytics = z.infer<typeof ContentAnalyticsSchema>;

// Content Collaboration
export const ContentCommentSchema = z.object({
  id: z.string().uuid(),
  contentId: z.string().uuid(),
  versionId: z.string().uuid(),
  blockId: z.string().uuid().optional(),
  authorId: z.string(),
  authorName: z.string(),
  content: z.string(),
  resolved: z.boolean().default(false),
  replies: z.array(z.unknown()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type ContentComment = z.infer<typeof ContentCommentSchema>;

// Additional types for content block service
export interface CreateContentBlockData {
  siteId: string;
  pageId?: string;
  name: string;
  type: ContentBlockType;
  content: Record<string, unknown>;
  configuration?: Record<string, unknown>;
  order?: number;
  container?: string;
}

export interface UpdateContentBlockData {
  content?: Record<string, unknown>;
  configuration?: Record<string, unknown>;
  order?: number;
  container?: string;
  isActive?: boolean;
}