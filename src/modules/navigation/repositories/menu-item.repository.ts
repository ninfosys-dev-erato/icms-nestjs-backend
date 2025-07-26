import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { MenuItem } from '../entities/menu-item.entity';
import { CreateMenuItemDto, UpdateMenuItemDto, MenuItemQueryDto } from '../dto/menu-item.dto';
import { MenuItemType } from '@prisma/client';

@Injectable()
export class MenuItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<MenuItem | null> {
    return this.prisma.menuItem.findUnique({
      where: { id },
      include: {
        menu: true,
        parent: true,
        children: true,
        createdBy: true,
        updatedBy: true,
      },
    });
  }

  async findAll(query: MenuItemQueryDto): Promise<any> {
    const { page = 1, limit = 10, search, menuId, parentId, itemType, isActive, isPublished, sort, order } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { path: ['en'], string_contains: search } },
        { title: { path: ['ne'], string_contains: search } },
        { description: { path: ['en'], string_contains: search } },
        { description: { path: ['ne'], string_contains: search } },
      ];
    }
    if (menuId) where.menuId = menuId;
    if (parentId !== undefined) where.parentId = parentId;
    if (itemType) where.itemType = itemType;
    if (isActive !== undefined) where.isActive = isActive;
    if (isPublished !== undefined) where.isPublished = isPublished;

    const [data, total] = await Promise.all([
      this.prisma.menuItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: sort ? { [sort]: order || 'asc' } : { order: 'asc' },
        include: {
          menu: true,
          parent: true,
          children: true,
          createdBy: true,
          updatedBy: true,
        },
      }),
      this.prisma.menuItem.count({ where }),
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

  async findActive(query: MenuItemQueryDto): Promise<any> {
    return this.findAll({ ...query, isActive: true });
  }

  async findByMenu(menuId: string, query: MenuItemQueryDto): Promise<any> {
    return this.findAll({ ...query, menuId });
  }

  async findByParent(parentId?: string): Promise<MenuItem[]> {
    return this.prisma.menuItem.findMany({
      where: { parentId },
      orderBy: { order: 'asc' },
      include: {
        menu: true,
        parent: true,
        children: true,
        createdBy: true,
        updatedBy: true,
      },
    });
  }

  async findByType(itemType: MenuItemType, query: MenuItemQueryDto): Promise<any> {
    return this.findAll({ ...query, itemType });
  }

  async search(searchTerm: string, query: MenuItemQueryDto): Promise<any> {
    return this.findAll({ ...query, search: searchTerm });
  }

  async create(data: CreateMenuItemDto, userId: string): Promise<MenuItem> {
    return this.prisma.menuItem.create({
      data: {
        ...data,
        title: data.title as any,
        description: data.description as any,
        target: data.target || 'self',
        order: data.order || 0,
        isActive: data.isActive ?? true,
        isPublished: data.isPublished ?? false,
        createdById: userId,
        updatedById: userId,
      },
      include: {
        menu: true,
        parent: true,
        children: true,
        createdBy: true,
        updatedBy: true,
      },
    });
  }

  async update(id: string, data: UpdateMenuItemDto, userId: string): Promise<MenuItem> {
    return this.prisma.menuItem.update({
      where: { id },
      data: {
        ...data,
        title: data.title as any,
        description: data.description as any,
        updatedById: userId,
      },
      include: {
        menu: true,
        parent: true,
        children: true,
        createdBy: true,
        updatedBy: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.menuItem.delete({ where: { id } });
  }

  async reorder(orders: { id: string; order: number }[]): Promise<void> {
    await Promise.all(
      orders.map(({ id, order }) =>
        this.prisma.menuItem.update({
          where: { id },
          data: { order },
        })
      )
    );
  }

  async getMenuItemTree(menuId: string): Promise<any[]> {
    return this.prisma.menuItem.findMany({
      where: { menuId, parentId: null },
      orderBy: { order: 'asc' },
      include: {
        children: {
          orderBy: { order: 'asc' },
          include: {
            children: {
              orderBy: { order: 'asc' },
            },
          },
        },
        menu: true,
        parent: true,
        createdBy: true,
        updatedBy: true,
      },
    });
  }

  async getStatistics(): Promise<any> {
    const [total, active, published, byType, byMenu] = await Promise.all([
      this.prisma.menuItem.count(),
      this.prisma.menuItem.count({ where: { isActive: true } }),
      this.prisma.menuItem.count({ where: { isPublished: true } }),
      this.prisma.menuItem.groupBy({
        by: ['itemType'],
        _count: { itemType: true },
      }),
      this.prisma.menuItem.groupBy({
        by: ['menuId'],
        _count: { menuId: true },
      }),
    ]);

    const averageDepth = await this.prisma.menuItem.aggregate({
      _avg: { order: true },
    });

    return {
      total,
      active,
      published,
      byType: byType.reduce((acc, item) => {
        acc[item.itemType] = item._count.itemType;
        return acc;
      }, {}),
      byMenu: byMenu.reduce((acc, item) => {
        acc[item.menuId] = item._count.menuId;
        return acc;
      }, {}),
      averageDepth: averageDepth._avg.order || 0,
    };
  }

  async findByItemReference(itemType: MenuItemType, itemId: string): Promise<MenuItem[]> {
    return this.prisma.menuItem.findMany({
      where: { itemType, itemId },
      include: {
        menu: true,
        parent: true,
        children: true,
        createdBy: true,
        updatedBy: true,
      },
    });
  }

  async getBreadcrumb(itemId: string): Promise<MenuItem[]> {
    const breadcrumb: MenuItem[] = [];
    let currentItem = await this.findById(itemId);

    while (currentItem) {
      breadcrumb.unshift(currentItem);
      if (currentItem.parentId) {
        currentItem = await this.findById(currentItem.parentId);
      } else {
        break;
      }
    }

    return breadcrumb;
  }
} 