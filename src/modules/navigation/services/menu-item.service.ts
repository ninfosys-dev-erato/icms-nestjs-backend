import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { MenuItemRepository } from '../repositories/menu-item.repository';
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
  constructor(private readonly menuItemRepository: MenuItemRepository) {}

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
    const validation = await this.validateMenuItem(data);
    if (!validation.isValid) {
      throw new BadRequestException('Menu item validation failed', { cause: validation.errors });
    }

    const menuItem = await this.menuItemRepository.create(data, userId);
    return this.transformToResponseDto(menuItem);
  }

  async updateMenuItem(id: string, data: UpdateMenuItemDto, userId: string): Promise<MenuItemResponseDto> {
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

  private transformToResponseDto(menuItem: any): MenuItemResponseDto {
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
      children: menuItem.children?.map((child: any) => this.transformToResponseDto(child)) || [],
      createdAt: menuItem.createdAt,
      updatedAt: menuItem.updatedAt,
      createdBy: menuItem.createdBy,
      updatedBy: menuItem.updatedBy,
    };
  }
} 