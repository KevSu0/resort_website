import { useState } from 'react'
import { UnifiedRichTextEditor } from '../UnifiedRichTextEditor'

export const EditorDemo = () => {
  const [content, setContent] = useState('<p>Hello <strong>world</strong>!</p>')
  const [mode, setMode] = useState<'simple' | 'standard' | 'advanced' | 'cms'>('standard')
  const [showPreview, setShowPreview] = useState(false)

  const handleContentChange = (newContent: string) => {
    if (typeof newContent === 'string') {
      setContent(newContent)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Unified Rich Text Editor Demo</h1>
      
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Editor Mode</label>
          <select 
            value={mode} 
            onChange={(e) => setMode(e.target.value as 'simple' | 'standard' | 'advanced' | 'cms')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          >
            <option value="simple">Simple</option>
            <option value="standard">Standard</option>
            <option value="advanced">Advanced</option>
            <option value="cms">CMS</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="preview"
            checked={showPreview}
            onChange={(e) => setShowPreview(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="preview" className="text-sm font-medium">Show Preview</label>
        </div>
      </div>

      <div className="mb-6">
        <UnifiedRichTextEditor
          content={content}
          onChange={handleContentChange}
          mode={mode}
          placeholder="Start typing..."
          showPreviewMode={showPreview}
        />
      </div>

      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Editor Output</h2>
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium mb-2">HTML:</h3>
          <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
            {content}
          </pre>
        </div>
      </div>

      <div className="mt-6 border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Mode Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mode === 'simple' && (
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Simple Mode</h3>
              <ul className="text-sm list-disc list-inside">
                <li>Basic text formatting</li>
                <li>Undo/redo</li>
                <li>Character count (if set)</li>
              </ul>
            </div>
          )}
          {mode === 'standard' && (
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Standard Mode</h3>
              <ul className="text-sm list-disc list-inside">
                <li>Everything from Simple mode</li>
                <li>Headings (H1, H2, H3)</li>
                <li>Lists (bullet, numbered)</li>
                <li>Blockquotes</li>
                <li>Links and images</li>
                <li>Tables</li>
              </ul>
            </div>
          )}
          {mode === 'advanced' && (
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Advanced Mode</h3>
              <ul className="text-sm list-disc list-inside">
                <li>Everything from Standard mode</li>
                <li>Code blocks with syntax highlighting</li>
                <li>Word/character count</li>
                <li>Preview mode</li>
              </ul>
            </div>
          )}
          {mode === 'cms' && (
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">CMS Mode</h3>
              <ul className="text-sm list-disc list-inside">
                <li>Everything from Advanced mode</li>
                <li>JSON content output</li>
                <li>Media library integration</li>
                <li>Block selector</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditorDemo