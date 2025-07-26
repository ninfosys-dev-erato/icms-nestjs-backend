import {
  Controller,
  Get,
  Param,
  Query,
  HttpStatus,
  HttpException,
  Res
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';

import { ImportantLinksService } from '../services/important-links.service';
import { 
  ImportantLinkResponseDto, 
  ImportantLinksQueryDto,
  FooterLinksDto
} from '../dto/important-links.dto';
import { ApiResponseBuilder } from '../../../common/types/api-response';

@ApiTags('Important Links')
@Controller('important-links')
export class ImportantLinksController {
  constructor(private readonly importantLinksService: ImportantLinksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all important links (Public)' })
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
  @ApiOperation({ summary: 'Get important links with pagination (Public)' })
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

  @Get('footer')
  @ApiOperation({ summary: 'Get footer links (Public)' })
  @ApiResponse({ status: 200, description: 'Footer links retrieved successfully', type: FooterLinksDto })
  @ApiQuery({ name: 'lang', required: false, type: String })
  async getFooterLinks(
    @Res() response: Response,
    @Query('lang') lang?: string,
  ): Promise<void> {
    try {
      const result = await this.importantLinksService.getFooterLinks(lang);
      const apiResponse = ApiResponseBuilder.success(result);
      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error('FOOTER_LINKS_RETRIEVAL_ERROR', error.message);
      response.status(500).json(apiResponse);
    }
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active important links (Public)' })
  @ApiResponse({ status: 200, description: 'Active important links retrieved successfully', type: [ImportantLinkResponseDto] })
  @ApiQuery({ name: 'lang', required: false, type: String })
  async getActiveImportantLinks(
    @Res() response: Response,
    @Query('lang') lang?: string,
  ): Promise<void> {
    try {
      const query: ImportantLinksQueryDto = { isActive: true, lang };
      const result = await this.importantLinksService.getAllImportantLinks(query);
      const apiResponse = ApiResponseBuilder.success(result);
      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error('ACTIVE_LINKS_RETRIEVAL_ERROR', error.message);
      response.status(500).json(apiResponse);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get important link by ID (Public)' })
  @ApiResponse({ status: 200, description: 'Important link retrieved successfully', type: ImportantLinkResponseDto })
  @ApiResponse({ status: 404, description: 'Important link not found' })
  @ApiParam({ name: 'id', description: 'Important Link ID' })
  @ApiQuery({ name: 'lang', required: false, type: String })
  async getImportantLinkById(
    @Res() response: Response,
    @Param('id') id: string,
    @Query('lang') lang?: string,
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
} 