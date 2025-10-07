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
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Request,
  HttpCode,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
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
import { ApiResponseBuilder } from '@/common/types/api-response';

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
  async getAllSliders(@Res() response: Response, @Query() query: SliderQueryDto, @Request() req: any): Promise<void> {
    // Temporary debug logs to trace boolean parsing
    console.log('🔎 AdminSliderController.getAllSliders query:', query);
    const rawIsActive = req?.query?.isActive;
    console.log('  raw isActive from req.query:', rawIsActive, 'type:', typeof rawIsActive);

    if (rawIsActive !== undefined) {
      let normalized: boolean | undefined = undefined;
      if (typeof rawIsActive === 'boolean') {
        normalized = rawIsActive;
      } else if (typeof rawIsActive === 'string') {
        const v = rawIsActive.toLowerCase().trim();
        if (['true', '1', 'yes', 'on'].includes(v)) normalized = true;
        if (['false', '0', 'no', 'off'].includes(v)) normalized = false;
      }
      if (normalized !== undefined) {
        query = { ...query, isActive: normalized } as any;
      }
    }

    console.log('  final isActive used:', query?.isActive, 'type:', typeof query?.isActive);

    const result = await this.sliderService.getAllSliders(query);
    response
      .status(HttpStatus.OK)
      .json(ApiResponseBuilder.paginated(result.data, result.pagination));
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get slider statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @Roles('ADMIN', 'EDITOR')
  async getSliderStatistics(@Res() response: Response): Promise<void> {
    const stats = await this.sliderService.getSliderStatistics();
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(stats));
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
    const result = await this.sliderService.searchSliders(searchTerm, query);
    response
      .status(HttpStatus.OK)
      .json(ApiResponseBuilder.paginated(result.data, result.pagination));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get slider by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Slider retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Slider not found' })
  @ApiParam({ name: 'id', description: 'Slider ID' })
  @Roles('ADMIN', 'EDITOR')
  async getSliderById(@Res() response: Response, @Param('id') id: string): Promise<void> {
    const slider = await this.sliderService.getSliderById(id);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(slider));
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
    const slider = await this.sliderService.createSlider(data, user.id);
    response.status(HttpStatus.CREATED).json(ApiResponseBuilder.success(slider));
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
    const slider = await this.sliderService.updateSlider(id, data, user.id);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(slider));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete slider (Admin)' })
  @ApiResponse({ status: 200, description: 'Slider deleted successfully' })
  @ApiResponse({ status: 404, description: 'Slider not found' })
  @ApiParam({ name: 'id', description: 'Slider ID' })
  @Roles('ADMIN')
  async deleteSlider(@Res() response: Response, @Param('id') id: string): Promise<void> {
    await this.sliderService.deleteSlider(id);
    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success({ message: 'Slider deleted successfully' }),
    );
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
    const slider = await this.sliderService.publishSlider(id, user.id);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(slider));
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
    const slider = await this.sliderService.unpublishSlider(id, user.id);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(slider));
  }

  @Put('reorder')
  @ApiOperation({ summary: 'Reorder sliders (Admin)' })
  @ApiResponse({ status: 200, description: 'Sliders reordered successfully' })
  @ApiResponse({ status: 400, description: 'Reorder failed' })
  @Roles('ADMIN', 'EDITOR')
  async reorderSliders(@Res() response: Response, @Body() orders: { id: string; position: number }[]): Promise<void> {
    await this.sliderService.reorderSliders(orders);
    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success({ message: 'Sliders reordered successfully' }),
    );
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
    const analytics = await this.sliderService.getSliderAnalytics(id, dateFrom, dateTo);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(analytics));
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
    const data = await this.sliderService.exportSliders(query, format);
    const contentType = format === 'json' ? 'application/json' : 
                       format === 'csv' ? 'text/csv' : 'application/pdf';
    const filename = `sliders-export-${new Date().toISOString().split('T')[0]}.${format}`;
    response.setHeader('Content-Type', contentType);
    response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    response.status(HttpStatus.OK).send(data);
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
    const result = await this.sliderService.importSliders(file, user.id);
    response.status(HttpStatus.CREATED).json(ApiResponseBuilder.success(result));
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
    const result = await this.sliderService.bulkPublish(data.ids, user.id);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(result));
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
    const result = await this.sliderService.bulkUnpublish(data.ids, user.id);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(result));
  }

  @Post('bulk-delete')
  @ApiOperation({ summary: 'Bulk delete sliders (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk deletion completed' })
  @Roles('ADMIN')
  async bulkDelete(@Res() response: Response, @Body() data: { ids: string[] }): Promise<void> {
    const result = await this.sliderService.bulkDelete(data.ids);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(result));
  }

  @Post(':id/image')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'file', maxCount: 1 }
      ],
      {
        fileFilter: (req, file, callback) => {
          console.log('🔍 DEBUG: Slider FileInterceptor fileFilter called');
          console.log('  File object:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            encoding: file.encoding,
            mimetype: file.mimetype,
            size: file.size
          });
          callback(null, true);
        },
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB for slider images
        }
      }
    )
  )
  @ApiOperation({ summary: 'Upload slider image (Admin)' })
  @ApiConsumes('multipart/form-data')
  @HttpCode(200)
  @ApiResponse({ status: 200, description: 'Slider image uploaded successfully' })
  @ApiResponse({ status: 400, description: 'File validation error' })
  @ApiResponse({ status: 404, description: 'Slider not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles('ADMIN', 'EDITOR')
  async uploadSliderImage(
    @Res() response: Response,
    @Param('id') id: string,
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; file?: Express.Multer.File[] },
    @Request() req: any,
  ): Promise<void> {
    try {
      console.log('🔍 DEBUG: Slider Image Upload Request Details');
      console.log('=====================================');
      
      console.log('📋 Request Headers:');
      console.log('  Content-Type:', req.headers['content-type']);
      console.log('  Content-Length:', req.headers['content-length']);
      console.log('  Authorization:', req.headers['authorization'] ? 'Present' : 'Missing');
      
      const file = files?.image?.[0] || files?.file?.[0];
      console.log('📁 File Information:');
      if (file) {
        console.log('  ✅ File received:');
        console.log('    - originalname:', file.originalname);
        console.log('    - mimetype:', file.mimetype);
        console.log('    - size:', file.size);
        console.log('    - fieldname:', file.fieldname);
        console.log('    - buffer length:', file.buffer?.length);
      } else {
        console.log('  ❌ No file received');
      }
      
      console.log('=====================================');

      const result = await this.sliderService.uploadSliderImage(id, file, req.user.id);
      response.status(HttpStatus.OK).json(ApiResponseBuilder.success(result));
    } catch (error) {
      console.error('❌ ERROR in uploadSliderImage:', error);
      console.error('  Error message:', error.message);
      console.error('  Error stack:', error.stack);
      throw error;
    }
  }

  @Delete(':id/image')
  @ApiOperation({ summary: 'Remove slider image (Admin)' })
  @ApiResponse({ status: 200, description: 'Slider image removed successfully' })
  @ApiResponse({ status: 404, description: 'Slider not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles('ADMIN', 'EDITOR')
  async removeSliderImage(@Res() response: Response, @Param('id') id: string): Promise<void> {
    const result = await this.sliderService.removeSliderImage(id);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(result));
  }

  @Post('upload-with-slider')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'file', maxCount: 1 }
      ],
      {
        fileFilter: (req, file, callback) => {
          console.log('🔍 DEBUG: Slider Upload with Creation FileInterceptor called');
          console.log('  File object:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          });
          callback(null, true);
        },
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB for slider images
        }
      }
    )
  )
  @ApiOperation({ summary: 'Create slider with image upload (Admin)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Slider created with image successfully' })
  @ApiResponse({ status: 400, description: 'Validation or file error' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles('ADMIN', 'EDITOR')
  async createSliderWithImage(
    @Res() response: Response,
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; file?: Express.Multer.File[] },
    @Body() sliderData: any, // Form data will be parsed from multipart
    @Request() req: any,
  ): Promise<void> {
    try {
      console.log('🔍 DEBUG: Create Slider with Image Upload');
      console.log('=====================================');
      
      const file = files?.image?.[0] || files?.file?.[0];
      console.log('📁 File Information:');
      if (file) {
        console.log('  ✅ File received:');
        console.log('    - originalname:', file.originalname);
        console.log('    - mimetype:', file.mimetype);
        console.log('    - size:', file.size);
      } else {
        console.log('  ❌ No file received');
      }

      console.log('📝 Slider Data:');
      console.log('  Data received:', sliderData);
      
      console.log('=====================================');

      const result = await this.sliderService.createSliderWithImage(file, sliderData, req.user.id);
      response.status(HttpStatus.CREATED).json(ApiResponseBuilder.success(result));
    } catch (error) {
      console.error('❌ ERROR in createSliderWithImage:', error);
      throw error;
    }
  }
} 