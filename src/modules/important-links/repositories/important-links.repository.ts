import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ImportantLink } from '../entities/important-links.entity';
import { CreateImportantLinkDto } from '../dto/important-links.dto';
import { UpdateImportantLinkDto } from '../dto/important-links.dto';

@Injectable()
export class ImportantLinksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ImportantLink | null> {
    const link = await this.prisma.importantLink.findUnique({
      where: { id },
    });

    if (!link) return null;

    return {
      id: link.id,
      linkTitle: link.linkTitle as any,
      linkUrl: link.linkUrl,
      order: link.order,
      isActive: link.isActive,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
    };
  }

  async findAll(isActive?: boolean): Promise<ImportantLink[]> {
    const where = isActive !== undefined ? { isActive } : {};
    
    const links = await this.prisma.importantLink.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return links.map(link => ({
      id: link.id,
      linkTitle: link.linkTitle as any,
      linkUrl: link.linkUrl,
      order: link.order,
      isActive: link.isActive,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
    }));
  }

  async findWithPagination(page: number = 1, limit: number = 10, isActive?: boolean): Promise<{
    data: ImportantLink[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const where = isActive !== undefined ? { isActive } : {};
    const skip = (page - 1) * limit;

    const [links, total] = await Promise.all([
      this.prisma.importantLink.findMany({
        where,
        orderBy: { order: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.importantLink.count({ where }),
    ]);

    const data = links.map(link => ({
      id: link.id,
      linkTitle: link.linkTitle as any,
      linkUrl: link.linkUrl,
      order: link.order,
      isActive: link.isActive,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data: CreateImportantLinkDto): Promise<ImportantLink> {
    const link = await this.prisma.importantLink.create({
      data: {
        linkTitle: data.linkTitle as any,
        linkUrl: data.linkUrl,
        order: data.order || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    return {
      id: link.id,
      linkTitle: link.linkTitle as any,
      linkUrl: link.linkUrl,
      order: link.order,
      isActive: link.isActive,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
    };
  }

  async update(id: string, data: UpdateImportantLinkDto): Promise<ImportantLink> {
    const link = await this.prisma.importantLink.update({
      where: { id },
      data: {
        ...(data.linkTitle && { linkTitle: data.linkTitle as any }),
        ...(data.linkUrl && { linkUrl: data.linkUrl }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return {
      id: link.id,
      linkTitle: link.linkTitle as any,
      linkUrl: link.linkUrl,
      order: link.order,
      isActive: link.isActive,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.importantLink.delete({
      where: { id },
    });
  }

  async reorder(orders: { id: string; order: number }[]): Promise<void> {
    const updatePromises = orders.map(({ id, order }) =>
      this.prisma.importantLink.update({
        where: { id },
        data: { order },
      })
    );

    await Promise.all(updatePromises);
  }

  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    lastUpdated: Date | null;
  }> {
    const [total, active, lastUpdated] = await Promise.all([
      this.prisma.importantLink.count(),
      this.prisma.importantLink.count({ where: { isActive: true } }),
      this.prisma.importantLink.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      lastUpdated: lastUpdated?.updatedAt || null,
    };
  }

  async bulkCreate(links: CreateImportantLinkDto[]): Promise<ImportantLink[]> {
    // Use individual creates to get the created records back with IDs
    const createdLinks: ImportantLink[] = [];
    
    for (const link of links) {
      const created = await this.prisma.importantLink.create({
        data: {
          linkTitle: link.linkTitle as any,
          linkUrl: link.linkUrl,
          order: link.order || 0,
          isActive: link.isActive !== undefined ? link.isActive : true,
        },
      });
      
      createdLinks.push({
        id: created.id,
        linkTitle: created.linkTitle as any,
        linkUrl: created.linkUrl,
        order: created.order,
        isActive: created.isActive,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      });
    }

    return createdLinks;
  }

  async bulkUpdate(updates: { id: string; data: Partial<UpdateImportantLinkDto> }[]): Promise<ImportantLink[]> {
    const updatePromises = updates.map(({ id, data }) =>
      this.prisma.importantLink.update({
        where: { id },
        data: {
          ...(data.linkTitle && { linkTitle: data.linkTitle as any }),
          ...(data.linkUrl && { linkUrl: data.linkUrl }),
          ...(data.order !== undefined && { order: data.order }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      })
    );

    const updatedLinks = await Promise.all(updatePromises);
    
    return updatedLinks.map(link => ({
      id: link.id,
      linkTitle: link.linkTitle as any,
      linkUrl: link.linkUrl,
      order: link.order,
      isActive: link.isActive,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
    }));
  }

  async getFooterLinks(): Promise<{
    quickLinks: ImportantLink[];
    governmentLinks: ImportantLink[];
    socialMediaLinks: ImportantLink[];
    contactLinks: ImportantLink[];
  }> {
    const allLinks = await this.findAll(true);
    
    // This is a simple categorization - in a real implementation,
    // you might want to add a category field to the database
    const quickLinks = allLinks.slice(0, 5);
    const governmentLinks = allLinks.slice(5, 10);
    const socialMediaLinks = allLinks.slice(10, 15);
    const contactLinks = allLinks.slice(15, 20);

    return {
      quickLinks,
      governmentLinks,
      socialMediaLinks,
      contactLinks,
    };
  }

  async findByUrl(url: string): Promise<ImportantLink | null> {
    const link = await this.prisma.importantLink.findFirst({
      where: { linkUrl: url },
    });

    if (!link) return null;

    return {
      id: link.id,
      linkTitle: link.linkTitle as any,
      linkUrl: link.linkUrl,
      order: link.order,
      isActive: link.isActive,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
    };
  }

  async existsByUrl(url: string, excludeId?: string): Promise<boolean> {
    const where: any = { linkUrl: url };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.prisma.importantLink.count({ where });
    return count > 0;
  }
} 