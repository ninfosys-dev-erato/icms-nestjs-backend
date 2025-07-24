import { Test, TestingModule } from '@nestjs/testing';
import { MediaRepository } from '../../../src/modules/media/repositories/media.repository';
import { PrismaService } from '../../../src/database/prisma.service';
import { Media, MediaType } from '../../../src/modules/media/entities/media.entity';

describe('MediaRepository', () => {
  let repository: MediaRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaRepository,
        {
          provide: PrismaService,
          useValue: {
            media: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
              groupBy: jest.fn(),
              aggregate: jest.fn(),
              createMany: jest.fn(),
              deleteMany: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<MediaRepository>(MediaRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find media by ID', async () => {
      const mockMedia = {
        id: 'test-id',
        fileName: 'test.jpg',
        originalName: 'test.jpg',
        filePath: 'uploads/test.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
        mediaType: MediaType.IMAGE,
        altText: { en: 'Test Image', ne: 'परीक्षण छवि' },
        caption: { en: 'Test Caption', ne: 'परीक्षण कैप्शन' },
        width: 800,
        height: 600,
        duration: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        albums: []
      };

      (prisma.media.findUnique as jest.Mock).mockResolvedValue(mockMedia);

      const result = await repository.findById('test-id');

      expect(result).toEqual(mockMedia);
      expect(prisma.media.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        include: {
          albums: {
            include: {
              mediaAlbum: true
            }
          }
        }
      });
    });

    it('should return null when media not found', async () => {
      (prisma.media.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all media with pagination', async () => {
      const mockMedia = [
        {
          id: 'test-id-1',
          fileName: 'test1.jpg',
          mediaType: MediaType.IMAGE,
          isActive: true,
          albums: []
        },
        {
          id: 'test-id-2',
          fileName: 'test2.jpg',
          mediaType: MediaType.IMAGE,
          isActive: true,
          albums: []
        }
      ];

      const mockResult = {
        data: mockMedia,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      (prisma.media.findMany as jest.Mock).mockResolvedValue(mockMedia);
      (prisma.media.count as jest.Mock).mockResolvedValue(2);

      const result = await repository.findAll({ page: 1, limit: 10 });

      expect(result).toEqual(mockResult);
      expect(prisma.media.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          albums: {
            include: {
              mediaAlbum: true
            }
          }
        }
      });
    });
  });

  describe('findByType', () => {
    it('should find media by type', async () => {
      const mockMedia = [
        {
          id: 'test-id',
          fileName: 'test.jpg',
          mediaType: MediaType.IMAGE,
          isActive: true,
          albums: []
        }
      ];

      const mockResult = {
        data: mockMedia,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      (prisma.media.findMany as jest.Mock).mockResolvedValue(mockMedia);
      (prisma.media.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.findByType(MediaType.IMAGE, { page: 1, limit: 10 });

      expect(result).toEqual(mockResult);
      expect(prisma.media.findMany).toHaveBeenCalledWith({
        where: { mediaType: MediaType.IMAGE },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          albums: {
            include: {
              mediaAlbum: true
            }
          }
        }
      });
    });
  });

  describe('findByAlbum', () => {
    it('should find media by album', async () => {
      const mockMedia = [
        {
          id: 'test-id',
          fileName: 'test.jpg',
          mediaType: MediaType.IMAGE,
          isActive: true,
          albums: []
        }
      ];

      const mockResult = {
        data: mockMedia,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      (prisma.media.findMany as jest.Mock).mockResolvedValue(mockMedia);
      (prisma.media.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.findByAlbum('album-id', { page: 1, limit: 10 });

      expect(result).toEqual(mockResult);
      expect(prisma.media.findMany).toHaveBeenCalledWith({
        where: {
          albums: {
            some: {
              albumId: 'album-id'
            }
          }
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          albums: {
            include: {
              mediaAlbum: true
            }
          }
        }
      });
    });
  });

  describe('search', () => {
    it('should search media', async () => {
      const mockMedia = [
        {
          id: 'test-id',
          fileName: 'test.jpg',
          mediaType: MediaType.IMAGE,
          isActive: true,
          albums: []
        }
      ];

      const mockResult = {
        data: mockMedia,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      (prisma.media.findMany as jest.Mock).mockResolvedValue(mockMedia);
      (prisma.media.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.search('test', { page: 1, limit: 10 });

      expect(result).toEqual(mockResult);
      expect(prisma.media.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { fileName: { contains: 'test', mode: 'insensitive' } },
            { originalName: { contains: 'test', mode: 'insensitive' } },
            { altText: { path: ['en'], string_contains: 'test' } },
            { altText: { path: ['ne'], string_contains: 'test' } },
            { caption: { path: ['en'], string_contains: 'test' } },
            { caption: { path: ['ne'], string_contains: 'test' } },
          ]
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          albums: {
            include: {
              mediaAlbum: true
            }
          }
        }
      });
    });
  });

  describe('create', () => {
    it('should create media', async () => {
      const createData = {
        fileName: 'test.jpg',
        originalName: 'test.jpg',
        filePath: 'uploads/test.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
        mediaType: MediaType.IMAGE,
        altText: { en: 'Test Image', ne: 'परीक्षण छवि' },
        caption: { en: 'Test Caption', ne: 'परीक्षण कैप्शन' },
        width: 800,
        height: 600,
        duration: null,
        isActive: true,
      };

      const mockCreatedMedia = {
        id: 'test-id',
        ...createData,
        createdAt: new Date(),
        updatedAt: new Date(),
        albums: []
      };

      (prisma.media.create as jest.Mock).mockResolvedValue(mockCreatedMedia);

      const result = await repository.create(createData);

      expect(result).toEqual(mockCreatedMedia);
      expect(prisma.media.create).toHaveBeenCalledWith({
        data: {
          fileName: createData.fileName,
          originalName: createData.originalName,
          filePath: createData.filePath,
          fileSize: createData.fileSize,
          mimeType: createData.mimeType,
          mediaType: createData.mediaType,
          altText: createData.altText,
          caption: createData.caption,
          width: createData.width,
          height: createData.height,
          duration: createData.duration,
          isActive: createData.isActive,
        },
        include: {
          albums: {
            include: {
              mediaAlbum: true
            }
          }
        }
      });
    });
  });

  describe('update', () => {
    it('should update media', async () => {
      const updateData = {
        altText: { en: 'Updated Test Image', ne: 'अपडेटेड परीक्षण छवि' },
        isActive: false,
      };

      const mockUpdatedMedia = {
        id: 'test-id',
        fileName: 'test.jpg',
        originalName: 'test.jpg',
        filePath: 'uploads/test.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
        mediaType: MediaType.IMAGE,
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
        albums: []
      };

      (prisma.media.update as jest.Mock).mockResolvedValue(mockUpdatedMedia);

      const result = await repository.update('test-id', updateData);

      expect(result).toEqual(mockUpdatedMedia);
      expect(prisma.media.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: updateData,
        include: {
          albums: {
            include: {
              mediaAlbum: true
            }
          }
        }
      });
    });
  });

  describe('delete', () => {
    it('should delete media', async () => {
      (prisma.media.delete as jest.Mock).mockResolvedValue(undefined);

      await repository.delete('test-id');

      expect(prisma.media.delete).toHaveBeenCalledWith({
        where: { id: 'test-id' }
      });
    });
  });

  describe('findByFilePath', () => {
    it('should find media by file path', async () => {
      const mockMedia = {
        id: 'test-id',
        fileName: 'test.jpg',
        filePath: 'uploads/test.jpg',
        mediaType: MediaType.IMAGE,
        isActive: true,
        albums: []
      };

      (prisma.media.findFirst as jest.Mock).mockResolvedValue(mockMedia);

      const result = await repository.findByFilePath('uploads/test.jpg');

      expect(result).toEqual(mockMedia);
      expect(prisma.media.findFirst).toHaveBeenCalledWith({
        where: { filePath: 'uploads/test.jpg' },
        include: {
          albums: {
            include: {
              mediaAlbum: true
            }
          }
        }
      });
    });

    it('should return null when media not found', async () => {
      (prisma.media.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await repository.findByFilePath('non-existent-path');

      expect(result).toBeNull();
    });
  });

  describe('findByIds', () => {
    it('should find media by IDs', async () => {
      const mockMedia = [
        {
          id: 'test-id-1',
          fileName: 'test1.jpg',
          mediaType: MediaType.IMAGE,
          isActive: true,
          albums: []
        },
        {
          id: 'test-id-2',
          fileName: 'test2.jpg',
          mediaType: MediaType.IMAGE,
          isActive: true,
          albums: []
        }
      ];

      (prisma.media.findMany as jest.Mock).mockResolvedValue(mockMedia);

      const result = await repository.findByIds(['test-id-1', 'test-id-2']);

      expect(result).toEqual(mockMedia);
      expect(prisma.media.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: ['test-id-1', 'test-id-2']
          }
        },
        include: {
          albums: {
            include: {
              mediaAlbum: true
            }
          }
        }
      });
    });
  });

  describe('getStatistics', () => {
    it('should get media statistics', async () => {
      const mockStats = {
        total: 10,
        byType: {
          [MediaType.IMAGE]: 5,
          [MediaType.VIDEO]: 3,
          [MediaType.AUDIO]: 1,
          [MediaType.DOCUMENT]: 1,
        },
        totalSize: 1024000,
        averageSize: 102400,
      };

      (prisma.media.count as jest.Mock).mockResolvedValue(10);
      (prisma.media.groupBy as jest.Mock).mockResolvedValue([
        { mediaType: MediaType.IMAGE, _count: { mediaType: 5 } },
        { mediaType: MediaType.VIDEO, _count: { mediaType: 3 } },
        { mediaType: MediaType.AUDIO, _count: { mediaType: 1 } },
        { mediaType: MediaType.DOCUMENT, _count: { mediaType: 1 } },
      ]);
      (prisma.media.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { fileSize: 1024000 } })
        .mockResolvedValueOnce({ _avg: { fileSize: 102400 } });

      const result = await repository.getStatistics();

      expect(result).toEqual(mockStats);
      expect(prisma.media.count).toHaveBeenCalled();
      expect(prisma.media.groupBy).toHaveBeenCalledWith({
        by: ['mediaType'],
        _count: { mediaType: true }
      });
    });
  });

  describe('bulkCreate', () => {
    it('should bulk create media', async () => {
      const bulkCreateData = {
        media: [
          {
            fileName: 'test1.jpg',
            originalName: 'test1.jpg',
            filePath: 'uploads/test1.jpg',
            fileSize: 1024,
            mimeType: 'image/jpeg',
            mediaType: MediaType.IMAGE,
            altText: { en: 'Test Image 1', ne: 'परीक्षण छवि १' },
            caption: { en: 'Test Caption 1', ne: 'परीक्षण कैप्शन १' },
            width: 800,
            height: 600,
            duration: null,
            isActive: true,
          },
          {
            fileName: 'test2.jpg',
            originalName: 'test2.jpg',
            filePath: 'uploads/test2.jpg',
            fileSize: 2048,
            mimeType: 'image/jpeg',
            mediaType: MediaType.IMAGE,
            altText: { en: 'Test Image 2', ne: 'परीक्षण छवि २' },
            caption: { en: 'Test Caption 2', ne: 'परीक्षण कैप्शन २' },
            width: 1024,
            height: 768,
            duration: null,
            isActive: true,
          }
        ]
      };

      const mockCreatedMedia = [
        {
          id: 'test-id-1',
          fileName: 'test1.jpg',
          mediaType: MediaType.IMAGE,
          isActive: true,
          albums: []
        },
        {
          id: 'test-id-2',
          fileName: 'test2.jpg',
          mediaType: MediaType.IMAGE,
          isActive: true,
          albums: []
        }
      ];

      (prisma.media.createMany as jest.Mock).mockResolvedValue({ count: 2 });
      (prisma.media.findMany as jest.Mock).mockResolvedValue(mockCreatedMedia);
      (prisma.media.count as jest.Mock).mockResolvedValue(2);

      const result = await repository.bulkCreate(bulkCreateData);

      expect(result).toEqual(mockCreatedMedia);
      expect(prisma.media.createMany).toHaveBeenCalledWith({
        data: bulkCreateData.media.map(item => ({
          fileName: item.fileName,
          originalName: item.originalName,
          filePath: item.filePath,
          fileSize: item.fileSize,
          mimeType: item.mimeType,
          mediaType: item.mediaType,
          altText: item.altText,
          caption: item.caption,
          width: item.width,
          height: item.height,
          duration: item.duration,
          isActive: item.isActive,
        }))
      });
    });
  });

  describe('bulkUpdate', () => {
    it('should bulk update media', async () => {
      const bulkUpdateData = {
        ids: ['test-id-1', 'test-id-2'],
        updates: {
          altText: { en: 'Updated Test Image', ne: 'अपडेटेड परीक्षण छवि' },
          isActive: false,
        }
      };

      const mockUpdatedMedia = [
        {
          id: 'test-id-1',
          fileName: 'test1.jpg',
          mediaType: MediaType.IMAGE,
          isActive: false,
          albums: []
        },
        {
          id: 'test-id-2',
          fileName: 'test2.jpg',
          mediaType: MediaType.IMAGE,
          isActive: false,
          albums: []
        }
      ];

      (prisma.media.update as jest.Mock)
        .mockResolvedValueOnce(mockUpdatedMedia[0])
        .mockResolvedValueOnce(mockUpdatedMedia[1]);

      const result = await repository.bulkUpdate(bulkUpdateData);

      expect(result).toEqual(mockUpdatedMedia);
      expect(prisma.media.update).toHaveBeenCalledTimes(2);
    });
  });

  describe('bulkDelete', () => {
    it('should bulk delete media', async () => {
      (prisma.media.deleteMany as jest.Mock).mockResolvedValue(undefined);

      await repository.bulkDelete(['test-id-1', 'test-id-2']);

      expect(prisma.media.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['test-id-1', 'test-id-2'] } }
      });
    });
  });
}); 