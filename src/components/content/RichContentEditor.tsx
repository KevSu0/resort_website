import React, { useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Link as LinkIcon,
  Table as TableIcon,
  Undo,
  Redo
} from 'lucide-react';

interface RichContentEditorProps {
  content: string;
  onChange?: (content: string) => void;
  editable?: boolean;
  placeholder?: string;
  className?: string;
  showMenuBar?: boolean;
  showBubbleMenu?: boolean;
  showFloatingMenu?: boolean;
}

const RichContentEditor: React.FC<RichContentEditorProps> = ({
  content,
  onChange,
  editable = true,
  placeholder = 'Start writing...',
  className = '',
  showMenuBar = true
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
      Table.configure({
        resizable: true,
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
          class: 'border border-gray-300 bg-gray-50 px-4 py-2 text-left font-semibold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight: createLowlight(),
        HTMLAttributes: {
          class: 'bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto',
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-lg max-w-none focus:outline-none ${className}`,
        placeholder,
      },
    },
  });

  
  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null && editor) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    if (url && editor) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  const insertTable = useCallback(() => {
    if (editor) {
      editor.chain().focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    }
  }, [editor]);

  const addColumn = useCallback(() => {
    if (editor) {
      editor.chain().focus().addColumnAfter().run();
    }
  }, [editor]);

  const deleteColumn = useCallback(() => {
    if (editor) {
      editor.chain().focus().deleteColumn().run();
    }
  }, [editor]);

  const addRow = useCallback(() => {
    if (editor) {
      editor.chain().focus().addRowAfter().run();
    }
  }, [editor]);

  const deleteRow = useCallback(() => {
    if (editor) {
      editor.chain().focus().deleteRow().run();
    }
  }, [editor]);

  const deleteTable = useCallback(() => {
    if (editor) {
      editor.chain().focus().deleteTable().run();
    }
  }, [editor]);

  
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative">
      {showMenuBar && editable && (
        <Card className="mb-4 p-2 border-b">
          <div className="flex items-center gap-1 flex-wrap">
            <div className="flex items-center gap-1 border-r pr-2 mr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="h-8 w-8 p-0"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="h-8 w-8 p-0"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1 border-r pr-2 mr-2">
              <Button
                variant={editor.isActive('heading', { level: 1 }) ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className="h-8 w-8 p-0"
              >
                <Heading1 className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className="h-8 w-8 p-0"
              >
                <Heading2 className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive('heading', { level: 3 }) ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className="h-8 w-8 p-0"
              >
                <Heading3 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1 border-r pr-2 mr-2">
              <Button
                variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className="h-8 w-8 p-0"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className="h-8 w-8 p-0"
              >
                <Italic className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1 border-r pr-2 mr-2">
              <Button
                variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className="h-8 w-8 p-0"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className="h-8 w-8 p-0"
              >
                <Quote className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive('code') ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className="h-8 w-8 p-0"
              >
                <Code className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant={editor.isActive('link') ? 'secondary' : 'ghost'}
                size="sm"
                onClick={setLink}
                className="h-8 w-8 p-0"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={addImage}
                className="h-8 w-8 p-0"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={insertTable}
                className="h-8 w-8 p-0"
              >
                <TableIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* BubbleMenu temporarily disabled
      {showBubbleMenu && editable && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="bg-white border rounded-lg shadow-lg p-1 flex items-center gap-1"
        >
          <Button
            variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className="h-8 w-8 p-0"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('link') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={setLink}
            className="h-8 w-8 p-0"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </BubbleMenu>
      )}
      */}

      {/* FloatingMenu temporarily disabled
      {showFloatingMenu && editable && (
        <FloatingMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="bg-white border rounded-lg shadow-lg p-1"
        >
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className="justify-start h-8 px-2"
            >
              <Heading1 className="h-4 w-4 mr-2" />
              Heading 1
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className="justify-start h-8 px-2"
            >
              <Heading2 className="h-4 w-4 mr-2" />
              Heading 2
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className="justify-start h-8 px-2"
            >
              <List className="h-4 w-4 mr-2" />
              Bullet List
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className="justify-start h-8 px-2"
            >
              <ListOrdered className="h-4 w-4 mr-2" />
              Numbered List
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className="justify-start h-8 px-2"
            >
              <Quote className="h-4 w-4 mr-2" />
              Quote
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={addImage}
              className="justify-start h-8 px-2"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Image
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={insertTable}
              className="justify-start h-8 px-2"
            >
              <TableIcon className="h-4 w-4 mr-2" />
              Table
            </Button>
          </div>
        </FloatingMenu>
      )}
      */}

      <div className="min-h-[200px] border rounded-lg">
        <EditorContent editor={editor} />
      </div>

      {editable && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span>Words: {editor.storage.characterCount.words()}</span>
            <span>Characters: {editor.storage.characterCount.characters()}</span>
          </div>
          <div className="flex items-center gap-2">
            {editor.isActive('table') && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addColumn}
                  className="h-6 px-2 text-xs"
                >
                  Add Column
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={deleteColumn}
                  className="h-6 px-2 text-xs"
                >
                  Delete Column
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addRow}
                  className="h-6 px-2 text-xs"
                >
                  Add Row
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={deleteRow}
                  className="h-6 px-2 text-xs"
                >
                  Delete Row
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={deleteTable}
                  className="h-6 px-2 text-xs"
                >
                  Delete Table
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RichContentEditor;