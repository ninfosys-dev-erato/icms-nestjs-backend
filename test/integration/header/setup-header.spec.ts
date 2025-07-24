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
import { HeaderModule } from '@/modules/header/header.module';
import { HeaderConfigService } from '@/modules/header/services/header-config.service';
import { HeaderConfigRepository } from '@/modules/header/repositories/header-config.repository';
import { HeaderAlignment } from '@/modules/header/dto/header.dto';
import { TestUtils } from '../../test-utils';

describe('Header Module Setup and Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
    await TestUtils.ensureCleanDatabase(prisma);
    // Add delay after cleanup to ensure database is ready
    await new Promise(resolve => setTimeout(resolve, 200));
  });

  afterEach(async () => {
    // Add delay after each test to allow cleanup
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  const getAuthToken = async (): Promise<string> => {
    return TestUtils.createAuthToken(prisma);
  };

  const getTestUserId = async (): Promise<string> => {
    const testUser = await TestUtils.createTestUser(prisma, {
      email: 'admin',
      password: 'Password123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    });
    return testUser.id;
  };

  describe('Module Configuration', () => {
    it('should have header module properly configured', async () => {
      const module = app.get(HeaderModule);
      expect(module).toBeDefined();
    });

    it('should have header service accessible', async () => {
      const service = app.get(HeaderConfigService);
      expect(service).toBeDefined();
    });

    it('should have header repository accessible', async () => {
      const repository = app.get(HeaderConfigRepository);
      expect(repository).toBeDefined();
    });
  });

  describe('Header Endpoints', () => {
    it('should have public header endpoints accessible', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/header-configs')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should have admin header endpoints protected', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/header-configs')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Unauthorized');
    });
  });

  describe('Basic CRUD Operations', () => {
    it('should create header config', async () => {
      const authToken = await getAuthToken();
      
      const headerData = {
        name: {
          en: 'Test Header',
          ne: 'परीक्षण हेडर',
        },
        order: 1,
        isActive: true,
        isPublished: false,
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
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/header-configs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(headerData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name.en).toBe(headerData.name.en);
      expect(response.body.data.name.ne).toBe(headerData.name.ne);
    });

    it('should get header config by id', async () => {
      const authToken = await getAuthToken();
      
      // Create a header config first
      const headerData = {
        name: {
          en: 'Test Header for Get',
          ne: 'प्राप्त गर्न परीक्षण हेडर',
        },
        order: 1,
        isActive: true,
        isPublished: false,
        typography: {
          fontFamily: 'Arial, sans-serif',
          fontSize: 16,
          fontWeight: 'normal',
          color: '#333333',
          lineHeight: 1.5,
          letterSpacing: 0.5,
        },
        alignment: HeaderAlignment.CENTER,
        logo: {
          leftLogo: null,
          rightLogo: null,
          logoAlignment: 'center',
          logoSpacing: 20,
        },
        layout: {
          headerHeight: 80,
          backgroundColor: '#ffffff',
          padding: { top: 10, right: 20, bottom: 10, left: 20 },
          margin: { top: 0, right: 0, bottom: 0, left: 0 },
        },
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/admin/header-configs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(headerData)
        .expect(201);

      const headerId = createResponse.body.data.id;

      // Get the header config
      const response = await request(app.getHttpServer())
        .get(`/api/v1/admin/header-configs/${headerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(headerId);
      expect(response.body.data.name.en).toBe(headerData.name.en);
    });

    it('should update header config', async () => {
      const authToken = await getAuthToken();
      
      // Create a header config first
      const headerData = {
        name: {
          en: 'Test Header for Update',
          ne: 'अपडेट गर्न परीक्षण हेडर',
        },
        order: 1,
        isActive: true,
        isPublished: false,
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
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/admin/header-configs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(headerData)
        .expect(201);

      const headerId = createResponse.body.data.id;
      expect(headerId).toBeDefined();

      // Verify the header config exists before updating
      const getResponse = await request(app.getHttpServer())
        .get(`/api/v1/admin/header-configs/${headerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data.id).toBe(headerId);

      // Update the header config
      const updateData = {
        name: {
          en: 'Updated Test Header',
          ne: 'अपडेट गरिएको परीक्षण हेडर',
        },
        order: 2,
        isActive: false,
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/admin/header-configs/${headerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name.en).toBe(updateData.name.en);
      expect(response.body.data.order).toBe(updateData.order);
      expect(response.body.data.isActive).toBe(updateData.isActive);
    });

    it('should delete header config', async () => {
      const authToken = await getAuthToken();
      
      // Create a header config first
      const headerData = {
        name: {
          en: 'Test Header for Delete',
          ne: 'मेटाउन परीक्षण हेडर',
        },
        order: 1,
        isActive: true,
        isPublished: false,
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
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/admin/header-configs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(headerData)
        .expect(201);

      const headerId = createResponse.body.data.id;

      // Delete the header config
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/admin/header-configs/${headerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Search Functionality', () => {
    it('should search header configs by name', async () => {
      const authToken = await getAuthToken();
      
      // Create test header configs
      const headerData = [
        {
          name: {
            en: 'Searchable Header One',
            ne: 'खोज्न योग्य हेडर एक',
          },
          order: 1,
          isActive: true,
          isPublished: false,
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
        },
        {
          name: {
            en: 'Another Header',
            ne: 'अर्को हेडर',
          },
          order: 2,
          isActive: true,
          isPublished: false,
          typography: {
            fontFamily: 'Arial, sans-serif',
            fontSize: 16,
            fontWeight: 'normal',
            color: '#333333',
            lineHeight: 1.5,
            letterSpacing: 0.5,
          },
          alignment: HeaderAlignment.CENTER,
          logo: {
            leftLogo: null,
            rightLogo: null,
            logoAlignment: 'center',
            logoSpacing: 20,
          },
          layout: {
            headerHeight: 80,
            backgroundColor: '#ffffff',
            padding: { top: 10, right: 20, bottom: 10, left: 20 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
          },
        },
      ];

      for (const data of headerData) {
        await request(app.getHttpServer())
          .post('/api/v1/admin/header-configs')
          .set('Authorization', `Bearer ${authToken}`)
          .send(data)
          .expect(201);
      }

      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/header-configs/search?q=Searchable')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].name.en).toContain('Searchable');
    });
  });

  describe('Pagination Support', () => {
    it('should support pagination', async () => {
      // Get a fresh auth token for this test
      const authToken = await getAuthToken();
      
      // Create multiple header configs for pagination testing
      for (let i = 1; i <= 15; i++) {
        try {
          const data = {
            name: {
              en: `Test Header ${i}`,
              ne: `परीक्षण हेडर ${i}`,
            },
            order: i,
            isActive: true,
            isPublished: false,
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
          };

          await request(app.getHttpServer())
            .post('/api/v1/admin/header-configs')
            .set('Authorization', `Bearer ${authToken}`)
            .send(data)
            .expect(201);

          // Add small delay between creations
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.warn(`Failed to create header config ${i}:`, error.message);
        }
      }

      // Get a fresh auth token for the pagination request
      const freshAuthToken = await getAuthToken();

      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/header-configs')
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${freshAuthToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(10);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });
  });

  describe('Validation', () => {
    it('should validate required fields', async () => {
      const authToken = await getAuthToken();
      
      const invalidData = {
        // Missing required fields
        order: 1,
        isActive: true,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/header-configs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      // Check for validation error in the response
      expect(response.body.error).toBeDefined();
    });

    it('should validate enum values', async () => {
      const authToken = await getAuthToken();
      
      const invalidData = {
        name: {
          en: 'Test Header',
          ne: 'परीक्षण हेडर',
        },
        order: 1,
        isActive: true,
        isPublished: false,
        typography: {
          fontFamily: 'Arial, sans-serif',
          fontSize: 16,
          fontWeight: 'normal',
          color: '#333333',
          lineHeight: 1.5,
          letterSpacing: 0.5,
        },
        alignment: 'INVALID_ALIGNMENT', // Invalid enum value
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
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/header-configs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle not found errors', async () => {
      const authToken = await getAuthToken();
      
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/header-configs/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('not found');
    });

    it('should handle unauthorized access', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/header-configs')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Unauthorized');
    });
  });
}); 