import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '@/database/prisma.service';
import { AppModule } from '@/app.module';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { ApiResponseInterceptor } from '@/common/interceptors/api-response.interceptor';
import { HeaderModule } from '@/modules/header/header.module';
import { HeaderConfigService } from '@/modules/header/services/header-config.service';
import { HeaderConfigRepository } from '@/modules/header/repositories/header-config.repository';
import { HeaderAlignment } from '@/modules/header/dto/header.dto';

describe('Header Module Setup and Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    // Set test environment variables
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing-only';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';

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
    await cleanupDatabase();
    await app.close();
  });

  beforeEach(async () => {
    await cleanupDatabase();
    await createTestUser();
  });

  const cleanupDatabase = async () => {
    try {
      const tables = [
        'header_configs',
        'user_sessions',
        'login_attempts',
        'audit_logs',
        'users',
      ];

      for (const table of tables) {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
      }
    } catch (error) {
      console.warn('Cleanup error:', error.message);
    }
  };

  const createTestUser = async () => {
    try {
      // First check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: 'admin@test.com' }
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = await prisma.user.create({
          data: {
            email: 'admin@test.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
            isActive: true,
            isEmailVerified: true, // Mark as verified for testing
          },
        });
        console.log('Test user created:', user.id);
      } else {
        console.log('Test user already exists:', existingUser.id);
      }
    } catch (error) {
      console.warn('User creation error:', error.message);
      // If creation fails, try to find the user anyway
      const user = await prisma.user.findUnique({
        where: { email: 'admin@test.com' }
      });
      if (user) {
        console.log('Found existing user:', user.id);
      }
    }
  };

  const getAuthToken = async (): Promise<string> => {
    try {
      await createTestUser(); // Ensure user exists first
      
      // Use a more reliable approach - create a user and generate token directly
      const hashedPassword = await bcrypt.hash('password123', 10);
      const uniqueEmail = `admin-${Date.now()}-${Math.random()}@test.com`;
      
      const testUser = await prisma.user.create({
        data: {
          email: uniqueEmail,
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          isActive: true,
        },
      });

      // Generate JWT token directly
      const jwt = require('jsonwebtoken');
      return jwt.sign(
        { 
          sub: testUser.id, 
          email: testUser.email, 
          role: testUser.role 
        },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );
    } catch (error) {
      console.warn('Auth token error:', error.message);
      // Create a user and token as fallback
      try {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const fallbackUser = await prisma.user.create({
          data: {
            email: `fallback-${Date.now()}-${Math.random()}@test.com`,
            password: hashedPassword,
            firstName: 'Fallback',
            lastName: 'User',
            role: 'ADMIN',
            isActive: true,
          },
        });
  
        const jwt = require('jsonwebtoken');
        return jwt.sign(
          { 
            sub: fallbackUser.id, 
            email: fallbackUser.email, 
            role: fallbackUser.role 
          },
          process.env.JWT_SECRET || 'test-secret',
          { expiresIn: '1h' }
        );
      } catch (fallbackError) {
        console.error('Fallback user creation failed:', fallbackError.message);
        throw new Error('Unable to create authentication token for testing');
      }
    }
  };

  const getTestUserId = async (): Promise<string> => {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@test.com' }
    });
    return user?.id || 'test-user-id';
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

  describe('Header Database Schema', () => {
    it('should have header config table accessible', async () => {
      const result = await prisma.headerConfig.findMany();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should support header config creation', async () => {
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

      const result = await prisma.headerConfig.create({
        data: headerData,
      });

      expect(result).toBeDefined();
      expect(result.name).toEqual(headerData.name);
      expect(result.alignment).toBe(headerData.alignment);
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
      expect(response.body.data.name).toEqual(headerData.name);
    });

    it('should update header config', async () => {
      const authToken = await getAuthToken();
      
      // First create a header config
      const headerData = {
        name: {
          en: 'Original Header',
          ne: 'मूल हेडर',
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
        .send(headerData);

      const headerId = createResponse.body.data.id;

      // Update the header config
      const updateData = {
        name: {
          en: 'Updated Header',
          ne: 'अपडेटेड हेडर',
        },
        order: 2,
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/admin/header-configs/${headerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toEqual(updateData.name);
      expect(response.body.data.order).toBe(updateData.order);
    });

    it('should delete header config', async () => {
      const authToken = await getAuthToken();
      
      // First create a header config
      const headerData = {
        name: {
          en: 'Delete Test Header',
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
        .send(headerData);

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
          .send(data);
      }

      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/header-configs/search?q=Searchable')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('Pagination Support', () => {
    it('should support pagination', async () => {
      const authToken = await getAuthToken();
      
      // Create multiple header configs
      const headerData = Array.from({ length: 15 }, (_, i) => ({
        name: {
          en: `Header ${i + 1}`,
          ne: `हेडर ${i + 1}`,
        },
        order: i + 1,
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
      }));

      for (const data of headerData) {
        await request(app.getHttpServer())
          .post('/api/v1/admin/header-configs')
          .set('Authorization', `Bearer ${authToken}`)
          .send(data);
      }

      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/header-configs')
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(10);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
      expect(response.body.pagination.total).toBeGreaterThan(0);
    });
  });

  describe('Statistics Functionality', () => {
    it('should provide header config statistics', async () => {
      const authToken = await getAuthToken();
      
      // Create header configs with different states
      const headerData = [
        {
          name: { en: 'Active Header 1', ne: 'सक्रिय हेडर १' },
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
        },
        {
          name: { en: 'Active Header 2', ne: 'सक्रिय हेडर २' },
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
        {
          name: { en: 'Inactive Header', ne: 'निष्क्रिय हेडर' },
          order: 3,
          isActive: false,
          isPublished: false,
          typography: {
            fontFamily: 'Arial, sans-serif',
            fontSize: 16,
            fontWeight: 'normal',
            color: '#333333',
            lineHeight: 1.5,
            letterSpacing: 0.5,
          },
          alignment: HeaderAlignment.RIGHT,
          logo: {
            leftLogo: null,
            rightLogo: null,
            logoAlignment: 'right',
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
          .send(data);
      }

      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/header-configs/statistics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.total).toBeGreaterThan(0);
    });
  });

  describe('CSS Generation', () => {
    it('should generate CSS for header config', async () => {
      const authToken = await getAuthToken();
      
      // Create a header config
      const headerData = {
        name: {
          en: 'CSS Test Header',
          ne: 'सीएसएस परीक्षण हेडर',
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
        .send(headerData);

      const headerId = createResponse.body.data.id;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/admin/header-configs/${headerId}/css`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.text).toContain('.header');
      expect(response.text).toContain('background-color');
    });
  });
}); 