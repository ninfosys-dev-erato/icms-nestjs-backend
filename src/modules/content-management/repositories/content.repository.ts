import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import {
  CreateContentDto,
  UpdateContentDto,
  ContentQueryDto,
  PaginatedContentResult,
  ContentStatistics,
  ContentStatus,
} from '../dto/content-management.dto';

type Content = any;

@Injectable()
export class ContentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Content | null> {
    return (this.prisma as any).content.findUnique({
      where: { id },
      include: {
        category: true,
        attachments: {
          orderBy: { order: 'asc' },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findBySlug(slug: string): Promise<Content | null> {
    return (this.prisma as any).content.findUnique({
      where: { slug },
      include: {
        category: true,
        attachments: {
          orderBy: { order: 'asc' },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findByCategoryAndSlug(categorySlug: string, contentSlug: string): Promise<Content | null> {
    return (this.prisma as any).content.findFirst({
      where: { 
        slug: contentSlug,
        category: {
          slug: categorySlug
        }
      },
      include: {
        category: true,
        attachments: {
          orderBy: { order: 'asc' },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAll(query: ContentQueryDto): Promise<PaginatedContentResult> {
    const { page = 1, limit = 10, search, category, status, featured, dateFrom, dateTo, sort = 'createdAt', order = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { path: ['en'], string_contains: search } },
        { title: { path: ['ne'], string_contains: search } },
        { content: { path: ['en'], string_contains: search } },
        { content: { path: ['ne'], string_contains: search } },
        { excerpt: { path: ['en'], string_contains: search } },
        { excerpt: { path: ['ne'], string_contains: search } },
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (status) {
      where.status = status;
    }

    if (featured !== undefined) {
      where.featured = featured;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    const [contents, total] = await Promise.all([
      (this.prisma as any).content.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          category: true,
          attachments: {
            orderBy: { order: 'asc' },
          },
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          updatedBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      (this.prisma as any).content.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: contents,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findPublished(query: ContentQueryDto): Promise<PaginatedContentResult> {
    return this.findAll({ ...query, status: ContentStatus.PUBLISHED });
  }

  async findByCategory(categoryId: string, query: ContentQueryDto): Promise<PaginatedContentResult> {
    return this.findAll({ ...query, category: categoryId });
  }

  async findFeatured(limit: number = 10): Promise<Content[]> {
    return (this.prisma as any).content.findMany({
      where: {
        featured: true,
        status: ContentStatus.PUBLISHED,
      },
      take: limit,
      orderBy: { order: 'asc' },
      include: {
        category: true,
        attachments: {
          orderBy: { order: 'asc' },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async search(searchTerm: string, query: ContentQueryDto): Promise<PaginatedContentResult> {
    return this.findAll({ ...query, search: searchTerm });
  }

  async create(data: CreateContentDto, userId: string): Promise<Content> {
    const slug = data.slug || await this.generateSlug(data.title.en);
    
    return (this.prisma as any).content.create({
      data: {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        slug,
        categoryId: data.categoryId,
        status: data.status || ContentStatus.DRAFT,
        featured: data.featured || false,
        order: data.order || 0,
        createdById: userId,
        updatedById: userId,
      },
      include: {
        category: true,
        attachments: {
          orderBy: { order: 'asc' },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateContentDto, userId: string): Promise<Content> {
    const updateData: any = { ...data, updatedById: userId };
    
    if (data.title && !data.slug) {
      updateData.slug = await this.generateSlug(data.title.en, id);
    }

    return (this.prisma as any).content.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        attachments: {
          orderBy: { order: 'asc' },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    await (this.prisma as any).content.delete({
      where: { id },
    });
  }

  async publish(id: string, userId: string): Promise<Content> {
    return (this.prisma as any).content.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        updatedById: userId,
      },
      include: {
        category: true,
        attachments: {
          orderBy: { order: 'asc' },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async archive(id: string, userId: string): Promise<Content> {
    return (this.prisma as any).content.update({
      where: { id },
      data: {
        status: ContentStatus.ARCHIVED,
        updatedById: userId,
      },
      include: {
        category: true,
        attachments: {
          orderBy: { order: 'asc' },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const where: any = { slug };
    if (excludeId) {
      where.NOT = { id: excludeId };
    }

    const count = await (this.prisma as any).content.count({ where });
    return count > 0;
  }

  async getStatistics(): Promise<ContentStatistics> {
    const [
      total,
      published,
      draft,
      archived,
      featured,
    ] = await Promise.all([
      (this.prisma as any).content.count(),
      (this.prisma as any).content.count({ where: { status: ContentStatus.PUBLISHED } }),
      (this.prisma as any).content.count({ where: { status: ContentStatus.DRAFT } }),
      (this.prisma as any).content.count({ where: { status: ContentStatus.ARCHIVED } }),
      (this.prisma as any).content.count({ where: { featured: true } }),
    ]);

    return {
      total,
      published,
      draft,
      archived,
      featured,
    };
  }

  async findByDateRange(dateFrom: Date, dateTo: Date): Promise<Content[]> {
    return (this.prisma as any).content.findMany({
      where: {
        createdAt: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      include: {
        category: true,
        attachments: {
          orderBy: { order: 'asc' },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Utility methods
  private async generateSlug(title: string, excludeId?: string): Promise<string> {
    let slug = this.slugify(title);
    let counter = 1;
    let finalSlug = slug;

    while (await this.slugExists(finalSlug, excludeId)) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    return finalSlug;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
} 