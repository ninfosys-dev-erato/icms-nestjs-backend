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

describe('Content Management Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminUser: any;
  let editorUser: any;
  let viewerUser: any;
  let adminToken: string;
  let editorToken: string;
  let viewerToken: string;

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
    await createTestUsers();
  });

  const cleanupDatabase = async () => {
    try {
      const tables = [
        'content_attachments',
        'contents',
        'categories',
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
      // Create admin user
      const adminResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'admin@integration.com',
          password: 'AdminPass123!',
          confirmPassword: 'AdminPass123!',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
        });

      if (adminResponse.status === 201 && adminResponse.body.success) {
        adminUser = adminResponse.body.data.user;
        adminToken = adminResponse.body.data.accessToken;
      } else {
        console.error('Admin user creation failed:', adminResponse.body);
        throw new Error('Failed to create admin user');
      }

      // Create editor user
      const editorResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'editor@integration.com',
          password: 'EditorPass123!',
          confirmPassword: 'EditorPass123!',
          firstName: 'Editor',
          lastName: 'User',
          role: 'EDITOR',
        });

      if (editorResponse.status === 201 && editorResponse.body.success) {
        editorUser = editorResponse.body.data.user;
        editorToken = editorResponse.body.data.accessToken;
      } else {
        console.error('Editor user creation failed:', editorResponse.body);
        throw new Error('Failed to create editor user');
      }

      // Create viewer user
      const viewerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'viewer@integration.com',
          password: 'ViewerPass123!',
          confirmPassword: 'ViewerPass123!',
          firstName: 'Viewer',
          lastName: 'User',
          role: 'VIEWER',
        });

      if (viewerResponse.status === 201 && viewerResponse.body.success) {
        viewerUser = viewerResponse.body.data.user;
        viewerToken = viewerResponse.body.data.accessToken;
      } else {
        console.error('Viewer user creation failed:', viewerResponse.body);
        throw new Error('Failed to create viewer user');
      }

      // Verify tokens are generated
      if (!adminToken || !editorToken || !viewerToken) {
        throw new Error('Failed to generate authentication tokens');
      }

    } catch (error) {
      console.error('Error creating test users:', error);
      throw error;
    }
  };

  describe('Complete Content Management Workflow', () => {
    it('should handle complete content management workflow', async () => {
      // Step 1: Create a category
      const categoryData = {
        name: {
          en: 'Integration Test Category',
          ne: 'एकीकरण परीक्षण श्रेणी',
        },
        description: {
          en: 'Category for integration testing',
          ne: 'एकीकरण परीक्षणको लागि श्रेणी',
        },
        slug: 'integration-test-category',
        isActive: true,
      };

      const categoryResponse = await request(app.getHttpServer())
        .post('/api/v1/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData)
        .expect(201);

      expect(categoryResponse.body.success).toBe(true);
      const category = categoryResponse.body.data;
      expect(category.name.en).toBe(categoryData.name.en);
      expect(category.name.ne).toBe(categoryData.name.ne);
      expect(category.slug).toBe(categoryData.slug);

      // Step 2: Create content
      const contentData = {
        title: {
          en: 'Integration Test Content',
          ne: 'एकीकरण परीक्षण सामग्री',
        },
        content: {
          en: 'This is integration test content',
          ne: 'यो एकीकरण परीक्षण सामग्री हो',
        },
        excerpt: {
          en: 'Integration test excerpt',
          ne: 'एकीकरण परीक्षण सारांश',
        },
        categoryId: category.id,
        status: 'DRAFT',
        slug: 'integration-test-content',
        featured: false,
      };

      const contentResponse = await request(app.getHttpServer())
        .post('/api/v1/admin/content')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(contentData)
        .expect(201);

      expect(contentResponse.body.success).toBe(true);
      const content = contentResponse.body.data;
      expect(content.title.en).toBe(contentData.title.en);
      expect(content.title.ne).toBe(contentData.title.ne);
      expect(content.categoryId).toBe(category.id);
      expect(content.status).toBe('DRAFT');

      // Step 3: Upload attachment
      const testFile = Buffer.from('Integration test file content');
      const attachmentResponse = await request(app.getHttpServer())
        .post('/api/v1/attachments')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', testFile, 'integration-test.txt')
        .field('contentId', content.id)
        .expect(201);

      expect(attachmentResponse.body.success).toBe(true);
      const attachment = attachmentResponse.body.data;
      expect(attachment.contentId).toBe(content.id);
      expect(attachment.fileName).toBe('integration-test.txt');

      // Step 4: Publish content
      const publishResponse = await request(app.getHttpServer())
        .post(`/api/v1/admin/content/${content.id}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(publishResponse.body.success).toBe(true);
      expect(publishResponse.body.data.status).toBe('PUBLISHED');
      expect(publishResponse.body.data.publishedAt).toBeDefined();

      // Step 5: Verify public access
      const publicContentResponse = await request(app.getHttpServer())
        .get(`/api/v1/content/${content.slug}`)
        .expect(200);

      expect(publicContentResponse.body.success).toBe(true);
      expect(publicContentResponse.body.data.slug).toBe(content.slug);
      expect(publicContentResponse.body.data.status).toBe('PUBLISHED');

      // Step 6: Verify category content
      const categoryContentResponse = await request(app.getHttpServer())
        .get(`/api/v1/content/category/${category.slug}`)
        .expect(200);

      expect(categoryContentResponse.body.success).toBe(true);
      expect(categoryContentResponse.body.data).toBeInstanceOf(Array);
      expect(categoryContentResponse.body.data.length).toBeGreaterThan(0);
      expect(categoryContentResponse.body.data[0].categoryId).toBe(category.id);

      // Step 7: Verify attachments
      const attachmentsResponse = await request(app.getHttpServer())
        .get(`/api/v1/content/${content.id}/attachments`)
        .expect(200);

      expect(attachmentsResponse.body.success).toBe(true);
      expect(attachmentsResponse.body.data).toBeInstanceOf(Array);
      expect(attachmentsResponse.body.data.length).toBeGreaterThan(0);
      expect(attachmentsResponse.body.data[0].contentId).toBe(content.id);

      // Step 8: Update content
      const updateData = {
        title: {
          en: 'Updated Integration Test Content',
          ne: 'अपडेट एकीकरण परीक्षण सामग्री',
        },
        featured: true,
      };

      const updateResponse = await request(app.getHttpServer())
        .put(`/api/v1/admin/content/${content.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.title.en).toBe(updateData.title.en);
      expect(updateResponse.body.data.featured).toBe(updateData.featured);

      // Step 9: Verify featured content
      const featuredResponse = await request(app.getHttpServer())
        .get('/api/v1/content/featured')
        .expect(200);

      expect(featuredResponse.body.success).toBe(true);
      expect(featuredResponse.body.data).toBeInstanceOf(Array);
      expect(featuredResponse.body.data.length).toBeGreaterThan(0);
      expect(featuredResponse.body.data[0].featured).toBe(true);

      // Step 10: Search content
      const searchResponse = await request(app.getHttpServer())
        .get('/api/v1/content/search?search=Integration')
        .expect(200);

      expect(searchResponse.body.success).toBe(true);
      expect(searchResponse.body.data).toBeInstanceOf(Array);
      expect(searchResponse.body.data.length).toBeGreaterThan(0);
      expect(searchResponse.body.data[0].title.en).toContain('Integration');

      // Step 11: Get statistics
      const contentStatsResponse = await request(app.getHttpServer())
        .get('/api/v1/admin/content/statistics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(contentStatsResponse.body.success).toBe(true);
      expect(contentStatsResponse.body.data).toHaveProperty('total');
      expect(contentStatsResponse.body.data).toHaveProperty('published');

      const categoryStatsResponse = await request(app.getHttpServer())
        .get('/api/v1/admin/categories/statistics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(categoryStatsResponse.body.success).toBe(true);
      expect(categoryStatsResponse.body.data).toHaveProperty('total');
      expect(categoryStatsResponse.body.data).toHaveProperty('active');

      const attachmentStatsResponse = await request(app.getHttpServer())
        .get('/api/v1/attachments/statistics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(attachmentStatsResponse.body.success).toBe(true);
      expect(attachmentStatsResponse.body.data).toHaveProperty('total');
      expect(attachmentStatsResponse.body.data).toHaveProperty('totalSize');

      // Step 12: Clean up (delete in reverse order)
      await request(app.getHttpServer())
        .delete(`/api/v1/attachments/${attachment.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/api/v1/admin/content/${content.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/api/v1/admin/categories/${category.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Role-based Access Control', () => {
    let testCategory: any;
    let testContent: any;

    beforeEach(async () => {
      // Create test category
      const categoryResponse = await request(app.getHttpServer())
        .post('/api/v1/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: { en: 'Test Category', ne: 'परीक्षण श्रेणी' },
          slug: 'test-category',
        });

      expect(categoryResponse.status).toBe(201);
      testCategory = categoryResponse.body.data;

      // Create test content
      const contentResponse = await request(app.getHttpServer())
        .post('/api/v1/admin/content')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: { en: 'Test Content', ne: 'परीक्षण सामग्री' },
          content: { en: 'Test content', ne: 'परीक्षण सामग्री' },
          categoryId: testCategory.id,
          slug: 'test-content',
        });

      expect(contentResponse.status).toBe(201);
      testContent = contentResponse.body.data;
    });

    it('should allow admin to access all endpoints', async () => {
      // Admin should be able to access all admin endpoints
      const adminEndpoints = [
        { method: 'GET', path: '/api/v1/admin/categories' },
        { method: 'POST', path: '/api/v1/admin/categories' },
        { method: 'GET', path: '/api/v1/admin/content' },
        { method: 'POST', path: '/api/v1/admin/content' },
        { method: 'GET', path: '/api/v1/admin/categories/statistics' },
        { method: 'GET', path: '/api/v1/admin/content/statistics' },
      ];

      for (const endpoint of adminEndpoints) {
        const response = await request(app.getHttpServer())
          [endpoint.method.toLowerCase()](endpoint.path)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).not.toBe(401);
        expect(response.status).not.toBe(403);
      }
    });

    it('should allow editor to access content management endpoints', async () => {
      // Editor should be able to access content management endpoints
      const editorEndpoints = [
        { method: 'GET', path: '/api/v1/admin/content' },
        { method: 'POST', path: '/api/v1/admin/content' },
        { method: 'PUT', path: `/admin/content/${testContent.id}` },
        { method: 'POST', path: `/admin/content/${testContent.id}/publish` },
      ];

      for (const endpoint of editorEndpoints) {
        const response = await request(app.getHttpServer())
          [endpoint.method.toLowerCase()](endpoint.path)
          .set('Authorization', `Bearer ${editorToken}`);

        expect(response.status).not.toBe(401);
        expect(response.status).not.toBe(403);
      }
    });

    it('should restrict viewer access to admin endpoints', async () => {
      // Viewer should not be able to access admin endpoints
      const adminEndpoints = [
        { method: 'GET', path: '/api/v1/admin/categories' },
        { method: 'POST', path: '/api/v1/admin/categories' },
        { method: 'GET', path: '/api/v1/admin/content' },
        { method: 'POST', path: '/api/v1/admin/content' },
      ];

      for (const endpoint of adminEndpoints) {
        const response = await request(app.getHttpServer())
          [endpoint.method.toLowerCase()](endpoint.path)
          .set('Authorization', `Bearer ${viewerToken}`);

        expect(response.status).toBe(403);
      }
    });

    it('should allow all users to access public endpoints', async () => {
      // All users should be able to access public endpoints
      const publicEndpoints = [
        { method: 'GET', path: '/api/v1/categories' },
        { method: 'GET', path: '/api/v1/content' },
        { method: 'GET', path: '/api/v1/content/featured' },
        { method: 'GET', path: '/api/v1/content/search?search=test' },
      ];

      for (const endpoint of publicEndpoints) {
        const response = await request(app.getHttpServer())
          [endpoint.method.toLowerCase()](endpoint.path);

        expect(response.status).toBe(200);
      }
    });
  });

  describe('Error Handling and Validation', () => {
    it('should handle invalid data gracefully', async () => {
      // Test invalid category creation
      const invalidCategoryResponse = await request(app.getHttpServer())
        .post('/api/v1/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: { en: '' }, // Invalid: empty name
        })
        .expect(400);

      expect(invalidCategoryResponse.body.success).toBe(false);

      // Test invalid content creation
      const invalidContentResponse = await request(app.getHttpServer())
        .post('/api/v1/admin/content')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: { en: 'Test', ne: 'परीक्षण' }, // Missing required fields like content and categoryId
        })
        .expect(400);

      expect(invalidContentResponse.body.success).toBe(false);
    });

    it('should handle authentication errors properly', async () => {
      // Test without authentication
      const noAuthResponse = await request(app.getHttpServer())
        .get('/api/v1/admin/categories')
        .expect(401);

      expect(noAuthResponse.body.success).toBe(false);
      expect(noAuthResponse.body.error.message).toBe('Unauthorized');

      // Test with invalid token
      const invalidTokenResponse = await request(app.getHttpServer())
        .get('/api/v1/admin/categories')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(invalidTokenResponse.body.success).toBe(false);
    });

    it('should handle not found errors properly', async () => {
      // Test non-existent resources
      const nonExistentCategory = await request(app.getHttpServer())
        .get('/api/v1/admin/categories/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(nonExistentCategory.body.success).toBe(false);
      expect(nonExistentCategory.body.error.message).toContain('not found');

      const nonExistentContent = await request(app.getHttpServer())
        .get('/api/v1/admin/content/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(nonExistentContent.body.success).toBe(false);
      expect(nonExistentContent.body.error.message).toContain('not found');
    });
  });

  describe('Data Integrity and Relationships', () => {
    it('should maintain referential integrity', async () => {
      // Create category and content
      const categoryResponse = await request(app.getHttpServer())
        .post('/api/v1/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: { en: 'Integrity Test', ne: 'अखण्डता परीक्षण' },
          slug: 'integrity-test',
        });

      expect(categoryResponse.status).toBe(201);
      const category = categoryResponse.body.data;

      const contentResponse = await request(app.getHttpServer())
        .post('/api/v1/admin/content')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: { en: 'Integrity Content', ne: 'अखण्डता सामग्री' },
          content: { en: 'Test content', ne: 'परीक्षण सामग्री' },
          categoryId: category.id,
          slug: 'integrity-content',
        });

      expect(contentResponse.status).toBe(201);
      const content = contentResponse.body.data;

      // Verify content is associated with category
      expect(content.categoryId).toBe(category.id);

      // Try to delete category with content (should fail)
      const deleteCategoryResponse = await request(app.getHttpServer())
        .delete(`/api/v1/admin/categories/${category.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(deleteCategoryResponse.body.success).toBe(false);

      // Delete content first, then category
      await request(app.getHttpServer())
        .delete(`/api/v1/admin/content/${content.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/api/v1/admin/categories/${category.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should handle unique constraints properly', async () => {
      // Create category with specific slug
      const categoryData = {
        name: { en: 'Unique Test', ne: 'अद्वितीय परीक्षण' },
        slug: 'unique-test-slug',
      };

      await request(app.getHttpServer())
        .post('/api/v1/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData)
        .expect(201);

      // Try to create another category with same slug
      const duplicateResponse = await request(app.getHttpServer())
        .post('/api/v1/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData)
        .expect(409);

      expect(duplicateResponse.body.success).toBe(false);
      expect(duplicateResponse.body.error.message).toContain('already exists');
    });
  });
}); 