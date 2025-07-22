import {
  Controller,
  Get,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { ContentService } from '../services/content.service';
import { ContentQueryDto } from '../dto/content-management.dto';
import { ApiResponseBuilder } from '../../../common/types/api-response';

@ApiTags('Content')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  @ApiOperation({ summary: 'Get all published content (Public)' })
  @ApiResponse({ status: 200, description: 'Content retrieved successfully' })
  async getAllContent(
    @Query() query: ContentQueryDto,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const result = await this.contentService.getAllContent(query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'CONTENT_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured content (Public)' })
  @ApiResponse({ status: 200, description: 'Featured content retrieved successfully' })
  async getFeaturedContent(@Res() response: Response): Promise<void> {
    try {
      const content = await this.contentService.getFeaturedContent();
      
      const apiResponse = ApiResponseBuilder.success(content);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'FEATURED_CONTENT_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Search content (Public)' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  async searchContent(
    @Query() query: ContentQueryDto,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const result = await this.contentService.searchContent(query.search || '', query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'CONTENT_SEARCH_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get content by slug (Public)' })
  @ApiResponse({ status: 200, description: 'Content retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async getContentBySlug(
    @Param('slug') slug: string,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const content = await this.contentService.getContentBySlug(slug);
      
      const apiResponse = ApiResponseBuilder.success(content);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'CONTENT_NOT_FOUND',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get('category/:categorySlug')
  @ApiOperation({ summary: 'Get content by category slug (Public)' })
  @ApiResponse({ status: 200, description: 'Category content retrieved successfully' })
  async getContentByCategory(
    @Param('categorySlug') categorySlug: string,
    @Query() query: ContentQueryDto,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const result = await this.contentService.getContentByCategory(categorySlug, query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'CATEGORY_CONTENT_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }
} 