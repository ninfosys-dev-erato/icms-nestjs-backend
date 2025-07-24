import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Media, MediaType } from '../entities/media.entity';
import { 
  CreateMediaDto, 
  UpdateMediaDto, 
  MediaQueryDto,
  MediaStatistics,
  BulkCreateMediaDto,
  BulkUpdateMediaDto
} from '../dto/media.dto';

@Injectable()
export class MediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Media | null> {
    return this.prisma.media.findUnique({
      where: { id },
      include: {
        albums: {
          include: {
            mediaAlbum: true
          }
        }
      }
    }) as any;
  }

  async findAll(query: MediaQueryDto): Promise<{
    data: Media[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const { page = 1, limit = 10, search, mediaType, albumId, isActive, sort = 'createdAt', order = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { fileName: { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } },
        { altText: { path: ['en'], string_contains: search } },
        { altText: { path: ['ne'], string_contains: search } },
        { caption: { path: ['en'], string_contains: search } },
        { caption: { path: ['ne'], string_contains: search } },
      ];
    }

    if (mediaType) {
      where.mediaType = mediaType;
    }

    if (albumId) {
      where.albums = {
        some: {
          mediaAlbumId: albumId
        }
      };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          albums: {
            include: {
              mediaAlbum: true
            }
          }
        }
      }),
      this.prisma.media.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data as any,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findByType(mediaType: MediaType, query: MediaQueryDto): Promise<{
    data: Media[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    return this.findAll({ ...query, mediaType });
  }

  async findByAlbum(albumId: string, query: MediaQueryDto): Promise<{
    data: Media[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    return this.findAll({ ...query, albumId });
  }

  async search(searchTerm: string, query: MediaQueryDto): Promise<{
    data: Media[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    return this.findAll({ ...query, search: searchTerm });
  }

  async create(data: CreateMediaDto): Promise<Media> {
    return this.prisma.media.create({
      data: {
        fileName: data.fileName,
        originalName: data.originalName,
        filePath: data.filePath,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        mediaType: data.mediaType,
        altText: data.altText as any,
        caption: data.caption as any,
        width: data.width,
        height: data.height,
        duration: data.duration,
        isActive: data.isActive ?? true,
      },
      include: {
        albums: {
          include: {
            mediaAlbum: true
          }
        }
      }
    }) as any;
  }

  async update(id: string, data: UpdateMediaDto): Promise<Media> {
    return this.prisma.media.update({
      where: { id },
      data: {
        altText: data.altText as any,
        caption: data.caption as any,
        isActive: data.isActive,
      },
      include: {
        albums: {
          include: {
            mediaAlbum: true
          }
        }
      }
    }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.media.delete({
      where: { id }
    });
  }

  async findByFilePath(filePath: string): Promise<Media | null> {
    return this.prisma.media.findFirst({
      where: { filePath },
      include: {
        albums: {
          include: {
            mediaAlbum: true
          }
        }
      }
    }) as any;
  }

  async findByIds(ids: string[]): Promise<Media[]> {
    return this.prisma.media.findMany({
      where: { id: { in: ids } },
      include: {
        albums: {
          include: {
            mediaAlbum: true
          }
        }
      }
    }) as any;
  }

  async getStatistics(): Promise<MediaStatistics> {
    const [total, byType, totalSize, averageSize] = await Promise.all([
      this.prisma.media.count(),
      this.prisma.media.groupBy({
        by: ['mediaType'],
        _count: { mediaType: true }
      }),
      this.prisma.media.aggregate({
        _sum: { fileSize: true }
      }),
      this.prisma.media.aggregate({
        _avg: { fileSize: true }
      })
    ]);

    const byTypeRecord: Record<MediaType, number> = {
      [MediaType.IMAGE]: 0,
      [MediaType.VIDEO]: 0,
      [MediaType.AUDIO]: 0,
      [MediaType.DOCUMENT]: 0,
    };

    byType.forEach(item => {
      byTypeRecord[item.mediaType as MediaType] = item._count.mediaType;
    });

    return {
      total,
      byType: byTypeRecord,
      totalSize: totalSize._sum.fileSize || 0,
      averageSize: Math.round(averageSize._avg.fileSize || 0),
    };
  }

  async bulkCreate(data: BulkCreateMediaDto): Promise<Media[]> {
    const createdMedia = await Promise.all(
      data.media.map(item => 
        this.prisma.media.create({
          data: {
            fileName: item.fileName,
            originalName: item.originalName,
            filePath: item.filePath,
            fileSize: item.fileSize,
            mimeType: item.mimeType,
            mediaType: item.mediaType,
            altText: item.altText as any,
            caption: item.caption as any,
            width: item.width,
            height: item.height,
            duration: item.duration,
            isActive: item.isActive ?? true,
          },
          include: {
            albums: {
              include: {
                mediaAlbum: true
              }
            }
          }
        })
      )
    );

    return createdMedia as any;
  }

  async bulkUpdate(data: BulkUpdateMediaDto): Promise<Media[]> {
    const updates = data.ids.map(id => 
      this.prisma.media.update({
        where: { id },
        data: {
          altText: data.updates.altText as any,
          caption: data.updates.caption as any,
          isActive: data.updates.isActive,
        },
        include: {
          albums: {
            include: {
              mediaAlbum: true
            }
          }
        }
      })
    );

    return Promise.all(updates) as any;
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await this.prisma.media.deleteMany({
      where: { id: { in: ids } }
    });
  }
} 