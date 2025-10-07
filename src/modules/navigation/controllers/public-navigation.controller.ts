import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MenuService } from '../services/menu.service';
import { MenuItemService } from '../services/menu-item.service';
import { ContentService } from '../../content-management/services/content.service';
import { CategoryService } from '../../content-management/services/category.service';
import { MenuQueryDto, MenuLocation } from '../dto/menu.dto';
import { MenuItemQueryDto } from '../dto/menu-item.dto';

@ApiTags('Public Navigation')
@Controller('')
export class PublicNavigationController {
  constructor(
    private readonly menuService: MenuService,
    private readonly menuItemService: MenuItemService,
    private readonly contentService: ContentService,
    private readonly categoryService: CategoryService,
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

  // Content and Category endpoints for frontend content loading
  @Get('content/category/:slug')
  @ApiOperation({ summary: 'Get category by slug with its content' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false })
  @ApiResponse({ status: 200, description: 'Successfully retrieved category and content' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async getCategoryWithContent(
    @Param('slug') slug: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<any> {
    try {
      // Get category information
      const category = await this.categoryService.getCategoryBySlug(slug);
      
      // Get published content for this category
      const contentResult = await this.contentService.getPublishedContentByCategory(
        slug, 
        { page, limit }
      );
      
      return {
        success: true,
        data: {
          category,
          content: contentResult.data,
          pagination: contentResult.pagination
        }
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('content/:slug')
  @ApiOperation({ summary: 'Get content by slug' })
  @ApiParam({ name: 'slug', description: 'Content slug' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved content' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async getContentBySlug(
    @Param('slug') slug: string,
  ): Promise<any> {
    try {
      const content = await this.contentService.getPublishedContentBySlug(slug);
      
      return {
        success: true,
        data: content
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('content/:categorySlug/:contentSlug')
  @ApiOperation({ summary: 'Get content by category and content slugs' })
  @ApiParam({ name: 'categorySlug', description: 'Category slug' })
  @ApiParam({ name: 'contentSlug', description: 'Content slug' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved content' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async getContentByCategoryAndSlug(
    @Param('categorySlug') categorySlug: string,
    @Param('contentSlug') contentSlug: string,
  ): Promise<any> {
    try {
      // First verify the category exists
      const category = await this.categoryService.getCategoryBySlug(categorySlug);
      
      // Then get the content
      const content = await this.contentService.getPublishedContentBySlug(contentSlug);
      
      // Verify content belongs to the specified category
      if (content.category?.slug !== categorySlug) {
        throw new Error('Content does not belong to the specified category');
      }
      
      return {
        success: true,
        data: {
          category,
          content
        }
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all active categories' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved categories' })
  async getAllCategories(): Promise<any> {
    try {
      const categories = await this.categoryService.getActiveCategories();
      
      return {
        success: true,
        data: categories
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('categories/:slug')
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved category' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async getCategoryBySlugOnly(
    @Param('slug') slug: string,
  ): Promise<any> {
    try {
      const category = await this.categoryService.getCategoryBySlug(slug);
      
      return {
        success: true,
        data: category
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('content/search')
  @ApiOperation({ summary: 'Search content across all categories' })
  @ApiQuery({ name: 'q', description: 'Search query', required: true })
  @ApiQuery({ name: 'page', description: 'Page number', required: false })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false })
  @ApiQuery({ name: 'categorySlug', description: 'Filter by category slug', required: false })
  @ApiResponse({ status: 200, description: 'Successfully searched content' })
  async searchContent(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('categorySlug') categorySlug?: string,
  ): Promise<any> {
    try {
      let searchResult;
      
      if (categorySlug) {
        // Search within a specific category
        const category = await this.categoryService.getCategoryBySlug(categorySlug);
        searchResult = await this.contentService.searchContent(query, { 
          page, 
          limit,
          category: category.id 
        });
      } else {
        // Search across all categories
        searchResult = await this.contentService.searchContent(query, { page, limit });
      }
      
      return {
        success: true,
        data: searchResult.data,
        pagination: searchResult.pagination
      };
    } catch (error) {
      throw error;
    }
  }
} 