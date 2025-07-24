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
  UploadedFile,
  BadRequestException
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
import { MediaService } from '../services/media.service';
import { 
  CreateMediaDto, 
  UpdateMediaDto, 
  MediaResponseDto, 
  MediaQueryDto,
  MediaStatistics,
  MediaProcessingOptions,
  BulkOperationResult,
  BulkCreateMediaDto,
  BulkUpdateMediaDto
} from '../dto/media.dto';
import { ApiResponseBuilder } from '../../../common/types/api-response';

@ApiTags('Admin Media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/media')
export class AdminMediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @ApiOperation({ summary: 'Get all media (Admin)' })
  @ApiResponse({ status: 200, description: 'Media retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @Roles('ADMIN', 'EDITOR')
  async getAllMedia(
    @Res() response: Response,
    @Query() query?: MediaQueryDto
  ): Promise<void> {
    try {
      const result = await this.mediaService.getAllMedia(query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'MEDIA_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get media statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @Roles('ADMIN', 'EDITOR')
  async getMediaStatistics(
    @Res() response: Response
  ): Promise<void> {
    try {
      const statistics = await this.mediaService.getMediaStatistics();
      
      const apiResponse = ApiResponseBuilder.success(statistics);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'MEDIA_STATISTICS_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Search media (Admin)' })
  @ApiResponse({ status: 200, description: 'Search completed successfully' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @Roles('ADMIN', 'EDITOR')
  async searchMedia(
    @Res() response: Response,
    @Query('q') searchTerm: string,
    @Query() query?: MediaQueryDto
  ): Promise<void> {
    try {
      const result = await this.mediaService.searchMedia(searchTerm, query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'MEDIA_SEARCH_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload media (Admin)' })
  @ApiResponse({ status: 201, description: 'Media uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Upload failed' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @Roles('ADMIN', 'EDITOR')
  async uploadMedia(
    @Res() response: Response,
    @UploadedFile() file: Express.Multer.File,
    @Body() metadata?: Partial<CreateMediaDto>
  ): Promise<void> {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      const media = await this.mediaService.uploadMedia(file, metadata);
      
      const apiResponse = ApiResponseBuilder.success(media);

      response.status(201).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'MEDIA_UPLOAD_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }

  @Post('bulk-delete')
  @ApiOperation({ summary: 'Bulk delete media (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk deletion completed' })
  @Roles('ADMIN')
  async bulkDelete(
    @Res() response: Response,
    @Body() data: { ids: string[] }
  ): Promise<void> {
    try {
      const result = await this.mediaService.bulkDelete(data.ids);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'MEDIA_BULK_DELETION_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Put('bulk-update')
  @ApiOperation({ summary: 'Bulk update media (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk update completed' })
  @ApiResponse({ status: 400, description: 'Update failed' })
  @Roles('ADMIN', 'EDITOR')
  async bulkUpdate(
    @Res() response: Response,
    @Body() data: BulkUpdateMediaDto
  ): Promise<void> {
    try {
      const result = await this.mediaService.bulkUpdate(data.ids, data.updates);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'MEDIA_BULK_UPDATE_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }

  @Post('bulk-create')
  @ApiOperation({ summary: 'Bulk create media (Admin)' })
  @ApiResponse({ status: 201, description: 'Bulk creation completed' })
  @ApiResponse({ status: 400, description: 'Creation failed' })
  @Roles('ADMIN', 'EDITOR')
  async bulkCreate(
    @Res() response: Response,
    @Body() data: BulkCreateMediaDto
  ): Promise<void> {
    try {
      const media = await this.mediaService.bulkCreate(data);
      
      const apiResponse = ApiResponseBuilder.success(media);

      response.status(201).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'MEDIA_BULK_CREATION_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Media retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  @ApiParam({ name: 'id', description: 'Media ID' })
  @Roles('ADMIN', 'EDITOR')
  async getMediaById(
    @Res() response: Response,
    @Param('id') id: string
  ): Promise<void> {
    try {
      const media = await this.mediaService.getMediaById(id);
      
      const apiResponse = ApiResponseBuilder.success(media);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'MEDIA_NOT_FOUND',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update media (Admin)' })
  @ApiResponse({ status: 200, description: 'Media updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  @ApiParam({ name: 'id', description: 'Media ID' })
  @Roles('ADMIN', 'EDITOR')
  async updateMedia(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() data: UpdateMediaDto
  ): Promise<void> {
    try {
      const media = await this.mediaService.updateMedia(id, data);
      
      const apiResponse = ApiResponseBuilder.success(media);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 400;
      const apiResponse = ApiResponseBuilder.error(
        'MEDIA_UPDATE_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete media (Admin)' })
  @ApiResponse({ status: 200, description: 'Media deleted successfully' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  @ApiParam({ name: 'id', description: 'Media ID' })
  @Roles('ADMIN')
  async deleteMedia(
    @Res() response: Response,
    @Param('id') id: string
  ): Promise<void> {
    try {
      await this.mediaService.deleteMedia(id);
      
      const apiResponse = ApiResponseBuilder.success({ message: 'Media deleted successfully' });

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'MEDIA_DELETION_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Post(':id/process')
  @ApiOperation({ summary: 'Process media (Admin)' })
  @ApiResponse({ status: 200, description: 'Media processed successfully' })
  @ApiResponse({ status: 400, description: 'Processing failed' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  @ApiParam({ name: 'id', description: 'Media ID' })
  @Roles('ADMIN', 'EDITOR')
  async processMedia(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() options: MediaProcessingOptions
  ): Promise<void> {
    try {
      const media = await this.mediaService.processMedia(id, options);
      
      const apiResponse = ApiResponseBuilder.success(media);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 400;
      const apiResponse = ApiResponseBuilder.error(
        'MEDIA_PROCESSING_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

} 