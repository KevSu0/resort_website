import { z } from 'zod';

// Base content types
export const ContentBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  content: z.record(z.string(), z.unknown()), // Replaces z.any()
  attributes: z.record(z.string(), z.unknown()).optional(), // Replaces z.record(z.any())
  children: z.array(z.unknown()).optional(), // Replaces z.array(z.any())
  order: z.number(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const ContentPageSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
  content: z.array(ContentBlockSchema),
  meta: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    image: z.string().optional(),
  }).optional(),
  brand_id: z.string().uuid(),
  site_id: z.string().uuid(),
  created_at: z.date(),
  updated_at: z.date(),
  published_at: z.date().optional(),
});

// Rich Editor Types
export interface RichContentNode {
  id: string;
  type: string;
  content?: string;
  attrs?: Record<string, unknown>; // Replaces Record<string, any>
  children?: RichContentNode[];
  marks?: Array<{
    type: string;
    attrs?: Record<string, unknown>; // Replaces Record<string, any>
  }>;
}

export interface EditorExtension {
  name: string;
  extension: unknown; // Replaces any - more specific than any but still flexible
  toolbar?: boolean;
  priority?: number;
}

export interface MediaAsset {
  id: string;
  url: string;
  type: 'image' | 'video' | 'document' | 'audio';
  filename: string;
  size: number;
  mime_type: string;
  alt?: string;
  caption?: string;
  metadata?: Record<string, unknown>; // Replaces Record<string, any>
}

export interface BlockTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  schema: unknown; // Replaces any - schema can be complex
  initialContent: RichContentNode;
  preview?: string;
}

// Content Template Types
export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string; // Handlebars-like template
  variables: TemplateVariable[];
  preview?: string;
  brand_id: string;
  site_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'image' | 'video' | 'richtext' | 'component' | 'array' | 'object';
  label: string;
  description?: string;
  required?: boolean;
  default?: unknown; // Replaces any
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
}

// Form Builder Types
export interface FormField {
  id: string;
  type: string;
  name: string;
  label: string;
  required: boolean;
  placeholder?: string;
  validation?: FieldValidation;
  conditional?: ConditionalLogic;
  attributes?: Record<string, unknown>; // Replaces Record<string, any>
  order: number;
}

export interface FieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
  custom?: string;
}

export interface ConditionalLogic {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';
  value: unknown; // Replaces any
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'optional';
}

export interface FormDefinition {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  settings: FormSettings;
  brand_id: string;
  site_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface FormSettings {
  submit_button_text: string;
  success_message: string;
  redirect_url?: string;
  send_notifications: boolean;
  notification_emails?: string[];
  store_submissions: boolean;
  limit_submissions?: boolean;
  max_submissions?: number;
  allow_edit_submissions: boolean;
}

// Preview System Types
export interface DevicePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  devicePixelRatio: number;
  userAgent: string;
  type: 'desktop' | 'tablet' | 'mobile';
}

export interface PreviewState {
  mode: 'desktop' | 'tablet' | 'mobile' | 'custom';
  device: DevicePreset;
  zoom: number;
  orientation: 'portrait' | 'landscape';
  showOverlay: boolean;
  liveEdit: boolean;
}

export interface ComponentLibrary {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  component: React.ComponentType<Record<string, unknown>>;
  props: ComponentProp[];
  variants?: ComponentVariant[];
  examples?: ComponentExample[];
}

export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  default?: unknown; // Replaces any
  description: string;
  control?: string;
}

export interface ComponentVariant {
  name: string;
  props: Record<string, unknown>; // Replaces Record<string, any>
  description?: string;
}

export interface ComponentExample {
  name: string;
  code: string;
  props?: Record<string, unknown>; // Replaces Record<string, any>
  description?: string;
}

export type ContentBlock = z.infer<typeof ContentBlockSchema>;
export type ContentPage = z.infer<typeof ContentPageSchema>;