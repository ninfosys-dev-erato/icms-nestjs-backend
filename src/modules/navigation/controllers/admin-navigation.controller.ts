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
import { ApiResponseBuilder } from '@/common/types/api-response';

@ApiTags('Admin Navigation')
@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminNavigationController {
  constructor(
    private readonly menuService: MenuService,
    private readonly menuItemService: MenuItemService,
  ) {}

  // Menu Management Endpoints

  @Get('menus/:id')
  @ApiOperation({ summary: 'Get menu by ID (admin)' })
  @ApiParam({ name: 'id', description: 'Menu ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved menu' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  @Roles('ADMIN', 'EDITOR')
  async getMenuById(
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.menuService.getMenuById(id);
    response.json(ApiResponseBuilder.success(result));
  }

  @Post('menus')
  @ApiOperation({ summary: 'Create menu' })
  @ApiResponse({ status: 201, description: 'Menu created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Roles('ADMIN', 'EDITOR')
  async createMenu(
    @Body() data: CreateMenuDto,
    @CurrentUser() user: any,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.menuService.createMenu(data, user.id);
    response.status(201).json(ApiResponseBuilder.success(result));
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
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.menuService.updateMenu(id, data, user.id);
    response.json(ApiResponseBuilder.success(result));
  }

  @Delete('menus/:id')
  @ApiOperation({ summary: 'Delete menu' })
  @ApiParam({ name: 'id', description: 'Menu ID' })
  @ApiResponse({ status: 200, description: 'Menu deleted successfully' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  @Roles('ADMIN')
  async deleteMenu(
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<void> {
    await this.menuService.deleteMenu(id);
    response.json(ApiResponseBuilder.success({ message: 'Menu deleted successfully' }));
  }

  @Post('menus/:id/publish')
  @ApiOperation({ summary: 'Publish menu' })
  @ApiParam({ name: 'id', description: 'Menu ID' })
  @ApiResponse({ status: 200, description: 'Menu published successfully' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  @Roles('ADMIN', 'EDITOR')
  async publishMenu(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.menuService.publishMenu(id, user.id);
    response.json(ApiResponseBuilder.success(result));
  }

  @Post('menus/:id/unpublish')
  @ApiOperation({ summary: 'Unpublish menu' })
  @ApiParam({ name: 'id', description: 'Menu ID' })
  @ApiResponse({ status: 200, description: 'Menu unpublished successfully' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  @Roles('ADMIN', 'EDITOR')
  async unpublishMenu(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.menuService.unpublishMenu(id, user.id);
    response.json(ApiResponseBuilder.success(result));
  }

  @Get('menus/statistics')
  @ApiOperation({ summary: 'Get menu statistics' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved statistics' })
  @Roles('ADMIN', 'EDITOR')
  async getMenuStatistics(
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.menuService.getMenuStatistics();
    response.json(ApiResponseBuilder.success(result));
  }

  @Get('menus/export')
  @ApiOperation({ summary: 'Export menus' })
  @ApiQuery({ name: 'format', enum: ['json', 'csv', 'pdf'], description: 'Export format' })
  @ApiResponse({ status: 200, description: 'Menus exported successfully' })
  @Roles('ADMIN', 'EDITOR')
  async exportMenus(
    @Query() query: MenuQueryDto,
    @Query('format') format: 'json' | 'csv' | 'pdf',
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.menuService.exportMenus(query, format);
    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Content-Disposition', `attachment; filename=menus.${format}`);
    response.send(result);
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
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.menuService.importMenus(file, user.id);
    response.json(ApiResponseBuilder.success(result));
  }

  @Post('menus/bulk-publish')
  @ApiOperation({ summary: 'Bulk publish menus' })
  @ApiResponse({ status: 200, description: 'Menus published successfully' })
  @Roles('ADMIN', 'EDITOR')
  async bulkPublishMenus(
    @Body() ids: string[],
    @CurrentUser() user: any,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.menuService.bulkPublish(ids, user.id);
    response.json(ApiResponseBuilder.success(result));
  }

  @Post('menus/bulk-unpublish')
  @ApiOperation({ summary: 'Bulk unpublish menus' })
  @ApiResponse({ status: 200, description: 'Menus unpublished successfully' })
  @Roles('ADMIN', 'EDITOR')
  async bulkUnpublishMenus(
    @Body() ids: string[],
    @CurrentUser() user: any,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.menuService.bulkUnpublish(ids, user.id);
    response.json(ApiResponseBuilder.success(result));
  }

  @Delete('menus/bulk-delete')
  @ApiOperation({ summary: 'Bulk delete menus' })
  @ApiResponse({ status: 200, description: 'Menus deleted successfully' })
  @Roles('ADMIN')
  async bulkDeleteMenus(
    @Body() ids: string[],
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.menuService.bulkDelete(ids);
    response.json(ApiResponseBuilder.success(result));
  }

  // Menu Item Management Endpoints

  @Get('menu-items/:id')
  @ApiOperation({ summary: 'Get menu item by ID (admin)' })
  @ApiParam({ name: 'id', description: 'Menu item ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved menu item' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  @Roles('ADMIN', 'EDITOR')
  async getMenuItemById(
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.menuItemService.getMenuItemById(id);
    response.json(ApiResponseBuilder.success(result));
  }

  @Post('menu-items')
  @ApiOperation({ summary: 'Create menu item' })
  @ApiResponse({ status: 201, description: 'Menu item created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Roles('ADMIN', 'EDITOR')
  async createMenuItem(
    @Body() data: CreateMenuItemDto,
    @CurrentUser() user: any,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.menuItemService.createMenuItem(data, user.id);
    response.status(201).json(ApiResponseBuilder.success(result));
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
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.menuItemService.updateMenuItem(id, data, user.id);
    response.json(ApiResponseBuilder.success(result));
  }

  @Delete('menu-items/:id')
  @ApiOperation({ summary: 'Delete menu item' })
  @ApiParam({ name: 'id', description: 'Menu item ID' })
  @ApiResponse({ status: 200, description: 'Menu item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  @Roles('ADMIN')
  async deleteMenuItem(
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<void> {
    await this.menuItemService.deleteMenuItem(id);
    response.json(ApiResponseBuilder.success({ message: 'Menu item deleted successfully' }));
  }

  @Put('menu-items/reorder')
  @ApiOperation({ summary: 'Reorder menu items' })
  @ApiResponse({ status: 200, description: 'Menu items reordered successfully' })
  @Roles('ADMIN', 'EDITOR')
  async reorderMenuItems(
    @Body() orders: { id: string; order: number }[],
    @Res() response: Response,
  ): Promise<void> {
    await this.menuItemService.reorderMenuItems(orders);
    response.json(ApiResponseBuilder.success({ message: 'Menu items reordered successfully' }));
  }

  @Get('menu-items/statistics')
  @ApiOperation({ summary: 'Get menu item statistics' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved statistics' })
  @Roles('ADMIN', 'EDITOR')
  async getMenuItemStatistics(
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.menuItemService.getMenuItemStatistics();
    response.json(ApiResponseBuilder.success(result));
  }

  @Get('menu-items/export')
  @ApiOperation({ summary: 'Export menu items' })
  @ApiQuery({ name: 'format', enum: ['json', 'csv', 'pdf'], description: 'Export format' })
  @ApiResponse({ status: 200, description: 'Menu items exported successfully' })
  @Roles('ADMIN', 'EDITOR')
  async exportMenuItems(
    @Query() query: MenuItemQueryDto,
    @Query('format') format: 'json' | 'csv' | 'pdf',
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.menuItemService.exportMenuItems(query, format);
    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Content-Disposition', `attachment; filename=menu-items.${format}`);
    response.send(result);
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
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.menuItemService.importMenuItems(file, user.id);
    response.json(ApiResponseBuilder.success(result));
  }
} 