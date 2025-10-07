import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { MediaRepository } from '../repositories/media.repository';
import { FileStorageService } from '../../../common/services/file-storage/interfaces/file-storage.interface';
import { 
  CreateMediaDto, 
  UpdateMediaDto, 
  MediaResponseDto,
  MediaQueryDto,
  MediaSearchDto,
  MediaStatisticsDto,
  MediaLibraryDto,
  MediaAlbumQueryDto,
  MediaAlbumResponseDto,
  CreateMediaAlbumDto,
  UpdateMediaAlbumDto,
  AlbumMediaQueryDto,
  MediaCategory,
  MediaFolder,
  FILE_TYPE_CONFIG,
  FileUploadValidationDto,
  ValidationResultDto,
  BulkOperationResultDto,
  UploadResponseDto,
  BulkUploadResponseDto,
  BulkUploadMetadataDto,
  MediaProcessingOptionsDto,
  MediaUrlDto,
  MediaImportDto,
  MediaExportDto
} from '../dto/media.dto';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async uploadMedia(
    file: Express.Multer.File, 
    metadata: FileUploadValidationDto,
    userId: string
  ): Promise<UploadResponseDto> {
    try {
      console.log('🚀 MediaService: Starting upload process');
      console.log('  File:', file.originalname, 'Size:', file.size, 'Type:', file.mimetype);
      console.log('  Metadata:', metadata);
      console.log('  User ID:', userId);

      // Validate file
      console.log('🔍 MediaService: Validating file...');
      const validation = await this.validateFile(file, metadata.folder);
      if (!validation.isValid) {
        console.error('❌ MediaService: File validation failed:', validation.errors);
        throw new BadRequestException({
          message: 'File validation failed',
          errors: validation.errors,
        });
      }
      console.log('✅ MediaService: File validation passed');

      // Check for duplicates
      console.log('🔍 MediaService: Checking for duplicates...');
      const duplicates = await this.mediaRepository.findDuplicates(file.originalname, file.size);
      if (duplicates.length > 0) {
        console.log('⚠️ MediaService: Duplicate file detected, returning existing media');
        this.logger.warn(`Duplicate file detected: ${file.originalname}`);
        // Return existing media instead of creating duplicate
        // TEMPORARILY DISABLED FOR TESTING - Force upload to Backblaze
        // return {
        //   success: true,
        //   data: duplicates[0],
        //   message: 'File already exists in the system',
        // };
        console.log('🔄 MediaService: Duplicate detected but forcing upload for testing');
      }
      console.log('✅ MediaService: No duplicates found or forcing upload');

      // Determine category based on MIME type
      const category = this.determineCategory(file.mimetype);
      console.log('📂 MediaService: Category determined:', category);

      // Generate unique filename
      const fileName = this.generateFileName(file.originalname, metadata.folder);
      console.log('📝 MediaService: Generated filename:', fileName);

      // Upload to Backblaze B2
      console.log('☁️ MediaService: Starting Backblaze upload...');
      console.log('  File key:', fileName);
      console.log('  Buffer size:', file.buffer.length);
      console.log('  MIME type:', file.mimetype);
      
      const uploadResult = await this.fileStorageService.upload(
        fileName,
        file.buffer,
        file.mimetype,
        {
          originalName: file.originalname,
          uploadedBy: userId,
          folder: metadata.folder,
          category: category,
          altText: metadata.altText,
          title: metadata.title,
          description: metadata.description,
          ...(metadata.tags && metadata.tags.length > 0 && { tags: metadata.tags.join('-') }),
          isPublic: metadata.isPublic?.toString() || 'true',
        }
      );

      console.log('✅ MediaService: Backblaze upload successful!');
      console.log('  Upload result:', {
        key: uploadResult.key,
        url: uploadResult.url,
        size: uploadResult.size,
        etag: uploadResult.etag
      });

      // Process media if it's an image
      let processedMetadata = null;
      if (category === MediaCategory.IMAGE) {
        console.log('🖼️ MediaService: Processing image metadata...');
        processedMetadata = await this.processImageMetadata(file.buffer);
        console.log('✅ MediaService: Image metadata processed:', processedMetadata);
      }

      // Create media record
      console.log('💾 MediaService: Creating database record...');
      const createMediaDto: CreateMediaDto = {
        fileName: uploadResult.key,
        originalName: file.originalname,
        url: uploadResult.url,
        fileId: uploadResult.etag || '',
        size: file.size,
        contentType: file.mimetype,
        uploadedBy: userId,
        folder: metadata.folder,
        category: category,
        altText: metadata.altText,
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags || [],
        isPublic: metadata.isPublic ?? true,
        isActive: true,
        metadata: processedMetadata,
      };

      const media = await this.mediaRepository.create(createMediaDto);
      console.log('✅ MediaService: Database record created:', media.id);

      this.logger.log(`Media uploaded successfully: ${media.id} - ${file.originalname}`);

      return {
        success: true,
        data: media,
        message: 'File uploaded successfully',
      };
    } catch (error) {
      console.error('❌ MediaService: Upload failed:', error);
      console.error('  Error message:', error.message);
      console.error('  Error stack:', error.stack);
      this.logger.error(`Failed to upload media: ${error.message}`);
      throw error;
    }
  }

  async replaceMediaFile(
    mediaId: string,
    file: Express.Multer.File,
    metadata: Partial<FileUploadValidationDto & UpdateMediaDto>,
    userId: string
  ): Promise<MediaResponseDto> {
    try {
      this.logger.log(`Replacing media file for ${mediaId}`);
      const existing = await this.mediaRepository.findById(mediaId);
      if (!existing) {
        throw new NotFoundException('Media not found');
      }

      const targetFolder = metadata.folder || existing.folder || MediaFolder.GENERAL;

      // Validate new file against folder
      const validation = await this.validateFile(file, targetFolder);
      if (!validation.isValid) {
        throw new BadRequestException({
          message: 'File validation failed',
          errors: validation.errors,
        });
      }

      // Upload new file to storage
      const category = this.determineCategory(file.mimetype);
      const newFileName = this.generateFileName(file.originalname, targetFolder);
      const uploadResult = await this.fileStorageService.upload(
        newFileName,
        file.buffer,
        file.mimetype,
        {
          originalName: file.originalname,
          uploadedBy: userId,
          folder: targetFolder,
          category,
          altText: metadata.altText ?? existing.altText,
          title: metadata.title ?? existing.title,
          description: metadata.description ?? existing.description,
          ...(metadata.tags && metadata.tags.length > 0 && { tags: metadata.tags.join('-') }),
          isPublic: (metadata.isPublic ?? existing.isPublic).toString(),
        }
      );

      // Delete old file from storage (best-effort)
      try {
        await this.fileStorageService.delete(existing.fileName);
      } catch (err) {
        this.logger.warn(`Failed to delete old stored file: ${err.message}`);
      }

      // Build update payload
      const updatePayload: UpdateMediaDto = {
        altText: metadata.altText ?? existing.altText,
        title: metadata.title ?? existing.title,
        description: metadata.description ?? existing.description,
        tags: (metadata.tags as string[] | undefined) ?? existing.tags,
        isPublic: metadata.isPublic ?? existing.isPublic,
        isActive: metadata.isActive ?? existing.isActive,
        metadata: {
          ...(existing.metadata || {}),
          replacedAt: new Date().toISOString(),
          previousFileName: existing.fileName,
          previousUrl: existing.url,
          newFileName: uploadResult.key,
          newUrl: uploadResult.url,
        },
      };

      // Directly update base file fields via repository prisma call is not exposed;
      // we need a dedicated repository method, but we can compose by deleting+creating
      // or extend repository to update core fields. We'll extend repository to support it.

      return await this.mediaRepository.updateCoreFileFields(mediaId, {
        fileName: uploadResult.key,
        originalName: file.originalname,
        url: uploadResult.url,
        fileId: uploadResult.etag || existing.fileId,
        size: file.size,
        contentType: file.mimetype,
        folder: targetFolder,
        category,
      }, updatePayload);
    } catch (error) {
      this.logger.error(`Failed to replace media file for ${mediaId}: ${error.message}`);
      throw error;
    }
  }

  async bulkUpload(
    files: Express.Multer.File[],
    metadata: BulkUploadMetadataDto,
    userId: string
  ): Promise<BulkUploadResponseDto> {
    const uploaded: MediaResponseDto[] = [];
    const failed: Array<{ originalName: string; error: string }> = [];

    for (const file of files) {
      try {
        const perFileMetadata: FileUploadValidationDto = {
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          folder: metadata.folder,
          altText: metadata.altText,
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags,
          isPublic: metadata.isPublic,
        };

        const result = await this.uploadMedia(file, perFileMetadata, userId);
        uploaded.push(result.data);
      } catch (error) {
        failed.push({
          originalName: file.originalname,
          error: error.message,
        });
      }
    }

    return {
      success: failed.length === 0,
      data: {
        uploaded,
        failed,
      },
      message: `Uploaded ${uploaded.length} files, ${failed.length} failed`,
    };
  }

  async getMediaById(id: string): Promise<MediaResponseDto> {
    const media = await this.mediaRepository.findById(id);
    
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    try {
      const presignedUrl = await this.fileStorageService.generatePresignedUrl(media.fileName, 'get', 86400);
      return { ...media, presignedUrl };
    } catch {
      return media;
    }
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
    const result = this.mediaRepository.findAll(query || {});
    const { data, pagination } = await result;
    const enriched = await Promise.all(
      data.map(async (item) => {
        try {
          const presignedUrl = await this.fileStorageService.generatePresignedUrl(item.fileName, 'get', 86400);
          return { ...item, presignedUrl };
        } catch {
          return item;
        }
      })
    );
    return { data: enriched, pagination };
  }

  async getMediaByCategory(category: MediaCategory, query?: MediaQueryDto): Promise<{
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
    const result = await this.mediaRepository.findByCategory(category, query || {});
    const enriched = await Promise.all(
      result.data.map(async (item) => {
        try {
          const presignedUrl = await this.fileStorageService.generatePresignedUrl(item.fileName, 'get', 86400);
          return { ...item, presignedUrl };
        } catch {
          return item;
        }
      })
    );
    return { data: enriched, pagination: result.pagination };
  }

  async getMediaByFolder(folder: string, query?: MediaQueryDto): Promise<{
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
    const result = await this.mediaRepository.findByFolder(folder, query || {});
    const enriched = await Promise.all(
      result.data.map(async (item) => {
        try {
          const presignedUrl = await this.fileStorageService.generatePresignedUrl(item.fileName, 'get', 86400);
          return { ...item, presignedUrl };
        } catch {
          return item;
        }
      })
    );
    return { data: enriched, pagination: result.pagination };
  }

  async getPublicGalleryPhotos(query?: MediaQueryDto): Promise<{
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
    // Get public, active photos from general folder
    const result = await this.mediaRepository.findByFolder('general', {
      ...query,
      isPublic: true,
      isActive: true,
      category: MediaCategory.IMAGE
    });
    
    // Generate presigned URLs for all photos
    const enriched = await Promise.all(
      result.data.map(async (item) => {
        try {
          const presignedUrl = await this.fileStorageService.generatePresignedUrl(item.fileName, 'get', 86400);
          return { ...item, presignedUrl };
        } catch (error) {
          this.logger.warn(`Failed to generate presigned URL for media ${item.id}: ${error.message}`);
          return item;
        }
      })
    );
    
    return { data: enriched, pagination: result.pagination };
  }

  async getMediaByUser(userId: string, query?: MediaQueryDto): Promise<{
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
    const result = await this.mediaRepository.findByUser(userId, query || {});
    const enriched = await Promise.all(
      result.data.map(async (item) => {
        try {
          const presignedUrl = await this.fileStorageService.generatePresignedUrl(item.fileName, 'get', 86400);
          return { ...item, presignedUrl };
        } catch {
          return item;
        }
      })
    );
    return { data: enriched, pagination: result.pagination };
  }

  async searchMedia(searchDto: MediaSearchDto): Promise<{
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
    const result = await this.mediaRepository.search(searchDto);
    const enriched = await Promise.all(
      result.data.map(async (item) => {
        try {
          const presignedUrl = await this.fileStorageService.generatePresignedUrl(item.fileName, 'get', 86400);
          return { ...item, presignedUrl };
        } catch {
          return item;
        }
      })
    );
    return { data: enriched, pagination: result.pagination };
  }

  async updateMedia(id: string, data: UpdateMediaDto): Promise<MediaResponseDto> {
    const media = await this.mediaRepository.findById(id);
    
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    return this.mediaRepository.update(id, data);
  }

  async deleteMedia(id: string): Promise<void> {
    const media = await this.mediaRepository.findById(id);
    
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Delete from Backblaze B2
    try {
      await this.fileStorageService.delete(media.fileName);
    } catch (error) {
      this.logger.warn(`Failed to delete file from storage: ${error.message}`);
    }

    // Delete from database
    await this.mediaRepository.delete(id);
  }

  async bulkDelete(ids: string[]): Promise<BulkOperationResultDto> {
    const mediaFiles = await Promise.all(
      ids.map(id => this.mediaRepository.findById(id))
    );

    const validIds = mediaFiles.filter(m => m !== null).map(m => m!.id);
    const invalidIds = ids.filter(id => !validIds.includes(id));

    if (validIds.length === 0) {
      return {
        success: false,
        processed: 0,
        succeeded: 0,
        failed: ids.length,
        errors: invalidIds.map(id => ({ id, error: 'Media not found' })),
      };
    }

    // Delete from Backblaze B2
    const deletePromises = mediaFiles
      .filter(m => m !== null)
      .map(async (media) => {
        try {
          await this.fileStorageService.delete(media!.fileName);
        } catch (error) {
          this.logger.warn(`Failed to delete file from storage: ${error.message}`);
        }
      });

    await Promise.all(deletePromises);

    // Delete from database
    const result = await this.mediaRepository.bulkDelete(validIds);

    return {
      success: result.failed === 0,
      processed: ids.length,
      succeeded: result.success,
      failed: result.failed + invalidIds.length,
      errors: [
        ...result.errors.map(error => ({ id: '', error })),
        ...invalidIds.map(id => ({ id, error: 'Media not found' })),
      ],
    };
  }

  async bulkUpdate(ids: string[], data: UpdateMediaDto): Promise<BulkOperationResultDto> {
    const result = await this.mediaRepository.bulkUpdate(ids, data);

    return {
      success: result.failed === 0,
      processed: ids.length,
      succeeded: result.success,
      failed: result.failed,
      errors: result.errors.map(error => ({ id: '', error })),
    };
  }

  async getMediaStatistics(): Promise<MediaStatisticsDto> {
    return this.mediaRepository.getStatistics();
  }

  async getMediaLibrary(): Promise<MediaLibraryDto> {
    const lib = await this.mediaRepository.getLibrary();
    // Enrich recent and popular with presigned URLs for immediate display
    const enrich = async (items: MediaResponseDto[]) => Promise.all(items.map(async (item) => {
      try {
        const presignedUrl = await this.fileStorageService.generatePresignedUrl(item.fileName, 'get', 86400);
        return { ...item, presignedUrl };
      } catch {
        return item;
      }
    }));

    const [recent, popular] = await Promise.all([
      enrich(lib.recent),
      enrich(lib.popular),
    ]);

    return { ...lib, recent, popular };
  }

  async getAlbums(query: MediaAlbumQueryDto): Promise<{
    data: MediaAlbumResponseDto[];
    pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
  }> {
    const result = await this.mediaRepository.findAlbums(query);
    // Map album to response with mediaCount and coverMedia (first media relation if any)
    const data: MediaAlbumResponseDto[] = await Promise.all(result.data.map(async (album: any) => {
      const mediaCount = Array.isArray(album.media) ? album.media.length : 0;
      let coverMedia: MediaResponseDto & { presignedUrl?: string } | undefined;
      if (mediaCount > 0) {
        // find first media detail via Media table
        try {
          const mam = album.media[0];
          const media = await this.mediaRepository.findById(mam.mediaId);
          if (media) {
            try {
              const presignedUrl = await this.fileStorageService.generatePresignedUrl(media.fileName, 'get', 86400);
              coverMedia = { ...media, presignedUrl };
            } catch {
              coverMedia = media;
            }
          }
        } catch {}
      }
      return {
        id: album.id,
        name: album.name,
        description: album.description,
        isActive: album.isActive,
        createdAt: album.createdAt,
        updatedAt: album.updatedAt,
        mediaCount,
        coverMedia,
      };
    }));

    return { data, pagination: result.pagination };
  }

  async createAlbum(dto: CreateMediaAlbumDto) {
    return this.mediaRepository.createAlbum({ name: dto.name, description: dto.description, isActive: dto.isActive });
  }

  async updateAlbum(id: string, dto: UpdateMediaAlbumDto) {
    return this.mediaRepository.updateAlbum(id, dto);
  }

  async deleteAlbum(id: string) {
    await this.mediaRepository.deleteAlbum(id);
    return { message: 'Album deleted successfully' };
  }

  async attachMediaToAlbum(albumId: string, mediaIds: string[]) {
    return this.mediaRepository.attachMediaToAlbum(albumId, mediaIds);
  }

  async detachMediaFromAlbum(albumId: string, mediaId: string) {
    return this.mediaRepository.detachMediaFromAlbum(albumId, mediaId);
  }

  async getAlbumMedia(albumId: string, query: AlbumMediaQueryDto) {
    const result = await this.mediaRepository.getAlbumMedia(albumId, query);
    const enriched = await Promise.all(result.data.map(async (item) => {
      try {
        const presignedUrl = await this.fileStorageService.generatePresignedUrl(item.fileName, 'get', 86400);
        return { ...item, presignedUrl };
      } catch {
        return item;
      }
    }));
    return { data: enriched, pagination: result.pagination };
  }

  async getMediaUrl(mediaUrlDto: MediaUrlDto): Promise<string> {
    const media = await this.mediaRepository.findById(mediaUrlDto.mediaId);
    
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    if (mediaUrlDto.expiresIn) {
      return this.fileStorageService.generatePresignedUrl(
        media.fileName,
        'get',
        mediaUrlDto.expiresIn
      );
    }

    // If no explicit expiration requested, provide a default presigned URL for convenience
    return this.fileStorageService.generatePresignedUrl(
      media.fileName,
      'get',
      86400
    );
  }

  async generatePresignedUrl(
    mediaId: string,
    operation: 'get' | 'put',
    expiresIn?: number
  ): Promise<string> {
    const media = await this.mediaRepository.findById(mediaId);
    
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    return this.fileStorageService.generatePresignedUrl(
      media.fileName,
      operation,
      expiresIn
    );
  }

  async processMedia(id: string, options: MediaProcessingOptionsDto): Promise<MediaResponseDto> {
    const media = await this.mediaRepository.findById(id);
    
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    if (media.category !== MediaCategory.IMAGE) {
      throw new BadRequestException('Media processing is only supported for images');
    }

    try {
      // Download the file
      const downloadResult = await this.fileStorageService.download(media.fileName);
      
      // Process the image
      let processedBuffer = downloadResult.buffer;
      
      if (options.resize) {
        processedBuffer = await sharp(processedBuffer)
          .resize(options.resize.width, options.resize.height, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: options.resize.quality || 80 })
          .toBuffer();
      }

      if (options.optimize) {
        processedBuffer = await sharp(processedBuffer)
          .jpeg({ quality: 80, progressive: true })
          .toBuffer();
      }

      // Upload processed image
      const processedFileName = this.generateProcessedFileName(media.fileName, options);
      const uploadResult = await this.fileStorageService.upload(
        processedFileName,
        processedBuffer,
        'image/jpeg',
        {
          originalName: media.originalName,
          processed: 'true',
        }
      );

      // Update media record
      const updateData: UpdateMediaDto = {
        metadata: {
          ...media.metadata,
          processed: {
            fileName: processedFileName,
            url: uploadResult.url,
            options,
            processedAt: new Date().toISOString(),
          },
        },
      };

      return this.mediaRepository.update(id, updateData);
    } catch (error) {
      this.logger.error(`Failed to process media ${id}: ${error.message}`);
      throw error;
    }
  }

  async importMedia(importDto: MediaImportDto, userId: string): Promise<MediaResponseDto> {
    try {
      // Download file from URL
      const response = await fetch(importDto.sourceUrl);
      if (!response.ok) {
        throw new BadRequestException('Failed to download file from URL');
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const originalName = path.basename(importDto.sourceUrl) || 'imported-file';

      // Validate file
      const validation = await this.validateBuffer(buffer, contentType, importDto.folder);
      if (!validation.isValid) {
        throw new BadRequestException({
          message: 'File validation failed',
          errors: validation.errors,
        });
      }

      // Generate filename
      const fileName = this.generateFileName(originalName, importDto.folder);

      // Upload to Backblaze B2
      const uploadResult = await this.fileStorageService.upload(
        fileName,
        buffer,
        contentType,
        {
          originalName,
          uploadedBy: userId,
          folder: importDto.folder,
          category: importDto.category,
          imported: 'true',
          sourceUrl: importDto.sourceUrl,
        }
      );

      // Create media record
      const createMediaDto: CreateMediaDto = {
        fileName: uploadResult.key,
        originalName,
        url: uploadResult.url,
        fileId: uploadResult.etag || '',
        size: buffer.length,
        contentType,
        uploadedBy: userId,
        folder: importDto.folder,
        category: importDto.category,
        title: importDto.title,
        description: importDto.description,
        tags: importDto.tags || [],
        isPublic: true,
        isActive: true,
        metadata: {
          imported: true,
          sourceUrl: importDto.sourceUrl,
          importedAt: new Date().toISOString(),
        },
      };

      return this.mediaRepository.create(createMediaDto);
    } catch (error) {
      this.logger.error(`Failed to import media: ${error.message}`);
      throw error;
    }
  }

  async exportMedia(exportDto: MediaExportDto): Promise<any> {
    const mediaFiles = await Promise.all(
      exportDto.mediaIds.map(id => this.mediaRepository.findById(id))
    );

    const validMedia = mediaFiles.filter(m => m !== null);

    if (validMedia.length === 0) {
      throw new BadRequestException('No valid media found for export');
    }

    const exportData = validMedia.map(media => {
      const data: any = {
        id: media!.id,
        fileName: media!.fileName,
        originalName: media!.originalName,
        url: media!.url,
        size: media!.size,
        contentType: media!.contentType,
        folder: media!.folder,
        category: media!.category,
        title: media!.title,
        description: media!.description,
        tags: media!.tags,
        isPublic: media!.isPublic,
        isActive: media!.isActive,
        createdAt: media!.createdAt,
        updatedAt: media!.updatedAt,
      };

      if (exportDto.includeMetadata && media!.metadata) {
        data.metadata = media!.metadata;
      }

      if (exportDto.includeUrls) {
        data.downloadUrl = media!.url;
      }

      return data;
    });

    return {
      data: exportData,
      total: exportData.length,
      exportedAt: new Date().toISOString(),
      format: exportDto.format || 'json',
    };
  }

  async cleanupOrphanedMedia(): Promise<{ cleaned: number; errors: string[] }> {
    return this.mediaRepository.cleanupOrphanedMedia();
  }

  private async validateFile(file: Express.Multer.File, folder: string): Promise<ValidationResultDto> {
    const errors: Array<{ field: string; message: string; code: string }> = [];

    // Check file type
    const fileTypeConfig = this.getFileTypeConfig(file.mimetype);
    if (!fileTypeConfig) {
      errors.push({
        field: 'mimetype',
        message: `File type ${file.mimetype} is not supported`,
        code: 'UNSUPPORTED_FILE_TYPE',
      });
    } else {
      // Check file size
      if (file.size > fileTypeConfig.maxSize) {
        errors.push({
          field: 'size',
          message: `File size ${file.size} exceeds maximum allowed size ${fileTypeConfig.maxSize}`,
          code: 'FILE_SIZE_EXCEEDED',
        });
      }

      // Check folder compatibility
      if (!fileTypeConfig.folders.includes(folder)) {
        errors.push({
          field: 'folder',
          message: `Folder ${folder} is not compatible with file type ${file.mimetype}`,
          code: 'INCOMPATIBLE_FOLDER',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private async validateBuffer(buffer: Buffer, contentType: string, folder: string): Promise<ValidationResultDto> {
    const errors: Array<{ field: string; message: string; code: string }> = [];

    // Check file type
    const fileTypeConfig = this.getFileTypeConfig(contentType);
    if (!fileTypeConfig) {
      errors.push({
        field: 'contentType',
        message: `File type ${contentType} is not supported`,
        code: 'UNSUPPORTED_FILE_TYPE',
      });
    } else {
      // Check file size
      if (buffer.length > fileTypeConfig.maxSize) {
        errors.push({
          field: 'size',
          message: `File size ${buffer.length} exceeds maximum allowed size ${fileTypeConfig.maxSize}`,
          code: 'FILE_SIZE_EXCEEDED',
        });
      }

      // Check folder compatibility
      if (!fileTypeConfig.folders.includes(folder)) {
        errors.push({
          field: 'folder',
          message: `Folder ${folder} is not compatible with file type ${contentType}`,
          code: 'INCOMPATIBLE_FOLDER',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private getFileTypeConfig(mimeType: string): any {
    const normalized = (mimeType || '').toLowerCase();
    for (const [, config] of Object.entries(FILE_TYPE_CONFIG)) {
      if (config.types.some((t) => t.toLowerCase() === normalized)) {
        return config;
      }
    }
    // Fallback by MIME family to reduce false negatives
    if (normalized.startsWith('image/')) {
      return FILE_TYPE_CONFIG.images;
    }
    if (normalized.startsWith('video/')) {
      return FILE_TYPE_CONFIG.videos;
    }
    if (normalized.startsWith('audio/')) {
      return FILE_TYPE_CONFIG.audio;
    }
    if (normalized === 'application/pdf' || normalized.includes('word')) {
      return FILE_TYPE_CONFIG.documents;
    }
    return null;
  }

  private determineCategory(mimeType: string): MediaCategory {
    if (mimeType.startsWith('image/')) {
      return MediaCategory.IMAGE;
    } else if (mimeType.startsWith('video/')) {
      return MediaCategory.VIDEO;
    } else if (mimeType.startsWith('audio/')) {
      return MediaCategory.AUDIO;
    } else if (mimeType.startsWith('application/')) {
      return MediaCategory.DOCUMENT;
    } else {
      return MediaCategory.OTHER;
    }
  }

  private generateFileName(originalName: string, folder: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    const cleanBaseName = baseName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    return `${folder}/${timestamp}-${randomString}-${cleanBaseName}${extension}`;
  }

  private generateProcessedFileName(originalFileName: string, options: MediaProcessingOptionsDto): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = '.jpg'; // Always JPEG for processed images
    const baseName = path.basename(originalFileName, path.extname(originalFileName));
    
    let suffix = 'processed';
    if (options.resize) {
      suffix += `-${options.resize.width}x${options.resize.height}`;
    }
    if (options.optimize) {
      suffix += '-optimized';
    }
    
    return `${path.dirname(originalFileName)}/${baseName}-${suffix}-${timestamp}-${randomString}${extension}`;
  }

  private async processImageMetadata(buffer: Buffer): Promise<any> {
    try {
      const metadata = await sharp(buffer).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        space: metadata.space,
        channels: metadata.channels,
        depth: metadata.depth,
        density: metadata.density,
        hasProfile: metadata.hasProfile,
        hasAlpha: metadata.hasAlpha,
      };
    } catch (error) {
      this.logger.warn(`Failed to extract image metadata: ${error.message}`);
      return null;
    }
  }
} 