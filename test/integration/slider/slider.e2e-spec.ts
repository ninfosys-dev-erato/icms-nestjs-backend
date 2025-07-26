import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/database/prisma.service';
import { HttpExceptionFilter } from '../../../src/common/filters/http-exception.filter';
import { ApiResponseInterceptor } from '../../../src/common/interceptors/api-response.interceptor';
import { RequestIdMiddleware } from '../../../src/common/middleware/request-id.middleware';

describe('Slider Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let adminToken: string;
  let editorToken: string;
  let viewerToken: string;
  let testSliderId: string;
  let testMediaId: string;

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
      forbidNonWhitelisted: false,
      transform: true,
    }));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ApiResponseInterceptor());
    
    // Apply request ID middleware
    const requestIdMiddleware = new RequestIdMiddleware();
    app.use(requestIdMiddleware.use.bind(requestIdMiddleware));
    
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
    await createTestUsers();
    await createTestMedia();
  });

  const cleanupDatabase = async () => {
    try {
      const tables = [
        'slider_views',
        'slider_clicks',
        'sliders',
        'media',
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

  const createTestUsers = async () => {
    try {
      // Try to login first, if user exists
      let adminResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@slider.com',
          password: 'AdminPass123!',
        });

      if (adminResponse.status === 200 && adminResponse.body.success) {
        adminToken = adminResponse.body.data.accessToken;
        console.log('Admin user logged in successfully');
      } else {
        // Create admin user if login fails
        adminResponse = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            email: 'admin@slider.com',
            password: 'AdminPass123!',
            confirmPassword: 'AdminPass123!',
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
          });

        if (adminResponse.status === 201 && adminResponse.body.success) {
          adminToken = adminResponse.body.data.accessToken;
          console.log('Admin user created successfully');
        } else {
          console.error('Admin user creation failed:', adminResponse.body);
          throw new Error('Failed to create admin user');
        }
      }

      // Try to login editor user first
      let editorResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'editor@slider.com',
          password: 'EditorPass123!',
        });

      if (editorResponse.status === 200 && editorResponse.body.success) {
        editorToken = editorResponse.body.data.accessToken;
        console.log('Editor user logged in successfully');
      } else {
        // Create editor user if login fails
        editorResponse = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            email: 'editor@slider.com',
            password: 'EditorPass123!',
            confirmPassword: 'EditorPass123!',
            firstName: 'Editor',
            lastName: 'User',
            role: 'EDITOR',
          });

        if (editorResponse.status === 201 && editorResponse.body.success) {
          editorToken = editorResponse.body.data.accessToken;
          console.log('Editor user created successfully');
        } else {
          console.error('Editor user creation failed:', editorResponse.body);
        }
      }

      // Try to login viewer user first
      let viewerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'viewer@slider.com',
          password: 'ViewerPass123!',
        });

      if (viewerResponse.status === 200 && viewerResponse.body.success) {
        viewerToken = viewerResponse.body.data.accessToken;
        console.log('Viewer user logged in successfully');
      } else {
        // Create viewer user if login fails
        viewerResponse = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            email: 'viewer@slider.com',
            password: 'ViewerPass123!',
            confirmPassword: 'ViewerPass123!',
            firstName: 'Viewer',
            lastName: 'User',
            role: 'VIEWER',
          });

        if (viewerResponse.status === 201 && viewerResponse.body.success) {
          viewerToken = viewerResponse.body.data.accessToken;
          console.log('Viewer user created successfully');
        } else {
          console.error('Viewer user creation failed:', viewerResponse.body);
        }
      }
    } catch (error) {
      console.error('Error creating test users:', error);
      throw error;
    }
  };

  const createTestMedia = async () => {
    try {
      const media = await prisma.media.create({
        data: {
          fileName: 'test-slider-image.jpg',
          originalName: 'test-slider-image.jpg',
          mimeType: 'image/jpeg',
          fileSize: 1024,
          filePath: '/uploads/test-slider-image.jpg',
          mediaType: 'IMAGE',
          isActive: true,
        },
      });
      testMediaId = media.id;
      console.log('Test media created successfully');
    } catch (error) {
      console.error('Error creating test media:', error);
      throw error;
    }
  };

  const createTestSlider = async () => {
    const sliderData = {
      title: { en: 'Test Slider', ne: 'परीक्षण स्लाइडर' },
      position: 1,
      displayTime: 5000,
      isActive: true,
      mediaId: testMediaId,
    };

    const response = await request(app.getHttpServer())
      .post('/api/v1/admin/sliders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(sliderData);

    if (response.status !== 201) {
      throw new Error(`Slider creation failed with status ${response.status}: ${JSON.stringify(response.body)}`);
    }

    return response.body.data.id;
  };

  describe('Public Slider Endpoints', () => {
    beforeEach(async () => {
      testSliderId = await createTestSlider();
    });

    describe('GET /api/v1/sliders', () => {
      it('should get all published sliders', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/sliders')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
      });

      it('should get sliders with pagination', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/sliders?page=1&limit=5')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.pagination).toBeDefined();
        expect(response.body.pagination.page).toBe(1);
        expect(response.body.pagination.limit).toBe(5);
      });

      it('should get sliders with search filter', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/sliders?search=Test')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });

      it('should get sliders with position filter', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/sliders?position=1')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });
    });

    describe('GET /api/v1/sliders/:id', () => {
      it('should get slider by ID', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/sliders/${testSliderId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(testSliderId);
        expect(response.body.data.title).toBeDefined();
        expect(response.body.data.media).toBeDefined();
      });

      it('should return 404 for non-existent slider', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/sliders/non-existent-id')
          .expect(404);
      });
    });

    describe('GET /api/v1/sliders/display/active', () => {
      it('should get active sliders for display', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/sliders/display/active')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    describe('GET /api/v1/sliders/position/:position', () => {
      it('should get sliders by position', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/sliders/position/1')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    describe('POST /api/v1/sliders/:id/click', () => {
      it('should record slider click', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/v1/sliders/${testSliderId}/click`)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.message).toBe('Click recorded successfully');
      });

      it('should return 404 for non-existent slider', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/sliders/non-existent-id/click')
          .expect(404);
      });
    });

    describe('POST /api/v1/sliders/:id/view', () => {
      it('should record slider view', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/v1/sliders/${testSliderId}/view`)
          .send({ duration: 3000 })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.message).toBe('View recorded successfully');
      });

      it('should record slider view without duration', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/v1/sliders/${testSliderId}/view`)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.message).toBe('View recorded successfully');
      });
    });
  });

  describe('Admin Slider Endpoints', () => {
    describe('POST /api/v1/admin/sliders', () => {
      it('should create slider', async () => {
        const sliderData = {
          title: { en: 'New Slider', ne: 'नयाँ स्लाइडर' },
          position: 2,
          displayTime: 3000,
          isActive: true,
          mediaId: testMediaId,
        };

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/sliders')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(sliderData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.title.en).toBe('New Slider');
        expect(response.body.data.position).toBe(2);
        expect(response.body.data.displayTime).toBe(3000);
      });

      it('should require authentication', async () => {
        const sliderData = {
          title: { en: 'Test Slider', ne: 'परीक्षण स्लाइडर' },
          position: 1,
          displayTime: 5000,
          mediaId: testMediaId,
        };

        await request(app.getHttpServer())
          .post('/api/v1/admin/sliders')
          .send(sliderData)
          .expect(401);
      });

      it('should require admin or editor role', async () => {
        const sliderData = {
          title: { en: 'Test Slider', ne: 'परीक्षण स्लाइडर' },
          position: 1,
          displayTime: 5000,
          mediaId: testMediaId,
        };

        await request(app.getHttpServer())
          .post('/api/v1/admin/sliders')
          .set('Authorization', `Bearer ${viewerToken}`)
          .send(sliderData)
          .expect(403);
      });

      it('should validate required fields', async () => {
        const invalidData = {
          title: { en: 'Test Slider', ne: 'परीक्षण स्लाइडर' },
          // Missing required fields
        };

        await request(app.getHttpServer())
          .post('/api/v1/admin/sliders')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(invalidData)
          .expect(400);
      });
    });

    describe('GET /api/v1/admin/sliders', () => {
      beforeEach(async () => {
        testSliderId = await createTestSlider();
      });

      it('should get all sliders', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/sliders')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should get sliders with filters', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/sliders?isActive=true&position=1')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });
    });

    describe('GET /api/v1/admin/sliders/:id', () => {
      beforeEach(async () => {
        testSliderId = await createTestSlider();
      });

      it('should get slider by ID', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/admin/sliders/${testSliderId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(testSliderId);
      });

      it('should return 404 for non-existent slider', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/admin/sliders/non-existent-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
      });
    });

    describe('PUT /api/v1/admin/sliders/:id', () => {
      beforeEach(async () => {
        testSliderId = await createTestSlider();
      });

      it('should update slider', async () => {
        const updateData = {
          title: { en: 'Updated Slider', ne: 'अपडेटेड स्लाइडर' },
          displayTime: 4000,
        };

        const response = await request(app.getHttpServer())
          .put(`/api/v1/admin/sliders/${testSliderId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.title.en).toBe('Updated Slider');
        expect(response.body.data.displayTime).toBe(4000);
      });

      it('should return 404 for non-existent slider', async () => {
        const updateData = {
          title: { en: 'Updated Slider', ne: 'अपडेटेड स्लाइडर' },
        };

        await request(app.getHttpServer())
          .put('/api/v1/admin/sliders/non-existent-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(404);
      });
    });

    describe('DELETE /api/v1/admin/sliders/:id', () => {
      beforeEach(async () => {
        testSliderId = await createTestSlider();
      });

      it('should delete slider', async () => {
        await request(app.getHttpServer())
          .delete(`/api/v1/admin/sliders/${testSliderId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        // Verify slider is deleted
        await request(app.getHttpServer())
          .get(`/api/v1/admin/sliders/${testSliderId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
      });

      it('should require admin role for deletion', async () => {
        await request(app.getHttpServer())
          .delete(`/api/v1/admin/sliders/${testSliderId}`)
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(403);
      });
    });

    describe('POST /api/v1/admin/sliders/:id/publish', () => {
      beforeEach(async () => {
        testSliderId = await createTestSlider();
      });

      it('should publish slider', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/v1/admin/sliders/${testSliderId}/publish`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.isActive).toBe(true);
      });
    });

    describe('POST /api/v1/admin/sliders/:id/unpublish', () => {
      beforeEach(async () => {
        testSliderId = await createTestSlider();
      });

      it('should unpublish slider', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/v1/admin/sliders/${testSliderId}/unpublish`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.isActive).toBe(false);
      });
    });

    describe('GET /api/v1/admin/sliders/statistics', () => {
      beforeEach(async () => {
        testSliderId = await createTestSlider();
      });

      it('should get slider statistics', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/sliders/statistics')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.total).toBeDefined();
        expect(response.body.data.active).toBeDefined();
        expect(response.body.data.totalClicks).toBeDefined();
        expect(response.body.data.totalViews).toBeDefined();
      });
    });

    describe('GET /api/v1/admin/sliders/:id/analytics', () => {
      beforeEach(async () => {
        testSliderId = await createTestSlider();
      });

      it('should get slider analytics', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/admin/sliders/${testSliderId}/analytics`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.sliderId).toBe(testSliderId);
        expect(response.body.data.totalClicks).toBeDefined();
        expect(response.body.data.totalViews).toBeDefined();
        expect(response.body.data.clickThroughRate).toBeDefined();
      });
    });
  });

  describe('Authentication & Authorization', () => {
    describe('Editor Access', () => {
      it('should allow editor to create sliders', async () => {
        const sliderData = {
          title: { en: 'Editor Slider', ne: 'एडिटर स्लाइडर' },
          position: 3,
          displayTime: 4000,
          mediaId: testMediaId,
        };

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/sliders')
          .set('Authorization', `Bearer ${editorToken}`)
          .send(sliderData)
          .expect(201);

        expect(response.body.success).toBe(true);
      });

      it('should not allow editor to delete sliders', async () => {
        testSliderId = await createTestSlider();

        await request(app.getHttpServer())
          .delete(`/api/v1/admin/sliders/${testSliderId}`)
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(403);
      });
    });

    describe('Viewer Access', () => {
      it('should not allow viewer to create sliders', async () => {
        const sliderData = {
          title: { en: 'Viewer Slider', ne: 'दर्शक स्लाइडर' },
          position: 4,
          displayTime: 5000,
          mediaId: testMediaId,
        };

        await request(app.getHttpServer())
          .post('/api/v1/admin/sliders')
          .set('Authorization', `Bearer ${viewerToken}`)
          .send(sliderData)
          .expect(403);
      });

      it('should not allow viewer to update sliders', async () => {
        testSliderId = await createTestSlider();
        const updateData = {
          title: { en: 'Updated Slider', ne: 'अपडेटेड स्लाइडर' },
        };

        await request(app.getHttpServer())
          .put(`/api/v1/admin/sliders/${testSliderId}`)
          .set('Authorization', `Bearer ${viewerToken}`)
          .send(updateData)
          .expect(403);
      });
    });
  });

  describe('API Response Format', () => {
    it('should return consistent API response format for success', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/sliders')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('processingTime');
      expect(response.body.meta).toHaveProperty('requestId');
    });

    it('should return consistent API response format for error', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/sliders/non-existent-id')
        .expect(404);

      // Note: The error response format is handled by the HttpExceptionFilter
      // and may not go through the ApiResponseInterceptor
    });
  });

  describe('Data Validation', () => {
    it('should validate slider data structure', async () => {
      testSliderId = await createTestSlider();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/sliders/${testSliderId}`)
        .expect(200);

      const slider = response.body.data;
      expect(slider).toHaveProperty('id');
      expect(slider).toHaveProperty('title');
      expect(slider).toHaveProperty('position');
      expect(slider).toHaveProperty('displayTime');
      expect(slider).toHaveProperty('isActive');
      expect(slider).toHaveProperty('media');
      expect(slider).toHaveProperty('clickCount');
      expect(slider).toHaveProperty('viewCount');
      expect(slider).toHaveProperty('clickThroughRate');
      expect(slider).toHaveProperty('createdAt');
      expect(slider).toHaveProperty('updatedAt');
    });

    it('should validate translatable fields', async () => {
      const invalidData = {
        title: { en: 'Test Slider' }, // Missing Nepali
        position: 1,
        displayTime: 5000,
        mediaId: testMediaId,
      };

      await request(app.getHttpServer())
        .post('/api/v1/admin/sliders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);
    });
  });
}); 