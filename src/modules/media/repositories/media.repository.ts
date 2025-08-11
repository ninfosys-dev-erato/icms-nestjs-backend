import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { 
  MediaQueryDto, 
  MediaCategory, 
  MediaFolder,
  CreateMediaDto,
  UpdateMediaDto,
  MediaResponseDto,
  MediaSearchDto,
  MediaStatisticsDto,
  MediaLibraryDto
} from '../dto/media.dto';

@Injectable()
export class MediaRepository {
  private readonly logger = new Logger(MediaRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMediaDto): Promise<MediaResponseDto> {
    try {
      const media = await this.prisma.media.create({
        data: {
          fileName: data.fileName,
          originalName: data.originalName,
          url: data.url,
          fileId: data.fileId,
          size: data.size,
          contentType: data.contentType,
          uploadedBy: data.uploadedBy,
          folder: data.folder,
          category: data.category,
          altText: data.altText,
          title: data.title,
          description: data.description,
          tags: data.tags || [],
          isPublic: data.isPublic ?? true,
          isActive: data.isActive ?? true,
          metadata: data.metadata,
        },
      });

      this.logger.debug(`Media created: ${media.id}`);
      return this.transformToResponseDto(media);
    } catch (error) {
      this.logger.error(`Failed to create media: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string): Promise<MediaResponseDto | null> {
    try {
      const media = await this.prisma.media.findUnique({
        where: { id },
      });

      return media ? this.transformToResponseDto(media) : null;
    } catch (error) {
      this.logger.error(`Failed to find media by ID ${id}: ${error.message}`);
      throw error;
    }
  }

  async findAll(query: MediaQueryDto): Promise<{
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
    try {
      const { page = 1, limit = 10, search, category, folder, uploadedBy, tags, isPublic, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = query;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (search) {
        where.OR = [
          { originalName: { contains: search, mode: 'insensitive' } },
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { hasSome: [search] } },
        ];
      }

      if (category) {
        where.category = category;
      }

      if (folder) {
        where.folder = folder;
      }

      if (uploadedBy) {
        where.uploadedBy = uploadedBy;
      }

      if (tags && tags.length > 0) {
        where.tags = { hasSome: tags };
      }

      if (isPublic !== undefined) {
        where.isPublic = isPublic;
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      // Get total count
      const total = await this.prisma.media.count({ where });

      // Get data
      const media = await this.prisma.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data: media.map(item => this.transformToResponseDto(item)),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to find all media: ${error.message}`);
      throw error;
    }
  }

  async findByCategory(category: MediaCategory, query: MediaQueryDto): Promise<{
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
    return this.findAll({ ...query, category });
  }

  async findByFolder(folder: string, query: MediaQueryDto): Promise<{
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
    return this.findAll({ ...query, folder });
  }

  async findByUser(userId: string, query: MediaQueryDto): Promise<{
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
    return this.findAll({ ...query, uploadedBy: userId });
  }

  async search(searchDto: MediaSearchDto): Promise<{
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
    const { query, page = 1, limit = 10, category, folder, tags } = searchDto;

    const searchQuery: MediaQueryDto = {
      page,
      limit,
      search: query,
      category,
      folder,
      tags,
    };

    return this.findAll(searchQuery);
  }

  async update(id: string, data: UpdateMediaDto): Promise<MediaResponseDto> {
    try {
      const media = await this.prisma.media.update({
        where: { id },
        data: {
          altText: data.altText,
          title: data.title,
          description: data.description,
          tags: data.tags,
          isPublic: data.isPublic,
          isActive: data.isActive,
          metadata: data.metadata,
        },
      });

      this.logger.debug(`Media updated: ${id}`);
      return this.transformToResponseDto(media);
    } catch (error) {
      this.logger.error(`Failed to update media ${id}: ${error.message}`);
      throw error;
    }
  }

  async updateCoreFileFields(
    id: string,
    core: {
      fileName: string;
      originalName: string;
      url: string;
      fileId: string;
      size: number;
      contentType: string;
      folder: string;
      category: MediaCategory;
    },
    meta: UpdateMediaDto
  ): Promise<MediaResponseDto> {
    try {
      const media = await this.prisma.media.update({
        where: { id },
        data: {
          fileName: core.fileName,
          originalName: core.originalName,
          url: core.url,
          fileId: core.fileId,
          size: core.size,
          contentType: core.contentType,
          folder: core.folder,
          category: core.category,
          altText: meta.altText,
          title: meta.title,
          description: meta.description,
          tags: meta.tags,
          isPublic: meta.isPublic,
          isActive: meta.isActive,
          metadata: meta.metadata,
        },
      });

      this.logger.debug(`Media core fields updated: ${id}`);
      return this.transformToResponseDto(media);
    } catch (error) {
      this.logger.error(`Failed to update core fields for media ${id}: ${error.message}`);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.media.delete({
        where: { id },
      });

      this.logger.debug(`Media deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete media ${id}: ${error.message}`);
      throw error;
    }
  }

  async bulkDelete(ids: string[]): Promise<{ success: number; failed: number; errors: string[] }> {
    try {
      const result = await this.prisma.media.deleteMany({
        where: {
          id: { in: ids },
        },
      });

      this.logger.debug(`Bulk deleted ${result.count} media files`);
      return {
        success: result.count,
        failed: ids.length - result.count,
        errors: [],
      };
    } catch (error) {
      this.logger.error(`Failed to bulk delete media: ${error.message}`);
      throw error;
    }
  }

  async bulkUpdate(ids: string[], data: UpdateMediaDto): Promise<{ success: number; failed: number; errors: string[] }> {
    try {
      const result = await this.prisma.media.updateMany({
        where: {
          id: { in: ids },
        },
        data: {
          altText: data.altText,
          title: data.title,
          description: data.description,
          tags: data.tags,
          isPublic: data.isPublic,
          isActive: data.isActive,
          metadata: data.metadata,
        },
      });

      this.logger.debug(`Bulk updated ${result.count} media files`);
      return {
        success: result.count,
        failed: ids.length - result.count,
        errors: [],
      };
    } catch (error) {
      this.logger.error(`Failed to bulk update media: ${error.message}`);
      throw error;
    }
  }

  async getStatistics(): Promise<MediaStatisticsDto> {
    try {
      const [
        totalFiles,
        totalSize,
        categories,
        folders,
        uploadsToday,
        uploadsThisWeek,
        uploadsThisMonth,
      ] = await Promise.all([
        this.prisma.media.count(),
        this.prisma.media.aggregate({
          _sum: { size: true },
        }),
        this.prisma.media.groupBy({
          by: ['category'],
          _count: { id: true },
        }),
        this.prisma.media.groupBy({
          by: ['folder'],
          _count: { id: true },
        }),
        this.prisma.media.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        this.prisma.media.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setDate(new Date().getDate() - 7)),
            },
          },
        }),
        this.prisma.media.count({
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
      ]);

      const categoryStats: Record<MediaCategory, number> = {
        [MediaCategory.IMAGE]: 0,
        [MediaCategory.DOCUMENT]: 0,
        [MediaCategory.VIDEO]: 0,
        [MediaCategory.AUDIO]: 0,
        [MediaCategory.OTHER]: 0,
      };

      categories.forEach((cat) => {
        categoryStats[cat.category as MediaCategory] = cat._count.id;
      });

      const folderStats: Record<string, number> = {};
      folders.forEach((folder) => {
        folderStats[folder.folder] = folder._count.id;
      });

      return {
        totalFiles,
        totalSize: totalSize._sum.size || 0,
        categories: categoryStats,
        folders: folderStats,
        uploadsToday,
        uploadsThisWeek,
        uploadsThisMonth,
      };
    } catch (error) {
      this.logger.error(`Failed to get media statistics: ${error.message}`);
      throw error;
    }
  }

  async getLibrary(): Promise<MediaLibraryDto> {
    try {
      const [
        categories,
        folders,
        recent,
        popular,
      ] = await Promise.all([
        this.prisma.media.groupBy({
          by: ['category'],
          _count: { id: true },
          _sum: { size: true },
        }),
        this.prisma.media.groupBy({
          by: ['folder'],
          _count: { id: true },
          _sum: { size: true },
        }),
        this.prisma.media.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.media.findMany({
          take: 10,
          orderBy: { size: 'desc' },
        }),
      ]);

      return {
        categories: categories.map((cat) => ({
          category: cat.category as MediaCategory,
          count: cat._count.id,
          totalSize: cat._sum.size || 0,
        })),
        folders: folders.map((folder) => ({
          folder: folder.folder,
          count: folder._count.id,
          totalSize: folder._sum.size || 0,
        })),
        recent: recent.map((item) => this.transformToResponseDto(item)),
        popular: popular.map((item) => this.transformToResponseDto(item)),
      };
    } catch (error) {
      this.logger.error(`Failed to get media library: ${error.message}`);
      throw error;
    }
  }

  // Albums listing
  async findAlbums(query: { page?: number; limit?: number; isActive?: boolean }): Promise<{
    data: any[];
    pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
  }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.isActive !== undefined) where.isActive = query.isActive;

    const [albums, total] = await Promise.all([
      this.prisma.mediaAlbum.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          media: true,
        },
      }),
      this.prisma.mediaAlbum.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      data: albums,
      pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    };
  }

  async createAlbum(data: { name: any; description?: any; isActive?: boolean }) {
    return this.prisma.mediaAlbum.create({
      data: {
        name: data.name as any,
        description: data.description as any,
        isActive: data.isActive ?? true,
      },
    });
  }

  async updateAlbum(id: string, data: { name?: any; description?: any; isActive?: boolean }) {
    return this.prisma.mediaAlbum.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name as any } : {}),
        ...(data.description !== undefined ? { description: data.description as any } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });
  }

  async deleteAlbum(id: string) {
    return this.prisma.mediaAlbum.delete({ where: { id } });
  }

  async attachMediaToAlbum(albumId: string, mediaIds: string[]) {
    const records = mediaIds.map((mediaId) =>
      this.prisma.mediaAlbumMedia.create({ data: { mediaAlbumId: albumId, mediaId } })
    );
    await this.prisma.$transaction(records);
    return { attached: mediaIds.length };
  }

  async detachMediaFromAlbum(albumId: string, mediaId: string) {
    await this.prisma.mediaAlbumMedia.deleteMany({ where: { mediaAlbumId: albumId, mediaId } });
    return { detached: 1 };
  }

  async getAlbumMedia(
    albumId: string,
    query: { page?: number; limit?: number }
  ): Promise<{ data: MediaResponseDto[]; pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } }> {
    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;

    const [links, total] = await Promise.all([
      this.prisma.mediaAlbumMedia.findMany({
        where: { mediaAlbumId: albumId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.mediaAlbumMedia.count({ where: { mediaAlbumId: albumId } }),
    ]);

    const media = await this.prisma.media.findMany({ where: { id: { in: links.map((l) => l.mediaId) } } });
    const mapped = media.map((m) => this.transformToResponseDto(m));
    const totalPages = Math.ceil(total / limit);
    return { data: mapped, pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 } };
  }

  async findByTags(tags: string[], query: MediaQueryDto): Promise<{
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
    return this.findAll({ ...query, tags });
  }

  async findPublic(query: MediaQueryDto): Promise<{
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
    return this.findAll({ ...query, isPublic: true, isActive: true });
  }

  async countByCategory(category: MediaCategory): Promise<number> {
    try {
      return await this.prisma.media.count({
        where: { category },
      });
    } catch (error) {
      this.logger.error(`Failed to count media by category ${category}: ${error.message}`);
      throw error;
    }
  }

  async countByFolder(folder: string): Promise<number> {
    try {
      return await this.prisma.media.count({
        where: { folder },
      });
    } catch (error) {
      this.logger.error(`Failed to count media by folder ${folder}: ${error.message}`);
      throw error;
    }
  }

  async getTotalSize(): Promise<number> {
    try {
      const result = await this.prisma.media.aggregate({
        _sum: { size: true },
      });
      return result._sum.size || 0;
    } catch (error) {
      this.logger.error(`Failed to get total media size: ${error.message}`);
      throw error;
    }
  }

  async findDuplicates(fileName: string, size: number): Promise<MediaResponseDto[]> {
    try {
      const duplicates = await this.prisma.media.findMany({
        where: {
          OR: [
            { fileName },
            { originalName: fileName },
            { size, originalName: { contains: fileName.split('.')[0] } },
          ],
        },
      });

      return duplicates.map((item) => this.transformToResponseDto(item));
    } catch (error) {
      this.logger.error(`Failed to find duplicates for ${fileName}: ${error.message}`);
      throw error;
    }
  }

  async cleanupOrphanedMedia(): Promise<{ cleaned: number; errors: string[] }> {
    try {
      // Find media that are not referenced by any entity
      const orphanedMedia = await this.prisma.media.findMany({
        where: {
          AND: [
            { sliders: { none: {} } },
            { officeSettings: { none: {} } },
            { profilePictures: { none: {} } },
          ],
        },
      });

      if (orphanedMedia.length === 0) {
        return { cleaned: 0, errors: [] };
      }

      const result = await this.prisma.media.deleteMany({
        where: {
          id: { in: orphanedMedia.map((m) => m.id) },
        },
      });

      this.logger.debug(`Cleaned up ${result.count} orphaned media files`);
      return { cleaned: result.count, errors: [] };
    } catch (error) {
      this.logger.error(`Failed to cleanup orphaned media: ${error.message}`);
      return { cleaned: 0, errors: [error.message] };
    }
  }

  private transformToResponseDto(media: any): MediaResponseDto {
    return {
      id: media.id,
      fileName: media.fileName,
      originalName: media.originalName,
      url: media.url,
      // presignedUrl added at service layer where duration/operation context exists
      fileId: media.fileId,
      size: media.size,
      contentType: media.contentType,
      uploadedBy: media.uploadedBy,
      folder: media.folder,
      category: media.category,
      altText: media.altText,
      title: media.title,
      description: media.description,
      tags: media.tags || [],
      isPublic: media.isPublic,
      isActive: media.isActive,
      metadata: media.metadata,
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
    };
  }
} 