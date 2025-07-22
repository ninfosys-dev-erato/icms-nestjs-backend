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
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { MediaAlbumService } from '../services/media-album.service';
import { 
  CreateMediaAlbumDto, 
  UpdateMediaAlbumDto, 
  MediaAlbumResponseDto,
  AlbumStatistics
} from '../dto/media.dto';
import { ApiResponseBuilder } from '../../../common/types/api-response';

@ApiTags('Media Albums')
@Controller('albums')
export class MediaAlbumController {
  constructor(private readonly mediaAlbumService: MediaAlbumService) {}

  @Get()
  @ApiOperation({ summary: 'Get all albums' })
  @ApiResponse({ status: 200, description: 'Albums retrieved successfully' })
  async getAllAlbums(
    @Res() response: Response
  ): Promise<void> {
    try {
      const albums = await this.mediaAlbumService.getAllAlbums();
      
      const apiResponse = ApiResponseBuilder.success(albums);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'ALBUMS_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active albums' })
  @ApiResponse({ status: 200, description: 'Active albums retrieved successfully' })
  async getActiveAlbums(
    @Res() response: Response
  ): Promise<void> {
    try {
      const albums = await this.mediaAlbumService.getActiveAlbums();
      
      const apiResponse = ApiResponseBuilder.success(albums);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'ACTIVE_ALBUMS_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get album by ID' })
  @ApiResponse({ status: 200, description: 'Album retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Album not found' })
  @ApiParam({ name: 'id', description: 'Album ID' })
  async getAlbumById(
    @Res() response: Response,
    @Param('id') id: string
  ): Promise<void> {
    try {
      const album = await this.mediaAlbumService.getAlbumById(id);
      
      const apiResponse = ApiResponseBuilder.success(album);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'ALBUM_NOT_FOUND',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create album (Admin)' })
  @ApiResponse({ status: 201, description: 'Album created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiBearerAuth()
  async createAlbum(
    @Res() response: Response,
    @Body() data: CreateMediaAlbumDto
  ): Promise<void> {
    try {
      const album = await this.mediaAlbumService.createAlbum(data);
      
      const apiResponse = ApiResponseBuilder.success(album);

      response.status(201).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'ALBUM_CREATION_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update album (Admin)' })
  @ApiResponse({ status: 200, description: 'Album updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Album not found' })
  @ApiParam({ name: 'id', description: 'Album ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiBearerAuth()
  async updateAlbum(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() data: UpdateMediaAlbumDto
  ): Promise<void> {
    try {
      const album = await this.mediaAlbumService.updateAlbum(id, data);
      
      const apiResponse = ApiResponseBuilder.success(album);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 400;
      const apiResponse = ApiResponseBuilder.error(
        'ALBUM_UPDATE_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete album (Admin)' })
  @ApiResponse({ status: 200, description: 'Album deleted successfully' })
  @ApiResponse({ status: 404, description: 'Album not found' })
  @ApiParam({ name: 'id', description: 'Album ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  async deleteAlbum(
    @Res() response: Response,
    @Param('id') id: string
  ): Promise<void> {
    try {
      await this.mediaAlbumService.deleteAlbum(id);
      
      const apiResponse = ApiResponseBuilder.success({ message: 'Album deleted successfully' });

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'ALBUM_DELETION_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Post(':albumId/media/:mediaId')
  @ApiOperation({ summary: 'Add media to album (Admin)' })
  @ApiResponse({ status: 200, description: 'Media added to album successfully' })
  @ApiResponse({ status: 404, description: 'Album or media not found' })
  @ApiParam({ name: 'albumId', description: 'Album ID' })
  @ApiParam({ name: 'mediaId', description: 'Media ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiBearerAuth()
  async addMediaToAlbum(
    @Res() response: Response,
    @Param('albumId') albumId: string,
    @Param('mediaId') mediaId: string
  ): Promise<void> {
    try {
      await this.mediaAlbumService.addMediaToAlbum(albumId, mediaId);
      
      const apiResponse = ApiResponseBuilder.success({ message: 'Media added to album successfully' });

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'ADD_MEDIA_TO_ALBUM_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Delete(':albumId/media/:mediaId')
  @ApiOperation({ summary: 'Remove media from album (Admin)' })
  @ApiResponse({ status: 200, description: 'Media removed from album successfully' })
  @ApiResponse({ status: 404, description: 'Album or media not found' })
  @ApiParam({ name: 'albumId', description: 'Album ID' })
  @ApiParam({ name: 'mediaId', description: 'Media ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiBearerAuth()
  async removeMediaFromAlbum(
    @Res() response: Response,
    @Param('albumId') albumId: string,
    @Param('mediaId') mediaId: string
  ): Promise<void> {
    try {
      await this.mediaAlbumService.removeMediaFromAlbum(albumId, mediaId);
      
      const apiResponse = ApiResponseBuilder.success({ message: 'Media removed from album successfully' });

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'REMOVE_MEDIA_FROM_ALBUM_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Put(':albumId/reorder')
  @ApiOperation({ summary: 'Reorder media in album (Admin)' })
  @ApiResponse({ status: 200, description: 'Media reordered successfully' })
  @ApiResponse({ status: 404, description: 'Album not found' })
  @ApiParam({ name: 'albumId', description: 'Album ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiBearerAuth()
  async reorderMediaInAlbum(
    @Res() response: Response,
    @Param('albumId') albumId: string,
    @Body() data: { mediaIds: string[] }
  ): Promise<void> {
    try {
      await this.mediaAlbumService.reorderMediaInAlbum(albumId, data.mediaIds);
      
      const apiResponse = ApiResponseBuilder.success({ message: 'Media reordered successfully' });

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'REORDER_MEDIA_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get(':id/export')
  @ApiOperation({ summary: 'Export album (Admin)' })
  @ApiResponse({ status: 200, description: 'Album exported successfully' })
  @ApiResponse({ status: 404, description: 'Album not found' })
  @ApiParam({ name: 'id', description: 'Album ID' })
  @ApiQuery({ name: 'format', required: false, type: String })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiBearerAuth()
  async exportAlbum(
    @Res() response: Response,
    @Param('id') id: string,
    @Query('format') format: 'json' | 'zip' = 'json'
  ): Promise<void> {
    try {
      const buffer = await this.mediaAlbumService.exportAlbum(id, format);
      
      const contentType = format === 'json' ? 'application/json' : 'application/zip';
      const filename = `album-${id}.${format}`;
      
      response.setHeader('Content-Type', contentType);
      response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      response.send(buffer);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'ALBUM_EXPORT_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get('admin/statistics')
  @ApiOperation({ summary: 'Get album statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiBearerAuth()
  async getAlbumStatistics(
    @Res() response: Response
  ): Promise<void> {
    try {
      const statistics = await this.mediaAlbumService.getAlbumStatistics();
      
      const apiResponse = ApiResponseBuilder.success(statistics);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'ALBUM_STATISTICS_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }
} 