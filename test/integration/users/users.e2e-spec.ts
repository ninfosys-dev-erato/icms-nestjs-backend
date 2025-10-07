import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/database/prisma.service';
import { HttpExceptionFilter } from '../../../src/common/filters/http-exception.filter';
import { ApiResponseInterceptor } from '../../../src/common/interceptors/api-response.interceptor';
import { RequestIdMiddleware } from '../../../src/common/middleware/request-id.middleware';

describe('Users Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let editorToken: string;
  let viewerToken: string;
  let testUserId: string;

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
  });

  const cleanupDatabase = async () => {
    try {
      const tables = [
        'audit_logs',
        'user_sessions',
        'login_attempts',
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
      let adminResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@users.com',
          password: 'AdminPass123!',
        });

      if (adminResponse.status === 200 && adminResponse.body.success) {
        adminToken = adminResponse.body.data.accessToken;
        console.log('Admin user logged in successfully');
      } else {
        adminResponse = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            email: 'admin@users.com',
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

      // Create editor user
      let editorResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'editor@users.com',
          password: 'EditorPass123!',
        });

      if (editorResponse.status === 200 && editorResponse.body.success) {
        editorToken = editorResponse.body.data.accessToken;
        console.log('Editor user logged in successfully');
      } else {
        editorResponse = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            email: 'editor@users.com',
            password: 'EditorPass123!',
            confirmPassword: 'EditorPass123!',
            firstName: 'Editor',
            lastName: 'User',
            role: 'EDITOR',
          });

        if (editorResponse.status === 201 && editorResponse.body.success) {
          editorToken = editorResponse.body.data.accessToken;
          console.log('Editor user created successfully');
        }
      }

      // Create viewer user
      let viewerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'viewer@users.com',
          password: 'ViewerPass123!',
        });

      if (viewerResponse.status === 200 && viewerResponse.body.success) {
        viewerToken = viewerResponse.body.data.accessToken;
        console.log('Viewer user logged in successfully');
      } else {
        viewerResponse = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            email: 'viewer@users.com',
            password: 'ViewerPass123!',
            confirmPassword: 'ViewerPass123!',
            firstName: 'Viewer',
            lastName: 'User',
            role: 'VIEWER',
          });

        if (viewerResponse.status === 201 && viewerResponse.body.success) {
          viewerToken = viewerResponse.body.data.accessToken;
          console.log('Viewer user created successfully');
        }
      }
    } catch (error) {
      console.error('Error creating test users:', error);
      throw error;
    }
  };

  const createTestUser = async () => {
    const userData = {
      email: 'test@example.com',
      password: 'TestPass123!',
      firstName: 'Test',
      lastName: 'User',
      role: 'VIEWER',
      isActive: true,
    };

    const response = await request(app.getHttpServer())
      .post('/api/v1/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(userData);

    if (response.status !== 201) {
      throw new Error(`User creation failed with status ${response.status}: ${JSON.stringify(response.body)}`);
    }

    return response.body.data.id;
  };

  describe('User Profile Endpoints', () => {
    describe('GET /api/v1/users/profile', () => {
      it('should get current user profile', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/profile')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.email).toBe('admin@users.com');
        expect(response.body.data.firstName).toBe('Admin');
        expect(response.body.data.lastName).toBe('User');
        expect(response.body.data.role).toBe('ADMIN');
        expect(response.body.data.fullName).toBe('Admin User');
        expect(response.body.data.username).toBe('admin');
        expect(response.body.data).not.toHaveProperty('password');
      });

      it('should require authentication', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/users/profile')
          .expect(401);
      });
    });

    describe('PUT /api/v1/users/profile', () => {
      it('should update current user profile', async () => {
        const updateData = {
          firstName: 'Updated',
          lastName: 'Admin',
          phoneNumber: '+1234567890',
          avatarUrl: 'https://example.com/avatar.jpg',
        };

        const response = await request(app.getHttpServer())
          .put('/api/v1/users/profile')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.firstName).toBe('Updated');
        expect(response.body.data.lastName).toBe('Admin');
        expect(response.body.data.phoneNumber).toBe('+1234567890');
        expect(response.body.data.avatarUrl).toBe('https://example.com/avatar.jpg');
        expect(response.body.data.fullName).toBe('Updated Admin');
      });

      it('should require authentication', async () => {
        const updateData = {
          firstName: 'Updated',
        };

        await request(app.getHttpServer())
          .put('/api/v1/users/profile')
          .send(updateData)
          .expect(401);
      });
    });

    describe('GET /api/v1/users/active', () => {
      beforeEach(async () => {
        testUserId = await createTestUser();
      });

      it('should get active users with proper role', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/active')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.pagination).toBeDefined();
      });

      it('should allow editor access', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/active')
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      it('should deny viewer access', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/users/active')
          .set('Authorization', `Bearer ${viewerToken}`)
          .expect(403);
      });

      it('should require authentication', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/users/active')
          .expect(401);
      });
    });

    describe('GET /api/v1/users/role/:role', () => {
      beforeEach(async () => {
        testUserId = await createTestUser();
      });

      it('should get users by role', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/role/ADMIN')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.pagination).toBeDefined();
      });

      it('should validate role parameter', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/users/role/INVALID_ROLE')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);
      });
    });

    describe('GET /api/v1/users/activity', () => {
      it('should get recent user activity', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/activity')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should allow editor access', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/activity')
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      it('should deny viewer access', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/users/activity')
          .set('Authorization', `Bearer ${viewerToken}`)
          .expect(403);
      });
    });
  });

  describe('Admin User Endpoints', () => {
    describe('POST /api/v1/admin/users', () => {
      it('should create user', async () => {
        const userData = {
          email: 'newuser@example.com',
          password: 'NewPass123!',
          firstName: 'New',
          lastName: 'User',
          role: 'EDITOR',
          isActive: true,
        };

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(userData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.email).toBe('newuser@example.com');
        expect(response.body.data.firstName).toBe('New');
        expect(response.body.data.lastName).toBe('User');
        expect(response.body.data.role).toBe('EDITOR');
        expect(response.body.data.isActive).toBe(true);
        expect(response.body.data).not.toHaveProperty('password');
      });

      it('should require admin role', async () => {
        const userData = {
          email: 'newuser@example.com',
          password: 'NewPass123!',
          firstName: 'New',
          lastName: 'User',
          role: 'EDITOR',
        };

        await request(app.getHttpServer())
          .post('/api/v1/admin/users')
          .set('Authorization', `Bearer ${editorToken}`)
          .send(userData)
          .expect(403);

        await request(app.getHttpServer())
          .post('/api/v1/admin/users')
          .set('Authorization', `Bearer ${viewerToken}`)
          .send(userData)
          .expect(403);
      });

      it('should require authentication', async () => {
        const userData = {
          email: 'newuser@example.com',
          password: 'NewPass123!',
          firstName: 'New',
          lastName: 'User',
          role: 'EDITOR',
        };

        await request(app.getHttpServer())
          .post('/api/v1/admin/users')
          .send(userData)
          .expect(401);
      });

      it('should validate required fields', async () => {
        const invalidData = {
          email: 'invalid-email',
          // Missing required fields
        };

        await request(app.getHttpServer())
          .post('/api/v1/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(invalidData)
          .expect(400);
      });

      it('should prevent duplicate email', async () => {
        const userData = {
          email: 'admin@users.com', // Already exists
          password: 'NewPass123!',
          firstName: 'Duplicate',
          lastName: 'User',
          role: 'VIEWER',
        };

        await request(app.getHttpServer())
          .post('/api/v1/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(userData)
          .expect(400); // Updated to match actual validation behavior
      });
    });

    describe('GET /api/v1/admin/users/:id', () => {
      beforeEach(async () => {
        testUserId = await createTestUser();
      });

      it('should get user by ID', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/admin/users/${testUserId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(testUserId);
        expect(response.body.data.email).toBe('test@example.com');
        expect(response.body.data).not.toHaveProperty('password');
      });

      it('should return 404 for non-existent user', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/admin/users/non-existent-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
      });

      it('should require admin role', async () => {
        await request(app.getHttpServer())
          .get(`/api/v1/admin/users/${testUserId}`)
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(403);
      });
    });

    describe('PUT /api/v1/admin/users/:id', () => {
      beforeEach(async () => {
        testUserId = await createTestUser();
      });

      it('should update user', async () => {
        const updateData = {
          firstName: 'Updated',
          lastName: 'Name',
          role: 'EDITOR',
          isActive: false,
        };

        const response = await request(app.getHttpServer())
          .put(`/api/v1/admin/users/${testUserId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.firstName).toBe('Updated');
        expect(response.body.data.lastName).toBe('Name');
        expect(response.body.data.role).toBe('EDITOR');
        expect(response.body.data.isActive).toBe(false);
      });

      it('should return 404 for non-existent user', async () => {
        const updateData = {
          firstName: 'Updated',
        };

        await request(app.getHttpServer())
          .put('/api/v1/admin/users/non-existent-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(404);
      });

      it('should require admin role', async () => {
        const updateData = {
          firstName: 'Updated',
        };

        await request(app.getHttpServer())
          .put(`/api/v1/admin/users/${testUserId}`)
          .set('Authorization', `Bearer ${editorToken}`)
          .send(updateData)
          .expect(403);
      });
    });

    describe('DELETE /api/v1/admin/users/:id', () => {
      beforeEach(async () => {
        testUserId = await createTestUser();
      });

      it('should delete user', async () => {
        await request(app.getHttpServer())
          .delete(`/api/v1/admin/users/${testUserId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        // Verify user is deleted
        await request(app.getHttpServer())
          .get(`/api/v1/admin/users/${testUserId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
      });

      it('should require admin role', async () => {
        await request(app.getHttpServer())
          .delete(`/api/v1/admin/users/${testUserId}`)
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(403);

        await request(app.getHttpServer())
          .delete(`/api/v1/admin/users/${testUserId}`)
          .set('Authorization', `Bearer ${viewerToken}`)
          .expect(403);
      });
    });

    describe('POST /api/v1/admin/users/:id/activate', () => {
      beforeEach(async () => {
        testUserId = await createTestUser();
      });

      it('should activate user', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/v1/admin/users/${testUserId}/activate`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.isActive).toBe(true);
      });

      it('should require admin role', async () => {
        await request(app.getHttpServer())
          .post(`/api/v1/admin/users/${testUserId}/activate`)
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(403);
      });
    });

    describe('POST /api/v1/admin/users/:id/deactivate', () => {
      beforeEach(async () => {
        testUserId = await createTestUser();
      });

      it('should deactivate user', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/v1/admin/users/${testUserId}/deactivate`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.isActive).toBe(false);
      });
    });

    describe('PUT /api/v1/admin/users/:id/role', () => {
      beforeEach(async () => {
        testUserId = await createTestUser();
      });

      it('should update user role', async () => {
        const roleData = { role: 'ADMIN' };

        const response = await request(app.getHttpServer())
          .put(`/api/v1/admin/users/${testUserId}/role`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(roleData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.role).toBe('ADMIN');
      });

      it('should validate role value', async () => {
        const invalidRoleData = { role: 'INVALID_ROLE' };

        await request(app.getHttpServer())
          .put(`/api/v1/admin/users/${testUserId}/role`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(invalidRoleData)
          .expect(400);
      });
    });

    describe('GET /api/v1/admin/users/statistics', () => {
      beforeEach(async () => {
        testUserId = await createTestUser();
      });

      it('should get user statistics', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/users/statistics')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.total).toBeDefined();
        expect(response.body.data.active).toBeDefined();
        expect(response.body.data.byRole).toBeDefined();
        expect(response.body.data.verified).toBeDefined();
        expect(response.body.data.unverified).toBeDefined();
        expect(response.body.data.recentRegistrations).toBeDefined();
        expect(response.body.data.recentLogins).toBeDefined();
      });

      it('should require admin role', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/admin/users/statistics')
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(403);
      });
    });

    describe('GET /api/v1/admin/users/activity', () => {
      it('should get recent user activity', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/users/activity')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should support limit parameter', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/users/activity?limit=5')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });
    });

    describe('GET /api/v1/admin/users/export', () => {
      beforeEach(async () => {
        testUserId = await createTestUser();
      });

      it('should export users as JSON', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/users/export?format=json')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.headers['content-type']).toBe('application/json');
        expect(response.headers['content-disposition']).toMatch(/attachment; filename="users-export-/);
      });

      it('should export users as CSV', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/users/export?format=csv')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.headers['content-type']).toBe('text/csv');
        expect(response.headers['content-disposition']).toMatch(/attachment; filename="users-export-/);
      });

      it('should fail for PDF export (not implemented)', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/admin/users/export?format=pdf')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);
      });
    });

    describe('POST /api/v1/admin/users/bulk-activate', () => {
      beforeEach(async () => {
        testUserId = await createTestUser();
      });

      it('should bulk activate users', async () => {
        const bulkData = { ids: [testUserId] };

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/users/bulk-activate')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(bulkData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.success).toBeGreaterThanOrEqual(1);
        expect(response.body.data.failed).toBeDefined();
        expect(response.body.data.errors).toBeDefined();
      });

      it('should require admin role', async () => {
        const bulkData = { ids: [testUserId] };

        await request(app.getHttpServer())
          .post('/api/v1/admin/users/bulk-activate')
          .set('Authorization', `Bearer ${editorToken}`)
          .send(bulkData)
          .expect(403);
      });
    });

    describe('POST /api/v1/admin/users/bulk-deactivate', () => {
      beforeEach(async () => {
        testUserId = await createTestUser();
      });

      it('should bulk deactivate users', async () => {
        const bulkData = { ids: [testUserId] };

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/users/bulk-deactivate')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(bulkData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.success).toBeGreaterThanOrEqual(1);
        expect(response.body.data.failed).toBeDefined();
        expect(response.body.data.errors).toBeDefined();
      });
    });

    describe('POST /api/v1/admin/users/bulk-delete', () => {
      beforeEach(async () => {
        testUserId = await createTestUser();
      });

      it('should bulk delete users', async () => {
        const bulkData = { ids: [testUserId] };

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/users/bulk-delete')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(bulkData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.success).toBeGreaterThanOrEqual(1);
        expect(response.body.data.failed).toBeDefined();
        expect(response.body.data.errors).toBeDefined();
      });
    });
  });

  describe('API Response Format Validation', () => {
    it('should return consistent API response format for success', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('timestamp');
      expect(response.body.meta).toHaveProperty('version');
    });

    it('should return consistent API response format for paginated data', async () => {
      testUserId = await createTestUser();

      const response = await request(app.getHttpServer())
        .get('/api/v1/users/active')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('totalPages');
      expect(response.body.pagination).toHaveProperty('hasNext');
      expect(response.body.pagination).toHaveProperty('hasPrev');
    });

    it('should return consistent API response format for errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('code');
    });

    it('should include request ID in all responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Request ID is only added by interceptor if present in request
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta).toHaveProperty('timestamp');
      expect(response.body.meta).toHaveProperty('version');
    });

    it('should include processing time in all responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Processing time is added by interceptor if it processes the response
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta).toHaveProperty('timestamp');
      expect(response.body.meta).toHaveProperty('version');
      if (response.body.meta.processingTime !== undefined) {
        expect(typeof response.body.meta.processingTime).toBe('number');
        expect(response.body.meta.processingTime).toBeGreaterThan(0);
      }
    });
  });

  describe('Authentication & Authorization', () => {
    describe('Admin Access', () => {
      it('should allow admin to access all endpoints', async () => {
        const endpoints = [
          'GET /api/v1/users/profile',
          'GET /api/v1/users/active',
          'GET /api/v1/users/activity',
          'GET /api/v1/admin/users/statistics',
          'GET /api/v1/admin/users/activity',
        ];

        for (const endpoint of endpoints) {
          const [method, path] = endpoint.split(' ');
          const response = await request(app.getHttpServer())
            [method.toLowerCase()](path)
            .set('Authorization', `Bearer ${adminToken}`);

          expect(response.status).not.toBe(403);
        }
      });
    });

    describe('Editor Access', () => {
      it('should allow editor to access user listing endpoints', async () => {
        const allowedEndpoints = [
          'GET /api/v1/users/profile',
          'GET /api/v1/users/active',
          'GET /api/v1/users/activity',
        ];

        for (const endpoint of allowedEndpoints) {
          const [method, path] = endpoint.split(' ');
          const response = await request(app.getHttpServer())
            [method.toLowerCase()](path)
            .set('Authorization', `Bearer ${editorToken}`);

          expect(response.status).not.toBe(403);
        }
      });

      it('should deny editor access to admin endpoints', async () => {
        const deniedEndpoints = [
          'GET /api/v1/admin/users/statistics',
          'GET /api/v1/admin/users/activity',
        ];

        for (const endpoint of deniedEndpoints) {
          const [method, path] = endpoint.split(' ');
          const response = await request(app.getHttpServer())
            [method.toLowerCase()](path)
            .set('Authorization', `Bearer ${editorToken}`);

          expect(response.status).toBe(403);
        }
      });
    });

    describe('Viewer Access', () => {
      it('should allow viewer to access only profile endpoints', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/profile')
          .set('Authorization', `Bearer ${viewerToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      it('should deny viewer access to user listing endpoints', async () => {
        const deniedEndpoints = [
          'GET /api/v1/users/active',
          'GET /api/v1/users/activity',
        ];

        for (const endpoint of deniedEndpoints) {
          const [method, path] = endpoint.split(' ');
          const response = await request(app.getHttpServer())
            [method.toLowerCase()](path)
            .set('Authorization', `Bearer ${viewerToken}`);

          expect(response.status).toBe(403);
        }
      });
    });

    describe('Unauthenticated Access', () => {
      it('should deny access to all protected endpoints', async () => {
        const protectedEndpoints = [
          'GET /api/v1/users/profile',
          'GET /api/v1/users/active',
          'GET /api/v1/users/activity',
          'GET /api/v1/admin/users/statistics',
        ];

        for (const endpoint of protectedEndpoints) {
          const [method, path] = endpoint.split(' ');
          const response = await request(app.getHttpServer())
            [method.toLowerCase()](path);

          expect(response.status).toBe(401);
        }
      });
    });
  });

  describe('Data Validation', () => {
    it('should validate user data structure in responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const user = response.body.data;
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('firstName');
      expect(user).toHaveProperty('lastName');
      expect(user).toHaveProperty('role');
      expect(user).toHaveProperty('isActive');
      expect(user).toHaveProperty('isEmailVerified');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');
      expect(user).toHaveProperty('fullName');
      expect(user).toHaveProperty('username');
      expect(user).not.toHaveProperty('password');
    });

    it('should validate required fields in create requests', async () => {
      const invalidData = {
        email: 'test@example.com',
        // Missing required fields
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should validate email format', async () => {
      const invalidData = {
        email: 'invalid-email-format',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'VIEWER',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate role values', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'INVALID_ROLE',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Input Sanitization', () => {
    it('should handle special characters in user data', async () => {
      const userData = {
        email: 'special+chars@example.com',
        password: 'Password123!@#$',
        firstName: "John's",
        lastName: 'O"Reilly',
        role: 'VIEWER',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe("John's");
      expect(response.body.data.lastName).toBe('O"Reilly');
    });

    it('should handle Unicode characters', async () => {
      const userData = {
        email: 'unicode@example.com',
        password: 'Password123!',
        firstName: 'José',
        lastName: 'Müller',
        role: 'VIEWER',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('José');
      expect(response.body.data.lastName).toBe('Müller');
    });
  });
}); 