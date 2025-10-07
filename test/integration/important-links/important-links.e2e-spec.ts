import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../../src/database/prisma.service';
import { AppModule } from '../../../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { HttpExceptionFilter } from '../../../src/common/filters/http-exception.filter';
import { ApiResponseInterceptor } from '../../../src/common/interceptors/api-response.interceptor';
import { TestUtils } from '../../test-utils';
import { 
  CreateImportantLinkDto, 
  UpdateImportantLinkDto,
  BulkCreateImportantLinksDto,
  BulkUpdateImportantLinksDto,
  ReorderImportantLinksDto
} from '../../../src/modules/important-links/dto/important-links.dto';

describe('Important Links Module (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let authToken: string;

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
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Configure the app the same way as main.ts
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ApiResponseInterceptor());
    
    // Set global prefix to match main app
    app.setGlobalPrefix('api/v1');
    
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await TestUtils.cleanupDatabase(prismaService);
    await createTestData();
    authToken = await getAuthToken();
  });

  afterAll(async () => {
    await TestUtils.cleanupDatabase(prismaService);
    await app.close();
  });

  const cleanupDatabase = async () => {
    await TestUtils.cleanupDatabase(prismaService);
  };

  const createTestData = async () => {
    // Create test important links
    for (const link of testImportantLinks) {
      await prismaService.importantLink.create({
        data: {
          linkTitle: link.linkTitle,
          linkUrl: link.linkUrl,
          order: link.order,
          isActive: link.isActive,
        },
      });
    }
  };

  const getAuthToken = async (): Promise<string> => {
    return TestUtils.createAuthToken(prismaService);
  };

  describe('Public Important Links Endpoints', () => {
    describe('GET /api/v1/important-links', () => {
      it('should return all important links', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/important-links')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
        
        const link = response.body.data[0];
        expect(link.id).toBeDefined();
        expect(link.linkTitle).toBeDefined();
        expect(link.linkUrl).toBeDefined();
        expect(link.order).toBeDefined();
        expect(link.isActive).toBeDefined();
      });

      it('should return important links with language filter', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/important-links?lang=en')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    describe('GET /api/v1/important-links/pagination', () => {
      it('should return paginated important links', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/important-links/pagination?page=1&limit=2')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.pagination).toBeDefined();
        expect(response.body.data).toHaveLength(2);
        expect(response.body.pagination.page).toBe(1);
        expect(response.body.pagination.limit).toBe(2);
        expect(response.body.pagination.total).toBeGreaterThan(0);
        expect(response.body.pagination.totalPages).toBeGreaterThan(0);
        expect(response.body.pagination.hasNext).toBeDefined();
        expect(response.body.pagination.hasPrev).toBeDefined();
      });

      it('should filter by active status', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/important-links/pagination?isActive=true')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.every((link: any) => link.isActive)).toBe(true);
      });
    });

    describe('GET /api/v1/important-links/footer', () => {
      it('should return footer links by category', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/important-links/footer')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.quickLinks).toBeDefined();
        expect(response.body.data.governmentLinks).toBeDefined();
        expect(response.body.data.socialMediaLinks).toBeDefined();
        expect(response.body.data.contactLinks).toBeDefined();
        expect(Array.isArray(response.body.data.quickLinks)).toBe(true);
        expect(Array.isArray(response.body.data.governmentLinks)).toBe(true);
        expect(Array.isArray(response.body.data.socialMediaLinks)).toBe(true);
        expect(Array.isArray(response.body.data.contactLinks)).toBe(true);
      });

      it('should return footer links with language filter', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/important-links/footer?lang=en')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });
    });

    describe('GET /api/v1/important-links/active', () => {
      it('should return only active important links', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/important-links/active')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.every((link: any) => link.isActive)).toBe(true);
      });

      it('should return active links with language filter', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/important-links/active?lang=en')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });
    });

    describe('GET /api/v1/important-links/:id', () => {
      it('should return important link by ID', async () => {
        // First get all links to get an ID
        const allLinksResponse = await request(app.getHttpServer())
          .get('/api/v1/important-links')
          .expect(200);

        const linkId = allLinksResponse.body.data[0].id;

        const response = await request(app.getHttpServer())
          .get(`/api/v1/important-links/${linkId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.id).toBe(linkId);
        expect(response.body.data.linkTitle).toBeDefined();
        expect(response.body.data.linkUrl).toBeDefined();
        expect(response.body.data.order).toBeDefined();
        expect(response.body.data.isActive).toBeDefined();
      });

      it('should return 404 for non-existent important link', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/important-links/non-existent-id')
          .expect(404);
      });

      it('should return important link with language filter', async () => {
        const allLinksResponse = await request(app.getHttpServer())
          .get('/api/v1/important-links')
          .expect(200);

        const linkId = allLinksResponse.body.data[0].id;

        const response = await request(app.getHttpServer())
          .get(`/api/v1/important-links/${linkId}?lang=en`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });
    });
  });

  describe('Admin Important Links Endpoints', () => {
    describe('GET /api/v1/admin/important-links', () => {
      it('should return all important links for admin', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/important-links')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
      });

      it('should return 401 without authentication', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/admin/important-links')
          .expect(401);
      });
    });

    describe('GET /api/v1/admin/important-links/pagination', () => {
      it('should return paginated important links for admin', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/important-links/pagination?page=1&limit=2')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.pagination).toBeDefined();
        expect(response.body.data).toHaveLength(2);
      });

      it('should filter by active status', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/important-links/pagination?isActive=true')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.every((link: any) => link.isActive)).toBe(true);
      });
    });

    describe('GET /api/v1/admin/important-links/statistics', () => {
      it('should return important links statistics', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/important-links/statistics')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.total).toBeDefined();
        expect(response.body.data.active).toBeDefined();
        expect(response.body.data.inactive).toBeDefined();
        expect(response.body.data.lastUpdated).toBeDefined();
        expect(typeof response.body.data.total).toBe('number');
        expect(typeof response.body.data.active).toBe('number');
        expect(typeof response.body.data.inactive).toBe('number');
      });
    });

    describe('GET /api/v1/admin/important-links/:id', () => {
      it('should return important link by ID for admin', async () => {
        const allLinksResponse = await request(app.getHttpServer())
          .get('/api/v1/admin/important-links')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        const linkId = allLinksResponse.body.data[0].id;

        const response = await request(app.getHttpServer())
          .get(`/api/v1/admin/important-links/${linkId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.id).toBe(linkId);
      });

      it('should return 404 for non-existent important link', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/admin/important-links/non-existent-id')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);
      });
    });

    describe('POST /api/v1/admin/important-links', () => {
      it('should create new important link', async () => {
        const createData: CreateImportantLinkDto = {
          linkTitle: {
            en: 'New Test Link',
            ne: 'नयाँ परीक्षण लिङ्क',
          },
          linkUrl: 'https://newtest.com',
          order: 10,
          isActive: true,
        };

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/important-links')
          .set('Authorization', `Bearer ${authToken}`)
          .send(createData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.linkTitle).toEqual(createData.linkTitle);
        expect(response.body.data.linkUrl).toBe(createData.linkUrl);
        expect(response.body.data.order).toBe(createData.order);
        expect(response.body.data.isActive).toBe(createData.isActive);
      });

      it('should return 400 for invalid data', async () => {
        const invalidData = {
          linkTitle: { en: '', ne: '' }, // Empty strings
          linkUrl: 'invalid-url', // Invalid URL
          order: -1, // Invalid order
          isActive: true,
        };

        await request(app.getHttpServer())
          .post('/api/v1/admin/important-links')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);
      });

      it('should return 401 without authentication', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/admin/important-links')
          .send(testImportantLink)
          .expect(401);
      });
    });

    describe('PUT /api/v1/admin/important-links/:id', () => {
      it('should update existing important link', async () => {
        // First create a link
        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/admin/important-links')
          .set('Authorization', `Bearer ${authToken}`)
          .send(testImportantLink)
          .expect(201);

        const linkId = createResponse.body.data.id;

        const updateData: UpdateImportantLinkDto = {
          linkTitle: {
            en: 'Updated Test Link',
            ne: 'अपडेटेड परीक्षण लिङ्क',
          },
          linkUrl: 'https://updatedtest.com',
          order: 15,
        };

        const response = await request(app.getHttpServer())
          .put(`/api/v1/admin/important-links/${linkId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.id).toBe(linkId);
        expect(response.body.data.linkTitle).toEqual(updateData.linkTitle);
        expect(response.body.data.linkUrl).toBe(updateData.linkUrl);
        expect(response.body.data.order).toBe(updateData.order);
      });

      it('should return 404 for non-existent important link', async () => {
        const updateData: UpdateImportantLinkDto = {
          linkTitle: { en: 'Test', ne: 'परीक्षण' },
          linkUrl: 'https://test.com',
        };

        await request(app.getHttpServer())
          .put('/api/v1/admin/important-links/non-existent-id')
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(404);
      });
    });

    describe('DELETE /api/v1/admin/important-links/:id', () => {
      it('should delete important link', async () => {
        // First create a link
        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/admin/important-links')
          .set('Authorization', `Bearer ${authToken}`)
          .send(testImportantLink)
          .expect(201);

        const linkId = createResponse.body.data.id;

        await request(app.getHttpServer())
          .delete(`/api/v1/admin/important-links/${linkId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        // Verify it's deleted
        await request(app.getHttpServer())
          .get(`/api/v1/admin/important-links/${linkId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);
      });

      it('should return 404 for non-existent important link', async () => {
        await request(app.getHttpServer())
          .delete('/api/v1/admin/important-links/non-existent-id')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);
      });
    });

    describe('POST /api/v1/admin/important-links/reorder', () => {
      it('should reorder important links', async () => {
        // First get existing links
        const allLinksResponse = await request(app.getHttpServer())
          .get('/api/v1/admin/important-links')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        const links = allLinksResponse.body.data.slice(0, 3); // Take first 3 links

        const reorderData: ReorderImportantLinksDto = {
          orders: [
            { id: links[0].id, order: 10 },
            { id: links[1].id, order: 5 },
            { id: links[2].id, order: 15 },
          ],
        };

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/important-links/reorder')
          .set('Authorization', `Bearer ${authToken}`)
          .send(reorderData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.message).toBeDefined();

        // Verify the order has been updated
        const updatedLinksResponse = await request(app.getHttpServer())
          .get('/api/v1/admin/important-links')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        const updatedLinks = updatedLinksResponse.body.data;
        const link1 = updatedLinks.find((link: any) => link.id === links[0].id);
        const link2 = updatedLinks.find((link: any) => link.id === links[1].id);
        const link3 = updatedLinks.find((link: any) => link.id === links[2].id);

        expect(link1.order).toBe(10);
        expect(link2.order).toBe(5);
        expect(link3.order).toBe(15);
      });
    });

    describe('POST /api/v1/admin/important-links/bulk-create', () => {
      it('should bulk create important links', async () => {
        const bulkCreateData: BulkCreateImportantLinksDto = {
          links: [
            {
              linkTitle: { en: 'Bulk Link 1', ne: 'बल्क लिङ्क १' },
              linkUrl: 'https://bulk1.com',
              order: 20,
              isActive: true,
            },
            {
              linkTitle: { en: 'Bulk Link 2', ne: 'बल्क लिङ्क २' },
              linkUrl: 'https://bulk2.com',
              order: 21,
              isActive: true,
            },
          ],
        };

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/important-links/bulk-create')
          .set('Authorization', `Bearer ${authToken}`)
          .send(bulkCreateData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data).toHaveLength(2);
        expect(response.body.data.every((link: any) => link.id)).toBe(true);
      });
    });

   

    describe('POST /api/v1/admin/important-links/import', () => {
      it('should import important links', async () => {
        const importData: BulkCreateImportantLinksDto = {
          links: [
            {
              linkTitle: { en: 'Import Link 1', ne: 'आयात लिङ्क १' },
              linkUrl: 'https://import1.com',
              order: 40,
              isActive: true,
            },
            {
              linkTitle: { en: 'Import Link 2', ne: 'आयात लिङ्क २' },
              linkUrl: 'https://import2.com',
              order: 41,
              isActive: true,
            },
          ],
        };

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/important-links/import')
          .set('Authorization', `Bearer ${authToken}`)
          .send(importData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.success).toBeDefined();
        expect(response.body.data.failed).toBeDefined();
        expect(response.body.data.errors).toBeDefined();
        expect(response.body.data.success).toBe(2);
        expect(response.body.data.failed).toBe(0);
      });
    });

    describe('GET /api/v1/admin/important-links/export', () => {
      it('should export important links', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/important-links/export')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.data).toBeDefined();
        expect(response.body.data.total).toBeDefined();
        expect(response.body.data.exportedAt).toBeDefined();
        expect(Array.isArray(response.body.data.data)).toBe(true);
        expect(typeof response.body.data.total).toBe('number');
      });
    });
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication for admin endpoints', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/important-links')
        .expect(401);
    });

    it('should accept valid JWT token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/important-links')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should reject invalid JWT token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/important-links')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Validation', () => {
    it('should validate required fields', async () => {
      const invalidData = {
        linkTitle: { en: '', ne: '' }, // Empty strings
        linkUrl: '', // Empty URL
        order: -1, // Invalid order
        isActive: true,
      };

      await request(app.getHttpServer())
        .post('/api/v1/admin/important-links')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should validate URL format', async () => {
      const invalidData = {
        linkTitle: { en: 'Test', ne: 'परीक्षण' },
        linkUrl: 'not-a-valid-url',
        order: 1,
        isActive: true,
      };

      await request(app.getHttpServer())
        .post('/api/v1/admin/important-links')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should validate order is positive', async () => {
      const invalidData = {
        linkTitle: { en: 'Test', ne: 'परीक्षण' },
        linkUrl: 'https://valid.com',
        order: -1, // Negative order
        isActive: true,
      };

      await request(app.getHttpServer())
        .post('/api/v1/admin/important-links')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent resources', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/important-links/non-existent-id')
        .expect(404);

      await request(app.getHttpServer())
        .get('/api/v1/admin/important-links/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 400 for invalid request data', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/important-links')
        .set('Authorization', `Bearer ${authToken}`)
        .send({}) // Empty object
        .expect(400);
    });

    it('should return 401 for unauthorized access', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/important-links')
        .send(testImportantLink)
        .expect(401);
    });
  });
}); 