import { Controller, Get, Post, Body, Query, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery
} from '@nestjs/swagger';
import { SearchService } from '../services/search.service';
import {
  SearchQueryDto,
  AdvancedSearchQueryDto,
  SearchResponseDto,
  SearchQueryHistoryQueryDto,
  PopularQuery
} from '../dto/search.dto';
import { ApiResponseBuilder } from '../../../common/types/api-response';

@ApiTags('Public Search')
@Controller('search')
export class PublicSearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search content' })
  @ApiResponse({ status: 200, description: 'Search completed successfully' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'language', required: false, type: String })
  @ApiQuery({ name: 'contentType', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String })
  async search(
    @Query() query: SearchQueryDto,
    @Res() response: Response
  ): Promise<void> {
    try {
      const result = await this.searchService.search(query);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'SEARCH_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Post('advanced')
  @ApiOperation({ summary: 'Advanced search' })
  @ApiResponse({ status: 200, description: 'Advanced search completed successfully' })
  async advancedSearch(
    @Body() query: AdvancedSearchQueryDto,
    @Res() response: Response
  ): Promise<void> {
    try {
      const result = await this.searchService.advancedSearch(query);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'ADVANCED_SEARCH_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions' })
  @ApiResponse({ status: 200, description: 'Suggestions retrieved successfully' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'language', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getSearchSuggestions(
    @Query('q') prefix: string,
    @Query('language') language: string = 'en',
    @Query('limit') limit: number = 10,
    @Res() response: Response
  ): Promise<void> {
    try {
      const suggestions = await this.searchService.getSearchSuggestions(prefix, language, limit);
      
      const apiResponse = ApiResponseBuilder.success(suggestions);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'SUGGESTIONS_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular searches' })
  @ApiResponse({ status: 200, description: 'Popular searches retrieved successfully' })
  @ApiQuery({ name: 'language', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPopularSearches(
    @Query('language') language: string = 'en',
    @Query('limit') limit: number = 10,
    @Res() response: Response
  ): Promise<void> {
    try {
      const popularSearches = await this.searchService.getPopularSearches(language, limit);
      
      const apiResponse = ApiResponseBuilder.success(popularSearches);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'POPULAR_SEARCHES_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('history')
  @ApiOperation({ summary: 'Get search history' })
  @ApiResponse({ status: 200, description: 'Search history retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  async getSearchHistory(
    @Query() query: SearchQueryHistoryQueryDto,
    @Req() request: Request,
    @Res() response: Response
  ): Promise<void> {
    try {
      // This would typically get the user ID from the authenticated request
      // For now, we'll return a mock response
      const mockHistory = {
        data: [],
        pagination: {
          page: query.page || 1,
          limit: query.limit || 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
      
      const apiResponse = ApiResponseBuilder.success(mockHistory);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'SEARCH_HISTORY_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }
} 