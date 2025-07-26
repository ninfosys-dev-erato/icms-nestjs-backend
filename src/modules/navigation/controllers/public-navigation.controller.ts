import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MenuService } from '../services/menu.service';
import { MenuItemService } from '../services/menu-item.service';
import { MenuQueryDto, MenuLocation } from '../dto/menu.dto';
import { MenuItemQueryDto } from '../dto/menu-item.dto';

@ApiTags('Public Navigation')
@Controller('')
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
  ): Promise<any> {
    const result = await this.menuService.getPublishedMenus(query);
    
    // If pagination is requested, return paginated response
    if (query.page || query.limit) {
      return result;
    } else {
      // Otherwise, return just the data array
      return result.data;
    }
  }

  @Get('menus/:id')
  @ApiOperation({ summary: 'Get menu by ID' })
  @ApiParam({ name: 'id', description: 'Menu ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved menu' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  async getMenuById(
    @Param('id') id: string,
  ): Promise<any> {
    return await this.menuService.getMenuById(id);
  }

  @Get('menus/location/:location')
  @ApiOperation({ summary: 'Get menu by location' })
  @ApiParam({ name: 'location', enum: MenuLocation, description: 'Menu location' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved menu' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  async getMenuByLocation(
    @Param('location') location: MenuLocation,
  ): Promise<any> {
    return await this.menuService.getMenuByLocation(location);
  }

  @Get('menus/:id/tree')
  @ApiOperation({ summary: 'Get menu tree' })
  @ApiParam({ name: 'id', description: 'Menu ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved menu tree' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  async getMenuTree(
    @Param('id') id: string,
  ): Promise<any> {
    return await this.menuService.getMenuTree(id);
  }

  @Get('menu-items')
  @ApiOperation({ summary: 'Get all published menu items' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved menu items' })
  async getAllMenuItems(
    @Query() query: MenuItemQueryDto,
  ): Promise<any> {
    const result = await this.menuItemService.getActiveMenuItems(query);
    
    // If pagination is requested, return paginated response
    if (query.page || query.limit) {
      return result;
    } else {
      // Otherwise, return just the data array
      return result.data;
    }
  }

  @Get('menu-items/search')
  @ApiOperation({ summary: 'Search menu items' })
  @ApiQuery({ name: 'q', description: 'Search term' })
  @ApiResponse({ status: 200, description: 'Successfully searched menu items' })
  async searchMenuItems(
    @Query('q') searchTerm: string,
    @Query() query: MenuItemQueryDto,
  ): Promise<any> {
    return await this.menuItemService.searchMenuItems(searchTerm, query);
  }

  @Get('menu-items/menu/:menuId')
  @ApiOperation({ summary: 'Get menu items by menu' })
  @ApiParam({ name: 'menuId', description: 'Menu ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved menu items' })
  async getMenuItemsByMenu(
    @Param('menuId') menuId: string,
    @Query() query: MenuItemQueryDto,
  ): Promise<any> {
    const result = await this.menuItemService.getMenuItemsByMenu(menuId, query);
    
    // If pagination is requested, return paginated response
    if (query.page || query.limit) {
      return result;
    } else {
      // Otherwise, return just the data array
      return result.data;
    }
  }

  @Get('menu-items/:itemId/breadcrumb')
  @ApiOperation({ summary: 'Get breadcrumb for item' })
  @ApiParam({ name: 'itemId', description: 'Menu item ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved breadcrumb' })
  async getBreadcrumb(
    @Param('itemId') itemId: string,
  ): Promise<any> {
    return await this.menuItemService.getBreadcrumb(itemId);
  }

  @Get('menu-items/:id')
  @ApiOperation({ summary: 'Get menu item by ID' })
  @ApiParam({ name: 'id', description: 'Menu item ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved menu item' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async getMenuItemById(
    @Param('id') id: string,
  ): Promise<any> {
    return await this.menuItemService.getMenuItemById(id);
  }
} 