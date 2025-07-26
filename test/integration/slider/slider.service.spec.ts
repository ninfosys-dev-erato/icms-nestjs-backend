import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SliderService } from '../../../src/modules/slider/services/slider.service';
import { SliderRepository } from '../../../src/modules/slider/repositories/slider.repository';
import { SliderClickRepository } from '../../../src/modules/slider/repositories/slider-click.repository';
import { SliderViewRepository } from '../../../src/modules/slider/repositories/slider-view.repository';
import { 
  CreateSliderDto, 
  UpdateSliderDto, 
  SliderQueryDto,
  SliderResponseDto,
  SliderStatistics,
  SliderAnalytics,
  ValidationResult,
  ValidationError,
  BulkOperationResult,
  PaginationInfo
} from '../../../src/modules/slider/dto/slider.dto';

describe('SliderService', () => {
  let service: SliderService;
  let sliderRepository: SliderRepository;
  let sliderClickRepository: SliderClickRepository;
  let sliderViewRepository: SliderViewRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SliderService,
        {
          provide: SliderRepository,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            findActive: jest.fn(),
            findPublished: jest.fn(),
            findByPosition: jest.fn(),
            search: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            publish: jest.fn(),
            unpublish: jest.fn(),
            reorder: jest.fn(),
            getStatistics: jest.fn(),
            getActiveSlidersForDisplay: jest.fn(),
          },
        },
        {
          provide: SliderClickRepository,
          useValue: {
            create: jest.fn(),
            getClickCount: jest.fn(),
            getClicksByDate: jest.fn(),
          },
        },
        {
          provide: SliderViewRepository,
          useValue: {
            create: jest.fn(),
            getViewCount: jest.fn(),
            getViewsByDate: jest.fn(),
            getAverageViewDuration: jest.fn(),
            findBySliderId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SliderService>(SliderService);
    sliderRepository = module.get<SliderRepository>(SliderRepository);
    sliderClickRepository = module.get<SliderClickRepository>(SliderClickRepository);
    sliderViewRepository = module.get<SliderViewRepository>(SliderViewRepository);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSliderById', () => {
    it('should get slider by ID', async () => {
      const mockSlider = {
        id: 'test-id',
        title: { en: 'Test Slider', ne: 'परीक्षण स्लाइडर' },
        position: 1,
        displayTime: 5000,
        isActive: true,
        mediaId: 'media-id',
        media: { id: 'media-id', fileName: 'test-image.jpg' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (sliderRepository.findById as jest.Mock).mockResolvedValue(mockSlider);
      (sliderClickRepository.getClickCount as jest.Mock).mockResolvedValue(10);
      (sliderViewRepository.getViewCount as jest.Mock).mockResolvedValue(200);

      const result = await service.getSliderById('test-id');

      expect(result).toBeDefined();
      expect(result.id).toBe('test-id');
      expect(result.clickCount).toBe(10);
      expect(result.viewCount).toBe(200);
      expect(result.clickThroughRate).toBe(5.0);
      expect(sliderRepository.findById).toHaveBeenCalledWith('test-id');
    });

    it('should throw error when slider not found', async () => {
      (sliderRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.getSliderById('non-existent-id')).rejects.toThrow('Slider not found');
    });
  });

  describe('getAllSliders', () => {
    it('should get all sliders', async () => {
      const mockSliders = [
        {
          id: 'test-id-1',
          title: { en: 'Test Slider 1', ne: 'परीक्षण स्लाइडर १' },
          position: 1,
          displayTime: 5000,
          isActive: true,
          mediaId: 'media-id-1',
          media: { id: 'media-id-1', fileName: 'test-image-1.jpg' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockResult = {
        data: mockSliders,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      (sliderRepository.findAll as jest.Mock).mockResolvedValue(mockResult);
      (sliderClickRepository.getClickCount as jest.Mock).mockResolvedValue(5);
      (sliderViewRepository.getViewCount as jest.Mock).mockResolvedValue(100);

      const query: SliderQueryDto = { page: 1, limit: 10 };
      const result = await service.getAllSliders(query);

      expect(result.data).toBeDefined();
      expect(result.data.length).toBe(1);
      expect(result.pagination).toEqual(mockResult.pagination);
      expect(sliderRepository.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('getActiveSliders', () => {
    it('should get active sliders', async () => {
      const mockSliders = [
        {
          id: 'test-id-1',
          title: { en: 'Active Slider', ne: 'सक्रिय स्लाइडर' },
          position: 1,
          displayTime: 5000,
          isActive: true,
          mediaId: 'media-id-1',
          media: { id: 'media-id-1', fileName: 'test-image-1.jpg' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockResult = {
        data: mockSliders,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      (sliderRepository.findActive as jest.Mock).mockResolvedValue(mockResult);
      (sliderClickRepository.getClickCount as jest.Mock).mockResolvedValue(8);
      (sliderViewRepository.getViewCount as jest.Mock).mockResolvedValue(150);

      const query: SliderQueryDto = { page: 1, limit: 10 };
      const result = await service.getActiveSliders(query);

      expect(result.data).toBeDefined();
      expect(result.data.length).toBe(1);
      expect(sliderRepository.findActive).toHaveBeenCalledWith(query);
    });
  });

  describe('getPublishedSliders', () => {
    it('should get published sliders', async () => {
      const mockSliders = [
        {
          id: 'test-id-1',
          title: { en: 'Published Slider', ne: 'प्रकाशित स्लाइडर' },
          position: 1,
          displayTime: 5000,
          isActive: true,
          mediaId: 'media-id-1',
          media: { id: 'media-id-1', fileName: 'test-image-1.jpg' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockResult = {
        data: mockSliders,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      (sliderRepository.findPublished as jest.Mock).mockResolvedValue(mockResult);
      (sliderClickRepository.getClickCount as jest.Mock).mockResolvedValue(12);
      (sliderViewRepository.getViewCount as jest.Mock).mockResolvedValue(300);

      const query: SliderQueryDto = { page: 1, limit: 10 };
      const result = await service.getPublishedSliders(query);

      expect(result.data).toBeDefined();
      expect(result.data.length).toBe(1);
      expect(sliderRepository.findPublished).toHaveBeenCalledWith(query);
    });
  });

  describe('getSlidersByPosition', () => {
    it('should get sliders by position', async () => {
      const mockSliders = [
        {
          id: 'test-id-1',
          title: { en: 'Position 1 Slider', ne: 'स्थिति १ स्लाइडर' },
          position: 1,
          displayTime: 5000,
          isActive: true,
          mediaId: 'media-id-1',
          media: { id: 'media-id-1', fileName: 'test-image-1.jpg' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (sliderRepository.findByPosition as jest.Mock).mockResolvedValue(mockSliders);
      (sliderClickRepository.getClickCount as jest.Mock).mockResolvedValue(6);
      (sliderViewRepository.getViewCount as jest.Mock).mockResolvedValue(120);

      const result = await service.getSlidersByPosition(1);

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(sliderRepository.findByPosition).toHaveBeenCalledWith(1);
    });
  });

  describe('searchSliders', () => {
    it('should search sliders', async () => {
      const mockSliders = [
        {
          id: 'test-id-1',
          title: { en: 'Test Slider', ne: 'परीक्षण स्लाइडर' },
          position: 1,
          displayTime: 5000,
          isActive: true,
          mediaId: 'media-id-1',
          media: { id: 'media-id-1', fileName: 'test-image-1.jpg' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockResult = {
        data: mockSliders,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      (sliderRepository.search as jest.Mock).mockResolvedValue(mockResult);
      (sliderClickRepository.getClickCount as jest.Mock).mockResolvedValue(3);
      (sliderViewRepository.getViewCount as jest.Mock).mockResolvedValue(80);

      const searchTerm = 'Test';
      const query: SliderQueryDto = { page: 1, limit: 10 };
      const result = await service.searchSliders(searchTerm, query);

      expect(result.data).toBeDefined();
      expect(result.data.length).toBe(1);
      expect(sliderRepository.search).toHaveBeenCalledWith(searchTerm, query);
    });
  });

  describe('createSlider', () => {
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
        media: { id: 'media-id', fileName: 'test-image.jpg' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (sliderRepository.create as jest.Mock).mockResolvedValue(mockCreatedSlider);
      (sliderClickRepository.getClickCount as jest.Mock).mockResolvedValue(0);
      (sliderViewRepository.getViewCount as jest.Mock).mockResolvedValue(0);

      const result = await service.createSlider(createData, 'user-id');

      expect(result).toBeDefined();
      expect(result.id).toBe('test-id');
      expect(result.title).toEqual(createData.title);
      expect(sliderRepository.create).toHaveBeenCalledWith(createData, 'user-id');
    });

    it('should validate slider before creation', async () => {
      const invalidData: CreateSliderDto = {
        title: { en: 'Test Slider', ne: 'परीक्षण स्लाइडर' },
        position: -1, // Invalid position
        displayTime: 500, // Invalid display time
        isActive: true,
        mediaId: '',
      };

      await expect(service.createSlider(invalidData, 'user-id')).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateSlider', () => {
    it('should update slider', async () => {
      const updateData: UpdateSliderDto = {
        title: { en: 'Updated Slider', ne: 'अपडेटेड स्लाइडर' },
        displayTime: 4000,
      };

      const mockExistingSlider = {
        id: 'test-id',
        title: { en: 'Test Slider', ne: 'परीक्षण स्लाइडर' },
        position: 1,
        displayTime: 5000,
        isActive: true,
        mediaId: 'media-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedSlider = {
        ...mockExistingSlider,
        ...updateData,
        media: { id: 'media-id', fileName: 'test-image.jpg' },
      };

      (sliderRepository.findById as jest.Mock).mockResolvedValue(mockExistingSlider);
      (sliderRepository.update as jest.Mock).mockResolvedValue(mockUpdatedSlider);
      (sliderClickRepository.getClickCount as jest.Mock).mockResolvedValue(5);
      (sliderViewRepository.getViewCount as jest.Mock).mockResolvedValue(100);

      const result = await service.updateSlider('test-id', updateData, 'user-id');

      expect(result).toBeDefined();
      expect(result.title).toEqual(updateData.title);
      expect(result.displayTime).toBe(4000);
      expect(sliderRepository.update).toHaveBeenCalledWith('test-id', updateData, 'user-id');
    });

    it('should throw error when slider not found', async () => {
      (sliderRepository.findById as jest.Mock).mockResolvedValue(null);

      const updateData: UpdateSliderDto = {
        title: { en: 'Updated Slider', ne: 'अपडेटेड स्लाइडर' },
      };

      await expect(service.updateSlider('non-existent-id', updateData, 'user-id')).rejects.toThrow('Slider not found');
    });

    it('should validate update data', async () => {
      const mockExistingSlider = {
        id: 'test-id',
        title: { en: 'Test Slider', ne: 'परीक्षण स्लाइडर' },
        position: 1,
        displayTime: 5000,
        isActive: true,
        mediaId: 'media-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (sliderRepository.findById as jest.Mock).mockResolvedValue(mockExistingSlider);

      const invalidData: UpdateSliderDto = {
        position: -1,
        displayTime: 500,
      };

      await expect(service.updateSlider('test-id', invalidData, 'user-id')).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteSlider', () => {
    it('should delete slider', async () => {
      const mockSlider = {
        id: 'test-id',
        title: { en: 'Test Slider', ne: 'परीक्षण स्लाइडर' },
        position: 1,
        displayTime: 5000,
        isActive: true,
        mediaId: 'media-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (sliderRepository.findById as jest.Mock).mockResolvedValue(mockSlider);
      (sliderRepository.delete as jest.Mock).mockResolvedValue(undefined);

      await service.deleteSlider('test-id');

      expect(sliderRepository.findById).toHaveBeenCalledWith('test-id');
      expect(sliderRepository.delete).toHaveBeenCalledWith('test-id');
    });

    it('should throw error when slider not found', async () => {
      (sliderRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteSlider('non-existent-id')).rejects.toThrow('Slider not found');
    });
  });

  describe('publishSlider', () => {
    it('should publish slider', async () => {
      const mockSlider = {
        id: 'test-id',
        title: { en: 'Test Slider', ne: 'परीक्षण स्लाइडर' },
        position: 1,
        displayTime: 5000,
        isActive: false,
        mediaId: 'media-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPublishedSlider = {
        ...mockSlider,
        isActive: true,
        media: { id: 'media-id', fileName: 'test-image.jpg' },
      };

      (sliderRepository.findById as jest.Mock).mockResolvedValue(mockSlider);
      (sliderRepository.publish as jest.Mock).mockResolvedValue(mockPublishedSlider);
      (sliderClickRepository.getClickCount as jest.Mock).mockResolvedValue(2);
      (sliderViewRepository.getViewCount as jest.Mock).mockResolvedValue(50);

      const result = await service.publishSlider('test-id', 'user-id');

      expect(result).toBeDefined();
      expect(result.isActive).toBe(true);
      expect(sliderRepository.publish).toHaveBeenCalledWith('test-id', 'user-id');
    });

    it('should throw error when slider not found', async () => {
      (sliderRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.publishSlider('non-existent-id', 'user-id')).rejects.toThrow('Slider not found');
    });
  });

  describe('unpublishSlider', () => {
    it('should unpublish slider', async () => {
      const mockSlider = {
        id: 'test-id',
        title: { en: 'Test Slider', ne: 'परीक्षण स्लाइडर' },
        position: 1,
        displayTime: 5000,
        isActive: true,
        mediaId: 'media-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUnpublishedSlider = {
        ...mockSlider,
        isActive: false,
        media: { id: 'media-id', fileName: 'test-image.jpg' },
      };

      (sliderRepository.findById as jest.Mock).mockResolvedValue(mockSlider);
      (sliderRepository.unpublish as jest.Mock).mockResolvedValue(mockUnpublishedSlider);
      (sliderClickRepository.getClickCount as jest.Mock).mockResolvedValue(7);
      (sliderViewRepository.getViewCount as jest.Mock).mockResolvedValue(140);

      const result = await service.unpublishSlider('test-id', 'user-id');

      expect(result).toBeDefined();
      expect(result.isActive).toBe(false);
      expect(sliderRepository.unpublish).toHaveBeenCalledWith('test-id', 'user-id');
    });
  });

  describe('reorderSliders', () => {
    it('should reorder sliders', async () => {
      const orders = [
        { id: 'slider-1', position: 2 },
        { id: 'slider-2', position: 1 },
      ];

      const mockSlider1 = { id: 'slider-1', position: 1 };
      const mockSlider2 = { id: 'slider-2', position: 2 };

      (sliderRepository.findById as jest.Mock)
        .mockResolvedValueOnce(mockSlider1)
        .mockResolvedValueOnce(mockSlider2);
      (sliderRepository.reorder as jest.Mock).mockResolvedValue(undefined);

      await service.reorderSliders(orders);

      expect(sliderRepository.findById).toHaveBeenCalledTimes(2);
      expect(sliderRepository.reorder).toHaveBeenCalledWith(orders);
    });

    it('should throw error when slider not found', async () => {
      const orders = [
        { id: 'non-existent', position: 1 },
      ];

      (sliderRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.reorderSliders(orders)).rejects.toThrow('Slider with ID non-existent not found');
    });
  });

  describe('validateSlider', () => {
    it('should validate slider successfully', async () => {
      const validData: CreateSliderDto = {
        title: { en: 'Valid Slider', ne: 'मान्य स्लाइडर' },
        position: 1,
        displayTime: 5000,
        isActive: true,
        mediaId: 'media-id',
      };

      const result = await service.validateSlider(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return validation errors for invalid position', async () => {
      const invalidData: CreateSliderDto = {
        title: { en: 'Test Slider', ne: 'परीक्षण स्लाइडर' },
        position: -1,
        displayTime: 5000,
        isActive: true,
        mediaId: 'media-id',
      };

      const result = await service.validateSlider(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].field).toBe('position');
    });

    it('should return validation errors for invalid display time', async () => {
      const invalidData: CreateSliderDto = {
        title: { en: 'Test Slider', ne: 'परीक्षण स्लाइडर' },
        position: 1,
        displayTime: 500,
        isActive: true,
        mediaId: 'media-id',
      };

      const result = await service.validateSlider(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.field === 'displayTime')).toBe(true);
    });

    it('should return validation errors for invalid media ID', async () => {
      const invalidData: CreateSliderDto = {
        title: { en: 'Test Slider', ne: 'परीक्षण स्लाइडर' },
        position: 1,
        displayTime: 5000,
        isActive: true,
        mediaId: '',
      };

      const result = await service.validateSlider(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.field === 'mediaId')).toBe(true);
    });
  });

  describe('getSliderStatistics', () => {
    it('should get slider statistics', async () => {
      const mockStatistics: SliderStatistics = {
        total: 10,
        active: 8,
        published: 7,
        totalClicks: 150,
        totalViews: 2500,
        averageClickThroughRate: 6.0,
        byPosition: { 1: 5, 2: 3, 3: 2 },
      };

      (sliderRepository.getStatistics as jest.Mock).mockResolvedValue(mockStatistics);

      const result = await service.getSliderStatistics();

      expect(result).toEqual(mockStatistics);
      expect(sliderRepository.getStatistics).toHaveBeenCalled();
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
          media: { id: 'media-id-1', fileName: 'test-image-1.jpg' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (sliderRepository.getActiveSlidersForDisplay as jest.Mock).mockResolvedValue(mockSliders);
      (sliderClickRepository.getClickCount as jest.Mock).mockResolvedValue(4);
      (sliderViewRepository.getViewCount as jest.Mock).mockResolvedValue(90);

      const result = await service.getActiveSlidersForDisplay();

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(sliderRepository.getActiveSlidersForDisplay).toHaveBeenCalled();
    });
  });

  describe('recordSliderClick', () => {
    it('should record slider click', async () => {
      const mockSlider = {
        id: 'test-id',
        title: { en: 'Test Slider', ne: 'परीक्षण स्लाइडर' },
        position: 1,
        displayTime: 5000,
        isActive: true,
        mediaId: 'media-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (sliderRepository.findById as jest.Mock).mockResolvedValue(mockSlider);
      (sliderClickRepository.create as jest.Mock).mockResolvedValue({});

      await service.recordSliderClick('test-id', '192.168.1.1', 'Mozilla/5.0', 'user-id');

      expect(sliderRepository.findById).toHaveBeenCalledWith('test-id');
      expect(sliderClickRepository.create).toHaveBeenCalledWith({
        sliderId: 'test-id',
        userId: 'user-id',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });
    });

    it('should throw error when slider not found', async () => {
      (sliderRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.recordSliderClick('non-existent-id', '192.168.1.1', 'Mozilla/5.0')).rejects.toThrow('Slider not found');
    });
  });

  describe('recordSliderView', () => {
    it('should record slider view', async () => {
      const mockSlider = {
        id: 'test-id',
        title: { en: 'Test Slider', ne: 'परीक्षण स्लाइडर' },
        position: 1,
        displayTime: 5000,
        isActive: true,
        mediaId: 'media-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (sliderRepository.findById as jest.Mock).mockResolvedValue(mockSlider);
      (sliderViewRepository.create as jest.Mock).mockResolvedValue({});

      await service.recordSliderView('test-id', '192.168.1.1', 'Mozilla/5.0', 'user-id', 3000);

      expect(sliderRepository.findById).toHaveBeenCalledWith('test-id');
      expect(sliderViewRepository.create).toHaveBeenCalledWith({
        sliderId: 'test-id',
        userId: 'user-id',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        viewDuration: 3000,
      });
    });

    it('should throw error when slider not found', async () => {
      (sliderRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.recordSliderView('non-existent-id', '192.168.1.1', 'Mozilla/5.0')).rejects.toThrow('Slider not found');
    });
  });

  describe('getSliderAnalytics', () => {
    it('should get slider analytics', async () => {
      const mockSlider = {
        id: 'test-id',
        title: { en: 'Test Slider', ne: 'परीक्षण स्लाइडर' },
        position: 1,
        displayTime: 5000,
        isActive: true,
        mediaId: 'media-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockViews = [
        { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)' },
        { userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0)' },
      ];

      (sliderRepository.findById as jest.Mock).mockResolvedValue(mockSlider);
      (sliderClickRepository.getClickCount as jest.Mock).mockResolvedValue(15);
      (sliderViewRepository.getViewCount as jest.Mock).mockResolvedValue(300);
      (sliderClickRepository.getClicksByDate as jest.Mock).mockResolvedValue({ '2024-01-01': 10, '2024-01-02': 5 });
      (sliderViewRepository.getViewsByDate as jest.Mock).mockResolvedValue({ '2024-01-01': 200, '2024-01-02': 100 });
      (sliderViewRepository.getAverageViewDuration as jest.Mock).mockResolvedValue(4500);
      (sliderViewRepository.findBySliderId as jest.Mock).mockResolvedValue(mockViews);

      const result = await service.getSliderAnalytics('test-id');

      expect(result).toBeDefined();
      expect(result.sliderId).toBe('test-id');
      expect(result.totalClicks).toBe(15);
      expect(result.totalViews).toBe(300);
      expect(result.clickThroughRate).toBe(5.0);
      expect(result.averageViewDuration).toBe(4500);
      expect(result.deviceBreakdown.desktop).toBe(1);
      expect(result.deviceBreakdown.mobile).toBe(1);
      expect(result.deviceBreakdown.tablet).toBe(1);
    });

    it('should throw error when slider not found', async () => {
      (sliderRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.getSliderAnalytics('non-existent-id')).rejects.toThrow('Slider not found');
    });
  });

  describe('bulkPublish', () => {
    it('should bulk publish sliders', async () => {
      const ids = ['slider-1', 'slider-2'];
      
      const mockSlider1 = { id: 'slider-1', isActive: false };
      const mockSlider2 = { id: 'slider-2', isActive: false };
      const mockPublishedSlider1 = { ...mockSlider1, isActive: true };
      const mockPublishedSlider2 = { ...mockSlider2, isActive: true };

      (sliderRepository.findById as jest.Mock)
        .mockResolvedValueOnce(mockSlider1)
        .mockResolvedValueOnce(mockSlider2);
      (sliderRepository.publish as jest.Mock)
        .mockResolvedValueOnce(mockPublishedSlider1)
        .mockResolvedValueOnce(mockPublishedSlider2);
      (sliderClickRepository.getClickCount as jest.Mock).mockResolvedValue(0);
      (sliderViewRepository.getViewCount as jest.Mock).mockResolvedValue(0);

      const result = await service.bulkPublish(ids, 'user-id');

      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
    });

    it('should handle errors during bulk publish', async () => {
      const ids = ['slider-1', 'non-existent'];
      
      (sliderRepository.findById as jest.Mock)
        .mockResolvedValueOnce({ id: 'slider-1' })
        .mockResolvedValueOnce(null);

      const result = await service.bulkPublish(ids, 'user-id');

      expect(result.success).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors.length).toBe(1);
    });
  });

  describe('bulkUnpublish', () => {
    it('should bulk unpublish sliders', async () => {
      const ids = ['slider-1', 'slider-2'];
      
      const mockSlider1 = { id: 'slider-1', isActive: true };
      const mockSlider2 = { id: 'slider-2', isActive: true };
      const mockUnpublishedSlider1 = { ...mockSlider1, isActive: false };
      const mockUnpublishedSlider2 = { ...mockSlider2, isActive: false };

      (sliderRepository.findById as jest.Mock)
        .mockResolvedValueOnce(mockSlider1)
        .mockResolvedValueOnce(mockSlider2);
      (sliderRepository.unpublish as jest.Mock)
        .mockResolvedValueOnce(mockUnpublishedSlider1)
        .mockResolvedValueOnce(mockUnpublishedSlider2);
      (sliderClickRepository.getClickCount as jest.Mock).mockResolvedValue(0);
      (sliderViewRepository.getViewCount as jest.Mock).mockResolvedValue(0);

      const result = await service.bulkUnpublish(ids, 'user-id');

      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
    });
  });

  describe('bulkDelete', () => {
    it('should bulk delete sliders', async () => {
      const ids = ['slider-1', 'slider-2'];
      
      (sliderRepository.findById as jest.Mock)
        .mockResolvedValueOnce({ id: 'slider-1' })
        .mockResolvedValueOnce({ id: 'slider-2' });
      (sliderRepository.delete as jest.Mock).mockResolvedValue(undefined);

      const result = await service.bulkDelete(ids);

      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
    });
  });

  describe('transformToResponseDto', () => {
    it('should transform slider to response DTO', async () => {
      const mockSlider = {
        id: 'test-id',
        title: { en: 'Test Slider', ne: 'परीक्षण स्लाइडर' },
        position: 1,
        displayTime: 5000,
        isActive: true,
        media: { id: 'media-id', fileName: 'test-image.jpg' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (sliderRepository.findById as jest.Mock).mockResolvedValue(mockSlider);
      (sliderClickRepository.getClickCount as jest.Mock).mockResolvedValue(25);
      (sliderViewRepository.getViewCount as jest.Mock).mockResolvedValue(500);

      const result = await service.getSliderById('test-id');

      expect(result.id).toBe('test-id');
      expect(result.title).toEqual({ en: 'Test Slider', ne: 'परीक्षण स्लाइडर' });
      expect(result.clickCount).toBe(25);
      expect(result.viewCount).toBe(500);
      expect(result.clickThroughRate).toBe(5.0);
    });
  });

  describe('Error Handling', () => {
    it('should handle export errors', async () => {
      const query: SliderQueryDto = { page: 1, limit: 10 };
      
      await expect(service.exportSliders(query, 'csv')).rejects.toThrow('Export format not implemented yet');
      await expect(service.exportSliders(query, 'pdf')).rejects.toThrow('Export format not implemented yet');
    });

    it('should handle import errors', async () => {
      const mockFile = {} as Express.Multer.File;
      
      await expect(service.importSliders(mockFile, 'user-id')).rejects.toThrow('Import functionality not implemented yet');
    });
  });
}); 