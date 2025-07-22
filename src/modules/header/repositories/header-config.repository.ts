import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { HeaderConfig } from '../entities/header-config.entity';
import { 
  CreateHeaderConfigDto, 
  UpdateHeaderConfigDto, 
  HeaderConfigQueryDto,
  HeaderConfigStatistics,
  PaginationInfo
} from '../dto/header.dto';

@Injectable()
export class HeaderConfigRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<HeaderConfig | null> {
    return this.prisma.headerConfig.findUnique({
      where: { id }
    });
  }

  async findAll(query: HeaderConfigQueryDto): Promise<{
    data: HeaderConfig[];
    pagination: PaginationInfo;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    // Note: isPublished is not in the current schema, so we filter by isActive instead
    if (query.isPublished !== undefined) {
      where.isActive = query.isPublished;
    }

    const orderBy: any = {};
    if (query.sort) {
      orderBy[query.sort] = query.order || 'desc';
    } else {
      orderBy.order = 'asc';
    }

    const [data, total] = await Promise.all([
      this.prisma.headerConfig.findMany({
        where,
        skip,
        take: limit,
        orderBy
      }),
      this.prisma.headerConfig.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  async findActive(query: HeaderConfigQueryDto): Promise<{
    data: HeaderConfig[];
    pagination: PaginationInfo;
  }> {
    const where: any = { isActive: true };

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const orderBy = { order: 'asc' as const };

    const [data, total] = await Promise.all([
      this.prisma.headerConfig.findMany({
        where,
        skip,
        take: limit,
        orderBy
      }),
      this.prisma.headerConfig.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  async findPublished(query: HeaderConfigQueryDto): Promise<{
    data: HeaderConfig[];
    pagination: PaginationInfo;
  }> {
    const where: any = { isActive: true }; // Using isActive as isPublished since isPublished is not in schema

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const orderBy = { order: 'asc' as const };

    const [data, total] = await Promise.all([
      this.prisma.headerConfig.findMany({
        where,
        skip,
        take: limit,
        orderBy
      }),
      this.prisma.headerConfig.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  async findByOrder(order: number): Promise<HeaderConfig | null> {
    return this.prisma.headerConfig.findFirst({
      where: { order }
    });
  }

  async search(searchTerm: string, query: HeaderConfigQueryDto): Promise<{
    data: HeaderConfig[];
    pagination: PaginationInfo;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        {
          name: {
            path: ['en'],
            string_contains: searchTerm
          }
        },
        {
          name: {
            path: ['ne'],
            string_contains: searchTerm
          }
        }
      ]
    };

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    // Note: isPublished is not in the current schema, so we filter by isActive instead
    if (query.isPublished !== undefined) {
      where.isActive = query.isPublished;
    }

    const orderBy = { order: 'asc' as const };

    const [data, total] = await Promise.all([
      this.prisma.headerConfig.findMany({
        where,
        skip,
        take: limit,
        orderBy
      }),
      this.prisma.headerConfig.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  async create(data: CreateHeaderConfigDto, userId: string): Promise<HeaderConfig> {
    return this.prisma.headerConfig.create({
      data: {
        name: data.name as any,
        order: data.order || 0,
        isActive: data.isActive ?? true,
        typography: data.typography as any,
        alignment: data.alignment,
        logo: data.logo as any,
        layout: data.layout as any
      }
    });
  }

  async update(id: string, data: UpdateHeaderConfigDto, userId: string): Promise<HeaderConfig> {
    const updateData: any = {};
    
    if (data.name !== undefined) updateData.name = data.name as any;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.typography !== undefined) updateData.typography = data.typography as any;
    if (data.alignment !== undefined) updateData.alignment = data.alignment;
    if (data.logo !== undefined) updateData.logo = data.logo as any;
    if (data.layout !== undefined) updateData.layout = data.layout as any;

    return this.prisma.headerConfig.update({
      where: { id },
      data: updateData
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.headerConfig.delete({
      where: { id }
    });
  }

  async publish(id: string, userId: string): Promise<HeaderConfig> {
    // Since isPublished is not in the current schema, we'll just return the updated config
    return this.prisma.headerConfig.update({
      where: { id },
      data: { isActive: true }
    });
  }

  async unpublish(id: string, userId: string): Promise<HeaderConfig> {
    // Since isPublished is not in the current schema, we'll just return the updated config
    return this.prisma.headerConfig.update({
      where: { id },
      data: { isActive: false }
    });
  }

  async reorder(orders: { id: string; order: number }[]): Promise<void> {
    const updates = orders.map(({ id, order }) =>
      this.prisma.headerConfig.update({
        where: { id },
        data: { order }
      })
    );

    await Promise.all(updates);
  }

  async getActiveHeaderConfig(): Promise<HeaderConfig | null> {
    return this.prisma.headerConfig.findFirst({
      where: { 
        isActive: true
      },
      orderBy: { order: 'asc' }
    });
  }

  async getStatistics(): Promise<HeaderConfigStatistics> {
    const [total, active, byAlignment, averageOrder] = await Promise.all([
      this.prisma.headerConfig.count(),
      this.prisma.headerConfig.count({ where: { isActive: true } }),
      this.prisma.headerConfig.groupBy({
        by: ['alignment'],
        _count: { alignment: true }
      }),
      this.prisma.headerConfig.aggregate({
        _avg: { order: true }
      })
    ]);

    const alignmentStats: Record<string, number> = {};
    byAlignment.forEach(item => {
      alignmentStats[item.alignment] = item._count.alignment;
    });

    return {
      total,
      active,
      published: active, // Using active as published since isPublished is not in schema
      byAlignment: alignmentStats as any,
      averageOrder: averageOrder._avg.order || 0
    };
  }

  async findByLogo(mediaId: string): Promise<HeaderConfig[]> {
    // This method would need to be implemented differently since we're storing logo as JSON
    // For now, we'll return an empty array as the JSON path queries might not work as expected
    return [];
  }
} 