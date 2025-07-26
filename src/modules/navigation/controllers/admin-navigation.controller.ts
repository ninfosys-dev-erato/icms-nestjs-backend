import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { MenuService } from '../services/menu.service';
import { MenuItemService } from '../services/menu-item.service';
import {
  CreateMenuDto,
  UpdateMenuDto,
  MenuQueryDto,
  MenuLocation,
} from '../dto/menu.dto';
import {
  CreateMenuItemDto,
  UpdateMenuItemDto,
  MenuItemQueryDto,
} from '../dto/menu-item.dto';

@ApiTags('Admin Navigation')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminNavigationController {
  constructor(
    private readonly menuService: MenuService,
    private readonly menuItemService: MenuItemService,
  ) {}

  // Menu Management Endpoints - Specific routes first

  @Get('menus/statistics')
  @ApiOperation({ summary: 'Get menu statistics' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved statistics' })
  @Roles('ADMIN', 'EDITOR')
  async getMenuStatistics(): Promise<any> {
    return await this.menuService.getMenuStatistics();
  }

  @Get('menus/export')
  @ApiOperation({ summary: 'Export menus' })
  @ApiQuery({ name: 'format', enum: ['json', 'csv', 'pdf'], description: 'Export format' })
  @ApiResponse({ status: 200, description: 'Menus exported successfully' })
  @Roles('ADMIN', 'EDITOR')
  async exportMenus(
    @Query() query: MenuQueryDto,
    @Query('format') format: 'json' | 'csv' | 'pdf',
  ): Promise<any> {
    return await this.menuService.exportMenus(query, format);
  }

  @Post('menus/import')
  @ApiOperation({ summary: 'Import menus' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Menus imported successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  async importMenus(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ): Promise<any> {
    return await this.menuService.importMenus(file, user.id);
  }

  @Post('menus/bulk-publish')
  @HttpCode(200)
  @ApiOperation({ summary: 'Bulk publish menus' })
  @ApiResponse({ status: 200, description: 'Menus published successfully' })
  @Roles('ADMIN', 'EDITOR')
  async bulkPublishMenus(
    @Body() ids: string[],
    @CurrentUser() user: any,
  ): Promise<any> {
    return await this.menuService.bulkPublish(ids, user.id);
  }

  @Post('menus/bulk-unpublish')
  @HttpCode(200)
  @ApiOperation({ summary: 'Bulk unpublish menus' })
  @ApiResponse({ status: 200, description: 'Menus unpublished successfully' })
  @Roles('ADMIN', 'EDITOR')
  async bulkUnpublishMenus(
    @Body() ids: string[],
    @CurrentUser() user: any,
  ): Promise<any> {
    return await this.menuService.bulkUnpublish(ids, user.id);
  }

  @Delete('menus/bulk-delete')
  @ApiOperation({ summary: 'Bulk delete menus' })
  @ApiResponse({ status: 200, description: 'Menus deleted successfully' })
  @Roles('ADMIN')
  async bulkDeleteMenus(
    @Body() ids: string[],
  ): Promise<any> {
    return await this.menuService.bulkDelete(ids);
  }

  // Menu Management Endpoints - Parameterized routes

  @Get('menus/:id')
  @ApiOperation({ summary: 'Get menu by ID (admin)' })
  @ApiParam({ name: 'id', description: 'Menu ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved menu' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  @Roles('ADMIN', 'EDITOR')
  async getMenuById(
    @Param('id') id: string,
  ): Promise<any> {
    return await this.menuService.getMenuById(id);
  }

  @Post('menus')
  @ApiOperation({ summary: 'Create menu' })
  @ApiResponse({ status: 201, description: 'Menu created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Roles('ADMIN', 'EDITOR')
  async createMenu(
    @Body() data: CreateMenuDto,
    @CurrentUser() user: any,
  ): Promise<any> {
    return await this.menuService.createMenu(data, user.id);
  }

  @Put('menus/:id')
  @ApiOperation({ summary: 'Update menu' })
  @ApiParam({ name: 'id', description: 'Menu ID' })
  @ApiResponse({ status: 200, description: 'Menu updated successfully' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  @Roles('ADMIN', 'EDITOR')
  async updateMenu(
    @Param('id') id: string,
    @Body() data: UpdateMenuDto,
    @CurrentUser() user: any,
  ): Promise<any> {
    return await this.menuService.updateMenu(id, data, user.id);
  }

  @Delete('menus/:id')
  @ApiOperation({ summary: 'Delete menu' })
  @ApiParam({ name: 'id', description: 'Menu ID' })
  @ApiResponse({ status: 200, description: 'Menu deleted successfully' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  @Roles('ADMIN')
  async deleteMenu(
    @Param('id') id: string,
  ): Promise<any> {
    await this.menuService.deleteMenu(id);
    return { message: 'Menu deleted successfully' };
  }

  @Post('menus/:id/publish')
  @HttpCode(200)
  @ApiOperation({ summary: 'Publish menu' })
  @ApiParam({ name: 'id', description: 'Menu ID' })
  @ApiResponse({ status: 200, description: 'Menu published successfully' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  @Roles('ADMIN', 'EDITOR')
  async publishMenu(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<any> {
    return await this.menuService.publishMenu(id, user.id);
  }

  @Post('menus/:id/unpublish')
  @HttpCode(200)
  @ApiOperation({ summary: 'Unpublish menu' })
  @ApiParam({ name: 'id', description: 'Menu ID' })
  @ApiResponse({ status: 200, description: 'Menu unpublished successfully' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  @Roles('ADMIN', 'EDITOR')
  async unpublishMenu(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<any> {
    return await this.menuService.unpublishMenu(id, user.id);
  }

  // Menu Item Management Endpoints - Specific routes first

  @Get('menu-items/statistics')
  @ApiOperation({ summary: 'Get menu item statistics' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved statistics' })
  @Roles('ADMIN', 'EDITOR')
  async getMenuItemStatistics(): Promise<any> {
    return await this.menuItemService.getMenuItemStatistics();
  }

  @Get('menu-items/export')
  @ApiOperation({ summary: 'Export menu items' })
  @ApiQuery({ name: 'format', enum: ['json', 'csv', 'pdf'], description: 'Export format' })
  @ApiResponse({ status: 200, description: 'Menu items exported successfully' })
  @Roles('ADMIN', 'EDITOR')
  async exportMenuItems(
    @Query() query: MenuItemQueryDto,
    @Query('format') format: 'json' | 'csv' | 'pdf',
  ): Promise<any> {
    return await this.menuItemService.exportMenuItems(query, format);
  }

  @Post('menu-items/import')
  @ApiOperation({ summary: 'Import menu items' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Menu items imported successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  async importMenuItems(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ): Promise<any> {
    return await this.menuItemService.importMenuItems(file, user.id);
  }

  @Put('menu-items/reorder')
  @ApiOperation({ summary: 'Reorder menu items' })
  @ApiResponse({ status: 200, description: 'Menu items reordered successfully' })
  @Roles('ADMIN', 'EDITOR')
  async reorderMenuItems(
    @Body() orders: { id: string; order: number }[],
  ): Promise<any> {
    await this.menuItemService.reorderMenuItems(orders);
    return { message: 'Menu items reordered successfully' };
  }

  // Menu Item Management Endpoints - Parameterized routes

  @Get('menu-items/:id')
  @ApiOperation({ summary: 'Get menu item by ID (admin)' })
  @ApiParam({ name: 'id', description: 'Menu item ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved menu item' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  @Roles('ADMIN', 'EDITOR')
  async getMenuItemById(
    @Param('id') id: string,
  ): Promise<any> {
    return await this.menuItemService.getMenuItemById(id);
  }

  @Post('menu-items')
  @ApiOperation({ summary: 'Create menu item' })
  @ApiResponse({ status: 201, description: 'Menu item created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Roles('ADMIN', 'EDITOR')
  async createMenuItem(
    @Body() data: CreateMenuItemDto,
    @CurrentUser() user: any,
  ): Promise<any> {
    return await this.menuItemService.createMenuItem(data, user.id);
  }

  @Put('menu-items/:id')
  @ApiOperation({ summary: 'Update menu item' })
  @ApiParam({ name: 'id', description: 'Menu item ID' })
  @ApiResponse({ status: 200, description: 'Menu item updated successfully' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  @Roles('ADMIN', 'EDITOR')
  async updateMenuItem(
    @Param('id') id: string,
    @Body() data: UpdateMenuItemDto,
    @CurrentUser() user: any,
  ): Promise<any> {
    return await this.menuItemService.updateMenuItem(id, data, user.id);
  }

  @Delete('menu-items/:id')
  @ApiOperation({ summary: 'Delete menu item' })
  @ApiParam({ name: 'id', description: 'Menu item ID' })
  @ApiResponse({ status: 200, description: 'Menu item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  @Roles('ADMIN')
  async deleteMenuItem(
    @Param('id') id: string,
  ): Promise<any> {
    await this.menuItemService.deleteMenuItem(id);
    return { message: 'Menu item deleted successfully' };
  }
} 