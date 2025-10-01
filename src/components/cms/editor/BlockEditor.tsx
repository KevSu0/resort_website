import React, { useCallback, useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Copy, Edit, Eye, EyeOff, ChevronDown, ChevronRight, Plus } from 'lucide-react';

import { Button } from '../../ui/button';
import { UnifiedRichTextEditor } from '@/components/editor';
import type { JSONContent } from '@tiptap/react';
import type { RichContentNode } from '../../../types/cms';
import { useToast } from '../../../hooks/useToast';

interface ContentBlock {
  id: string;
  type: string;
  name: string;
  content: RichContentNode;
  visible: boolean;
  locked: boolean;
  order: number;
  settings?: Record<string, unknown>;
}

interface BlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  brandId?: string;
  siteId?: string;
  className?: string;
  allowDragAndDrop?: boolean;
  showBlockControls?: boolean;
  enableLivePreview?: boolean;
}

const SortableBlock: React.FC<{
  block: ContentBlock;
  onBlockChange: (blockId: string, updates: Partial<ContentBlock>) => void;
  onBlockDelete: (blockId: string) => void;
  onBlockDuplicate: (blockId: string) => void;
  brandId?: string;
  siteId?: string;
  showControls?: boolean;
  enableLivePreview?: boolean;
}> = ({
  block,
  onBlockChange,
  onBlockDelete,
  onBlockDuplicate,
  brandId,
  siteId,
  showControls = true,
  enableLivePreview = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleContentChange = useCallback((content: string | JSONContent) => {
    // Convert the content to match the expected RichContentNode type
    const convertedContent = typeof content === 'string'
      ? {
          id: `content-${Date.now()}`,
          type: 'doc',
          content: [{
            id: `para-${Date.now()}`,
            type: 'paragraph',
            content: [{
              id: `text-${Date.now()}`,
              type: 'text',
              text: content
            }]
          }]
        } as unknown as RichContentNode
      : content as unknown as RichContentNode;
    
    onBlockChange(block.id, { content: convertedContent });
  }, [block.id, onBlockChange]);

  const handleVisibilityToggle = useCallback(() => {
    onBlockChange(block.id, { visible: !block.visible });
  }, [block.id, block.visible, onBlockChange]);

  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg overflow-hidden transition-all ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500' : 'shadow-sm'
      } ${block.visible ? '' : 'opacity-50'}`}
    >
      {/* Block Header */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          {showControls && (
            <button
              {...attributes}
              {...listeners}
              className="p-1 hover:bg-gray-200 rounded cursor-grab active:cursor-grabbing"
              title="Drag to reorder"
            >
              <GripVertical className="h-4 w-4 text-gray-500" />
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-200 rounded"
            title="Toggle block visibility"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900">{block.name}</h3>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
              {block.type}
            </span>
          </div>
        </div>

        {showControls && (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleVisibilityToggle}
              title={block.visible ? 'Hide block' : 'Show block'}
              className="h-8 w-8 p-0"
            >
              {block.visible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              title={isEditing ? 'Preview' : 'Edit'}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onBlockDuplicate(block.id)}
              title="Duplicate block"
              className="h-8 w-8 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onBlockDelete(block.id)}
              title="Delete block"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Block Content */}
      {isExpanded && (
        <div className="p-4">
          {enableLivePreview && !isEditing ? (
            <div className="prose prose-lg max-w-none">
              {/* Render preview content */}
              <div dangerouslySetInnerHTML={{
                __html: JSON.stringify(block.content)
              }} as any />
            </div>
          ) : (
            <UnifiedRichTextEditor
              content={block.content as unknown as JSONContent}
              onChange={handleContentChange}
              brandId={brandId}
              siteId={siteId}
              editable={!block.locked}
              toolbar={isEditing}
              showBlockSelector={false}
              placeholder={`Edit ${block.name} content...`}
              mode="cms"
            />
          )}
        </div>
      )}

      {/* Block Settings Panel */}
      {block.settings && Object.keys(block.settings).length > 0 && (
        <div className="border-t p-3 bg-gray-50">
          <div className="text-sm text-gray-600">
            {/* Render block-specific settings */}
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(block.settings, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export const BlockEditor: React.FC<BlockEditorProps> = ({
  blocks,
  onChange,
  brandId,
  siteId,
  className = '',
  allowDragAndDrop = true,
  showBlockControls = true,
  enableLivePreview = false,
}) => {
  const { addToast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: { active: { id: string }; over: { id: string } }) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex((block) => block.id === active.id);
      const newIndex = blocks.findIndex((block) => block.id === over.id);

      const newBlocks = arrayMove(blocks, oldIndex, newIndex).map((block, index) => ({
        ...block,
        order: index,
      }));

      onChange(newBlocks);
    }
  }, [blocks, onChange]);

  const handleBlockChange = useCallback((blockId: string, updates: Partial<ContentBlock>) => {
    const newBlocks = blocks.map((block) =>
      block.id === blockId ? { ...block, ...updates, updated_at: new Date() } : block
    );
    onChange(newBlocks);
  }, [blocks, onChange]);

  
  const handleBlockDelete = useCallback((blockId: string) => {
    const newBlocks = blocks.filter((block) => block.id !== blockId);
    onChange(newBlocks);

    addToast({
      type: 'info',
      message: 'Block deleted',
    });
  }, [blocks, onChange, addToast]);

  const handleBlockDuplicate = useCallback((blockId: string) => {
    const blockToDuplicate = blocks.find((block) => block.id === blockId);
    if (!blockToDuplicate) return;

    const duplicatedBlock: ContentBlock = {
      ...blockToDuplicate,
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${blockToDuplicate.name} (Copy)`,
      order: blocks.length,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const newBlocks = [...blocks, duplicatedBlock];
    onChange(newBlocks);

    addToast({
      type: 'success',
      message: 'Block duplicated',
    });
  }, [blocks, onChange, addToast]);

  const addEmptyBlock = useCallback(() => {
    const newBlock: ContentBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'paragraph',
      name: 'Text Block',
      content: {
        type: 'doc',
        content: [{
          type: 'paragraph',
          content: [{ type: 'text', text: 'Start typing...' }]
        }]
      },
      visible: true,
      locked: false,
      order: blocks.length,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const newBlocks = [...blocks, newBlock];
    onChange(newBlocks);
  }, [blocks, onChange]);

  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Add Block Button */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={addEmptyBlock}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Block
        </Button>

        {enableLivePreview && (
          <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
            <span>Live Preview Mode</span>
          </div>
        )}
      </div>

      {/* Blocks Container */}
      {allowDragAndDrop ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedBlocks.map((block) => block.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {sortedBlocks.map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  onBlockChange={handleBlockChange}
                  onBlockDelete={handleBlockDelete}
                  onBlockDuplicate={handleBlockDuplicate}
                  brandId={brandId}
                  siteId={siteId}
                  showControls={showBlockControls}
                  enableLivePreview={enableLivePreview}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="space-y-4">
          {sortedBlocks.map((block) => (
            <SortableBlock
              key={block.id}
              block={block}
              onBlockChange={handleBlockChange}
              onBlockDelete={handleBlockDelete}
              onBlockDuplicate={handleBlockDuplicate}
              brandId={brandId}
              siteId={siteId}
              showControls={showBlockControls}
              enableLivePreview={enableLivePreview}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {blocks.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-gray-500 mb-4">
            <Plus className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-medium">No blocks added yet</p>
            <p className="text-sm">Click "Add Block" to start creating content</p>
          </div>
          <Button
            type="button"
            onClick={addEmptyBlock}
            variant="outline"
          >
            Add Your First Block
          </Button>
        </div>
      )}
    </div>
  );
};