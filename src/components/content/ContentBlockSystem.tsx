import { useState, useCallback } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { Plus, GripVertical, Trash2, Edit, Eye, EyeOff } from 'lucide-react'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export interface ContentBlockData {
  id: string
  type: 'text' | 'image' | 'hero' | 'features' | 'testimonials' | 'cta' | 'gallery' | 'video' | 'form' | 'custom'
  name: string
  content: any
  configuration: any
  isActive: boolean
  order: number
  container?: string
}

interface ContentBlockSystemProps {
  blocks: ContentBlockData[]
  onChange: (blocks: ContentBlockData[]) => void
  editable?: boolean
  preview?: boolean
  className?: string
}

const BLOCK_TYPES = [
  { value: 'text', label: 'Text Block', icon: '📝' },
  { value: 'image', label: 'Image Block', icon: '🖼️' },
  { value: 'hero', label: 'Hero Section', icon: '🎯' },
  { value: 'features', label: 'Features Grid', icon: '✨' },
  { value: 'testimonials', label: 'Testimonials', icon: '💬' },
  { value: 'cta', label: 'Call to Action', icon: '🚀' },
  { value: 'gallery', label: 'Image Gallery', icon: '🎨' },
  { value: 'video', label: 'Video Block', icon: '🎥' },
  { value: 'form', label: 'Contact Form', icon: '📋' },
  { value: 'custom', label: 'Custom Block', icon: '🔧' },
]

function ContentBlockEditor({
  block,
  onChange,
  onClose,
}: {
  block: ContentBlockData
  onChange: (block: ContentBlockData) => void
  onClose: () => void
}) {
  const updateBlock = useCallback((updates: Partial<ContentBlockData>) => {
    onChange({ ...block, ...updates })
  }, [block, onChange])

  const renderContentEditor = () => {
    switch (block.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="block-name">Block Name</Label>
              <Input
                id="block-name"
                value={block.name}
                onChange={(e) => updateBlock({ name: e.target.value })}
                placeholder="Enter block name"
              />
            </div>
            <div>
              <Label>Content</Label>
              <RichTextEditor
                content={block.content?.html || ''}
                onChange={(html) => updateBlock({ content: { html } })}
                placeholder="Enter your text content here..."
              />
            </div>
          </div>
        )

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="block-name">Block Name</Label>
              <Input
                id="block-name"
                value={block.name}
                onChange={(e) => updateBlock({ name: e.target.value })}
                placeholder="Enter block name"
              />
            </div>
            <div>
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                value={block.content?.url || ''}
                onChange={(e) => updateBlock({
                  content: { ...block.content, url: e.target.value }
                })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="image-alt">Alt Text</Label>
              <Input
                id="image-alt"
                value={block.content?.alt || ''}
                onChange={(e) => updateBlock({
                  content: { ...block.content, alt: e.target.value }
                })}
                placeholder="Describe the image for accessibility"
              />
            </div>
            <div>
              <Label htmlFor="image-caption">Caption</Label>
              <Input
                id="image-caption"
                value={block.content?.caption || ''}
                onChange={(e) => updateBlock({
                  content: { ...block.content, caption: e.target.value }
                })}
                placeholder="Image caption (optional)"
              />
            </div>
          </div>
        )

      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="block-name">Block Name</Label>
              <Input
                id="block-name"
                value={block.name}
                onChange={(e) => updateBlock({ name: e.target.value })}
                placeholder="Enter block name"
              />
            </div>
            <div>
              <Label htmlFor="hero-title">Title</Label>
              <Input
                id="hero-title"
                value={block.content?.title || ''}
                onChange={(e) => updateBlock({
                  content: { ...block.content, title: e.target.value }
                })}
                placeholder="Hero title"
              />
            </div>
            <div>
              <Label htmlFor="hero-subtitle">Subtitle</Label>
              <Input
                id="hero-subtitle"
                value={block.content?.subtitle || ''}
                onChange={(e) => updateBlock({
                  content: { ...block.content, subtitle: e.target.value }
                })}
                placeholder="Hero subtitle"
              />
            </div>
            <div>
              <Label htmlFor="hero-cta">CTA Button Text</Label>
              <Input
                id="hero-cta"
                value={block.content?.ctaText || ''}
                onChange={(e) => updateBlock({
                  content: { ...block.content, ctaText: e.target.value }
                })}
                placeholder="Get Started"
              />
            </div>
            <div>
              <Label htmlFor="hero-cta-link">CTA Button Link</Label>
              <Input
                id="hero-cta-link"
                value={block.content?.ctaLink || ''}
                onChange={(e) => updateBlock({
                  content: { ...block.content, ctaLink: e.target.value }
                })}
                placeholder="/contact"
              />
            </div>
            <div>
              <Label htmlFor="hero-bg">Background Image URL</Label>
              <Input
                id="hero-bg"
                value={block.content?.backgroundImage || ''}
                onChange={(e) => updateBlock({
                  content: { ...block.content, backgroundImage: e.target.value }
                })}
                placeholder="https://example.com/hero-bg.jpg"
              />
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="block-name">Block Name</Label>
              <Input
                id="block-name"
                value={block.name}
                onChange={(e) => updateBlock({ name: e.target.value })}
                placeholder="Enter block name"
              />
            </div>
            <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
              <p>Content editor for {block.type} blocks coming soon</p>
              <p className="text-sm mt-2">Raw content: {JSON.stringify(block.content, null, 2)}</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {renderContentEditor()}

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="block-active"
            checked={block.isActive}
            onCheckedChange={(checked) => updateBlock({ isActive: checked })}
          />
          <Label htmlFor="block-active">Active</Label>
        </div>

        {block.container !== undefined && (
          <div>
            <Label htmlFor="block-container">Container</Label>
            <Input
              id="block-container"
              value={block.container || ''}
              onChange={(e) => updateBlock({ container: e.target.value })}
              placeholder="container-name"
            />
          </div>
        )}
      </div>
    </div>
  )
}

function SortableBlock({
  block,
  onEdit,
  onDelete,
  onToggleActive,
  preview,
}: {
  block: ContentBlockData
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
  preview?: boolean
}) {
  const blockType = BLOCK_TYPES.find(type => type.value === block.type)

  return (
    <Card className={cn(
      "transition-all duration-200",
      !block.isActive && "opacity-50",
      preview && "border-blue-200"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {!preview && <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />}
            <span className="text-lg">{blockType?.icon}</span>
            <div>
              <CardTitle className="text-sm">{block.name}</CardTitle>
              <p className="text-xs text-gray-500">{blockType?.label}</p>
            </div>
          </div>

          {!preview && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleActive}>
                  {block.isActive ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="text-sm text-gray-600">
          {block.type === 'text' && (
            <div
              className="prose prose-sm max-w-none line-clamp-3"
              dangerouslySetInnerHTML={{ __html: block.content?.html || '' }}
            />
          )}
          {block.type === 'image' && block.content?.url && (
            <img
              src={block.content.url}
              alt={block.content?.alt || 'Content block image'}
              className="w-full h-32 object-cover rounded"
            />
          )}
          {block.type === 'hero' && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded">
              <h3 className="font-bold">{block.content?.title || 'Hero Title'}</h3>
              <p className="text-sm text-gray-600">{block.content?.subtitle || 'Hero subtitle'}</p>
            </div>
          )}
          {block.type !== 'text' && block.type !== 'image' && block.type !== 'hero' && (
            <div className="p-4 border border-dashed border-gray-300 rounded text-center text-gray-500">
              {blockType?.label} content
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function ContentBlockSystem({
  blocks,
  onChange,
  editable = true,
  preview = false,
  className
}: ContentBlockSystemProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [editingBlock, setEditingBlock] = useState<ContentBlockData | null>(null)
  const [isAddingBlock, setIsAddingBlock] = useState(false)
  const [newBlockType, setNewBlockType] = useState<ContentBlockData['type']>('text')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = blocks.findIndex((block) => block.id === active.id)
      const newIndex = blocks.findIndex((block) => block.id === over?.id)

      const reorderedBlocks = arrayMove(blocks, oldIndex, newIndex).map((block, index) => ({
        ...block,
        order: index
      }))

      onChange(reorderedBlocks)
    }

    setActiveId(null)
  }

  const addBlock = () => {
    const newBlock: ContentBlockData = {
      id: `block-${Date.now()}`,
      type: newBlockType,
      name: `New ${BLOCK_TYPES.find(t => t.value === newBlockType)?.label}`,
      content: {},
      configuration: {},
      isActive: true,
      order: blocks.length,
    }

    onChange([...blocks, newBlock])
    setIsAddingBlock(false)
    setEditingBlock(newBlock)
  }

  const updateBlock = (updatedBlock: ContentBlockData) => {
    const newBlocks = blocks.map(block =>
      block.id === updatedBlock.id ? updatedBlock : block
    )
    onChange(newBlocks)
    setEditingBlock(null)
  }

  const deleteBlock = (blockId: string) => {
    const newBlocks = blocks.filter(block => block.id !== blockId)
    onChange(newBlocks)
  }

  const toggleBlockActive = (blockId: string) => {
    const newBlocks = blocks.map(block =>
      block.id === blockId ? { ...block, isActive: !block.isActive } : block
    )
    onChange(newBlocks)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {blocks
              .sort((a, b) => a.order - b.order)
              .map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  onEdit={() => setEditingBlock(block)}
                  onDelete={() => deleteBlock(block.id)}
                  onToggleActive={() => toggleBlockActive(block.id)}
                  preview={preview}
                />
              ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <div className="opacity-50">
              <SortableBlock
                block={blocks.find(b => b.id === activeId)!}
                onEdit={() => {}}
                onDelete={() => {}}
                onToggleActive={() => {}}
                preview
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {editable && (
        <div className="flex justify-center">
          <Dialog open={isAddingBlock} onOpenChange={setIsAddingBlock}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Content Block
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Content Block</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="block-type">Block Type</Label>
                  <Select value={newBlockType} onValueChange={(value: ContentBlockData['type']) => setNewBlockType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOCK_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <span className="flex items-center">
                            <span className="mr-2">{type.icon}</span>
                            {type.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={addBlock} className="w-full">
                  Add {BLOCK_TYPES.find(t => t.value === newBlockType)?.label}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {editingBlock && (
        <Dialog open={!!editingBlock} onOpenChange={() => setEditingBlock(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Content Block</DialogTitle>
            </DialogHeader>
            <ContentBlockEditor
              block={editingBlock}
              onChange={updateBlock}
              onClose={() => setEditingBlock(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}