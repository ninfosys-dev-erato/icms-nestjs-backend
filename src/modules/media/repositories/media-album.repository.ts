import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { MediaAlbum } from '../entities/media-album.entity';
import { 
  CreateMediaAlbumDto, 
  UpdateMediaAlbumDto,
  AlbumStatistics
} from '../dto/media.dto';

@Injectable()
export class MediaAlbumRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<MediaAlbum | null> {
    return this.prisma.mediaAlbum.findUnique({
      where: { id },
      include: {
        media: {
          include: {
            media: true
          }
        }
      }
    }) as any;
  }

  async findAll(): Promise<MediaAlbum[]> {
    return this.prisma.mediaAlbum.findMany({
      include: {
        media: {
          include: {
            media: true
          }
        }
      }
    }) as any;
  }

  async findActive(): Promise<MediaAlbum[]> {
    return this.prisma.mediaAlbum.findMany({
      where: { isActive: true },
      include: {
        media: {
          include: {
            media: true
          }
        }
      }
    }) as any;
  }

  async create(data: CreateMediaAlbumDto): Promise<MediaAlbum> {
    return this.prisma.mediaAlbum.create({
      data: {
        name: data.name as any,
        description: data.description as any,
        isActive: data.isActive ?? true,
      },
      include: {
        media: {
          include: {
            media: true
          }
        }
      }
    }) as any;
  }

  async update(id: string, data: UpdateMediaAlbumDto): Promise<MediaAlbum> {
    return this.prisma.mediaAlbum.update({
      where: { id },
      data: {
        name: data.name as any,
        description: data.description as any,
        isActive: data.isActive,
      },
      include: {
        media: {
          include: {
            media: true
          }
        }
      }
    }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.mediaAlbum.delete({
      where: { id }
    });
  }

  async addMediaToAlbum(albumId: string, mediaId: string): Promise<void> {
    await this.prisma.mediaAlbumMedia.create({
      data: {
        mediaAlbumId: albumId,
        mediaId,
      }
    });
  }

  async removeMediaFromAlbum(albumId: string, mediaId: string): Promise<void> {
    await this.prisma.mediaAlbumMedia.deleteMany({
      where: {
        mediaAlbumId: albumId,
        mediaId,
      }
    });
  }

  async findWithMediaCount(id: string): Promise<MediaAlbum & { mediaCount: number }> {
    const album = await this.prisma.mediaAlbum.findUnique({
      where: { id },
      include: {
        media: {
          include: {
            media: true
          }
        }
      }
    });

    if (!album) {
      return null as any;
    }

    return {
      ...album,
      mediaCount: album.media.length,
    } as any;
  }

  async getStatistics(): Promise<AlbumStatistics> {
    const [total, active, withMedia, totalMedia] = await Promise.all([
      this.prisma.mediaAlbum.count(),
      this.prisma.mediaAlbum.count({ where: { isActive: true } }),
      this.prisma.mediaAlbum.count({
        where: {
          media: {
            some: {}
          }
        }
      }),
      this.prisma.mediaAlbumMedia.count(),
    ]);

    return {
      total,
      active,
      withMedia,
      averageMediaPerAlbum: total > 0 ? totalMedia / total : 0,
    };
  }

  async reorderMediaInAlbum(albumId: string, mediaIds: string[]): Promise<void> {
    // Remove existing media from album
    await this.prisma.mediaAlbumMedia.deleteMany({
      where: { mediaAlbumId: albumId }
    });

    // Add media in new order
    const mediaToAdd = mediaIds.map((mediaId, index) => ({
      albumId,
      mediaId,
      order: index,
    }));

    await this.prisma.mediaAlbumMedia.createMany({
      data: mediaToAdd.map(item => ({
        mediaAlbumId: item.albumId,
        mediaId: item.mediaId,
      }))
    });
  }
} 