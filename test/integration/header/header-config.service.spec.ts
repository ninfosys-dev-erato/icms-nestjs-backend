import { Test, TestingModule } from '@nestjs/testing';
import { HeaderConfigService } from '../../../src/modules/header/services/header-config.service';
import { HeaderConfigRepository } from '../../../src/modules/header/repositories/header-config.repository';
import { HeaderConfig } from '../../../src/modules/header/entities/header-config.entity';
import { CreateHeaderConfigDto, UpdateHeaderConfigDto, HeaderConfigQueryDto, HeaderAlignment } from '../../../src/modules/header/dto/header.dto';

describe('HeaderConfigService', () => {
  let service: HeaderConfigService;
  let repository: jest.Mocked<HeaderConfigRepository>;

  const mockHeaderConfig: HeaderConfig = {
    id: '1',
    name: {
      en: 'Test Header',
      ne: 'परीक्षण हेडर',
    },
    order: 1,
    isActive: true,
    isPublished: true,
    typography: {
      fontFamily: 'Arial, sans-serif',
      fontSize: 16,
      fontWeight: 'normal',
      color: '#333333',
      lineHeight: 1.5,
      letterSpacing: 0.5,
    },
    alignment: HeaderAlignment.LEFT,
    logo: {
      leftLogo: undefined,
      rightLogo: undefined,
      logoAlignment: 'left',
      logoSpacing: 20,
    },
    layout: {
      headerHeight: 80,
      backgroundColor: '#ffffff',
      padding: { top: 10, right: 20, bottom: 10, left: 20 },
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'test-user',
    updatedBy: 'test-user',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HeaderConfigService,
        {
          provide: HeaderConfigRepository,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            findActive: jest.fn(),
            findPublished: jest.fn(),
            findByOrder: jest.fn(),
            search: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            publish: jest.fn(),
            unpublish: jest.fn(),
            reorder: jest.fn(),
            getActiveHeaderConfig: jest.fn(),
            getStatistics: jest.fn(),
            findByLogo: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HeaderConfigService>(HeaderConfigService);
    repository = module.get(HeaderConfigRepository);
  });

  describe('getHeaderConfigById', () => {
    it('should return header config by id', async () => {
      repository.findById.mockResolvedValue(mockHeaderConfig);

      const result = await service.getHeaderConfigById('1');

      expect(result).toBeDefined();
      expect(result.id).toBe('1');
      expect(repository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw error when header config not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getHeaderConfigById('999')).rejects.toThrow('Header configuration not found');
    });
  });

  describe('getAllHeaderConfigs', () => {
    it('should return all header configs with pagination', async () => {
      const mockResult = {
        data: [mockHeaderConfig],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      repository.findAll.mockResolvedValue(mockResult);

      const query: HeaderConfigQueryDto = { page: 1, limit: 10 };
      const result = await service.getAllHeaderConfigs(query);

      expect(result).toEqual(mockResult);
      expect(repository.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('createHeaderConfig', () => {
    it('should create new header config', async () => {
      const createData: CreateHeaderConfigDto = {
        name: mockHeaderConfig.name,
        typography: mockHeaderConfig.typography,
        alignment: HeaderAlignment.LEFT,
        logo: mockHeaderConfig.logo,
        layout: mockHeaderConfig.layout,
        order: 1,
        isActive: true,
        isPublished: false,
      };

      repository.create.mockResolvedValue(mockHeaderConfig);

      const result = await service.createHeaderConfig(createData, 'test-user');

      expect(result).toBeDefined();
      expect(result.id).toBe('1');
      expect(repository.create).toHaveBeenCalledWith(createData, 'test-user');
    });
  });

  describe('updateHeaderConfig', () => {
    it('should update existing header config', async () => {
      const updateData: UpdateHeaderConfigDto = {
        name: {
          en: 'Updated Header',
          ne: 'अपडेटेड हेडर',
        },
        order: 2,
      };

      const updatedConfig = { ...mockHeaderConfig, ...updateData };
      repository.findById.mockResolvedValue(mockHeaderConfig);
      repository.update.mockResolvedValue(updatedConfig);

      const result = await service.updateHeaderConfig('1', updateData, 'test-user');

      expect(result).toBeDefined();
      expect(result.name).toEqual(updateData.name);
      expect(result.order).toBe(updateData.order);
      expect(repository.update).toHaveBeenCalledWith('1', updateData, 'test-user');
    });
  });

  describe('deleteHeaderConfig', () => {
    it('should delete header config', async () => {
      repository.findById.mockResolvedValue(mockHeaderConfig);
      repository.delete.mockResolvedValue(undefined);

      await service.deleteHeaderConfig('1');

      expect(repository.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('publishHeaderConfig', () => {
    it('should publish header config', async () => {
      const publishedConfig = { ...mockHeaderConfig, isPublished: true };
      repository.findById.mockResolvedValue(mockHeaderConfig);
      repository.publish.mockResolvedValue(publishedConfig);

      const result = await service.publishHeaderConfig('1', 'test-user');

      expect(result.isPublished).toBe(true);
      expect(repository.publish).toHaveBeenCalledWith('1', 'test-user');
    });
  });

  describe('unpublishHeaderConfig', () => {
    it('should unpublish header config', async () => {
      const unpublishedConfig = { ...mockHeaderConfig, isPublished: false };
      repository.findById.mockResolvedValue(mockHeaderConfig);
      repository.unpublish.mockResolvedValue(unpublishedConfig);

      const result = await service.unpublishHeaderConfig('1', 'test-user');

      expect(result.isPublished).toBe(false);
      expect(repository.unpublish).toHaveBeenCalledWith('1', 'test-user');
    });
  });

  describe('searchHeaderConfigs', () => {
    it('should search header configs', async () => {
      const mockResult = {
        data: [mockHeaderConfig],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      repository.search.mockResolvedValue(mockResult);

      const query: HeaderConfigQueryDto = { page: 1, limit: 10 };
      const result = await service.searchHeaderConfigs('test', query);

      expect(result).toEqual(mockResult);
      expect(repository.search).toHaveBeenCalledWith('test', query);
    });
  });

  describe('getHeaderConfigStatistics', () => {
    it('should return header config statistics', async () => {
      const mockStats = {
        total: 10,
        active: 8,
        published: 5,
        byAlignment: { LEFT: 3, CENTER: 4, RIGHT: 2, JUSTIFY: 1 },
        averageOrder: 2.5,
      };

      repository.getStatistics.mockResolvedValue(mockStats);

      const result = await service.getHeaderConfigStatistics();

      expect(result).toEqual(mockStats);
      expect(repository.getStatistics).toHaveBeenCalled();
    });
  });

  describe('getActiveHeaderConfigForDisplay', () => {
    it('should return active header config for display', async () => {
      repository.getActiveHeaderConfig.mockResolvedValue(mockHeaderConfig);

      const result = await service.getActiveHeaderConfigForDisplay();

      expect(result).toBeDefined();
      expect(result.id).toBe('1');
      expect(repository.getActiveHeaderConfig).toHaveBeenCalled();
    });

    it('should throw error when no active header config found', async () => {
      repository.getActiveHeaderConfig.mockResolvedValue(null);

      await expect(service.getActiveHeaderConfigForDisplay()).rejects.toThrow('No active header configuration found');
    });
  });
}); 