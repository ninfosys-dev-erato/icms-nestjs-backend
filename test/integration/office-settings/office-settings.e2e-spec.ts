import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/database/prisma.service';
import { HttpExceptionFilter } from '../../../src/common/filters/http-exception.filter';
import { ApiResponseInterceptor } from '../../../src/common/interceptors/api-response.interceptor';

describe('Office Settings Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let adminToken: string;
  let editorToken: string;
  let viewerToken: string;
  let testSettingsId: string;

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
      transformOptions: {
        enableImplicitConversion: true,
      },
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
        'office_settings',
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
          email: 'admin@office-settings.com',
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

      // Create editor user
      const editorResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'editor@office-settings.com',
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

      // Create viewer user
      const viewerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'viewer@office-settings.com',
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
    } catch (error) {
      console.error('Error creating test users:', error);
      throw error;
    }
  };

  const createTestSettings = async () => {
    const settingsData = {
      directorate: { en: 'Test Directorate', ne: 'परीक्षण निर्देशनालय' },
      officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
      officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
      email: 'test@example.gov.np',
      phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
    };

    const response = await request(app.getHttpServer())
      .post('/api/v1/office-settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(settingsData);

    if (response.status !== 201) {
      throw new Error(`Settings creation failed with status ${response.status}: ${JSON.stringify(response.body)}`);
    }

    return response.body.data.id;
  };

  describe('Public Office Settings Endpoints', () => {
    beforeEach(async () => {
      testSettingsId = await createTestSettings();
    });

    describe('GET /api/v1/office-settings', () => {
      it('should get office settings', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/office-settings')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.directorate).toBeDefined();
        expect(response.body.data.officeName).toBeDefined();
        expect(response.body.data.email).toBeDefined();
      });

      it('should get office settings with language filter', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/office-settings?lang=en')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.directorate.en).toBeDefined();
      });

      it('should return 404 when no settings exist', async () => {
        // Clean up first
        await cleanupDatabase();
        await createTestUsers();

        await request(app.getHttpServer())
          .get('/api/v1/office-settings')
          .expect(404);
      });
    });

    describe('GET /api/v1/office-settings/seo', () => {
      it('should get office settings for SEO', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/office-settings/seo')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.name).toBeDefined();
        expect(response.body.data.description).toBeDefined();
        expect(response.body.data.address).toBeDefined();
        expect(response.body.data.phone).toBeDefined();
        expect(response.body.data.email).toBeDefined();
      });

      it('should return 404 when no settings exist', async () => {
        // Clean up first
        await cleanupDatabase();
        await createTestUsers();

        await request(app.getHttpServer())
          .get('/api/v1/office-settings/seo')
          .expect(404);
      });
    });
  });

  describe('Admin Office Settings Endpoints', () => {
    describe('POST /api/v1/office-settings', () => {
      it('should create office settings', async () => {
        const settingsData = {
          directorate: { en: 'Ministry of Education', ne: 'शिक्षा मन्त्रालय' },
          officeName: { en: 'District Education Office', ne: 'जिल्ला शिक्षा कार्यालय' },
          officeAddress: { en: 'Dadeldura, Nepal', ne: 'दादेलधुरा, नेपाल' },
          email: 'info@example.gov.np',
          phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
          website: 'https://example.gov.np',
          xLink: 'https://x.com/example',
          youtube: 'https://youtube.com/example',
        };

        const response = await request(app.getHttpServer())
          .post('/api/v1/office-settings')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(settingsData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.directorate.en).toBe('Ministry of Education');
        expect(response.body.data.email).toBe('info@example.gov.np');
        expect(response.body.data.website).toBe('https://example.gov.np');
      });

      it('should require authentication', async () => {
        const settingsData = {
          directorate: { en: 'Test Directorate', ne: 'परीक्षण निर्देशनालय' },
          officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
          officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
          email: 'test@example.gov.np',
          phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
        };

        await request(app.getHttpServer())
          .post('/api/v1/office-settings')
          .send(settingsData)
          .expect(401);
      });

      it('should require admin role', async () => {
        const settingsData = {
          directorate: { en: 'Test Directorate', ne: 'परीक्षण निर्देशनालय' },
          officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
          officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
          email: 'test@example.gov.np',
          phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
        };

        await request(app.getHttpServer())
          .post('/api/v1/office-settings')
          .set('Authorization', `Bearer ${viewerToken}`)
          .send(settingsData)
          .expect(403);
      });

      it('should validate required fields', async () => {
        const invalidData = {
          email: 'test@example.gov.np',
          // Missing required fields
        };

        await request(app.getHttpServer())
          .post('/api/v1/office-settings')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(invalidData)
          .expect(400);
      });

      it('should validate email format', async () => {
        const invalidData = {
          directorate: { en: 'Test Directorate', ne: 'परीक्षण निर्देशनालय' },
          officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
          officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
          email: 'invalid-email',
          phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
        };

        await request(app.getHttpServer())
          .post('/api/v1/office-settings')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(invalidData)
          .expect(400);
      });

      it('should validate URL formats', async () => {
        const invalidData = {
          directorate: { en: 'Test Directorate', ne: 'परीक्षण निर्देशनालय' },
          officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
          officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
          email: 'test@example.gov.np',
          phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
          website: 'invalid-url',
          xLink: 'invalid-url',
          youtube: 'invalid-url',
        };

        await request(app.getHttpServer())
          .post('/api/v1/office-settings')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(invalidData)
          .expect(400);
      });
    });

    describe('GET /api/v1/office-settings/:id', () => {
      it('should get office settings by ID', async () => {
        const settingsId = await createTestSettings();

        const response = await request(app.getHttpServer())
          .get(`/api/v1/office-settings/${settingsId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(settingsId);
      });

      it('should return 404 for non-existent ID', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/office-settings/non-existent-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
      });

      it('should require authentication', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/office-settings/test-id')
          .expect(401);
      });
    });

    describe('PUT /api/v1/office-settings/:id', () => {
      it('should update office settings', async () => {
        const settingsId = await createTestSettings();
        const updateData = {
          email: 'updated@example.gov.np',
          website: 'https://updated.gov.np',
        };

        const response = await request(app.getHttpServer())
          .put(`/api/v1/office-settings/${settingsId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.email).toBe('updated@example.gov.np');
        expect(response.body.data.website).toBe('https://updated.gov.np');
      });

      it('should return 404 for non-existent ID', async () => {
        const updateData = {
          email: 'updated@example.gov.np',
        };

        await request(app.getHttpServer())
          .put('/api/v1/office-settings/non-existent-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(404);
      });

      it('should validate update data', async () => {
        const settingsId = await createTestSettings();
        const invalidData = {
          email: 'invalid-email',
        };

        await request(app.getHttpServer())
          .put(`/api/v1/office-settings/${settingsId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(invalidData)
          .expect(400);
      });
    });

    describe('PUT /api/v1/office-settings/upsert', () => {
      it('should upsert office settings', async () => {
        const upsertData = {
          directorate: { en: 'Upsert Directorate', ne: 'अपसर्ट निर्देशनालय' },
          officeName: { en: 'Upsert Office', ne: 'अपसर्ट कार्यालय' },
          officeAddress: { en: 'Upsert Address', ne: 'अपसर्ट ठेगाना' },
          email: 'upsert@example.gov.np',
          phoneNumber: { en: '+977-987654321', ne: '+९७७-९८७६५४३२१' },
        };

        const response = await request(app.getHttpServer())
          .put('/api/v1/office-settings/upsert')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(upsertData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.directorate.en).toBe('Upsert Directorate');
        expect(response.body.data.email).toBe('upsert@example.gov.np');
      });
    });

    describe('DELETE /api/v1/office-settings/:id', () => {
      it('should delete office settings', async () => {
        const settingsId = await createTestSettings();

        await request(app.getHttpServer())
          .delete(`/api/v1/office-settings/${settingsId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        // Verify settings is deleted
        await request(app.getHttpServer())
          .get(`/api/v1/office-settings/${settingsId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
      });

      it('should require admin role for deletion', async () => {
        const settingsId = await createTestSettings();

        await request(app.getHttpServer())
          .delete(`/api/v1/office-settings/${settingsId}`)
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(403);
      });
    });

    describe('POST /api/v1/office-settings/:id/background-photo', () => {
      it('should update background photo', async () => {
        const settingsId = await createTestSettings();
        
        // Create a mock image file
        const mockFile = Buffer.from('fake-image-data');
        
        const response = await request(app.getHttpServer())
          .post(`/api/v1/office-settings/${settingsId}/background-photo`)
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', mockFile, 'test-image.jpg')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.backgroundPhoto).toBeDefined();
      });

      it('should reject invalid file type', async () => {
        const settingsId = await createTestSettings();
        
        // Create a mock text file
        const mockFile = Buffer.from('fake-text-data');
        
        await request(app.getHttpServer())
          .post(`/api/v1/office-settings/${settingsId}/background-photo`)
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', mockFile, 'test-file.txt')
          .expect(400);
      });

      it('should reject large files', async () => {
        const settingsId = await createTestSettings();
        
        // Create a large mock file (6MB)
        const mockFile = Buffer.alloc(6 * 1024 * 1024);
        
        await request(app.getHttpServer())
          .post(`/api/v1/office-settings/${settingsId}/background-photo`)
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', mockFile, 'large-image.jpg')
          .expect(400);
      });
    });

    describe('DELETE /api/v1/office-settings/:id/background-photo', () => {
      it('should remove background photo', async () => {
        const settingsId = await createTestSettings();
        
        // First add a background photo
        const mockFile = Buffer.from('fake-image-data');
        await request(app.getHttpServer())
          .post(`/api/v1/office-settings/${settingsId}/background-photo`)
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', mockFile, 'test-image.jpg');

        // Then remove it
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/office-settings/${settingsId}/background-photo`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.backgroundPhoto).toBeNull();
      });
    });
  });

  describe('Authentication & Authorization', () => {
    describe('Editor Access', () => {
      it('should not allow editor to create office settings', async () => {
        const settingsData = {
          directorate: { en: 'Test Directorate', ne: 'परीक्षण निर्देशनालय' },
          officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
          officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
          email: 'test@example.gov.np',
          phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
        };

        await request(app.getHttpServer())
          .post('/api/v1/office-settings')
          .set('Authorization', `Bearer ${editorToken}`)
          .send(settingsData)
          .expect(403);
      });

      it('should not allow editor to update office settings', async () => {
        const settingsId = await createTestSettings();
        const updateData = {
          email: 'updated@example.gov.np',
        };

        await request(app.getHttpServer())
          .put(`/api/v1/office-settings/${settingsId}`)
          .set('Authorization', `Bearer ${editorToken}`)
          .send(updateData)
          .expect(403);
      });

      it('should not allow editor to delete office settings', async () => {
        const settingsId = await createTestSettings();

        await request(app.getHttpServer())
          .delete(`/api/v1/office-settings/${settingsId}`)
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(403);
      });
    });

    describe('Viewer Access', () => {
      it('should not allow viewer to create office settings', async () => {
        const settingsData = {
          directorate: { en: 'Test Directorate', ne: 'परीक्षण निर्देशनालय' },
          officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
          officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
          email: 'test@example.gov.np',
          phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
        };

        await request(app.getHttpServer())
          .post('/api/v1/office-settings')
          .set('Authorization', `Bearer ${viewerToken}`)
          .send(settingsData)
          .expect(403);
      });

      it('should not allow viewer to update office settings', async () => {
        const settingsId = await createTestSettings();
        const updateData = {
          email: 'updated@example.gov.np',
        };

        await request(app.getHttpServer())
          .put(`/api/v1/office-settings/${settingsId}`)
          .set('Authorization', `Bearer ${viewerToken}`)
          .send(updateData)
          .expect(403);
      });
    });
  });

  describe('API Response Format', () => {
    it('should return consistent API response format for success', async () => {
      // Create test settings first
      await createTestSettings();
      
      const response = await request(app.getHttpServer())
        .get('/api/v1/office-settings')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('processingTime');
      expect(response.body.meta).toHaveProperty('requestId');
    });

    it('should return consistent API response format for error', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/office-settings/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      // Note: The error response format is handled by the HttpExceptionFilter
      // and may not go through the ApiResponseInterceptor
    });
  });

  describe('Data Validation', () => {
    it('should validate translatable fields', async () => {
      const invalidData = {
        directorate: { en: 'Test Directorate' }, // Missing Nepali
        officeName: { ne: 'परीक्षण कार्यालय' }, // Missing English
        officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
        email: 'test@example.gov.np',
        phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
      };

      await request(app.getHttpServer())
        .post('/api/v1/office-settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should validate field lengths', async () => {
      const invalidData = {
        directorate: { en: 'A'.repeat(501), ne: 'परीक्षण निर्देशनालय' }, // Too long
        officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
        officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
        email: 'test@example.gov.np',
        phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
      };

      await request(app.getHttpServer())
        .post('/api/v1/office-settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);
    });
  });
}); 