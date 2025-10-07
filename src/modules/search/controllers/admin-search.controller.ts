import { Controller, Get, Post, Put, Delete, Body, Query, Param, Res, UploadedFile, UseInterceptors, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiConsumes,
  ApiBody
} from '@nestjs/swagger';
import { SearchService } from '../services/search.service';
import { SearchIndexService } from '../services/search-index.service';
import { SearchSuggestionService } from '../services/search-suggestion.service';
import {
  SearchExportQueryDto,
  CreateSearchIndexDto,
  UpdateSearchIndexDto,
  SearchIndexQueryDto,
  CreateSearchSuggestionDto,
  UpdateSearchSuggestionDto,
  SearchSuggestionQueryDto,
  ContentType
} from '../dto/search.dto';
import { ApiResponseBuilder } from '../../../common/types/api-response';

@ApiTags('Admin Search')
@Controller('admin/search')
export class AdminSearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly searchIndexService: SearchIndexService,
    private readonly searchSuggestionService: SearchSuggestionService,
  ) {}

  @Get('analytics')
  @ApiOperation({ summary: 'Get search analytics' })
  @ApiResponse({ status: 200, description: 'Search analytics retrieved successfully' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getSearchAnalytics(
    @Query('days') days: number = 7,
    @Res() response: Response
  ): Promise<void> {
    try {
      const analytics = await this.searchService.getSearchAnalytics(days);
      
      const apiResponse = ApiResponseBuilder.success(analytics);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'ANALYTICS_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get search statistics' })
  @ApiResponse({ status: 200, description: 'Search statistics retrieved successfully' })
  async getSearchStatistics(
    @Res() response: Response
  ): Promise<void> {
    try {
      const statistics = await this.searchService.getSearchStatistics();
      
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

  @Post('reindex/:contentId/:contentType')
  @ApiOperation({ summary: 'Reindex content' })
  @ApiResponse({ status: 200, description: 'Content reindexed successfully' })
  @ApiParam({ name: 'contentId', type: String })
  @ApiParam({ name: 'contentType', enum: ContentType })
  async reindexContent(
    @Param('contentId') contentId: string,
    @Param('contentType') contentType: ContentType,
    @Res() response: Response
  ): Promise<void> {
    try {
      await this.searchService.reindexContent(contentId, contentType);
      
      const apiResponse = ApiResponseBuilder.success({
        message: 'Content reindexed successfully',
        contentId,
        contentType
      });

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'REINDEX_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Post('bulk-reindex')
  @ApiOperation({ summary: 'Bulk reindex' })
  @ApiResponse({ status: 200, description: 'Bulk reindex completed successfully' })
  @ApiQuery({ name: 'contentType', required: false, enum: ContentType })
  async bulkReindex(
    @Query('contentType') contentType?: ContentType
  ): Promise<any> {
    try {
      const result = await this.searchService.bulkReindex(contentType);
      return ApiResponseBuilder.success(result);
    } catch (error) {
      throw new HttpException(
        ApiResponseBuilder.error('BULK_REINDEX_ERROR', error.message),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('optimize')
  @ApiOperation({ summary: 'Optimize search index' })
  @ApiResponse({ status: 200, description: 'Search index optimized successfully' })
  async optimizeIndex(
    @Res() response: Response
  ): Promise<void> {
    try {
      await this.searchService.optimizeIndex();
      
      const apiResponse = ApiResponseBuilder.success({
        message: 'Search index optimized successfully'
      });

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'OPTIMIZE_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Delete('cache')
  @ApiOperation({ summary: 'Clear search cache' })
  @ApiResponse({ status: 200, description: 'Search cache cleared successfully' })
  async clearSearchCache(
    @Res() response: Response
  ): Promise<void> {
    try {
      await this.searchService.clearSearchCache();
      
      const apiResponse = ApiResponseBuilder.success({
        message: 'Search cache cleared successfully'
      });

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'CACHE_CLEAR_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('export')
  @ApiOperation({ summary: 'Export search data' })
  @ApiResponse({ status: 200, description: 'Search data exported successfully' })
  @ApiQuery({ name: 'format', enum: ['json', 'csv', 'xlsx'] })
  async exportSearchData(
    @Query() query: SearchExportQueryDto,
    @Query('format') format: 'json' | 'csv' | 'xlsx' = 'json',
    @Res() response: Response
  ): Promise<void> {
    try {
      const data = await this.searchService.exportSearchData(query, format);
      
      const filename = `search-data-${new Date().toISOString().split('T')[0]}.${format}`;
      
      response.setHeader('Content-Type', this.getContentType(format));
      response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      response.status(200).send(data);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'EXPORT_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  // Search Index Management

  @Get('search-indices/:id')
  @ApiOperation({ summary: 'Get index by ID (admin)' })
  @ApiResponse({ status: 200, description: 'Index retrieved successfully' })
  @ApiParam({ name: 'id', type: String })
  async getIndexById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void> {
    try {
      const index = await this.searchIndexService.getIndexById(id);
      
      const apiResponse = ApiResponseBuilder.success(index);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'INDEX_NOT_FOUND',
        error.message
      );

      response.status(404).json(apiResponse);
    }
  }

  @Post('search-indices')
  @ApiOperation({ summary: 'Create index' })
  @ApiResponse({ status: 201, description: 'Index created successfully' })
  async createIndex(
    @Body() data: CreateSearchIndexDto,
    @Res() response: Response
  ): Promise<void> {
    try {
      const index = await this.searchIndexService.createIndex(data);
      
      const apiResponse = ApiResponseBuilder.success(index);

      response.status(201).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'INDEX_CREATE_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }

  @Put('search-indices/:id')
  @ApiOperation({ summary: 'Update index' })
  @ApiResponse({ status: 200, description: 'Index updated successfully' })
  @ApiParam({ name: 'id', type: String })
  async updateIndex(
    @Param('id') id: string,
    @Body() data: UpdateSearchIndexDto,
    @Res() response: Response
  ): Promise<void> {
    try {
      const index = await this.searchIndexService.updateIndex(id, data);
      
      const apiResponse = ApiResponseBuilder.success(index);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'INDEX_UPDATE_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }

  @Delete('search-indices/:id')
  @ApiOperation({ summary: 'Delete index' })
  @ApiResponse({ status: 200, description: 'Index deleted successfully' })
  @ApiParam({ name: 'id', type: String })
  async deleteIndex(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void> {
    try {
      await this.searchIndexService.deleteIndex(id);
      
      const apiResponse = ApiResponseBuilder.success({
        message: 'Index deleted successfully'
      });

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'INDEX_DELETE_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('search-indices/statistics')
  @ApiOperation({ summary: 'Get index statistics' })
  @ApiResponse({ status: 200, description: 'Index statistics retrieved successfully' })
  async getIndexStatistics(
    @Res() response: Response
  ): Promise<void> {
    try {
      const statistics = await this.searchIndexService.getIndexStatistics();
      
      const apiResponse = ApiResponseBuilder.success(statistics);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'INDEX_STATISTICS_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('search-indices/export')
  @ApiOperation({ summary: 'Export indices' })
  @ApiResponse({ status: 200, description: 'Indices exported successfully' })
  @ApiQuery({ name: 'format', enum: ['json', 'csv', 'xlsx'] })
  async exportIndices(
    @Query() query: SearchIndexQueryDto,
    @Query('format') format: 'json' | 'csv' | 'xlsx' = 'json',
    @Res() response: Response
  ): Promise<void> {
    try {
      const data = await this.searchIndexService.exportIndices(query, format);
      
      const filename = `search-indices-${new Date().toISOString().split('T')[0]}.${format}`;
      
      response.setHeader('Content-Type', this.getContentType(format));
      response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      response.status(200).send(data);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'INDEX_EXPORT_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Post('search-indices/import')
  @ApiOperation({ summary: 'Import indices' })
  @ApiResponse({ status: 200, description: 'Indices imported successfully' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async importIndices(
    @UploadedFile() file: Express.Multer.File,
    @Res() response: Response
  ): Promise<void> {
    try {
      const result = await this.searchIndexService.importIndices(file);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'INDEX_IMPORT_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }

  // Search Suggestion Management

  @Get('search-suggestions/:id')
  @ApiOperation({ summary: 'Get suggestion by ID (admin)' })
  @ApiResponse({ status: 200, description: 'Suggestion retrieved successfully' })
  @ApiParam({ name: 'id', type: String })
  async getSuggestionById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void> {
    try {
      const suggestion = await this.searchSuggestionService.getSuggestionById(id);
      
      const apiResponse = ApiResponseBuilder.success(suggestion);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'SUGGESTION_NOT_FOUND',
        error.message
      );

      response.status(404).json(apiResponse);
    }
  }

  @Post('search-suggestions')
  @ApiOperation({ summary: 'Create suggestion' })
  @ApiResponse({ status: 201, description: 'Suggestion created successfully' })
  async createSuggestion(
    @Body() data: CreateSearchSuggestionDto,
    @Res() response: Response
  ): Promise<void> {
    try {
      const suggestion = await this.searchSuggestionService.createSuggestion(data);
      
      const apiResponse = ApiResponseBuilder.success(suggestion);

      response.status(201).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'SUGGESTION_CREATE_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }

  @Put('search-suggestions/:id')
  @ApiOperation({ summary: 'Update suggestion' })
  @ApiResponse({ status: 200, description: 'Suggestion updated successfully' })
  @ApiParam({ name: 'id', type: String })
  async updateSuggestion(
    @Param('id') id: string,
    @Body() data: UpdateSearchSuggestionDto,
    @Res() response: Response
  ): Promise<void> {
    try {
      const suggestion = await this.searchSuggestionService.updateSuggestion(id, data);
      
      const apiResponse = ApiResponseBuilder.success(suggestion);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'SUGGESTION_UPDATE_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }

  @Delete('search-suggestions/:id')
  @ApiOperation({ summary: 'Delete suggestion' })
  @ApiResponse({ status: 200, description: 'Suggestion deleted successfully' })
  @ApiParam({ name: 'id', type: String })
  async deleteSuggestion(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void> {
    try {
      await this.searchSuggestionService.deleteSuggestion(id);
      
      const apiResponse = ApiResponseBuilder.success({
        message: 'Suggestion deleted successfully'
      });

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'SUGGESTION_DELETE_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('search-suggestions/statistics')
  @ApiOperation({ summary: 'Get suggestion statistics' })
  @ApiResponse({ status: 200, description: 'Suggestion statistics retrieved successfully' })
  async getSuggestionStatistics(
    @Res() response: Response
  ): Promise<void> {
    try {
      const statistics = await this.searchSuggestionService.getSuggestionStatistics();
      
      const apiResponse = ApiResponseBuilder.success(statistics);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'SUGGESTION_STATISTICS_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('search-suggestions/export')
  @ApiOperation({ summary: 'Export suggestions' })
  @ApiResponse({ status: 200, description: 'Suggestions exported successfully' })
  @ApiQuery({ name: 'format', enum: ['json', 'csv', 'xlsx'] })
  async exportSuggestions(
    @Query() query: SearchSuggestionQueryDto,
    @Query('format') format: 'json' | 'csv' | 'xlsx' = 'json',
    @Res() response: Response
  ): Promise<void> {
    try {
      const data = await this.searchSuggestionService.exportSuggestions(query, format);
      
      const filename = `search-suggestions-${new Date().toISOString().split('T')[0]}.${format}`;
      
      response.setHeader('Content-Type', this.getContentType(format));
      response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      response.status(200).send(data);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'SUGGESTION_EXPORT_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Post('search-suggestions/import')
  @ApiOperation({ summary: 'Import suggestions' })
  @ApiResponse({ status: 200, description: 'Suggestions imported successfully' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async importSuggestions(
    @UploadedFile() file: Express.Multer.File,
    @Res() response: Response
  ): Promise<void> {
    try {
      const result = await this.searchSuggestionService.importSuggestions(file);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'SUGGESTION_IMPORT_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }

  private getContentType(format: string): string {
    switch (format) {
      case 'json':
        return 'application/json';
      case 'csv':
        return 'text/csv';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return 'application/octet-stream';
    }
  }
} 