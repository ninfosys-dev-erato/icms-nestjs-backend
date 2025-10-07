import { Controller, Get, Query, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { FAQService } from '../services/faq.service';
import { FAQQueryDto, FAQResponseDto, FAQSearchResult } from '../dto/faq.dto';
import { ApiResponseBuilder } from '../../../common/types/api-response';

@ApiTags('FAQ')
@Controller('faq')
export class FAQController {
  constructor(private readonly faqService: FAQService) {}

  @Get()
  @ApiOperation({ summary: 'Get all FAQs' })
  @ApiResponse({ status: 200, description: 'FAQs retrieved successfully' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'lang', required: false, type: String })
  async getAllFAQs(
    @Res() response: Response,
    @Query() query?: FAQQueryDto
  ): Promise<void> {
    try {
      const faqs = await this.faqService.getAllFAQs(query);
      
      const apiResponse = ApiResponseBuilder.success(faqs);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'FAQS_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('paginated')
  @ApiOperation({ summary: 'Get FAQs with pagination' })
  @ApiResponse({ status: 200, description: 'FAQs retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async getFAQsWithPagination(
    @Res() response: Response,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('isActive') isActive?: boolean
  ): Promise<void> {
    try {
      const result = await this.faqService.getFAQsWithPagination(page, limit, isActive);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'FAQS_PAGINATION_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Search FAQs' })
  @ApiResponse({ status: 200, description: 'Search completed successfully' })
  @ApiResponse({ status: 400, description: 'Search term is required' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async searchFAQs(
    @Res() response: Response,
    @Query('q') searchTerm: string,
    @Query('isActive') isActive?: boolean
  ): Promise<void> {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        const apiResponse = ApiResponseBuilder.error(
          'SEARCH_TERM_REQUIRED',
          'Search term is required'
        );
        response.status(400).json(apiResponse);
        return;
      }

      const result = await this.faqService.searchFAQs(searchTerm, isActive);
      
      // Return just the data array to match the expected response format
      const apiResponse = ApiResponseBuilder.success(result.data);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'FAQS_SEARCH_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('random')
  @ApiOperation({ summary: 'Get random FAQs' })
  @ApiResponse({ status: 200, description: 'Random FAQs retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'lang', required: false, type: String })
  async getRandomFAQs(
    @Res() response: Response,
    @Query('limit') limit?: number,
    @Query('lang') lang?: string
  ): Promise<void> {
    try {
      const faqs = await this.faqService.getRandomFAQs(limit, lang);
      
      const apiResponse = ApiResponseBuilder.success(faqs);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'RANDOM_FAQS_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular FAQs' })
  @ApiResponse({ status: 200, description: 'Popular FAQs retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'lang', required: false, type: String })
  async getPopularFAQs(
    @Res() response: Response,
    @Query('limit') limit?: number,
    @Query('lang') lang?: string
  ): Promise<void> {
    try {
      const faqs = await this.faqService.getPopularFAQs(limit, lang);
      
      const apiResponse = ApiResponseBuilder.success(faqs);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'POPULAR_FAQS_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active FAQs only' })
  @ApiResponse({ status: 200, description: 'Active FAQs retrieved successfully' })
  @ApiQuery({ name: 'lang', required: false, type: String })
  async getActiveFAQs(
    @Res() response: Response,
    @Query() query?: FAQQueryDto
  ): Promise<void> {
    try {
      const faqs = await this.faqService.getAllFAQs({ ...query, isActive: true });
      
      const apiResponse = ApiResponseBuilder.success(faqs);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'ACTIVE_FAQS_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get FAQ by ID' })
  @ApiResponse({ status: 200, description: 'FAQ retrieved successfully' })
  @ApiResponse({ status: 404, description: 'FAQ not found' })
  @ApiParam({ name: 'id', description: 'FAQ ID' })
  async getFAQById(
    @Res() response: Response,
    @Param('id') id: string
  ): Promise<void> {
    try {
      const faq = await this.faqService.getFAQ(id);
      
      const apiResponse = ApiResponseBuilder.success(faq);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'FAQ_NOT_FOUND',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }
} 