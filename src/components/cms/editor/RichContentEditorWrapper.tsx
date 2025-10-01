import { UnifiedRichTextEditor } from '@/components/editor'
import type { JSONContent } from '@tiptap/react'
import type { RichContentNode } from '../../../types/cms'

// Legacy wrapper for the CMS RichContentEditor
// This maintains backward compatibility with any existing usage
interface RichContentEditorProps {
  content?: JSONContent | RichContentNode
  onChange?: (content: JSONContent | RichContentNode) => void
  brandId?: string
  siteId?: string
  editable?: boolean
  showToolbar?: boolean
  showBlockSelector?: boolean
  placeholder?: string
}

export const RichContentEditor: React.FC<RichContentEditorProps> = ({
  content,
  onChange,
  brandId,
  siteId,
  editable = true,
  showToolbar = true,
  showBlockSelector = false,
  placeholder = 'Start writing...'
}) => {
  // Convert RichContentNode to JSONContent if needed
  const convertedContent = content as JSONContent

  const handleChange = (newContent: JSONContent | string) => {
    if (onChange) {
      onChange(newContent as JSONContent)
    }
  }

  return (
    <UnifiedRichTextEditor
      content={convertedContent}
      onChange={handleChange}
      brandId={brandId}
      siteId={siteId}
      editable={editable}
      toolbar={showToolbar}
      showBlockSelector={showBlockSelector}
      placeholder={placeholder}
      mode="cms"
    />
  )
}

export default RichContentEditor