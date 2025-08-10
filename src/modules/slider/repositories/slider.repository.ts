import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Slider } from '../entities/slider.entity';
import { 
  CreateSliderDto, 
  UpdateSliderDto, 
  SliderQueryDto,
  SliderStatistics,
  PaginationInfo
} from '../dto/slider.dto';

@Injectable()
export class SliderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Slider | null> {
    return this.prisma.slider.findUnique({
      where: { id },
      include: {
        media: true
      }
    });
  }

  async findAll(query: SliderQueryDto): Promise<{
    data: Slider[];
    pagination: PaginationInfo;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Normalize isActive in case global transform didn't run
    const rawIsActive: unknown = (query as any)?.isActive;
    let normalizedIsActive: boolean | undefined;
    if (typeof rawIsActive === 'boolean') {
      normalizedIsActive = rawIsActive;
    } else if (typeof rawIsActive === 'string') {
      const v = rawIsActive.toLowerCase().trim();
      if (['true', '1', 'yes', 'on'].includes(v)) normalizedIsActive = true;
      if (['false', '0', 'no', 'off'].includes(v)) normalizedIsActive = false;
    }
    if (normalizedIsActive !== undefined) {
      where.isActive = normalizedIsActive;
    }

    if (query.position !== undefined) {
      where.position = query.position;
    }

    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) {
        where.createdAt.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        where.createdAt.lte = new Date(query.dateTo);
      }
    }

    const orderBy: any = {};
    if (query.sort) {
      orderBy[query.sort] = query.order || 'desc';
    } else {
      orderBy.position = 'asc';
    }

    console.log('🧭 SliderRepository.findAll where filter:', where);
    const [data, total] = await Promise.all([
      this.prisma.slider.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          media: true
        }
      }),
      this.prisma.slider.count({ where })
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

  async findActive(query: SliderQueryDto): Promise<{
    data: Slider[];
    pagination: PaginationInfo;
  }> {
    const where: any = { isActive: true };

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const orderBy = { position: 'asc' as const };

    const [data, total] = await Promise.all([
      this.prisma.slider.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          media: true
        }
      }),
      this.prisma.slider.count({ where })
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

  async findPublished(query: SliderQueryDto): Promise<{
    data: Slider[];
    pagination: PaginationInfo;
  }> {
    const where: any = { isActive: true };

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const orderBy = { position: 'asc' as const };

    const [data, total] = await Promise.all([
      this.prisma.slider.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          media: true
        }
      }),
      this.prisma.slider.count({ where })
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

  async findByPosition(position: number): Promise<Slider[]> {
    return this.prisma.slider.findMany({
      where: { position },
      include: {
        media: true
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async search(searchTerm: string, query: SliderQueryDto): Promise<{
    data: Slider[];
    pagination: PaginationInfo;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        {
          title: {
            path: ['en'],
            string_contains: searchTerm
          }
        },
        {
          title: {
            path: ['ne'],
            string_contains: searchTerm
          }
        }
      ]
    };

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const orderBy = { position: 'asc' as const };

    const [data, total] = await Promise.all([
      this.prisma.slider.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          media: true
        }
      }),
      this.prisma.slider.count({ where })
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

  async create(data: CreateSliderDto, userId: string): Promise<Slider> {
    return this.prisma.slider.create({
      data: {
        title: data.title as any,
        position: data.position,
        displayTime: data.displayTime,
        isActive: data.isActive ?? true,
        mediaId: data.mediaId
      },
      include: {
        media: true
      }
    });
  }

  async update(id: string, data: UpdateSliderDto, userId: string): Promise<Slider> {
    return this.prisma.slider.update({
      where: { id },
      data: {
        title: data.title as any,
        position: data.position,
        displayTime: data.displayTime,
        isActive: data.isActive,
        mediaId: data.mediaId
      },
      include: {
        media: true
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.slider.delete({
      where: { id }
    });
  }

  async publish(id: string, userId: string): Promise<Slider> {
    return this.prisma.slider.update({
      where: { id },
      data: {
        isActive: true
      },
      include: {
        media: true
      }
    });
  }

  async unpublish(id: string, userId: string): Promise<Slider> {
    return this.prisma.slider.update({
      where: { id },
      data: {
        isActive: false
      },
      include: {
        media: true
      }
    });
  }

  async reorder(orders: { id: string; position: number }[]): Promise<void> {
    const updates = orders.map(order => 
      this.prisma.slider.update({
        where: { id: order.id },
        data: { position: order.position }
      })
    );

    await this.prisma.$transaction(updates);
  }

  async getStatistics(): Promise<SliderStatistics> {
    const [total, active, byPosition, totalClicks, totalViews] = await Promise.all([
      this.prisma.slider.count(),
      this.prisma.slider.count({ where: { isActive: true } }),
      this.prisma.slider.groupBy({
        by: ['position'],
        _count: { position: true }
      }),
      this.prisma.sliderClick.count(),
      this.prisma.sliderView.count()
    ]);

    const byPositionMap: Record<number, number> = {};
    byPosition.forEach(item => {
      byPositionMap[item.position] = item._count.position;
    });

    const averageClickThroughRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    return {
      total,
      active,
      published: active, // For now, published = active since we don't have isPublished field
      totalClicks,
      totalViews,
      averageClickThroughRate,
      byPosition: byPositionMap
    };
  }

  async findByMedia(mediaId: string): Promise<Slider[]> {
    return this.prisma.slider.findMany({
      where: { mediaId },
      include: {
        media: true
      }
    });
  }

  async getActiveSlidersForDisplay(): Promise<Slider[]> {
    return this.prisma.slider.findMany({
      where: {
        isActive: true
      },
      include: {
        media: true
      },
      orderBy: { position: 'asc' }
    });
  }

  async isSliderActive(id: string): Promise<boolean> {
    const slider = await this.prisma.slider.findUnique({
      where: { id },
      select: {
        isActive: true
      }
    });

    return slider?.isActive || false;
  }
} 