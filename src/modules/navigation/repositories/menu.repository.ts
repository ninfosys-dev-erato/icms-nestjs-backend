import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Menu } from '../entities/menu.entity';
import { CreateMenuDto, UpdateMenuDto, MenuQueryDto } from '../dto/menu.dto';
import { MenuLocation } from '@prisma/client';

@Injectable()
export class MenuRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Menu | null> {
    return this.prisma.menu.findUnique({
      where: { id },
      include: {
        menuItems: {
          where: { isActive: true, isPublished: true },
          orderBy: { order: 'asc' },
          include: {
            children: {
              where: { isActive: true, isPublished: true },
              orderBy: { order: 'asc' },
            },
          },
        },
        createdBy: true,
        updatedBy: true,
      },
    });
  }

  async findAll(query: MenuQueryDto): Promise<any> {
    const { page = 1, limit = 10, search, location, order, isActive, isPublished, sort, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { path: ['en'], string_contains: search } },
        { name: { path: ['ne'], string_contains: search } },
        { description: { path: ['en'], string_contains: search } },
        { description: { path: ['ne'], string_contains: search } },
      ];
    }
    if (location) where.location = location;
    if (order !== undefined) where.order = order;
    if (isActive !== undefined) where.isActive = isActive;
    if (isPublished !== undefined) where.isPublished = isPublished;

    const [data, total] = await Promise.all([
      this.prisma.menu.findMany({
        where,
        skip,
        take: limit,
        orderBy: sort ? { [sort]: sortOrder || 'asc' } : [
          { order: 'asc' },
          { createdAt: 'desc' }
        ],
        include: {
          menuItems: {
            where: { isActive: true, isPublished: true },
            orderBy: { order: 'asc' },
            include: {
              children: {
                where: { isActive: true, isPublished: true },
                orderBy: { order: 'asc' },
              },
            },
          },
          createdBy: true,
          updatedBy: true,
        },
      }),
      this.prisma.menu.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findActive(query: MenuQueryDto): Promise<any> {
    return this.findAll({ ...query, isActive: true });
  }

  async findPublished(query: MenuQueryDto): Promise<any> {
    return this.findAll({ ...query, isPublished: true });
  }

  async findByLocation(location: MenuLocation): Promise<Menu[]> {
    return this.prisma.menu.findMany({
      where: { location, isActive: true, isPublished: true },
      include: {
        menuItems: {
          where: { isActive: true, isPublished: true },
          orderBy: { order: 'asc' },
          include: {
            children: {
              where: { isActive: true, isPublished: true },
              orderBy: { order: 'asc' },
            },
          },
        },
        createdBy: true,
        updatedBy: true,
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' }
      ],
    });
  }

  async search(searchTerm: string, query: MenuQueryDto): Promise<any> {
    return this.findAll({ ...query, search: searchTerm });
  }

  async create(data: CreateMenuDto, userId: string): Promise<Menu> {
    const prismaData = {
      name: data.name as any,
      description: data.description as any,
      location: data.location,
      order: data.order || 0,
      isActive: data.isActive ?? true,
      isPublished: data.isPublished ?? false,
      categorySlug: data.categorySlug,
      createdById: userId,
      updatedById: userId,
    };
    
    return this.prisma.menu.create({
      data: prismaData,
      include: {
        menuItems: {
          where: { isActive: true, isPublished: true },
          orderBy: { order: 'asc' },
          include: {
            children: {
              where: { isActive: true, isPublished: true },
              orderBy: { order: 'asc' },
            },
          },
        },
        createdBy: true,
        updatedBy: true,
      },
    });
  }

  async update(id: string, data: UpdateMenuDto, userId: string): Promise<Menu> {
    return this.prisma.menu.update({
      where: { id },
      data: {
        ...data,
        name: data.name as any,
        description: data.description as any,
        categorySlug: data.categorySlug,
        updatedById: userId,
      },
      include: {
        menuItems: {
          where: { isActive: true, isPublished: true },
          orderBy: { order: 'asc' },
          include: {
            children: {
              where: { isActive: true, isPublished: true },
              orderBy: { order: 'asc' },
            },
          },
        },
        createdBy: true,
        updatedBy: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.menu.delete({ where: { id } });
  }

  async publish(id: string, userId: string): Promise<Menu> {
    return this.prisma.menu.update({
      where: { id },
      data: { isPublished: true, updatedById: userId },
      include: {
        menuItems: {
          where: { isActive: true, isPublished: true },
          orderBy: { order: 'asc' },
          include: {
            children: {
              where: { isActive: true, isPublished: true },
              orderBy: { order: 'asc' },
            },
          },
        },
        createdBy: true,
        updatedBy: true,
      },
    });
  }

  async unpublish(id: string, userId: string): Promise<Menu> {
    return this.prisma.menu.update({
      where: { id },
      data: { isPublished: false, updatedById: userId },
      include: {
        menuItems: {
          where: { isActive: true, isPublished: true },
          orderBy: { order: 'asc' },
          include: {
            children: {
              where: { isActive: true, isPublished: true },
              orderBy: { order: 'asc' },
            },
          },
        },
        createdBy: true,
        updatedBy: true,
      },
    });
  }

  async findWithItems(id: string): Promise<any> {
    return this.prisma.menu.findUnique({
      where: { id },
      include: {
        menuItems: {
          where: { isActive: true, isPublished: true },
          orderBy: { order: 'asc' },
          include: {
            children: {
              where: { isActive: true, isPublished: true },
              orderBy: { order: 'asc' },
            },
          },
        },
        createdBy: true,
        updatedBy: true,
      },
    });
  }

  async getStatistics(): Promise<any> {
    const [total, active, published, byLocation] = await Promise.all([
      this.prisma.menu.count(),
      this.prisma.menu.count({ where: { isActive: true } }),
      this.prisma.menu.count({ where: { isPublished: true } }),
      this.prisma.menu.groupBy({
        by: ['location'],
        _count: { location: true },
      }),
    ]);

    const averageItemsPerMenu = await this.prisma.menuItem.aggregate({
      _avg: { order: true },
    });

    return {
      total,
      active,
      published,
      byLocation: byLocation.reduce((acc, item) => {
        acc[item.location] = item._count.location;
        return acc;
      }, {}),
      averageItemsPerMenu: averageItemsPerMenu._avg.order || 0,
    };
  }

  async getMenuTree(id: string): Promise<any> {
    const menu = await this.findById(id);
    if (!menu) return null;

    const items = await this.prisma.menuItem.findMany({
      where: { menuId: id, parentId: null },
      orderBy: { order: 'asc' },
      include: {
        children: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return { menu, items };
  }

  async reorder(orders: { id: string; order: number }[]): Promise<void> {
    await Promise.all(
      orders.map(({ id, order }) =>
        this.prisma.menu.update({
          where: { id },
          data: { order },
        })
      )
    );
  }
} 