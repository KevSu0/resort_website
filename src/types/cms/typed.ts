import { z } from 'zod';

// ============================================================================
// CONTENT BLOCK TYPES
// ============================================================================

/**
 * Strongly typed content block schema
 */
export const TypedContentBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  content: z.record(z.string(), z.unknown()), // Replaces z.any()
  attributes: z.record(z.string(), z.unknown()).optional(), // Replaces z.record(z.any())
  children: z.array(z.unknown()).optional(), // Replaces z.array(z.any())
  order: z.number(),
  created_at: z.date(),
  updated_at: z.date(),
});

/**
 * Strongly typed content page schema
 */
export const TypedContentPageSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
  content: z.array(TypedContentBlockSchema),
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

// ============================================================================
// RICH EDITOR TYPES
// ============================================================================

/**
 * Strongly typed rich content node
 */
export interface TypedRichContentNode {
  id: string;
  type: string;
  content?: string;
  attrs?: Record<string, unknown>; // Replaces Record<string, any>
  children?: TypedRichContentNode[];
  marks?: Array<{
    type: string;
    attrs?: Record<string, unknown>; // Replaces Record<string, any>
  }>;
}

/**
 * Strongly typed editor extension
 */
export interface TypedEditorExtension {
  name: string;
  extension: unknown; // Replaces any - more specific than any but still flexible
  toolbar?: boolean;
  priority?: number;
}

/**
 * Strongly typed media asset
 */
export interface TypedMediaAsset {
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

/**
 * Strongly typed block template
 */
export interface TypedBlockTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  schema: unknown; // Replaces any - schema can be complex
  initialContent: TypedRichContentNode;
  preview?: string;
}

// ============================================================================
// CONTENT TEMPLATE TYPES
// ============================================================================

/**
 * Strongly typed content template
 */
export interface TypedContentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string; // Handlebars-like template
  variables: TypedTemplateVariable[];
  preview?: string;
  brand_id: string;
  site_id: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Strongly typed template variable
 */
export interface TypedTemplateVariable {
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

// ============================================================================
// FORM BUILDER TYPES
// ============================================================================

/**
 * Strongly typed form field
 */
export interface TypedFormField {
  id: string;
  type: string;
  name: string;
  label: string;
  required: boolean;
  placeholder?: string;
  validation?: TypedFieldValidation;
  conditional?: TypedConditionalLogic;
  attributes?: Record<string, unknown>; // Replaces Record<string, any>
  order: number;
}

/**
 * Strongly typed field validation
 */
export interface TypedFieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
  custom?: string;
}

/**
 * Strongly typed conditional logic
 */
export interface TypedConditionalLogic {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';
  value: unknown; // Replaces any
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'optional';
}

/**
 * Strongly typed form definition
 */
export interface TypedFormDefinition {
  id: string;
  name: string;
  description: string;
  fields: TypedFormField[];
  settings: TypedFormSettings;
  brand_id: string;
  site_id: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Strongly typed form settings
 */
export interface TypedFormSettings {
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

// ============================================================================
// PREVIEW SYSTEM TYPES
// ============================================================================

/**
 * Strongly typed device preset
 */
export interface TypedDevicePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  devicePixelRatio: number;
  userAgent: string;
  type: 'desktop' | 'tablet' | 'mobile';
}

/**
 * Strongly typed preview state
 */
export interface TypedPreviewState {
  mode: 'desktop' | 'tablet' | 'mobile' | 'custom';
  device: TypedDevicePreset;
  zoom: number;
  orientation: 'portrait' | 'landscape';
  showOverlay: boolean;
  liveEdit: boolean;
}

/**
 * Strongly typed component library
 */
export interface TypedComponentLibrary {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  component: React.ComponentType<Record<string, unknown>>; // Replaces React.ComponentType<any>
  props: TypedComponentProp[];
  variants?: TypedComponentVariant[];
  examples?: TypedComponentExample[];
}

/**
 * Strongly typed component prop
 */
export interface TypedComponentProp {
  name: string;
  type: string;
  required: boolean;
  default?: unknown; // Replaces any
  description: string;
  control?: string;
}

/**
 * Strongly typed component variant
 */
export interface TypedComponentVariant {
  name: string;
  props: Record<string, unknown>; // Replaces Record<string, any>
  description?: string;
}

/**
 * Strongly typed component example
 */
export interface TypedComponentExample {
  name: string;
  code: string;
  props?: Record<string, unknown>; // Replaces Record<string, any>
  description?: string;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for rich content nodes
 */
export function isTypedRichContentNode(obj: unknown): obj is TypedRichContentNode {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof (obj as { id: unknown }).id === 'string' &&
    'type' in obj &&
    typeof (obj as { type: unknown }).type === 'string'
  );
}

/**
 * Type guard for media assets
 */
export function isTypedMediaAsset(obj: unknown): obj is TypedMediaAsset {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof (obj as { id: unknown }).id === 'string' &&
    'url' in obj &&
    typeof (obj as { url: unknown }).url === 'string' &&
    'type' in obj &&
    ['image', 'video', 'document', 'audio'].includes((obj as { type: unknown }).type as string) &&
    'filename' in obj &&
    typeof (obj as { filename: unknown }).filename === 'string' &&
    'size' in obj &&
    typeof (obj as { size: unknown }).size === 'number' &&
    'mime_type' in obj &&
    typeof (obj as { mime_type: unknown }).mime_type === 'string'
  );
}

/**
 * Type guard for template variables
 */
export function isTypedTemplateVariable(obj: unknown): obj is TypedTemplateVariable {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'name' in obj &&
    typeof (obj as { name: unknown }).name === 'string' &&
    'type' in obj &&
    typeof (obj as { type: unknown }).type === 'string' &&
    ['text', 'number', 'boolean', 'image', 'video', 'richtext', 'component', 'array', 'object'].includes((obj as { type: unknown }).type as string) &&
    'label' in obj &&
    typeof (obj as { label: unknown }).label === 'string'
  );
}

/**
 * Type guard for form fields
 */
export function isTypedFormField(obj: unknown): obj is TypedFormField {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof (obj as { id: unknown }).id === 'string' &&
    'type' in obj &&
    typeof (obj as { type: unknown }).type === 'string' &&
    'name' in obj &&
    typeof (obj as { name: unknown }).name === 'string' &&
    'label' in obj &&
    typeof (obj as { label: unknown }).label === 'string' &&
    'required' in obj &&
    typeof (obj as { required: unknown }).required === 'boolean' &&
    'order' in obj &&
    typeof (obj as { order: unknown }).order === 'number'
  );
}

/**
 * Type guard for conditional logic
 */
export function isTypedConditionalLogic(obj: unknown): obj is TypedConditionalLogic {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'field' in obj &&
    typeof (obj as { field: unknown }).field === 'string' &&
    'operator' in obj &&
    ['equals', 'not_equals', 'contains', 'starts_with', 'ends_with', 'greater_than', 'less_than'].includes((obj as { operator: unknown }).operator as string) &&
    'action' in obj &&
    ['show', 'hide', 'enable', 'disable', 'require', 'optional'].includes((obj as { action: unknown }).action as string)
  );
}

/**
 * Type guard for device presets
 */
export function isTypedDevicePreset(obj: unknown): obj is TypedDevicePreset {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof (obj as { id: unknown }).id === 'string' &&
    'name' in obj &&
    typeof (obj as { name: unknown }).name === 'string' &&
    'width' in obj &&
    typeof (obj as { width: unknown }).width === 'number' &&
    'height' in obj &&
    typeof (obj as { height: unknown }).height === 'number' &&
    'type' in obj &&
    ['desktop', 'tablet', 'mobile'].includes((obj as { type: unknown }).type as string)
  );
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type TypedContentBlock = z.infer<typeof TypedContentBlockSchema>;
export type TypedContentPage = z.infer<typeof TypedContentPageSchema>;