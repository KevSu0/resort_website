import { UnifiedRichTextEditor } from '@/components/editor'
import type { JSONContent } from '@tiptap/react'

// Legacy wrapper for the content RichContentEditor
// This maintains backward compatibility with any existing usage
interface RichContentEditorProps {
  content: string
  onChange?: (content: string) => void
  editable?: boolean
  showToolbar?: boolean
  showBubbleMenu?: boolean
  showFloatingMenu?: boolean
  placeholder?: string
  maxLength?: number
}

export const RichContentEditor: React.FC<RichContentEditorProps> = ({
  content,
  onChange,
  editable = true,
  showToolbar = true,
  showBubbleMenu = true,
  showFloatingMenu = true,
  placeholder = 'Start writing...',
  maxLength
}) => {
  const handleChange = (newContent: string | JSONContent) => {
    if (onChange && typeof newContent === 'string') {
      onChange(newContent)
    }
  }

  return (
    <UnifiedRichTextEditor
      content={content}
      onChange={handleChange}
      editable={editable}
      toolbar={showToolbar}
      enableBubbleMenu={showBubbleMenu}
      enableFloatingMenu={showFloatingMenu}
      placeholder={placeholder}
      maxLength={maxLength}
      mode="advanced"
    />
  )
}

export default RichContentEditor