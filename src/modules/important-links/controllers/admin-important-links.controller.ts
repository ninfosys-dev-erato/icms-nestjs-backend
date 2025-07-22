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
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

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
import { ApiResponseBuilder } from '@/common/types/api-response';

@ApiTags('Admin Important Links')
@Controller('api/v1/admin/important-links')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'EDITOR')
@ApiBearerAuth()
export class AdminImportantLinksController {
  constructor(private readonly importantLinksService: ImportantLinksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all important links (Admin)' })
  @ApiResponse({ status: 200, description: 'Important links retrieved successfully', type: [ImportantLinkResponseDto] })
  async getAllImportantLinks(
    @Res() response: Response,
    @Query() query: ImportantLinksQueryDto,
  ): Promise<void> {
    try {
      const links = await this.importantLinksService.getAllImportantLinks(query);
      
      const apiResponse = ApiResponseBuilder.success(links);

      response.status(HttpStatus.OK).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'IMPORTANT_LINKS_RETRIEVAL_ERROR',
        error.message
      );

      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiResponse);
    }
  }

  @Get('paginated')
  @ApiOperation({ summary: 'Get important links with pagination (Admin)' })
  @ApiResponse({ status: 200, description: 'Important links retrieved successfully' })
  async getImportantLinksWithPagination(
    @Res() response: Response,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('isActive') isActive?: boolean,
  ): Promise<void> {
    try {
      const result = await this.importantLinksService.getImportantLinksWithPagination(page, limit, isActive);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(HttpStatus.OK).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'IMPORTANT_LINKS_PAGINATION_ERROR',
        error.message
      );

      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiResponse);
    }
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get important links statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully', type: ImportantLinksStatistics })
  async getImportantLinksStatistics(@Res() response: Response): Promise<void> {
    try {
      const statistics = await this.importantLinksService.getImportantLinksStatistics();
      
      const apiResponse = ApiResponseBuilder.success(statistics);

      response.status(HttpStatus.OK).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'STATISTICS_ERROR',
        error.message
      );

      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiResponse);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get important link by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Important link retrieved successfully', type: ImportantLinkResponseDto })
  @ApiResponse({ status: 404, description: 'Important link not found' })
  async getImportantLinkById(
    @Res() response: Response,
    @Param('id') id: string,
  ): Promise<void> {
    try {
      const link = await this.importantLinksService.getImportantLink(id);
      
      const apiResponse = ApiResponseBuilder.success(link);

      response.status(HttpStatus.OK).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;
      const apiResponse = ApiResponseBuilder.error(
        'IMPORTANT_LINK_NOT_FOUND',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create important link (Admin)' })
  @ApiResponse({ status: 201, description: 'Important link created successfully', type: ImportantLinkResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createImportantLink(
    @Res() response: Response,
    @Body() data: CreateImportantLinkDto,
  ): Promise<void> {
    try {
      const link = await this.importantLinksService.createImportantLink(data);
      
      const apiResponse = ApiResponseBuilder.success(link);

      response.status(HttpStatus.CREATED).json(apiResponse);
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const apiResponse = ApiResponseBuilder.error(
        'IMPORTANT_LINK_CREATION_ERROR',
        error.message,
        error.response?.errors || []
      );

      response.status(status).json(apiResponse);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update important link (Admin)' })
  @ApiResponse({ status: 200, description: 'Important link updated successfully', type: ImportantLinkResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Important link not found' })
  async updateImportantLink(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() data: UpdateImportantLinkDto,
  ): Promise<void> {
    try {
      const link = await this.importantLinksService.updateImportantLink(id, data);
      
      const apiResponse = ApiResponseBuilder.success(link);

      response.status(HttpStatus.OK).json(apiResponse);
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const apiResponse = ApiResponseBuilder.error(
        'IMPORTANT_LINK_UPDATE_ERROR',
        error.message,
        error.response?.errors || []
      );

      response.status(status).json(apiResponse);
    }
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete important link (Admin)' })
  @ApiResponse({ status: 200, description: 'Important link deleted successfully' })
  @ApiResponse({ status: 404, description: 'Important link not found' })
  async deleteImportantLink(
    @Res() response: Response,
    @Param('id') id: string,
  ): Promise<void> {
    try {
      await this.importantLinksService.deleteImportantLink(id);
      
      const apiResponse = ApiResponseBuilder.success({ message: 'Important link deleted successfully' });

      response.status(HttpStatus.OK).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;
      const apiResponse = ApiResponseBuilder.error(
        'IMPORTANT_LINK_DELETE_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Put('reorder')
  @ApiOperation({ summary: 'Reorder important links (Admin)' })
  @ApiResponse({ status: 200, description: 'Important links reordered successfully' })
  async reorderImportantLinks(
    @Res() response: Response,
    @Body() data: ReorderImportantLinksDto,
  ): Promise<void> {
    try {
      await this.importantLinksService.reorderImportantLinks(data);
      
      const apiResponse = ApiResponseBuilder.success({ message: 'Important links reordered successfully' });

      response.status(HttpStatus.OK).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'REORDER_ERROR',
        error.message
      );

      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiResponse);
    }
  }

  @Post('bulk-create')
  @ApiOperation({ summary: 'Bulk create important links (Admin)' })
  @ApiResponse({ status: 201, description: 'Important links created successfully', type: [ImportantLinkResponseDto] })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async bulkCreateImportantLinks(
    @Res() response: Response,
    @Body() data: BulkCreateImportantLinksDto,
  ): Promise<void> {
    try {
      const links = await this.importantLinksService.bulkCreateImportantLinks(data);
      
      const apiResponse = ApiResponseBuilder.success(links);

      response.status(HttpStatus.CREATED).json(apiResponse);
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const apiResponse = ApiResponseBuilder.error(
        'BULK_CREATION_ERROR',
        error.message,
        error.response?.errors || []
      );

      response.status(status).json(apiResponse);
    }
  }

  @Put('bulk-update')
  @ApiOperation({ summary: 'Bulk update important links (Admin)' })
  @ApiResponse({ status: 200, description: 'Important links updated successfully', type: [ImportantLinkResponseDto] })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async bulkUpdateImportantLinks(
    @Res() response: Response,
    @Body() data: BulkUpdateImportantLinksDto,
  ): Promise<void> {
    try {
      const links = await this.importantLinksService.bulkUpdateImportantLinks(data);
      
      const apiResponse = ApiResponseBuilder.success(links);

      response.status(HttpStatus.OK).json(apiResponse);
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const apiResponse = ApiResponseBuilder.error(
        'BULK_UPDATE_ERROR',
        error.message,
        error.response?.errors || []
      );

      response.status(status).json(apiResponse);
    }
  }

  @Post('import')
  @ApiOperation({ summary: 'Import important links (Admin)' })
  @ApiResponse({ status: 200, description: 'Import completed successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async importImportantLinks(
    @Res() response: Response,
    @Body() data: BulkCreateImportantLinksDto,
  ): Promise<void> {
    try {
      const result = await this.importantLinksService.importImportantLinks(data.links);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(HttpStatus.OK).json(apiResponse);
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const apiResponse = ApiResponseBuilder.error(
        'IMPORT_ERROR',
        error.message,
        error.response?.errors || []
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get('export')
  @ApiOperation({ summary: 'Export important links (Admin)' })
  @ApiResponse({ status: 200, description: 'Export completed successfully' })
  async exportImportantLinks(@Res() response: Response): Promise<void> {
    try {
      const result = await this.importantLinksService.exportImportantLinks();
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(HttpStatus.OK).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'EXPORT_ERROR',
        error.message
      );

      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiResponse);
    }
  }
} 