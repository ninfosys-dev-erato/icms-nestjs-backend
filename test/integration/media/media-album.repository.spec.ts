import { Test, TestingModule } from '@nestjs/testing';
import { MediaAlbumRepository } from '../../../src/modules/media/repositories/media-album.repository';
import { PrismaService } from '../../../src/database/prisma.service';
import { MediaAlbum } from '../../../src/modules/media/entities/media-album.entity';

describe('MediaAlbumRepository', () => {
  let repository: MediaAlbumRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaAlbumRepository,
        {
          provide: PrismaService,
          useValue: {
            mediaAlbum: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            mediaAlbumMedia: {
              create: jest.fn(),
              deleteMany: jest.fn(),
              findMany: jest.fn(),
              updateMany: jest.fn(),
              createMany: jest.fn(),
              count: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<MediaAlbumRepository>(MediaAlbumRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find album by ID', async () => {
      const mockAlbum = {
        id: 'test-id',
        name: { en: 'Test Album', ne: 'परीक्षण एल्बम' },
        description: { en: 'Test Description', ne: 'परीक्षण विवरण' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        media: []
      };

      (prisma.mediaAlbum.findUnique as jest.Mock).mockResolvedValue(mockAlbum);

      const result = await repository.findById('test-id');

      expect(result).toEqual(mockAlbum);
      expect(prisma.mediaAlbum.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        include: {
          media: {
            include: {
              media: true
            }
          }
        }
      });
    });

    it('should return null when album not found', async () => {
      (prisma.mediaAlbum.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all albums', async () => {
      const mockAlbums = [
        {
          id: 'test-id-1',
          name: { en: 'Test Album 1', ne: 'परीक्षण एल्बम १' },
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          media: []
        },
        {
          id: 'test-id-2',
          name: { en: 'Test Album 2', ne: 'परीक्षण एल्बम २' },
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          media: []
        }
      ];

      (prisma.mediaAlbum.findMany as jest.Mock).mockResolvedValue(mockAlbums);

      const result = await repository.findAll();

      expect(result).toEqual(mockAlbums);
      expect(prisma.mediaAlbum.findMany).toHaveBeenCalledWith({
        include: {
          media: {
            include: {
              media: true
            }
          }
        }
      });
    });
  });

  describe('findActive', () => {
    it('should find active albums', async () => {
      const mockAlbums = [
        {
          id: 'test-id-1',
          name: { en: 'Test Album 1', ne: 'परीक्षण एल्बम १' },
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          media: []
        }
      ];

      (prisma.mediaAlbum.findMany as jest.Mock).mockResolvedValue(mockAlbums);

      const result = await repository.findActive();

      expect(result).toEqual(mockAlbums);
      expect(prisma.mediaAlbum.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: {
          media: {
            include: {
              media: true
            }
          }
        }
      });
    });
  });

  describe('create', () => {
    it('should create album', async () => {
      const createData = {
        name: { en: 'Test Album', ne: 'परीक्षण एल्बम' },
        description: { en: 'Test Description', ne: 'परीक्षण विवरण' },
        isActive: true
      };

      const mockCreatedAlbum = {
        id: 'test-id',
        ...createData,
        createdAt: new Date(),
        updatedAt: new Date(),
        media: []
      };

      (prisma.mediaAlbum.create as jest.Mock).mockResolvedValue(mockCreatedAlbum);

      const result = await repository.create(createData);

      expect(result).toEqual(mockCreatedAlbum);
      expect(prisma.mediaAlbum.create).toHaveBeenCalledWith({
        data: {
          name: createData.name,
          description: createData.description,
          isActive: createData.isActive,
        },
        include: {
          media: {
            include: {
              media: true
            }
          }
        }
      });
    });
  });

  describe('update', () => {
    it('should update album', async () => {
      const updateData = {
        name: { en: 'Updated Test Album', ne: 'अपडेटेड परीक्षण एल्बम' },
        isActive: false
      };

      const mockUpdatedAlbum = {
        id: 'test-id',
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
        media: []
      };

      (prisma.mediaAlbum.update as jest.Mock).mockResolvedValue(mockUpdatedAlbum);

      const result = await repository.update('test-id', updateData);

      expect(result).toEqual(mockUpdatedAlbum);
      expect(prisma.mediaAlbum.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: updateData,
        include: {
          media: {
            include: {
              media: true
            }
          }
        }
      });
    });
  });

  describe('delete', () => {
    it('should delete album', async () => {
      (prisma.mediaAlbum.delete as jest.Mock).mockResolvedValue(undefined);

      await repository.delete('test-id');

      expect(prisma.mediaAlbum.delete).toHaveBeenCalledWith({
        where: { id: 'test-id' }
      });
    });
  });

  describe('addMediaToAlbum', () => {
    it('should add media to album', async () => {
      (prisma.mediaAlbumMedia.create as jest.Mock).mockResolvedValue(undefined);

      await repository.addMediaToAlbum('album-id', 'media-id');

      expect(prisma.mediaAlbumMedia.create).toHaveBeenCalledWith({
        data: {
          mediaAlbumId: 'album-id',
          mediaId: 'media-id',
        }
      });
    });
  });

  describe('removeMediaFromAlbum', () => {
    it('should remove media from album', async () => {
      (prisma.mediaAlbumMedia.deleteMany as jest.Mock).mockResolvedValue(undefined);

      await repository.removeMediaFromAlbum('album-id', 'media-id');

      expect(prisma.mediaAlbumMedia.deleteMany).toHaveBeenCalledWith({
        where: {
          mediaAlbumId: 'album-id',
          mediaId: 'media-id',
        }
      });
    });
  });

  describe('findWithMediaCount', () => {
    it('should find album with media count', async () => {
      const mockAlbum = {
        id: 'test-id',
        name: { en: 'Test Album', ne: 'परीक्षण एल्बम' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        media: [
          { id: 'media-1', media: { id: 'media-1' } },
          { id: 'media-2', media: { id: 'media-2' } }
        ]
      };

      (prisma.mediaAlbum.findUnique as jest.Mock).mockResolvedValue(mockAlbum);

      const result = await repository.findWithMediaCount('test-id');

      expect(result).toEqual({
        ...mockAlbum,
        mediaCount: 2
      });
    });

    it('should return null when album not found', async () => {
      (prisma.mediaAlbum.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findWithMediaCount('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('getStatistics', () => {
    it('should get album statistics', async () => {
      const mockStats = {
        total: 10,
        active: 8,
        withMedia: 6,
        averageMediaPerAlbum: 2.5
      };

      (prisma.mediaAlbum.count as jest.Mock)
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(8)  // active
        .mockResolvedValueOnce(6); // withMedia
      (prisma.mediaAlbumMedia.count as jest.Mock).mockResolvedValue(25);

      const result = await repository.getStatistics();

      expect(result).toEqual(mockStats);
      expect(prisma.mediaAlbum.count).toHaveBeenCalledTimes(3);
      expect(prisma.mediaAlbumMedia.count).toHaveBeenCalledTimes(1);
    });
  });

  describe('reorderMediaInAlbum', () => {
    it('should reorder media in album', async () => {
      const mediaIds = ['media-1', 'media-2', 'media-3'];
      
      (prisma.mediaAlbumMedia.deleteMany as jest.Mock).mockResolvedValue(undefined);
      (prisma.mediaAlbumMedia.createMany as jest.Mock).mockResolvedValue(undefined);

      await repository.reorderMediaInAlbum('album-id', mediaIds);

      expect(prisma.mediaAlbumMedia.deleteMany).toHaveBeenCalledWith({
        where: { mediaAlbumId: 'album-id' }
      });

      expect(prisma.mediaAlbumMedia.createMany).toHaveBeenCalledWith({
        data: [
          { mediaAlbumId: 'album-id', mediaId: 'media-1' },
          { mediaAlbumId: 'album-id', mediaId: 'media-2' },
          { mediaAlbumId: 'album-id', mediaId: 'media-3' }
        ]
      });
    });
  });
}); 