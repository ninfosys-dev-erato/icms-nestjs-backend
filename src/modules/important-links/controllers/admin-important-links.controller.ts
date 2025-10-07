import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';

import { ImportantLinksService } from '../services/important-links.service';
import {
  CreateImportantLinkDto,
  UpdateImportantLinkDto,
  ImportantLinkResponseDto,
  ImportantLinksQueryDto,
  BulkCreateImportantLinksDto,
  BulkUpdateImportantLinksDto,
  ReorderImportantLinksDto,
  ImportantLinksStatistics,
} from '../dto/important-links.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ApiResponseBuilder } from '../../../common/types/api-response';

@ApiTags('Admin Important Links')
@Controller('admin/important-links')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'EDITOR')
@ApiBearerAuth()
export class AdminImportantLinksController {
  constructor(private readonly importantLinksService: ImportantLinksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all important links (Admin)' })
  @ApiResponse({ status: 200, description: 'Important links retrieved successfully', type: [ImportantLinkResponseDto] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'lang', required: false, type: String })
  async getAllImportantLinks(
    @Res() response: Response,
    @Query() query: ImportantLinksQueryDto,
  ): Promise<void> {
    try {
      const result = await this.importantLinksService.getAllImportantLinks(query);
      const apiResponse = ApiResponseBuilder.success(result);
      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error('IMPORTANT_LINKS_RETRIEVAL_ERROR', error.message);
      response.status(500).json(apiResponse);
    }
  }

  @Get('pagination')
  @ApiOperation({ summary: 'Get important links with pagination (Admin)' })
  @ApiResponse({ status: 200, description: 'Important links retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async getImportantLinksWithPagination(
    @Res() response: Response,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('isActive') isActive?: string,
  ): Promise<void> {
    try {
      // Sanitize pagination parameters
      const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
      const limitNum = parseInt(limit) > 0 ? parseInt(limit) : 10;
      const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
      
      const result = await this.importantLinksService.getImportantLinksWithPagination(pageNum, limitNum, isActiveBool);
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);
      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error('IMPORTANT_LINKS_PAGINATION_ERROR', error.message);
      response.status(500).json(apiResponse);
    }
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get important links statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully', type: ImportantLinksStatistics })
  async getImportantLinksStatistics(
    @Res() response: Response
  ): Promise<void> {
    try {
      const result = await this.importantLinksService.getImportantLinksStatistics();
      const apiResponse = ApiResponseBuilder.success(result);
      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error('STATISTICS_RETRIEVAL_ERROR', error.message);
      response.status(500).json(apiResponse);
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Search important links (Admin)' })
  @ApiResponse({ status: 200, description: 'Search completed successfully' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'lang', required: false, type: String })
  async searchImportantLinks(
    @Res() response: Response,
    @Query('q') searchTerm: string,
    @Query() query: ImportantLinksQueryDto,
  ): Promise<void> {
    try {
      if (!searchTerm) {
        const apiResponse = ApiResponseBuilder.error('SEARCH_TERM_REQUIRED', 'Search term is required');
        response.status(400).json(apiResponse);
        return;
      }
      // TODO: Implement actual search functionality in service
      const result = await this.importantLinksService.getAllImportantLinks(query);
      const apiResponse = ApiResponseBuilder.success(result);
      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error('SEARCH_ERROR', error.message);
      response.status(500).json(apiResponse);
    }
  }

  @Get('export')
  @ApiOperation({ summary: 'Export all important links (Admin)' })
  @ApiResponse({ status: 200, description: 'Important links exported successfully' })
  async exportImportantLinks(
    @Res() response: Response
  ): Promise<void> {
    try {
      const result = await this.importantLinksService.exportImportantLinks();
      const apiResponse = ApiResponseBuilder.success(result);
      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error('EXPORT_ERROR', error.message);
      response.status(500).json(apiResponse);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get important link by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Important link retrieved successfully', type: ImportantLinkResponseDto })
  @ApiResponse({ status: 404, description: 'Important link not found' })
  @ApiParam({ name: 'id', description: 'Important Link ID' })
  async getImportantLinkById(
    @Res() response: Response,
    @Param('id') id: string,
  ): Promise<void> {
    try {
      const result = await this.importantLinksService.getImportantLink(id);
      const apiResponse = ApiResponseBuilder.success(result);
      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error('IMPORTANT_LINK_NOT_FOUND', error.message);
      response.status(status).json(apiResponse);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create important link (Admin)' })
  @ApiResponse({ status: 201, description: 'Important link created successfully', type: ImportantLinkResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async createImportantLink(
    @Res() response: Response,
    @Body() data: CreateImportantLinkDto,
    @CurrentUser() user?: any,
  ): Promise<void> {
    try {
      const result = await this.importantLinksService.createImportantLink(data);
      const apiResponse = ApiResponseBuilder.success(result);
      response.status(201).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error('LINK_CREATION_ERROR', error.message);
      response.status(400).json(apiResponse);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update important link (Admin)' })
  @ApiResponse({ status: 200, description: 'Important link updated successfully', type: ImportantLinkResponseDto })
  @ApiResponse({ status: 404, description: 'Important link not found' })
  @ApiParam({ name: 'id', description: 'Important Link ID' })
  async updateImportantLink(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() data: UpdateImportantLinkDto,
    @CurrentUser() user?: any,
  ): Promise<void> {
    try {
      const result = await this.importantLinksService.updateImportantLink(id, data);
      const apiResponse = ApiResponseBuilder.success(result);
      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 400;
      const apiResponse = ApiResponseBuilder.error('LINK_UPDATE_ERROR', error.message);
      response.status(status).json(apiResponse);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete important link (Admin)' })
  @ApiResponse({ status: 200, description: 'Important link deleted successfully' })
  @ApiResponse({ status: 404, description: 'Important link not found' })
  @ApiParam({ name: 'id', description: 'Important Link ID' })
  @Roles('ADMIN')
  async deleteImportantLink(
    @Res() response: Response,
    @Param('id') id: string,
  ): Promise<void> {
    try {
      await this.importantLinksService.deleteImportantLink(id);
      const apiResponse = ApiResponseBuilder.success({ message: 'Important link deleted successfully' });
      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error('LINK_DELETION_ERROR', error.message);
      response.status(status).json(apiResponse);
    }
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reorder important links (Admin)' })
  @ApiResponse({ status: 200, description: 'Important links reordered successfully' })
  async reorderImportantLinks(
    @Res() response: Response,
    @Body() data: ReorderImportantLinksDto,
  ): Promise<void> {
    try {
      await this.importantLinksService.reorderImportantLinks(data);
      const apiResponse = ApiResponseBuilder.success({ message: 'Important links reordered successfully' });
      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error('REORDER_ERROR', error.message);
      response.status(500).json(apiResponse);
    }
  }

  @Post('bulk-create')
  @ApiOperation({ summary: 'Bulk create important links (Admin)' })
  @ApiResponse({ status: 201, description: 'Important links created successfully' })
  async bulkCreateImportantLinks(
    @Res() response: Response,
    @Body() data: BulkCreateImportantLinksDto,
  ): Promise<void> {
    try {
      const result = await this.importantLinksService.bulkCreateImportantLinks(data);
      const apiResponse = ApiResponseBuilder.success(result);
      response.status(201).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error('BULK_CREATE_ERROR', error.message);
      response.status(400).json(apiResponse);
    }
  }

  @Put('bulk-update')
  @ApiOperation({ summary: 'Bulk update important links (Admin)' })
  @ApiResponse({ status: 200, description: 'Important links updated successfully' })
  async bulkUpdateImportantLinks(
    @Res() response: Response,
    @Body() data: BulkUpdateImportantLinksDto,
  ): Promise<void> {
    try {
      const result = await this.importantLinksService.bulkUpdateImportantLinks(data);
      const apiResponse = ApiResponseBuilder.success(result);
      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error('BULK_UPDATE_ERROR', error.message);
      response.status(400).json(apiResponse);
    }
  }

  @Post('import')
  @ApiOperation({ summary: 'Import important links (Admin)' })
  @ApiResponse({ status: 201, description: 'Important links imported successfully' })
  async importImportantLinks(
    @Res() response: Response,
    @Body() data: BulkCreateImportantLinksDto,
  ): Promise<void> {
    try {
      const result = await this.importantLinksService.importImportantLinks(data.links);
      const apiResponse = ApiResponseBuilder.success(result);
      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error('IMPORT_ERROR', error.message);
      response.status(400).json(apiResponse);
    }
  }
} 