import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Underline from '@tiptap/extension-underline'
import { createLowlight } from 'lowlight'
import { cn } from '@/lib/utils'
import { useState, useCallback, useMemo } from 'react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Undo,
  Redo,
  ChevronDown,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type {
  UnifiedRichTextEditorProps
} from './types'

// Configure syntax highlighting
const lowlight = createLowlight()

export const UnifiedRichTextEditor: React.FC<UnifiedRichTextEditorProps> = ({
  content = '',
  onChange,
  className = '',
  editable = true,
  toolbar = true,
  maxLength,
  autoFocus = false,
  mode = 'standard',
  showPreviewMode = false,
  extensions = [],
  placeholder
}) => {
  const [linkUrl, setLinkUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  // Determine content format based on mode
  const contentFormat = useMemo(() => {
    return mode === 'cms' ? 'json' : 'html'
  }, [mode])

  // Default extensions based on mode
  const defaultExtensions = useMemo(() => {
    const baseExtensions: import('@tiptap/core').Extension[] = [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
        allowBase64: false,
        inline: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
        validate: (href) => /^https?:\/\//.test(href),
      }),
      Underline,
    ]

    // Add table support for standard and advanced modes
    if (mode === 'standard' || mode === 'advanced' || mode === 'cms') {
      baseExtensions.push(
        Table.configure({
          resizable: true,
          allowTableNodeSelection: true,
          HTMLAttributes: {
            class: 'border-collapse table-auto w-full',
          },
        }),
        TableRow.configure({
          HTMLAttributes: {
            class: 'border-b',
          },
        }),
        TableHeader.configure({
          HTMLAttributes: {
            class: 'border border-gray-300 bg-gray-50 px-4 py-2 text-left font-semibold text-gray-900',
          },
        }),
        TableCell.configure({
          HTMLAttributes: {
            class: 'border border-gray-300 px-4 py-2',
          },
        })
      )
    }

    // Add code highlighting for advanced and CMS modes
    if (mode === 'advanced' || mode === 'cms') {
      baseExtensions.push(
        CodeBlockLowlight.configure({
          lowlight,
          HTMLAttributes: {
            class: 'bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto',
          },
        })
      )
    }

    return [...baseExtensions, ...extensions]
  }, [mode, extensions])

  // Initialize editor
  const editor = useEditor({
    extensions: defaultExtensions,
    content: typeof content === 'string' ? content : '',
    editable,
    autofocus: autoFocus,
    onUpdate: ({ editor }) => {
      if (contentFormat === 'json') {
        const json = editor.getJSON()
        onChange?.(json, 'json')
      } else {
        const html = editor.getHTML()
        if (maxLength && html.length > maxLength) {
          return
        }
        onChange?.(html, 'html')
      }
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-lg max-w-none focus:outline-none',
          'prose-headings:font-bold prose-headings:text-gray-900',
          'prose-p:text-gray-700 prose-p:leading-relaxed',
          'prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic',
          'prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-code:text-sm',
          'prose-pre:bg-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto',
          'prose-table:border-collapse prose-table:border prose-table:border-gray-300',
          'prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:px-4 prose-th:py-2 prose-th:text-left',
          'prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2',
          'prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg',
          editable ? 'min-h-[200px] p-4' : '',
          className
        ),
        placeholder,
      },
    },
  })

  // Toolbar button component
  const ToolbarButton = useCallback(({
    onClick,
    isActive = false,
    disabled = false,
    children,
    tooltip
  }: {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    children: React.ReactNode
    tooltip?: string
  }) => (
    <Button
      type="button"
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-8 w-8 p-0",
        isActive && "bg-blue-100 text-blue-700 hover:bg-blue-200"
      )}
      title={tooltip}
    >
      {children}
    </Button>
  ), [])

  // Link handling
  const setLink = useCallback(() => {
    if (linkUrl) {
      editor?.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl('')
      setIsLinkDialogOpen(false)
    }
  }, [editor, linkUrl])

  const unsetLink = useCallback(() => {
    editor?.chain().focus().unsetLink().run()
  }, [editor])

  // Image handling
  const addImage = useCallback(() => {
    if (imageUrl) {
      editor?.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl('')
      setIsImageDialogOpen(false)
    }
  }, [editor, imageUrl])

  // Table operations
  const insertTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  const deleteTable = useCallback(() => {
    editor?.chain().focus().deleteTable().run()
  }, [editor])

  const addColumnBefore = useCallback(() => {
    editor?.chain().focus().addColumnBefore().run()
  }, [editor])

  const addColumnAfter = useCallback(() => {
    editor?.chain().focus().addColumnAfter().run()
  }, [editor])

  const deleteColumn = useCallback(() => {
    editor?.chain().focus().deleteColumn().run()
  }, [editor])

  const addRowBefore = useCallback(() => {
    editor?.chain().focus().addRowBefore().run()
  }, [editor])

  const addRowAfter = useCallback(() => {
    editor?.chain().focus().addRowAfter().run()
  }, [editor])

  const deleteRow = useCallback(() => {
    editor?.chain().focus().deleteRow().run()
  }, [editor])

  // Handle link dialog trigger
  const handleLinkDialogOpen = useCallback(() => {
    if (editor) {
      setSelectedText(editor.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to
      ))
    }
    setIsLinkDialogOpen(true)
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      {toolbar && editable && !isPreviewMode && (
        <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1">
          {/* History */}
          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              tooltip="Undo (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              tooltip="Redo (Ctrl+Y)"
            >
              <Redo className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Text Formatting */}
          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              tooltip="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              tooltip="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              tooltip="Underline"
            >
              <UnderlineIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              tooltip="Inline Code"
            >
              <Code className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Headings */}
          {(mode === 'advanced' || mode === 'cms') && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                >
                  <Heading1 className="h-4 w-4 mr-1" />
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                  <Heading1 className="h-4 w-4 mr-2" />
                  Heading 1
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                  <Heading2 className="h-4 w-4 mr-2" />
                  Heading 2
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                  <Heading3 className="h-4 w-4 mr-2" />
                  Heading 3
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
                  <span className="w-4 h-4 mr-2">P</span>
                  Paragraph
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Lists */}
          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              tooltip="Bullet List"
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              tooltip="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              tooltip="Quote"
            >
              <Quote className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Alignment */}
          {(mode === 'advanced' || mode === 'cms') && (
            <div className="flex gap-1">
            </div>
          )}

          {/* Links and Media */}
          <div className="flex gap-1">
            <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleLinkDialogOpen}
                  title="Add Link"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Link</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="link-url">URL</Label>
                    <Input
                      id="link-url"
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                  {selectedText && (
                    <div>
                      <Label>Selected Text</Label>
                      <p className="text-sm text-gray-600">{selectedText}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={setLink}>Add Link</Button>
                    {editor.isActive('link') && (
                      <Button variant="outline" onClick={unsetLink}>
                        Remove Link
                      </Button>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Add Image"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Image</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="image-url">Image URL</Label>
                    <Input
                      id="image-url"
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <Button onClick={addImage}>Add Image</Button>
                </div>
              </DialogContent>
            </Dialog>

            {(mode === 'standard' || mode === 'advanced' || mode === 'cms') && (
              <ToolbarButton
                onClick={insertTable}
                tooltip="Insert Table"
              >
                <TableIcon className="h-4 w-4" />
              </ToolbarButton>
            )}
          </div>

          {/* Preview Mode Toggle */}
          {showPreviewMode && (
            <div className="ml-auto">
              <ToolbarButton
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                tooltip={isPreviewMode ? "Edit Mode" : "Preview Mode"}
              >
                {isPreviewMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </ToolbarButton>
            </div>
          )}

          {/* Character count */}
          {maxLength && (
            <div className="ml-auto text-sm text-gray-500 flex items-center px-2">
              {editor.getHTML().length}/{maxLength}
            </div>
          )}
        </div>
      )}

      {/* Table Controls (shown when table is active) */}
      {editor.isActive('table') && editable && !isPreviewMode && (
        <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={addColumnBefore}
              className="h-6 px-2 text-xs"
            >
              Add Column Before
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={addColumnAfter}
              className="h-6 px-2 text-xs"
            >
              Add Column After
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteColumn}
              className="h-6 px-2 text-xs"
            >
              Delete Column
            </Button>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={addRowBefore}
              className="h-6 px-2 text-xs"
            >
              Add Row Before
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={addRowAfter}
              className="h-6 px-2 text-xs"
            >
              Add Row After
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteRow}
              className="h-6 px-2 text-xs"
            >
              Delete Row
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={deleteTable}
            className="h-6 px-2 text-xs text-red-600"
          >
            Delete Table
          </Button>
        </div>
      )}

      {/* Editor Content */}
      <div className={cn(
        "min-h-[200px]",
        isPreviewMode ? 'p-4 bg-white' : '',
        editable && !isPreviewMode ? "focus-within:ring-2 focus-within:ring-blue-500" : ""
      )}>
        <EditorContent editor={editor} />
      </div>


      {/* Character/Word Count */}
      {editable && !isPreviewMode && (mode === 'advanced' || mode === 'cms') && (
        <div className="border-t bg-gray-50 px-3 py-2 text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>Words: {editor.storage.characterCount?.words?.() || 0}</span>
            <span>Characters: {editor.storage.characterCount?.characters?.() || editor.getText().length}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default UnifiedRichTextEditor