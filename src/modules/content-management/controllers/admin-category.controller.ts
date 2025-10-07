import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

import { CategoryService } from '../services/category.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryResponseDto,
  CategoryStatistics,
  ReorderDto,
} from '../dto/content-management.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('Admin Categories')
@Controller('admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'EDITOR')
@ApiBearerAuth()
export class AdminCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories (admin)' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully', type: [CategoryResponseDto] })
  async getAllCategories() {
    return await this.categoryService.getAllCategories();
  }

  @Get('available-parents')
  @ApiOperation({ summary: 'Get available parent categories for selection' })
  @ApiResponse({ status: 200, description: 'Available parent categories retrieved successfully', type: [CategoryResponseDto] })
  async getAvailableParentCategories() {
    // Get all active categories that can be used as parents
    return await this.categoryService.getAvailableParentCategories();
  }

  @Get('available-parents/:categoryId')
  @ApiOperation({ summary: 'Get available parent categories for a specific category (excludes self)' })
  @ApiParam({ name: 'categoryId', description: 'Category ID to exclude from parent options' })
  @ApiResponse({ status: 200, description: 'Available parent categories retrieved successfully', type: [CategoryResponseDto] })
  async getAvailableParentCategoriesForCategory(@Param('categoryId') categoryId: string) {
    // Get all active categories that can be used as parents, excluding the current category
    return await this.categoryService.getAvailableParentCategories(categoryId);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get category statistics' })
  @ApiResponse({ status: 200, description: 'Category statistics', type: CategoryStatistics })
  async getCategoryStatistics() {
    return await this.categoryService.getCategoryStatistics();
  }

  @Post()
  @ApiOperation({ summary: 'Create category' })
  @ApiResponse({ status: 201, description: 'Category created', type: CategoryResponseDto })
  async createCategory(@Body() data: CreateCategoryDto) {
    // Clean up the data before creating
    const cleanData = { ...data };
    
    // Handle parentId for root categories
    if (cleanData.parentId === '' || cleanData.parentId === null || cleanData.parentId === undefined) {
      // Remove parentId to create a root category
      delete cleanData.parentId;
    } else if (cleanData.parentId && cleanData.parentId.trim() === '') {
      // If parentId is just whitespace, remove it
      delete cleanData.parentId;
    } else if (cleanData.parentId === 'root' || cleanData.parentId === 'none') {
      // Handle special values that indicate root category
      delete cleanData.parentId;
    }
    
    // If parentId is provided, validate it's not a special value
    if (cleanData.parentId && (cleanData.parentId === 'root' || cleanData.parentId === 'none' || cleanData.parentId === '')) {
      throw new BadRequestException('Invalid parent ID. Use null, undefined, or omit the field to create a root category.');
    }

    return await this.categoryService.createCategory(cleanData);
  }

  @Put('reorder')
  @ApiOperation({ summary: 'Reorder categories' })
  @ApiResponse({ status: 200, description: 'Categories reordered' })
  async reorderCategories(@Body() data: ReorderDto) {
    await this.categoryService.reorderCategories(data.orders);
    return { message: 'Categories reordered successfully' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID (admin)' })
  @ApiResponse({ status: 200, description: 'Category details', type: CategoryResponseDto })
  async getCategoryById(@Param('id') id: string) {
    return await this.categoryService.getCategoryById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({ status: 200, description: 'Category updated', type: CategoryResponseDto })
  async updateCategory(@Param('id') id: string, @Body() data: UpdateCategoryDto) {
    // Clean up the data before updating
    const cleanData = { ...data };
    
    // Handle parentId for root categories
    if (cleanData.parentId === '' || cleanData.parentId === null || cleanData.parentId === undefined) {
      // Remove parentId to make it a root category
      delete cleanData.parentId;
    } else if (cleanData.parentId && cleanData.parentId.trim() === '') {
      // If parentId is just whitespace, remove it
      delete cleanData.parentId;
    } else if (cleanData.parentId === 'root' || cleanData.parentId === 'none') {
      // Handle special values that indicate root category
      delete cleanData.parentId;
    }
    
    // If parentId is provided, validate it's not a special value
    if (cleanData.parentId && (cleanData.parentId === 'root' || cleanData.parentId === 'none' || cleanData.parentId === '')) {
      throw new BadRequestException('Invalid parent ID. Use null, undefined, or omit the field to make this a root category.');
    }

    return await this.categoryService.updateCategory(id, cleanData);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 200, description: 'Category deleted' })
  async deleteCategory(@Param('id') id: string) {
    await this.categoryService.deleteCategory(id);
    return { message: 'Category deleted successfully' };
  }
} 