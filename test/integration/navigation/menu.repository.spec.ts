import { Test, TestingModule } from '@nestjs/testing';
import { MenuRepository } from '../../../src/modules/navigation/repositories/menu.repository';
import { PrismaService } from '../../../src/database/prisma.service';
import { Menu } from '../../../src/modules/navigation/entities/menu.entity';
import { MenuLocation } from '@prisma/client';
import { CreateMenuDto, UpdateMenuDto } from '../../../src/modules/navigation/dto/menu.dto';

describe('MenuRepository', () => {
  let repository: MenuRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuRepository,
        {
          provide: PrismaService,
          useValue: {
            menu: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            menuItem: {
              count: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<MenuRepository>(MenuRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find menu by ID', async () => {
      const mockMenu = {
        id: 'test-id',
        name: { en: 'Test Menu', ne: 'परीक्षण मेनु' },
        description: { en: 'Test Description', ne: 'परीक्षण विवरण' },
        location: MenuLocation.HEADER,
        isActive: true,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        menuItems: []
      };

      (prisma.menu.findUnique as jest.Mock).mockResolvedValue(mockMenu);

      const result = await repository.findById('test-id');

      expect(result).toEqual(mockMenu);
      expect(prisma.menu.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        include: {
          menuItems: {
            where: { isActive: true },
            orderBy: { order: 'asc' }
          },
          createdBy: true,
          updatedBy: true
        }
      });
    });

    it('should return null when menu not found', async () => {
      (prisma.menu.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all menus with pagination', async () => {
      const mockMenus = [
        {
          id: 'test-id-1',
          name: { en: 'Test Menu 1', ne: 'परीक्षण मेनु १' },
          location: MenuLocation.HEADER,
          isActive: true,
          isPublished: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          menuItems: []
        },
        {
          id: 'test-id-2',
          name: { en: 'Test Menu 2', ne: 'परीक्षण मेनु २' },
          location: MenuLocation.FOOTER,
          isActive: true,
          isPublished: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          menuItems: []
        }
      ];

      const mockTotal = 2;
      const query = { page: 1, limit: 10 };

      (prisma.menu.findMany as jest.Mock).mockResolvedValue(mockMenus);
      (prisma.menu.count as jest.Mock).mockResolvedValue(mockTotal);

      const result = await repository.findAll(query);

      expect(result.data).toEqual(mockMenus);
      expect(result.pagination.total).toBe(mockTotal);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });
  });

  describe('findActive', () => {
    it('should find active menus', async () => {
      const mockMenus = [
        {
          id: 'test-id-1',
          name: { en: 'Test Menu 1', ne: 'परीक्षण मेनु १' },
          location: MenuLocation.HEADER,
          isActive: true,
          isPublished: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          menuItems: []
        }
      ];

      const mockTotal = 1;
      const query = { page: 1, limit: 10 };

      (prisma.menu.findMany as jest.Mock).mockResolvedValue(mockMenus);
      (prisma.menu.count as jest.Mock).mockResolvedValue(mockTotal);

      const result = await repository.findActive(query);

      expect(result.data).toEqual(mockMenus);
      expect(prisma.menu.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: {
          menuItems: {
            where: { isActive: true },
            orderBy: { order: 'asc' }
          },
          createdBy: true,
          updatedBy: true
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
    });
  });

  describe('findPublished', () => {
    it('should find published menus', async () => {
      const mockMenus = [
        {
          id: 'test-id-1',
          name: { en: 'Test Menu 1', ne: 'परीक्षण मेनु १' },
          location: MenuLocation.HEADER,
          isActive: true,
          isPublished: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          menuItems: []
        }
      ];

      const mockTotal = 1;
      const query = { page: 1, limit: 10 };

      (prisma.menu.findMany as jest.Mock).mockResolvedValue(mockMenus);
      (prisma.menu.count as jest.Mock).mockResolvedValue(mockTotal);

      const result = await repository.findPublished(query);

      expect(result.data).toEqual(mockMenus);
      expect(prisma.menu.findMany).toHaveBeenCalledWith({
        where: { isPublished: true },
        include: {
          menuItems: {
            where: { isActive: true, isPublished: true },
            orderBy: { order: 'asc' }
          },
          createdBy: true,
          updatedBy: true
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
    });
  });

  describe('findByLocation', () => {
    it('should find menus by location', async () => {
      const mockMenus = [
        {
          id: 'test-id',
          name: { en: 'Test Menu', ne: 'परीक्षण मेनु' },
          location: MenuLocation.HEADER,
          isActive: true,
          isPublished: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          menuItems: []
        }
      ];

      (prisma.menu.findMany as jest.Mock).mockResolvedValue(mockMenus);

      const result = await repository.findByLocation(MenuLocation.HEADER);

      expect(result).toEqual(mockMenus);
      expect(prisma.menu.findMany).toHaveBeenCalledWith({
        where: { 
          location: MenuLocation.HEADER,
          isActive: true,
          isPublished: true
        },
        include: {
          menuItems: {
            where: { isActive: true, isPublished: true },
            orderBy: { order: 'asc' },
            include: {
              children: {
                where: { isActive: true, isPublished: true },
                orderBy: { order: 'asc' },
              },
            },
          },
          createdBy: true,
          updatedBy: true
        },
        orderBy: { createdAt: 'asc' }
      });
    });

    it('should return empty array when no menus found for location', async () => {
      (prisma.menu.findMany as jest.Mock).mockResolvedValue([]);

      const result = await repository.findByLocation(MenuLocation.SIDEBAR);

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create menu', async () => {
      const createData: CreateMenuDto = {
        name: { en: 'Test Menu', ne: 'परीक्षण मेनु' },
        description: { en: 'Test Description', ne: 'परीक्षण विवरण' },
        location: MenuLocation.HEADER,
        isActive: true,
        isPublished: false
      };

      const mockCreatedMenu = {
        id: 'test-id',
        ...createData,
        createdAt: new Date(),
        updatedAt: new Date(),
        menuItems: []
      };

      (prisma.menu.create as jest.Mock).mockResolvedValue(mockCreatedMenu);

      const result = await repository.create(createData, 'user-id');

      expect(result).toEqual(mockCreatedMenu);
      expect(prisma.menu.create).toHaveBeenCalledWith({
        data: {
          ...createData,
          createdBy: { connect: { id: 'user-id' } },
          updatedBy: { connect: { id: 'user-id' } }
        },
        include: {
          menuItems: {
            where: { isActive: true },
            orderBy: { order: 'asc' }
          },
          createdBy: true,
          updatedBy: true
        }
      });
    });
  });

  describe('update', () => {
    it('should update menu', async () => {
      const updateData: UpdateMenuDto = {
        name: { en: 'Updated Test Menu', ne: 'अपडेटेड परीक्षण मेनु' },
        isPublished: true
      };

      const mockUpdatedMenu = {
        id: 'test-id',
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
        menuItems: []
      };

      (prisma.menu.update as jest.Mock).mockResolvedValue(mockUpdatedMenu);

      const result = await repository.update('test-id', updateData, 'user-id');

      expect(result).toEqual(mockUpdatedMenu);
      expect(prisma.menu.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: {
          ...updateData,
          updatedBy: { connect: { id: 'user-id' } }
        },
        include: {
          menuItems: {
            where: { isActive: true },
            orderBy: { order: 'asc' }
          },
          createdBy: true,
          updatedBy: true
        }
      });
    });
  });

  describe('delete', () => {
    it('should delete menu', async () => {
      (prisma.menu.delete as jest.Mock).mockResolvedValue(undefined);

      await repository.delete('test-id');

      expect(prisma.menu.delete).toHaveBeenCalledWith({
        where: { id: 'test-id' }
      });
    });
  });

  describe('publish', () => {
    it('should publish menu', async () => {
      const mockPublishedMenu = {
        id: 'test-id',
        name: { en: 'Test Menu', ne: 'परीक्षण मेनु' },
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        menuItems: []
      };

      (prisma.menu.update as jest.Mock).mockResolvedValue(mockPublishedMenu);

      const result = await repository.publish('test-id', 'user-id');

      expect(result).toEqual(mockPublishedMenu);
      expect(prisma.menu.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: {
          isPublished: true,
          updatedBy: { connect: { id: 'user-id' } }
        },
        include: {
          menuItems: {
            where: { isActive: true },
            orderBy: { order: 'asc' }
          },
          createdBy: true,
          updatedBy: true
        }
      });
    });
  });

  describe('unpublish', () => {
    it('should unpublish menu', async () => {
      const mockUnpublishedMenu = {
        id: 'test-id',
        name: { en: 'Test Menu', ne: 'परीक्षण मेनु' },
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        menuItems: []
      };

      (prisma.menu.update as jest.Mock).mockResolvedValue(mockUnpublishedMenu);

      const result = await repository.unpublish('test-id', 'user-id');

      expect(result).toEqual(mockUnpublishedMenu);
      expect(prisma.menu.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: {
          isPublished: false,
          updatedBy: { connect: { id: 'user-id' } }
        },
        include: {
          menuItems: {
            where: { isActive: true },
            orderBy: { order: 'asc' }
          },
          createdBy: true,
          updatedBy: true
        }
      });
    });
  });

  describe('findWithItems', () => {
    it('should find menu with items', async () => {
      const mockMenu = {
        id: 'test-id',
        name: { en: 'Test Menu', ne: 'परीक्षण मेनु' },
        location: MenuLocation.HEADER,
        isActive: true,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        menuItems: [
          {
            id: 'item-1',
            title: { en: 'Item 1', ne: 'आइटम १' },
            order: 1
          }
        ]
      };

      (prisma.menu.findUnique as jest.Mock).mockResolvedValue(mockMenu);

      const result = await repository.findWithItems('test-id');

      expect(result).toEqual(mockMenu);
      expect(prisma.menu.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        include: {
          menuItems: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
            include: {
              children: {
                where: { isActive: true },
                orderBy: { order: 'asc' }
              }
            }
          },
          createdBy: true,
          updatedBy: true
        }
      });
    });
  });

  describe('getStatistics', () => {
    it('should get menu statistics', async () => {
      const mockStats = {
        total: 10,
        active: 8,
        published: 6,
        byLocation: {
          HEADER: 3,
          FOOTER: 2,
          SIDEBAR: 1
        },
        averageItemsPerMenu: 5.5
      };

      (prisma.menu.count as jest.Mock)
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(8)  // active
        .mockResolvedValueOnce(6); // published
      (prisma.menuItem.count as jest.Mock).mockResolvedValue(55);

      const result = await repository.getStatistics();

      expect(result).toEqual(mockStats);
      expect(prisma.menu.count).toHaveBeenCalledTimes(3);
      expect(prisma.menuItem.count).toHaveBeenCalledTimes(1);
    });
  });

  describe('getMenuTree', () => {
    it('should get menu tree', async () => {
      const mockMenu = {
        id: 'test-id',
        name: { en: 'Test Menu', ne: 'परीक्षण मेनु' },
        location: MenuLocation.HEADER,
        isActive: true,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        menuItems: [
          {
            id: 'item-1',
            title: { en: 'Item 1', ne: 'आइटम १' },
            order: 1,
            children: []
          }
        ]
      };

      (prisma.menu.findUnique as jest.Mock).mockResolvedValue(mockMenu);

      const result = await repository.getMenuTree('test-id');

      expect(result).toEqual({
        menu: mockMenu,
        items: mockMenu.menuItems
      });
    });
  });
}); 