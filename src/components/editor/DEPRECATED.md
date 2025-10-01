# Deprecated Rich Text Editors

This directory contains the following deprecated rich text editor components that have been unified into `UnifiedRichTextEditor.tsx`:

## Legacy Editors (Deprecated)

1. **`src/components/editor/RichTextEditor.tsx`** - Modern TipTap Implementation
   - **Status**: Deprecated (use `UnifiedRichTextEditor` instead)
   - **Replacement**: `UnifiedRichTextEditor` with `mode="standard"`

2. **`src/components/cms/editor/RichContentEditor.tsx`** - CMS TipTap Implementation
   - **Status**: Deprecated (use `UnifiedRichTextEditor` instead)
   - **Replacement**: `UnifiedRichTextEditor` with `mode="cms"`

3. **`src/components/content/RichContentEditor.tsx`** - Content TipTap Implementation
   - **Status**: Deprecated (use `UnifiedRichTextEditor` instead)
   - **Replacement**: `UnifiedRichTextEditor` with `mode="advanced"`

4. **`src/components/admin/RichTextEditor.tsx`** - Legacy Implementation
   - **Status**: Deprecated (use `UnifiedRichTextEditor` instead)
   - **Replacement**: `UnifiedRichTextEditor` with `mode="simple"`

## Migration Guide

### Simple Mode (for basic text editing)
```tsx
// Old
import { RichTextEditor } from '@/components/admin/RichTextEditor'

// New
import { UnifiedRichTextEditor } from '@/components/editor'
<UnifiedRichTextEditor mode="simple" />
```

### Standard Mode (for most use cases)
```tsx
// Old
import { RichTextEditor } from '@/components/editor/RichTextEditor'

// New
import { UnifiedRichTextEditor } from '@/components/editor'
<UnifiedRichTextEditor mode="standard" />
```

### CMS Mode (for CMS integration)
```tsx
// Old
import { RichContentEditor } from '@/components/cms/editor/RichContentEditor'

// New
import { UnifiedRichTextEditor } from '@/components/editor'
<UnifiedRichTextEditor mode="cms" />
```

### Advanced Mode (for content editing)
```tsx
// Old
import { RichContentEditor } from '@/components/content/RichContentEditor'

// New
import { UnifiedRichTextEditor } from '@/components/editor'
<UnifiedRichTextEditor mode="advanced" />
```

## Backward Compatibility

For backward compatibility, wrapper components have been created:
- `src/components/admin/RichTextEditorWrapper.tsx`
- `src/components/cms/editor/RichContentEditorWrapper.tsx`
- `src/components/content/RichContentEditorWrapper.tsx`

These wrappers redirect to the unified editor and maintain the same API.

## Removal Timeline

The legacy editors will be removed in a future major version. Please update your code to use the unified editor.

## Benefits of the Unified Editor

1. **Consistent UX**: All editors now have the same look and feel
2. **Reduced Bundle Size**: Eliminates duplicate code
3. **Easier Maintenance**: Single codebase to maintain
4. **Better Performance**: Optimized implementation
5. **Feature Parity**: All features available in all modes