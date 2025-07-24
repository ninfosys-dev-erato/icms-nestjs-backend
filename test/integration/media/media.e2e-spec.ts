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
import { 
  CreateMediaDto, 
  UpdateMediaDto,
  CreateMediaAlbumDto,
  UpdateMediaAlbumDto,
  MediaType
} from '@/modules/media/dto/media.dto';

describe('Media Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminUser: any;
  let editorUser: any;
  let viewerUser: any;
  let adminToken: string;
  let editorToken: string;
  let viewerToken: string;
  let testMedia: any;
  let testAlbum: any;

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
    try {
      await createTestAlbum();
    } catch (error) {
      console.log('Album creation failed, continuing without album:', error.message);
    }
    try {
      await createTestMedia();
    } catch (error) {
      console.log('Media creation failed, continuing without media:', error.message);
    }
  });

  const cleanupDatabase = async () => {
    try {
      const tables = [
        'media_album_media',
        'media',
        'media_albums',
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
          email: 'admin@media.com',
          password: 'AdminPass123!',
          confirmPassword: 'AdminPass123!',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
        });

      if (adminResponse.status === 201 && adminResponse.body.success) {
        adminUser = adminResponse.body.data.user;
        adminToken = adminResponse.body.data.accessToken;
        console.log('Admin user created successfully:', adminUser.email);
        console.log('Admin token length:', adminToken?.length || 0);
      } else {
        console.error('Admin user creation failed:', adminResponse.body);
        throw new Error('Failed to create admin user');
      }

      // Create editor user
      const editorResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'editor@media.com',
          password: 'EditorPass123!',
          confirmPassword: 'EditorPass123!',
          firstName: 'Editor',
          lastName: 'User',
          role: 'EDITOR',
        });

      if (editorResponse.status === 201 && editorResponse.body.success) {
        editorUser = editorResponse.body.data.user;
        editorToken = editorResponse.body.data.accessToken;
        console.log('Editor user created successfully:', editorUser.email);
      } else {
        console.error('Editor user creation failed:', editorResponse.body);
        // Don't throw error, just log it and continue
        console.log('Continuing without editor user');
      }

      // Create viewer user
      const viewerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'viewer@media.com',
          password: 'ViewerPass123!',
          confirmPassword: 'ViewerPass123!',
          firstName: 'Viewer',
          lastName: 'User',
          role: 'VIEWER',
        });

      if (viewerResponse.status === 201 && viewerResponse.body.success) {
        viewerUser = viewerResponse.body.data.user;
        viewerToken = viewerResponse.body.data.accessToken;
        console.log('Viewer user created successfully:', viewerUser.email);
      } else {
        console.error('Viewer user creation failed:', viewerResponse.body);
        // Don't throw error, just log it and continue
        console.log('Continuing without viewer user');
      }
    } catch (error) {
      console.error('Error creating test users:', error);
      throw error;
    }
  };

  const createTestAlbum = async () => {
    try {
      const albumData: CreateMediaAlbumDto = {
        name: {
          en: 'Test Album',
          ne: 'परीक्षण एल्बम',
        },
        description: {
          en: 'Test album description',
          ne: 'परीक्षण एल्बम विवरण',
        },
        isActive: true,
      };

      console.log('Creating test album with token:', adminToken?.substring(0, 20) + '...');
      
      const albumResponse = await request(app.getHttpServer())
        .post('/api/v1/albums')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(albumData);

      console.log('Album creation response status:', albumResponse.status);
      console.log('Album creation response body:', albumResponse.body);

      if (albumResponse.status === 201 && albumResponse.body.success) {
        testAlbum = albumResponse.body.data;
        console.log('Test album created successfully:', testAlbum.id);
      } else {
        throw new Error('Failed to create test album');
      }
    } catch (error) {
      console.error('Error creating test album:', error);
      throw error;
    }
  };

  const createTestMedia = async () => {
    try {
      const testImagePath = path.join(__dirname, 'test-image.jpg');
      // Create a minimal valid JPEG file header
      const jpegHeader = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
        0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
        0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
        0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
        0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
        0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
        0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
        0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
        0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
        0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
        0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x8A, 0x00,
        0x07, 0xFF, 0xD9
      ]);
      
      // Create a test image file with valid JPEG header
      fs.writeFileSync(testImagePath, jpegHeader);

      console.log('Creating test media with token:', adminToken?.substring(0, 20) + '...');
      
      const mediaResponse = await request(app.getHttpServer())
        .post('/api/v1/admin/media/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', testImagePath)
        .field('altText[en]', 'Test Image')
        .field('altText[ne]', 'परीक्षण छवि')
        .field('caption[en]', 'Test image caption')
        .field('caption[ne]', 'परीक्षण छवि क्याप्शन')
        .field('isActive', 'true');

      console.log('Media creation response status:', mediaResponse.status);
      console.log('Media creation response body:', mediaResponse.body);

      if (mediaResponse.status === 201 && mediaResponse.body.success) {
        testMedia = mediaResponse.body.data;
        console.log('Test media created successfully:', testMedia.id);
      } else {
        throw new Error('Failed to create test media');
      }

      // Clean up test file
      fs.unlinkSync(testImagePath);
    } catch (error) {
      console.error('Error creating test media:', error);
      throw error;
    }
  };

  const createTestFile = (filename: string, content: string = 'test content'): Buffer => {
    return Buffer.from(content);
  };

  describe('Public Media Endpoints', () => {
    describe('GET /api/v1/media', () => {
      it('should get all media successfully', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/media')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBeGreaterThan(0);
        expect(response.body.data[0]).toHaveProperty('id');
        expect(response.body.data[0]).toHaveProperty('fileName');
        expect(response.body.data[0]).toHaveProperty('mediaType');
        expect(response.body.data[0]).toHaveProperty('isActive');
        expect(response.body.data[0].isActive).toBe(true);
      });

      it('should support pagination', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/media')
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
          .get('/api/v1/media?search=Test')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
      });

      it('should filter by media type', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/media?mediaType=IMAGE')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
        response.body.data.forEach((media: any) => {
          expect(media.mediaType).toBe('IMAGE');
        });
      });

      it('should filter by album', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/media?albumId=${testAlbum.id}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });
    });

    describe('GET /api/v1/media/type/:type', () => {
      it('should get media by type successfully', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/media/type/IMAGE')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        response.body.data.forEach((media: any) => {
          expect(media.mediaType).toBe('IMAGE');
        });
      });

      it('should return 200 even when no media found', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/media/type/VIDEO')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });
    });

    describe('GET /api/v1/media/search', () => {
      it('should search media successfully', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/media/search')
          .query({ q: 'Test' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBeGreaterThan(0);
      });

      it('should return empty array for non-matching search', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/media/search')
          .query({ q: 'NonExistentMedia' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBe(0);
      });
    });

    describe('GET /api/v1/media/images', () => {
      it('should get all images successfully', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/media/images')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        response.body.data.forEach((media: any) => {
          expect(media.mediaType).toBe('IMAGE');
        });
      });
    });

    describe('GET /api/v1/media/videos', () => {
      it('should get all videos successfully', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/media/videos')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        response.body.data.forEach((media: any) => {
          expect(media.mediaType).toBe('VIDEO');
        });
      });
    });

    describe('GET /api/v1/media/documents', () => {
      it('should get all documents successfully', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/media/documents')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        response.body.data.forEach((media: any) => {
          expect(media.mediaType).toBe('DOCUMENT');
        });
      });
    });

    describe('GET /api/v1/media/:id', () => {
      it('should get media by ID successfully', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/media/${testMedia.id}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(testMedia.id);
        expect(response.body.data.fileName).toBeDefined();
        expect(response.body.data.mediaType).toBeDefined();
      });

      it('should return 404 for non-existent media', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/media/non-existent-id')
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      });
    });

    describe('GET /api/v1/media/:id/url', () => {
      it('should get media URL successfully', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/media/${testMedia.id}/url`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.url).toBeDefined();
        expect(response.body.data.url).toContain('http');
      });

      it('should return 404 for non-existent media', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/media/non-existent-id/url')
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Public Album Endpoints', () => {
    describe('GET /api/v1/albums', () => {
      it('should get all albums successfully', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/albums')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBeGreaterThan(0);
        expect(response.body.data[0]).toHaveProperty('id');
        expect(response.body.data[0]).toHaveProperty('name');
        expect(response.body.data[0]).toHaveProperty('isActive');
      });

      it('should return only active albums', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/albums/active')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.every((album: any) => album.isActive)).toBe(true);
      });
    });

    describe('GET /api/v1/albums/:id', () => {
      it('should get album by ID successfully', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/albums/${testAlbum.id}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(testAlbum.id);
        expect(response.body.data.name).toBeDefined();
        expect(response.body.data.description).toBeDefined();
      });

      it('should return 404 for non-existent album', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/albums/non-existent-id')
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Admin Media Endpoints', () => {
    describe('GET /api/v1/admin/media', () => {
      it('should get all media for admin', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/media')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBeGreaterThan(0);
      });

      it('should require authentication', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/media')
          .expect(401);

        expect(response.body.success).toBe(false);
      });

      it('should require admin or editor role', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/media')
          .set('Authorization', `Bearer ${viewerToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
      });

      it('should support filtering by media type', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/media?mediaType=IMAGE')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        response.body.data.forEach((media: any) => {
          expect(media.mediaType).toBe('IMAGE');
        });
      });

      it('should support filtering by isActive', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/media')
          .query({ isActive: true })
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        response.body.data.forEach((media: any) => {
          expect(media.isActive).toBe(true);
        });
      });
    });

    describe('GET /api/v1/admin/media/statistics', () => {
      it('should get media statistics successfully', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/media/statistics')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('total');
        expect(response.body.data).toHaveProperty('byType');
        expect(response.body.data).toHaveProperty('totalSize');
        expect(response.body.data).toHaveProperty('averageSize');
      });
    });

    describe('GET /api/v1/admin/media/search', () => {
      it('should search media successfully', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/media/search')
          .query({ q: 'Test' })
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBeGreaterThan(0);
      });
    });

    describe('GET /api/v1/admin/media/:id', () => {
      it('should get media by ID successfully', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/admin/media/${testMedia.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(testMedia.id);
      });

      it('should return 404 for non-existent media', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/media/non-existent-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/v1/admin/media/upload', () => {
      it('should upload media successfully', async () => {
        const testImagePath = path.join(__dirname, 'upload-test-image.jpg');
        const testImageContent = Buffer.from('upload test image content');
        
        fs.writeFileSync(testImagePath, testImageContent);

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/media/upload')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', testImagePath)
          .field('altText[en]', 'Upload Test Image')
          .field('altText[ne]', 'अपलोड परीक्षण छवि')
          .field('caption[en]', 'Upload test image caption')
          .field('caption[ne]', 'अपलोड परीक्षण छवि क्याप्शन')
          .field('isActive', 'true')
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.altText.en).toBe('Upload Test Image');
        expect(response.body.data.mediaType).toBe('IMAGE');

        fs.unlinkSync(testImagePath);
      });

      it('should require file to be uploaded', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/media/upload')
          .set('Authorization', `Bearer ${adminToken}`)
          .field('altText[en]', 'Test Image')
          .field('isActive', 'true')
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('PUT /api/v1/admin/media/:id', () => {
      it('should update media successfully', async () => {
        const updateData: UpdateMediaDto = {
          altText: {
            en: 'Updated Test Image',
            ne: 'अपडेटेड परीक्षण छवि',
          },
          caption: {
            en: 'Updated caption',
            ne: 'अपडेटेड क्याप्शन',
          },
          isActive: true,
        };

        const response = await request(app.getHttpServer())
          .put(`/api/v1/admin/media/${testMedia.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.altText.en).toBe('Updated Test Image');
        expect(response.body.data.caption.en).toBe('Updated caption');
      });

      it('should return 404 for non-existent media', async () => {
        const response = await request(app.getHttpServer())
          .put('/api/v1/admin/media/non-existent-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            altText: { en: 'Updated Image', ne: 'अपडेटेड छवि' },
            isActive: true,
          })
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });

    describe('DELETE /api/v1/admin/media/:id', () => {
      it('should delete media successfully', async () => {
        // Create a media to delete
        const testImagePath = path.join(__dirname, 'delete-test-image.jpg');
        const testImageContent = Buffer.from('delete test image content');
        
        fs.writeFileSync(testImagePath, testImageContent);

        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/admin/media/upload')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', testImagePath)
          .field('altText[en]', 'Delete Test Image')
          .field('isActive', 'true')
          .expect(201);

        fs.unlinkSync(testImagePath);

        const mediaToDelete = createResponse.body.data;

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/admin/media/${mediaToDelete.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.message).toBe('Media deleted successfully');

        // Verify media is deleted
        const getResponse = await request(app.getHttpServer())
          .get(`/api/v1/admin/media/${mediaToDelete.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
      });

      it('should return 404 for non-existent media', async () => {
        const response = await request(app.getHttpServer())
          .delete('/api/v1/admin/media/non-existent-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
      });

      it('should require admin role', async () => {
        // Create a separate media for this test to avoid affecting other tests
        const testImagePath = path.join(__dirname, 'admin-role-test-image.jpg');
        const testImageContent = Buffer.from('admin role test image content');
        
        fs.writeFileSync(testImagePath, testImageContent);

        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/admin/media/upload')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', testImagePath)
          .field('altText[en]', 'Admin Role Test Image')
          .field('isActive', 'true')
          .expect(201);

        fs.unlinkSync(testImagePath);

        const mediaToTest = createResponse.body.data;

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/admin/media/${mediaToTest.id}`)
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/v1/admin/media/:id/process', () => {
      it('should process media successfully', async () => {
        const processOptions = {
          resize: {
            width: 800,
            height: 600,
            quality: 80,
          },
          optimize: true,
          generateThumbnail: true,
        };

        const response = await request(app.getHttpServer())
          .post(`/api/v1/admin/media/${testMedia.id}/process`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(processOptions)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(testMedia.id);
      });

      it('should return 404 for non-existent media', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/media/non-existent-id/process')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ optimize: true })
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/v1/admin/media/bulk-delete', () => {
      it('should bulk delete media successfully', async () => {
        // Create media to delete
        const testImagePath = path.join(__dirname, 'bulk-delete-test-image.jpg');
        const testImageContent = Buffer.from('bulk delete test image content');
        
        fs.writeFileSync(testImagePath, testImageContent);

        const createResponse1 = await request(app.getHttpServer())
          .post('/api/v1/admin/media/upload')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', testImagePath)
          .field('altText[en]', 'Bulk Delete Test Image 1')
          .field('isActive', 'true')
          .expect(201);

        const createResponse2 = await request(app.getHttpServer())
          .post('/api/v1/admin/media/upload')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', testImagePath)
          .field('altText[en]', 'Bulk Delete Test Image 2')
          .field('isActive', 'true')
          .expect(201);

        fs.unlinkSync(testImagePath);

        const mediaToDelete = [createResponse1.body.data.id, createResponse2.body.data.id];

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/media/bulk-delete')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ ids: mediaToDelete })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.success).toBe(2);
        expect(response.body.data.failed).toBe(0);
      });

      it('should require admin role', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/media/bulk-delete')
          .set('Authorization', `Bearer ${editorToken}`)
          .send({ ids: ['test-id'] })
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });

    describe('PUT /api/v1/admin/media/bulk-update', () => {
      it('should bulk update media successfully', async () => {
        // Create media to update
        const testImagePath = path.join(__dirname, 'bulk-update-test-image.jpg');
        const testImageContent = Buffer.from('bulk update test image content');
        
        fs.writeFileSync(testImagePath, testImageContent);

        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/admin/media/upload')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', testImagePath)
          .field('altText[en]', 'Bulk Update Test Image')
          .field('isActive', 'true')
          .expect(201);

        fs.unlinkSync(testImagePath);

        const mediaToUpdate = createResponse.body.data;

        const updateData = {
          ids: [mediaToUpdate.id],
          updates: {
            altText: {
              en: 'Bulk Updated Test Image',
              ne: 'बल्क अपडेटेड परीक्षण छवि',
            },
            isActive: false,
          }
        };

        const response = await request(app.getHttpServer())
          .put('/api/v1/admin/media/bulk-update')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.success).toBe(1);
        expect(response.body.data.failed).toBe(0);
      });

      it('should require admin or editor role', async () => {
        const response = await request(app.getHttpServer())
          .put('/api/v1/admin/media/bulk-update')
          .set('Authorization', `Bearer ${viewerToken}`)
          .send({ ids: ['test-id'], updates: {} })
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/v1/admin/media/bulk-create', () => {
      it('should bulk create media successfully', async () => {
        const bulkCreateData = {
          media: [
            {
              fileName: 'bulk-test-1.jpg',
              originalName: 'bulk-test-1.jpg',
              filePath: 'uploads/images/bulk-test-1.jpg',
              fileSize: 1024000,
              mimeType: 'image/jpeg',
              mediaType: MediaType.IMAGE,
              altText: {
                en: 'Bulk Test Image 1',
                ne: 'बल्क परीक्षण छवि १',
              },
              isActive: true,
            },
            {
              fileName: 'bulk-test-2.jpg',
              originalName: 'bulk-test-2.jpg',
              filePath: 'uploads/images/bulk-test-2.jpg',
              fileSize: 1024000,
              mimeType: 'image/jpeg',
              mediaType: MediaType.IMAGE,
              altText: {
                en: 'Bulk Test Image 2',
                ne: 'बल्क परीक्षण छवि २',
              },
              isActive: true,
            },
          ],
        };

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/media/bulk-create')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(bulkCreateData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBe(2);
        expect(response.body.data.every((media: any) => media.id)).toBe(true);
      });

      it('should require admin or editor role', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/media/bulk-create')
          .set('Authorization', `Bearer ${viewerToken}`)
          .send({ media: [] })
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Admin Album Endpoints', () => {
    describe('POST /api/v1/albums', () => {
      it('should create album successfully', async () => {
        const albumData: CreateMediaAlbumDto = {
          name: {
            en: 'New Test Album',
            ne: 'नयाँ परीक्षण एल्बम',
          },
          description: {
            en: 'New test album description',
            ne: 'नयाँ परीक्षण एल्बम विवरण',
          },
          isActive: true,
        };

        const response = await request(app.getHttpServer())
          .post('/api/v1/albums')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(albumData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name.en).toBe('New Test Album');
        expect(response.body.data.isActive).toBe(true);
      });

      it('should require authentication', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/albums')
          .send({
            name: { en: 'Test Album', ne: 'परीक्षण एल्बम' },
            isActive: true,
          })
          .expect(401);

        expect(response.body.success).toBe(false);
      });
    });

    describe('PUT /api/v1/albums/:id', () => {
      it('should update album successfully', async () => {
        const updateData: UpdateMediaAlbumDto = {
          name: {
            en: 'Updated Test Album',
            ne: 'अपडेटेड परीक्षण एल्बम',
          },
          description: {
            en: 'Updated description',
            ne: 'अपडेटेड विवरण',
          },
          isActive: false,
        };

        const response = await request(app.getHttpServer())
          .put(`/api/v1/albums/${testAlbum.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name.en).toBe('Updated Test Album');
        expect(response.body.data.isActive).toBe(false);
      });

      it('should return 404 for non-existent album', async () => {
        const response = await request(app.getHttpServer())
          .put('/api/v1/albums/non-existent-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: { en: 'Updated Album', ne: 'अपडेटेड एल्बम' },
          })
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });

    describe('DELETE /api/v1/albums/:id', () => {
      it('should delete album successfully', async () => {
        // Create an album to delete
        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/albums')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: { en: 'Delete Test Album', ne: 'मेटाउन परीक्षण एल्बम' },
            isActive: true,
          })
          .expect(201);

        const albumToDelete = createResponse.body.data;

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/albums/${albumToDelete.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.message).toBe('Album deleted successfully');

        // Verify album is deleted
        const getResponse = await request(app.getHttpServer())
          .get(`/api/v1/albums/${albumToDelete.id}`)
          .expect(404);
      });

      it('should return 404 for non-existent album', async () => {
        const response = await request(app.getHttpServer())
          .delete('/api/v1/albums/non-existent-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
      });

      it('should require admin role', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/albums/${testAlbum.id}`)
          .set('Authorization', `Bearer ${editorToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/v1/albums/:albumId/media/:mediaId', () => {
      it('should add media to album successfully', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/v1/albums/${testAlbum.id}/media/${testMedia.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.message).toBe('Media added to album successfully');
      });

      it('should return 404 for non-existent album', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/v1/albums/non-existent-id/media/${testMedia.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
      });

      it('should return 404 for non-existent media', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/v1/albums/${testAlbum.id}/media/non-existent-id`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });

    describe('DELETE /api/v1/albums/:albumId/media/:mediaId', () => {
      it('should remove media from album successfully', async () => {
        // First add media to album
        await request(app.getHttpServer())
          .post(`/api/v1/albums/${testAlbum.id}/media/${testMedia.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        // Then remove it
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/albums/${testAlbum.id}/media/${testMedia.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.message).toBe('Media removed from album successfully');
      });
    });

    describe('PUT /api/v1/albums/:albumId/reorder', () => {
      it('should reorder media in album successfully', async () => {
        // First add media to album
        await request(app.getHttpServer())
          .post(`/api/v1/albums/${testAlbum.id}/media/${testMedia.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        const response = await request(app.getHttpServer())
          .put(`/api/v1/albums/${testAlbum.id}/reorder`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ mediaIds: [testMedia.id] })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.message).toBe('Media reordered successfully');
      });
    });

    describe('GET /api/v1/albums/:id/export', () => {
      it('should export album successfully', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/albums/${testAlbum.id}/export`)
          .query({ format: 'json' })
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.headers['content-type']).toContain('application/json');
        expect(response.headers['content-disposition']).toContain('attachment');
      });

      it('should require admin or editor role', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/albums/${testAlbum.id}/export`)
          .set('Authorization', `Bearer ${viewerToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/v1/albums/admin/statistics', () => {
      it('should get album statistics successfully', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/albums/admin/statistics')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('total');
        expect(response.body.data).toHaveProperty('active');
        expect(response.body.data).toHaveProperty('withMedia');
        expect(response.body.data).toHaveProperty('averageMediaPerAlbum');
      });

      it('should require admin or editor role', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/albums/admin/statistics')
          .set('Authorization', `Bearer ${viewerToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication for admin endpoints', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/media')
        .expect(401);
    });

    it('should accept valid JWT token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/media')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should reject invalid JWT token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/media')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Validation', () => {
    it('should validate required fields for media upload', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/media/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('altText[en]', '') // Empty string
        .field('isActive', 'true')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate required fields for album creation', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/albums')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: { en: '', ne: '' }, // Empty strings
          isActive: true,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent resources', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/media/non-existent-id')
        .expect(404);

      await request(app.getHttpServer())
        .get('/api/v1/admin/media/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 400 for invalid request data', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/media/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('should return 401 for unauthorized access', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/media/upload')
        .expect(401);
    });
  });
}); 