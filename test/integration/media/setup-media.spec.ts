import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/database/prisma.service';
import { MediaType } from '../../../src/modules/media/entities/media.entity';

describe('Media Module Setup', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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

  describe('Database Connectivity', () => {
    it('should connect to database successfully', async () => {
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      expect(result).toEqual([{ test: 1 }]);
    });

    it('should have required tables', async () => {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('media', 'media_albums', 'media_album_media', 'users')
      `;
      
      const tableNames = (tables as any[]).map(t => t.table_name);
      expect(tableNames).toContain('media');
      expect(tableNames).toContain('media_albums');
      expect(tableNames).toContain('media_album_media');
      expect(tableNames).toContain('users');
    });
  });

  describe('Schema Validation', () => {
    it('should create and query test data', async () => {
      // Create test user
      const testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: 'hashedpassword',
          firstName: 'Test',
          lastName: 'User',
          role: 'ADMIN',
        },
      });

      expect(testUser).toBeDefined();
      expect(testUser.email).toBe('test@example.com');

      // Create test album
      const testAlbum = await prisma.mediaAlbum.create({
        data: {
          name: { en: 'Test Album', ne: 'परीक्षण एल्बम' },
          description: { en: 'Test Description', ne: 'परीक्षण विवरण' },
          isActive: true,
        },
      });

      expect(testAlbum).toBeDefined();
      expect((testAlbum.name as any).en).toBe('Test Album');

      // Create test media
      const testMedia = await prisma.media.create({
        data: {
          fileName: 'test.jpg',
          originalName: 'test.jpg',
          filePath: 'uploads/test.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          mediaType: MediaType.IMAGE,
          altText: { en: 'Test Image', ne: 'परीक्षण छवि' },
          isActive: true,
        },
      });

      expect(testMedia).toBeDefined();
      expect(testMedia.fileName).toBe('test.jpg');
      expect(testMedia.mediaType).toBe(MediaType.IMAGE);

      // Create media-album relationship
      const albumMedia = await prisma.mediaAlbumMedia.create({
        data: {
          mediaAlbumId: testAlbum.id,
          mediaId: testMedia.id,
        },
      });

      expect(albumMedia).toBeDefined();
      expect(albumMedia.mediaAlbumId).toBe(testAlbum.id);
      expect(albumMedia.mediaId).toBe(testMedia.id);
    });

    it('should perform complex queries', async () => {
      // Query album with media
      const albumWithMedia = await prisma.mediaAlbum.findFirst({
        where: { isActive: true },
        include: {
          media: {
            include: {
              media: true,
            },
          },
        },
      });

      expect(albumWithMedia).toBeDefined();
      expect(albumWithMedia.media).toBeDefined();
      expect(albumWithMedia.media.length).toBeGreaterThan(0);

      // Query media with albums
      const mediaWithAlbums = await prisma.media.findFirst({
        where: { isActive: true },
        include: {
          albums: {
            include: {
              mediaAlbum: true,
            },
          },
        },
      });

      expect(mediaWithAlbums).toBeDefined();
      expect(mediaWithAlbums.albums).toBeDefined();
      expect(mediaWithAlbums.albums.length).toBeGreaterThan(0);
    });
  });

  describe('Data Relationships', () => {
    it('should maintain referential integrity', async () => {
      // Create test data
      const testAlbum = await prisma.mediaAlbum.create({
        data: {
          name: { en: 'Integrity Test Album', ne: 'अखंडता परीक्षण एल्बम' },
          isActive: true,
        },
      });

      const testMedia = await prisma.media.create({
        data: {
          fileName: 'integrity-test.jpg',
          originalName: 'integrity-test.jpg',
          filePath: 'uploads/integrity-test.jpg',
          fileSize: 2048,
          mimeType: 'image/jpeg',
          mediaType: MediaType.IMAGE,
          altText: { en: 'Integrity Test Image', ne: 'अखंडता परीक्षण छवि' },
          isActive: true,
        },
      });

      // Create relationship
      await prisma.mediaAlbumMedia.create({
        data: {
          mediaAlbumId: testAlbum.id,
          mediaId: testMedia.id,
        },
      });

      // Verify relationship exists
      const relationship = await prisma.mediaAlbumMedia.findFirst({
        where: {
          mediaAlbumId: testAlbum.id,
          mediaId: testMedia.id,
        },
      });

      expect(relationship).toBeDefined();
      expect(relationship.mediaAlbumId).toBe(testAlbum.id);
      expect(relationship.mediaId).toBe(testMedia.id);

      // Test cascade delete (if implemented)
      await prisma.media.delete({
        where: { id: testMedia.id },
      });

      // Verify relationship is deleted
      const deletedRelationship = await prisma.mediaAlbumMedia.findFirst({
        where: {
          mediaAlbumId: testAlbum.id,
          mediaId: testMedia.id,
        },
      });

      expect(deletedRelationship).toBeNull();
    });
  });

  describe('Transactions', () => {
    it('should handle transactions correctly', async () => {
      const result = await prisma.$transaction(async (tx) => {
        // Create album
        const album = await tx.mediaAlbum.create({
          data: {
            name: { en: 'Transaction Test Album', ne: 'लेन-देन परीक्षण एल्बम' },
            isActive: true,
          },
        });

        // Create media
        const media = await tx.media.create({
          data: {
            fileName: 'transaction-test.jpg',
            originalName: 'transaction-test.jpg',
            filePath: 'uploads/transaction-test.jpg',
            fileSize: 3072,
            mimeType: 'image/jpeg',
            mediaType: MediaType.IMAGE,
            altText: { en: 'Transaction Test Image', ne: 'लेन-देन परीक्षण छवि' },
            isActive: true,
          },
        });

        // Create relationship
        const albumMedia = await tx.mediaAlbumMedia.create({
          data: {
            mediaAlbumId: album.id,
            mediaId: media.id,
          },
        });

        return { album, media, albumMedia };
      });

      expect(result.album).toBeDefined();
      expect(result.media).toBeDefined();
      expect(result.albumMedia).toBeDefined();
      expect(result.albumMedia.mediaAlbumId).toBe(result.album.id);
      expect(result.albumMedia.mediaId).toBe(result.media.id);
    });
  });

  describe('Data Updates', () => {
    it('should update media data correctly', async () => {
      // Create test media
      const testMedia = await prisma.media.create({
        data: {
          fileName: 'update-test.jpg',
          originalName: 'update-test.jpg',
          filePath: 'uploads/update-test.jpg',
          fileSize: 4096,
          mimeType: 'image/jpeg',
          mediaType: MediaType.IMAGE,
          altText: { en: 'Update Test Image', ne: 'अपडेट परीक्षण छवि' },
          isActive: true,
        },
      });

      // Update media
      const updatedMedia = await prisma.media.update({
        where: { id: testMedia.id },
        data: {
          altText: { en: 'Updated Test Image', ne: 'अपडेटेड परीक्षण छवि' },
          isActive: false,
        },
      });

      expect(updatedMedia.id).toBe(testMedia.id);
      expect((updatedMedia.altText as any).en).toBe('Updated Test Image');
      expect(updatedMedia.isActive).toBe(false);
    });

    it('should handle bulk operations', async () => {
      // Create multiple media items
      const mediaItems = await Promise.all([
        prisma.media.create({
          data: {
            fileName: 'bulk-test-1.jpg',
            originalName: 'bulk-test-1.jpg',
            filePath: 'uploads/bulk-test-1.jpg',
            fileSize: 1024,
            mimeType: 'image/jpeg',
            mediaType: MediaType.IMAGE,
            altText: { en: 'Bulk Test 1', ne: 'बल्क परीक्षण १' },
            isActive: true,
          },
        }),
        prisma.media.create({
          data: {
            fileName: 'bulk-test-2.jpg',
            originalName: 'bulk-test-2.jpg',
            filePath: 'uploads/bulk-test-2.jpg',
            fileSize: 2048,
            mimeType: 'image/jpeg',
            mediaType: MediaType.IMAGE,
            altText: { en: 'Bulk Test 2', ne: 'बल्क परीक्षण २' },
            isActive: true,
          },
        }),
      ]);

      expect(mediaItems).toHaveLength(2);

      // Bulk update
      const updateResult = await prisma.media.updateMany({
        where: {
          fileName: {
            in: ['bulk-test-1.jpg', 'bulk-test-2.jpg'],
          },
        },
        data: {
          isActive: false,
        },
      });

      expect(updateResult.count).toBe(2);

      // Verify updates
      const updatedItems = await prisma.media.findMany({
        where: {
          fileName: {
            in: ['bulk-test-1.jpg', 'bulk-test-2.jpg'],
          },
        },
      });

      expect(updatedItems).toHaveLength(2);
      updatedItems.forEach(item => {
        expect(item.isActive).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid foreign key references', async () => {
      // Try to create relationship with non-existent IDs
      await expect(
        prisma.mediaAlbumMedia.create({
          data: {
            mediaAlbumId: 'non-existent-album-id',
            mediaId: 'non-existent-media-id',
          },
        })
      ).rejects.toThrow();
    });

    it('should handle unique constraint violations', async () => {
      // Create test data
      const testAlbum = await prisma.mediaAlbum.create({
        data: {
          name: { en: 'Unique Test Album', ne: 'अद्वितीय परीक्षण एल्बम' },
          isActive: true,
        },
      });

      const testMedia = await prisma.media.create({
        data: {
          fileName: 'unique-test.jpg',
          originalName: 'unique-test.jpg',
          filePath: 'uploads/unique-test.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          mediaType: MediaType.IMAGE,
          altText: { en: 'Unique Test Image', ne: 'अद्वितीय परीक्षण छवि' },
          isActive: true,
        },
      });

      // Create first relationship
      await prisma.mediaAlbumMedia.create({
        data: {
          mediaAlbumId: testAlbum.id,
          mediaId: testMedia.id,
        },
      });

      // Try to create duplicate relationship
      await expect(
        prisma.mediaAlbumMedia.create({
          data: {
            mediaAlbumId: testAlbum.id,
            mediaId: testMedia.id,
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('Module Dependencies', () => {
    it('should have proper dependency injection', async () => {
      // This test verifies that the module can be instantiated
      // and all dependencies are properly injected
      expect(app).toBeDefined();
      expect(prisma).toBeDefined();
    });
  });
}); 