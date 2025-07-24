import { Test, TestingModule } from '@nestjs/testing';
import { HeaderConfigRepository } from '../../../src/modules/header/repositories/header-config.repository';
import { PrismaService } from '../../../src/database/prisma.service';
import { HeaderConfig } from '../../../src/modules/header/entities/header-config.entity';
import { CreateHeaderConfigDto, UpdateHeaderConfigDto, HeaderConfigQueryDto, HeaderAlignment } from '../../../src/modules/header/dto/header.dto';

describe('HeaderConfigRepository', () => {
  let repository: HeaderConfigRepository;
  let prismaService: jest.Mocked<PrismaService>;

  const mockHeaderConfig: HeaderConfig = {
    id: '1',
    name: {
      en: 'Main Header',
      ne: 'मुख्य हेडर',
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
      leftLogo: null,
      rightLogo: null,
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
        HeaderConfigRepository,
        {
          provide: PrismaService,
          useValue: {
            headerConfig: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
              groupBy: jest.fn(),
              aggregate: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<HeaderConfigRepository>(HeaderConfigRepository);
    prismaService = module.get(PrismaService);
  });

  describe('findById', () => {
    it('should find header config by id', async () => {
      (prismaService.headerConfig.findUnique as jest.Mock).mockResolvedValue(mockHeaderConfig);

      const result = await repository.findById('1');

      expect(result).toEqual(mockHeaderConfig);
      expect(prismaService.headerConfig.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null when header config not found', async () => {
      (prismaService.headerConfig.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all header configs with pagination', async () => {
      const mockData = [mockHeaderConfig];
      const mockCount = 1;

      (prismaService.headerConfig.findMany as jest.Mock).mockResolvedValue(mockData);
      (prismaService.headerConfig.count as jest.Mock).mockResolvedValue(mockCount);

      const query: HeaderConfigQueryDto = { page: 1, limit: 10 };
      const result = await repository.findAll(query);

      expect(result.data).toEqual(mockData);
      expect(result.pagination.total).toBe(mockCount);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should apply filters correctly', async () => {
      const mockData = [mockHeaderConfig];
      const mockCount = 1;

      (prismaService.headerConfig.findMany as jest.Mock).mockResolvedValue(mockData);
      (prismaService.headerConfig.count as jest.Mock).mockResolvedValue(mockCount);

      const query: HeaderConfigQueryDto = { 
        isActive: true, 
        isPublished: false,
        sort: 'createdAt',
        order: 'desc'
      };
      const result = await repository.findAll(query);

      expect(prismaService.headerConfig.findMany).toHaveBeenCalledWith({
        where: { isActive: true, isPublished: false },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findActive', () => {
    it('should find active header configs', async () => {
      const mockData = [mockHeaderConfig];
      const mockCount = 1;

      (prismaService.headerConfig.findMany as jest.Mock).mockResolvedValue(mockData);
      (prismaService.headerConfig.count as jest.Mock).mockResolvedValue(mockCount);

      const query: HeaderConfigQueryDto = { page: 1, limit: 10 };
      const result = await repository.findActive(query);

      expect(result.data).toEqual(mockData);
      expect(prismaService.headerConfig.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        skip: 0,
        take: 10,
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('findPublished', () => {
    it('should find published header configs', async () => {
      const mockData = [mockHeaderConfig];
      const mockCount = 1;

      (prismaService.headerConfig.findMany as jest.Mock).mockResolvedValue(mockData);
      (prismaService.headerConfig.count as jest.Mock).mockResolvedValue(mockCount);

      const query: HeaderConfigQueryDto = { page: 1, limit: 10 };
      const result = await repository.findPublished(query);

      expect(result.data).toEqual(mockData);
      expect(prismaService.headerConfig.findMany).toHaveBeenCalledWith({
        where: { isActive: true, isPublished: true },
        skip: 0,
        take: 10,
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('findByOrder', () => {
    it('should find header config by order', async () => {
      (prismaService.headerConfig.findFirst as jest.Mock).mockResolvedValue(mockHeaderConfig);

      const result = await repository.findByOrder(1);

      expect(result).toEqual(mockHeaderConfig);
      expect(prismaService.headerConfig.findFirst).toHaveBeenCalledWith({
        where: { order: 1 },
      });
    });
  });

  describe('search', () => {
    it('should search header configs by name', async () => {
      const mockData = [mockHeaderConfig];
      const mockCount = 1;

      (prismaService.headerConfig.findMany as jest.Mock).mockResolvedValue(mockData);
      (prismaService.headerConfig.count as jest.Mock).mockResolvedValue(mockCount);

      const query: HeaderConfigQueryDto = { page: 1, limit: 10 };
      const result = await repository.search('Main', query);

      expect(result.data).toEqual(mockData);
      expect(prismaService.headerConfig.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              name: {
                path: ['en'],
                string_contains: 'Main',
              },
            },
            {
              name: {
                path: ['ne'],
                string_contains: 'Main',
              },
            },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('create', () => {
    it('should create new header config', async () => {
      const createData: CreateHeaderConfigDto = {
        name: mockHeaderConfig.name,
        typography: mockHeaderConfig.typography,
        alignment: HeaderAlignment.LEFT,
        logo: mockHeaderConfig.logo,
        layout: mockHeaderConfig.layout,
        order: 1,
        isActive: true,
        isPublished: true,
      };

      const prismaHeaderConfig = {
        id: '1',
        name: createData.name,
        order: createData.order,
        isActive: createData.isActive,
        isPublished: createData.isPublished,
        typography: createData.typography,
        alignment: createData.alignment,
        logo: createData.logo,
        layout: createData.layout,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'test-user',
        updatedBy: 'test-user',
      };

      (prismaService.headerConfig.create as jest.Mock).mockResolvedValue(prismaHeaderConfig);

      const result = await repository.create(createData, 'test-user');

      expect(result).toEqual(expect.objectContaining({
        id: mockHeaderConfig.id,
        name: mockHeaderConfig.name,
        order: mockHeaderConfig.order,
        isActive: mockHeaderConfig.isActive,
        isPublished: mockHeaderConfig.isPublished,
      }));
      expect(prismaService.headerConfig.create).toHaveBeenCalledWith({
        data: {
          name: createData.name,
          order: createData.order,
          isActive: createData.isActive,
          isPublished: createData.isPublished,
          typography: createData.typography,
          alignment: createData.alignment,
          logo: createData.logo,
          layout: createData.layout,
          createdById: 'test-user',
          updatedById: 'test-user',
        },
      });
    });
  });

  describe('update', () => {
    it('should update existing header config', async () => {
      const updateData: UpdateHeaderConfigDto = {
        name: {
          en: 'Updated Header',
          ne: 'अपडेटेड हेडर',
        },
        order: 5,
      };

      const prismaHeaderConfig = {
        id: '1',
        name: updateData.name,
        order: updateData.order,
        isActive: mockHeaderConfig.isActive,
        isPublished: mockHeaderConfig.isPublished,
        typography: mockHeaderConfig.typography,
        alignment: mockHeaderConfig.alignment,
        logo: mockHeaderConfig.logo,
        layout: mockHeaderConfig.layout,
        createdAt: mockHeaderConfig.createdAt,
        updatedAt: new Date(),
        createdBy: mockHeaderConfig.createdBy,
        updatedBy: 'test-user',
      };

      (prismaService.headerConfig.update as jest.Mock).mockResolvedValue(prismaHeaderConfig);

      const result = await repository.update('1', updateData, 'test-user');

      expect(result.name).toEqual(updateData.name);
      expect(result.order).toBe(updateData.order);
      expect(prismaService.headerConfig.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: updateData.name,
          order: updateData.order,
          updatedById: 'test-user',
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete header config', async () => {
      (prismaService.headerConfig.delete as jest.Mock).mockResolvedValue(undefined);

      await repository.delete('1');

      expect(prismaService.headerConfig.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('publish', () => {
    it('should publish header config', async () => {
      const publishedConfig = { ...mockHeaderConfig, isPublished: true };
      (prismaService.headerConfig.update as jest.Mock).mockResolvedValue(publishedConfig);

      const result = await repository.publish('1', 'test-user');

      expect(result.isPublished).toBe(true);
      expect(prismaService.headerConfig.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          isPublished: true,
          updatedById: 'test-user',
        },
      });
    });
  });

  describe('unpublish', () => {
    it('should unpublish header config', async () => {
      const unpublishedConfig = { ...mockHeaderConfig, isPublished: false };
      (prismaService.headerConfig.update as jest.Mock).mockResolvedValue(unpublishedConfig);

      const result = await repository.unpublish('1', 'test-user');

      expect(result.isPublished).toBe(false);
      expect(prismaService.headerConfig.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          isPublished: false,
          updatedById: 'test-user',
        },
      });
    });
  });

  describe('reorder', () => {
    it('should reorder header configs', async () => {
      const orders = [
        { id: '1', order: 1 },
        { id: '2', order: 2 },
      ];

      (prismaService.headerConfig.update as jest.Mock).mockResolvedValue(undefined);

      await repository.reorder(orders);

      expect(prismaService.headerConfig.update).toHaveBeenCalledTimes(2);
    });
  });

  describe('getActiveHeaderConfig', () => {
    it('should get active header config for display', async () => {
      (prismaService.headerConfig.findFirst as jest.Mock).mockResolvedValue(mockHeaderConfig);

      const result = await repository.getActiveHeaderConfig();

      expect(result).toEqual(mockHeaderConfig);
      expect(prismaService.headerConfig.findFirst).toHaveBeenCalledWith({
        where: {
          isActive: true,
          isPublished: true,
        },
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('getStatistics', () => {
    it('should get header config statistics', async () => {
      const mockStats = {
        total: 10,
        active: 8,
        published: 5,
        byAlignment: { LEFT: 3, CENTER: 4, RIGHT: 2, JUSTIFY: 1 },
        averageOrder: 2.5,
      };

      (prismaService.headerConfig.count as jest.Mock)
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(8)  // active
        .mockResolvedValueOnce(5); // published

      (prismaService.headerConfig.groupBy as jest.Mock).mockResolvedValue([
        { alignment: 'LEFT', _count: { alignment: 3 } },
        { alignment: 'CENTER', _count: { alignment: 4 } },
        { alignment: 'RIGHT', _count: { alignment: 2 } },
        { alignment: 'JUSTIFY', _count: { alignment: 1 } },
      ]);

      (prismaService.headerConfig.aggregate as jest.Mock).mockResolvedValue({
        _avg: { order: 2.5 },
      });

      const result = await repository.getStatistics();

      expect(result).toEqual(mockStats);
    });
  });

  describe('findByLogo', () => {
    it('should return empty array for logo search', async () => {
      const result = await repository.findByLogo('media-id');

      expect(result).toEqual([]);
    });
  });
}); 