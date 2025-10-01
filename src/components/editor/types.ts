// Content format types
export type ContentFormat = 'html' | 'json'

// Editor configuration modes
export type EditorMode = 'simple' | 'standard' | 'advanced' | 'cms'

// Base editor props interface
export interface BaseEditorProps {
  content?: string | import('@tiptap/react').JSONContent
  onChange?: (content: string | import('@tiptap/react').JSONContent, format?: ContentFormat) => void
  placeholder?: string
  className?: string
  editable?: boolean
  toolbar?: boolean
  maxLength?: number
  autoFocus?: boolean
}

// Extended props for CMS integration
export interface CMSIntegrationProps {
  mode?: EditorMode
  brandId?: string
  siteId?: string
  onMediaSelect?: (media: import('@/types/cms').MediaAsset[]) => void
  showBlockSelector?: boolean
  showPreviewMode?: boolean
  enableBubbleMenu?: boolean
  enableFloatingMenu?: boolean
  extensions?: import('@tiptap/core').Extension[]
}

// Combined props interface
export type UnifiedRichTextEditorProps = BaseEditorProps & CMSIntegrationProps