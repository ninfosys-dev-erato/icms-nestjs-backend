import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { MenuItemRepository } from '../repositories/menu-item.repository';
import { ContentService } from '../../content-management/services/content.service';
import { CategoryService } from '../../content-management/services/category.service';
import {
  CreateMenuItemDto,
  UpdateMenuItemDto,
  MenuItemQueryDto,
  MenuItemResponseDto,
  PaginatedMenuItemResponse,
  ValidationResult,
  ValidationError,
  ImportResult,
  BulkOperationResult,
} from '../dto/menu-item.dto';
import { MenuItemType } from '@prisma/client';

@Injectable()
export class MenuItemService {
  constructor(
    private readonly menuItemRepository: MenuItemRepository,
    private readonly contentService: ContentService,
    private readonly categoryService: CategoryService,
  ) {}

  async getMenuItemById(id: string): Promise<MenuItemResponseDto> {
    const menuItem = await this.menuItemRepository.findById(id);
    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }
    return this.transformToResponseDto(menuItem);
  }

  async getAllMenuItems(query: MenuItemQueryDto): Promise<PaginatedMenuItemResponse> {
    const result = await this.menuItemRepository.findAll(query);
    return {
      data: result.data.map(item => this.transformToResponseDto(item)),
      pagination: result.pagination,
    };
  }

  async getActiveMenuItems(query: MenuItemQueryDto): Promise<PaginatedMenuItemResponse> {
    const result = await this.menuItemRepository.findActive(query);
    return {
      data: result.data.map(item => this.transformToResponseDto(item)),
      pagination: result.pagination,
    };
  }

  async getMenuItemsByMenu(menuId: string, query: MenuItemQueryDto): Promise<PaginatedMenuItemResponse> {
    const result = await this.menuItemRepository.findByMenu(menuId, query);
    return {
      data: result.data.map(item => this.transformToResponseDto(item)),
      pagination: result.pagination,
    };
  }

  async getMenuItemsByParent(parentId?: string): Promise<MenuItemResponseDto[]> {
    const items = await this.menuItemRepository.findByParent(parentId);
    return items.map(item => this.transformToResponseDto(item));
  }

  async getMenuItemsByType(itemType: MenuItemType, query: MenuItemQueryDto): Promise<PaginatedMenuItemResponse> {
    const result = await this.menuItemRepository.findByType(itemType, query);
    return {
      data: result.data.map(item => this.transformToResponseDto(item)),
      pagination: result.pagination,
    };
  }

  async searchMenuItems(searchTerm: string, query: MenuItemQueryDto): Promise<PaginatedMenuItemResponse> {
    const result = await this.menuItemRepository.search(searchTerm, query);
    return {
      data: result.data.map(item => this.transformToResponseDto(item)),
      pagination: result.pagination,
    };
  }

  async createMenuItem(data: CreateMenuItemDto, userId: string): Promise<MenuItemResponseDto> {
    // Validate menu item data including slugs
    await this.validateMenuItemData(data);
    
    const validation = await this.validateMenuItem(data);
    if (!validation.isValid) {
      throw new BadRequestException('Menu item validation failed', { cause: validation.errors });
    }

    const menuItem = await this.menuItemRepository.create(data, userId);
    return this.transformToResponseDto(menuItem);
  }

  async updateMenuItem(id: string, data: UpdateMenuItemDto, userId: string): Promise<MenuItemResponseDto> {
    // Validate menu item data including slugs
    if (data.itemType || data.categorySlug || data.contentSlug) {
      await this.validateMenuItemData(data);
    }
    
    const validation = await this.validateMenuItem(data);
    if (!validation.isValid) {
      throw new BadRequestException('Menu item validation failed', { cause: validation.errors });
    }

    const menuItem = await this.menuItemRepository.update(id, data, userId);
    return this.transformToResponseDto(menuItem);
  }

  async deleteMenuItem(id: string): Promise<void> {
    const menuItem = await this.menuItemRepository.findById(id);
    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    await this.menuItemRepository.delete(id);
  }

  async reorderMenuItems(orders: { id: string; order: number }[]): Promise<void> {
    await this.menuItemRepository.reorder(orders);
  }

  async validateMenuItem(data: CreateMenuItemDto | UpdateMenuItemDto): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    if ('title' in data && (!data.title || !data.title.en || !data.title.ne)) {
      errors.push({
        field: 'title',
        message: 'Menu item title is required in both English and Nepali',
        code: 'REQUIRED_FIELD',
      });
    }

    if ('itemType' in data && !Object.values(MenuItemType).includes(data.itemType)) {
      errors.push({
        field: 'itemType',
        message: 'Invalid menu item type',
        code: 'INVALID_ITEM_TYPE',
      });
    }

    if ('target' in data && data.target && !['self', '_blank', '_parent', '_top'].includes(data.target)) {
      errors.push({
        field: 'target',
        message: 'Invalid target value',
        code: 'INVALID_TARGET',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async getMenuItemStatistics(): Promise<any> {
    return this.menuItemRepository.getStatistics();
  }

  async getMenuItemTree(menuId: string): Promise<MenuItemResponseDto[]> {
    const items = await this.menuItemRepository.getMenuItemTree(menuId);
    return items.map(item => this.transformToResponseDto(item));
  }

  async getBreadcrumb(itemId: string): Promise<MenuItemResponseDto[]> {
    const breadcrumb = await this.menuItemRepository.getBreadcrumb(itemId);
    return breadcrumb.map(item => this.transformToResponseDto(item));
  }

  async exportMenuItems(query: MenuItemQueryDto, format: 'json' | 'csv' | 'pdf'): Promise<Buffer> {
    const result = await this.menuItemRepository.findAll(query);
    const data = result.data.map(item => this.transformToResponseDto(item));

    // For now, return JSON format
    if (format === 'json') {
      return Buffer.from(JSON.stringify(data, null, 2));
    }

    // TODO: Implement CSV and PDF export
    throw new BadRequestException(`Export format ${format} not implemented yet`);
  }

  async importMenuItems(file: Express.Multer.File, userId: string): Promise<ImportResult> {
    try {
      const content = file.buffer.toString();
      const menuItems = JSON.parse(content);

      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const itemData of menuItems) {
        try {
          await this.menuItemRepository.create(itemData, userId);
          success++;
        } catch (error) {
          failed++;
          errors.push(`Failed to import menu item: ${error.message}`);
        }
      }

      return { success, failed, errors };
    } catch (error) {
      throw new BadRequestException('Invalid import file format');
    }
  }

  async bulkActivate(ids: string[]): Promise<BulkOperationResult> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const id of ids) {
      try {
        await this.menuItemRepository.update(id, { isActive: true }, 'system');
        success++;
      } catch (error) {
        failed++;
        errors.push(`Failed to activate menu item ${id}: ${error.message}`);
      }
    }

    return { success, failed, errors };
  }

  async bulkDeactivate(ids: string[]): Promise<BulkOperationResult> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const id of ids) {
      try {
        await this.menuItemRepository.update(id, { isActive: false }, 'system');
        success++;
      } catch (error) {
        failed++;
        errors.push(`Failed to deactivate menu item ${id}: ${error.message}`);
      }
    }

    return { success, failed, errors };
  }

  async bulkDelete(ids: string[]): Promise<BulkOperationResult> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const id of ids) {
      try {
        await this.menuItemRepository.delete(id);
        success++;
      } catch (error) {
        failed++;
        errors.push(`Failed to delete menu item ${id}: ${error.message}`);
      }
    }

    return { success, failed, errors };
  }

  private transformToResponseDto(menuItem: any, parentCategorySlug?: string): any {
    return {
      id: menuItem.id,
      menuId: menuItem.menuId,
      parentId: menuItem.parentId,
      title: menuItem.title,
      description: menuItem.description,
      url: menuItem.url,
      target: menuItem.target,
      icon: menuItem.icon,
      order: menuItem.order,
      isActive: menuItem.isActive,
      isPublished: menuItem.isPublished,
      itemType: menuItem.itemType,
      itemId: menuItem.itemId,
      categorySlug: menuItem.categorySlug,
      contentSlug: menuItem.contentSlug,
      resolvedUrl: this.resolveMenuItemUrl(menuItem, parentCategorySlug),
      children: menuItem.children?.map((child: any) => this.transformToResponseDto(child, parentCategorySlug)) || [],
      createdAt: menuItem.createdAt,
      updatedAt: menuItem.updatedAt,
      createdBy: menuItem.createdBy,
      updatedBy: menuItem.updatedBy,
    };
  }

  /**
   * Resolves menu item to appropriate URL based on itemType and slugs
   */
  private resolveMenuItemUrl(menuItem: any, parentCategorySlug?: string): string {
    const baseUrl = '/content';

    switch (menuItem.itemType) {
      case 'CATEGORY':
        // Use menu item's category slug if provided, otherwise use parent menu's
        const categorySlug = menuItem.categorySlug || parentCategorySlug;
        return categorySlug ? `${baseUrl}/${categorySlug}` : '/';

      case 'CONTENT':
        // Use menu item's category slug (or parent menu's) + content slug
        const itemCategorySlug = menuItem.categorySlug || parentCategorySlug;
        return itemCategorySlug && menuItem.contentSlug
          ? `${baseUrl}/${itemCategorySlug}/${menuItem.contentSlug}`
          : '/';

      case 'LINK':
        return menuItem.url || '/';

      case 'PAGE':
        return menuItem.url || `/pages/${menuItem.itemId || ''}`;

      case 'CUSTOM':
        return this.resolveCustomUrl(menuItem);

      default:
        return menuItem.url || '/';
    }
  }

  /**
   * Handle custom menu item types (contact, search, etc.)
   */
  private resolveCustomUrl(menuItem: any): string {
    if (menuItem.itemId) {
      switch (menuItem.itemId) {
        case 'contact': return '/contact';
        case 'search': return '/search';
        case 'downloads': return '/downloads';
        default: return menuItem.url || '/';
      }
    }
    return menuItem.url || '/';
  }

  /**
   * Add resolvedUrl to menu item response (for external use)
   */
  enhanceMenuItemWithUrl(menuItem: any, parentCategorySlug?: string): any {
    return {
      ...menuItem,
      resolvedUrl: this.resolveMenuItemUrl(menuItem, parentCategorySlug),
      children: menuItem.children?.map((child: any) =>
        this.enhanceMenuItemWithUrl(child, parentCategorySlug)
      )
    };
  }

  /**
   * Validate menu item data including slug validation
   */
  async validateMenuItemData(dto: CreateMenuItemDto | UpdateMenuItemDto, menuCategorySlug?: string): Promise<void> {
    switch (dto.itemType) {
      case 'CATEGORY':
        if (dto.categorySlug) {
          // Validate that category exists
          const categoryExists = await this.categoryService.getCategoryBySlug(dto.categorySlug);
          if (!categoryExists) {
            throw new NotFoundException(`Category with slug '${dto.categorySlug}' not found`);
          }
        }
        break;

      case 'CONTENT':
        if (dto.contentSlug) {
          // Validate that content exists
          const contentExists = await this.contentService.getContentBySlug(dto.contentSlug);
          if (!contentExists) {
            throw new NotFoundException(`Content with slug '${dto.contentSlug}' not found`);
          }

          // Validate that content belongs to the expected category
          if (dto.categorySlug && contentExists.category?.slug !== dto.categorySlug) {
            throw new BadRequestException(
              `Content '${dto.contentSlug}' does not belong to category '${dto.categorySlug}'`
            );
          }

          // If no categorySlug provided, validate against menu's category
          if (!dto.categorySlug && menuCategorySlug && contentExists.category?.slug !== menuCategorySlug) {
            throw new BadRequestException(
              `Content '${dto.contentSlug}' does not belong to menu's category '${menuCategorySlug}'`
            );
          }
        }
        break;

      case 'LINK':
        if (!dto.url) {
          throw new BadRequestException('url is required for LINK type menu items');
        }
        break;
    }
  }
} 