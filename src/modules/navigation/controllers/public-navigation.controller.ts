import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { MenuService } from '../services/menu.service';
import { MenuItemService } from '../services/menu-item.service';
import { MenuQueryDto, MenuLocation } from '../dto/menu.dto';
import { MenuItemQueryDto } from '../dto/menu-item.dto';
import { ApiResponseBuilder } from '@/common/types/api-response';

@ApiTags('Public Navigation')
@Controller('api/v1')
export class PublicNavigationController {
  constructor(
    private readonly menuService: MenuService,
    private readonly menuItemService: MenuItemService,
  ) {}

  @Get('menus')
  @ApiOperation({ summary: 'Get all published menus' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved menus' })
  async getAllMenus(
    @Query() query: MenuQueryDto,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.menuService.getPublishedMenus(query);
    response.json(ApiResponseBuilder.success(result));
  }

  @Get('menus/:id')
  @ApiOperation({ summary: 'Get menu by ID' })
  @ApiParam({ name: 'id', description: 'Menu ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved menu' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  async getMenuById(
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.menuService.getMenuById(id);
    response.json(ApiResponseBuilder.success(result));
  }

  @Get('menus/location/:location')
  @ApiOperation({ summary: 'Get menu by location' })
  @ApiParam({ name: 'location', enum: MenuLocation, description: 'Menu location' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved menu' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  async getMenuByLocation(
    @Param('location') location: MenuLocation,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.menuService.getMenuByLocation(location);
    response.json(ApiResponseBuilder.success(result));
  }

  @Get('menus/:id/tree')
  @ApiOperation({ summary: 'Get menu tree' })
  @ApiParam({ name: 'id', description: 'Menu ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved menu tree' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  async getMenuTree(
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.menuService.getMenuTree(id);
    response.json(ApiResponseBuilder.success(result));
  }

  @Get('menu-items')
  @ApiOperation({ summary: 'Get all published menu items' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved menu items' })
  async getAllMenuItems(
    @Query() query: MenuItemQueryDto,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.menuItemService.getActiveMenuItems(query);
    response.json(ApiResponseBuilder.success(result));
  }

  @Get('menu-items/:id')
  @ApiOperation({ summary: 'Get menu item by ID' })
  @ApiParam({ name: 'id', description: 'Menu item ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved menu item' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async getMenuItemById(
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.menuItemService.getMenuItemById(id);
    response.json(ApiResponseBuilder.success(result));
  }

  @Get('menu-items/menu/:menuId')
  @ApiOperation({ summary: 'Get menu items by menu' })
  @ApiParam({ name: 'menuId', description: 'Menu ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved menu items' })
  async getMenuItemsByMenu(
    @Param('menuId') menuId: string,
    @Query() query: MenuItemQueryDto,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.menuItemService.getMenuItemsByMenu(menuId, query);
    response.json(ApiResponseBuilder.success(result));
  }

  @Get('menu-items/:itemId/breadcrumb')
  @ApiOperation({ summary: 'Get breadcrumb for item' })
  @ApiParam({ name: 'itemId', description: 'Menu item ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved breadcrumb' })
  async getBreadcrumb(
    @Param('itemId') itemId: string,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.menuItemService.getBreadcrumb(itemId);
    response.json(ApiResponseBuilder.success(result));
  }

  @Get('menu-items/search')
  @ApiOperation({ summary: 'Search menu items' })
  @ApiQuery({ name: 'q', description: 'Search term' })
  @ApiResponse({ status: 200, description: 'Successfully searched menu items' })
  async searchMenuItems(
    @Query('q') searchTerm: string,
    @Query() query: MenuItemQueryDto,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.menuItemService.searchMenuItems(searchTerm, query);
    response.json(ApiResponseBuilder.success(result));
  }
} 