import React, { useState } from 'react';
import {
  Type,
  Image as ImageIcon,
  Video,
  FileText,
  Quote,
  List,
  ListOrdered,
  Table,
  Code,
  AlertCircle,
  CheckSquare,
  Calendar,
  Users,
  MapPin,
  Phone,
  Mail,
  Star,
  Heart,
  ThumbsUp,
  MessageSquare,
  Share2,
  Download,
  ChevronDown,
} from 'lucide-react';

import { Button } from '../../ui/button';
import { BlockTemplate } from '../../../types/cms';
import { useToast } from '../../../hooks/useToast';

interface BlockSelectorProps {
  onBlockSelect: (blockTemplate: BlockTemplate) => void;
  className?: string;
}

const blockTemplates: BlockTemplate[] = [
  // Text Blocks
  {
    id: 'heading-1',
    name: 'Heading 1',
    description: 'Large heading for main titles',
    category: 'text',
    icon: 'Type',
    schema: { type: 'heading', attrs: { level: 1 } },
    initialContent: {
      type: 'doc',
      content: [{
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Your Heading Here' }]
      }]
    }
  },
  {
    id: 'heading-2',
    name: 'Heading 2',
    description: 'Medium heading for sections',
    category: 'text',
    icon: 'Type',
    schema: { type: 'heading', attrs: { level: 2 } },
    initialContent: {
      type: 'doc',
      content: [{
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Section Heading' }]
      }]
    }
  },
  {
    id: 'paragraph',
    name: 'Paragraph',
    description: 'Standard text paragraph',
    category: 'text',
    icon: 'FileText',
    schema: { type: 'paragraph' },
    initialContent: {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'Enter your paragraph text here...' }]
      }]
    }
  },
  {
    id: 'quote',
    name: 'Quote',
    description: 'Blockquote for testimonials',
    category: 'text',
    icon: 'Quote',
    schema: { type: 'blockquote' },
    initialContent: {
      type: 'doc',
      content: [{
        type: 'blockquote',
        content: [{ type: 'text', text: 'Enter your quote text here...' }]
      }]
    }
  },
  {
    id: 'code-block',
    name: 'Code Block',
    description: 'Formatted code snippet',
    category: 'text',
    icon: 'Code',
    schema: { type: 'codeBlock' },
    initialContent: {
      type: 'doc',
      content: [{
        type: 'codeBlock',
        content: [{ type: 'text', text: '// Your code here\nconsole.log("Hello World");' }]
      }]
    }
  },

  // List Blocks
  {
    id: 'bullet-list',
    name: 'Bullet List',
    description: 'Unordered list with bullets',
    category: 'list',
    icon: 'List',
    schema: { type: 'bulletList' },
    initialContent: {
      type: 'doc',
      content: [{
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'First item' }] }]
          },
          {
            type: 'listItem',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Second item' }] }]
          },
          {
            type: 'listItem',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Third item' }] }]
          }
        ]
      }]
    }
  },
  {
    id: 'numbered-list',
    name: 'Numbered List',
    description: 'Ordered list with numbers',
    category: 'list',
    icon: 'ListOrdered',
    schema: { type: 'orderedList' },
    initialContent: {
      type: 'doc',
      content: [{
        type: 'orderedList',
        content: [
          {
            type: 'listItem',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'First item' }] }]
          },
          {
            type: 'listItem',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Second item' }] }]
          },
          {
            type: 'listItem',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Third item' }] }]
          }
        ]
      }]
    }
  },
  {
    id: 'checklist',
    name: 'Checklist',
    description: 'Task list with checkboxes',
    category: 'list',
    icon: 'CheckSquare',
    schema: { type: 'taskList' },
    initialContent: {
      type: 'doc',
      content: [{
        type: 'taskList',
        content: [
          {
            type: 'taskItem',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Task 1' }] }]
          },
          {
            type: 'taskItem',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Task 2' }] }]
          }
        ]
      }]
    }
  },

  // Media Blocks
  {
    id: 'image',
    name: 'Image',
    description: 'Insert an image with caption',
    category: 'media',
    icon: 'ImageIcon',
    schema: { type: 'image' },
    initialContent: {
      type: 'doc',
      content: [{
        type: 'image',
        attrs: {
          src: '/placeholder-image.jpg',
          alt: 'Placeholder image',
          title: 'Image caption'
        }
      }]
    }
  },
  {
    id: 'video',
    name: 'Video',
    description: 'Embed a video player',
    category: 'media',
    icon: 'Video',
    schema: { type: 'video' },
    initialContent: {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'Video player placeholder' }]
      }]
    }
  },

  // Table Blocks
  {
    id: 'table',
    name: 'Table',
    description: 'Data table with headers',
    category: 'table',
    icon: 'Table',
    schema: { type: 'table' },
    initialContent: {
      type: 'doc',
      content: [{
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              { type: 'tableHeader', content: [{ type: 'text', text: 'Header 1' }] },
              { type: 'tableHeader', content: [{ type: 'text', text: 'Header 2' }] },
              { type: 'tableHeader', content: [{ type: 'text', text: 'Header 3' }] }
            ]
          },
          {
            type: 'tableRow',
            content: [
              { type: 'tableCell', content: [{ type: 'text', text: 'Cell 1' }] },
              { type: 'tableCell', content: [{ type: 'text', text: 'Cell 2' }] },
              { type: 'tableCell', content: [{ type: 'text', text: 'Cell 3' }] }
            ]
          }
        ]
      }]
    }
  },

  // Structural Blocks
  {
    id: 'divider',
    name: 'Divider',
    description: 'Horizontal line separator',
    category: 'structure',
    icon: 'Minus',
    schema: { type: 'horizontalRule' },
    initialContent: {
      type: 'doc',
      content: [{ type: 'horizontalRule' }]
    }
  },
  {
    id: 'spacer',
    name: 'Spacer',
    description: 'Vertical space',
    category: 'structure',
    icon: 'Space',
    schema: { type: 'paragraph' },
    initialContent: {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: '\u00A0' }]
      }]
    }
  },

  // Contact Blocks
  {
    id: 'contact-info',
    name: 'Contact Info',
    description: 'Contact details block',
    category: 'contact',
    icon: 'Phone',
    schema: { type: 'contactInfo' },
    initialContent: {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [
          { type: 'text', text: '📞 ' },
          { type: 'text', text: '+1 (555) 123-4567' }
        ]
      }]
    }
  },
  {
    id: 'address',
    name: 'Address',
    description: 'Location address block',
    category: 'contact',
    icon: 'MapPin',
    schema: { type: 'address' },
    initialContent: {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [
          { type: 'text', text: '📍 ' },
          { type: 'text', text: '123 Main Street, City, State 12345' }
        ]
      }]
    }
  },

  // Interactive Blocks
  {
    id: 'button',
    name: 'Button',
    description: 'Clickable button',
    category: 'interactive',
    icon: 'CursorClick',
    schema: { type: 'button' },
    initialContent: {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: '[ Click Me ]' }]
      }]
    }
  },
  {
    id: 'alert',
    name: 'Alert',
    description: 'Important notice or warning',
    category: 'interactive',
    icon: 'AlertCircle',
    schema: { type: 'alert' },
    initialContent: {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [
          { type: 'text', text: '⚠️ ' },
          { type: 'text', text: 'Important: Please read this notice carefully.' }
        ]
      }]
    }
  },

  // Social Blocks
  {
    id: 'social-share',
    name: 'Social Share',
    description: 'Social media sharing buttons',
    category: 'social',
    icon: 'Share2',
    schema: { type: 'socialShare' },
    initialContent: {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'Share this content on social media' }]
      }]
    }
  },
  {
    id: 'rating',
    name: 'Rating',
    description: 'Star rating display',
    category: 'social',
    icon: 'Star',
    schema: { type: 'rating' },
    initialContent: {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: '⭐⭐⭐⭐⭐' }]
      }]
    }
  }
];

const categories = [
  { id: 'all', name: 'All Blocks', icon: Type },
  { id: 'text', name: 'Text', icon: Type },
  { id: 'list', name: 'Lists', icon: List },
  { id: 'media', name: 'Media', icon: ImageIcon },
  { id: 'table', name: 'Tables', icon: Table },
  { id: 'structure', name: 'Structure', icon: FileText },
  { id: 'contact', name: 'Contact', icon: Phone },
  { id: 'interactive', name: 'Interactive', icon: CheckSquare },
  { id: 'social', name: 'Social', icon: Share2 },
];

const iconMap: Record<string, React.ElementType> = {
  Type,
  ImageIcon,
  Video,
  FileText,
  Quote,
  List,
  ListOrdered,
  Table,
  Code,
  AlertCircle,
  CheckSquare,
  Calendar,
  Users,
  MapPin,
  Phone,
  Mail,
  Star,
  Heart,
  ThumbsUp,
  MessageSquare,
  Share2,
  Download,
  Minus: FileText, // Fallback for spacer
  CursorClick: CheckSquare, // Fallback for button
  Space: FileText, // Fallback for spacer
};

export const BlockSelector: React.FC<BlockSelectorProps> = ({
  onBlockSelect,
  className = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { addToast } = useToast();

  const filteredBlocks = selectedCategory === 'all'
    ? blockTemplates
    : blockTemplates.filter(block => block.category === selectedCategory);

  const handleBlockClick = (blockTemplate: BlockTemplate) => {
    try {
      onBlockSelect(blockTemplate);
      addToast({
        type: 'success',
        message: `${blockTemplate.name} block added`,
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to add block',
      });
    }
  };

  const currentCategory = categories.find(cat => cat.id === selectedCategory);
  const CategoryIcon = currentCategory?.icon || Type;

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Category Selector */}
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2"
        >
          <CategoryIcon className="h-4 w-4" />
          {currentCategory?.name || 'All Blocks'}
          <ChevronDown className="h-4 w-4" />
        </Button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                    selectedCategory === category.id ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Block Templates */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {filteredBlocks.map((blockTemplate) => {
            const Icon = iconMap[blockTemplate.icon] || FileText;
            return (
              <button
                key={blockTemplate.id}
                onClick={() => handleBlockClick(blockTemplate)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all group"
                title={blockTemplate.description}
              >
                <Icon className="h-4 w-4 text-gray-600 group-hover:text-gray-900" />
                <span className="text-sm font-medium whitespace-nowrap">
                  {blockTemplate.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};