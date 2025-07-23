import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

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
import { ApiResponseBuilder } from '@/common/types/api-response';

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
  async getAllCategories(
    @Res() response: Response,
  ): Promise<void> {
    const categories = await this.categoryService.getAllCategories();

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success(categories),
    );
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get category statistics' })
  @ApiResponse({ status: 200, description: 'Category statistics', type: CategoryStatistics })
  async getCategoryStatistics(
    @Res() response: Response,
  ): Promise<void> {
    const statistics = await this.categoryService.getCategoryStatistics();

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success(statistics),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create category' })
  @ApiResponse({ status: 201, description: 'Category created', type: CategoryResponseDto })
  async createCategory(
    @Res() response: Response,
    @Body() data: CreateCategoryDto,
  ): Promise<void> {
    const category = await this.categoryService.createCategory(data);

    response.status(HttpStatus.CREATED).json(
      ApiResponseBuilder.success(category),
    );
  }

  @Put('reorder')
  @ApiOperation({ summary: 'Reorder categories' })
  @ApiResponse({ status: 200, description: 'Categories reordered' })
  async reorderCategories(
    @Res() response: Response,
    @Body() data: ReorderDto,
  ): Promise<void> {
    await this.categoryService.reorderCategories(data.orders);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success({ message: 'Categories reordered successfully' }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID (admin)' })
  @ApiResponse({ status: 200, description: 'Category details', type: CategoryResponseDto })
  async getCategoryById(
    @Res() response: Response,
    @Param('id') id: string,
  ): Promise<void> {
    const category = await this.categoryService.getCategoryById(id);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success(category),
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({ status: 200, description: 'Category updated', type: CategoryResponseDto })
  async updateCategory(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() data: UpdateCategoryDto,
  ): Promise<void> {
    const category = await this.categoryService.updateCategory(id, data);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success(category),
    );
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 200, description: 'Category deleted' })
  async deleteCategory(
    @Res() response: Response,
    @Param('id') id: string,
  ): Promise<void> {
    await this.categoryService.deleteCategory(id);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success({ message: 'Category deleted successfully' }),
    );
  }
} 