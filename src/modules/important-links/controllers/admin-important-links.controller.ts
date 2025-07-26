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
} from '@nestjs/common';
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
  async getAllImportantLinks(
    @Query() query: ImportantLinksQueryDto,
  ) {
    return await this.importantLinksService.getAllImportantLinks(query);
  }

  @Get('paginated')
  @ApiOperation({ summary: 'Get important links with pagination (Admin)' })
  @ApiResponse({ status: 200, description: 'Important links retrieved successfully' })
  async getImportantLinksWithPagination(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('isActive') isActive?: boolean,
  ) {
    return await this.importantLinksService.getImportantLinksWithPagination(page, limit, isActive);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get important links statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully', type: ImportantLinksStatistics })
  async getImportantLinksStatistics() {
    return await this.importantLinksService.getImportantLinksStatistics();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search important links (Admin)' })
  @ApiResponse({ status: 200, description: 'Search completed successfully' })
  async searchImportantLinks(
    @Query('q') searchTerm: string,
    @Query() query: ImportantLinksQueryDto,
  ) {
    // Note: Search functionality needs to be implemented in the service
    return await this.importantLinksService.getAllImportantLinks(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get important link by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Important link retrieved successfully', type: ImportantLinkResponseDto })
  @ApiResponse({ status: 404, description: 'Important link not found' })
  async getImportantLinkById(
    @Param('id') id: string,
  ) {
    return await this.importantLinksService.getImportantLink(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create important link (Admin)' })
  @ApiResponse({ status: 201, description: 'Important link created successfully', type: ImportantLinkResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async createImportantLink(
    @Body() data: CreateImportantLinkDto,
  ) {
    return await this.importantLinksService.createImportantLink(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update important link (Admin)' })
  @ApiResponse({ status: 200, description: 'Important link updated successfully', type: ImportantLinkResponseDto })
  @ApiResponse({ status: 404, description: 'Important link not found' })
  async updateImportantLink(
    @Param('id') id: string,
    @Body() data: UpdateImportantLinkDto,
  ) {
    return await this.importantLinksService.updateImportantLink(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete important link (Admin)' })
  @ApiResponse({ status: 200, description: 'Important link deleted successfully' })
  @ApiResponse({ status: 404, description: 'Important link not found' })
  @Roles('ADMIN')
  async deleteImportantLink(
    @Param('id') id: string,
  ) {
    return await this.importantLinksService.deleteImportantLink(id);
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reorder important links (Admin)' })
  @ApiResponse({ status: 200, description: 'Important links reordered successfully' })
  async reorderImportantLinks(
    @Body() data: ReorderImportantLinksDto,
  ) {
    return await this.importantLinksService.reorderImportantLinks(data);
  }

  @Post('bulk-create')
  @ApiOperation({ summary: 'Bulk create important links (Admin)' })
  @ApiResponse({ status: 201, description: 'Important links created successfully' })
  async bulkCreateImportantLinks(
    @Body() data: BulkCreateImportantLinksDto,
  ) {
    return await this.importantLinksService.bulkCreateImportantLinks(data);
  }

  @Put('bulk-update')
  @ApiOperation({ summary: 'Bulk update important links (Admin)' })
  @ApiResponse({ status: 200, description: 'Important links updated successfully' })
  async bulkUpdateImportantLinks(
    @Body() data: BulkUpdateImportantLinksDto,
  ) {
    return await this.importantLinksService.bulkUpdateImportantLinks(data);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import important links (Admin)' })
  @ApiResponse({ status: 201, description: 'Important links imported successfully' })
  async importImportantLinks(
    @Body() data: BulkCreateImportantLinksDto,
  ) {
    return await this.importantLinksService.importImportantLinks(data.links);
  }

  @Get('export/all')
  @ApiOperation({ summary: 'Export all important links (Admin)' })
  @ApiResponse({ status: 200, description: 'Important links exported successfully' })
  async exportImportantLinks() {
    return await this.importantLinksService.exportImportantLinks();
  }
} 