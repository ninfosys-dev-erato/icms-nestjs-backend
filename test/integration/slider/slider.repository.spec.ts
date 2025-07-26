import { Test, TestingModule } from '@nestjs/testing';
import { SliderRepository } from '../../../src/modules/slider/repositories/slider.repository';
import { PrismaService } from '../../../src/database/prisma.service';
import { Slider } from '../../../src/modules/slider/entities/slider.entity';
import { 
  CreateSliderDto, 
  UpdateSliderDto, 
  SliderQueryDto,
  SliderStatistics,
  PaginationInfo
} from '../../../src/modules/slider/dto/slider.dto';

describe('SliderRepository', () => {
  let repository: SliderRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SliderRepository,
        {
          provide: PrismaService,
          useValue: {
            slider: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
              groupBy: jest.fn(),
            },
            sliderClick: {
              count: jest.fn(),
            },
            sliderView: {
              count: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<SliderRepository>(SliderRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find slider by ID', async () => {
      const mockSlider = {
        id: 'test-id',
        title: { en: 'Test Slider', ne: 'परीक्षण स्लाइडर' },
        position: 1,
        displayTime: 5000,
        isActive: true,
        mediaId: 'media-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        media: {
          id: 'media-id',
          fileName: 'test-image.jpg',
          mediaType: 'IMAGE',
        },
      };

      (prisma.slider.findUnique as jest.Mock).mockResolvedValue(mockSlider);

      const result = await repository.findById('test-id');

      expect(result).toEqual(mockSlider);
      expect(prisma.slider.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        include: {
          media: true
        }
      });
    });

    it('should return null when slider not found', async () => {
      (prisma.slider.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all sliders with pagination', async () => {
      const mockSliders = [
        {
          id: 'test-id-1',
          title: { en: 'Test Slider 1', ne: 'परीक्षण स्लाइडर १' },
          position: 1,
          displayTime: 5000,
          isActive: true,
          mediaId: 'media-id-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          media: { id: 'media-id-1', fileName: 'test-image-1.jpg' },
        },
        {
          id: 'test-id-2',
          title: { en: 'Test Slider 2', ne: 'परीक्षण स्लाइडर २' },
          position: 2,
          displayTime: 4000,
          isActive: true,
          mediaId: 'media-id-2',
          createdAt: new Date(),
          updatedAt: new Date(),
          media: { id: 'media-id-2', fileName: 'test-image-2.jpg' },
        },
      ];

      const query: SliderQueryDto = { page: 1, limit: 10 };

      (prisma.slider.findMany as jest.Mock).mockResolvedValue(mockSliders);
      (prisma.slider.count as jest.Mock).mockResolvedValue(2);

      const result = await repository.findAll(query);

      expect(result.data).toEqual(mockSliders);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
      expect(prisma.slider.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { position: 'asc' },
        include: { media: true }
      });
    });

    it('should find sliders with filters', async () => {
      const mockSliders = [
        {
          id: 'test-id-1',
          title: { en: 'Active Slider', ne: 'सक्रिय स्लाइडर' },
          position: 1,
          displayTime: 5000,
          isActive: true,
          mediaId: 'media-id-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          media: { id: 'media-id-1', fileName: 'test-image-1.jpg' },
        },
      ];

      const query: SliderQueryDto = { 
        page: 1, 
        limit: 10, 
        isActive: true, 
        position: 1 
      };

      (prisma.slider.findMany as jest.Mock).mockResolvedValue(mockSliders);
      (prisma.slider.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.findAll(query);

      expect(result.data).toEqual(mockSliders);
      expect(prisma.slider.findMany).toHaveBeenCalledWith({
        where: { isActive: true, position: 1 },
        skip: 0,
        take: 10,
        orderBy: { position: 'asc' },
        include: { media: true }
      });
    });

    it('should find sliders with date range filter', async () => {
      const dateFrom = new Date('2024-01-01');
      const dateTo = new Date('2024-12-31');
      
      const query: SliderQueryDto = { 
        page: 1, 
        limit: 10, 
        dateFrom, 
        dateTo 
      };

      (prisma.slider.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.slider.count as jest.Mock).mockResolvedValue(0);

      await repository.findAll(query);

      expect(prisma.slider.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: dateFrom,
            lte: dateTo,
          }
        },
        skip: 0,
        take: 10,
        orderBy: { position: 'asc' },
        include: { media: true }
      });
    });

    it('should find sliders with custom sorting', async () => {
      const query: SliderQueryDto = { 
        page: 1, 
        limit: 10, 
        sort: 'createdAt', 
        order: 'desc' 
      };

      (prisma.slider.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.slider.count as jest.Mock).mockResolvedValue(0);

      await repository.findAll(query);

      expect(prisma.slider.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { media: true }
      });
    });
  });

  describe('findActive', () => {
    it('should find active sliders', async () => {
      const mockSliders = [
        {
          id: 'test-id-1',
          title: { en: 'Active Slider', ne: 'सक्रिय स्लाइडर' },
          position: 1,
          displayTime: 5000,
          isActive: true,
          mediaId: 'media-id-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          media: { id: 'media-id-1', fileName: 'test-image-1.jpg' },
        },
      ];

      const query: SliderQueryDto = { page: 1, limit: 10 };

      (prisma.slider.findMany as jest.Mock).mockResolvedValue(mockSliders);
      (prisma.slider.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.findActive(query);

      expect(result.data).toEqual(mockSliders);
      expect(prisma.slider.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        skip: 0,
        take: 10,
        orderBy: { position: 'asc' },
        include: { media: true }
      });
    });
  });

  describe('findPublished', () => {
    it('should find published sliders', async () => {
      const mockSliders = [
        {
          id: 'test-id-1',
          title: { en: 'Published Slider', ne: 'प्रकाशित स्लाइडर' },
          position: 1,
          displayTime: 5000,
          isActive: true,
          mediaId: 'media-id-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          media: { id: 'media-id-1', fileName: 'test-image-1.jpg' },
        },
      ];

      const query: SliderQueryDto = { page: 1, limit: 10 };

      (prisma.slider.findMany as jest.Mock).mockResolvedValue(mockSliders);
      (prisma.slider.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.findPublished(query);

      expect(result.data).toEqual(mockSliders);
      expect(prisma.slider.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        skip: 0,
        take: 10,
        orderBy: { position: 'asc' },
        include: { media: true }
      });
    });
  });

  describe('findByPosition', () => {
    it('should find sliders by position', async () => {
      const mockSliders = [
        {
          id: 'test-id-1',
          title: { en: 'Position 1 Slider', ne: 'स्थिति १ स्लाइडर' },
          position: 1,
          displayTime: 5000,
          isActive: true,
          mediaId: 'media-id-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          media: { id: 'media-id-1', fileName: 'test-image-1.jpg' },
        },
      ];

      (prisma.slider.findMany as jest.Mock).mockResolvedValue(mockSliders);

      const result = await repository.findByPosition(1);

      expect(result).toEqual(mockSliders);
      expect(prisma.slider.findMany).toHaveBeenCalledWith({
        where: { position: 1 },
        include: { media: true },
        orderBy: { createdAt: 'asc' }
      });
    });
  });

  describe('search', () => {
    it('should search sliders by title', async () => {
      const mockSliders = [
        {
          id: 'test-id-1',
          title: { en: 'Test Slider', ne: 'परीक्षण स्लाइडर' },
          position: 1,
          displayTime: 5000,
          isActive: true,
          mediaId: 'media-id-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          media: { id: 'media-id-1', fileName: 'test-image-1.jpg' },
        },
      ];

      const searchTerm = 'Test';
      const query: SliderQueryDto = { page: 1, limit: 10 };

      (prisma.slider.findMany as jest.Mock).mockResolvedValue(mockSliders);
      (prisma.slider.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.search(searchTerm, query);

      expect(result.data).toEqual(mockSliders);
      expect(prisma.slider.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              title: {
                path: ['en'],
                string_contains: searchTerm
              }
            },
            {
              title: {
                path: ['ne'],
                string_contains: searchTerm
              }
            }
          ]
        },
        skip: 0,
        take: 10,
        orderBy: { position: 'asc' },
        include: { media: true }
      });
    });
  });

  describe('create', () => {
    it('should create slider', async () => {
      const createData: CreateSliderDto = {
        title: { en: 'New Slider', ne: 'नयाँ स्लाइडर' },
        position: 1,
        displayTime: 5000,
        isActive: true,
        mediaId: 'media-id',
      };

      const mockCreatedSlider = {
        id: 'test-id',
        ...createData,
        createdAt: new Date(),
        updatedAt: new Date(),
        media: { id: 'media-id', fileName: 'test-image.jpg' },
      };

      (prisma.slider.create as jest.Mock).mockResolvedValue(mockCreatedSlider);

      const result = await repository.create(createData, 'user-id');

      expect(result).toEqual(mockCreatedSlider);
      expect(prisma.slider.create).toHaveBeenCalledWith({
        data: {
          title: createData.title,
          position: createData.position,
          displayTime: createData.displayTime,
          isActive: true,
          mediaId: createData.mediaId
        },
        include: { media: true }
      });
    });
  });

  describe('update', () => {
    it('should update slider', async () => {
      const updateData: UpdateSliderDto = {
        title: { en: 'Updated Slider', ne: 'अपडेटेड स्लाइडर' },
        displayTime: 4000,
      };

      const mockUpdatedSlider = {
        id: 'test-id',
        title: updateData.title,
        position: 1,
        displayTime: 4000,
        isActive: true,
        mediaId: 'media-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        media: { id: 'media-id', fileName: 'test-image.jpg' },
      };

      (prisma.slider.update as jest.Mock).mockResolvedValue(mockUpdatedSlider);

      const result = await repository.update('test-id', updateData, 'user-id');

      expect(result).toEqual(mockUpdatedSlider);
      expect(prisma.slider.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: {
          title: updateData.title,
          position: updateData.position,
          displayTime: updateData.displayTime,
          isActive: updateData.isActive,
          mediaId: updateData.mediaId
        },
        include: { media: true }
      });
    });
  });

  describe('delete', () => {
    it('should delete slider', async () => {
      (prisma.slider.delete as jest.Mock).mockResolvedValue(undefined);

      await repository.delete('test-id');

      expect(prisma.slider.delete).toHaveBeenCalledWith({
        where: { id: 'test-id' }
      });
    });
  });

  describe('publish', () => {
    it('should publish slider', async () => {
      const mockPublishedSlider = {
        id: 'test-id',
        title: { en: 'Published Slider', ne: 'प्रकाशित स्लाइडर' },
        position: 1,
        displayTime: 5000,
        isActive: true,
        mediaId: 'media-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        media: { id: 'media-id', fileName: 'test-image.jpg' },
      };

      (prisma.slider.update as jest.Mock).mockResolvedValue(mockPublishedSlider);

      const result = await repository.publish('test-id', 'user-id');

      expect(result).toEqual(mockPublishedSlider);
      expect(prisma.slider.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: { isActive: true },
        include: { media: true }
      });
    });
  });

  describe('unpublish', () => {
    it('should unpublish slider', async () => {
      const mockUnpublishedSlider = {
        id: 'test-id',
        title: { en: 'Unpublished Slider', ne: 'अप्रकाशित स्लाइडर' },
        position: 1,
        displayTime: 5000,
        isActive: false,
        mediaId: 'media-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        media: { id: 'media-id', fileName: 'test-image.jpg' },
      };

      (prisma.slider.update as jest.Mock).mockResolvedValue(mockUnpublishedSlider);

      const result = await repository.unpublish('test-id', 'user-id');

      expect(result).toEqual(mockUnpublishedSlider);
      expect(prisma.slider.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: { isActive: false },
        include: { media: true }
      });
    });
  });

  describe('reorder', () => {
    it('should reorder sliders', async () => {
      const orders = [
        { id: 'slider-1', position: 2 },
        { id: 'slider-2', position: 1 },
      ];

      const mockUpdates = orders.map(order => 
        Promise.resolve({
          id: order.id,
          position: order.position,
        })
      );

      (prisma.slider.update as jest.Mock)
        .mockResolvedValueOnce(mockUpdates[0])
        .mockResolvedValueOnce(mockUpdates[1]);
      (prisma.$transaction as jest.Mock).mockResolvedValue(mockUpdates);

      await repository.reorder(orders);

      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('getStatistics', () => {
    it('should get slider statistics', async () => {
      const mockGroupBy = [
        { position: 1, _count: { position: 5 } },
        { position: 2, _count: { position: 3 } },
      ];

      (prisma.slider.count as jest.Mock)
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(8); // active
      (prisma.slider.groupBy as jest.Mock).mockResolvedValue(mockGroupBy);
      (prisma.sliderClick.count as jest.Mock).mockResolvedValue(150);
      (prisma.sliderView.count as jest.Mock).mockResolvedValue(2500);

      const result = await repository.getStatistics();

      expect(result).toEqual({
        total: 10,
        active: 8,
        published: 8,
        totalClicks: 150,
        totalViews: 2500,
        averageClickThroughRate: 6.0,
        byPosition: { 1: 5, 2: 3 }
      });
    });
  });

  describe('getActiveSlidersForDisplay', () => {
    it('should get active sliders for display', async () => {
      const mockSliders = [
        {
          id: 'test-id-1',
          title: { en: 'Display Slider 1', ne: 'प्रदर्शन स्लाइडर १' },
          position: 1,
          displayTime: 5000,
          isActive: true,
          mediaId: 'media-id-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          media: { id: 'media-id-1', fileName: 'test-image-1.jpg' },
        },
      ];

      (prisma.slider.findMany as jest.Mock).mockResolvedValue(mockSliders);

      const result = await repository.getActiveSlidersForDisplay();

      expect(result).toEqual(mockSliders);
      expect(prisma.slider.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: { media: true },
        orderBy: { position: 'asc' }
      });
    });
  });

  describe('findByMedia', () => {
    it('should find sliders by media ID', async () => {
      const mockSliders = [
        {
          id: 'test-id-1',
          title: { en: 'Media Slider', ne: 'मिडिया स्लाइडर' },
          position: 1,
          displayTime: 5000,
          isActive: true,
          mediaId: 'media-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          media: { id: 'media-id', fileName: 'test-image.jpg' },
        },
      ];

      (prisma.slider.findMany as jest.Mock).mockResolvedValue(mockSliders);

      const result = await repository.findByMedia('media-id');

      expect(result).toEqual(mockSliders);
      expect(prisma.slider.findMany).toHaveBeenCalledWith({
        where: { mediaId: 'media-id' },
        include: { media: true }
      });
    });
  });

  describe('isSliderActive', () => {
    it('should return true for active slider', async () => {
      (prisma.slider.findUnique as jest.Mock).mockResolvedValue({
        isActive: true
      });

      const result = await repository.isSliderActive('test-id');

      expect(result).toBe(true);
      expect(prisma.slider.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        select: { isActive: true }
      });
    });

    it('should return false for inactive slider', async () => {
      (prisma.slider.findUnique as jest.Mock).mockResolvedValue({
        isActive: false
      });

      const result = await repository.isSliderActive('test-id');

      expect(result).toBe(false);
    });

    it('should return false for non-existent slider', async () => {
      (prisma.slider.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.isSliderActive('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      (prisma.slider.findMany as jest.Mock).mockRejectedValue(error);

      const query: SliderQueryDto = { page: 1, limit: 10 };

      await expect(repository.findAll(query)).rejects.toThrow('Database connection failed');
    });

    it('should handle update errors', async () => {
      const error = new Error('Record not found');
      (prisma.slider.update as jest.Mock).mockRejectedValue(error);

      const updateData: UpdateSliderDto = {
        title: { en: 'Updated Slider', ne: 'अपडेटेड स्लाइडर' },
      };

      await expect(repository.update('non-existent-id', updateData, 'user-id')).rejects.toThrow('Record not found');
    });

    it('should handle delete errors', async () => {
      const error = new Error('Record not found');
      (prisma.slider.delete as jest.Mock).mockRejectedValue(error);

      await expect(repository.delete('non-existent-id')).rejects.toThrow('Record not found');
    });
  });

  describe('Data Transformation', () => {
    it('should handle translatable entities correctly', async () => {
      const mockSlider = {
        id: 'test-id',
        title: { en: 'English Title', ne: 'नेपाली शीर्षक' },
        position: 1,
        displayTime: 5000,
        isActive: true,
        mediaId: 'media-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        media: { id: 'media-id', fileName: 'test-image.jpg' },
      };

      (prisma.slider.findUnique as jest.Mock).mockResolvedValue(mockSlider);

      const result = await repository.findById('test-id');

      expect(result).toEqual(mockSlider);
      expect(result.title).toEqual({ en: 'English Title', ne: 'नेपाली शीर्षक' });
    });

    it('should handle optional fields correctly', async () => {
      const mockSlider = {
        id: 'test-id',
        title: null,
        position: 1,
        displayTime: 5000,
        isActive: true,
        mediaId: 'media-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        media: { id: 'media-id', fileName: 'test-image.jpg' },
      };

      (prisma.slider.findUnique as jest.Mock).mockResolvedValue(mockSlider);

      const result = await repository.findById('test-id');

      expect(result).toEqual(mockSlider);
      expect(result.title).toBeNull();
    });
  });
}); 