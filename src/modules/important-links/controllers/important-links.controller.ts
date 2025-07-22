import {
  Controller,
  Get,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { ImportantLinksService } from '../services/important-links.service';
import { 
  ImportantLinkResponseDto, 
  ImportantLinksQueryDto,
  FooterLinksDto
} from '../dto/important-links.dto';
import { ApiResponseBuilder } from '../../../common/types/api-response';

@ApiTags('Important Links')
@Controller('api/v1/important-links')
export class ImportantLinksController {
  constructor(private readonly importantLinksService: ImportantLinksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all important links (Public)' })
  @ApiResponse({ status: 200, description: 'Important links retrieved successfully', type: [ImportantLinkResponseDto] })
  async getAllImportantLinks(
    @Query() query: ImportantLinksQueryDto,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const links = await this.importantLinksService.getAllImportantLinks(query);
      
      const apiResponse = ApiResponseBuilder.success(links);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'IMPORTANT_LINKS_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('paginated')
  @ApiOperation({ summary: 'Get important links with pagination (Public)' })
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

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'IMPORTANT_LINKS_PAGINATION_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('footer')
  @ApiOperation({ summary: 'Get footer links (Public)' })
  @ApiResponse({ status: 200, description: 'Footer links retrieved successfully', type: FooterLinksDto })
  async getFooterLinks(
    @Res() response: Response,
    @Query('lang') lang?: string,
  ): Promise<void> {
    try {
      const footerLinks = await this.importantLinksService.getFooterLinks(lang);
      
      const apiResponse = ApiResponseBuilder.success(footerLinks);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'FOOTER_LINKS_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active important links (Public)' })
  @ApiResponse({ status: 200, description: 'Active important links retrieved successfully', type: [ImportantLinkResponseDto] })
  async getActiveImportantLinks(
    @Res() response: Response,
    @Query('lang') lang?: string,
  ): Promise<void> {
    try {
      const links = await this.importantLinksService.getAllImportantLinks({ isActive: true, lang });
      
      const apiResponse = ApiResponseBuilder.success(links);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'ACTIVE_LINKS_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get important link by ID (Public)' })
  @ApiResponse({ status: 200, description: 'Important link retrieved successfully', type: ImportantLinkResponseDto })
  @ApiResponse({ status: 404, description: 'Important link not found' })
  async getImportantLinkById(
    @Res() response: Response,
    @Param('id') id: string,
    @Query('lang') lang?: string,
  ): Promise<void> {
    try {
      const link = await this.importantLinksService.getImportantLink(id);
      
      const apiResponse = ApiResponseBuilder.success(link);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'IMPORTANT_LINK_NOT_FOUND',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }
} 