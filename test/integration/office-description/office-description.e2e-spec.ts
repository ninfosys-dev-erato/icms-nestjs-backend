import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/database/prisma.service';
import { HttpExceptionFilter } from '../../../src/common/filters/http-exception.filter';
import { ApiResponseInterceptor } from '../../../src/common/interceptors/api-response.interceptor';
import { OfficeDescriptionType } from '../../../src/modules/office-description/entities/office-description.entity';

describe('Office Description Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let adminToken: string;
  let editorToken: string;
  let viewerToken: string;
  let testDescriptionId: string;

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
  });

  const cleanupDatabase = async () => {
    try {
      const tables = [
        'office_descriptions',
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
          email: 'admin@office-description.com',
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
          email: 'editor@office-description.com',
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
          email: 'viewer@office-description.com',
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

  const createTestDescription = async () => {
    const descriptionData = {
      officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
      content: { en: 'Test Introduction', ne: 'परीक्षण परिचय' },
    };

    const response = await request(app.getHttpServer())
      .post('/api/v1/admin/office-descriptions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(descriptionData);

    if (response.status !== 201) {
      throw new Error(`Description creation failed with status ${response.status}: ${JSON.stringify(response.body)}`);
    }

    return response.body.data.id;
  };

  describe('Public Office Description Endpoints', () => {
    beforeEach(async () => {
      testDescriptionId = await createTestDescription();
    });

    describe('GET /api/v1/office-descriptions', () => {
      it('should get all office descriptions', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/office-descriptions')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should get office descriptions with type filter', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/office-descriptions?type=INTRODUCTION')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    describe('GET /api/v1/office-descriptions/types', () => {
      it('should get all office description types', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/office-descriptions/types')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data).toContain('INTRODUCTION');
        expect(response.body.data).toContain('OBJECTIVE');
      });
    });

    describe('GET /api/v1/office-descriptions/type/:type', () => {
      it('should get office description by type', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/office-descriptions/type/${OfficeDescriptionType.INTRODUCTION}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.officeDescriptionType).toBe(OfficeDescriptionType.INTRODUCTION);
      });

      it('should return 404 for non-existent type', async () => {
        await request(app.getHttpServer())
          .get(`/api/v1/office-descriptions/type/${OfficeDescriptionType.OBJECTIVE}`)
          .expect(404);
      });

      it('should get office description with language filter', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/office-descriptions/type/${OfficeDescriptionType.INTRODUCTION}?lang=en`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.content.en).toBeDefined();
      });
    });

    describe('GET /api/v1/office-descriptions/:id', () => {
      it('should get office description by ID', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/office-descriptions/${testDescriptionId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(testDescriptionId);
      });

      it('should return 404 for non-existent ID', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/office-descriptions/non-existent-id')
          .expect(404);
      });
    });

    describe('GET /api/v1/office-descriptions/introduction', () => {
      it('should get office introduction', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/office-descriptions/introduction')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.officeDescriptionType).toBe(OfficeDescriptionType.INTRODUCTION);
      });
    });

    describe('GET /api/v1/office-descriptions/objective', () => {
      it('should return 404 for non-existent objective', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/office-descriptions/objective')
          .expect(404);
      });
    });

    describe('GET /api/v1/office-descriptions/work-details', () => {
      it('should return 404 for non-existent work details', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/office-descriptions/work-details')
          .expect(404);
      });
    });

    describe('GET /api/v1/office-descriptions/organizational-structure', () => {
      it('should return 404 for non-existent organizational structure', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/office-descriptions/organizational-structure')
          .expect(404);
      });
    });

    describe('GET /api/v1/office-descriptions/digital-charter', () => {
      it('should return 404 for non-existent digital charter', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/office-descriptions/digital-charter')
          .expect(404);
      });
    });

    describe('GET /api/v1/office-descriptions/employee-sanctions', () => {
      it('should return 404 for non-existent employee sanctions', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/office-descriptions/employee-sanctions')
          .expect(404);
      });
    });
  });

  describe('Admin Office Description Endpoints', () => {
    describe('POST /api/v1/admin/office-descriptions', () => {
      it('should create office description', async () => {
        const descriptionData = {
          officeDescriptionType: OfficeDescriptionType.OBJECTIVE,
          content: { en: 'Test Objective', ne: 'परीक्षण उद्देश्य' },
        };

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/office-descriptions')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(descriptionData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.officeDescriptionType).toBe(OfficeDescriptionType.OBJECTIVE);
        expect(response.body.data.content.en).toBe('Test Objective');
      });

      it('should require authentication', async () => {
        const descriptionData = {
          officeDescriptionType: OfficeDescriptionType.OBJECTIVE,
          content: { en: 'Test Objective', ne: 'परीक्षण उद्देश्य' },
        };

        await request(app.getHttpServer())
          .post('/api/v1/admin/office-descriptions')
          .send(descriptionData)
          .expect(401);
      });

      it('should require admin role', async () => {
        const descriptionData = {
          officeDescriptionType: OfficeDescriptionType.OBJECTIVE,
          content: { en: 'Test Objective', ne: 'परीक्षण उद्देश्य' },
        };

        await request(app.getHttpServer())
          .post('/api/v1/admin/office-descriptions')
          .set('Authorization', `Bearer ${viewerToken}`)
          .send(descriptionData)
          .expect(403);
      });

      it('should validate required fields', async () => {
        const invalidData = {
          content: { en: 'Test Content', ne: 'परीक्षण सामग्री' },
        };

        await request(app.getHttpServer())
          .post('/api/v1/admin/office-descriptions')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(invalidData)
          .expect(400);
      });
    });

    describe('GET /api/v1/admin/office-descriptions', () => {
      it('should get all office descriptions', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/office-descriptions')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should require authentication', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/admin/office-descriptions')
          .expect(401);
      });
    });

    describe('GET /api/v1/admin/office-descriptions/:id', () => {
      it('should get office description by ID', async () => {
        const descriptionId = await createTestDescription();

        const response = await request(app.getHttpServer())
          .get(`/api/v1/admin/office-descriptions/${descriptionId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(descriptionId);
      });

      it('should return 404 for non-existent ID', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/admin/office-descriptions/non-existent-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
      });
    });

    describe('PUT /api/v1/admin/office-descriptions/:id', () => {
      it('should update office description', async () => {
        const descriptionId = await createTestDescription();
        const updateData = {
          content: { en: 'Updated Introduction', ne: 'अपडेटेड परिचय' },
        };

        const response = await request(app.getHttpServer())
          .put(`/api/v1/admin/office-descriptions/${descriptionId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.content.en).toBe('Updated Introduction');
      });

      it('should return 404 for non-existent ID', async () => {
        const updateData = {
          content: { en: 'Updated Content', ne: 'अपडेटेड सामग्री' },
        };

        await request(app.getHttpServer())
          .put('/api/v1/admin/office-descriptions/non-existent-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(404);
      });
    });

    describe('PUT /api/v1/admin/office-descriptions/type/:type/upsert', () => {
      it('should upsert office description by type', async () => {
        const upsertData = {
          officeDescriptionType: OfficeDescriptionType.WORK_DETAILS,
          content: { en: 'Work Details', ne: 'कार्य विवरण' },
        };

        const response = await request(app.getHttpServer())
          .put(`/api/v1/admin/office-descriptions/type/${OfficeDescriptionType.WORK_DETAILS}/upsert`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(upsertData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.officeDescriptionType).toBe(OfficeDescriptionType.WORK_DETAILS);
      });
    });

    describe('DELETE /api/v1/admin/office-descriptions/:id', () => {
      it('should delete office description', async () => {
        const descriptionId = await createTestDescription();

        await request(app.getHttpServer())
          .delete(`/api/v1/admin/office-descriptions/${descriptionId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        // Verify description is deleted
        await request(app.getHttpServer())
          .get(`/api/v1/office-descriptions/${descriptionId}`)
          .expect(404);
      });

      it('should require admin role for deletion', async () => {
        const descriptionId = await createTestDescription();

        await request(app.getHttpServer())
          .delete(`/api/v1/admin/office-descriptions/${descriptionId}`)
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(403);
      });
    });

    describe('DELETE /api/v1/admin/office-descriptions/type/:type', () => {
      it('should delete office description by type', async () => {
        // First create a description of the type we want to delete
        const descriptionData = {
          officeDescriptionType: OfficeDescriptionType.OBJECTIVE,
          content: { en: 'Test Objective for Deletion', ne: 'हटाउनको लागि परीक्षण उद्देश्य' },
        };

        await request(app.getHttpServer())
          .post('/api/v1/admin/office-descriptions')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(descriptionData)
          .expect(201);

        // Now delete it by type
        await request(app.getHttpServer())
          .delete(`/api/v1/admin/office-descriptions/type/${OfficeDescriptionType.OBJECTIVE}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        // Verify description is deleted
        await request(app.getHttpServer())
          .get(`/api/v1/office-descriptions/type/${OfficeDescriptionType.OBJECTIVE}`)
          .expect(404);
      });
    });

    describe('GET /api/v1/admin/office-descriptions/statistics', () => {
      it('should get office description statistics', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/office-descriptions/statistics')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.total).toBeDefined();
        expect(response.body.data.byType).toBeDefined();
        expect(response.body.data.lastUpdated).toBeDefined();
      });
    });
  });

  describe('Bulk Operations', () => {
    describe('POST /api/v1/admin/office-descriptions/bulk-create', () => {
      it('should bulk create office descriptions', async () => {
        const bulkData = {
          descriptions: [
            {
              officeDescriptionType: OfficeDescriptionType.OBJECTIVE,
              content: { en: 'Objective 1', ne: 'उद्देश्य १' },
            },
            {
              officeDescriptionType: OfficeDescriptionType.WORK_DETAILS,
              content: { en: 'Work Details 1', ne: 'कार्य विवरण १' },
            },
          ],
        };

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/office-descriptions/bulk-create')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(bulkData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBe(2);
      });
    });

    describe('PUT /api/v1/admin/office-descriptions/bulk-update', () => {
      it('should bulk update office descriptions', async () => {
        // First create some descriptions to update
        const createData = {
          descriptions: [
            {
              officeDescriptionType: OfficeDescriptionType.OBJECTIVE,
              content: { en: 'Original Objective', ne: 'मूल उद्देश्य' },
            },
            {
              officeDescriptionType: OfficeDescriptionType.WORK_DETAILS,
              content: { en: 'Original Work Details', ne: 'मूल कार्य विवरण' },
            },
          ],
        };

        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/admin/office-descriptions/bulk-create')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(createData)
          .expect(201);

        const descriptions = createResponse.body.data;

        // Now update them
        const bulkData = {
          descriptions: descriptions.map((desc: any) => ({
            id: desc.id,
            content: { en: `Updated ${desc.officeDescriptionType}`, ne: `अपडेटेड ${desc.officeDescriptionType}` },
          })),
        };

        const response = await request(app.getHttpServer())
          .put('/api/v1/admin/office-descriptions/bulk-update')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(bulkData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBe(2);
      });
    });
  });

  describe('Import/Export Operations', () => {
    describe('PUT /api/v1/admin/office-descriptions/import', () => {
      it('should import office descriptions', async () => {
        const importData = {
          descriptions: [
            {
              officeDescriptionType: OfficeDescriptionType.OBJECTIVE,
              content: { en: 'Imported Objective', ne: 'आयातित उद्देश्य' },
            },
            {
              officeDescriptionType: OfficeDescriptionType.WORK_DETAILS,
              content: { en: 'Imported Work Details', ne: 'आयातित कार्य विवरण' },
            },
          ],
        };

        const response = await request(app.getHttpServer())
          .put('/api/v1/admin/office-descriptions/import')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(importData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });
    });

    describe('GET /api/v1/admin/office-descriptions/export', () => {
      it('should export office descriptions', async () => {
        // First create some descriptions to export
        const createData = {
          descriptions: [
            {
              officeDescriptionType: OfficeDescriptionType.OBJECTIVE,
              content: { en: 'Export Objective', ne: 'निर्यात उद्देश्य' },
            },
          ],
        };

        await request(app.getHttpServer())
          .post('/api/v1/admin/office-descriptions/bulk-create')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(createData)
          .expect(201);

        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/office-descriptions/export')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });
    });
  });

  describe('Authentication & Authorization', () => {
    describe('Editor Access', () => {
      it('should allow editor to create office descriptions', async () => {
        const descriptionData = {
          officeDescriptionType: OfficeDescriptionType.EMPLOYEE_SANCTIONS,
          content: { en: 'Employee Sanctions', ne: 'कर्मचारी सजायहरू' },
        };

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/office-descriptions')
          .set('Authorization', `Bearer ${editorToken}`)
          .send(descriptionData)
          .expect(201);

        expect(response.body.success).toBe(true);
      });

      it('should allow editor to update office descriptions', async () => {
        const descriptionId = await createTestDescription();
        const updateData = {
          content: { en: 'Updated by Editor', ne: 'एडिटर द्वारा अपडेट' },
        };

        const response = await request(app.getHttpServer())
          .put(`/api/v1/admin/office-descriptions/${descriptionId}`)
          .set('Authorization', `Bearer ${editorToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      it('should not allow editor to delete office descriptions', async () => {
        const descriptionId = await createTestDescription();

        await request(app.getHttpServer())
          .delete(`/api/v1/admin/office-descriptions/${descriptionId}`)
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(403);
      });
    });

    describe('Viewer Access', () => {
      it('should not allow viewer to create office descriptions', async () => {
        const descriptionData = {
          officeDescriptionType: OfficeDescriptionType.EMPLOYEE_SANCTIONS,
          content: { en: 'Employee Sanctions', ne: 'कर्मचारी सजायहरू' },
        };

        await request(app.getHttpServer())
          .post('/api/v1/admin/office-descriptions')
          .set('Authorization', `Bearer ${viewerToken}`)
          .send(descriptionData)
          .expect(403);
      });

      it('should not allow viewer to update office descriptions', async () => {
        const descriptionId = await createTestDescription();
        const updateData = {
          content: { en: 'Updated by Viewer', ne: 'दर्शक द्वारा अपडेट' },
        };

        await request(app.getHttpServer())
          .put(`/api/v1/admin/office-descriptions/${descriptionId}`)
          .set('Authorization', `Bearer ${viewerToken}`)
          .send(updateData)
          .expect(403);
      });
    });
  });
}); 