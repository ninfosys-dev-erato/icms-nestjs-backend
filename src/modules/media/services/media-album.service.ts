import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { MediaAlbumRepository } from '../repositories/media-album.repository';
import { 
  CreateMediaAlbumDto, 
  UpdateMediaAlbumDto, 
  MediaAlbumResponseDto,
  AlbumStatistics,
  ValidationResult,
  ValidationError
} from '../dto/media.dto';
import { TranslatableEntityHelper } from '../../../common/types/translatable.entity';

@Injectable()
export class MediaAlbumService {
  constructor(private readonly mediaAlbumRepository: MediaAlbumRepository) {}

  async getAlbumById(id: string): Promise<MediaAlbumResponseDto> {
    const album = await this.mediaAlbumRepository.findById(id);
    
    if (!album) {
      throw new NotFoundException('Album not found');
    }

    return this.transformToResponseDto(album);
  }

  async getAllAlbums(): Promise<MediaAlbumResponseDto[]> {
    const albums = await this.mediaAlbumRepository.findAll();
    return albums.map(album => this.transformToResponseDto(album));
  }

  async getActiveAlbums(): Promise<MediaAlbumResponseDto[]> {
    const albums = await this.mediaAlbumRepository.findActive();
    return albums.map(album => this.transformToResponseDto(album));
  }

  async createAlbum(data: CreateMediaAlbumDto): Promise<MediaAlbumResponseDto> {
    const validation = await this.validateAlbum(data);
    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const album = await this.mediaAlbumRepository.create(data);
    return this.transformToResponseDto(album);
  }

  async updateAlbum(id: string, data: UpdateMediaAlbumDto): Promise<MediaAlbumResponseDto> {
    const validation = await this.validateAlbum(data);
    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const album = await this.mediaAlbumRepository.update(id, data);
    return this.transformToResponseDto(album);
  }

  async deleteAlbum(id: string): Promise<void> {
    const album = await this.mediaAlbumRepository.findById(id);
    if (!album) {
      throw new NotFoundException('Album not found');
    }

    await this.mediaAlbumRepository.delete(id);
  }

  async addMediaToAlbum(albumId: string, mediaId: string): Promise<void> {
    const album = await this.mediaAlbumRepository.findById(albumId);
    if (!album) {
      throw new NotFoundException('Album not found');
    }

    // TODO: Validate media exists
    // const media = await this.mediaRepository.findById(mediaId);
    // if (!media) {
    //   throw new NotFoundException('Media not found');
    // }

    await this.mediaAlbumRepository.addMediaToAlbum(albumId, mediaId);
  }

  async removeMediaFromAlbum(albumId: string, mediaId: string): Promise<void> {
    const album = await this.mediaAlbumRepository.findById(albumId);
    if (!album) {
      throw new NotFoundException('Album not found');
    }

    await this.mediaAlbumRepository.removeMediaFromAlbum(albumId, mediaId);
  }

  async reorderMediaInAlbum(albumId: string, mediaIds: string[]): Promise<void> {
    const album = await this.mediaAlbumRepository.findById(albumId);
    if (!album) {
      throw new NotFoundException('Album not found');
    }

    // TODO: Validate all media IDs exist
    // const media = await this.mediaRepository.findByIds(mediaIds);
    // if (media.length !== mediaIds.length) {
    //   throw new BadRequestException('Some media items not found');
    // }

    await this.mediaAlbumRepository.reorderMediaInAlbum(albumId, mediaIds);
  }

  async validateAlbum(data: CreateMediaAlbumDto | UpdateMediaAlbumDto): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Validate name if provided
    if ('name' in data && data.name) {
      const nameErrors = TranslatableEntityHelper.validate(data.name, {
        en: { required: true, minLength: 1, maxLength: 255 },
        ne: { required: true, minLength: 1, maxLength: 255 },
      });
      nameErrors.forEach(error => {
        errors.push({
          field: 'name',
          message: error,
          code: 'VALIDATION_ERROR',
        });
      });
    }

    // Validate description if provided
    if ('description' in data && data.description) {
      const descriptionErrors = TranslatableEntityHelper.validate(data.description, {
        en: { required: false, minLength: 1, maxLength: 1000 },
        ne: { required: false, minLength: 1, maxLength: 1000 },
      });
      descriptionErrors.forEach(error => {
        errors.push({
          field: 'description',
          message: error,
          code: 'VALIDATION_ERROR',
        });
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async getAlbumStatistics(): Promise<AlbumStatistics> {
    return this.mediaAlbumRepository.getStatistics();
  }

  async exportAlbum(id: string, format: 'json' | 'zip'): Promise<Buffer> {
    const album = await this.mediaAlbumRepository.findById(id);
    if (!album) {
      throw new NotFoundException('Album not found');
    }

    // TODO: Implement actual export functionality
    if (format === 'json') {
      const albumData = this.transformToResponseDto(album);
      return Buffer.from(JSON.stringify(albumData, null, 2));
    } else {
      // TODO: Implement ZIP export with actual media files
      throw new Error('ZIP export not implemented yet');
    }
  }

  private transformToResponseDto(album: any): MediaAlbumResponseDto {
    return {
      id: album.id,
      name: album.name,
      description: album.description,
      isActive: album.isActive,
      createdAt: album.createdAt,
      updatedAt: album.updatedAt,
      mediaCount: album.media?.length || 0,
      media: album.media?.map((mediaRelation: any) => ({
        id: mediaRelation.media.id,
        fileName: mediaRelation.media.fileName,
        originalName: mediaRelation.media.originalName,
        filePath: mediaRelation.media.filePath,
        fileSize: mediaRelation.media.fileSize,
        mimeType: mediaRelation.media.mimeType,
        mediaType: mediaRelation.media.mediaType,
        altText: mediaRelation.media.altText,
        caption: mediaRelation.media.caption,
        width: mediaRelation.media.width,
        height: mediaRelation.media.height,
        duration: mediaRelation.media.duration,
        isActive: mediaRelation.media.isActive,
        url: `https://cdn.example.com/${mediaRelation.media.filePath}`,
        thumbnailUrl: mediaRelation.media.mediaType === 'IMAGE' ? 
          `https://cdn.example.com/thumbnails/${mediaRelation.media.fileName}` : undefined,
        createdAt: mediaRelation.media.createdAt,
        updatedAt: mediaRelation.media.updatedAt,
        albums: [],
      })) || [],
    };
  }
} 