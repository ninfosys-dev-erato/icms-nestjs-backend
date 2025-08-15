import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { ContentService } from '../services/content.service';
import { 
  CreateContentDto, 
  UpdateContentDto, 
  ContentQueryDto,
  ReorderDto 
} from '../dto/content-management.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ApiResponseBuilder } from '../../../common/types/api-response';

@ApiTags('Admin Content')
@Controller(['admin/content', 'admin/contents'])
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'EDITOR')
@ApiBearerAuth()
export class AdminContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  @ApiOperation({ summary: 'Get all content (Admin)' })
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

  @Get('statistics')
  @ApiOperation({ summary: 'Get content statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getContentStatistics(@Res() response: Response): Promise<void> {
    try {
      const statistics = await this.contentService.getContentStatistics();
      
      const apiResponse = ApiResponseBuilder.success(statistics);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'STATISTICS_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get content by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Content retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async getContentById(
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const content = await this.contentService.getContentById(id);
      
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

  @Post()
  @ApiOperation({ summary: 'Create content (Admin)' })
  @ApiResponse({ status: 201, description: 'Content created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createContent(
    @Body() data: CreateContentDto,
    @CurrentUser() user: any,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const content = await this.contentService.createContent(data, user.id);
      
      const apiResponse = ApiResponseBuilder.success(content);

      response.status(201).json(apiResponse);
    } catch (error) {
      const status = error.status || 500;
      const apiResponse = ApiResponseBuilder.error(
        'CONTENT_CREATION_ERROR',
        error.message,
        error.response?.errors || []
      );

      response.status(status).json(apiResponse);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update content (Admin)' })
  @ApiResponse({ status: 200, description: 'Content updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async updateContent(
    @Param('id') id: string,
    @Body() data: UpdateContentDto,
    @CurrentUser() user: any,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const content = await this.contentService.updateContent(id, data, user.id);
      
      const apiResponse = ApiResponseBuilder.success(content);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.status || 500;
      const apiResponse = ApiResponseBuilder.error(
        'CONTENT_UPDATE_ERROR',
        error.message,
        error.response?.errors || []
      );

      response.status(status).json(apiResponse);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete content (Admin)' })
  @ApiResponse({ status: 200, description: 'Content deleted successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async deleteContent(
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<void> {
    try {
      await this.contentService.deleteContent(id);
      
      const apiResponse = ApiResponseBuilder.success(null);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'CONTENT_DELETE_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish content (Admin)' })
  @ApiResponse({ status: 200, description: 'Content published successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async publishContent(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const content = await this.contentService.publishContent(id, user.id);
      
      const apiResponse = ApiResponseBuilder.success(content);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'CONTENT_PUBLISH_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }


} 