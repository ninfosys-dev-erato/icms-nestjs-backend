import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { MenuRepository } from '../repositories/menu.repository';
import {
  CreateMenuDto,
  UpdateMenuDto,
  MenuQueryDto,
  MenuResponseDto,
  PaginatedMenuResponse,
  ValidationResult,
  ValidationError,
  ImportResult,
  BulkOperationResult,
  MenuTreeResponse,
  TranslatableEntityDto,
} from '../dto/menu.dto';
import { TranslatableEntity } from '@/common/types/translatable.entity';
import { MenuLocation } from '@prisma/client';

@Injectable()
export class MenuService {
  constructor(private readonly menuRepository: MenuRepository) {}

  async getMenuById(id: string): Promise<MenuResponseDto> {
    const menu = await this.menuRepository.findById(id);
    if (!menu) {
      throw new NotFoundException('Menu not found');
    }
    return this.transformToResponseDto(menu);
  }

  async getAllMenus(query: MenuQueryDto): Promise<PaginatedMenuResponse> {
    const result = await this.menuRepository.findAll(query);
    return {
      data: result.data.map(menu => this.transformToResponseDto(menu)),
      pagination: result.pagination,
    };
  }

  async getActiveMenus(query: MenuQueryDto): Promise<PaginatedMenuResponse> {
    const result = await this.menuRepository.findActive(query);
    return {
      data: result.data.map(menu => this.transformToResponseDto(menu)),
      pagination: result.pagination,
    };
  }

  async getPublishedMenus(query: MenuQueryDto): Promise<PaginatedMenuResponse> {
    const result = await this.menuRepository.findPublished(query);
    return {
      data: result.data.map(menu => this.transformToResponseDto(menu)),
      pagination: result.pagination,
    };
  }

  async getMenuByLocation(location: MenuLocation): Promise<MenuResponseDto> {
    const menu = await this.menuRepository.findByLocation(location);
    if (!menu) {
      throw new NotFoundException(`Menu not found for location: ${location}`);
    }
    return this.transformToResponseDto(menu);
  }

  async searchMenus(searchTerm: string, query: MenuQueryDto): Promise<PaginatedMenuResponse> {
    const result = await this.menuRepository.search(searchTerm, query);
    return {
      data: result.data.map(menu => this.transformToResponseDto(menu)),
      pagination: result.pagination,
    };
  }

  async createMenu(data: CreateMenuDto, userId: string): Promise<MenuResponseDto> {
    const validation = await this.validateMenu(data);
    if (!validation.isValid) {
      throw new BadRequestException('Menu validation failed', { cause: validation.errors });
    }

    const menu = await this.menuRepository.create(data, userId);
    return this.transformToResponseDto(menu);
  }

  async updateMenu(id: string, data: UpdateMenuDto, userId: string): Promise<MenuResponseDto> {
    const validation = await this.validateMenu(data);
    if (!validation.isValid) {
      throw new BadRequestException('Menu validation failed', { cause: validation.errors });
    }

    const menu = await this.menuRepository.update(id, data, userId);
    return this.transformToResponseDto(menu);
  }

  async deleteMenu(id: string): Promise<void> {
    const menu = await this.menuRepository.findById(id);
    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    await this.menuRepository.delete(id);
  }

  async publishMenu(id: string, userId: string): Promise<MenuResponseDto> {
    const menu = await this.menuRepository.publish(id, userId);
    return this.transformToResponseDto(menu);
  }

  async unpublishMenu(id: string, userId: string): Promise<MenuResponseDto> {
    const menu = await this.menuRepository.unpublish(id, userId);
    return this.transformToResponseDto(menu);
  }

  async validateMenu(data: CreateMenuDto | UpdateMenuDto): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    if ('name' in data && data.name && (!data.name.en || !data.name.ne)) {
      errors.push({
        field: 'name',
        message: 'Menu name is required in both English and Nepali',
        code: 'REQUIRED_FIELD',
      });
    }

    if ('location' in data && data.location && !Object.values(MenuLocation).includes(data.location)) {
      errors.push({
        field: 'location',
        message: 'Invalid menu location',
        code: 'INVALID_LOCATION',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async getMenuStatistics(): Promise<any> {
    return this.menuRepository.getStatistics();
  }

  async getMenuTree(id: string): Promise<MenuTreeResponse> {
    const tree = await this.menuRepository.getMenuTree(id);
    if (!tree) {
      throw new NotFoundException('Menu not found');
    }

    return {
      menu: this.transformToResponseDto(tree.menu),
      items: tree.items.map(item => this.transformMenuItemToTreeResponse(item)),
    };
  }

  async exportMenus(query: MenuQueryDto, format: 'json' | 'csv' | 'pdf'): Promise<Buffer> {
    const result = await this.menuRepository.findAll(query);
    const data = result.data.map(menu => this.transformToResponseDto(menu));

    // For now, return JSON format
    if (format === 'json') {
      return Buffer.from(JSON.stringify(data, null, 2));
    }

    // TODO: Implement CSV and PDF export
    throw new BadRequestException(`Export format ${format} not implemented yet`);
  }

  async importMenus(file: Express.Multer.File, userId: string): Promise<ImportResult> {
    try {
      const content = file.buffer.toString();
      const menus = JSON.parse(content);

      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const menuData of menus) {
        try {
          await this.menuRepository.create(menuData, userId);
          success++;
        } catch (error) {
          failed++;
          errors.push(`Failed to import menu: ${error.message}`);
        }
      }

      return { success, failed, errors };
    } catch (error) {
      throw new BadRequestException('Invalid import file format');
    }
  }

  async bulkPublish(ids: string[], userId: string): Promise<BulkOperationResult> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const id of ids) {
      try {
        await this.menuRepository.publish(id, userId);
        success++;
      } catch (error) {
        failed++;
        errors.push(`Failed to publish menu ${id}: ${error.message}`);
      }
    }

    return { success, failed, errors };
  }

  async bulkUnpublish(ids: string[], userId: string): Promise<BulkOperationResult> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const id of ids) {
      try {
        await this.menuRepository.unpublish(id, userId);
        success++;
      } catch (error) {
        failed++;
        errors.push(`Failed to unpublish menu ${id}: ${error.message}`);
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
        await this.menuRepository.delete(id);
        success++;
      } catch (error) {
        failed++;
        errors.push(`Failed to delete menu ${id}: ${error.message}`);
      }
    }

    return { success, failed, errors };
  }

  private transformToResponseDto(menu: any): MenuResponseDto {
    return {
      id: menu.id,
      name: menu.name,
      description: menu.description,
      location: menu.location,
      isActive: menu.isActive,
      isPublished: menu.isPublished,
      menuItemCount: menu.menuItems?.length || 0,
      menuItems: menu.menuItems?.map((item: any) => this.transformMenuItemToResponseDto(item)) || [],
      createdAt: menu.createdAt,
      updatedAt: menu.updatedAt,
      createdBy: menu.createdBy,
      updatedBy: menu.updatedBy,
    };
  }

  private transformMenuItemToResponseDto(item: any): any {
    return {
      id: item.id,
      menuId: item.menuId,
      parentId: item.parentId,
      title: item.title,
      description: item.description,
      url: item.url,
      target: item.target,
      icon: item.icon,
      order: item.order,
      isActive: item.isActive,
      isPublished: item.isPublished,
      itemType: item.itemType,
      itemId: item.itemId,
      children: item.children?.map((child: any) => this.transformMenuItemToResponseDto(child)) || [],
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      createdBy: item.createdBy,
      updatedBy: item.updatedBy,
    };
  }

  private transformMenuItemToTreeResponse(item: any): any {
    return {
      id: item.id,
      menuId: item.menuId,
      parentId: item.parentId,
      title: item.title,
      description: item.description,
      url: item.url,
      target: item.target,
      icon: item.icon,
      order: item.order,
      isActive: item.isActive,
      isPublished: item.isPublished,
      itemType: item.itemType,
      itemId: item.itemId,
      children: item.children?.map((child: any) => this.transformMenuItemToTreeResponse(child)) || [],
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      createdBy: item.createdBy,
      updatedBy: item.updatedBy,
    };
  }
} 