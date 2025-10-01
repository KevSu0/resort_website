import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Image,
  Code,
  Undo,
  Redo
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  enableMedia?: boolean;
}


export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start typing...',
  height = 300,
  enableMedia = true
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedText, setSelectedText] = useState('');

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
      setHistory([content]);
      setHistoryIndex(0);
    }
  }, [content]);

  // Save to history
  const saveToHistory = useCallback((newContent: string) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newContent);
      // Keep only last 50 versions
      if (newHistory.length > 50) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  // Handle content changes
  const handleContentChange = useCallback(() => {
    if (!editorRef.current) return;

    const newContent = editorRef.current.innerHTML;
    onChange(newContent);
    saveToHistory(newContent);
  }, [onChange, saveToHistory]);

  // Format text
  const formatText = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleContentChange();
  }, [handleContentChange]);

  // Undo/Redo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const content = history[newIndex];
      if (editorRef.current) {
        editorRef.current.innerHTML = content;
        onChange(content);
      }
    }
  }, [history, historyIndex, onChange]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const content = history[newIndex];
      if (editorRef.current) {
        editorRef.current.innerHTML = content;
        onChange(content);
      }
    }
  }, [history, historyIndex, onChange]);

  // Insert link
  const insertLink = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setSelectedText(selection.toString());
      setIsLinkModalOpen(true);
    }
  }, []);

  const confirmLink = useCallback(() => {
    if (linkUrl && selectedText) {
      const html = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${selectedText}</a>`;
      document.execCommand('insertHTML', false, html);
      handleContentChange();
      setIsLinkModalOpen(false);
      setLinkUrl('');
      setSelectedText('');
    }
  }, [linkUrl, selectedText, handleContentChange]);

  
  // Handle paste events
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    handleContentChange();
  }, [handleContentChange]);

  // Toolbar buttons
  const toolbarButtons = [
    { icon: Undo, onClick: undo, title: 'Undo', disabled: historyIndex <= 0 },
    { icon: Redo, onClick: redo, title: 'Redo', disabled: historyIndex >= history.length - 1 },
    { divider: true },
    { icon: Bold, onClick: () => formatText('bold'), title: 'Bold' },
    { icon: Italic, onClick: () => formatText('italic'), title: 'Italic' },
    { icon: Underline, onClick: () => formatText('underline'), title: 'Underline' },
    { divider: true },
    { icon: AlignLeft, onClick: () => formatText('justifyLeft'), title: 'Align Left' },
    { icon: AlignCenter, onClick: () => formatText('justifyCenter'), title: 'Align Center' },
    { icon: AlignRight, onClick: () => formatText('justifyRight'), title: 'Align Right' },
    { divider: true },
    { icon: List, onClick: () => formatText('insertUnorderedList'), title: 'Bullet List' },
    { icon: ListOrdered, onClick: () => formatText('insertOrderedList'), title: 'Numbered List' },
    { divider: true },
    { icon: Link, onClick: insertLink, title: 'Insert Link' },
    ...(enableMedia ? [{ icon: Image, onClick: () => {/* Handle image upload */}, title: 'Insert Image' }] : []),
    { icon: Code, onClick: () => formatText('formatBlock', '<pre>'), title: 'Code Block' },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Content Editor</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 p-2 border rounded-t-md bg-gray-50">
          {toolbarButtons.map((button, index) => {
            if (button.divider) {
              return <div key={`divider-${index}`} className="w-px h-6 bg-gray-300 mx-1" />;
            }

            const Icon = button.icon;
            return (
              <Button
                key={button.title}
                variant="ghost"
                size="sm"
                onClick={button.onClick}
                disabled={button.disabled}
                title={button.title}
                className="h-8 w-8 p-0"
              >
                <Icon className="h-4 w-4" />
              </Button>
            );
          })}
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          onPaste={handlePaste}
          className="min-h-[300px] p-4 border border-t-0 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ minHeight: height }}
          dangerouslySetInnerHTML={{ __html: content }}
          data-placeholder={placeholder}
        />

        {/* Link Modal */}
        {isLinkModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Insert Link</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">URL</label>
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      placeholder="https://example.com"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Text</label>
                    <input
                      type="text"
                      value={selectedText}
                      readOnly
                      className="w-full p-2 border rounded-md bg-gray-50"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsLinkModalOpen(false);
                        setLinkUrl('');
                        setSelectedText('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={confirmLink} disabled={!linkUrl}>
                      Insert
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Character count */}
        <div className="mt-2 text-sm text-gray-500">
          Characters: {content.replace(/<[^>]*>/g, '').length}
        </div>
      </CardContent>
    </Card>
  );
};

export default RichTextEditor;