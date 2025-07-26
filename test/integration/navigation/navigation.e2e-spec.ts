import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/database/prisma.service';
import { HttpExceptionFilter } from '../../../src/common/filters/http-exception.filter';
import { ApiResponseInterceptor } from '../../../src/common/interceptors/api-response.interceptor';
import { MenuLocation } from '@prisma/client';
import { MenuItemType } from '@prisma/client';

describe('Navigation Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let adminToken: string;
  let editorToken: string;
  let viewerToken: string;
  let testMenuId: string;
  let testMenuItemId: string;

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
    testMenuId = await createTestMenu();
  });

  const cleanupDatabase = async () => {
    try {
      const tables = [
        'menu_items',
        'menus',
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
          email: 'admin@navigation.com',
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
          email: 'editor@navigation.com',
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
          email: 'viewer@navigation.com',
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

  const createTestMenu = async () => {
    const menuData = {
      name: { en: 'Test Menu', ne: 'परीक्षण मेनु' },
      description: { en: 'Test Description', ne: 'परीक्षण विवरण' },
      location: MenuLocation.HEADER,
      isActive: true,
      isPublished: false,
    };

    console.log('Creating menu with data:', JSON.stringify(menuData, null, 2));

    const response = await request(app.getHttpServer())
      .post('/api/v1/admin/menus')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(menuData);

    console.log('Menu creation response status:', response.status);
    console.log('Menu creation response body:', JSON.stringify(response.body, null, 2));

    if (response.status !== 201) {
      throw new Error(`Menu creation failed with status ${response.status}: ${JSON.stringify(response.body)}`);
    }

    return response.body.data.id;
  };

  const createTestMenuItem = async (menuId: string) => {
    const menuItemData = {
      menuId,
      title: { en: 'Test Item', ne: 'परीक्षण आइटम' },
      description: { en: 'Test Description', ne: 'परीक्षण विवरण' },
      url: '/test',
      target: 'self',
      icon: 'test-icon',
      order: 1,
      isActive: true,
      isPublished: true,
      itemType: MenuItemType.LINK,
    };

    const response = await request(app.getHttpServer())
      .post('/api/v1/admin/menu-items')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(menuItemData);

    return response.body.data.id;
  };

  describe('Public Menu Endpoints', () => {
    beforeEach(async () => {
      testMenuId = await createTestMenu();
    });

    describe('GET /api/v1/menus', () => {
      it('should get all published menus', async () => {
        // First publish the menu
        await request(app.getHttpServer())
          .post(`/api/v1/admin/menus/${testMenuId}/publish`)
          .set('Authorization', `Bearer ${adminToken}`);

        const response = await request(app.getHttpServer())
          .get('/api/v1/menus')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should get menus with pagination', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/menus?page=1&limit=10')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.pagination).toBeDefined();
      });
    });

    describe('GET /api/v1/menus/:id', () => {
      it('should get menu by ID', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/menus/${testMenuId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(testMenuId);
        expect(response.body.data.name.en).toBe('Test Menu');
      });

      it('should return 404 for non-existent menu', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/menus/non-existent-id')
          .expect(404);
      });
    });

    describe('GET /api/v1/menus/location/:location', () => {
      it('should get menu by location', async () => {
        // First publish the menu
        await request(app.getHttpServer())
          .post(`/api/v1/admin/menus/${testMenuId}/publish`)
          .set('Authorization', `Bearer ${adminToken}`);

        const response = await request(app.getHttpServer())
          .get(`/api/v1/menus/location/${MenuLocation.HEADER}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.location).toBe(MenuLocation.HEADER);
      });

      it('should return 404 for non-existent location', async () => {
        await request(app.getHttpServer())
          .get(`/api/v1/menus/location/${MenuLocation.SIDEBAR}`)
          .expect(404);
      });
    });

    describe('GET /api/v1/menus/:id/tree', () => {
      it('should get menu tree', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/menus/${testMenuId}/tree`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.menu).toBeDefined();
        expect(response.body.data.items).toBeDefined();
      });
    });
  });

  describe('Public Menu Item Endpoints', () => {
    beforeEach(async () => {
      testMenuId = await createTestMenu();
      testMenuItemId = await createTestMenuItem(testMenuId);
    });

    describe('GET /api/v1/menu-items', () => {
      it('should get all published menu items', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/menu-items')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should get menu items with pagination', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/menu-items?page=1&limit=10')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.pagination).toBeDefined();
      });
    });

    describe('GET /api/v1/menu-items/:id', () => {
      it('should get menu item by ID', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/menu-items/${testMenuItemId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(testMenuItemId);
        expect(response.body.data.title.en).toBe('Test Item');
      });

      it('should return 404 for non-existent menu item', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/menu-items/non-existent-id')
          .expect(404);
      });
    });

    describe('GET /api/v1/menu-items/menu/:menuId', () => {
      it('should get menu items by menu', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/menu-items/menu/${testMenuId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    describe('GET /api/v1/menu-items/:itemId/breadcrumb', () => {
      it('should get breadcrumb for menu item', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/menu-items/${testMenuItemId}/breadcrumb`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    describe('GET /api/v1/menu-items/search', () => {
      it('should search menu items', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/menu-items/search?q=test')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });
  });

  describe('Admin Menu Endpoints', () => {
    describe('POST /api/v1/admin/menus', () => {
      it('should create menu', async () => {
        const menuData = {
          name: { en: 'Admin Test Menu', ne: 'एडमिन परीक्षण मेनु' },
          description: { en: 'Admin Test Description', ne: 'एडमिन परीक्षण विवरण' },
          location: MenuLocation.FOOTER,
          isActive: true,
          isPublished: false,
        };

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/menus')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(menuData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name.en).toBe('Admin Test Menu');
        expect(response.body.data.location).toBe(MenuLocation.FOOTER);
      });

      it('should require authentication', async () => {
        const menuData = {
          name: { en: 'Test Menu', ne: 'परीक्षण मेनु' },
          location: MenuLocation.HEADER,
        };

        await request(app.getHttpServer())
          .post('/api/v1/admin/menus')
          .send(menuData)
          .expect(401);
      });

      it('should require admin role', async () => {
        const menuData = {
          name: { en: 'Test Menu', ne: 'परीक्षण मेनु' },
          location: MenuLocation.HEADER,
        };

        await request(app.getHttpServer())
          .post('/api/v1/admin/menus')
          .set('Authorization', `Bearer ${viewerToken}`)
          .send(menuData)
          .expect(403);
      });
    });

    describe('PUT /api/v1/admin/menus/:id', () => {
      it('should update menu', async () => {
        const menuId = await createTestMenu();
        const updateData = {
          name: { en: 'Updated Test Menu', ne: 'अपडेटेड परीक्षण मेनु' },
          isPublished: true,
        };

        const response = await request(app.getHttpServer())
          .put(`/api/v1/admin/menus/${menuId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name.en).toBe('Updated Test Menu');
        expect(response.body.data.isPublished).toBe(true);
      });
    });

    describe('DELETE /api/v1/admin/menus/:id', () => {
      it('should delete menu', async () => {
        const menuId = await createTestMenu();

        await request(app.getHttpServer())
          .delete(`/api/v1/admin/menus/${menuId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        // Verify menu is deleted
        await request(app.getHttpServer())
          .get(`/api/v1/menus/${menuId}`)
          .expect(404);
      });
    });

    describe('POST /api/v1/admin/menus/:id/publish', () => {
      it('should publish menu', async () => {
        const menuId = await createTestMenu();

        const response = await request(app.getHttpServer())
          .post(`/api/v1/admin/menus/${menuId}/publish`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.isPublished).toBe(true);
      });
    });

    describe('POST /api/v1/admin/menus/:id/unpublish', () => {
      it('should unpublish menu', async () => {
        const menuId = await createTestMenu();

        // First publish the menu
        await request(app.getHttpServer())
          .post(`/api/v1/admin/menus/${menuId}/publish`)
          .set('Authorization', `Bearer ${adminToken}`);

        const response = await request(app.getHttpServer())
          .post(`/api/v1/admin/menus/${menuId}/unpublish`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.isPublished).toBe(false);
      });
    });

    describe('GET /api/v1/admin/menus/statistics', () => {
      it('should get menu statistics', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/menus/statistics')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.total).toBeDefined();
        expect(response.body.data.active).toBeDefined();
        expect(response.body.data.published).toBeDefined();
      });
    });
  });

  describe('Admin Menu Item Endpoints', () => {
    beforeEach(async () => {
      testMenuId = await createTestMenu();
    });

    describe('POST /api/v1/admin/menu-items', () => {
      it('should create menu item', async () => {
        const menuItemData = {
          menuId: testMenuId,
          title: { en: 'Admin Test Item', ne: 'एडमिन परीक्षण आइटम' },
          description: { en: 'Admin Test Description', ne: 'एडमिन परीक्षण विवरण' },
          url: '/admin-test',
          target: '_blank',
          icon: 'admin-icon',
          order: 1,
          isActive: true,
          isPublished: true,
          itemType: MenuItemType.LINK,
        };

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/menu-items')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(menuItemData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.title.en).toBe('Admin Test Item');
        expect(response.body.data.target).toBe('_blank');
      });
    });

    describe('PUT /api/v1/admin/menu-items/:id', () => {
      it('should update menu item', async () => {
        const menuItemId = await createTestMenuItem(testMenuId);
        const updateData = {
          title: { en: 'Updated Test Item', ne: 'अपडेटेड परीक्षण आइटम' },
          isPublished: false,
        };

        const response = await request(app.getHttpServer())
          .put(`/api/v1/admin/menu-items/${menuItemId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.title.en).toBe('Updated Test Item');
        expect(response.body.data.isPublished).toBe(false);
      });
    });

    describe('DELETE /api/v1/admin/menu-items/:id', () => {
      it('should delete menu item', async () => {
        const menuItemId = await createTestMenuItem(testMenuId);

        await request(app.getHttpServer())
          .delete(`/api/v1/admin/menu-items/${menuItemId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        // Verify menu item is deleted
        await request(app.getHttpServer())
          .get(`/api/v1/menu-items/${menuItemId}`)
          .expect(404);
      });
    });

    describe('PUT /api/v1/admin/menu-items/reorder', () => {
      it('should reorder menu items', async () => {
        const menuItem1Id = await createTestMenuItem(testMenuId);
        const menuItem2Id = await createTestMenuItem(testMenuId);

        const reorderData = [
          { id: menuItem2Id, order: 1 },
          { id: menuItem1Id, order: 2 },
        ];

        const response = await request(app.getHttpServer())
          .put('/api/v1/admin/menu-items/reorder')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(reorderData)
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });

    describe('GET /api/v1/admin/menu-items/statistics', () => {
      it('should get menu item statistics', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/menu-items/statistics')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.total).toBeDefined();
        expect(response.body.data.active).toBeDefined();
        expect(response.body.data.published).toBeDefined();
      });
    });
  });

  describe('Bulk Operations', () => {
    beforeEach(async () => {
      testMenuId = await createTestMenu();
    });

    describe('POST /api/v1/admin/menus/bulk-publish', () => {
      it('should bulk publish menus', async () => {
        const menuId2 = await createTestMenu();

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/menus/bulk-publish')
          .set('Authorization', `Bearer ${adminToken}`)
          .send([testMenuId, menuId2])
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.success).toBe(2);
      });
    });

    describe('POST /api/v1/admin/menus/bulk-unpublish', () => {
      it('should bulk unpublish menus', async () => {
        const menuId2 = await createTestMenu();

        // First publish the menus
        await request(app.getHttpServer())
          .post('/api/v1/admin/menus/bulk-publish')
          .set('Authorization', `Bearer ${adminToken}`)
          .send([testMenuId, menuId2]);

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/menus/bulk-unpublish')
          .set('Authorization', `Bearer ${adminToken}`)
          .send([testMenuId, menuId2])
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.success).toBe(2);
      });
    });

    describe('DELETE /api/v1/admin/menus/bulk-delete', () => {
      it('should bulk delete menus', async () => {
        const menuId2 = await createTestMenu();

        const response = await request(app.getHttpServer())
          .delete('/api/v1/admin/menus/bulk-delete')
          .set('Authorization', `Bearer ${adminToken}`)
          .send([testMenuId, menuId2])
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.success).toBe(2);
      });
    });
  });

  describe('Export/Import Operations', () => {
    beforeEach(async () => {
      testMenuId = await createTestMenu();
    });

    describe('GET /api/v1/admin/menus/export', () => {
      it('should export menus as JSON', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/menus/export?format=json')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });

      it('should return error for unsupported format', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/admin/menus/export?format=csv')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);
      });
    });

    describe('GET /api/v1/admin/menu-items/export', () => {
      it('should export menu items as JSON', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/menu-items/export?format=json')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });
    });
  });
}); 