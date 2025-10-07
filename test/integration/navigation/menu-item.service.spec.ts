import { Test, TestingModule } from '@nestjs/testing';
import { MenuItemService } from '../../../src/modules/navigation/services/menu-item.service';
import { MenuItemRepository } from '../../../src/modules/navigation/repositories/menu-item.repository';
import { MenuItem } from '../../../src/modules/navigation/entities/menu-item.entity';
import { MenuItemType } from '@prisma/client';
import { 
  CreateMenuItemDto, 
  UpdateMenuItemDto,
  MenuItemResponseDto,
  PaginatedMenuItemResponse,
  ValidationResult,
  BulkOperationResult,
  ImportResult
} from '../../../src/modules/navigation/dto/menu-item.dto';

describe('MenuItemService', () => {
  let service: MenuItemService;
  let menuItemRepository: MenuItemRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuItemService,
        {
          provide: MenuItemRepository,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            findActive: jest.fn(),
            findByMenu: jest.fn(),
            findByParent: jest.fn(),
            findByType: jest.fn(),
            search: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            reorder: jest.fn(),
            getMenuItemTree: jest.fn(),
            getStatistics: jest.fn(),
            getBreadcrumb: jest.fn(),
            findByItemReference: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MenuItemService>(MenuItemService);
    menuItemRepository = module.get<MenuItemRepository>(MenuItemRepository);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMenuItemById', () => {
    it('should get menu item by ID', async () => {
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

      (menuItemRepository.findById as jest.Mock).mockResolvedValue(mockMenuItem);

      const result = await service.getMenuItemById('test-id');

      expect(result).toEqual(mockMenuItem);
      expect(menuItemRepository.findById).toHaveBeenCalledWith('test-id');
    });

    it('should throw error when menu item not found', async () => {
      (menuItemRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.getMenuItemById('non-existent-id')).rejects.toThrow('Menu item not found');
    });
  });

  describe('getAllMenuItems', () => {
    it('should get all menu items', async () => {
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

      const mockPagination = {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      };

      const query = { page: 1, limit: 10 };

      (menuItemRepository.findAll as jest.Mock).mockResolvedValue({
        data: mockMenuItems,
        pagination: mockPagination
      });

      const result = await service.getAllMenuItems(query);

      expect(result.data).toEqual(mockMenuItems);
      expect(result.pagination).toEqual(mockPagination);
      expect(menuItemRepository.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('getActiveMenuItems', () => {
    it('should get active menu items', async () => {
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

      const mockPagination = {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      };

      const query = { page: 1, limit: 10 };

      (menuItemRepository.findActive as jest.Mock).mockResolvedValue({
        data: mockMenuItems,
        pagination: mockPagination
      });

      const result = await service.getActiveMenuItems(query);

      expect(result.data).toEqual(mockMenuItems);
      expect(result.pagination).toEqual(mockPagination);
      expect(menuItemRepository.findActive).toHaveBeenCalledWith(query);
    });
  });

  describe('getMenuItemsByMenu', () => {
    it('should get menu items by menu', async () => {
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

      const mockPagination = {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      };

      const query = { page: 1, limit: 10 };

      (menuItemRepository.findByMenu as jest.Mock).mockResolvedValue({
        data: mockMenuItems,
        pagination: mockPagination
      });

      const result = await service.getMenuItemsByMenu('menu-id', query);

      expect(result.data).toEqual(mockMenuItems);
      expect(result.pagination).toEqual(mockPagination);
      expect(menuItemRepository.findByMenu).toHaveBeenCalledWith('menu-id', query);
    });
  });

  describe('getMenuItemsByParent', () => {
    it('should get menu items by parent', async () => {
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

      (menuItemRepository.findByParent as jest.Mock).mockResolvedValue(mockMenuItems);

      const result = await service.getMenuItemsByParent('parent-id');

      expect(result).toEqual(mockMenuItems);
      expect(menuItemRepository.findByParent).toHaveBeenCalledWith('parent-id');
    });

    it('should get root menu items when parentId is not provided', async () => {
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

      (menuItemRepository.findByParent as jest.Mock).mockResolvedValue(mockMenuItems);

      const result = await service.getMenuItemsByParent();

      expect(result).toEqual(mockMenuItems);
      expect(menuItemRepository.findByParent).toHaveBeenCalledWith(undefined);
    });
  });

  describe('getMenuItemsByType', () => {
    it('should get menu items by type', async () => {
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

      const mockPagination = {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      };

      const query = { page: 1, limit: 10 };

      (menuItemRepository.findByType as jest.Mock).mockResolvedValue({
        data: mockMenuItems,
        pagination: mockPagination
      });

      const result = await service.getMenuItemsByType(MenuItemType.LINK, query);

      expect(result.data).toEqual(mockMenuItems);
      expect(result.pagination).toEqual(mockPagination);
      expect(menuItemRepository.findByType).toHaveBeenCalledWith(MenuItemType.LINK, query);
    });
  });

  describe('searchMenuItems', () => {
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

      const mockPagination = {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      };

      const query = { page: 1, limit: 10 };

      (menuItemRepository.search as jest.Mock).mockResolvedValue({
        data: mockMenuItems,
        pagination: mockPagination
      });

      const result = await service.searchMenuItems('test', query);

      expect(result.data).toEqual(mockMenuItems);
      expect(result.pagination).toEqual(mockPagination);
      expect(menuItemRepository.search).toHaveBeenCalledWith('test', query);
    });
  });

  describe('createMenuItem', () => {
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

      (menuItemRepository.create as jest.Mock).mockResolvedValue(mockCreatedMenuItem);

      const result = await service.createMenuItem(createData, 'user-id');

      expect(result).toEqual(mockCreatedMenuItem);
      expect(menuItemRepository.create).toHaveBeenCalledWith(createData, 'user-id');
    });
  });

  describe('updateMenuItem', () => {
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

      (menuItemRepository.update as jest.Mock).mockResolvedValue(mockUpdatedMenuItem);

      const result = await service.updateMenuItem('test-id', updateData, 'user-id');

      expect(result).toEqual(mockUpdatedMenuItem);
      expect(menuItemRepository.update).toHaveBeenCalledWith('test-id', updateData, 'user-id');
    });
  });

  describe('deleteMenuItem', () => {
    it('should delete menu item successfully', async () => {
      const mockMenuItem = {
        id: 'test-id',
        menuId: 'menu-id',
        title: { en: 'Test Item', ne: 'परीक्षण आइटम' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: []
      };

      (menuItemRepository.findById as jest.Mock).mockResolvedValue(mockMenuItem);
      (menuItemRepository.delete as jest.Mock).mockResolvedValue(undefined);

      await service.deleteMenuItem('test-id');

      expect(menuItemRepository.findById).toHaveBeenCalledWith('test-id');
      expect(menuItemRepository.delete).toHaveBeenCalledWith('test-id');
    });

    it('should throw error when menu item not found', async () => {
      (menuItemRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteMenuItem('non-existent-id')).rejects.toThrow('Menu item not found');
    });
  });

  describe('reorderMenuItems', () => {
    it('should reorder menu items', async () => {
      const orders = [
        { id: 'item-1', order: 1 },
        { id: 'item-2', order: 2 },
        { id: 'item-3', order: 3 }
      ];

      (menuItemRepository.reorder as jest.Mock).mockResolvedValue(undefined);

      await service.reorderMenuItems(orders);

      expect(menuItemRepository.reorder).toHaveBeenCalledWith(orders);
    });
  });

  describe('validateMenuItem', () => {
    it('should validate menu item successfully', async () => {
      const menuItemData = {
        menuId: 'menu-id',
        title: { en: 'Test Item', ne: 'परीक्षण आइटम' },
        description: { en: 'Test Description', ne: 'परीक्षण विवरण' },
        url: '/test',
        target: 'self' as const,
        icon: 'test-icon',
        order: 1,
        isActive: true,
        isPublished: true,
        itemType: MenuItemType.LINK
      };

      const result = await service.validateMenuItem(menuItemData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return validation errors for invalid menu item', async () => {
      const menuItemData = {
        menuId: '',
        title: { en: '', ne: '' },
        description: { en: 'Test Description', ne: 'परीक्षण विवरण' },
        url: '/test',
        target: 'self' as const,
        icon: 'test-icon',
        order: 1,
        isActive: true,
        isPublished: true,
        itemType: MenuItemType.LINK
      };

      const result = await service.validateMenuItem(menuItemData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getMenuItemStatistics', () => {
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

      (menuItemRepository.getStatistics as jest.Mock).mockResolvedValue(mockStats);

      const result = await service.getMenuItemStatistics();

      expect(result).toEqual(mockStats);
      expect(menuItemRepository.getStatistics).toHaveBeenCalled();
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

      (menuItemRepository.getMenuItemTree as jest.Mock).mockResolvedValue(mockMenuItems);

      const result = await service.getMenuItemTree('menu-id');

      expect(result).toEqual(mockMenuItems);
      expect(menuItemRepository.getMenuItemTree).toHaveBeenCalledWith('menu-id');
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

      (menuItemRepository.getBreadcrumb as jest.Mock).mockResolvedValue(mockBreadcrumb);

      const result = await service.getBreadcrumb('item-1-1');

      expect(result).toEqual(mockBreadcrumb);
      expect(menuItemRepository.getBreadcrumb).toHaveBeenCalledWith('item-1-1');
    });
  });

  describe('exportMenuItems', () => {
    it('should export menu items as JSON', async () => {
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

      const query = { page: 1, limit: 10 };

      (menuItemRepository.findAll as jest.Mock).mockResolvedValue({
        data: mockMenuItems,
        pagination: { total: 1 }
      });

      const result = await service.exportMenuItems(query, 'json');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toContain('Test Item 1');
      expect(menuItemRepository.findAll).toHaveBeenCalledWith(query);
    });

    it('should throw error for CSV export (not implemented)', async () => {
      const query = { page: 1, limit: 10 };

      await expect(service.exportMenuItems(query, 'csv')).rejects.toThrow('CSV export not implemented yet');
    });

    it('should throw error for PDF export (not implemented)', async () => {
      const query = { page: 1, limit: 10 };

      await expect(service.exportMenuItems(query, 'pdf')).rejects.toThrow('PDF export not implemented yet');
    });
  });

  describe('importMenuItems', () => {
    it('should import menu items from JSON file', async () => {
      const mockFile = {
        buffer: Buffer.from(JSON.stringify([
          {
            menuId: 'menu-id',
            title: { en: 'Test Item', ne: 'परीक्षण आइटम' },
            url: '/test',
            target: 'self',
            order: 1,
            isActive: true,
            isPublished: true,
            itemType: MenuItemType.LINK
          }
        ])),
        originalname: 'test.json',
        mimetype: 'application/json'
      } as Express.Multer.File;

      const mockCreatedMenuItem = {
        id: 'test-id',
        menuId: 'menu-id',
        title: { en: 'Test Item', ne: 'परीक्षण आइटम' },
        url: '/test',
        target: 'self',
        order: 1,
        isActive: true,
        isPublished: true,
        itemType: MenuItemType.LINK,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: []
      };

      (menuItemRepository.create as jest.Mock).mockResolvedValue(mockCreatedMenuItem);

      const result = await service.importMenuItems(mockFile, 'user-id');

      expect(result.success).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
      expect(menuItemRepository.create).toHaveBeenCalled();
    });

    it('should handle import errors', async () => {
      const mockFile = {
        buffer: Buffer.from('invalid json'),
        originalname: 'test.json',
        mimetype: 'application/json'
      } as Express.Multer.File;

      const result = await service.importMenuItems(mockFile, 'user-id');

      expect(result.success).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('bulkActivate', () => {
    it('should bulk activate menu items', async () => {
      const itemIds = ['item-1', 'item-2', 'item-3'];
      const mockUpdatedMenuItem = {
        id: 'item-1',
        menuId: 'menu-id',
        title: { en: 'Test Item', ne: 'परीक्षण आइटम' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: []
      };

      (menuItemRepository.update as jest.Mock).mockResolvedValue(mockUpdatedMenuItem);

      const result = await service.bulkActivate(itemIds);

      expect(result.success).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
      expect(menuItemRepository.update).toHaveBeenCalledTimes(3);
    });
  });

  describe('bulkDeactivate', () => {
    it('should bulk deactivate menu items', async () => {
      const itemIds = ['item-1', 'item-2', 'item-3'];
      const mockUpdatedMenuItem = {
        id: 'item-1',
        menuId: 'menu-id',
        title: { en: 'Test Item', ne: 'परीक्षण आइटम' },
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: []
      };

      (menuItemRepository.update as jest.Mock).mockResolvedValue(mockUpdatedMenuItem);

      const result = await service.bulkDeactivate(itemIds);

      expect(result.success).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
      expect(menuItemRepository.update).toHaveBeenCalledTimes(3);
    });
  });

  describe('bulkDelete', () => {
    it('should bulk delete menu items', async () => {
      const itemIds = ['item-1', 'item-2', 'item-3'];
      const mockMenuItem = {
        id: 'item-1',
        menuId: 'menu-id',
        title: { en: 'Test Item', ne: 'परीक्षण आइटम' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: []
      };

      (menuItemRepository.findById as jest.Mock).mockResolvedValue(mockMenuItem);
      (menuItemRepository.delete as jest.Mock).mockResolvedValue(undefined);

      const result = await service.bulkDelete(itemIds);

      expect(result.success).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
      expect(menuItemRepository.delete).toHaveBeenCalledTimes(3);
    });
  });
}); 