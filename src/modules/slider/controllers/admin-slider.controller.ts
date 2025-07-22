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
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery, 
  ApiParam,
  ApiConsumes
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { SliderService } from '../services/slider.service';
import { 
  CreateSliderDto, 
  UpdateSliderDto, 
  SliderQueryDto, 
  SliderResponseDto,
  SliderStatistics,
  SliderAnalytics,
  BulkOperationResult
} from '../dto/slider.dto';
import { ApiResponseBuilder } from '../../../common/types/api-response';

@ApiTags('Admin Sliders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/sliders')
export class AdminSliderController {
  constructor(private readonly sliderService: SliderService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sliders (Admin)' })
  @ApiResponse({ status: 200, description: 'Sliders retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
  @ApiQuery({ name: 'position', required: false, type: Number })
  @Roles('ADMIN', 'EDITOR')
  async getAllSliders(
    @Res() response: Response,
    @Query() query?: SliderQueryDto
  ): Promise<void> {
    try {
      const result = await this.sliderService.getAllSliders(query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'SLIDERS_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get slider statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @Roles('ADMIN', 'EDITOR')
  async getSliderStatistics(
    @Res() response: Response
  ): Promise<void> {
    try {
      const statistics = await this.sliderService.getSliderStatistics();
      
      const apiResponse = ApiResponseBuilder.success(statistics);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'SLIDER_STATISTICS_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Search sliders (Admin)' })
  @ApiResponse({ status: 200, description: 'Search completed successfully' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @Roles('ADMIN', 'EDITOR')
  async searchSliders(
    @Res() response: Response,
    @Query('q') searchTerm: string,
    @Query() query?: SliderQueryDto
  ): Promise<void> {
    try {
      const result = await this.sliderService.searchSliders(searchTerm, query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'SLIDER_SEARCH_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get slider by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Slider retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Slider not found' })
  @ApiParam({ name: 'id', description: 'Slider ID' })
  @Roles('ADMIN', 'EDITOR')
  async getSliderById(
    @Res() response: Response,
    @Param('id') id: string
  ): Promise<void> {
    try {
      const slider = await this.sliderService.getSliderById(id);
      
      const apiResponse = ApiResponseBuilder.success(slider);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'SLIDER_NOT_FOUND',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create slider (Admin)' })
  @ApiResponse({ status: 201, description: 'Slider created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @Roles('ADMIN', 'EDITOR')
  async createSlider(
    @Res() response: Response,
    @Body() data: CreateSliderDto,
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const slider = await this.sliderService.createSlider(data, user.id);
      
      const apiResponse = ApiResponseBuilder.success(slider);

      response.status(201).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'SLIDER_CREATION_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update slider (Admin)' })
  @ApiResponse({ status: 200, description: 'Slider updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Slider not found' })
  @ApiParam({ name: 'id', description: 'Slider ID' })
  @Roles('ADMIN', 'EDITOR')
  async updateSlider(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() data: UpdateSliderDto,
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const slider = await this.sliderService.updateSlider(id, data, user.id);
      
      const apiResponse = ApiResponseBuilder.success(slider);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 400;
      const apiResponse = ApiResponseBuilder.error(
        'SLIDER_UPDATE_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete slider (Admin)' })
  @ApiResponse({ status: 200, description: 'Slider deleted successfully' })
  @ApiResponse({ status: 404, description: 'Slider not found' })
  @ApiParam({ name: 'id', description: 'Slider ID' })
  @Roles('ADMIN')
  async deleteSlider(
    @Res() response: Response,
    @Param('id') id: string
  ): Promise<void> {
    try {
      await this.sliderService.deleteSlider(id);
      
      const apiResponse = ApiResponseBuilder.success({ message: 'Slider deleted successfully' });

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'SLIDER_DELETION_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish slider (Admin)' })
  @ApiResponse({ status: 200, description: 'Slider published successfully' })
  @ApiResponse({ status: 404, description: 'Slider not found' })
  @ApiParam({ name: 'id', description: 'Slider ID' })
  @Roles('ADMIN', 'EDITOR')
  async publishSlider(
    @Res() response: Response,
    @Param('id') id: string,
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const slider = await this.sliderService.publishSlider(id, user.id);
      
      const apiResponse = ApiResponseBuilder.success(slider);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'SLIDER_PUBLISH_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Post(':id/unpublish')
  @ApiOperation({ summary: 'Unpublish slider (Admin)' })
  @ApiResponse({ status: 200, description: 'Slider unpublished successfully' })
  @ApiResponse({ status: 404, description: 'Slider not found' })
  @ApiParam({ name: 'id', description: 'Slider ID' })
  @Roles('ADMIN', 'EDITOR')
  async unpublishSlider(
    @Res() response: Response,
    @Param('id') id: string,
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const slider = await this.sliderService.unpublishSlider(id, user.id);
      
      const apiResponse = ApiResponseBuilder.success(slider);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'SLIDER_UNPUBLISH_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Put('reorder')
  @ApiOperation({ summary: 'Reorder sliders (Admin)' })
  @ApiResponse({ status: 200, description: 'Sliders reordered successfully' })
  @ApiResponse({ status: 400, description: 'Reorder failed' })
  @Roles('ADMIN', 'EDITOR')
  async reorderSliders(
    @Res() response: Response,
    @Body() orders: { id: string; position: number }[]
  ): Promise<void> {
    try {
      await this.sliderService.reorderSliders(orders);
      
      const apiResponse = ApiResponseBuilder.success({ message: 'Sliders reordered successfully' });

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'SLIDER_REORDER_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get slider analytics (Admin)' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Slider not found' })
  @ApiParam({ name: 'id', description: 'Slider ID' })
  @ApiQuery({ name: 'dateFrom', required: false, type: Date })
  @ApiQuery({ name: 'dateTo', required: false, type: Date })
  @Roles('ADMIN', 'EDITOR')
  async getSliderAnalytics(
    @Res() response: Response,
    @Param('id') id: string,
    @Query('dateFrom') dateFrom?: Date,
    @Query('dateTo') dateTo?: Date
  ): Promise<void> {
    try {
      const analytics = await this.sliderService.getSliderAnalytics(id, dateFrom, dateTo);
      
      const apiResponse = ApiResponseBuilder.success(analytics);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'SLIDER_ANALYTICS_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get('export')
  @ApiOperation({ summary: 'Export sliders (Admin)' })
  @ApiResponse({ status: 200, description: 'Sliders exported successfully' })
  @ApiQuery({ name: 'format', required: false, type: String })
  @Roles('ADMIN', 'EDITOR')
  async exportSliders(
    @Res() response: Response,
    @Query() query: SliderQueryDto,
    @Query('format') format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<void> {
    try {
      const buffer = await this.sliderService.exportSliders(query, format);
      
      const contentType = format === 'json' ? 'application/json' : 'application/octet-stream';
      const filename = `sliders-export.${format}`;
      
      response.setHeader('Content-Type', contentType);
      response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      response.send(buffer);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'SLIDER_EXPORT_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Post('import')
  @ApiOperation({ summary: 'Import sliders (Admin)' })
  @ApiResponse({ status: 201, description: 'Sliders imported successfully' })
  @ApiResponse({ status: 400, description: 'Import failed' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @Roles('ADMIN')
  async importSliders(
    @Res() response: Response,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const result = await this.sliderService.importSliders(file, user.id);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(201).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'SLIDER_IMPORT_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }

  @Post('bulk-publish')
  @ApiOperation({ summary: 'Bulk publish sliders (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk publish completed' })
  @Roles('ADMIN', 'EDITOR')
  async bulkPublish(
    @Res() response: Response,
    @Body() data: { ids: string[] },
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const result = await this.sliderService.bulkPublish(data.ids, user.id);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'SLIDER_BULK_PUBLISH_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Post('bulk-unpublish')
  @ApiOperation({ summary: 'Bulk unpublish sliders (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk unpublish completed' })
  @Roles('ADMIN', 'EDITOR')
  async bulkUnpublish(
    @Res() response: Response,
    @Body() data: { ids: string[] },
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const result = await this.sliderService.bulkUnpublish(data.ids, user.id);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'SLIDER_BULK_UNPUBLISH_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Post('bulk-delete')
  @ApiOperation({ summary: 'Bulk delete sliders (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk deletion completed' })
  @Roles('ADMIN')
  async bulkDelete(
    @Res() response: Response,
    @Body() data: { ids: string[] }
  ): Promise<void> {
    try {
      const result = await this.sliderService.bulkDelete(data.ids);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'SLIDER_BULK_DELETION_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }
} 