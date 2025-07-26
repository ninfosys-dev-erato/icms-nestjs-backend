import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { ImportantLinksService } from '../services/important-links.service';
import { 
  ImportantLinkResponseDto, 
  ImportantLinksQueryDto,
  FooterLinksDto
} from '../dto/important-links.dto';

@ApiTags('Important Links')
@Controller('important-links')
export class ImportantLinksController {
  constructor(private readonly importantLinksService: ImportantLinksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all important links (Public)' })
  @ApiResponse({ status: 200, description: 'Important links retrieved successfully', type: [ImportantLinkResponseDto] })
  async getAllImportantLinks(
    @Query() query: ImportantLinksQueryDto,
  ) {
    return await this.importantLinksService.getAllImportantLinks(query);
  }

  @Get('paginated')
  @ApiOperation({ summary: 'Get important links with pagination (Public)' })
  @ApiResponse({ status: 200, description: 'Important links retrieved successfully' })
  async getImportantLinksWithPagination(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('isActive') isActive?: boolean,
  ) {
    return await this.importantLinksService.getImportantLinksWithPagination(page, limit, isActive);
  }

  @Get('footer')
  @ApiOperation({ summary: 'Get footer links (Public)' })
  @ApiResponse({ status: 200, description: 'Footer links retrieved successfully', type: FooterLinksDto })
  async getFooterLinks(
    @Query('lang') lang?: string,
  ) {
    return await this.importantLinksService.getFooterLinks(lang);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active important links (Public)' })
  @ApiResponse({ status: 200, description: 'Active important links retrieved successfully', type: [ImportantLinkResponseDto] })
  async getActiveImportantLinks(
    @Query('lang') lang?: string,
  ) {
    const query: ImportantLinksQueryDto = { isActive: true, lang };
    return await this.importantLinksService.getAllImportantLinks(query);
  }



  @Get(':id')
  @ApiOperation({ summary: 'Get important link by ID (Public)' })
  @ApiResponse({ status: 200, description: 'Important link retrieved successfully', type: ImportantLinkResponseDto })
  @ApiResponse({ status: 404, description: 'Important link not found' })
  async getImportantLinkById(
    @Param('id') id: string,
    @Query('lang') lang?: string,
  ) {
    return await this.importantLinksService.getImportantLink(id);
  }
} 