import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import * as request from 'supertest';
import * as path from 'path';
import * as fs from 'fs';

import { PrismaService } from '@/database/prisma.service';
import { AppModule } from '@/app.module';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { ApiResponseInterceptor } from '@/common/interceptors/api-response.interceptor';

describe('Documents (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminUser: any;
  let editorUser: any;
  let viewerUser: any;
  let adminToken: string;
  let editorToken: string;
  let viewerToken: string;
  let testDocument: any;

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
    await createTestDocument();
  });

  const cleanupDatabase = async () => {
    try {
      const tables = [
        'document_downloads',
        'document_versions',
        'documents',
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
          email: 'admin@documents.com',
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
          email: 'editor@documents.com',
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
          email: 'viewer@documents.com',
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
    } catch (error) {
      console.error('Error creating test users:', error);
      throw error;
    }
  };

  const createTestDocument = async () => {
    try {
      const testFilePath = path.join(__dirname, 'test-document.pdf');
      const testFileContent = 'Test PDF content';
      
      // Create a test file
      fs.writeFileSync(testFilePath, testFileContent);

      const documentResponse = await request(app.getHttpServer())
        .post('/api/v1/admin/documents/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', testFilePath)
        .field('title[en]', 'Test Document')
        .field('title[ne]', 'परीक्षण कागजात')
        .field('description[en]', 'Test document description')
        .field('description[ne]', 'परीक्षण कागजात विवरण')
        .field('category', 'OFFICIAL')
        .field('status', 'PUBLISHED')
        .field('documentNumber', 'DOC-2024-001')
        .field('version', '1.0')
        .field('isPublic', true)
        .field('requiresAuth', false)
        .field('order', 1)
        .field('isActive', true);

      if (documentResponse.status === 201 && documentResponse.body.success) {
        testDocument = documentResponse.body.data;
      } else {
        console.error('Document creation failed:', documentResponse.body);
        throw new Error('Failed to create test document');
      }

      // Clean up test file
      fs.unlinkSync(testFilePath);
    } catch (error) {
      console.error('Error creating test document:', error);
      throw error;
    }
  };

  const createTestFile = (filename: string, content: string = 'test content'): Buffer => {
    return Buffer.from(content);
  };

  describe('Public Document Endpoints', () => {
    beforeEach(async () => {
      // Create published document for testing
      const testFilePath = path.join(__dirname, 'public-test-document.pdf');
      const testFileContent = 'Public Test PDF content';
      
      fs.writeFileSync(testFilePath, testFileContent);

      await request(app.getHttpServer())
        .post('/api/v1/admin/documents/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', testFilePath)
        .field('title[en]', 'Public Test Document')
        .field('title[ne]', 'सार्वजनिक परीक्षण कागजात')
        .field('category', 'OFFICIAL')
        .field('status', 'PUBLISHED')
        .field('isPublic', true)
        .field('isActive', true);

      fs.unlinkSync(testFilePath);
    });

    describe('GET /api/v1/documents', () => {
      it('should get all public documents successfully', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/documents')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBeGreaterThan(0);
        expect(response.body.data[0]).toHaveProperty('id');
        expect(response.body.data[0]).toHaveProperty('title');
        expect(response.body.data[0]).toHaveProperty('fileName');
        expect(response.body.data[0]).toHaveProperty('status');
        expect(response.body.data[0].status).toBe('PUBLISHED');
        expect(response.body.data[0].isPublic).toBe(true);
      });

      it('should return only public and active documents', async () => {
        // Create private document
        const testFilePath = path.join(__dirname, 'private-test-document.pdf');
        const testFileContent = 'Private Test PDF content';
        
        fs.writeFileSync(testFilePath, testFileContent);

        await request(app.getHttpServer())
          .post('/api/v1/admin/documents/upload')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', testFilePath)
          .field('title[en]', 'Private Test Document')
          .field('title[ne]', 'निजी परीक्षण कागजात')
          .field('category', 'OFFICIAL')
          .field('status', 'PUBLISHED')
          .field('isPublic', false)
          .field('isActive', true);

        fs.unlinkSync(testFilePath);

        const response = await request(app.getHttpServer())
          .get('/api/v1/documents')
          .expect(200);

        const privateDocuments = response.body.data.filter((doc: any) => 
          doc.title.en === 'Private Test Document'
        );
        expect(privateDocuments.length).toBe(0);
      });

      it('should support pagination', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/documents')
          .query({ page: 1, limit: 5 })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBeLessThanOrEqual(5);
        expect(response.body.pagination).toBeDefined();
        expect(response.body.pagination.page).toBe(1);
        expect(response.body.pagination.limit).toBe(5);
      });

      it('should support search functionality', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/documents?search=Test')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
      });

      it('should filter by document type', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/documents?documentType=PDF')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
        response.body.data.forEach((doc: any) => {
          expect(doc.documentType).toBe('PDF');
        });
      });

      it('should filter by category', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/documents?category=OFFICIAL')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
        response.body.data.forEach((doc: any) => {
          expect(doc.category).toBe('OFFICIAL');
        });
      });
    });

    describe('GET /api/v1/documents/type/:type', () => {
      it('should get documents by type successfully', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/documents/type/PDF')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        response.body.data.forEach((doc: any) => {
          expect(doc.documentType).toBe('PDF');
        });
      });

      it('should return 200 even when no documents found', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/documents/type/DOCX')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });
    });

    describe('GET /api/v1/documents/category/:category', () => {
      it('should get documents by category successfully', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/documents/category/OFFICIAL')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        response.body.data.forEach((doc: any) => {
          expect(doc.category).toBe('OFFICIAL');
        });
      });
    });

    describe('GET /api/v1/documents/search', () => {
      it('should search documents successfully', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/documents/search')
          .query({ q: 'Test' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBeGreaterThan(0);
      });

      it('should return empty array for non-matching search', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/documents/search')
          .query({ q: 'NonExistentDocument' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBe(0);
      });
    });

    describe('GET /api/v1/documents/pdfs', () => {
      it('should get all PDF documents successfully', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/documents/pdfs')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        response.body.data.forEach((doc: any) => {
          expect(doc.documentType).toBe('PDF');
        });
      });
    });

    describe('GET /api/v1/documents/forms', () => {
      it('should get all form documents successfully', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/documents/forms')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        response.body.data.forEach((doc: any) => {
          expect(doc.category).toBe('FORM');
        });
      });
    });

    describe('GET /api/v1/documents/policies', () => {
      it('should get all policy documents successfully', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/documents/policies')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        response.body.data.forEach((doc: any) => {
          expect(doc.category).toBe('POLICY');
        });
      });
    });

    describe('GET /api/v1/documents/reports', () => {
      it('should get all report documents successfully', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/documents/reports')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        response.body.data.forEach((doc: any) => {
          expect(doc.category).toBe('REPORT');
        });
      });
    });

    describe('GET /api/v1/documents/:id', () => {
      it('should get document by ID successfully', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/documents/${testDocument.id}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(testDocument.id);
        expect(response.body.data.title).toBeDefined();
        expect(response.body.data.fileName).toBeDefined();
      });

      it('should return 404 for non-existent document', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/documents/non-existent-id')
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      });
    });

    describe('GET /api/v1/documents/:id/download', () => {
      it('should generate download URL successfully', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/documents/${testDocument.id}/download`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.downloadUrl).toBeDefined();
        expect(response.body.data.downloadUrl).toContain('http');
      });

      it('should return 404 for non-existent document', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/documents/non-existent-id/download')
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/v1/documents/:id/url', () => {
      it('should get document URL successfully', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/documents/${testDocument.id}/url`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.url).toBeDefined();
        expect(response.body.data.fileName).toBeDefined();
        expect(response.body.data.fileSize).toBeDefined();
        expect(response.body.data.mimeType).toBeDefined();
      });

      it('should return 404 for non-existent document', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/documents/non-existent-id/url')
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Admin Document Endpoints', () => {
    describe('GET /api/v1/admin/documents', () => {
      it('should get all documents for admin', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/documents')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBeGreaterThan(0);
      });

      it('should require authentication', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/documents')
          .expect(401);

        expect(response.body.success).toBe(false);
      });

      it('should require admin or editor role', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/documents')
          .set('Authorization', `Bearer ${viewerToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
      });

      it('should support filtering by status', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/documents?status=PUBLISHED')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        response.body.data.forEach((doc: any) => {
          expect(doc.status).toBe('PUBLISHED');
        });
      });

      it('should support filtering by isPublic', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/documents')
          .query({ isPublic: true })
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        response.body.data.forEach((doc: any) => {
          expect(doc.isPublic).toBe(true);
        });
      });
    });

    describe('GET /api/v1/admin/documents/statistics', () => {
      it('should get document statistics successfully', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/documents/statistics')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('total');
        expect(response.body.data).toHaveProperty('published');
        expect(response.body.data).toHaveProperty('draft');
        expect(response.body.data).toHaveProperty('archived');
        expect(response.body.data).toHaveProperty('byType');
        expect(response.body.data).toHaveProperty('byCategory');
        expect(response.body.data).toHaveProperty('totalDownloads');
      });
    });

    describe('GET /api/v1/admin/documents/search', () => {
      it('should search documents successfully', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/documents/search')
          .query({ q: 'Test' })
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBeGreaterThan(0);
      });
    });

    describe('GET /api/v1/admin/documents/type/:type', () => {
      it('should get documents by type successfully', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/documents/type/PDF')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        response.body.data.forEach((doc: any) => {
          expect(doc.documentType).toBe('PDF');
        });
      });
    });

    describe('GET /api/v1/admin/documents/category/:category', () => {
      it('should get documents by category successfully', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/documents/category/OFFICIAL')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        response.body.data.forEach((doc: any) => {
          expect(doc.category).toBe('OFFICIAL');
        });
      });
    });

    describe('GET /api/v1/admin/documents/:id', () => {
      it('should get document by ID successfully', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/admin/documents/${testDocument.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(testDocument.id);
      });

      it('should return 404 for non-existent document', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/documents/non-existent-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/v1/admin/documents/upload', () => {
      it('should upload document successfully', async () => {
        const testFilePath = path.join(__dirname, 'upload-test-document.pdf');
        const testFileContent = 'Upload Test PDF content';
        
        fs.writeFileSync(testFilePath, testFileContent);

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/documents/upload')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', testFilePath)
          .field('title[en]', 'Upload Test Document')
          .field('title[ne]', 'अपलोड परीक्षण कागजात')
          .field('description[en]', 'Upload test document description')
          .field('description[ne]', 'अपलोड परीक्षण कागजात विवरण')
          .field('category', 'OFFICIAL')
          .field('status', 'DRAFT')
          .field('documentNumber', 'DOC-2024-002')
          .field('version', '1.0')
          .field('isPublic', 'false')
          .field('requiresAuth', 'true')
          .field('order', '2')
          .field('isActive', 'true')
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.title.en).toBe('Upload Test Document');
        expect(response.body.data.category).toBe('OFFICIAL');
        expect(response.body.data.status).toBe('DRAFT');

        fs.unlinkSync(testFilePath);
      });

      it('should require file to be uploaded', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/documents/upload')
          .set('Authorization', `Bearer ${adminToken}`)
          .field('title[en]', 'Test Document')
          .field('category', 'OFFICIAL')
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      it('should validate file type', async () => {
        const testFilePath = path.join(__dirname, 'invalid-file.exe');
        const testFileContent = 'Invalid file content';
        
        fs.writeFileSync(testFilePath, testFileContent);

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/documents/upload')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', testFilePath)
          .field('title[en]', 'Invalid File Document')
          .field('category', 'OFFICIAL')
          .expect(400);

        expect(response.body.success).toBe(false);

        fs.unlinkSync(testFilePath);
      });
    });

    describe('PUT /api/v1/admin/documents/:id', () => {
      it('should update document successfully', async () => {
        const updateData = {
          title: {
            en: 'Updated Test Document',
            ne: 'अपडेटेड परीक्षण कागजात',
          },
          description: {
            en: 'Updated description',
            ne: 'अपडेटेड विवरण',
          },
          category: 'POLICY',
          status: 'PUBLISHED',
          documentNumber: 'DOC-2024-001-UPDATED',
          version: '1.1',
          isPublic: true,
          requiresAuth: false,
          order: 5,
          isActive: true,
        };

        const response = await request(app.getHttpServer())
          .put(`/api/v1/admin/documents/${testDocument.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.title.en).toBe('Updated Test Document');
        expect(response.body.data.category).toBe('POLICY');
        expect(response.body.data.status).toBe('PUBLISHED');
        expect(response.body.data.version).toBe('1.1');
      });

      it('should return 404 for non-existent document', async () => {
        const response = await request(app.getHttpServer())
          .put('/api/v1/admin/documents/non-existent-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            title: { en: 'Updated Document', ne: 'अपडेटेड कागजात' },
            category: 'POLICY',
          })
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });

    describe('DELETE /api/v1/admin/documents/:id', () => {
      it('should delete document successfully', async () => {
        // Create a document to delete
        const testFilePath = path.join(__dirname, 'delete-test-document.pdf');
        const testFileContent = 'Delete Test PDF content';
        
        fs.writeFileSync(testFilePath, testFileContent);

        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/admin/documents/upload')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', testFilePath)
          .field('title[en]', 'Delete Test Document')
          .field('title[ne]', 'मेटाउन परीक्षण कागजात')
          .field('category', 'OFFICIAL')
          .field('status', 'DRAFT');

        fs.unlinkSync(testFilePath);

        const documentToDelete = createResponse.body.data;

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/admin/documents/${documentToDelete.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.message).toBe('Document deleted successfully');

        // Verify document is deleted
        const getResponse = await request(app.getHttpServer())
          .get(`/api/v1/admin/documents/${documentToDelete.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
      });

      it('should return 404 for non-existent document', async () => {
        const response = await request(app.getHttpServer())
          .delete('/api/v1/admin/documents/non-existent-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
      });

      it('should require admin role', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/admin/documents/${testDocument.id}`)
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/v1/admin/documents/:id/versions', () => {
      it('should create document version successfully', async () => {
        const testFilePath = path.join(__dirname, 'version-test-document.pdf');
        const testFileContent = 'Version Test PDF content';
        
        fs.writeFileSync(testFilePath, testFileContent);

        const response = await request(app.getHttpServer())
          .post(`/api/v1/admin/documents/${testDocument.id}/versions`)
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', testFilePath)
          .field('version', '2.0')
          .field('changeLog', JSON.stringify({ en: 'Updated content and formatting', ne: 'सामग्री र फर्मेटिंग अपडेट गरियो' }))
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.version).toBe('2.0');

        fs.unlinkSync(testFilePath);
      });

      it('should require version field', async () => {
        const testFilePath = path.join(__dirname, 'version-test-document.pdf');
        const testFileContent = 'Version Test PDF content';
        
        fs.writeFileSync(testFilePath, testFileContent);

        const response = await request(app.getHttpServer())
          .post(`/api/v1/admin/documents/${testDocument.id}/versions`)
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', testFilePath)
          .field('changeLog[en]', 'Updated content')
          .expect(400);

        expect(response.body.success).toBe(false);

        fs.unlinkSync(testFilePath);
      });
    });

    describe('GET /api/v1/admin/documents/:id/versions', () => {
      it('should get document versions successfully', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/admin/documents/${testDocument.id}/versions`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });
    });

    describe('GET /api/v1/admin/documents/:id/analytics', () => {
      it('should get document analytics successfully', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/admin/documents/${testDocument.id}/analytics`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('documentId');
        expect(response.body.data).toHaveProperty('documentTitle');
        expect(response.body.data).toHaveProperty('totalDownloads');
        expect(response.body.data).toHaveProperty('downloadsByDate');
        expect(response.body.data).toHaveProperty('downloadsByBrowser');
        expect(response.body.data).toHaveProperty('downloadsByDevice');
        expect(response.body.data).toHaveProperty('topDownloaders');
      });
    });

    describe('GET /api/v1/admin/documents/export', () => {
      it('should export documents successfully', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/documents/export')
          .query({ format: 'json' })
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.headers['content-type']).toContain('application/json');
        expect(response.headers['content-disposition']).toContain('attachment');
      });
    });

    describe('POST /api/v1/admin/documents/import', () => {
      it('should require admin role', async () => {
        const testFilePath = path.join(__dirname, 'import-test.json');
        const testFileContent = JSON.stringify([{ title: 'Test Document' }]);
        
        fs.writeFileSync(testFilePath, testFileContent);

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/documents/import')
          .set('Authorization', `Bearer ${editorToken}`)
          .attach('file', testFilePath)
          .expect(403);

        expect(response.body.success).toBe(false);

        fs.unlinkSync(testFilePath);
      });
    });

    describe('POST /api/v1/admin/documents/bulk-delete', () => {
      it('should bulk delete documents successfully', async () => {
        // Create documents to delete
        const testFilePath = path.join(__dirname, 'bulk-delete-test-document.pdf');
        const testFileContent = 'Bulk Delete Test PDF content';
        
        fs.writeFileSync(testFilePath, testFileContent);

        const createResponse1 = await request(app.getHttpServer())
          .post('/api/v1/admin/documents/upload')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', testFilePath)
          .field('title[en]', 'Bulk Delete Test Document 1')
          .field('title[ne]', 'बल्क डिलिट परीक्षण कागजात १')
          .field('category', 'OFFICIAL')
          .field('status', 'DRAFT')
          .expect(201);

        const createResponse2 = await request(app.getHttpServer())
          .post('/api/v1/admin/documents/upload')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', testFilePath)
          .field('title[en]', 'Bulk Delete Test Document 2')
          .field('title[ne]', 'बल्क डिलिट परीक्षण कागजात २')
          .field('category', 'OFFICIAL')
          .field('status', 'DRAFT')
          .expect(201);

        fs.unlinkSync(testFilePath);

        const documentsToDelete = [createResponse1.body.data.id, createResponse2.body.data.id];

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/documents/bulk-delete')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ ids: documentsToDelete })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.success).toBe(2);
        expect(response.body.data.failed).toBe(0);
      });

      it('should require admin role', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/documents/bulk-delete')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({ ids: ['test-id'] })
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });

    describe('PUT /api/v1/admin/documents/bulk-update', () => {
      it('should bulk update documents successfully', async () => {
        // Create a document to update
        const testFilePath = path.join(__dirname, 'bulk-update-test-document.pdf');
        const testFileContent = 'Bulk Update Test PDF content';
        
        fs.writeFileSync(testFilePath, testFileContent);

        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/admin/documents/upload')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', testFilePath)
          .field('title[en]', 'Bulk Update Test Document')
          .field('title[ne]', 'बल्क अपडेट परीक्षण कागजात')
          .field('category', 'OFFICIAL')
          .field('status', 'DRAFT')
          .expect(201);

        fs.unlinkSync(testFilePath);

        const documentToUpdate = createResponse.body.data;

        const updateData = {
          ids: [documentToUpdate.id],
          updates: {
            category: 'POLICY',
            status: 'PUBLISHED',
            isPublic: true,
          }
        };

        const response = await request(app.getHttpServer())
          .put('/api/v1/admin/documents/bulk-update')
          .set('Authorization', `Bearer ${adminToken}`)
          .set('Content-Type', 'application/json')
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.success).toBe(1);
        expect(response.body.data.failed).toBe(0);
      });

      it('should require admin or editor role', async () => {
        const response = await request(app.getHttpServer())
          .put('/api/v1/admin/documents/bulk-update')
          .set('Authorization', `Bearer ${viewerToken}`)
          .send({ ids: ['test-id'], updates: {} })
          .expect(403);

        expect(response.body.success).toBe(false);
      });

      it('should validate required fields', async () => {
        const response = await request(app.getHttpServer())
          .put('/api/v1/admin/documents/bulk-update')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ ids: [], updates: {} })
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });
  });
}); 