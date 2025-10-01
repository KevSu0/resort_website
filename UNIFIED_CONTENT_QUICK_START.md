# Unified Content Management - Quick Start Guide

## Overview

This guide helps developers get started with the unified content management system immediately, even before the full migration is complete.

## Installation

No additional installation required. The unified system uses existing dependencies:

```bash
# Already installed dependencies
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image
npm install lucide-react @dnd-kit/core @dnd-kit/sortable
```

## Basic Usage

### 1. Simple Text Editor

```typescript
import { UnifiedContentEditor } from '@/components/content';

function SimpleTextEditor() {
  const [content, setContent] = useState('<p>Start typing...</p>');
  
  return (
    <UnifiedContentEditor
      mode="simple"
      content={content}
      onChange={setContent}
      placeholder="Enter your text here..."
    />
  );
}
```

### 2. Standard Content Editor

```typescript
import { UnifiedContentEditor } from '@/components/content';

function BlogPostEditor() {
  const [content, setContent] = useState('');
  
  return (
    <UnifiedContentEditor
      mode="standard"
      content={content}
      onChange={setContent}
      placeholder="Write your blog post..."
      maxLength={5000}
    />
  );
}
```

### 3. Advanced Content Editor

```typescript
import { UnifiedContentEditor } from '@/components/content';

function AdvancedEditor() {
  const [content, setContent] = useState('');
  
  return (
    <UnifiedContentEditor
      mode="advanced"
      content={content}
      onChange={setContent}
      showBubbleMenu={true}
      showFloatingMenu={true}
      enablePreviewMode={true}
    />
  );
}
```

### 4. CMS Content Editor

```typescript
import { UnifiedContentEditor } from '@/components/content';

function CMSEditor() {
  const [content, setContent] = useState({});
  
  const handleMediaSelect = (media: MediaAsset[]) => {
    console.log('Selected media:', media);
  };
  
  return (
    <UnifiedContentEditor
      mode="cms"
      content={content}
      onChange={setContent}
      brandId="your-brand-id"
      siteId="your-site-id"
      onMediaSelect={handleMediaSelect}
      showBlockSelector={true}
      enableLivePreview={true}
    />
  );
}
```

## Migration from Existing Editors

### From CMS RichContentEditor

```typescript
// Before (Legacy)
import { RichContentEditor } from '@/components/cms/editor';

// After (Unified)
import { UnifiedContentEditor } from '@/components/content';

// Or use the wrapper for backward compatibility
import { RichContentEditor } from '@/components/content/wrappers/CMSRichContentEditor';
```

### From Content RichContentEditor

```typescript
// Before (Legacy)
import { RichContentEditor } from '@/components/content';

// After (Unified)
import { UnifiedContentEditor } from '@/components/content';

// Or use the wrapper for backward compatibility
import { RichContentEditor } from '@/components/content/wrappers/ContentRichContentEditor';
```

### From Editor RichTextEditor

```typescript
// Before (Legacy)
import { RichTextEditor } from '@/components/editor';

// After (Unified)
import { UnifiedContentEditor } from '@/components/content';

// Or use the wrapper for backward compatibility
import { RichTextEditor } from '@/components/content/wrappers/AdminRichTextEditor';
```

## Configuration Options

### Basic Configuration

```typescript
const config = {
  mode: 'standard',
  features: {
    basicFormatting: true,
    advancedFormatting: true,
    media: false,
    templates: false,
    tables: false,
    codeBlocks: false,
  },
  ui: {
    theme: 'light',
    toolbar: {
      show: true,
      position: 'top',
      sticky: true,
    },
    menus: {
      bubble: true,
      floating: false,
    },
  },
};

<UnifiedContentEditor
  config={config}
  content={content}
  onChange={setContent}
/>
```

### Custom Toolbar

```typescript
const customToolbar = [
  'undo',
  'redo',
  '|',
  'bold',
  'italic',
  'underline',
  '|',
  'bulletList',
  'orderedList',
  '|',
  'link',
  'image',
];

<UnifiedContentEditor
  mode="standard"
  content={content}
  onChange={setContent}
  config={{
    ui: {
      toolbar: {
        custom: customToolbar,
      },
    },
  }}
/>
```

## Working with Different Content Formats

### HTML Content

```typescript
const [htmlContent, setHtmlContent] = useState('<p>Hello <strong>world</strong></p>');

<UnifiedContentEditor
  mode="standard"
  content={htmlContent}
  onChange={(content) => {
    // content is HTML string
    setHtmlContent(content as string);
  }}
/>
```

### JSON Content

```typescript
const [jsonContent, setJsonContent] = useState({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Hello ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'world' }
      ]
    }
  ]
});

<UnifiedContentEditor
  mode="cms"
  content={jsonContent}
  onChange={(content) => {
    // content is JSON object
    setJsonContent(content as JSONContent);
  }}
/>
```

## Event Handling

### Content Change Events

```typescript
const handleContentChange = (content: string | JSONContent, format: 'html' | 'json') => {
  console.log('Content changed:', { content, format });
  
  if (format === 'html') {
    // Handle HTML content
    setHtmlContent(content as string);
  } else {
    // Handle JSON content
    setJsonContent(content as JSONContent);
  }
};

<UnifiedContentEditor
  mode="advanced"
  content={content}
  onChange={handleContentChange}
/>
```

### Media Selection Events

```typescript
const handleMediaSelect = (media: MediaAsset[]) => {
  console.log('Media selected:', media);
  
  // Process selected media files
  media.forEach(asset => {
    if (asset.type === 'image') {
      // Handle image selection
      console.log('Image selected:', asset.url);
    }
  });
};

<UnifiedContentEditor
  mode="cms"
  content={content}
  onChange={setContent}
  onMediaSelect={handleMediaSelect}
  brandId="brand-id"
  siteId="site-id"
/>
```

### Template Selection Events

```typescript
const handleTemplateSelect = (template: BlockTemplate) => {
  console.log('Template selected:', template);
  
  // Process template selection
  if (template.content) {
    // Insert template content
    setContent(template.content);
  }
};

<UnifiedContentEditor
  mode="cms"
  content={content}
  onChange={setContent}
  onTemplateSelect={handleTemplateSelect}
  showBlockSelector={true}
/>
```

## Common Patterns

### Form Integration

```typescript
function BlogPostForm() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit form data
    console.log('Form submitted:', formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="content">Content</label>
        <UnifiedContentEditor
          mode="standard"
          content={formData.content}
          onChange={(content) => setFormData({ ...formData, content: content as string })}
        />
      </div>
      
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
        Save Post
      </button>
    </form>
  );
}
```

### Auto-save Functionality

```typescript
function AutoSaveEditor() {
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  
  const saveContent = useCallback(async (contentToSave: string) => {
    setSaveStatus('saving');
    try {
      // Save to backend
      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contentToSave }),
      });
      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('error');
      console.error('Save failed:', error);
    }
  }, []);
  
  const debouncedSave = useMemo(
    () => debounce(saveContent, 2000),
    [saveContent]
  );
  
  const handleChange = (newContent: string) => {
    setContent(newContent);
    debouncedSave(newContent);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3>Content Editor</h3>
        <span className={`text-sm ${
          saveStatus === 'saved' ? 'text-green-600' :
          saveStatus === 'saving' ? 'text-yellow-600' :
          'text-red-600'
        }`}>
          {saveStatus === 'saved' ? 'Saved' :
           saveStatus === 'saving' ? 'Saving...' :
           'Save Error'}
        </span>
      </div>
      
      <UnifiedContentEditor
        mode="standard"
        content={content}
        onChange={handleChange}
      />
    </div>
  );
}

// Simple debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
```

## Troubleshooting

### Common Issues

1. **Editor not loading**
   - Check that all required dependencies are installed
   - Ensure the content prop is properly formatted (string or JSON object)

2. **Toolbar not showing**
   - Verify that `editable` prop is `true`
   - Check that `config.ui.toolbar.show` is `true`

3. **Media manager not working**
   - Ensure `brandId` and `siteId` props are provided
   - Check that media integration is enabled in the mode configuration

4. **Content not updating**
   - Verify that the `onChange` callback is properly implemented
   - Check that the content format matches the expected output format

### Debug Mode

Enable debug mode to troubleshoot issues:

```typescript
<UnifiedContentEditor
  mode="standard"
  content={content}
  onChange={setContent}
  debug={true} // Enable debug mode
/>
```

## Next Steps

1. **Explore Advanced Features**: Check the implementation guide for advanced configurations
2. **Custom Extensions**: Learn how to add custom TipTap extensions
3. **Performance Optimization**: Implement code splitting and lazy loading
4. **Testing**: Write unit and integration tests for your editor usage

## Support

For questions or issues:
1. Check the implementation guide: `UNIFIED_CONTENT_IMPLEMENTATION_GUIDE.md`
2. Review the architecture diagrams: `UNIFIED_ARCHITECTURE_DIAGRAM.md`
3. Examine the full analysis: `CMS_CONTENT_UNIFICATION_ANALYSIS.md`
4. Create an issue in the project repository