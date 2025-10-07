import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import * as crypto from 'crypto';

import { CategoryRepository } from '../repositories/category.repository';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryResponseDto,
  CategoryStatistics,
  ValidationResult,
  ReorderItemDto,
} from '../dto/content-management.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async getCategoryById(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.mapCategoryToResponse(category);
  }

  async getCategoryBySlug(slug: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findBySlug(slug);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.mapCategoryToResponse(category);
  }

  async getAllCategories(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.findAll();
    return categories.map(category => this.mapCategoryToResponse(category));
  }

  async getAvailableParentCategories(excludeCategoryId?: string): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.findActive();
    
    // Filter out the current category if updating (to prevent self-reference)
    const availableParents = categories.filter(category => 
      category.id !== excludeCategoryId
    );
    
    return availableParents.map(category => this.mapCategoryToResponse(category));
  }

  async getCategoryTree(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.findTree();
    return categories.map(category => this.mapCategoryToResponse(category));
  }

  async getActiveCategories(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.findActive();
    return categories.map(category => this.mapCategoryToResponse(category));
  }

  async createCategory(data: CreateCategoryDto): Promise<CategoryResponseDto> {
    // Validate category data
    const validation = await this.validateCategory(data);
    if (!validation.isValid) {
      throw new BadRequestException('Validation failed', { cause: validation.errors });
    }

    // Check if slug already exists
    const slug = data.slug || await this.generateSlug(data.name.en);
    if (await this.categoryRepository.slugExists(slug)) {
      throw new ConflictException('Category with this slug already exists');
    }

    // Validate parent category if provided
    if (data.parentId) {
      // Check if parentId is not empty or whitespace
      if (typeof data.parentId === 'string' && data.parentId.trim() === '') {
        throw new BadRequestException('Parent ID cannot be empty or whitespace. Omit the field to make this a root category.');
      }
      
      const parentCategory = await this.categoryRepository.findById(data.parentId);
      if (!parentCategory) {
        throw new NotFoundException(
          `Parent category with ID '${data.parentId}' not found. ` +
          `Please select a valid parent category from the existing categories, ` +
          `or omit the parentId field to make this a root category. ` +
          `Available root categories: ${(await this.getActiveCategories()).map(c => c.name.en).join(', ')}`
        );
      }
      
      // Check if parent category is active
      if (!parentCategory.isActive) {
        throw new BadRequestException(`Cannot move category under inactive parent category '${parentCategory.name.en}'. Please select an active parent category.`);
      }
    }

    const category = await this.categoryRepository.create({
      ...data,
      slug,
    });

    return this.mapCategoryToResponse(category);
  }

  async updateCategory(id: string, data: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Validate category data
    const validation = await this.validateCategory(data);
    if (!validation.isValid) {
      throw new BadRequestException('Validation failed', { cause: validation.errors });
    }

    // Check if slug already exists (if being updated)
    if (data.slug && data.slug !== category.slug) {
      if (await this.categoryRepository.slugExists(data.slug, id)) {
        throw new ConflictException('Category with this slug already exists');
      }
    }

    // Validate parent category if being updated
    if (data.parentId && data.parentId !== category.parentId) {
      if (data.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      const parentCategory = await this.categoryRepository.findById(data.parentId);
      if (!parentCategory) {
        throw new NotFoundException('Parent category not found');
      }

      // Check for circular references
      if (await this.hasCircularReference(id, data.parentId)) {
        throw new BadRequestException('Circular reference detected');
      }
    }

    const updatedCategory = await this.categoryRepository.update(id, data);
    return this.mapCategoryToResponse(updatedCategory);
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    try {
      await this.categoryRepository.delete(id);
    } catch (error) {
      if (error.message.includes('children')) {
        throw new BadRequestException('Cannot delete category with children');
      }
      if (error.message.includes('content')) {
        throw new BadRequestException('Cannot delete category with content');
      }
      throw error;
    }
  }

  async reorderCategories(orders: ReorderItemDto[]): Promise<void> {
    if (!orders || orders.length === 0) {
      throw new BadRequestException('Orders array is required');
    }

    // Validate that all categories exist
    for (const order of orders) {
      const category = await this.categoryRepository.findById(order.id);
      if (!category) {
        throw new NotFoundException(`Category with ID ${order.id} not found`);
      }
    }

    await this.categoryRepository.reorder(orders);
  }

  async validateCategory(data: CreateCategoryDto | UpdateCategoryDto): Promise<ValidationResult> {
    const errors: any[] = [];

    // Validate name (for create operations)
    if ('name' in data && data.name) {
      if (!data.name.en || !data.name.ne) {
        errors.push({
          field: 'name',
          message: 'Name must have both English and Nepali translations',
          code: 'INVALID_NAME',
        });
      }
    }

    // Validate description (if provided)
    if (data.description) {
      if (!data.description.en || !data.description.ne) {
        errors.push({
          field: 'description',
          message: 'Description must have both English and Nepali translations',
          code: 'INVALID_DESCRIPTION',
        });
      }
    }

    // Validate slug format (if provided)
    if (data.slug) {
      if (!/^[a-z0-9-]+$/.test(data.slug)) {
        errors.push({
          field: 'slug',
          message: 'Slug must contain only lowercase letters, numbers, and hyphens',
          code: 'INVALID_SLUG_FORMAT',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async generateSlug(title: string, excludeId?: string): Promise<string> {
    let slug = this.slugify(title);
    let counter = 1;
    let finalSlug = slug;

    while (await this.categoryRepository.slugExists(finalSlug, excludeId)) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    return finalSlug;
  }

  async getCategoryStatistics(): Promise<CategoryStatistics> {
    return this.categoryRepository.getStatistics();
  }

  // Utility methods
  private mapCategoryToResponse(category: any): CategoryResponseDto {
    const contentCount = category.contents ? category.contents.length : 0;
    
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      slug: category.slug,
      parentId: category.parentId,
      order: category.order,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      children: category.children ? category.children.map((child: any) => this.mapCategoryToResponse(child)) : [],
      contentCount,
    };
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async hasCircularReference(categoryId: string, newParentId: string): Promise<boolean> {
    let currentParentId = newParentId;
    const visited = new Set<string>();

    while (currentParentId) {
      if (visited.has(currentParentId)) {
        return true; // Circular reference detected
      }

      if (currentParentId === categoryId) {
        return true; // Would create circular reference
      }

      visited.add(currentParentId);
      const parent = await this.categoryRepository.findById(currentParentId);
      currentParentId = parent?.parentId;
    }

    return false;
  }
} 