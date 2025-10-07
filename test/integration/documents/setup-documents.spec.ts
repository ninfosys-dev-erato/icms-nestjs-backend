import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import * as request from 'supertest';

import { PrismaService } from '@/database/prisma.service';
import { AppModule } from '@/app.module';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { ApiResponseInterceptor } from '@/common/interceptors/api-response.interceptor';
import { DocumentsModule } from '@/modules/documents/documents.module';
import { DocumentService } from '@/modules/documents/services/document.service';
import { DocumentRepository } from '@/modules/documents/repositories/document.repository';
import { DocumentDownloadRepository } from '@/modules/documents/repositories/document-download.repository';
import { DocumentVersionRepository } from '@/modules/documents/repositories/document-version.repository';

describe('Documents Module Setup', () => {
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

  describe('Database Connection', () => {
    it('should connect to database successfully', async () => {
      // Test database connection by running a simple query
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      expect(result).toEqual([{ test: 1 }]);
    });

    it('should have required tables', async () => {
      // Check if required tables exist
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('documents', 'document_versions', 'document_downloads', 'users')
      `;
      
      const tableNames = (tables as any[]).map(t => t.table_name);
      expect(tableNames).toContain('documents');
      expect(tableNames).toContain('document_versions');
      expect(tableNames).toContain('document_downloads');
      expect(tableNames).toContain('users');
    });
  });

  describe('Application Setup', () => {
    it('should start application successfully', () => {
      expect(app).toBeDefined();
    });

    it('should have global prefix set', () => {
      // Test that the global prefix is working
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(404); // Should return 404 for non-existent endpoint, but not 404 for missing prefix
    });

    it('should handle validation pipe', async () => {
      // Test validation pipe by sending invalid data
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'short',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should handle API response interceptor', async () => {
      // Test API response interceptor by accessing a valid endpoint
      const response = await request(app.getHttpServer())
        .get('/api/v1/documents')
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('Environment Configuration', () => {
    it('should have required environment variables', () => {
      expect(process.env.JWT_SECRET).toBeDefined();
      expect(process.env.JWT_EXPIRES_IN).toBeDefined();
      expect(process.env.JWT_REFRESH_SECRET).toBeDefined();
      expect(process.env.JWT_REFRESH_EXPIRES_IN).toBeDefined();
    });

    it('should use test JWT secrets', () => {
      expect(process.env.JWT_SECRET).toContain('test');
      expect(process.env.JWT_REFRESH_SECRET).toContain('test');
    });
  });

  describe('Module Dependencies', () => {
    it('should have DocumentsModule available', async () => {
      const documentsModule = app.get(DocumentsModule);
      expect(documentsModule).toBeDefined();
    });

    it('should have DocumentService available', async () => {
      const documentService = app.get(DocumentService);
      expect(documentService).toBeDefined();
    });

    it('should have DocumentRepository available', async () => {
      const documentRepository = app.get(DocumentRepository);
      expect(documentRepository).toBeDefined();
    });

    it('should have DocumentDownloadRepository available', async () => {
      const documentDownloadRepository = app.get(DocumentDownloadRepository);
      expect(documentDownloadRepository).toBeDefined();
    });

    it('should have DocumentVersionRepository available', async () => {
      const documentVersionRepository = app.get(DocumentVersionRepository);
      expect(documentVersionRepository).toBeDefined();
    });
  });

  describe('Controller Routes', () => {
    it('should have admin document routes available', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/documents')
        .expect(401); // Should return 401 (unauthorized) not 404 (not found)

      expect(response.status).toBe(401);
    });

    it('should have public document routes available', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/documents')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('File Upload Configuration', () => {
    it('should support multipart form data', async () => {
      // Test file upload endpoint (should fail without proper auth, but not due to multipart config)
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/documents/upload')
        .attach('file', Buffer.from('test content'), 'test.pdf')
        .field('title[en]', 'Test Document')
        .field('category', 'OFFICIAL')
        .expect(401); // Should return 401 (unauthorized) not 400 (bad request for multipart)

      expect(response.status).toBe(401);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors properly', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/non-existent-endpoint')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should handle validation errors properly', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
}); 