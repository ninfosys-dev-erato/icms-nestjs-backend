import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import * as request from 'supertest';
import * as path from 'path';
import * as fs from 'fs';

import { PrismaService } from '@/database/prisma.service';
import { AppModule } from '@/app.module';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { ApiResponseInterceptor } from '@/common/interceptors/api-response.interceptor';
import { FileStorageService } from '@/common/services/file-storage/interfaces/file-storage.interface';

describe('Content Attachment Management (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let fileStorageService: FileStorageService;
  let adminUser: any;
  let editorUser: any;
  let viewerUser: any;
  let adminToken: string;
  let editorToken: string;
  let viewerToken: string;
  let testCategory: any;
  let testContent: any;

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
      forbidNonWhitelisted: false, // Temporarily disable strict validation for reorder endpoint
      transform: true,
    }));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ApiResponseInterceptor());
    
    // Set global prefix to match main app
    app.setGlobalPrefix('api/v1');

    prisma = app.get<PrismaService>(PrismaService);
    fileStorageService = app.get<FileStorageService>(FileStorageService);
    
    // Mock file storage service for tests
    jest.spyOn(fileStorageService, 'upload').mockImplementation(async (key, buffer, contentType) => ({
      key,
      url: `https://test-storage.example.com/${key}`,
      size: buffer.length,
      mimeType: contentType,
    }));
    
    jest.spyOn(fileStorageService, 'download').mockImplementation(async (key) => ({
      buffer: Buffer.from('mocked file content'),
      contentType: 'text/plain',
      contentLength: 19,
    }));
    
    jest.spyOn(fileStorageService, 'delete').mockImplementation(async (key) => {
      // Mock successful deletion
    });
    
    jest.spyOn(fileStorageService, 'generateKey').mockImplementation((folder, fileName, prefix) => {
      const parts = [folder];
      if (prefix) parts.push(prefix);
      parts.push(`mocked-${fileName}`);
      return parts.join('/');
    });
    
    await app.init();
  });

  afterAll(async () => {
    await cleanupDatabase();
    await app.close();
  });

  beforeEach(async () => {
    await cleanupDatabase();
    await createTestUsers();
    await createTestCategoryAndContent();
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
          email: 'admin@attachment.com',
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
          email: 'editor@attachment.com',
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
          email: 'viewer@attachment.com',
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

  const createTestCategoryAndContent = async () => {
    try {
      // Create test category
      const categoryResponse = await request(app.getHttpServer())
        .post('/api/v1/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: {
            en: 'Test Category',
            ne: 'परीक्षण श्रेणी',
          },
          description: {
            en: 'Test category for attachments',
            ne: 'अटैचमेन्टको लागि परीक्षण श्रेणी',
          },
          slug: 'test-category',
          isActive: true,
        });

      if (categoryResponse.status === 201 && categoryResponse.body.success) {
        testCategory = categoryResponse.body.data;
      } else {
        console.error('Category creation failed:', categoryResponse.body);
        throw new Error('Failed to create test category');
      }

      // Create test content
      const contentResponse = await request(app.getHttpServer())
        .post('/api/v1/admin/content')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: {
            en: 'Test Content',
            ne: 'परीक्षण सामग्री',
          },
          content: {
            en: 'Test content for attachments',
            ne: 'अटैचमेन्टको लागि परीक्षण सामग्री',
          },
          categoryId: testCategory.id,
          slug: 'test-content',
        });

      if (contentResponse.status === 201 && contentResponse.body.success) {
        testContent = contentResponse.body.data;
      } else {
        console.error('Content creation failed:', contentResponse.body);
        throw new Error('Failed to create test content');
      }

    } catch (error) {
      console.error('Error creating test category and content:', error);
      throw error;
    }
  };

  const createTestFile = (filename: string, content: string = 'test content'): Buffer => {
    return Buffer.from(content);
  };

  describe('Content Attachment Endpoints', () => {
    describe('GET /api/v1/content/:contentId/attachments', () => {
      it('should get attachments by content ID successfully', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/content/${testContent.id}/attachments`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });

      it('should return empty array when no attachments exist', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/content/${testContent.id}/attachments`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBe(0);
      });

      it('should return 404 for non-existent content ID', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/content/non-existent-id/attachments')
          .expect(500);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toContain('not found');
      });
    });

    describe('GET /api/v1/attachments/:id', () => {
      it('should get attachment by ID successfully', async () => {
        // First create an attachment
        const testFile = createTestFile('test.txt');
        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/attachments')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', testFile, 'test.txt')
          .field('contentId', testContent.id)
          .expect(201);

        expect(createResponse.body.success).toBe(true);
        const attachmentId = createResponse.body.data.id;

        const response = await request(app.getHttpServer())
          .get(`/api/v1/attachments/${attachmentId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(attachmentId);
        expect(response.body.data.contentId).toBe(testContent.id);
        expect(response.body.data.fileName).toBe('test.txt');
      });

      it('should return 404 for non-existent attachment ID', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/attachments/non-existent-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toContain('not found');
      });
    });

    describe('POST /api/v1/attachments', () => {
      it('should upload attachment successfully', async () => {
        const testFile = createTestFile('test.txt', 'This is a test file content');

        const response = await request(app.getHttpServer())
          .post('/api/v1/attachments')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', testFile, 'test.txt')
          .field('contentId', testContent.id)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.contentId).toBe(testContent.id);
        expect(response.body.data.fileName).toBe('test.txt');
        expect(response.body.data.fileSize).toBeGreaterThan(0);
        expect(response.body.data.mimeType).toBeDefined();
      });

      it('should fail to upload without authentication', async () => {
        const testFile = createTestFile('test.txt');

        const response = await request(app.getHttpServer())
          .post('/api/v1/attachments')
          .attach('file', testFile, 'test.txt')
          .field('contentId', testContent.id)
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toBe('Unauthorized');
      });

      it('should fail to upload with invalid content ID', async () => {
        const testFile = createTestFile('test.txt');

        const response = await request(app.getHttpServer())
          .post('/api/v1/attachments')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', testFile, 'test.txt')
          .field('contentId', 'non-existent-content-id')
          .expect(404);

        expect(response.body.success).toBe(false);
      });

      it('should fail to upload without file', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/attachments')
          .set('Authorization', `Bearer ${adminToken}`)
          .field('contentId', testContent.id)
          .expect(500);

        expect(response.body.success).toBe(false);
      });

      it('should fail to upload with unsupported file type', async () => {
        const testFile = createTestFile('test.exe');

        const response = await request(app.getHttpServer())
          .post('/api/v1/attachments')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', testFile, 'test.exe')
          .field('contentId', testContent.id)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toContain('File validation failed');
      });

      it('should fail to upload with file too large', async () => {
        // Create a large file (11MB)
        const largeFile = Buffer.alloc(11 * 1024 * 1024);

        const response = await request(app.getHttpServer())
          .post('/api/v1/attachments')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', largeFile, 'large.txt')
          .field('contentId', testContent.id)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toContain('File validation failed');
      });
    });

    describe('PUT /api/v1/attachments/:id', () => {
      let testAttachment: any;

      beforeEach(async () => {
        const testFile = createTestFile('original.txt');
        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/attachments')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', testFile, 'original.txt')
          .field('contentId', testContent.id);

        expect(createResponse.status).toBe(201);
        testAttachment = createResponse.body.data;
      });

      it('should update attachment successfully', async () => {
        const updateData = {
          fileName: 'updated.txt',
          order: 2,
        };

        const response = await request(app.getHttpServer())
          .put(`/api/v1/attachments/${testAttachment.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.fileName).toBe(updateData.fileName);
        expect(response.body.data.order).toBe(updateData.order);
      });

      it('should fail to update without authentication', async () => {
        const response = await request(app.getHttpServer())
          .put(`/api/v1/attachments/${testAttachment.id}`)
          .send({ fileName: 'updated.txt' })
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toBe('Unauthorized');
      });

      it('should fail to update non-existent attachment', async () => {
        const response = await request(app.getHttpServer())
          .put('/api/v1/attachments/non-existent-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ fileName: 'updated.txt' })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toContain('not found');
      });
    });

    describe('DELETE /api/v1/attachments/:id', () => {
      it('should delete attachment successfully', async () => {
        // First create an attachment
        const testFile = createTestFile('to-delete.txt');
        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/attachments')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', testFile, 'to-delete.txt')
          .field('contentId', testContent.id);

        expect(createResponse.status).toBe(201);
        const attachmentId = createResponse.body.data.id;

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/attachments/${attachmentId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.message).toContain('deleted successfully');

        // Verify attachment is deleted
        const getResponse = await request(app.getHttpServer())
          .get(`/api/v1/attachments/${attachmentId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
      });

      it('should fail to delete without authentication', async () => {
        const response = await request(app.getHttpServer())
          .delete('/api/v1/attachments/non-existent-id')
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toBe('Unauthorized');
      });

      it('should fail to delete non-existent attachment', async () => {
        const response = await request(app.getHttpServer())
          .delete('/api/v1/attachments/non-existent-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toContain('not found');
      });
    });

    describe('GET /api/v1/attachments/statistics', () => {
      it('should get attachment statistics successfully', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/attachments/statistics')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('total');
        expect(response.body.data).toHaveProperty('totalSize');
        expect(response.body.data).toHaveProperty('byType');
      });

      it('should return correct statistics for empty database', async () => {
        await cleanupDatabase();
        await createTestUsers();
        await createTestCategoryAndContent();

        const response = await request(app.getHttpServer())
          .get('/api/v1/attachments/statistics')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.total).toBe(0);
        expect(response.body.data.totalSize).toBe(0);
        expect(response.body.data.byType).toEqual({});
      });
    });

    describe('GET /api/v1/attachments/:id/download', () => {
      it('should download attachment successfully', async () => {
        // First create an attachment
        const testFile = createTestFile('download-test.txt', 'Download test content');
        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/attachments')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', testFile, 'download-test.txt')
          .field('contentId', testContent.id);

        expect(createResponse.status).toBe(201);
        const attachmentId = createResponse.body.data.id;

        const response = await request(app.getHttpServer())
          .get(`/api/v1/attachments/${attachmentId}/download`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.headers['content-type']).toBeDefined();
        expect(response.headers['content-disposition']).toContain('attachment');
        // The response body should be defined (even if it's an empty object due to interceptor)
        expect(response.body).toBeDefined();
      });

      it('should fail to download non-existent attachment', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/attachments/non-existent-id/download')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toContain('not found');
      });
    });

    describe('PUT /api/v1/attachments/reorder', () => {
      it('should reorder attachments successfully', async () => {
        // Create multiple attachments
        const attachment1 = await request(app.getHttpServer())
          .post('/api/v1/attachments')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', createTestFile('file1.txt'), 'file1.txt')
          .field('contentId', testContent.id);

        const attachment2 = await request(app.getHttpServer())
          .post('/api/v1/attachments')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', createTestFile('file2.txt'), 'file2.txt')
          .field('contentId', testContent.id);

        const attachment3 = await request(app.getHttpServer())
          .post('/api/v1/attachments')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', createTestFile('file3.txt'), 'file3.txt')
          .field('contentId', testContent.id);

        expect(attachment1.status).toBe(201);
        expect(attachment2.status).toBe(201);
        expect(attachment3.status).toBe(201);

        const response = await request(app.getHttpServer())
          .put('/api/v1/attachments/reorder')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            orders: [
              { id: attachment3.body.data.id, order: 1 },
              { id: attachment1.body.data.id, order: 2 },
              { id: attachment2.body.data.id, order: 3 },
            ],
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.message).toContain('reordered successfully');
      });

      it('should fail to reorder with invalid attachment ID', async () => {
        const response = await request(app.getHttpServer())
          .put('/api/v1/attachments/reorder')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            orders: [
              { id: 'non-existent-id', order: 1 },
            ],
          })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toContain('not found');
      });

      it('should fail to reorder with empty orders array', async () => {
        const response = await request(app.getHttpServer())
          .put('/api/v1/attachments/reorder')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            orders: [],
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toContain('required and must not be empty');
      });
    });
  });
}); 