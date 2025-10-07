import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import * as request from 'supertest';

import { PrismaService } from '@/database/prisma.service';
import { AppModule } from '@/app.module';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { ApiResponseInterceptor } from '@/common/interceptors/api-response.interceptor';
import { TestUtils, TestUser } from '../../test-utils';

describe('Header Configuration Management (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUser: TestUser;
  let authToken: string;


  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ApiResponseInterceptor());
    
    // Set global prefix to match main app
    app.setGlobalPrefix('api/v1');

    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await TestUtils.cleanupDatabase(prisma);
    await app.close();
  });

  beforeEach(async () => {
    await TestUtils.cleanupDatabase(prisma);
    testUser = await TestUtils.createTestUser(prisma, {
      email: 'admin@test.com',
      password: 'Password123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    });
    await createTestHeaderConfigs(testUser.id);
    authToken = testUser.accessToken;
  });

  const createTestHeaderConfigs = async (userId: string) => {
    // Create test header configs directly in database
    await prisma.headerConfig.createMany({
      data: [
        {
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
          alignment: 'LEFT',
          logo: {
            leftLogo: null,
            rightLogo: null,
            logoAlignment: 'left',
            logoSpacing: 20,
          },
          layout: {
            headerHeight: 80,
            backgroundColor: '#ffffff',
            borderColor: '#e0e0e0',
            borderWidth: 1,
            padding: { top: 10, right: 20, bottom: 10, left: 20 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
          },
          createdById: userId,
          updatedById: userId,
        },
        {
          name: {
            en: 'Secondary Header',
            ne: 'दोस्रो हेडर',
          },
          order: 2,
          isActive: true,
          isPublished: false,
          typography: {
            fontFamily: 'Helvetica, sans-serif',
            fontSize: 14,
            fontWeight: 'bold',
            color: '#000000',
            lineHeight: 1.2,
            letterSpacing: 0.3,
          },
          alignment: 'CENTER',
          logo: {
            leftLogo: null,
            rightLogo: null,
            logoAlignment: 'center',
            logoSpacing: 15,
          },
          layout: {
            headerHeight: 60,
            backgroundColor: '#f5f5f5',
            borderColor: '#cccccc',
            borderWidth: 2,
            padding: { top: 5, right: 15, bottom: 5, left: 15 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
          },
          createdById: userId,
          updatedById: userId,
        },
        {
          name: {
            en: 'Inactive Header',
            ne: 'निष्क्रिय हेडर',
          },
          order: 3,
          isActive: false,
          isPublished: false,
          typography: {
            fontFamily: 'Times New Roman, serif',
            fontSize: 18,
            fontWeight: 'normal',
            color: '#666666',
            lineHeight: 1.8,
            letterSpacing: 0.8,
          },
          alignment: 'RIGHT',
          logo: {
            leftLogo: null,
            rightLogo: null,
            logoAlignment: 'right',
            logoSpacing: 25,
          },
          layout: {
            headerHeight: 100,
            backgroundColor: '#e8e8e8',
            borderColor: '#999999',
            borderWidth: 3,
            padding: { top: 15, right: 25, bottom: 15, left: 25 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
          },
          createdById: userId,
          updatedById: userId,
        },
      ],
    });
  };

  describe('Public Header Endpoints', () => {
    describe('GET /api/v1/header-configs', () => {
      it('should get all published header configs', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/header-configs')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
        
        // Should only return published header configs
        const publishedConfigs = response.body.data.filter((config: any) => config.isPublished);
        expect(publishedConfigs.length).toBe(1);
      });

      it('should filter by active status', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/header-configs?isActive=true')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should handle pagination', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/header-configs?page=1&limit=10')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.pagination).toBeDefined();
        expect(response.body.pagination.page).toBe(1);
        expect(response.body.pagination.limit).toBe(10);
      });
    });

    describe('GET /api/v1/header-configs/:id', () => {
      it('should get header config by ID', async () => {
        // First get a list to find an ID
        const listResponse = await request(app.getHttpServer())
          .get('/api/v1/header-configs')
          .expect(200);

        const firstConfig = listResponse.body.data[0];
        const configId = firstConfig.id;

        const response = await request(app.getHttpServer())
          .get(`/api/v1/header-configs/${configId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.id).toBe(configId);
        expect(response.body.data.name).toBeDefined();
        expect(response.body.data.typography).toBeDefined();
      });

      it('should return 404 for non-existent header config', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/header-configs/nonexistent-id')
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      });
    });

    describe('GET /api/v1/header-configs/display/active', () => {
      it('should get active header config for display', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/header-configs/display/active')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.isActive).toBe(true);
        expect(response.body.data.isPublished).toBe(true);
      });
    });

    describe('GET /api/v1/header-configs/order/:order', () => {
      it('should get header config by order', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/header-configs/order/1')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.order).toBe(1);
      });
    });

    describe('GET /api/v1/header-configs/:id/css', () => {
      it('should get header CSS', async () => {
        // First get a list to find an ID
        const listResponse = await request(app.getHttpServer())
          .get('/api/v1/header-configs')
          .expect(200);

        const firstConfig = listResponse.body.data[0];
        const configId = firstConfig.id;

        const response = await request(app.getHttpServer())
          .get(`/api/v1/header-configs/${configId}/css`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(typeof response.body.data.css).toBe('string');
      });
    });

    describe('POST /api/v1/header-configs/preview', () => {
      it('should preview header config', async () => {
        const previewData = {
          name: {
            en: 'Preview Header',
            ne: 'पूर्वावलोकन हेडर',
          },
          typography: {
            fontFamily: 'Arial, sans-serif',
            fontSize: 16,
            fontWeight: 'normal',
            color: '#333333',
            lineHeight: 1.5,
            letterSpacing: 0.5,
          },
          alignment: 'LEFT',
          logo: {
            leftLogo: null,
            rightLogo: null,
            logoAlignment: 'left',
            logoSpacing: 20,
          },
          layout: {
            headerHeight: 80,
            backgroundColor: '#ffffff',
            borderColor: '#e0e0e0',
            borderWidth: 1,
            padding: { top: 10, right: 20, bottom: 10, left: 20 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
          },
        };

        const response = await request(app.getHttpServer())
          .post('/api/v1/header-configs/preview')
          .send(previewData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.css).toBeDefined();
        expect(response.body.data.html).toBeDefined();
      });
    });
  });

  describe('Admin Header Endpoints', () => {
    describe('GET /api/v1/admin/header-configs', () => {
      it('should get all header configs (admin)', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/header-configs')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
      });

      it('should filter by active status', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/header-configs?isActive=true')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });

      it('should filter by published status', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/header-configs?isPublished=true')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });
    });

    describe('GET /api/v1/admin/header-configs/statistics', () => {
      it('should get header config statistics', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/header-configs/statistics')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.total).toBeGreaterThan(0);
        expect(response.body.data.active).toBeGreaterThan(0);
        expect(response.body.data.published).toBeGreaterThan(0);
      });
    });

    describe('GET /api/v1/admin/header-configs/search', () => {
      it('should search header configs', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/header-configs/search?q=Main')
          .set('Authorization', `Bearer ${testUser.accessToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    describe('GET /api/v1/admin/header-configs/:id', () => {
      it('should get header config by ID (admin)', async () => {
        // First get a list to find an ID
        const listResponse = await request(app.getHttpServer())
          .get('/api/v1/admin/header-configs')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        const firstConfig = listResponse.body.data[0];
        const configId = firstConfig.id;

        const response = await request(app.getHttpServer())
          .get(`/api/v1/admin/header-configs/${configId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.id).toBe(configId);
      });
    });

    describe('POST /api/v1/admin/header-configs', () => {
      it('should create header config', async () => {
        const createData = {
          name: {
            en: 'New Header Config',
            ne: 'नयाँ हेडर कन्फिग',
          },
          typography: {
            fontFamily: 'Arial, sans-serif',
            fontSize: 16,
            fontWeight: 'normal',
            color: '#333333',
            lineHeight: 1.5,
            letterSpacing: 0.5,
          },
          alignment: 'LEFT',
          logo: {
            leftLogo: null,
            rightLogo: null,
            logoAlignment: 'left',
            logoSpacing: 20,
          },
          layout: {
            headerHeight: 80,
            backgroundColor: '#ffffff',
            borderColor: '#e0e0e0',
            borderWidth: 1,
            padding: { top: 10, right: 20, bottom: 10, left: 20 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
          },
        };

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/header-configs')
          .set('Authorization', `Bearer ${authToken}`)
          .send(createData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.name.en).toBe('New Header Config');
      });
    });

    describe('PUT /api/v1/admin/header-configs/:id', () => {
      it('should update header config', async () => {
        // First create a header config
        const createData = {
          name: {
            en: 'Test Header',
            ne: 'परीक्षण हेडर',
          },
          typography: {
            fontFamily: 'Arial, sans-serif',
            fontSize: 16,
            fontWeight: 'normal',
            color: '#333333',
            lineHeight: 1.5,
            letterSpacing: 0.5,
          },
          alignment: 'LEFT',
          logo: {
            leftLogo: null,
            rightLogo: null,
            logoAlignment: 'left',
            logoSpacing: 20,
          },
          layout: {
            headerHeight: 80,
            backgroundColor: '#ffffff',
            borderColor: '#e0e0e0',
            borderWidth: 1,
            padding: { top: 10, right: 20, bottom: 10, left: 20 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
          },
        };

        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/admin/header-configs')
          .set('Authorization', `Bearer ${authToken}`)
          .send(createData)
          .expect(201);

        const configId = createResponse.body.data.id;

        const updateData = {
          name: {
            en: 'Updated Header Config',
            ne: 'अपडेटेड हेडर कन्फिग',
          },
          typography: {
            fontFamily: 'Helvetica, sans-serif',
            fontSize: 18,
            fontWeight: 'bold',
            color: '#000000',
            lineHeight: 1.2,
            letterSpacing: 0.3,
          },
        };

        const response = await request(app.getHttpServer())
          .put(`/api/v1/admin/header-configs/${configId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.name.en).toBe('Updated Header Config');
        expect(response.body.data.typography.fontSize).toBe(18);
      });
    });

    describe('DELETE /api/v1/admin/header-configs/:id', () => {
      it('should delete header config', async () => {
        // First create a header config
        const createData = {
          name: {
            en: 'Delete Test Header',
            ne: 'मेट्ने परीक्षण हेडर',
          },
          typography: {
            fontFamily: 'Arial, sans-serif',
            fontSize: 16,
            fontWeight: 'normal',
            color: '#333333',
            lineHeight: 1.5,
            letterSpacing: 0.5,
          },
          alignment: 'LEFT',
          logo: {
            leftLogo: null,
            rightLogo: null,
            logoAlignment: 'left',
            logoSpacing: 20,
          },
          layout: {
            headerHeight: 80,
            backgroundColor: '#ffffff',
            borderColor: '#e0e0e0',
            borderWidth: 1,
            padding: { top: 10, right: 20, bottom: 10, left: 20 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
          },
        };

        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/admin/header-configs')
          .set('Authorization', `Bearer ${authToken}`)
          .send(createData)
          .expect(201);

        const configId = createResponse.body.data.id;

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/admin/header-configs/${configId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });

    describe('POST /api/v1/admin/header-configs/:id/publish', () => {
      it('should publish header config', async () => {
        // First create an unpublished header config
        const createData = {
          name: {
            en: 'Unpublished Header',
            ne: 'अप्रकाशित हेडर',
          },
          isPublished: false,
          typography: {
            fontFamily: 'Arial, sans-serif',
            fontSize: 16,
            fontWeight: 'normal',
            color: '#333333',
            lineHeight: 1.5,
            letterSpacing: 0.5,
          },
          alignment: 'LEFT',
          logo: {
            leftLogo: null,
            rightLogo: null,
            logoAlignment: 'left',
            logoSpacing: 20,
          },
          layout: {
            headerHeight: 80,
            backgroundColor: '#ffffff',
            borderColor: '#e0e0e0',
            borderWidth: 1,
            padding: { top: 10, right: 20, bottom: 10, left: 20 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
          },
        };

        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/admin/header-configs')
          .set('Authorization', `Bearer ${authToken}`)
          .send(createData)
          .expect(201);

        const configId = createResponse.body.data.id;

        const response = await request(app.getHttpServer())
          .post(`/api/v1/admin/header-configs/${configId}/publish`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.isPublished).toBe(true);
      });
    });

    describe('POST /api/v1/admin/header-configs/:id/unpublish', () => {
      it('should unpublish header config', async () => {
        // First create a published header config
        const createData = {
          name: {
            en: 'Published Header',
            ne: 'प्रकाशित हेडर',
          },
          isPublished: true,
          typography: {
            fontFamily: 'Arial, sans-serif',
            fontSize: 16,
            fontWeight: 'normal',
            color: '#333333',
            lineHeight: 1.5,
            letterSpacing: 0.5,
          },
          alignment: 'LEFT',
          logo: {
            leftLogo: null,
            rightLogo: null,
            logoAlignment: 'left',
            logoSpacing: 20,
          },
          layout: {
            headerHeight: 80,
            backgroundColor: '#ffffff',
            borderColor: '#e0e0e0',
            borderWidth: 1,
            padding: { top: 10, right: 20, bottom: 10, left: 20 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
          },
        };

        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/admin/header-configs')
          .set('Authorization', `Bearer ${authToken}`)
          .send(createData)
          .expect(201);

        const configId = createResponse.body.data.id;

        const response = await request(app.getHttpServer())
          .post(`/api/v1/admin/header-configs/${configId}/unpublish`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.isPublished).toBe(false);
      });
    });

    describe('POST /api/v1/admin/header-configs/reorder', () => {
      it('should reorder header configs', async () => {
        // First get existing header configs to get their IDs
        const listResponse = await request(app.getHttpServer())
          .get('/api/v1/admin/header-configs')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        const configs = listResponse.body.data;
        if (configs.length >= 2) {
          const reorderData = [
            { id: configs[0].id, order: 3 },
            { id: configs[1].id, order: 1 },
          ];

          const response = await request(app.getHttpServer())
            .post('/api/v1/admin/header-configs/reorder')
            .set('Authorization', `Bearer ${authToken}`)
            .send(reorderData)
            .expect(201);

          expect(response.body.success).toBe(true);
        }
      });
    });

    describe('GET /api/v1/admin/header-configs/:id/css', () => {
      it('should generate CSS for header config', async () => {
        // First get a list to find an ID
        const listResponse = await request(app.getHttpServer())
          .get('/api/v1/admin/header-configs')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        const firstConfig = listResponse.body.data[0];
        const configId = firstConfig.id;

        const response = await request(app.getHttpServer())
          .get(`/api/v1/admin/header-configs/${configId}/css`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(typeof response.body.data.css).toBe('string');
      });
    });
  });

  describe('Error handling', () => {
    it('should handle invalid pagination parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/header-configs?page=-1&limit=0')
        .expect(400); // Should return 400 for invalid parameters

      expect(response.body.success).toBe(false);
    });

    it('should handle missing search query', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/header-configs/search')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400); // Should return 400 for missing required query parameter

      expect(response.body.success).toBe(false);
    });

    it('should handle unauthorized access', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/header-configs')
        .expect(401); // Should return 401 for missing auth token

      expect(response.body.success).toBe(false);
    });
  });
});