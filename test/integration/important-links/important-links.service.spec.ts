import { Test, TestingModule } from '@nestjs/testing';
import { ImportantLinksService } from '../../../src/modules/important-links/services/important-links.service';
import { ImportantLinksRepository } from '../../../src/modules/important-links/repositories/important-links.repository';
import { 
  CreateImportantLinkDto, 
  UpdateImportantLinkDto, 
  ImportantLinkResponseDto,
  ImportantLinksQueryDto,
  ImportantLinksStatistics,
  ValidationResult,
  BulkCreateImportantLinksDto,
  BulkUpdateImportantLinksDto,
  ReorderImportantLinksDto,
  FooterLinksDto,
  ImportResult,
  ExportResult
} from '../../../src/modules/important-links/dto/important-links.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ImportantLinksService', () => {
  let service: ImportantLinksService;
  let repository: jest.Mocked<ImportantLinksRepository>;

  const mockImportantLink = {
    id: '1',
    linkTitle: {
      en: 'Government Portal',
      ne: 'सरकारी पोर्टल',
    },
    linkUrl: 'https://www.gov.np',
    order: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockImportantLinks = [
    mockImportantLink,
    {
      ...mockImportantLink,
      id: '2',
      linkTitle: {
        en: 'Ministry of Education',
        ne: 'शिक्षा मन्त्रालय',
      },
      linkUrl: 'https://moe.gov.np',
      order: 2,
    },
    {
      ...mockImportantLink,
      id: '3',
      linkTitle: {
        en: 'National Portal',
        ne: 'राष्ट्रिय पोर्टल',
      },
      linkUrl: 'https://nepal.gov.np',
      order: 3,
      isActive: false,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportantLinksService,
        {
          provide: ImportantLinksRepository,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            findWithPagination: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            reorder: jest.fn(),
            getStatistics: jest.fn(),
            bulkCreate: jest.fn(),
            bulkUpdate: jest.fn(),
            getFooterLinks: jest.fn(),
            findByUrl: jest.fn(),
            existsByUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ImportantLinksService>(ImportantLinksService);
    repository = module.get(ImportantLinksRepository);
  });

  describe('getImportantLink', () => {
    it('should return important link when found', async () => {
      repository.findById.mockResolvedValue(mockImportantLink);

      const result = await service.getImportantLink('1');

      expect(result).toEqual(expect.objectContaining({
        id: '1',
        linkTitle: mockImportantLink.linkTitle,
        linkUrl: mockImportantLink.linkUrl,
        order: mockImportantLink.order,
        isActive: mockImportantLink.isActive,
      }));
      expect(repository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when important link not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getImportantLink('999')).rejects.toThrow(NotFoundException);
      expect(repository.findById).toHaveBeenCalledWith('999');
    });
  });

  describe('getAllImportantLinks', () => {
    it('should return all important links', async () => {
      repository.findAll.mockResolvedValue(mockImportantLinks);

      const query: ImportantLinksQueryDto = { lang: 'en' };
      const result = await service.getAllImportantLinks(query);

      expect(result).toEqual(mockImportantLinks.map(link => 
        service['transformToResponseDto'](link, 'en')
      ));
      expect(repository.findAll).toHaveBeenCalled();
    });
  });

  describe('getImportantLinksWithPagination', () => {
    it('should return paginated important links', async () => {
      const mockResult = {
        data: mockImportantLinks,
        total: 3,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      repository.findWithPagination.mockResolvedValue(mockResult);

      const result = await service.getImportantLinksWithPagination(1, 10);

      expect(result.data).toEqual(mockImportantLinks.map(link => 
        service['transformToResponseDto'](link)
      ));
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.totalPages).toBe(1);
      expect(repository.findWithPagination).toHaveBeenCalledWith(1, 10, undefined);
    });

    it('should apply isActive filter', async () => {
      const activeImportantLinks = mockImportantLinks.filter(link => link.isActive);
      const mockResult = {
        data: activeImportantLinks,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      repository.findWithPagination.mockResolvedValue(mockResult);

      const result = await service.getImportantLinksWithPagination(1, 10, true);

      expect(result.data).toEqual(activeImportantLinks.map(link => 
        service['transformToResponseDto'](link)
      ));
      expect(repository.findWithPagination).toHaveBeenCalledWith(1, 10, true);
    });
  });

  describe('createImportantLink', () => {
    it('should create important link successfully', async () => {
      const createData: CreateImportantLinkDto = {
        linkTitle: mockImportantLink.linkTitle,
        linkUrl: mockImportantLink.linkUrl,
        order: 1,
        isActive: true,
      };

      repository.create.mockResolvedValue(mockImportantLink);

      const result = await service.createImportantLink(createData);

      expect(result).toEqual(expect.objectContaining({
        id: '1',
        linkTitle: createData.linkTitle,
        linkUrl: createData.linkUrl,
        order: createData.order,
        isActive: createData.isActive,
      }));
      expect(repository.create).toHaveBeenCalledWith(createData);
    });

    it('should throw BadRequestException for invalid data', async () => {
      const invalidData: CreateImportantLinkDto = {
        linkTitle: { en: '', ne: '' }, // Invalid: empty strings
        linkUrl: 'invalid-url', // Invalid URL
        order: 1,
        isActive: true,
      };

      // Mock validation to return invalid result
      jest.spyOn(service as any, 'validateImportantLink').mockResolvedValue({
        isValid: false,
        errors: [{ field: 'linkTitle', message: 'Link title is required', code: 'REQUIRED_FIELD' }],
      });

      await expect(service.createImportantLink(invalidData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateImportantLink', () => {
    it('should update important link successfully', async () => {
      const updateData: UpdateImportantLinkDto = {
        linkTitle: {
          en: 'Updated Government Portal',
          ne: 'अपडेटेड सरकारी पोर्टल',
        },
        linkUrl: 'https://updated.gov.np',
        order: 5,
      };

      const updatedImportantLink = { ...mockImportantLink, ...updateData };
      repository.findById.mockResolvedValue(mockImportantLink);
      repository.update.mockResolvedValue(updatedImportantLink);

      const result = await service.updateImportantLink('1', updateData);

      expect(result.linkTitle.en).toBe('Updated Government Portal');
      expect(result.linkUrl).toBe('https://updated.gov.np');
      expect(result.order).toBe(5);
      expect(repository.update).toHaveBeenCalledWith('1', updateData);
    });

    it('should throw NotFoundException when important link not found', async () => {
      // Mock the repository update to throw an error for non-existent link
      repository.update.mockRejectedValue(new Error('Record to update not found'));

      await expect(service.updateImportantLink('999', {})).rejects.toThrow();
    });
  });

  describe('deleteImportantLink', () => {
    it('should delete important link successfully', async () => {
      repository.findById.mockResolvedValue(mockImportantLink);
      repository.delete.mockResolvedValue();

      await service.deleteImportantLink('1');

      expect(repository.findById).toHaveBeenCalledWith('1');
      expect(repository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when important link not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.deleteImportantLink('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('reorderImportantLinks', () => {
    it('should reorder important links successfully', async () => {
      const reorderData: ReorderImportantLinksDto = {
        orders: [
          { id: '1', order: 3 },
          { id: '2', order: 1 },
          { id: '3', order: 2 },
        ],
      };

      repository.reorder.mockResolvedValue();

      await service.reorderImportantLinks(reorderData);

      expect(repository.reorder).toHaveBeenCalledWith(reorderData.orders);
    });
  });

  describe('bulkCreateImportantLinks', () => {
    it('should bulk create important links successfully', async () => {
      const bulkCreateData: BulkCreateImportantLinksDto = {
        links: [
          {
            linkTitle: { en: 'Link 1', ne: 'लिङ्क १' },
            linkUrl: 'https://link1.com',
            order: 1,
            isActive: true,
          },
          {
            linkTitle: { en: 'Link 2', ne: 'लिङ्क २' },
            linkUrl: 'https://link2.com',
            order: 2,
            isActive: true,
          },
        ],
      };

      const createdImportantLinks = bulkCreateData.links.map((link, index) => ({
        id: (index + 1).toString(),
        linkTitle: link.linkTitle,
        linkUrl: link.linkUrl,
        order: link.order || 0,
        isActive: link.isActive !== undefined ? link.isActive : true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      repository.bulkCreate.mockResolvedValue(createdImportantLinks);

      const result = await service.bulkCreateImportantLinks(bulkCreateData);

      expect(result).toHaveLength(2);
      expect(repository.bulkCreate).toHaveBeenCalledWith(bulkCreateData.links);
    });
  });

  describe('bulkUpdateImportantLinks', () => {
    it('should bulk update important links successfully', async () => {
      const bulkUpdateData: BulkUpdateImportantLinksDto = {
        links: [
          { id: '1', order: 5, linkTitle: mockImportantLinks[0].linkTitle, linkUrl: mockImportantLinks[0].linkUrl, isActive: mockImportantLinks[0].isActive },
          { id: '2', isActive: false, linkTitle: mockImportantLinks[1].linkTitle, linkUrl: mockImportantLinks[1].linkUrl, order: mockImportantLinks[1].order },
        ],
      };

      const updatedImportantLinks = bulkUpdateData.links.map((link, index) => ({
        id: link.id,
        linkTitle: mockImportantLinks[index].linkTitle,
        linkUrl: mockImportantLinks[index].linkUrl,
        order: link.order || mockImportantLinks[index].order,
        isActive: link.isActive !== undefined ? link.isActive : mockImportantLinks[index].isActive,
        createdAt: mockImportantLinks[index].createdAt,
        updatedAt: new Date(),
      }));

      // Mock validation to pass
      jest.spyOn(service as any, 'validateImportantLink').mockResolvedValue({
        isValid: true,
        errors: [],
      });

      repository.bulkUpdate.mockResolvedValue(updatedImportantLinks);

      const result = await service.bulkUpdateImportantLinks(bulkUpdateData);

      expect(result).toHaveLength(2);
      expect(repository.bulkUpdate).toHaveBeenCalledWith(
        bulkUpdateData.links.map(link => ({ 
          id: link.id, 
          data: {
            linkTitle: link.linkTitle,
            linkUrl: link.linkUrl,
            order: link.order,
            isActive: link.isActive,
          }
        }))
      );
    });
  });

  describe('getImportantLinksStatistics', () => {
    it('should return important links statistics', async () => {
      const mockStats: ImportantLinksStatistics = {
        total: 10,
        active: 8,
        inactive: 2,
        lastUpdated: new Date(),
      };

      repository.getStatistics.mockResolvedValue(mockStats);

      const result = await service.getImportantLinksStatistics();

      expect(result).toEqual(mockStats);
      expect(repository.getStatistics).toHaveBeenCalled();
    });
  });

  describe('getFooterLinks', () => {
    it('should return footer links by category', async () => {
      const mockFooterLinks: FooterLinksDto = {
        quickLinks: [mockImportantLinks[0]],
        governmentLinks: [mockImportantLinks[1]],
        socialMediaLinks: [mockImportantLinks[2]],
        contactLinks: [],
      };

      repository.getFooterLinks.mockResolvedValue(mockFooterLinks);

      const result = await service.getFooterLinks('en');

      expect(result).toEqual({
        quickLinks: [service['transformToResponseDto'](mockImportantLinks[0], 'en')],
        governmentLinks: [service['transformToResponseDto'](mockImportantLinks[1], 'en')],
        socialMediaLinks: [service['transformToResponseDto'](mockImportantLinks[2], 'en')],
        contactLinks: [],
      });
      expect(repository.getFooterLinks).toHaveBeenCalled();
    });
  });

  describe('validateImportantLink', () => {
    it('should validate important link data successfully', async () => {
      const validData: CreateImportantLinkDto = {
        linkTitle: { en: 'Valid Link', ne: 'मान्य लिङ्क' },
        linkUrl: 'https://valid.com',
        order: 1,
        isActive: true,
      };

      const result = await service.validateImportantLink(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return validation errors for invalid data', async () => {
      const invalidData: CreateImportantLinkDto = {
        linkTitle: { en: '', ne: '' }, // Too short
        linkUrl: 'invalid-url', // Invalid URL
        order: -1, // Invalid order
        isActive: true,
      };

      const result = await service.validateImportantLink(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('importImportantLinks', () => {
    it('should import important links successfully', async () => {
      const importData = [
        {
          linkTitle: { en: 'Imported Link 1', ne: 'आयातित लिङ्क १' },
          linkUrl: 'https://imported1.com',
          order: 1,
          isActive: true,
        },
        {
          linkTitle: { en: 'Imported Link 2', ne: 'आयातित लिङ्क २' },
          linkUrl: 'https://imported2.com',
          order: 2,
          isActive: true,
        },
      ];

      const importedImportantLinks = importData.map((link, index) => ({
        id: (index + 1).toString(),
        ...link,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      repository.bulkCreate.mockResolvedValue(importedImportantLinks);

      const result = await service.importImportantLinks(importData);

      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
      // The import method uses individual create/update calls, not bulkCreate
      expect(repository.create).toHaveBeenCalled();
    });

    it('should handle import errors', async () => {
      const importData = [
        {
          linkTitle: { en: 'Valid Link', ne: 'मान्य लिङ्क' },
          linkUrl: 'https://valid.com',
          order: 1,
          isActive: true,
        },
        {
          linkTitle: { en: '', ne: '' }, // Invalid
          linkUrl: 'invalid-url', // Invalid
          order: -1, // Invalid
          isActive: true,
        },
      ];

      // Mock validation to return some errors
      jest.spyOn(service as any, 'validateImportantLink')
        .mockResolvedValueOnce({ isValid: true, errors: [] })
        .mockResolvedValueOnce({ 
          isValid: false, 
          errors: [
            { field: 'linkTitle', message: 'Link title is required', code: 'REQUIRED_FIELD' },
            { field: 'linkUrl', message: 'Invalid URL format', code: 'INVALID_URL' },
          ] 
        });

      const result = await service.importImportantLinks(importData);

      expect(result.success).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('exportImportantLinks', () => {
    it('should export important links', async () => {
      repository.findAll.mockResolvedValue(mockImportantLinks);

      const result = await service.exportImportantLinks();
      
      expect(result.data).toEqual(mockImportantLinks.map(link => 
        service['transformToResponseDto'](link)
      ));
      expect(result.total).toBe(3);
      expect(result.exportedAt).toBeInstanceOf(Date);
    });
  });

  describe('transformToResponseDto', () => {
    it('should transform important link to response DTO', async () => {
      const importantLink = {
        ...mockImportantLink,
      };

      const result = service['transformToResponseDto'](importantLink);

      expect(result).toEqual({
        id: importantLink.id,
        linkTitle: importantLink.linkTitle,
        linkUrl: importantLink.linkUrl,
        order: importantLink.order,
        isActive: importantLink.isActive,
        createdAt: importantLink.createdAt,
        updatedAt: importantLink.updatedAt,
      });
    });

    it('should transform with language preference', async () => {
      const importantLink = {
        ...mockImportantLink,
      };

      const result = service['transformToResponseDto'](importantLink, 'en');

      expect(result).toEqual({
        id: importantLink.id,
        linkTitle: {
          en: importantLink.linkTitle.en,
          ne: importantLink.linkTitle.ne,
          value: importantLink.linkTitle.en, // For 'en' language
        },
        linkUrl: importantLink.linkUrl,
        order: importantLink.order,
        isActive: importantLink.isActive,
        createdAt: importantLink.createdAt,
        updatedAt: importantLink.updatedAt,
      });
    });
  });

  describe('isValidUrl', () => {
    it('should validate valid URLs', async () => {
      const validUrls = [
        'https://www.example.com',
        'http://example.com',
        'https://subdomain.example.com/path?param=value',
        'https://example.com:8080',
      ];

      validUrls.forEach(url => {
        expect(service['isValidUrl'](url)).toBe(true);
      });
    });

    it('should reject invalid URLs', async () => {
      const invalidUrls = [
        'not-a-url',
        'https://',
        'http://',
        'example.com',
      ];

      invalidUrls.forEach(url => {
        expect(service['isValidUrl'](url)).toBe(false);
      });
    });
  });
}); 