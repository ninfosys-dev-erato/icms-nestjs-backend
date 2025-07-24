import { Test, TestingModule } from '@nestjs/testing';
import { MediaAlbumService } from '../../../src/modules/media/services/media-album.service';
import { MediaAlbumRepository } from '../../../src/modules/media/repositories/media-album.repository';
import { MediaAlbum } from '../../../src/modules/media/entities/media-album.entity';
import { 
  CreateMediaAlbumDto, 
  UpdateMediaAlbumDto,
  AlbumStatistics
} from '../../../src/modules/media/dto/media.dto';

describe('MediaAlbumService', () => {
  let service: MediaAlbumService;
  let mediaAlbumRepository: MediaAlbumRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaAlbumService,
        {
          provide: MediaAlbumRepository,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            findActive: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            addMediaToAlbum: jest.fn(),
            removeMediaFromAlbum: jest.fn(),
            findWithMediaCount: jest.fn(),
            getStatistics: jest.fn(),
            reorderMediaInAlbum: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MediaAlbumService>(MediaAlbumService);
    mediaAlbumRepository = module.get<MediaAlbumRepository>(MediaAlbumRepository);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAlbumById', () => {
    it('should get album by ID', async () => {
      const mockAlbum = {
        id: 'test-id',
        name: { en: 'Test Album', ne: 'परीक्षण एल्बम' },
        description: { en: 'Test Description', ne: 'परीक्षण विवरण' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        media: []
      };

      const expectedResult = {
        ...mockAlbum,
        mediaCount: 0
      };

      (mediaAlbumRepository.findById as jest.Mock).mockResolvedValue(mockAlbum);

      const result = await service.getAlbumById('test-id');

      expect(result).toEqual(expectedResult);
      expect(mediaAlbumRepository.findById).toHaveBeenCalledWith('test-id');
    });

    it('should throw error when album not found', async () => {
      (mediaAlbumRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.getAlbumById('non-existent-id')).rejects.toThrow('Album not found');
    });
  });

  describe('getAllAlbums', () => {
    it('should get all albums', async () => {
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

      const expectedResult = mockAlbums.map(album => ({
        ...album,
        description: undefined,
        mediaCount: 0
      }));

      (mediaAlbumRepository.findAll as jest.Mock).mockResolvedValue(mockAlbums);

      const result = await service.getAllAlbums();

      expect(result).toEqual(expectedResult);
      expect(mediaAlbumRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('getActiveAlbums', () => {
    it('should get active albums', async () => {
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

      const expectedResult = mockAlbums.map(album => ({
        ...album,
        description: undefined,
        mediaCount: 0
      }));

      (mediaAlbumRepository.findActive as jest.Mock).mockResolvedValue(mockAlbums);

      const result = await service.getActiveAlbums();

      expect(result).toEqual(expectedResult);
      expect(mediaAlbumRepository.findActive).toHaveBeenCalled();
    });
  });

  describe('createAlbum', () => {
    it('should create album', async () => {
      const createData: CreateMediaAlbumDto = {
        name: { en: 'Test Album', ne: 'परीक्षण एल्बम' },
        description: { en: 'Test Description', ne: 'परीक्षण विवरण' },
        isActive: true,
      };

      const mockCreatedAlbum = {
        id: 'test-id',
        ...createData,
        createdAt: new Date(),
        updatedAt: new Date(),
        media: []
      };

      const expectedResult = {
        ...mockCreatedAlbum,
        mediaCount: 0
      };

      (mediaAlbumRepository.create as jest.Mock).mockResolvedValue(mockCreatedAlbum);

      const result = await service.createAlbum(createData);

      expect(result).toEqual(expectedResult);
      expect(mediaAlbumRepository.create).toHaveBeenCalledWith(createData);
    });
  });

  describe('updateAlbum', () => {
    it('should update album', async () => {
      const updateData: UpdateMediaAlbumDto = {
        name: { en: 'Updated Test Album', ne: 'अपडेटेड परीक्षण एल्बम' },
        isActive: false,
      };

      const mockUpdatedAlbum = {
        id: 'test-id',
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
        media: []
      };

      const expectedResult = {
        ...mockUpdatedAlbum,
        description: undefined,
        mediaCount: 0
      };

      (mediaAlbumRepository.update as jest.Mock).mockResolvedValue(mockUpdatedAlbum);

      const result = await service.updateAlbum('test-id', updateData);

      expect(result).toEqual(expectedResult);
      expect(mediaAlbumRepository.update).toHaveBeenCalledWith('test-id', updateData);
    });
  });

  describe('deleteAlbum', () => {
    it('should delete album successfully', async () => {
      const mockAlbum = {
        id: 'test-id',
        name: { en: 'Test Album', ne: 'परीक्षण एल्बम' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        media: []
      };

      (mediaAlbumRepository.findById as jest.Mock).mockResolvedValue(mockAlbum);
      (mediaAlbumRepository.delete as jest.Mock).mockResolvedValue(undefined);

      await service.deleteAlbum('test-id');

      expect(mediaAlbumRepository.findById).toHaveBeenCalledWith('test-id');
      expect(mediaAlbumRepository.delete).toHaveBeenCalledWith('test-id');
    });

    it('should throw error when album not found', async () => {
      (mediaAlbumRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteAlbum('non-existent-id')).rejects.toThrow('Album not found');
    });
  });

  describe('addMediaToAlbum', () => {
    it('should add media to album', async () => {
      const mockAlbum = {
        id: 'album-id',
        name: { en: 'Test Album', ne: 'परीक्षण एल्बम' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        media: []
      };

      (mediaAlbumRepository.findById as jest.Mock).mockResolvedValue(mockAlbum);
      (mediaAlbumRepository.addMediaToAlbum as jest.Mock).mockResolvedValue(undefined);

      await service.addMediaToAlbum('album-id', 'media-id');

      expect(mediaAlbumRepository.findById).toHaveBeenCalledWith('album-id');
      expect(mediaAlbumRepository.addMediaToAlbum).toHaveBeenCalledWith('album-id', 'media-id');
    });
  });

  describe('removeMediaFromAlbum', () => {
    it('should remove media from album', async () => {
      const mockAlbum = {
        id: 'album-id',
        name: { en: 'Test Album', ne: 'परीक्षण एल्बम' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        media: []
      };

      (mediaAlbumRepository.findById as jest.Mock).mockResolvedValue(mockAlbum);
      (mediaAlbumRepository.removeMediaFromAlbum as jest.Mock).mockResolvedValue(undefined);

      await service.removeMediaFromAlbum('album-id', 'media-id');

      expect(mediaAlbumRepository.findById).toHaveBeenCalledWith('album-id');
      expect(mediaAlbumRepository.removeMediaFromAlbum).toHaveBeenCalledWith('album-id', 'media-id');
    });
  });

  describe('reorderMediaInAlbum', () => {
    it('should reorder media in album', async () => {
      const mockAlbum = {
        id: 'album-id',
        name: { en: 'Test Album', ne: 'परीक्षण एल्बम' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        media: []
      };

      const mediaIds = ['media-1', 'media-2', 'media-3'];

      (mediaAlbumRepository.findById as jest.Mock).mockResolvedValue(mockAlbum);
      (mediaAlbumRepository.reorderMediaInAlbum as jest.Mock).mockResolvedValue(undefined);

      await service.reorderMediaInAlbum('album-id', mediaIds);

      expect(mediaAlbumRepository.findById).toHaveBeenCalledWith('album-id');
      expect(mediaAlbumRepository.reorderMediaInAlbum).toHaveBeenCalledWith('album-id', mediaIds);
    });
  });

  describe('validateAlbum', () => {
    it('should validate album successfully', async () => {
      const albumData = {
        name: { en: 'Test Album', ne: 'परीक्षण एल्बम' },
        description: { en: 'Test Description', ne: 'परीक्षण विवरण' },
        isActive: true,
      };

      const result = await service.validateAlbum(albumData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return validation errors for invalid album', async () => {
      const albumData = {
        name: { en: '', ne: '' },
        description: { en: 'Test Description', ne: 'परीक्षण विवरण' },
        isActive: true,
      };

      const result = await service.validateAlbum(albumData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getAlbumStatistics', () => {
    it('should get album statistics', async () => {
      const mockStats: AlbumStatistics = {
        total: 10,
        active: 8,
        withMedia: 6,
        averageMediaPerAlbum: 2.5,
      };

      (mediaAlbumRepository.getStatistics as jest.Mock).mockResolvedValue(mockStats);

      const result = await service.getAlbumStatistics();

      expect(result).toEqual(mockStats);
      expect(mediaAlbumRepository.getStatistics).toHaveBeenCalled();
    });
  });

  describe('exportAlbum', () => {
    it('should export album as JSON', async () => {
      const mockAlbum = {
        id: 'test-id',
        name: { en: 'Test Album', ne: 'परीक्षण एल्बम' },
        description: { en: 'Test Description', ne: 'परीक्षण विवरण' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        media: [
          {
            id: 'media-1',
            media: {
              id: 'media-1',
              fileName: 'test1.jpg',
              mediaType: 'IMAGE',
              isActive: true,
            }
          }
        ]
      };

      (mediaAlbumRepository.findById as jest.Mock).mockResolvedValue(mockAlbum);

      const result = await service.exportAlbum('test-id', 'json');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toContain('Test Album');
      expect(mediaAlbumRepository.findById).toHaveBeenCalledWith('test-id');
    });

    it('should throw error for ZIP export (not implemented)', async () => {
      const mockAlbum = {
        id: 'test-id',
        name: { en: 'Test Album', ne: 'परीक्षण एल्बम' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        media: []
      };

      (mediaAlbumRepository.findById as jest.Mock).mockResolvedValue(mockAlbum);

      await expect(service.exportAlbum('test-id', 'zip')).rejects.toThrow('ZIP export not implemented yet');
    });

    it('should throw error when album not found', async () => {
      (mediaAlbumRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.exportAlbum('non-existent-id', 'json')).rejects.toThrow('Album not found');
    });
  });

  // Remove the transformToResponseDto test since it's a private method
}); 