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
  UseGuards 
} from '@nestjs/common';
import { Response } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery, 
  ApiParam 
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { FAQService } from '../services/faq.service';
import { 
  CreateFAQDto, 
  UpdateFAQDto, 
  FAQResponseDto, 
  FAQQueryDto,
  BulkCreateFAQDto,
  BulkUpdateFAQDto,
  ReorderFAQDto,
  FAQStatistics,
  FAQSearchResult
} from '../dto/faq.dto';
import { ApiResponseBuilder } from '../../../common/types/api-response';

@ApiTags('Admin FAQ')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/faq')
export class AdminFAQController {
  constructor(private readonly faqService: FAQService) {}

  @Get()
  @ApiOperation({ summary: 'Get all FAQs (Admin)' })
  @ApiResponse({ status: 200, description: 'FAQs retrieved successfully' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'lang', required: false, type: String })
  @Roles('ADMIN', 'EDITOR')
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
  @ApiOperation({ summary: 'Get FAQs with pagination (Admin)' })
  @ApiResponse({ status: 200, description: 'FAQs retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @Roles('ADMIN', 'EDITOR')
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

  @Get('statistics')
  @ApiOperation({ summary: 'Get FAQ statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @Roles('ADMIN', 'EDITOR')
  async getFAQStatistics(
    @Res() response: Response
  ): Promise<void> {
    try {
      const statistics = await this.faqService.getFAQStatistics();
      
      const apiResponse = ApiResponseBuilder.success(statistics);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'FAQ_STATISTICS_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Search FAQs (Admin)' })
  @ApiResponse({ status: 200, description: 'Search completed successfully' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @Roles('ADMIN', 'EDITOR')
  async searchFAQs(
    @Res() response: Response,
    @Query('q') searchTerm: string,
    @Query('isActive') isActive?: boolean
  ): Promise<void> {
    try {
      const result = await this.faqService.searchFAQs(searchTerm, isActive);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'FAQS_SEARCH_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get FAQ by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'FAQ retrieved successfully' })
  @ApiResponse({ status: 404, description: 'FAQ not found' })
  @ApiParam({ name: 'id', description: 'FAQ ID' })
  @Roles('ADMIN', 'EDITOR')
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

  @Post()
  @ApiOperation({ summary: 'Create new FAQ (Admin)' })
  @ApiResponse({ status: 201, description: 'FAQ created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @Roles('ADMIN', 'EDITOR')
  async createFAQ(
    @Res() response: Response,
    @Body() data: CreateFAQDto
  ): Promise<void> {
    try {
      const faq = await this.faqService.createFAQ(data);
      
      const apiResponse = ApiResponseBuilder.success(faq);

      response.status(201).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'FAQ_CREATION_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update FAQ (Admin)' })
  @ApiResponse({ status: 200, description: 'FAQ updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'FAQ not found' })
  @ApiParam({ name: 'id', description: 'FAQ ID' })
  @Roles('ADMIN', 'EDITOR')
  async updateFAQ(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() data: UpdateFAQDto
  ): Promise<void> {
    try {
      const faq = await this.faqService.updateFAQ(id, data);
      
      const apiResponse = ApiResponseBuilder.success(faq);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 400;
      const apiResponse = ApiResponseBuilder.error(
        'FAQ_UPDATE_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete FAQ (Admin)' })
  @ApiResponse({ status: 200, description: 'FAQ deleted successfully' })
  @ApiResponse({ status: 404, description: 'FAQ not found' })
  @ApiParam({ name: 'id', description: 'FAQ ID' })
  @Roles('ADMIN')
  async deleteFAQ(
    @Res() response: Response,
    @Param('id') id: string
  ): Promise<void> {
    try {
      await this.faqService.deleteFAQ(id);
      
      const apiResponse = ApiResponseBuilder.success({ message: 'FAQ deleted successfully' });

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'FAQ_DELETION_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reorder FAQs (Admin)' })
  @ApiResponse({ status: 200, description: 'FAQs reordered successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @Roles('ADMIN', 'EDITOR')
  async reorderFAQs(
    @Res() response: Response,
    @Body() data: ReorderFAQDto
  ): Promise<void> {
    try {
      await this.faqService.reorderFAQs(data);
      
      const apiResponse = ApiResponseBuilder.success({ message: 'FAQs reordered successfully' });

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'FAQ_REORDER_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }

  @Post('bulk-create')
  @ApiOperation({ summary: 'Bulk create FAQs (Admin)' })
  @ApiResponse({ status: 201, description: 'FAQs created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @Roles('ADMIN', 'EDITOR')
  async bulkCreateFAQs(
    @Res() response: Response,
    @Body() data: BulkCreateFAQDto
  ): Promise<void> {
    try {
      const faqs = await this.faqService.bulkCreateFAQs(data);
      
      const apiResponse = ApiResponseBuilder.success(faqs);

      response.status(201).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'FAQ_BULK_CREATION_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }

  @Put('bulk-update')
  @ApiOperation({ summary: 'Bulk update FAQs (Admin)' })
  @ApiResponse({ status: 200, description: 'FAQs updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @Roles('ADMIN', 'EDITOR')
  async bulkUpdateFAQs(
    @Res() response: Response,
    @Body() data: BulkUpdateFAQDto
  ): Promise<void> {
    try {
      const faqs = await this.faqService.bulkUpdateFAQs(data);
      
      const apiResponse = ApiResponseBuilder.success(faqs);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'FAQ_BULK_UPDATE_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }

  @Post('import')
  @ApiOperation({ summary: 'Import FAQs (Admin)' })
  @ApiResponse({ status: 200, description: 'Import completed' })
  @ApiResponse({ status: 400, description: 'Import failed' })
  @Roles('ADMIN')
  async importFAQs(
    @Res() response: Response,
    @Body() data: { faqs: CreateFAQDto[] }
  ): Promise<void> {
    try {
      const result = await this.faqService.importFAQs(data.faqs);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'FAQ_IMPORT_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }

  @Get('export/all')
  @ApiOperation({ summary: 'Export all FAQs (Admin)' })
  @ApiResponse({ status: 200, description: 'Export completed' })
  @Roles('ADMIN', 'EDITOR')
  async exportFAQs(
    @Res() response: Response
  ): Promise<void> {
    try {
      const result = await this.faqService.exportFAQs();
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'FAQ_EXPORT_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }
} 