import { PrismaClient } from '@prisma/client';
import { ContentBlock } from '@prisma/client';
import { CreateContentBlockData, UpdateContentBlockData, ContentBlockType } from '../types/content';
import { logger } from '../lib/logger';

export class ContentBlockService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new content block
   */
  async createContentBlock(data: CreateContentBlockData): Promise<ContentBlock> {
    const { siteId, pageId, name, type, content, configuration, order, container } = data;

    // Validate tenant access
    await this.validateSiteAccess(siteId);

    // Get the highest order if not specified
    const finalOrder = order ?? await this.getNextOrder(siteId, pageId);

    return this.prisma.contentBlock.create({
      data: {
        siteId,
        pageId,
        name,
        type,
        content,
        configuration,
        order: finalOrder,
        container,
        isActive: true,
      },
      include: {
        page: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Get content blocks by site
   */
  async getContentBlocksBySite(siteId: string, options: {
    pageId?: string;
    type?: ContentBlockType;
    container?: string;
    includeInactive?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<ContentBlock[]> {
    const { pageId, type, container, includeInactive = false, limit, offset } = options;

    await this.validateSiteAccess(siteId);

    return this.prisma.contentBlock.findMany({
      where: {
        siteId,
        pageId,
        type,
        container,
        isActive: includeInactive ? undefined : true,
      },
      orderBy: [
        { container: 'asc' },
        { order: 'asc' },
      ],
      include: {
        page: pageId ? {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        } : false,
      },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get content block by ID
   */
  async getContentBlockById(id: string): Promise<ContentBlock | null> {
    const contentBlock = await this.prisma.contentBlock.findUnique({
      where: { id },
      include: {
        page: {
          select: {
            id: true,
            title: true,
            slug: true,
            siteId: true,
          },
        },
      },
    });

    if (contentBlock?.page) {
      await this.validateSiteAccess(contentBlock.page.siteId);
    }

    return contentBlock;
  }

  /**
   * Update content block
   */
  async updateContentBlock(id: string, data: UpdateContentBlockData): Promise<ContentBlock> {
    const existingBlock = await this.getContentBlockById(id);
    if (!existingBlock) {
      throw new Error('Content block not found');
    }

    // Validate tenant access
    if (existingBlock.page) {
      await this.validateSiteAccess(existingBlock.page.siteId);
    } else {
      await this.validateSiteAccess(existingBlock.siteId);
    }

    const { content, configuration, order, container, isActive } = data;

    return this.prisma.contentBlock.update({
      where: { id },
      data: {
        content,
        configuration,
        order,
        container,
        isActive,
        updatedAt: new Date(),
      },
      include: {
        page: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Delete content block
   */
  async deleteContentBlock(id: string): Promise<void> {
    const existingBlock = await this.getContentBlockById(id);
    if (!existingBlock) {
      throw new Error('Content block not found');
    }

    // Validate tenant access
    if (existingBlock.page) {
      await this.validateSiteAccess(existingBlock.page.siteId);
    } else {
      await this.validateSiteAccess(existingBlock.siteId);
    }

    await this.prisma.contentBlock.delete({
      where: { id },
    });
  }

  /**
   * Duplicate content block
   */
  async duplicateContentBlock(id: string, newName?: string): Promise<ContentBlock> {
    const originalBlock = await this.getContentBlockById(id);
    if (!originalBlock) {
      throw new Error('Content block not found');
    }

    // Validate tenant access
    if (originalBlock.page) {
      await this.validateSiteAccess(originalBlock.page.siteId);
    } else {
      await this.validateSiteAccess(originalBlock.siteId);
    }

    const nextOrder = await this.getNextOrder(originalBlock.siteId, originalBlock.pageId);

    return this.prisma.contentBlock.create({
      data: {
        siteId: originalBlock.siteId,
        pageId: originalBlock.pageId,
        name: newName || `${originalBlock.name} (Copy)`,
        type: originalBlock.type,
        content: originalBlock.content,
        configuration: originalBlock.configuration,
        order: nextOrder,
        container: originalBlock.container,
        isActive: true,
      },
      include: {
        page: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Reorder content blocks
   */
  async reorderContentBlocks(siteId: string, pageId: string | null, blockOrders: Array<{
    id: string;
    order: number;
  }>): Promise<ContentBlock[]> {
    await this.validateSiteAccess(siteId);

    // Verify all blocks belong to the same site and page
    const blocks = await this.prisma.contentBlock.findMany({
      where: {
        id: { in: blockOrders.map(b => b.id) },
        siteId,
        pageId,
      },
    });

    if (blocks.length !== blockOrders.length) {
      throw new Error('One or more content blocks not found or access denied');
    }

    // Update order for each block
    const updatePromises = blockOrders.map(({ id, order }) =>
      this.prisma.contentBlock.update({
        where: { id },
        data: { order },
      })
    );

    await this.prisma.$transaction(updatePromises);

    // Return updated blocks
    return this.prisma.contentBlock.findMany({
      where: { siteId, pageId },
      orderBy: [
        { container: 'asc' },
        { order: 'asc' },
      ],
    });
  }

  /**
   * Get content block types
   */
  getContentBlockTypes(): Array<{
    type: ContentBlockType;
    name: string;
    description: string;
    icon: string;
    category: string;
  }> {
    return [
      {
        type: 'text',
        name: 'Text Block',
        description: 'Rich text content with formatting options',
        icon: 'Type',
        category: 'Content',
      },
      {
        type: 'image',
        name: 'Image Block',
        description: 'Image with caption and sizing options',
        icon: 'Image',
        category: 'Media',
      },
      {
        type: 'video',
        name: 'Video Block',
        description: 'Video player with controls',
        icon: 'Video',
        category: 'Media',
      },
      {
        type: 'gallery',
        name: 'Gallery Block',
        description: 'Image gallery with lightbox',
        icon: 'ImageIcon',
        category: 'Media',
      },
      {
        type: 'hero',
        name: 'Hero Section',
        description: 'Full-width hero section with background',
        icon: 'Layout',
        category: 'Layout',
      },
      {
        type: 'testimonial',
        name: 'Testimonial',
        description: 'Customer testimonial with avatar',
        icon: 'MessageCircle',
        category: 'Content',
      },
      {
        type: 'features',
        name: 'Features Grid',
        description: 'Grid of feature highlights',
        icon: 'Grid3X3',
        category: 'Layout',
      },
      {
        type: 'cta',
        name: 'Call to Action',
        description: 'Call-to-action section with button',
        icon: 'MousePointer',
        category: 'Content',
      },
      {
        type: 'form',
        name: 'Contact Form',
        description: 'Contact or lead generation form',
        icon: 'FileText',
        category: 'Interactive',
      },
      {
        type: 'map',
        name: 'Map Block',
        description: 'Interactive map integration',
        icon: 'MapPin',
        category: 'Interactive',
      },
    ];
  }

  /**
   * Get content block template
   */
  getContentBlockTemplate(type: ContentBlockType): unknown {
    const templates = {
      text: {
        content: {
          text: '',
          heading: '',
          subheading: '',
        },
        configuration: {
          fontSize: 'base',
          textAlign: 'left',
          fontWeight: 'normal',
          color: 'default',
        },
      },
      image: {
        content: {
          src: '',
          alt: '',
          caption: '',
          width: 'full',
          height: 'auto',
        },
        configuration: {
          borderRadius: 'none',
          shadow: 'none',
          lazy: true,
        },
      },
      video: {
        content: {
          src: '',
          poster: '',
          title: '',
          description: '',
          autoplay: false,
          controls: true,
        },
        configuration: {
          width: 'full',
          aspectRatio: '16:9',
        },
      },
      gallery: {
        content: {
          images: [],
          columns: 3,
          spacing: 'medium',
          lightbox: true,
        },
        configuration: {
          borderRadius: 'small',
          shadow: 'medium',
        },
      },
      hero: {
        content: {
          title: '',
          subtitle: '',
          description: '',
          backgroundImage: '',
          primaryButton: {
            text: '',
            url: '',
          },
          secondaryButton: {
            text: '',
            url: '',
          },
        },
        configuration: {
          height: 'medium',
          overlay: 'dark',
          textAlign: 'center',
        },
      },
      testimonial: {
        content: {
          quote: '',
          author: '',
          role: '',
          company: '',
          avatar: '',
          rating: 5,
        },
        configuration: {
          textAlign: 'center',
          showAvatar: true,
          showRating: true,
        },
      },
      features: {
        content: {
          title: '',
          subtitle: '',
          features: [
            {
              icon: '',
              title: '',
              description: '',
            },
          ],
        },
        configuration: {
          columns: 3,
          layout: 'grid',
          textAlign: 'center',
        },
      },
      cta: {
        content: {
          title: '',
          description: '',
          buttonText: '',
          buttonUrl: '',
          backgroundColor: 'primary',
        },
        configuration: {
          textAlign: 'center',
          size: 'large',
        },
      },
      form: {
        content: {
          title: '',
          description: '',
          fields: [
            {
              name: 'name',
              label: 'Name',
              type: 'text',
              required: true,
            },
            {
              name: 'email',
              label: 'Email',
              type: 'email',
              required: true,
            },
            {
              name: 'message',
              label: 'Message',
              type: 'textarea',
              required: true,
            },
          ],
          submitText: 'Submit',
          successMessage: 'Thank you for your message!',
        },
        configuration: {
          layout: 'vertical',
          buttonStyle: 'primary',
        },
      },
      map: {
        content: {
          address: '',
          latitude: 0,
          longitude: 0,
          zoom: 14,
          marker: {
            title: '',
            description: '',
          },
        },
        configuration: {
          height: '400px',
          style: 'default',
          controls: true,
        },
      },
    };

    return templates[type] || templates.text;
  }

  /**
   * Validate site access (tenant isolation)
   */
  private async validateSiteAccess(siteId: string): Promise<void> {
    // In a real implementation, this would validate tenant access
    // For now, we'll assume access is validated by middleware
    logger.debug(`Validating access to site: ${siteId}`, {
      module: 'ContentBlockService',
      function: 'validateSiteAccess',
      siteId,
      category: 'security'
    });
  }

  /**
   * Get next order number for content block
   */
  private async getNextOrder(siteId: string, pageId: string | null): Promise<number> {
    const lastBlock = await this.prisma.contentBlock.findFirst({
      where: {
        siteId,
        pageId,
      },
      orderBy: {
        order: 'desc',
      },
      select: {
        order: true,
      },
    });

    return (lastBlock?.order ?? 0) + 1;
  }
}