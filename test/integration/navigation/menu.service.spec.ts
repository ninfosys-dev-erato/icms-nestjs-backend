import { Test, TestingModule } from '@nestjs/testing';
import { MenuService } from '../../../src/modules/navigation/services/menu.service';
import { MenuRepository } from '../../../src/modules/navigation/repositories/menu.repository';
import { Menu, MenuLocation } from '../../../src/modules/navigation/entities/menu.entity';
import { 
  CreateMenuDto, 
  UpdateMenuDto,
  MenuResponseDto,
  PaginatedMenuResponse,
  MenuTreeResponse,
  ValidationResult,
  BulkOperationResult,
  ImportResult
} from '../../../src/modules/navigation/dto/menu.dto';

describe('MenuService', () => {
  let service: MenuService;
  let menuRepository: MenuRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        {
          provide: MenuRepository,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            findActive: jest.fn(),
            findPublished: jest.fn(),
            findByLocation: jest.fn(),
            search: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            publish: jest.fn(),
            unpublish: jest.fn(),
            findWithItems: jest.fn(),
            getStatistics: jest.fn(),
            getMenuTree: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);
    menuRepository = module.get<MenuRepository>(MenuRepository);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMenuById', () => {
    it('should get menu by ID', async () => {
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

      const expectedResult = {
        ...mockMenu,
        menuItemCount: 0
      };

      (menuRepository.findById as jest.Mock).mockResolvedValue(mockMenu);

      const result = await service.getMenuById('test-id');

      expect(result).toEqual(expectedResult);
      expect(menuRepository.findById).toHaveBeenCalledWith('test-id');
    });

    it('should throw error when menu not found', async () => {
      (menuRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.getMenuById('non-existent-id')).rejects.toThrow('Menu not found');
    });
  });

  describe('getAllMenus', () => {
    it('should get all menus', async () => {
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

      const mockPagination = {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      };

      const query = { page: 1, limit: 10 };

      (menuRepository.findAll as jest.Mock).mockResolvedValue({
        data: mockMenus,
        pagination: mockPagination
      });

      const result = await service.getAllMenus(query);

      expect(result.data).toEqual(mockMenus.map(menu => ({
        ...menu,
        menuItemCount: 0
      })));
      expect(result.pagination).toEqual(mockPagination);
      expect(menuRepository.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('getActiveMenus', () => {
    it('should get active menus', async () => {
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

      const mockPagination = {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      };

      const query = { page: 1, limit: 10 };

      (menuRepository.findActive as jest.Mock).mockResolvedValue({
        data: mockMenus,
        pagination: mockPagination
      });

      const result = await service.getActiveMenus(query);

      expect(result.data).toEqual(mockMenus.map(menu => ({
        ...menu,
        menuItemCount: 0
      })));
      expect(result.pagination).toEqual(mockPagination);
      expect(menuRepository.findActive).toHaveBeenCalledWith(query);
    });
  });

  describe('getPublishedMenus', () => {
    it('should get published menus', async () => {
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

      const mockPagination = {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      };

      const query = { page: 1, limit: 10 };

      (menuRepository.findPublished as jest.Mock).mockResolvedValue({
        data: mockMenus,
        pagination: mockPagination
      });

      const result = await service.getPublishedMenus(query);

      expect(result.data).toEqual(mockMenus.map(menu => ({
        ...menu,
        menuItemCount: 0
      })));
      expect(result.pagination).toEqual(mockPagination);
      expect(menuRepository.findPublished).toHaveBeenCalledWith(query);
    });
  });

  describe('getMenuByLocation', () => {
    it('should get menus by location', async () => {
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

      const expectedResult = {
        data: mockMenus.map(menu => ({
          ...menu,
          menuItemCount: 0
        }))
      };

      (menuRepository.findByLocation as jest.Mock).mockResolvedValue(mockMenus);

      const result = await service.getMenuByLocation(MenuLocation.HEADER);

      expect(result).toEqual(expectedResult);
      expect(menuRepository.findByLocation).toHaveBeenCalledWith(MenuLocation.HEADER);
    });

    it('should throw error when no menus found for location', async () => {
      (menuRepository.findByLocation as jest.Mock).mockResolvedValue([]);

      await expect(service.getMenuByLocation(MenuLocation.SIDEBAR)).rejects.toThrow('No menus found for location');
    });
  });

  describe('searchMenus', () => {
    it('should search menus', async () => {
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

      const mockPagination = {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      };

      const query = { page: 1, limit: 10 };

      (menuRepository.search as jest.Mock).mockResolvedValue({
        data: mockMenus,
        pagination: mockPagination
      });

      const result = await service.searchMenus('test', query);

      expect(result.data).toEqual(mockMenus.map(menu => ({
        ...menu,
        menuItemCount: 0
      })));
      expect(result.pagination).toEqual(mockPagination);
      expect(menuRepository.search).toHaveBeenCalledWith('test', query);
    });
  });

  describe('createMenu', () => {
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

      const expectedResult = {
        ...mockCreatedMenu,
        menuItemCount: 0
      };

      (menuRepository.create as jest.Mock).mockResolvedValue(mockCreatedMenu);

      const result = await service.createMenu(createData, 'user-id');

      expect(result).toEqual(expectedResult);
      expect(menuRepository.create).toHaveBeenCalledWith(createData, 'user-id');
    });
  });

  describe('updateMenu', () => {
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

      const expectedResult = {
        ...mockUpdatedMenu,
        menuItemCount: 0
      };

      (menuRepository.update as jest.Mock).mockResolvedValue(mockUpdatedMenu);

      const result = await service.updateMenu('test-id', updateData, 'user-id');

      expect(result).toEqual(expectedResult);
      expect(menuRepository.update).toHaveBeenCalledWith('test-id', updateData, 'user-id');
    });
  });

  describe('deleteMenu', () => {
    it('should delete menu successfully', async () => {
      const mockMenu = {
        id: 'test-id',
        name: { en: 'Test Menu', ne: 'परीक्षण मेनु' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        menuItems: []
      };

      (menuRepository.findById as jest.Mock).mockResolvedValue(mockMenu);
      (menuRepository.delete as jest.Mock).mockResolvedValue(undefined);

      await service.deleteMenu('test-id');

      expect(menuRepository.findById).toHaveBeenCalledWith('test-id');
      expect(menuRepository.delete).toHaveBeenCalledWith('test-id');
    });

    it('should throw error when menu not found', async () => {
      (menuRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteMenu('non-existent-id')).rejects.toThrow('Menu not found');
    });
  });

  describe('publishMenu', () => {
    it('should publish menu', async () => {
      const mockPublishedMenu = {
        id: 'test-id',
        name: { en: 'Test Menu', ne: 'परीक्षण मेनु' },
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        menuItems: []
      };

      const expectedResult = {
        ...mockPublishedMenu,
        menuItemCount: 0
      };

      (menuRepository.publish as jest.Mock).mockResolvedValue(mockPublishedMenu);

      const result = await service.publishMenu('test-id', 'user-id');

      expect(result).toEqual(expectedResult);
      expect(menuRepository.publish).toHaveBeenCalledWith('test-id', 'user-id');
    });
  });

  describe('unpublishMenu', () => {
    it('should unpublish menu', async () => {
      const mockUnpublishedMenu = {
        id: 'test-id',
        name: { en: 'Test Menu', ne: 'परीक्षण मेनु' },
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        menuItems: []
      };

      const expectedResult = {
        ...mockUnpublishedMenu,
        menuItemCount: 0
      };

      (menuRepository.unpublish as jest.Mock).mockResolvedValue(mockUnpublishedMenu);

      const result = await service.unpublishMenu('test-id', 'user-id');

      expect(result).toEqual(expectedResult);
      expect(menuRepository.unpublish).toHaveBeenCalledWith('test-id', 'user-id');
    });
  });

  describe('validateMenu', () => {
    it('should validate menu successfully', async () => {
      const menuData = {
        name: { en: 'Test Menu', ne: 'परीक्षण मेनु' },
        description: { en: 'Test Description', ne: 'परीक्षण विवरण' },
        location: MenuLocation.HEADER,
        isActive: true,
        isPublished: false
      };

      const result = await service.validateMenu(menuData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return validation errors for invalid menu', async () => {
      const menuData = {
        name: { en: '', ne: '' },
        description: { en: 'Test Description', ne: 'परीक्षण विवरण' },
        location: MenuLocation.HEADER,
        isActive: true,
        isPublished: false
      };

      const result = await service.validateMenu(menuData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getMenuStatistics', () => {
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

      (menuRepository.getStatistics as jest.Mock).mockResolvedValue(mockStats);

      const result = await service.getMenuStatistics();

      expect(result).toEqual(mockStats);
      expect(menuRepository.getStatistics).toHaveBeenCalled();
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

      const expectedResult = {
        menu: {
          ...mockMenu,
          menuItemCount: 1
        },
        items: mockMenu.menuItems
      };

      (menuRepository.getMenuTree as jest.Mock).mockResolvedValue({
        menu: mockMenu,
        items: mockMenu.menuItems
      });

      const result = await service.getMenuTree('test-id');

      expect(result).toEqual(expectedResult);
      expect(menuRepository.getMenuTree).toHaveBeenCalledWith('test-id');
    });
  });

  describe('exportMenus', () => {
    it('should export menus as JSON', async () => {
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

      const query = { page: 1, limit: 10 };

      (menuRepository.findAll as jest.Mock).mockResolvedValue({
        data: mockMenus,
        pagination: { total: 1 }
      });

      const result = await service.exportMenus(query, 'json');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toContain('Test Menu 1');
      expect(menuRepository.findAll).toHaveBeenCalledWith(query);
    });

    it('should throw error for CSV export (not implemented)', async () => {
      const query = { page: 1, limit: 10 };

      await expect(service.exportMenus(query, 'csv')).rejects.toThrow('CSV export not implemented yet');
    });

    it('should throw error for PDF export (not implemented)', async () => {
      const query = { page: 1, limit: 10 };

      await expect(service.exportMenus(query, 'pdf')).rejects.toThrow('PDF export not implemented yet');
    });
  });

  describe('importMenus', () => {
    it('should import menus from JSON file', async () => {
      const mockFile = {
        buffer: Buffer.from(JSON.stringify([
          {
            name: { en: 'Test Menu', ne: 'परीक्षण मेनु' },
            location: MenuLocation.HEADER,
            isActive: true,
            isPublished: false
          }
        ])),
        originalname: 'test.json',
        mimetype: 'application/json'
      } as Express.Multer.File;

      const mockCreatedMenu = {
        id: 'test-id',
        name: { en: 'Test Menu', ne: 'परीक्षण मेनु' },
        location: MenuLocation.HEADER,
        isActive: true,
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        menuItems: []
      };

      (menuRepository.create as jest.Mock).mockResolvedValue(mockCreatedMenu);

      const result = await service.importMenus(mockFile, 'user-id');

      expect(result.success).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
      expect(menuRepository.create).toHaveBeenCalled();
    });

    it('should handle import errors', async () => {
      const mockFile = {
        buffer: Buffer.from('invalid json'),
        originalname: 'test.json',
        mimetype: 'application/json'
      } as Express.Multer.File;

      const result = await service.importMenus(mockFile, 'user-id');

      expect(result.success).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('bulkPublish', () => {
    it('should bulk publish menus', async () => {
      const menuIds = ['menu-1', 'menu-2', 'menu-3'];
      const mockPublishedMenu = {
        id: 'menu-1',
        name: { en: 'Test Menu', ne: 'परीक्षण मेनु' },
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        menuItems: []
      };

      (menuRepository.publish as jest.Mock).mockResolvedValue(mockPublishedMenu);

      const result = await service.bulkPublish(menuIds, 'user-id');

      expect(result.success).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
      expect(menuRepository.publish).toHaveBeenCalledTimes(3);
    });
  });

  describe('bulkUnpublish', () => {
    it('should bulk unpublish menus', async () => {
      const menuIds = ['menu-1', 'menu-2', 'menu-3'];
      const mockUnpublishedMenu = {
        id: 'menu-1',
        name: { en: 'Test Menu', ne: 'परीक्षण मेनु' },
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        menuItems: []
      };

      (menuRepository.unpublish as jest.Mock).mockResolvedValue(mockUnpublishedMenu);

      const result = await service.bulkUnpublish(menuIds, 'user-id');

      expect(result.success).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
      expect(menuRepository.unpublish).toHaveBeenCalledTimes(3);
    });
  });

  describe('bulkDelete', () => {
    it('should bulk delete menus', async () => {
      const menuIds = ['menu-1', 'menu-2', 'menu-3'];
      const mockMenu = {
        id: 'menu-1',
        name: { en: 'Test Menu', ne: 'परीक्षण मेनु' },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        menuItems: []
      };

      (menuRepository.findById as jest.Mock).mockResolvedValue(mockMenu);
      (menuRepository.delete as jest.Mock).mockResolvedValue(undefined);

      const result = await service.bulkDelete(menuIds);

      expect(result.success).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
      expect(menuRepository.delete).toHaveBeenCalledTimes(3);
    });
  });
}); 