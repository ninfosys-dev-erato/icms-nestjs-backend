import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { MediaRepository } from '../repositories/media.repository';
import { FileStorageService } from '../../../common/services/file-storage/interfaces/file-storage.interface';
import { 
  CreateMediaDto, 
  UpdateMediaDto, 
  MediaResponseDto,
  MediaQueryDto,
  MediaStatistics,
  MediaProcessingOptions,
  ValidationResult,
  ValidationError,
  BulkOperationResult,
  BulkCreateMediaDto,
  BulkUpdateMediaDto,
  MediaType
} from '../dto/media.dto';
import { TranslatableEntityHelper } from '../../../common/types/translatable.entity';

@Injectable()
export class MediaService {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async getMediaById(id: string): Promise<MediaResponseDto> {
    const media = await this.mediaRepository.findById(id);
    
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    return this.transformToResponseDto(media);
  }

  async getAllMedia(query?: MediaQueryDto): Promise<{
    data: MediaResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const result = await this.mediaRepository.findAll(query || {});
    
    return {
      data: result.data.map(media => this.transformToResponseDto(media)),
      pagination: result.pagination,
    };
  }

  async getMediaByType(mediaType: MediaType, query?: MediaQueryDto): Promise<{
    data: MediaResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const result = await this.mediaRepository.findByType(mediaType, query || {});
    
    return {
      data: result.data.map(media => this.transformToResponseDto(media)),
      pagination: result.pagination,
    };
  }

  async getMediaByAlbum(albumId: string, query?: MediaQueryDto): Promise<{
    data: MediaResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const result = await this.mediaRepository.findByAlbum(albumId, query || {});
    
    return {
      data: result.data.map(media => this.transformToResponseDto(media)),
      pagination: result.pagination,
    };
  }

  async searchMedia(searchTerm: string, query?: MediaQueryDto): Promise<{
    data: MediaResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const result = await this.mediaRepository.search(searchTerm, query || {});
    
    return {
      data: result.data.map(media => this.transformToResponseDto(media)),
      pagination: result.pagination,
    };
  }

  async uploadMedia(file: Express.Multer.File, metadata?: Partial<CreateMediaDto>): Promise<MediaResponseDto> {
    const validation = await this.validateFile(file);
    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'File validation failed',
        errors: validation.errors,
      });
    }

    // Determine media type
    const mediaType = this.determineMediaType(file.mimetype);
    
    // Generate storage key and upload
    const storageKey = this.fileStorageService.generateKey('media', file.originalname);
    const uploadResult = await this.fileStorageService.upload(
      storageKey,
      file.buffer,
      file.mimetype,
      {
        originalName: file.originalname,
        mediaType: mediaType.toString(),
      }
    );
    
    // Create media record
    const mediaData: CreateMediaDto = {
      fileName: uploadResult.key,
      originalName: file.originalname,
      filePath: uploadResult.key,
      fileSize: uploadResult.size,
      mimeType: uploadResult.mimeType,
      mediaType,
      altText: metadata?.altText,
      caption: metadata?.caption,
      width: metadata?.width,
      height: metadata?.height,
      duration: metadata?.duration,
      isActive: metadata?.isActive === true || String(metadata?.isActive) === 'true' || metadata?.isActive === undefined ? true : false,
    };

    const media = await this.mediaRepository.create(mediaData);
    return this.transformToResponseDto(media);
  }

  async updateMedia(id: string, data: UpdateMediaDto): Promise<MediaResponseDto> {
    const validation = await this.validateMedia(data);
    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const media = await this.mediaRepository.update(id, data);
    return this.transformToResponseDto(media);
  }

  async deleteMedia(id: string): Promise<void> {
    const media = await this.mediaRepository.findById(id);
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Delete from storage
    await this.fileStorageService.delete(media.filePath);
    
    // Delete from database
    await this.mediaRepository.delete(id);
  }

  async processMedia(id: string, options: MediaProcessingOptions): Promise<MediaResponseDto> {
    const media = await this.mediaRepository.findById(id);
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // TODO: Implement actual media processing
    // This would include image resizing, optimization, thumbnail generation, etc.
    
    return this.transformToResponseDto(media);
  }

  async generateThumbnail(id: string, width: number, height: number): Promise<string> {
    const media = await this.mediaRepository.findById(id);
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    if (media.mediaType !== MediaType.IMAGE) {
      throw new BadRequestException('Thumbnails can only be generated for images');
    }

    // TODO: Implement actual thumbnail generation
    return `https://cdn.example.com/thumbnails/${media.fileName}`;
  }

  async validateFile(file: Express.Multer.File): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      errors.push({
        field: 'file',
        message: 'File size exceeds 10MB limit',
        code: 'FILE_TOO_LARGE',
      });
    }

    // Check file type
    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
      'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      errors.push({
        field: 'file',
        message: 'File type not allowed',
        code: 'INVALID_FILE_TYPE',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async validateMedia(data: CreateMediaDto | UpdateMediaDto): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Validate altText if provided
    if ('altText' in data && data.altText) {
      const altTextErrors = TranslatableEntityHelper.validate(data.altText, {
        en: { required: false, minLength: 1, maxLength: 255 },
        ne: { required: false, minLength: 1, maxLength: 255 },
      });
      altTextErrors.forEach(error => {
        errors.push({
          field: 'altText',
          message: error,
          code: 'VALIDATION_ERROR',
        });
      });
    }

    // Validate caption if provided
    if ('caption' in data && data.caption) {
      const captionErrors = TranslatableEntityHelper.validate(data.caption, {
        en: { required: false, minLength: 1, maxLength: 1000 },
        ne: { required: false, minLength: 1, maxLength: 1000 },
      });
      captionErrors.forEach(error => {
        errors.push({
          field: 'caption',
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

  async getMediaStatistics(): Promise<MediaStatistics> {
    return this.mediaRepository.getStatistics();
  }

  async getMediaUrl(id: string, variant?: string): Promise<string> {
    const media = await this.mediaRepository.findById(id);
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    if (variant === 'thumbnail') {
      return this.generateThumbnail(id, 300, 300);
    }

    return this.fileStorageService.getUrl(media.filePath);
  }

  async bulkDelete(ids: string[]): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const id of ids) {
      try {
        await this.deleteMedia(id);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to delete ${id}: ${error.message}`);
      }
    }

    return result;
  }

  async bulkUpdate(ids: string[], data: UpdateMediaDto): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const id of ids) {
      try {
        await this.updateMedia(id, data);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to update ${id}: ${error.message}`);
      }
    }

    return result;
  }

  async bulkCreate(data: BulkCreateMediaDto): Promise<MediaResponseDto[]> {
    const media = await this.mediaRepository.bulkCreate(data);
    return media.map(item => this.transformToResponseDto(item));
  }

  private determineMediaType(mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) {
      return MediaType.IMAGE;
    } else if (mimeType.startsWith('video/')) {
      return MediaType.VIDEO;
    } else if (mimeType.startsWith('audio/')) {
      return MediaType.AUDIO;
    } else {
      return MediaType.DOCUMENT;
    }
  }

  private transformToResponseDto(media: any): MediaResponseDto {
    return {
      id: media.id,
      fileName: media.fileName,
      originalName: media.originalName,
      filePath: media.filePath,
      fileSize: media.fileSize,
      mimeType: media.mimeType,
      mediaType: media.mediaType,
      altText: media.altText,
      caption: media.caption,
      width: media.width,
      height: media.height,
      duration: media.duration,
      isActive: media.isActive,
      url: `https://cdn.example.com/${media.filePath}`, // Simplified for now
      thumbnailUrl: media.mediaType === MediaType.IMAGE ? 
        `https://cdn.example.com/thumbnails/${media.fileName}` : undefined,
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
      albums: media.albums?.map((albumRelation: any) => ({
        id: albumRelation.mediaAlbum.id,
        name: albumRelation.mediaAlbum.name,
        description: albumRelation.mediaAlbum.description,
        isActive: albumRelation.mediaAlbum.isActive,
        createdAt: albumRelation.mediaAlbum.createdAt,
        updatedAt: albumRelation.mediaAlbum.updatedAt,
        mediaCount: 0, // TODO: Calculate actual count
        media: [],
      })) || [],
    };
  }
} 