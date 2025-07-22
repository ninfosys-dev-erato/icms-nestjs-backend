import { Controller, Get, Query, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { MediaService } from '../services/media.service';
import { MediaQueryDto, MediaResponseDto, MediaType } from '../dto/media.dto';
import { ApiResponseBuilder } from '../../../common/types/api-response';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @ApiOperation({ summary: 'Get all media' })
  @ApiResponse({ status: 200, description: 'Media retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'mediaType', required: false, enum: MediaType })
  @ApiQuery({ name: 'albumId', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String })
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

  @Get('type/:type')
  @ApiOperation({ summary: 'Get media by type' })
  @ApiResponse({ status: 200, description: 'Media retrieved successfully' })
  @ApiParam({ name: 'type', enum: MediaType })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async getMediaByType(
    @Res() response: Response,
    @Param('type') type: MediaType,
    @Query() query?: MediaQueryDto
  ): Promise<void> {
    try {
      const result = await this.mediaService.getMediaByType(type, query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'MEDIA_TYPE_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Search media' })
  @ApiResponse({ status: 200, description: 'Search completed successfully' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
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

  @Get('images')
  @ApiOperation({ summary: 'Get all images' })
  @ApiResponse({ status: 200, description: 'Images retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async getImages(
    @Res() response: Response,
    @Query() query?: MediaQueryDto
  ): Promise<void> {
    try {
      const result = await this.mediaService.getMediaByType(MediaType.IMAGE, query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'IMAGES_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('videos')
  @ApiOperation({ summary: 'Get all videos' })
  @ApiResponse({ status: 200, description: 'Videos retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async getVideos(
    @Res() response: Response,
    @Query() query?: MediaQueryDto
  ): Promise<void> {
    try {
      const result = await this.mediaService.getMediaByType(MediaType.VIDEO, query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'VIDEOS_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('documents')
  @ApiOperation({ summary: 'Get all documents' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async getDocuments(
    @Res() response: Response,
    @Query() query?: MediaQueryDto
  ): Promise<void> {
    try {
      const result = await this.mediaService.getMediaByType(MediaType.DOCUMENT, query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'DOCUMENTS_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media by ID' })
  @ApiResponse({ status: 200, description: 'Media retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  @ApiParam({ name: 'id', description: 'Media ID' })
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

  @Get(':id/url')
  @ApiOperation({ summary: 'Get media URL' })
  @ApiResponse({ status: 200, description: 'Media URL retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  @ApiParam({ name: 'id', description: 'Media ID' })
  @ApiQuery({ name: 'variant', required: false, type: String })
  async getMediaUrl(
    @Res() response: Response,
    @Param('id') id: string,
    @Query('variant') variant?: string
  ): Promise<void> {
    try {
      const url = await this.mediaService.getMediaUrl(id, variant);
      
      const apiResponse = ApiResponseBuilder.success({ url });

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'MEDIA_URL_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }
} 