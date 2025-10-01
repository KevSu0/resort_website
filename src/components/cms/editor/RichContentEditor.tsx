import React, { useCallback, useMemo, useState } from 'react';
import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import {
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Code,
  Quote,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Eye,
  EyeOff,
} from 'lucide-react';

import { Button } from '../../ui/button';
import { MediaAsset } from '../../../types/cms';
import { MediaManager } from './MediaManager';
import { BlockSelector } from './BlockSelector';
import { useToast } from '../../../hooks/useToast';

const lowlight = createLowlight();

interface RichContentEditorProps {
  content?: JSONContent;
  onChange?: (content: JSONContent) => void;
  onMediaSelect?: (media: MediaAsset[]) => void;
  brandId?: string;
  siteId?: string;
  className?: string;
  placeholder?: string;
  editable?: boolean;
  showToolbar?: boolean;
  showBlockSelector?: boolean;
  extensions?: unknown[];
  autoFocus?: boolean;
  maxLength?: number;
}

export const RichContentEditor: React.FC<RichContentEditorProps> = ({
  content,
  onChange,
  onMediaSelect,
  brandId,
  siteId,
  className = '',
  placeholder = 'Start typing...',
  editable = true,
  showToolbar = true,
  showBlockSelector = true,
  extensions = [],
  autoFocus = false,
  maxLength,
}) => {
  const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const { addToast } = useToast();

  const defaultExtensions = useMemo(() => [
    StarterKit.configure({
      codeBlock: false,
    }),
    Image.configure({
      HTMLAttributes: {
        class: 'max-w-full h-auto rounded-lg',
      },
      allowBase64: false,
      inline: false,
      draggable: true,
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-600 hover:text-blue-800 underline',
      },
      validate: (href) => /^https?:\/\//.test(href),
    }),
    Table.configure({
      resizable: true,
      allowTableNodeSelection: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    CodeBlockLowlight.configure({
      lowlight,
      HTMLAttributes: {
        class: 'bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto',
      },
    }),
    ...extensions,
  ], [extensions]);

  const editor = useEditor({
    extensions: defaultExtensions,
    content,
    editable,
    autoFocus,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange?.(json);

      // Check character limit
      if (maxLength) {
        const text = editor.getText();
        if (text.length > maxLength) {
          // Remove excess characters
          editor.commands.setContent(text.substring(0, maxLength));
          addToast({
            type: 'warning',
            message: `Content truncated to ${maxLength} characters`,
          });
        }
      }
    },
    editorProps: {
      attributes: {
        class: `prose prose-lg max-w-none focus:outline-none ${editable ? 'min-h-[300px]' : ''} ${className}`,
        style: editable ? 'padding: 1rem;' : '',
      },
    },
  });

  const handleImageInsert = useCallback((mediaAssets: MediaAsset[]) => {
    if (editor && mediaAssets.length > 0) {
      mediaAssets.forEach(asset => {
        if (asset.type === 'image') {
          editor.chain().focus().setImage({ src: asset.url, alt: asset.alt || '' }).run();
        }
      });
      onMediaSelect?.(mediaAssets);
    }
    setIsMediaManagerOpen(false);
  }, [editor, onMediaSelect]);

  const handleLinkInsert = useCallback(() => {
    if (editor && linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  }, [editor, linkUrl]);

  const handleBlockInsert = useCallback((blockTemplate: { content: string }) => {
    if (editor && blockTemplate.content) {
      editor.chain().focus().insertContent(blockTemplate.content).run();
    }
  }, [editor]);

  const ToolbarButton = ({
    icon: Icon,
    onClick,
    isActive = false,
    disabled = false,
    title
  }: {
    icon: React.ElementType;
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    title: string;
  }) => (
    <Button
      type="button"
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      disabled={disabled || !editable}
      title={title}
      className="h-8 w-8 p-0"
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  if (!editor) {
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

  return (
    <div className="border rounded-lg overflow-hidden">
      {showToolbar && editable && (
        <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1">
          {/* Text Formatting */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <ToolbarButton
              icon={Bold}
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold (Ctrl+B)"
            />
            <ToolbarButton
              icon={Italic}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic (Ctrl+I)"
            />
            <ToolbarButton
              icon={Underline}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              title="Underline"
            />
            <ToolbarButton
              icon={Code}
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              title="Inline Code"
            />
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <ToolbarButton
              icon={List}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Bullet List"
            />
            <ToolbarButton
              icon={ListOrdered}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="Numbered List"
            />
            <ToolbarButton
              icon={Quote}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="Quote"
            />
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <ToolbarButton
              icon={AlignLeft}
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
              title="Align Left"
            />
            <ToolbarButton
              icon={AlignCenter}
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
              title="Align Center"
            />
            <ToolbarButton
              icon={AlignRight}
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
              title="Align Right"
            />
          </div>

          {/* Media & Links */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <ToolbarButton
              icon={LinkIcon}
              onClick={() => setShowLinkDialog(true)}
              isActive={editor.isActive('link')}
              title="Insert Link"
            />
            <ToolbarButton
              icon={ImageIcon}
              onClick={() => setIsMediaManagerOpen(true)}
              title="Insert Image"
            />
            <ToolbarButton
              icon={TableIcon}
              onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
              title="Insert Table"
            />
          </div>

          {/* History */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <ToolbarButton
              icon={Undo}
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo"
            />
            <ToolbarButton
              icon={Redo}
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo"
            />
          </div>

          {/* View Mode */}
          <div className="flex items-center gap-1 ml-auto">
            <ToolbarButton
              icon={isPreviewMode ? Eye : EyeOff}
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              title={isPreviewMode ? "Edit Mode" : "Preview Mode"}
            />
          </div>
        </div>
      )}

      {/* Block Selector */}
      {showBlockSelector && editable && !isPreviewMode && (
        <div className="border-b bg-blue-50 p-2">
          <BlockSelector onBlockSelect={handleBlockInsert} />
        </div>
      )}

      {/* Editor Content */}
      <div className={isPreviewMode ? 'p-4 bg-white' : ''}>
        <EditorContent
          editor={editor}
          className={!isPreviewMode ? 'min-h-[400px]' : ''}
          placeholder={placeholder}
        />
      </div>

      {/* Character Count */}
      {maxLength && (
        <div className="border-t bg-gray-50 px-3 py-2 text-sm text-gray-600">
          {editor.getText().length} / {maxLength} characters
        </div>
      )}

      {/* Media Manager Dialog */}
      <MediaManager
        isOpen={isMediaManagerOpen}
        onClose={() => setIsMediaManagerOpen(false)}
        onMediaSelect={handleImageInsert}
        brandId={brandId}
        siteId={siteId}
        acceptedTypes={['image/*']}
        multiple={false}
      />

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <input
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowLinkDialog(false);
                  setLinkUrl('');
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleLinkInsert}
                disabled={!linkUrl}
              >
                Insert Link
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};