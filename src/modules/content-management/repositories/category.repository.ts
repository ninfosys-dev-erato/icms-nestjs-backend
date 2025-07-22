import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryResponseDto,
  CategoryStatistics,
  ReorderItemDto,
} from '../dto/content-management.dto';

type Category = any;

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Category | null> {
    return (this.prisma as any).category.findUnique({
      where: { id },
      include: {
        children: true,
        contents: true,
      },
    });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return (this.prisma as any).category.findUnique({
      where: { slug },
      include: {
        children: true,
        contents: true,
      },
    });
  }

  async findAll(): Promise<Category[]> {
    return (this.prisma as any).category.findMany({
      include: {
        children: true,
        contents: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  async findActive(): Promise<Category[]> {
    return (this.prisma as any).category.findMany({
      where: { isActive: true },
      include: {
        children: {
          where: { isActive: true },
        },
        contents: {
          where: { status: 'PUBLISHED' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findByParent(parentId?: string): Promise<Category[]> {
    return (this.prisma as any).category.findMany({
      where: { parentId: parentId || null },
      include: {
        children: true,
        contents: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  async findTree(): Promise<Category[]> {
    const allCategories = await this.findAll();
    return this.buildCategoryTree(allCategories);
  }

  async create(data: CreateCategoryDto): Promise<Category> {
    const slug = data.slug || await this.generateSlug(data.name.en);
    
    return (this.prisma as any).category.create({
      data: {
        name: data.name,
        description: data.description,
        slug,
        parentId: data.parentId,
        order: data.order || 0,
        isActive: data.isActive ?? true,
      },
      include: {
        children: true,
        contents: true,
      },
    });
  }

  async update(id: string, data: UpdateCategoryDto): Promise<Category> {
    const updateData: any = { ...data };
    
    if (data.name && !data.slug) {
      updateData.slug = await this.generateSlug(data.name.en, id);
    }

    return (this.prisma as any).category.update({
      where: { id },
      data: updateData,
      include: {
        children: true,
        contents: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    // Check if category has children
    const children = await this.findByParent(id);
    if (children.length > 0) {
      throw new Error('Cannot delete category with children');
    }

    // Check if category has content
    const category = await this.findById(id);
    if (category.contents.length > 0) {
      throw new Error('Cannot delete category with content');
    }

    await (this.prisma as any).category.delete({
      where: { id },
    });
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const where: any = { slug };
    if (excludeId) {
      where.NOT = { id: excludeId };
    }

    const count = await (this.prisma as any).category.count({ where });
    return count > 0;
  }

  async findWithContentCount(id: string): Promise<Category & { contentCount: number }> {
    const category = await this.findById(id);
    if (!category) {
      return null;
    }

    const contentCount = await (this.prisma as any).content.count({
      where: { categoryId: id },
    });

    return {
      ...category,
      contentCount,
    };
  }

  async reorder(orders: ReorderItemDto[]): Promise<void> {
    for (const item of orders) {
      await (this.prisma as any).category.update({
        where: { id: item.id },
        data: { order: item.order },
      });
    }
  }

  async getStatistics(): Promise<CategoryStatistics> {
    const [
      total,
      active,
      withContent,
      totalContent,
    ] = await Promise.all([
      (this.prisma as any).category.count(),
      (this.prisma as any).category.count({ where: { isActive: true } }),
      (this.prisma as any).category.count({
        where: {
          contents: {
            some: {},
          },
        },
      }),
      (this.prisma as any).content.count(),
    ]);

    return {
      total,
      active,
      withContent,
      averageContentPerCategory: total > 0 ? totalContent / total : 0,
    };
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

  private buildCategoryTree(categories: Category[], parentId?: string): Category[] {
    const tree: Category[] = [];

    for (const category of categories) {
      if (category.parentId === parentId) {
        const children = this.buildCategoryTree(categories, category.id);
        if (children.length) {
          category.children = children;
        }
        tree.push(category);
      }
    }

    return tree.sort((a, b) => a.order - b.order);
  }
} 