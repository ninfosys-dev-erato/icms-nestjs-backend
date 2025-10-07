import {
  Controller,
  Get,
  Param,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { CategoryService } from '../services/category.service';
import { CategoryResponseDto } from '../dto/content-management.dto';
import { ApiResponseBuilder } from '@/common/types/api-response';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'All categories', type: [CategoryResponseDto] })
  async getAllCategories(
    @Res() response: Response,
  ): Promise<void> {
    const categories = await this.categoryService.getAllCategories();

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success(categories),
    );
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get category tree structure' })
  @ApiResponse({ status: 200, description: 'Category tree', type: [CategoryResponseDto] })
  async getCategoryTree(
    @Res() response: Response,
  ): Promise<void> {
    const categories = await this.categoryService.getCategoryTree();

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success(categories),
    );
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active categories' })
  @ApiResponse({ status: 200, description: 'Active categories', type: [CategoryResponseDto] })
  async getActiveCategories(
    @Res() response: Response,
  ): Promise<void> {
    const categories = await this.categoryService.getActiveCategories();

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success(categories),
    );
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiResponse({ status: 200, description: 'Category details', type: CategoryResponseDto })
  async getCategoryBySlug(
    @Res() response: Response,
    @Param('slug') slug: string,
  ): Promise<void> {
    const category = await this.categoryService.getCategoryBySlug(slug);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success(category),
    );
  }
} 