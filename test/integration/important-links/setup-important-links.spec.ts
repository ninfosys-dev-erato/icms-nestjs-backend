import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../../src/database/prisma.service';
import { ImportantLinksModule } from '../../../src/modules/important-links/important-links.module';
import { ImportantLinksService } from '../../../src/modules/important-links/services/important-links.service';
import { ImportantLinksRepository } from '../../../src/modules/important-links/repositories/important-links.repository';
import { 
  CreateImportantLinkDto, 
  UpdateImportantLinkDto,
  ImportantLinksQueryDto 
} from '../../../src/modules/important-links/dto/important-links.dto';

describe('Important Links Module Setup', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let importantLinksService: ImportantLinksService;
  let importantLinksRepository: ImportantLinksRepository;

  const testImportantLink: CreateImportantLinkDto = {
    linkTitle: {
      en: 'Government Portal',
      ne: 'सरकारी पोर्टल',
    },
    linkUrl: 'https://www.gov.np',
    order: 1,
    isActive: true,
  };

  const testImportantLinks = [
    {
      linkTitle: {
        en: 'Ministry of Education',
        ne: 'शिक्षा मन्त्रालय',
      },
      linkUrl: 'https://moe.gov.np',
      order: 2,
      isActive: true,
    },
    {
      linkTitle: {
        en: 'National Portal',
        ne: 'राष्ट्रिय पोर्टल',
      },
      linkUrl: 'https://nepal.gov.np',
      order: 3,
      isActive: true,
    },
    {
      linkTitle: {
        en: 'Facebook',
        ne: 'फेसबुक',
      },
      linkUrl: 'https://facebook.com',
      order: 4,
      isActive: false,
    },
  ];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ImportantLinksModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    importantLinksService = moduleFixture.get<ImportantLinksService>(ImportantLinksService);
    importantLinksRepository = moduleFixture.get<ImportantLinksRepository>(ImportantLinksRepository);
  });

  afterAll(async () => {
    await cleanupDatabase();
    await app.close();
  });

  const cleanupDatabase = async () => {
    const tables = [
      'important_links',
      'user_sessions',
      'login_attempts',
      'audit_logs',
      'users',
    ];

    for (const table of tables) {
      await prismaService.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    }
  };

  describe('Module Configuration', () => {
    it('should be defined', () => {
      expect(app).toBeDefined();
    });

    it('should have ImportantLinksService defined', () => {
      expect(importantLinksService).toBeDefined();
    });

    it('should have ImportantLinksRepository defined', () => {
      expect(importantLinksRepository).toBeDefined();
    });
  });

  describe('Database Schema', () => {
    it('should have important_links table', async () => {
      const tables = await prismaService.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'important_links'
      `;
      
      expect(tables).toHaveLength(1);
    });

    it('should have correct important_links table structure', async () => {
      const columns = await prismaService.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'important_links'
        ORDER BY ordinal_position
      `;

      const expectedColumns = [
        { column_name: 'id', data_type: 'text', is_nullable: 'NO' },
        { column_name: 'linkTitle', data_type: 'jsonb', is_nullable: 'NO' },
        { column_name: 'linkUrl', data_type: 'text', is_nullable: 'NO' },
        { column_name: 'order', data_type: 'integer', is_nullable: 'NO' },
        { column_name: 'isActive', data_type: 'boolean', is_nullable: 'NO' },
        { column_name: 'createdAt', data_type: 'timestamp without time zone', is_nullable: 'NO' },
        { column_name: 'updatedAt', data_type: 'timestamp without time zone', is_nullable: 'NO' },
      ];

      expect(columns).toHaveLength(expectedColumns.length);
      
      expectedColumns.forEach((expected, index) => {
        expect(columns[index]).toMatchObject(expected);
      });
    });
  });

  describe('Basic CRUD Operations', () => {
    beforeEach(async () => {
      await cleanupDatabase();
    });

    it('should create important link', async () => {
      const createdLink = await importantLinksService.createImportantLink(testImportantLink);

      expect(createdLink).toBeDefined();
      expect(createdLink.id).toBeDefined();
      expect(createdLink.linkTitle).toEqual(testImportantLink.linkTitle);
      expect(createdLink.linkUrl).toBe(testImportantLink.linkUrl);
      expect(createdLink.order).toBe(testImportantLink.order);
      expect(createdLink.isActive).toBe(testImportantLink.isActive);
      expect(createdLink.createdAt).toBeInstanceOf(Date);
      expect(createdLink.updatedAt).toBeInstanceOf(Date);
    });

    it('should read important link by ID', async () => {
      const createdLink = await importantLinksService.createImportantLink(testImportantLink);
      const retrievedLink = await importantLinksService.getImportantLink(createdLink.id);

      expect(retrievedLink).toEqual(createdLink);
    });

    it('should update important link', async () => {
      const createdLink = await importantLinksService.createImportantLink(testImportantLink);
      
      const updateData: UpdateImportantLinkDto = {
        linkTitle: {
          en: 'Updated Government Portal',
          ne: 'अपडेटेड सरकारी पोर्टल',
        },
        linkUrl: 'https://updated.gov.np',
        order: 5,
      };

      const updatedLink = await importantLinksService.updateImportantLink(createdLink.id, updateData);

      expect(updatedLink.linkTitle).toEqual(updateData.linkTitle);
      expect(updatedLink.linkUrl).toBe(updateData.linkUrl);
      expect(updatedLink.order).toBe(updateData.order);
      expect(updatedLink.id).toBe(createdLink.id);
    });

    it('should delete important link', async () => {
      const createdLink = await importantLinksService.createImportantLink(testImportantLink);
      
      await importantLinksService.deleteImportantLink(createdLink.id);

      await expect(importantLinksService.getImportantLink(createdLink.id))
        .rejects.toThrow();
    });
  });

  describe('Pagination Support', () => {
    beforeEach(async () => {
      await cleanupDatabase();
      
      // Create multiple important links
      for (const link of testImportantLinks) {
        await importantLinksService.createImportantLink(link);
      }
    });

    it('should support pagination', async () => {
      const result = await importantLinksService.getImportantLinksWithPagination(1, 2);

      expect(result.data).toHaveLength(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(2);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(false);
    });

    it('should support second page', async () => {
      const result = await importantLinksService.getImportantLinksWithPagination(2, 2);

      expect(result.data).toHaveLength(1);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(true);
    });
  });

  describe('Filtering Support', () => {
    beforeEach(async () => {
      await cleanupDatabase();
      
      // Create multiple important links with different active states
      for (const link of testImportantLinks) {
        await importantLinksService.createImportantLink(link);
      }
    });

    it('should filter by active status', async () => {
      const activeLinks = await importantLinksService.getImportantLinksWithPagination(1, 10, true);

      expect(activeLinks.data.every(link => link.isActive)).toBe(true);
      expect(activeLinks.pagination.total).toBe(2); // Only 2 active links
    });
  });

  describe('Statistics Functionality', () => {
    beforeEach(async () => {
      await cleanupDatabase();
      
      // Create multiple important links with different active states
      for (const link of testImportantLinks) {
        await importantLinksService.createImportantLink(link);
      }
    });

    it('should provide statistics', async () => {
      const stats = await importantLinksService.getImportantLinksStatistics();

      expect(stats.total).toBe(3);
      expect(stats.active).toBe(2);
      expect(stats.inactive).toBe(1);
      expect(stats.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('Reordering Functionality', () => {
    beforeEach(async () => {
      await cleanupDatabase();
      
      // Create multiple important links
      for (const link of testImportantLinks) {
        await importantLinksService.createImportantLink(link);
      }
    });

    it('should support reordering', async () => {
      const allLinks = await importantLinksService.getAllImportantLinks();
      
      const reorderData = {
        orders: [
          { id: allLinks[0].id, order: 5 },
          { id: allLinks[1].id, order: 1 },
          { id: allLinks[2].id, order: 3 },
        ],
      };

      await importantLinksService.reorderImportantLinks(reorderData);

      const updatedLinks = await importantLinksService.getAllImportantLinks();
      
      // Verify the order has been updated
      const link1 = updatedLinks.find(link => link.id === allLinks[0].id);
      const link2 = updatedLinks.find(link => link.id === allLinks[1].id);
      const link3 = updatedLinks.find(link => link.id === allLinks[2].id);

      expect(link1.order).toBe(5);
      expect(link2.order).toBe(1);
      expect(link3.order).toBe(3);
    });
  });

  describe('Footer Links Categorization', () => {
    beforeEach(async () => {
      await cleanupDatabase();
      
      // Create multiple important links
      for (const link of testImportantLinks) {
        await importantLinksService.createImportantLink(link);
      }
    });

    it('should provide footer links by category', async () => {
      const footerLinks = await importantLinksService.getFooterLinks('en');

      expect(footerLinks).toBeDefined();
      expect(footerLinks.quickLinks).toBeDefined();
      expect(footerLinks.governmentLinks).toBeDefined();
      expect(footerLinks.socialMediaLinks).toBeDefined();
      expect(footerLinks.contactLinks).toBeDefined();
      expect(Array.isArray(footerLinks.quickLinks)).toBe(true);
      expect(Array.isArray(footerLinks.governmentLinks)).toBe(true);
      expect(Array.isArray(footerLinks.socialMediaLinks)).toBe(true);
      expect(Array.isArray(footerLinks.contactLinks)).toBe(true);
    });
  });

  describe('Bulk Operations', () => {
    beforeEach(async () => {
      await cleanupDatabase();
    });

    it('should support bulk create', async () => {
      const bulkCreateData = {
        links: testImportantLinks,
      };

      const createdLinks = await importantLinksService.bulkCreateImportantLinks(bulkCreateData);

      expect(createdLinks).toHaveLength(3);
      expect(createdLinks.every(link => link.id)).toBe(true);
      expect(createdLinks.every(link => link.linkTitle)).toBe(true);
      expect(createdLinks.every(link => link.linkUrl)).toBe(true);
    });

    it('should support bulk update', async () => {
      // First create some links
      const createdLinks = await importantLinksService.bulkCreateImportantLinks({
        links: testImportantLinks,
      });

      const bulkUpdateData = {
        links: [
          { id: createdLinks[0].id, order: 10 },
          { id: createdLinks[1].id, isActive: false },
        ],
      };

      const updatedLinks = await importantLinksService.bulkUpdateImportantLinks(bulkUpdateData);

      // The bulkUpdate method returns all links, so we expect 3 (the 2 we created plus the 1 from testImportantLink)
      expect(updatedLinks).toHaveLength(3);
      
      const updatedLink1 = updatedLinks.find(link => link.id === createdLinks[0].id);
      const updatedLink2 = updatedLinks.find(link => link.id === createdLinks[1].id);

      expect(updatedLink1.order).toBe(10);
      expect(updatedLink2.isActive).toBe(false);
    });
  });

  describe('Validation', () => {
    it('should validate required fields', async () => {
      const invalidData = {
        linkTitle: { en: '', ne: '' }, // Empty strings
        linkUrl: '', // Empty URL
        order: 1,
        isActive: true,
      };

      const validation = await importantLinksService.validateImportantLink(invalidData);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should validate URL format', async () => {
      const invalidData = {
        linkTitle: { en: 'Test', ne: 'परीक्षण' },
        linkUrl: 'not-a-valid-url',
        order: 1,
        isActive: true,
      };

      const validation = await importantLinksService.validateImportantLink(invalidData);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(error => error.field === 'linkUrl')).toBe(true);
    });

    it('should validate order is positive', async () => {
      const invalidData = {
        linkTitle: { en: 'Test', ne: 'परीक्षण' },
        linkUrl: 'https://valid.com',
        order: -1, // Negative order
        isActive: true,
      };

      const validation = await importantLinksService.validateImportantLink(invalidData);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(error => error.field === 'order')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await cleanupDatabase();
    });

    it('should handle not found errors', async () => {
      await expect(importantLinksService.getImportantLink('non-existent-id'))
        .rejects.toThrow();
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        linkTitle: { en: '', ne: '' },
        linkUrl: 'invalid-url',
        order: -1,
        isActive: true,
      };

      await expect(importantLinksService.createImportantLink(invalidData))
        .rejects.toThrow();
    });
  });
}); 