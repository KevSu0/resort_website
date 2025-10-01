# Unified Content Management Implementation Guide

## Overview

This guide provides detailed implementation instructions for unifying the CMS and Content architectures, including code examples, migration patterns, and best practices.

## Phase 1: Foundation Setup

### 1.1 Create Unified Directory Structure

```bash
mkdir -p src/components/content/{modes,blocks,templates,types,hooks,utils,__tests__}
```

### 1.2 Implement Unified Type System

#### `src/components/content/types/index.ts`

```typescript
// Export all types from unified system
export * from './content-types';
export * from './block-types';
export * from './editor-types';
export * from './media-types';
```

#### `src/components/content/types/editor-types.ts`

```typescript
import { ReactNode } from 'react';
import type { JSONContent } from '@tiptap/react';

// Core editor modes
export type EditorMode = 'simple' | 'standard' | 'advanced' | 'cms';

// Feature flags for different modes
export interface FeatureFlags {
  basicFormatting: boolean;
  advancedFormatting: boolean;
  media: boolean;
  templates: boolean;
  blocks: boolean;
  tables: boolean;
  codeBlocks: boolean;
  collaboration: boolean;
  preview: boolean;
  characterCount: boolean;
  wordCount: boolean;
}

// Output format configuration
export interface OutputFormat {
  type: 'html' | 'json' | 'markdown';
  schema?: ContentSchema;
  sanitize?: boolean;
}

// Editor configuration interface
export interface ContentEditorConfig {
  mode: EditorMode;
  features: FeatureFlags;
  output: OutputFormat;
  integrations: IntegrationConfig;
  ui: UIConfig;
}

// Integration configuration
export interface IntegrationConfig {
  media?: MediaIntegration;
  templates?: TemplateIntegration;
  collaboration?: CollaborationIntegration;
  storage?: StorageIntegration;
}

// UI configuration
export interface UIConfig {
  theme: 'light' | 'dark' | 'auto';
  toolbar: ToolbarConfig;
  menus: MenuConfig;
  placeholder?: string;
  autoFocus?: boolean;
  maxLength?: number;
}

// Toolbar configuration
export interface ToolbarConfig {
  show: boolean;
  position: 'top' | 'bottom' | 'floating';
  sticky: boolean;
  compact: boolean;
}

// Menu configuration
export interface MenuConfig {
  bubble: boolean;
  floating: boolean;
  context: boolean;
}

// Base editor props
export interface BaseEditorProps {
  content?: string | JSONContent;
  onChange?: (content: string | JSONContent, format?: OutputFormat['type']) => void;
  config?: Partial<ContentEditorConfig>;
  className?: string;
  editable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
}

// Extended props for specific use cases
export interface CMSIntegrationProps {
  brandId?: string;
  siteId?: string;
  onMediaSelect?: (media: MediaAsset[]) => void;
  onTemplateSelect?: (template: BlockTemplate) => void;
  showBlockSelector?: boolean;
  enableLivePreview?: boolean;
}

export interface ContentIntegrationProps {
  enableDragAndDrop?: boolean;
  showBlockControls?: boolean;
  previewMode?: boolean;
  blockTypes?: BlockType[];
}

// Combined props interface
export interface UnifiedContentEditorProps extends 
  BaseEditorProps, 
  CMSIntegrationProps, 
  ContentIntegrationProps {
  mode?: EditorMode;
}
```

#### `src/components/content/types/content-types.ts`

```typescript
import { z } from 'zod';

// Content block types
export const BlockTypeSchema = z.enum([
  'text', 'heading', 'paragraph', 'list', 'quote',
  'image', 'video', 'gallery', 'media',
  'table', 'code', 'divider', 'spacer',
  'button', 'form', 'input', 'interactive',
  'hero', 'features', 'testimonials', 'cta',
  'custom', 'component', 'template'
]);

export type BlockType = z.infer<typeof BlockTypeSchema>;

// Unified content block schema
export const ContentBlockSchema = z.object({
  id: z.string().uuid(),
  type: BlockTypeSchema,
  name: z.string(),
  content: z.record(z.string(), z.unknown()),
  attributes: z.record(z.string(), z.unknown()).optional(),
  children: z.array(z.unknown()).optional(),
  order: z.number(),
  visible: z.boolean().default(true),
  locked: z.boolean().default(false),
  metadata: z.object({
    createdAt: z.date(),
    updatedAt: z.date(),
    createdBy: z.string().optional(),
    version: z.number().default(1),
    tags: z.array(z.string()).default([]),
    category: z.string().optional(),
  }).optional(),
});

export type ContentBlock = z.infer<typeof ContentBlockSchema>;

// Content page schema
export const ContentPageSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
  content: z.array(ContentBlockSchema),
  metadata: z.object({
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    ogImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    categories: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
  }).optional(),
  brandId: z.string().uuid().optional(),
  siteId: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  publishedAt: z.date().optional(),
});

export type ContentPage = z.infer<typeof ContentPageSchema>;

// Content schema definition
export interface ContentSchema {
  version: string;
  blocks: Record<BlockType, BlockSchema>;
  validation: ValidationRules;
}

export interface BlockSchema {
  fields: Record<string, FieldDefinition>;
  validation?: ValidationRules;
  templates?: BlockTemplate[];
}

export interface FieldDefinition {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'media' | 'richtext';
  required: boolean;
  default?: unknown;
  validation?: FieldValidation;
  ui?: UIFieldConfig;
}

export interface ValidationRules {
  required: string[];
  patterns: Record<string, RegExp>;
  custom: Record<string, (value: unknown) => boolean>;
}

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean | string;
  message?: string;
}

export interface UIFieldConfig {
  label: string;
  placeholder?: string;
  help?: string;
  widget?: 'input' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'media' | 'richtext';
  options?: Array<{ label: string; value: unknown }>;
}
```

### 1.3 Implement Mode Configurations

#### `src/components/content/modes/index.ts`

```typescript
export * from './simple';
export * from './standard';
export * from './advanced';
export * from './cms';
export * from './utils';
```

#### `src/components/content/modes/simple.ts`

```typescript
import type { ContentEditorConfig, FeatureFlags } from '../types/editor-types';

export const simpleModeConfig: ContentEditorConfig = {
  mode: 'simple',
  features: {
    basicFormatting: true,
    advancedFormatting: false,
    media: false,
    templates: false,
    blocks: false,
    tables: false,
    codeBlocks: false,
    collaboration: false,
    preview: false,
    characterCount: false,
    wordCount: false,
  },
  output: {
    type: 'html',
    sanitize: true,
  },
  integrations: {},
  ui: {
    theme: 'light',
    toolbar: {
      show: true,
      position: 'top',
      sticky: false,
      compact: true,
    },
    menus: {
      bubble: false,
      floating: false,
      context: false,
    },
    placeholder: 'Start typing...',
  },
};

export const simpleExtensions = [
  // Basic formatting extensions only
];

export const simpleToolbar = [
  'bold',
  'italic',
  'underline',
  '|',
  'undo',
  'redo',
];
```

#### `src/components/content/modes/cms.ts`

```typescript
import type { ContentEditorConfig } from '../types/editor-types';

export const cmsModeConfig: ContentEditorConfig = {
  mode: 'cms',
  features: {
    basicFormatting: true,
    advancedFormatting: true,
    media: true,
    templates: true,
    blocks: true,
    tables: true,
    codeBlocks: true,
    collaboration: false,
    preview: true,
    characterCount: true,
    wordCount: true,
  },
  output: {
    type: 'json',
    sanitize: false,
  },
  integrations: {
    media: {
      enabled: true,
      multiple: true,
      acceptedTypes: ['image/*', 'video/*'],
      maxSize: 10 * 1024 * 1024, // 10MB
    },
    templates: {
      enabled: true,
      categories: ['text', 'media', 'structure', 'interactive'],
    },
  },
  ui: {
    theme: 'light',
    toolbar: {
      show: true,
      position: 'top',
      sticky: true,
      compact: false,
    },
    menus: {
      bubble: true,
      floating: true,
      context: true,
    },
    placeholder: 'Start creating content...',
  },
};

export const cmsExtensions = [
  // Full set of extensions including media and blocks
];

export const cmsToolbar = [
  'undo',
  'redo',
  '|',
  'heading',
  'bold',
  'italic',
  'underline',
  'strikethrough',
  '|',
  'bulletList',
  'orderedList',
  'blockquote',
  '|',
  'link',
  'image',
  'video',
  'table',
  'codeBlock',
  '|',
  'alignLeft',
  'alignCenter',
  'alignRight',
  '|',
  'templates',
  'blocks',
  'media',
  '|',
  'preview',
];
```

## Phase 2: Core Components Implementation

### 2.1 Unified Content Editor

#### `src/components/content/UnifiedContentEditor.tsx`

```typescript
import React, { useCallback, useMemo, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';

import type { 
  UnifiedContentEditorProps, 
  ContentEditorConfig, 
  EditorMode 
} from './types';
import { getConfigForMode } from './modes';
import { createExtensionsForMode } from './utils/editor-utils';
import { Toolbar } from './components/Toolbar';
import { BubbleMenu } from './components/BubbleMenu';
import { FloatingMenu } from './components/FloatingMenu';
import { MediaManager } from './components/MediaManager';
import { BlockSelector } from './components/BlockSelector';

export const UnifiedContentEditor: React.FC<UnifiedContentEditorProps> = ({
  content = '',
  onChange,
  mode = 'standard',
  config: userConfig,
  brandId,
  siteId,
  onMediaSelect,
  onTemplateSelect,
  showBlockSelector = false,
  enableLivePreview = false,
  className = '',
  editable = true,
  disabled = false,
  loading = false,
  error,
  ...rest
}) => {
  const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Get configuration for the specified mode
  const config = useMemo(() => {
    const baseConfig = getConfigForMode(mode);
    return {
      ...baseConfig,
      ...userConfig,
      ui: {
        ...baseConfig.ui,
        ...userConfig?.ui,
      },
      features: {
        ...baseConfig.features,
        ...userConfig?.features,
      },
    };
  }, [mode, userConfig]);

  // Create extensions based on mode and configuration
  const extensions = useMemo(() => {
    return createExtensionsForMode(config, {
      placeholder: config.ui.placeholder,
      maxLength: config.ui.maxLength,
      characterCount: config.features.characterCount,
    });
  }, [config]);

  // Initialize editor
  const editor = useEditor({
    extensions,
    content,
    editable: editable && !disabled,
    onUpdate: ({ editor }) => {
      if (onChange) {
        const output = config.output.type === 'json' 
          ? editor.getJSON() 
          : editor.getHTML();
        onChange(output, config.output.type);
      }
    },
    editorProps: {
      attributes: {
        class: `prose prose-lg max-w-none focus:outline-none ${className}`,
      },
    },
  });

  // Handle media selection
  const handleMediaSelect = useCallback((media: MediaAsset[]) => {
    if (editor && media.length > 0) {
      media.forEach(asset => {
        if (asset.type === 'image') {
          editor.chain().focus().setImage({ 
            src: asset.url, 
            alt: asset.alt || '' 
          }).run();
        }
      });
    }
    onMediaSelect?.(media);
    setIsMediaManagerOpen(false);
  }, [editor, onMediaSelect]);

  // Handle template selection
  const handleTemplateSelect = useCallback((template: BlockTemplate) => {
    if (editor && template.content) {
      editor.chain().focus().insertContent(template.content).run();
    }
    onTemplateSelect?.(template);
  }, [editor, onTemplateSelect]);

  // Handle preview mode toggle
  const togglePreviewMode = useCallback(() => {
    setIsPreviewMode(!isPreviewMode);
  }, [isPreviewMode]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-200 bg-red-50 p-4 rounded-lg">
        <div className="text-red-800">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      {config.ui.toolbar.show && editable && !isPreviewMode && (
        <Toolbar
          editor={editor}
          config={config}
          onMediaSelect={() => setIsMediaManagerOpen(true)}
          onPreviewToggle={togglePreviewMode}
          isPreviewMode={isPreviewMode}
        />
      )}

      {/* Block Selector */}
      {showBlockSelector && config.features.templates && editable && !isPreviewMode && (
        <BlockSelector
          onTemplateSelect={handleTemplateSelect}
          config={config}
        />
      )}

      {/* Editor Content */}
      <div className={isPreviewMode ? 'p-4 bg-white' : ''}>
        <EditorContent
          editor={editor}
          className={isPreviewMode ? '' : 'min-h-[400px]'}
        />
      </div>

      {/* Bubble Menu */}
      {config.ui.menus.bubble && editable && !isPreviewMode && (
        <BubbleMenu editor={editor} config={config} />
      )}

      {/* Floating Menu */}
      {config.ui.menus.floating && editable && !isPreviewMode && (
        <FloatingMenu editor={editor} config={config} />
      )}

      {/* Character/Word Count */}
      {config.features.characterCount && editable && !isPreviewMode && (
        <div className="border-t bg-gray-50 px-3 py-2 text-sm text-gray-600">
          <div className="flex items-center gap-4">
            {config.features.wordCount && (
              <span>Words: {editor?.storage.characterCount?.words?.() || 0}</span>
            )}
            <span>Characters: {editor?.storage.characterCount?.characters?.() || 0}</span>
          </div>
        </div>
      )}

      {/* Media Manager */}
      {config.features.media && (
        <MediaManager
          isOpen={isMediaManagerOpen}
          onClose={() => setIsMediaManagerOpen(false)}
          onMediaSelect={handleMediaSelect}
          brandId={brandId}
          siteId={siteId}
          config={config.integrations.media}
        />
      )}
    </div>
  );
};

export default UnifiedContentEditor;
```

### 2.2 Utility Functions

#### `src/components/content/utils/editor-utils.ts`

```typescript
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';

import type { ContentEditorConfig } from '../types';

const lowlight = createLowlight();

export function createExtensionsForMode(
  config: ContentEditorConfig,
  options: {
    placeholder?: string;
    maxLength?: number;
    characterCount?: boolean;
  } = {}
) {
  const extensions: any[] = [
    StarterKit.configure({
      codeBlock: false,
    }),
  ];

  // Add underline for advanced modes
  if (config.features.advancedFormatting) {
    extensions.push(Underline);
  }

  // Add text alignment for advanced modes
  if (config.features.advancedFormatting) {
    extensions.push(TextAlign.configure({
      types: ['heading', 'paragraph'],
    }));
  }

  // Add placeholder
  if (options.placeholder) {
    extensions.push(Placeholder.configure({
      placeholder: options.placeholder,
    }));
  }

  // Add character count
  if (options.characterCount) {
    extensions.push(CharacterCount);
  }

  // Add link support
  extensions.push(Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-blue-600 hover:text-blue-800 underline',
    },
    validate: (href) => /^https?:\/\//.test(href),
  }));

  // Add image support for modes with media
  if (config.features.media) {
    extensions.push(Image.configure({
      HTMLAttributes: {
        class: 'max-w-full h-auto rounded-lg',
      },
      allowBase64: false,
      inline: false,
      draggable: true,
    }));
  }

  // Add table support
  if (config.features.tables) {
    extensions.push(
      Table.configure({
        resizable: true,
        allowTableNodeSelection: true,
      }),
      TableRow,
      TableHeader,
      TableCell
    );
  }

  // Add code blocks for advanced modes
  if (config.features.codeBlocks) {
    extensions.push(CodeBlockLowlight.configure({
      lowlight,
      HTMLAttributes: {
        class: 'bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto',
      },
    }));
  }

  return extensions;
}

export function getToolbarForMode(mode: EditorMode) {
  switch (mode) {
    case 'simple':
      return [
        'bold',
        'italic',
        'underline',
        '|',
        'undo',
        'redo',
      ];
    case 'standard':
      return [
        'undo',
        'redo',
        '|',
        'heading',
        'bold',
        'italic',
        'underline',
        '|',
        'bulletList',
        'orderedList',
        'blockquote',
        '|',
        'link',
        'image',
        '|',
        'alignLeft',
        'alignCenter',
        'alignRight',
      ];
    case 'advanced':
      return [
        'undo',
        'redo',
        '|',
        'heading',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        '|',
        'bulletList',
        'orderedList',
        'blockquote',
        'codeBlock',
        '|',
        'link',
        'image',
        'table',
        '|',
        'alignLeft',
        'alignCenter',
        'alignRight',
        '|',
        'preview',
      ];
    case 'cms':
      return [
        'undo',
        'redo',
        '|',
        'heading',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        '|',
        'bulletList',
        'orderedList',
        'blockquote',
        'codeBlock',
        '|',
        'link',
        'image',
        'video',
        'table',
        '|',
        'alignLeft',
        'alignCenter',
        'alignRight',
        '|',
        'templates',
        'blocks',
        'media',
        '|',
        'preview',
      ];
    default:
      return [];
  }
}
```

## Phase 3: Migration Implementation

### 3.1 Backward Compatibility Wrappers

#### `src/components/content/wrappers/CMSRichContentEditor.tsx`

```typescript
import React from 'react';
import { UnifiedContentEditor } from '../UnifiedContentEditor';
import type { JSONContent } from '@tiptap/react';
import type { RichContentNode } from '../../../types/cms';

// Legacy wrapper for CMS RichContentEditor
interface LegacyCMSRichContentEditorProps {
  content?: JSONContent | RichContentNode;
  onChange?: (content: JSONContent | RichContentNode) => void;
  brandId?: string;
  siteId?: string;
  editable?: boolean;
  showToolbar?: boolean;
  showBlockSelector?: boolean;
  placeholder?: string;
  className?: string;
}

export const CMSRichContentEditor: React.FC<LegacyCMSRichContentEditorProps> = ({
  content,
  onChange,
  brandId,
  siteId,
  editable = true,
  showToolbar = true,
  showBlockSelector = false,
  placeholder = 'Start writing...',
  className,
}) => {
  // Convert content to unified format
  const unifiedContent = React.useMemo(() => {
    if (!content) return '';
    
    // Handle different content types
    if (typeof content === 'string') {
      return content;
    }
    
    // Convert RichContentNode to JSONContent if needed
    if (content && typeof content === 'object' && 'type' in content) {
      return content as JSONContent;
    }
    
    return content as JSONContent;
  }, [content]);

  // Handle content changes
  const handleChange = React.useCallback((newContent: string | JSONContent) => {
    if (onChange) {
      // Convert back to expected format
      onChange(newContent as JSONContent);
    }
  }, [onChange]);

  return (
    <UnifiedContentEditor
      content={unifiedContent}
      onChange={handleChange}
      mode="cms"
      brandId={brandId}
      siteId={siteId}
      editable={editable}
      config={{
        ui: {
          toolbar: {
            show: showToolbar,
          },
        },
      }}
      showBlockSelector={showBlockSelector}
      placeholder={placeholder}
      className={className}
    />
  );
};

export default CMSRichContentEditor;
```

#### `src/components/content/wrappers/ContentRichContentEditor.tsx`

```typescript
import React from 'react';
import { UnifiedContentEditor } from '../UnifiedContentEditor';

// Legacy wrapper for Content RichContentEditor
interface LegacyContentRichContentEditorProps {
  content: string;
  onChange?: (content: string) => void;
  editable?: boolean;
  placeholder?: string;
  className?: string;
  showMenuBar?: boolean;
  showBubbleMenu?: boolean;
  showFloatingMenu?: boolean;
  maxLength?: number;
}

export const ContentRichContentEditor: React.FC<LegacyContentRichContentEditorProps> = ({
  content,
  onChange,
  editable = true,
  placeholder = 'Start writing...',
  className,
  showMenuBar = true,
  showBubbleMenu = true,
  showFloatingMenu = true,
  maxLength,
}) => {
  // Handle content changes
  const handleChange = React.useCallback((newContent: string | JSONContent) => {
    if (onChange && typeof newContent === 'string') {
      onChange(newContent);
    }
  }, [onChange]);

  return (
    <UnifiedContentEditor
      content={content}
      onChange={handleChange}
      mode="advanced"
      editable={editable}
      config={{
        ui: {
          toolbar: {
            show: showMenuBar,
          },
          menus: {
            bubble: showBubbleMenu,
            floating: showFloatingMenu,
          },
          placeholder,
          maxLength,
        },
      }}
      className={className}
    />
  );
};

export default ContentRichContentEditor;
```

### 3.2 Migration Script

#### `scripts/migrate-content-components.js`

```javascript
const fs = require('fs');
const path = require('path');

// Migration mappings
const migrationMap = {
  'cms/editor/RichContentEditor': 'content/wrappers/CMSRichContentEditor',
  'content/RichContentEditor': 'content/wrappers/ContentRichContentEditor',
  'editor/RichTextEditor': 'content/UnifiedContentEditor',
  'admin/RichTextEditor': 'content/UnifiedContentEditor',
};

// Function to update import statements
function updateImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  for (const [oldPath, newPath] of Object.entries(migrationMap)) {
    const oldImportRegex = new RegExp(`from ['"]@/components/${oldPath}['"]`, 'g');
    const newImport = `from '@/components/${newPath}'`;
    
    if (oldImportRegex.test(content)) {
      updated = true;
      content.replace(oldImportRegex, newImport);
    }
  }
  
  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated imports in: ${filePath}`);
  }
}

// Function to recursively process files
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      updateImports(filePath);
    }
  }
}

// Run migration
console.log('Starting content component migration...');
processDirectory('src');
console.log('Migration completed!');
```

## Phase 4: Testing Strategy

### 4.1 Unit Tests

#### `src/components/content/__tests__/UnifiedContentEditor.test.tsx`

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UnifiedContentEditor } from '../UnifiedContentEditor';

describe('UnifiedContentEditor', () => {
  const defaultProps = {
    content: '<p>Test content</p>',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders in simple mode', () => {
    render(
      <UnifiedContentEditor 
        {...defaultProps} 
        mode="simple" 
      />
    );
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /image/i })).not.toBeInTheDocument();
  });

  it('renders in cms mode with media features', () => {
    render(
      <UnifiedContentEditor 
        {...defaultProps} 
        mode="cms" 
        brandId="test-brand"
        siteId="test-site"
      />
    );
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /image/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /media/i })).toBeInTheDocument();
  });

  it('handles content changes', () => {
    const mockOnChange = jest.fn();
    render(
      <UnifiedContentEditor 
        {...defaultProps} 
        onChange={mockOnChange}
        mode="standard"
      />
    );
    
    const editor = screen.getByRole('textbox');
    fireEvent.input(editor, { target: { textContent: 'New content' } });
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(
      <UnifiedContentEditor 
        {...defaultProps} 
        loading={true} 
      />
    );
    
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(
      <UnifiedContentEditor 
        {...defaultProps} 
        error="Test error" 
      />
    );
    
    expect(screen.getByText(/error/i)).toBeInTheDocument();
    expect(screen.getByText(/test error/i)).toBeInTheDocument();
  });

  it('toggles preview mode', () => {
    render(
      <UnifiedContentEditor 
        {...defaultProps} 
        mode="advanced"
      />
    );
    
    const previewButton = screen.getByRole('button', { name: /preview/i });
    fireEvent.click(previewButton);
    
    expect(screen.getByTestId('preview-content')).toBeInTheDocument();
  });
});
```

### 4.2 Integration Tests

#### `src/components/content/__tests__/integration.test.tsx`

```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UnifiedContentEditor } from '../UnifiedContentEditor';
import { UnifiedBlockSystem } from '../UnifiedBlockSystem';

describe('Content Management Integration', () => {
  it('integrates editor with block system', async () => {
    const onContentChange = jest.fn();
    const onBlocksChange = jest.fn();
    
    render(
      <div>
        <UnifiedContentEditor
          mode="cms"
          content=""
          onChange={onContentChange}
          showBlockSelector={true}
        />
        <UnifiedBlockSystem
          blocks={[]}
          onChange={onBlocksChange}
        />
      </div>
    );
    
    // Add a text block
    const textBlockButton = screen.getByRole('button', { name: /paragraph/i });
    fireEvent.click(textBlockButton);
    
    await waitFor(() => {
      expect(onBlocksChange).toHaveBeenCalled();
    });
  });

  it('handles media integration', async () => {
    const onMediaSelect = jest.fn();
    const mockMedia = [
      {
        id: '1',
        url: 'https://example.com/image.jpg',
        type: 'image',
        filename: 'test.jpg',
        size: 1024,
        mime_type: 'image/jpeg',
      }
    ];
    
    render(
      <UnifiedContentEditor
        mode="cms"
        content=""
        onChange={jest.fn()}
        onMediaSelect={onMediaSelect}
        brandId="test-brand"
        siteId="test-site"
      />
    );
    
    // Open media manager
    const mediaButton = screen.getByRole('button', { name: /media/i });
    fireEvent.click(mediaButton);
    
    // Select media
    const mediaItem = screen.getByText(/test\.jpg/i);
    fireEvent.click(mediaItem);
    
    const insertButton = screen.getByRole('button', { name: /insert/i });
    fireEvent.click(insertButton);
    
    await waitFor(() => {
      expect(onMediaSelect).toHaveBeenCalledWith(mockMedia);
    });
  });
});
```

## Phase 5: Performance Optimization

### 5.1 Code Splitting

#### `src/components/content/lazy.ts`

```typescript
import { lazy } from 'react';

// Lazy load heavy components
export const LazyMediaManager = lazy(() => import('./components/MediaManager'));
export const LazyBlockSelector = lazy(() => import('./components/BlockSelector'));
export const LazyTemplateEditor = lazy(() => import('./components/TemplateEditor'));

// Lazy load mode-specific configurations
export const LazyCMSConfig = lazy(() => import('./modes/cms'));
export const LazyAdvancedConfig = lazy(() => import('./modes/advanced'));
```

### 5.2 Bundle Optimization

#### `src/components/content/utils/bundle-optimizer.ts`

```typescript
// Dynamic extension loading
export async function loadExtensionsForMode(mode: EditorMode) {
  switch (mode) {
    case 'simple':
      return (await import('./extensions/simple')).default;
    case 'standard':
      return (await import('./extensions/standard')).default;
    case 'advanced':
      return (await import('./extensions/advanced')).default;
    case 'cms':
      return (await import('./extensions/cms')).default;
    default:
      return (await import('./extensions/standard')).default;
  }
}

// Tree-shakeable utilities
export const createMinimalEditor = (config: Partial<ContentEditorConfig>) => {
  // Create editor with minimal features
};
```

## Deployment Strategy

### 1. Feature Flags

```typescript
// src/config/feature-flags.ts
export const FEATURE_FLAGS = {
  UNIFIED_CONTENT_EDITOR: process.env.REACT_APP_ENABLE_UNIFIED_EDITOR === 'true',
  LEGACY_EDITOR_SUPPORT: process.env.REACT_APP_LEGACY_EDITOR_SUPPORT === 'true',
  MIGRATION_MODE: process.env.REACT_APP_MIGRATION_MODE === 'true',
};
```

### 2. Gradual Rollout

```typescript
// src/components/content/utils/rollout.ts
export function shouldUseUnifiedEditor(userId?: string): boolean {
  // Implement gradual rollout logic
  const rolloutPercentage = 0.1; // Start with 10% of users
  
  if (!userId) return false;
  
  const hash = hashCode(userId);
  return (hash % 100) < (rolloutPercentage * 100);
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
```

## Monitoring and Analytics

### 1. Performance Monitoring

```typescript
// src/components/content/utils/performance.ts
export class EditorPerformanceMonitor {
  private static instance: EditorPerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  
  static getInstance(): EditorPerformanceMonitor {
    if (!EditorPerformanceMonitor.instance) {
      EditorPerformanceMonitor.instance = new EditorPerformanceMonitor();
    }
    return EditorPerformanceMonitor.instance;
  }
  
  startTimer(name: string): void {
    this.metrics.set(name, performance.now());
  }
  
  endTimer(name: string): number {
    const startTime = this.metrics.get(name);
    if (!startTime) return 0;
    
    const duration = performance.now() - startTime;
    this.metrics.delete(name);
    
    // Send to analytics
    this.sendMetric(name, duration);
    
    return duration;
  }
  
  private sendMetric(name: string, duration: number): void {
    // Send to analytics service
    if (window.gtag) {
      window.gtag('event', 'editor_performance', {
        metric_name: name,
        duration: duration,
      });
    }
  }
}
```

### 2. Error Tracking

```typescript
// src/components/content/utils/error-tracking.ts
export class EditorErrorTracker {
  static trackError(error: Error, context: {
    mode: EditorMode;
    component: string;
    action?: string;
  }): void {
    // Send to error tracking service
    console.error('Editor Error:', error, context);
    
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: {
          component: context.component,
          mode: context.mode,
        },
        extra: {
          action: context.action,
        },
      });
    }
  }
}
```

## Conclusion

This implementation guide provides a comprehensive approach to unifying the CMS and Content architectures. The key benefits are:

1. **Single Source of Truth**: One unified editor with configurable modes
2. **Backward Compatibility**: Gradual migration without breaking changes
3. **Performance Optimization**: Code splitting and lazy loading
4. **Maintainability**: Reduced code duplication and consistent APIs
5. **Extensibility**: Easy to add new features and modes

The phased approach ensures a smooth transition while maintaining system stability and providing immediate value to developers and users.