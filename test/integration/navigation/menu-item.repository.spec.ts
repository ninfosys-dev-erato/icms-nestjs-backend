import { Test, TestingModule } from '@nestjs/testing';
import { MenuItemRepository } from '../../../src/modules/navigation/repositories/menu-item.repository';
import { PrismaService } from '../../../src/database/prisma.service';
import { MenuItem } from '../../../src/modules/navigation/entities/menu-item.entity';
import { MenuItemType } from '@prisma/client';
import { CreateMenuItemDto, UpdateMenuItemDto } from '../../../src/modules/navigation/dto/menu-item.dto';

describe('MenuItemRepository', () => {
  let repository: MenuItemRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuItemRepository,
        {
          provide: PrismaService,
          useValue: {
            menuItem: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
              updateMany: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<MenuItemRepository>(MenuItemRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find menu item by ID', async () => {
      const mockMenuItem = {
        id: 'test-id',
        menuId: 'menu-id',
        parentId: null,
        title: { en: 'Test Item', ne: 'परीक्षण आइटम' },
        description: { en: 'Test Description', ne: 'परीक्षण विवरण' },
        url: '/test',
        target: 'self',
        icon: 'test-icon',
        order: 1,
        isActive: true,
        isPublished: true,
        itemType: MenuItemType.LINK,
        itemId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: []
      };

      (prisma.menuItem.findUnique as jest.Mock).mockResolvedValue(mockMenuItem);

      const result = await repository.findById('test-id');

      expect(result).toEqual(mockMenuItem);
      expect(prisma.menuItem.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        include: {
          menu: true,
          parent: true,
          children: {
            where: { isActive: true },
            orderBy: { order: 'asc' }
          },
          createdBy: true,
          updatedBy: true
        }
      });
    });

    it('should return null when menu item not found', async () => {
      (prisma.menuItem.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all menu items with pagination', async () => {
      const mockMenuItems = [
        {
          id: 'test-id-1',
          menuId: 'menu-id',
          title: { en: 'Test Item 1', ne: 'परीक्षण आइटम १' },
          order: 1,
          isActive: true,
          isPublished: true,
          itemType: MenuItemType.LINK,
          createdAt: new Date(),
          updatedAt: new Date(),
          children: []
        },
        {
          id: 'test-id-2',
          menuId: 'menu-id',
          title: { en: 'Test Item 2', ne: 'परीक्षण आइटम २' },
          order: 2,
          isActive: true,
          isPublished: true,
          itemType: MenuItemType.LINK,
          createdAt: new Date(),
          updatedAt: new Date(),
          children: []
        }
      ];

      const mockTotal = 2;
      const query = { page: 1, limit: 10 };

      (prisma.menuItem.findMany as jest.Mock).mockResolvedValue(mockMenuItems);
      (prisma.menuItem.count as jest.Mock).mockResolvedValue(mockTotal);

      const result = await repository.findAll(query);

      expect(result.data).toEqual(mockMenuItems);
      expect(result.pagination.total).toBe(mockTotal);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });
  });

  describe('findActive', () => {
    it('should find active menu items', async () => {
      const mockMenuItems = [
        {
          id: 'test-id-1',
          menuId: 'menu-id',
          title: { en: 'Test Item 1', ne: 'परीक्षण आइटम १' },
          order: 1,
          isActive: true,
          isPublished: true,
          itemType: MenuItemType.LINK,
          createdAt: new Date(),
          updatedAt: new Date(),
          children: []
        }
      ];

      const mockTotal = 1;
      const query = { page: 1, limit: 10 };

      (prisma.menuItem.findMany as jest.Mock).mockResolvedValue(mockMenuItems);
      (prisma.menuItem.count as jest.Mock).mockResolvedValue(mockTotal);

      const result = await repository.findActive(query);

      expect(result.data).toEqual(mockMenuItems);
      expect(prisma.menuItem.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: {
          menu: true,
          parent: true,
          children: {
            where: { isActive: true },
            orderBy: { order: 'asc' }
          },
          createdBy: true,
          updatedBy: true
        },
        skip: 0,
        take: 10,
        orderBy: { order: 'asc' }
      });
    });
  });

  describe('findByMenu', () => {
    it('should find menu items by menu', async () => {
      const mockMenuItems = [
        {
          id: 'test-id-1',
          menuId: 'menu-id',
          title: { en: 'Test Item 1', ne: 'परीक्षण आइटम १' },
          order: 1,
          isActive: true,
          isPublished: true,
          itemType: MenuItemType.LINK,
          createdAt: new Date(),
          updatedAt: new Date(),
          children: []
        }
      ];

      const mockTotal = 1;
      const query = { page: 1, limit: 10 };

      (prisma.menuItem.findMany as jest.Mock).mockResolvedValue(mockMenuItems);
      (prisma.menuItem.count as jest.Mock).mockResolvedValue(mockTotal);

      const result = await repository.findByMenu('menu-id', query);

      expect(result.data).toEqual(mockMenuItems);
      expect(prisma.menuItem.findMany).toHaveBeenCalledWith({
        where: { menuId: 'menu-id' },
        include: {
          menu: true,
          parent: true,
          children: {
            where: { isActive: true },
            orderBy: { order: 'asc' }
          },
          createdBy: true,
          updatedBy: true
        },
        skip: 0,
        take: 10,
        orderBy: { order: 'asc' }
      });
    });
  });

  describe('findByParent', () => {
    it('should find menu items by parent', async () => {
      const mockMenuItems = [
        {
          id: 'test-id-1',
          menuId: 'menu-id',
          parentId: 'parent-id',
          title: { en: 'Test Item 1', ne: 'परीक्षण आइटम १' },
          order: 1,
          isActive: true,
          isPublished: true,
          itemType: MenuItemType.LINK,
          createdAt: new Date(),
          updatedAt: new Date(),
          children: []
        }
      ];

      (prisma.menuItem.findMany as jest.Mock).mockResolvedValue(mockMenuItems);

      const result = await repository.findByParent('parent-id');

      expect(result).toEqual(mockMenuItems);
      expect(prisma.menuItem.findMany).toHaveBeenCalledWith({
        where: { parentId: 'parent-id' },
        include: {
          menu: true,
          parent: true,
          children: {
            where: { isActive: true },
            orderBy: { order: 'asc' }
          },
          createdBy: true,
          updatedBy: true
        },
        orderBy: { order: 'asc' }
      });
    });

    it('should find root menu items when parentId is null', async () => {
      const mockMenuItems = [
        {
          id: 'test-id-1',
          menuId: 'menu-id',
          parentId: null,
          title: { en: 'Test Item 1', ne: 'परीक्षण आइटम १' },
          order: 1,
          isActive: true,
          isPublished: true,
          itemType: MenuItemType.LINK,
          createdAt: new Date(),
          updatedAt: new Date(),
          children: []
        }
      ];

      (prisma.menuItem.findMany as jest.Mock).mockResolvedValue(mockMenuItems);

      const result = await repository.findByParent();

      expect(result).toEqual(mockMenuItems);
      expect(prisma.menuItem.findMany).toHaveBeenCalledWith({
        where: { parentId: null },
        include: {
          menu: true,
          parent: true,
          children: {
            where: { isActive: true },
            orderBy: { order: 'asc' }
          },
          createdBy: true,
          updatedBy: true
        },
        orderBy: { order: 'asc' }
      });
    });
  });

  describe('findByType', () => {
    it('should find menu items by type', async () => {
      const mockMenuItems = [
        {
          id: 'test-id-1',
          menuId: 'menu-id',
          title: { en: 'Test Item 1', ne: 'परीक्षण आइटम १' },
          order: 1,
          isActive: true,
          isPublished: true,
          itemType: MenuItemType.LINK,
          createdAt: new Date(),
          updatedAt: new Date(),
          children: []
        }
      ];

      const mockTotal = 1;
      const query = { page: 1, limit: 10 };

      (prisma.menuItem.findMany as jest.Mock).mockResolvedValue(mockMenuItems);
      (prisma.menuItem.count as jest.Mock).mockResolvedValue(mockTotal);

      const result = await repository.findByType(MenuItemType.LINK, query);

      expect(result.data).toEqual(mockMenuItems);
      expect(prisma.menuItem.findMany).toHaveBeenCalledWith({
        where: { itemType: MenuItemType.LINK },
        include: {
          menu: true,
          parent: true,
          children: {
            where: { isActive: true },
            orderBy: { order: 'asc' }
          },
          createdBy: true,
          updatedBy: true
        },
        skip: 0,
        take: 10,
        orderBy: { order: 'asc' }
      });
    });
  });

  describe('search', () => {
    it('should search menu items', async () => {
      const mockMenuItems = [
        {
          id: 'test-id-1',
          menuId: 'menu-id',
          title: { en: 'Test Item 1', ne: 'परीक्षण आइटम १' },
          order: 1,
          isActive: true,
          isPublished: true,
          itemType: MenuItemType.LINK,
          createdAt: new Date(),
          updatedAt: new Date(),
          children: []
        }
      ];

      const mockTotal = 1;
      const query = { page: 1, limit: 10 };

      (prisma.menuItem.findMany as jest.Mock).mockResolvedValue(mockMenuItems);
      (prisma.menuItem.count as jest.Mock).mockResolvedValue(mockTotal);

      const result = await repository.search('test', query);

      expect(result.data).toEqual(mockMenuItems);
      expect(prisma.menuItem.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { path: ['en'], string_contains: 'test' } },
            { title: { path: ['ne'], string_contains: 'test' } },
            { description: { path: ['en'], string_contains: 'test' } },
            { description: { path: ['ne'], string_contains: 'test' } }
          ]
        },
        include: {
          menu: true,
          parent: true,
          children: {
            where: { isActive: true },
            orderBy: { order: 'asc' }
          },
          createdBy: true,
          updatedBy: true
        },
        skip: 0,
        take: 10,
        orderBy: { order: 'asc' }
      });
    });
  });

  describe('create', () => {
    it('should create menu item', async () => {
      const createData: CreateMenuItemDto = {
        menuId: 'menu-id',
        title: { en: 'Test Item', ne: 'परीक्षण आइटम' },
        description: { en: 'Test Description', ne: 'परीक्षण विवरण' },
        url: '/test',
        target: 'self',
        icon: 'test-icon',
        order: 1,
        isActive: true,
        isPublished: true,
        itemType: MenuItemType.LINK
      };

      const mockCreatedMenuItem = {
        id: 'test-id',
        ...createData,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: []
      };

      (prisma.menuItem.create as jest.Mock).mockResolvedValue(mockCreatedMenuItem);

      const result = await repository.create(createData, 'user-id');

      expect(result).toEqual(mockCreatedMenuItem);
      expect(prisma.menuItem.create).toHaveBeenCalledWith({
        data: {
          ...createData,
          createdBy: { connect: { id: 'user-id' } },
          updatedBy: { connect: { id: 'user-id' } }
        },
        include: {
          menu: true,
          parent: true,
          children: {
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
    it('should update menu item', async () => {
      const updateData: UpdateMenuItemDto = {
        title: { en: 'Updated Test Item', ne: 'अपडेटेड परीक्षण आइटम' },
        isPublished: false
      };

      const mockUpdatedMenuItem = {
        id: 'test-id',
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: []
      };

      (prisma.menuItem.update as jest.Mock).mockResolvedValue(mockUpdatedMenuItem);

      const result = await repository.update('test-id', updateData, 'user-id');

      expect(result).toEqual(mockUpdatedMenuItem);
      expect(prisma.menuItem.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: {
          ...updateData,
          updatedBy: { connect: { id: 'user-id' } }
        },
        include: {
          menu: true,
          parent: true,
          children: {
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
    it('should delete menu item', async () => {
      (prisma.menuItem.delete as jest.Mock).mockResolvedValue(undefined);

      await repository.delete('test-id');

      expect(prisma.menuItem.delete).toHaveBeenCalledWith({
        where: { id: 'test-id' }
      });
    });
  });

  describe('reorder', () => {
    it('should reorder menu items', async () => {
      const orders = [
        { id: 'item-1', order: 1 },
        { id: 'item-2', order: 2 },
        { id: 'item-3', order: 3 }
      ];

      (prisma.$transaction as jest.Mock).mockResolvedValue(undefined);

      await repository.reorder(orders);

      expect(prisma.$transaction).toHaveBeenCalledWith([
        { id: 'item-1', order: 1 },
        { id: 'item-2', order: 2 },
        { id: 'item-3', order: 3 }
      ].map(({ id, order }) => 
        prisma.menuItem.update({
          where: { id },
          data: { order }
        })
      ));
    });
  });

  describe('getMenuItemTree', () => {
    it('should get menu item tree', async () => {
      const mockMenuItems = [
        {
          id: 'item-1',
          menuId: 'menu-id',
          parentId: null,
          title: { en: 'Item 1', ne: 'आइटम १' },
          order: 1,
          isActive: true,
          isPublished: true,
          itemType: MenuItemType.LINK,
          children: [
            {
              id: 'item-1-1',
              menuId: 'menu-id',
              parentId: 'item-1',
              title: { en: 'Item 1.1', ne: 'आइटम १.१' },
              order: 1,
              isActive: true,
              isPublished: true,
              itemType: MenuItemType.LINK,
              children: []
            }
          ]
        }
      ];

      (prisma.menuItem.findMany as jest.Mock).mockResolvedValue(mockMenuItems);

      const result = await repository.getMenuItemTree('menu-id');

      expect(result).toEqual(mockMenuItems);
      expect(prisma.menuItem.findMany).toHaveBeenCalledWith({
        where: { 
          menuId: 'menu-id',
          parentId: null,
          isActive: true
        },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
            include: {
              children: {
                where: { isActive: true },
                orderBy: { order: 'asc' }
              }
            }
          }
        },
        orderBy: { order: 'asc' }
      });
    });
  });

  describe('getStatistics', () => {
    it('should get menu item statistics', async () => {
      const mockStats = {
        total: 50,
        active: 40,
        published: 35,
        byType: {
          LINK: 20,
          CONTENT: 15,
          PAGE: 10,
          CATEGORY: 5
        },
        averageDepth: 2.5
      };

      (prisma.menuItem.count as jest.Mock)
        .mockResolvedValueOnce(50) // total
        .mockResolvedValueOnce(40) // active
        .mockResolvedValueOnce(35); // published

      const result = await repository.getStatistics();

      expect(result).toEqual(mockStats);
      expect(prisma.menuItem.count).toHaveBeenCalledTimes(3);
    });
  });

  describe('findByItemReference', () => {
    it('should find menu items by item reference', async () => {
      const mockMenuItems = [
        {
          id: 'item-1',
          menuId: 'menu-id',
          title: { en: 'Test Item', ne: 'परीक्षण आइटम' },
          itemType: MenuItemType.CONTENT,
          itemId: 'content-id',
          order: 1,
          isActive: true,
          isPublished: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          children: []
        }
      ];

      (prisma.menuItem.findMany as jest.Mock).mockResolvedValue(mockMenuItems);

      const result = await repository.findByItemReference(MenuItemType.CONTENT, 'content-id');

      expect(result).toEqual(mockMenuItems);
      expect(prisma.menuItem.findMany).toHaveBeenCalledWith({
        where: {
          itemType: MenuItemType.CONTENT,
          itemId: 'content-id'
        },
        include: {
          menu: true,
          parent: true,
          children: {
            where: { isActive: true },
            orderBy: { order: 'asc' }
          },
          createdBy: true,
          updatedBy: true
        }
      });
    });
  });

  describe('getBreadcrumb', () => {
    it('should get breadcrumb for menu item', async () => {
      const mockBreadcrumb = [
        {
          id: 'item-1',
          menuId: 'menu-id',
          parentId: null,
          title: { en: 'Item 1', ne: 'आइटम १' },
          order: 1,
          isActive: true,
          isPublished: true,
          itemType: MenuItemType.LINK,
          createdAt: new Date(),
          updatedAt: new Date(),
          children: []
        },
        {
          id: 'item-1-1',
          menuId: 'menu-id',
          parentId: 'item-1',
          title: { en: 'Item 1.1', ne: 'आइटम १.१' },
          order: 1,
          isActive: true,
          isPublished: true,
          itemType: MenuItemType.LINK,
          createdAt: new Date(),
          updatedAt: new Date(),
          children: []
        }
      ];

      (prisma.menuItem.findMany as jest.Mock).mockResolvedValue(mockBreadcrumb);

      const result = await repository.getBreadcrumb('item-1-1');

      expect(result).toEqual(mockBreadcrumb);
      expect(prisma.menuItem.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { id: 'item-1-1' },
            { children: { some: { id: 'item-1-1' } } }
          ]
        },
        include: {
          menu: true,
          parent: true,
          children: {
            where: { isActive: true },
            orderBy: { order: 'asc' }
          },
          createdBy: true,
          updatedBy: true
        },
        orderBy: { order: 'asc' }
      });
    });
  });
}); 