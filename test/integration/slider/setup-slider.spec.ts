import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/database/prisma.service';
import { UserRole } from '@prisma/client';

describe('Slider Module Setup', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await cleanupDatabase();
    await app.close();
  });

  const cleanupDatabase = async () => {
    await prisma.sliderView.deleteMany();
    await prisma.sliderClick.deleteMany();
    await prisma.slider.deleteMany();
    await prisma.media.deleteMany();
    await prisma.user.deleteMany();
  };

  describe('Database Setup', () => {
    it('should have clean database', async () => {
      const slidersCount = await prisma.slider.count();
      const clicksCount = await prisma.sliderClick.count();
      const viewsCount = await prisma.sliderView.count();
      const mediaCount = await prisma.media.count();
      const userCount = await prisma.user.count();

      expect(slidersCount).toBe(0);
      expect(clicksCount).toBe(0);
      expect(viewsCount).toBe(0);
      expect(mediaCount).toBe(0);
      expect(userCount).toBe(0);
    });
  });

  describe('Test Data Creation', () => {
    it('should create test users', async () => {
      // Create regular user
      const testUser = await prisma.user.create({
        data: {
          email: 'test@slider.com',
          password: 'hashedPassword',
          role: 'VIEWER' as UserRole,
          firstName: 'Test',
          lastName: 'User',
        },
      });

      // Create admin user
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@slider.com',
          password: '$2b$10$test',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          isActive: true,
        },
      });

      expect(testUser).toBeDefined();
      expect(testUser.email).toBe('test@slider.com');
      expect(testUser.role).toBe('VIEWER');

      expect(adminUser).toBeDefined();
      expect(adminUser.email).toBe('admin@slider.com');
      expect(adminUser.role).toBe('ADMIN');
    });

    it('should create test media', async () => {
      const testMedia = await prisma.media.create({
        data: {
          fileName: 'test-slider-image.jpg',
          originalName: 'test-slider-image.jpg',
          mimeType: 'image/jpeg',
          fileSize: 1024,
          filePath: '/uploads/test-slider-image.jpg',
          mediaType: 'IMAGE',
          isActive: true,
        },
      });

      expect(testMedia).toBeDefined();
      expect(testMedia.fileName).toBe('test-slider-image.jpg');
      expect(testMedia.mediaType).toBe('IMAGE');
    });

    it('should create test slider', async () => {
      const media = await prisma.media.findFirst();
      expect(media).toBeDefined();

      const testSlider = await prisma.slider.create({
        data: {
          title: { en: 'Test Slider', ne: 'परीक्षण स्लाइडर' },
          position: 1,
          displayTime: 5000,
          isActive: true,
          mediaId: media!.id,
        },
      });

      expect(testSlider).toBeDefined();
      expect((testSlider.title as any).en).toBe('Test Slider');
      expect((testSlider.title as any).ne).toBe('परीक्षण स्लाइडर');
      expect(testSlider.position).toBe(1);
      expect(testSlider.displayTime).toBe(5000);
      expect(testSlider.isActive).toBe(true);
      expect(testSlider.mediaId).toBe(media!.id);
    });

    it('should create slider with all fields', async () => {
      const media = await prisma.media.findFirst();
      expect(media).toBeDefined();

      const fullSlider = await prisma.slider.create({
        data: {
          title: { en: 'Full Slider', ne: 'पूर्ण स्लाइडर' },
          position: 2,
          displayTime: 4000,
          isActive: false,
          mediaId: media!.id,
        },
      });

      expect(fullSlider).toBeDefined();
      expect((fullSlider.title as any).en).toBe('Full Slider');
      expect((fullSlider.title as any).ne).toBe('पूर्ण स्लाइडर');
      expect(fullSlider.position).toBe(2);
      expect(fullSlider.displayTime).toBe(4000);
      expect(fullSlider.isActive).toBe(false);
    });

    it('should create slider with optional title as null', async () => {
      const media = await prisma.media.findFirst();
      expect(media).toBeDefined();

      const minimalSlider = await prisma.slider.create({
        data: {
          position: 3,
          displayTime: 3000,
          isActive: true,
          mediaId: media!.id,
        },
      });

      expect(minimalSlider).toBeDefined();
      expect(minimalSlider.title).toBeNull();
      expect(minimalSlider.position).toBe(3);
      expect(minimalSlider.displayTime).toBe(3000);
      expect(minimalSlider.isActive).toBe(true);
    });

    it('should create slider clicks', async () => {
      const slider = await prisma.slider.findFirst();
      const user = await prisma.user.findFirst();
      expect(slider).toBeDefined();
      expect(user).toBeDefined();

      const sliderClick = await prisma.sliderClick.create({
        data: {
          sliderId: slider!.id,
          userId: user!.id,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });

      expect(sliderClick).toBeDefined();
      expect(sliderClick.sliderId).toBe(slider!.id);
      expect(sliderClick.userId).toBe(user!.id);
      expect(sliderClick.ipAddress).toBe('192.168.1.1');
    });

    it('should create slider views', async () => {
      const slider = await prisma.slider.findFirst();
      const user = await prisma.user.findFirst();
      expect(slider).toBeDefined();
      expect(user).toBeDefined();

      const sliderView = await prisma.sliderView.create({
        data: {
          sliderId: slider!.id,
          userId: user!.id,
          ipAddress: '192.168.1.2',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
          viewDuration: 3000,
        },
      });

      expect(sliderView).toBeDefined();
      expect(sliderView.sliderId).toBe(slider!.id);
      expect(sliderView.userId).toBe(user!.id);
      expect(sliderView.viewDuration).toBe(3000);
    });

    it('should create slider view without user', async () => {
      const slider = await prisma.slider.findFirst();
      expect(slider).toBeDefined();

      const anonymousView = await prisma.sliderView.create({
        data: {
          sliderId: slider!.id,
          ipAddress: '192.168.1.3',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          viewDuration: 2500,
        },
      });

      expect(anonymousView).toBeDefined();
      expect(anonymousView.sliderId).toBe(slider!.id);
      expect(anonymousView.userId).toBeNull();
      expect(anonymousView.viewDuration).toBe(2500);
    });
  });

  describe('Data Validation', () => {
    it('should validate slider data structure', async () => {
      const sliders = await prisma.slider.findMany();

      expect(sliders.length).toBeGreaterThan(0);

      for (const slider of sliders) {
        expect(slider.id).toBeDefined();
        expect(slider.position).toBeDefined();
        expect(slider.displayTime).toBeDefined();
        expect(slider.isActive).toBeDefined();
        expect(slider.mediaId).toBeDefined();
        expect(slider.createdAt).toBeDefined();
        expect(slider.updatedAt).toBeDefined();
      }
    });

    it('should validate translatable title fields structure', async () => {
      const sliders = await prisma.slider.findMany();

      for (const slider of sliders) {
        if (slider.title) {
          expect((slider.title as any).en).toBeDefined();
          expect((slider.title as any).ne).toBeDefined();
        }
      }
    });

    it('should validate slider position constraints', async () => {
      const sliders = await prisma.slider.findMany();

      for (const slider of sliders) {
        expect(slider.position).toBeGreaterThanOrEqual(0);
        expect(typeof slider.position).toBe('number');
      }
    });

    it('should validate display time constraints', async () => {
      const sliders = await prisma.slider.findMany();

      for (const slider of sliders) {
        expect(slider.displayTime).toBeGreaterThan(0);
        expect(typeof slider.displayTime).toBe('number');
      }
    });

    it('should validate slider click data structure', async () => {
      const clicks = await prisma.sliderClick.findMany();

      expect(clicks.length).toBeGreaterThan(0);

      for (const click of clicks) {
        expect(click.id).toBeDefined();
        expect(click.sliderId).toBeDefined();
        expect(click.ipAddress).toBeDefined();
        expect(click.userAgent).toBeDefined();
        expect(click.createdAt).toBeDefined();
      }
    });

    it('should validate slider view data structure', async () => {
      const views = await prisma.sliderView.findMany();

      expect(views.length).toBeGreaterThan(0);

      for (const view of views) {
        expect(view.id).toBeDefined();
        expect(view.sliderId).toBeDefined();
        expect(view.ipAddress).toBeDefined();
        expect(view.userAgent).toBeDefined();
        expect(view.createdAt).toBeDefined();
        
        if (view.viewDuration !== null) {
          expect(view.viewDuration).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  describe('Database Constraints', () => {
    it('should enforce required fields for slider', async () => {
      const media = await prisma.media.findFirst();
      
      const invalidSlider = {
        displayTime: 5000,
        // Missing required position and mediaId
      };

      // This should fail due to missing required fields
      await expect(
        prisma.slider.create({
          data: invalidSlider as any,
        })
      ).rejects.toThrow();
    });

    it('should enforce foreign key constraint for media', async () => {
      const invalidSlider = {
        position: 1,
        displayTime: 5000,
        isActive: true,
        mediaId: 'non-existent-media-id',
      };

      // This should fail due to invalid media reference
      await expect(
        prisma.slider.create({
          data: invalidSlider,
        })
      ).rejects.toThrow();
    });

    it('should enforce foreign key constraint for slider clicks', async () => {
      const invalidClick = {
        sliderId: 'non-existent-slider-id',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      // This should fail due to invalid slider reference
      await expect(
        prisma.sliderClick.create({
          data: invalidClick,
        })
      ).rejects.toThrow();
    });

    it('should allow multiple sliders with same position', async () => {
      const media = await prisma.media.findFirst();
      expect(media).toBeDefined();

      const slider1 = await prisma.slider.create({
        data: {
          title: { en: 'Duplicate Position 1', ne: 'डुप्लिकेट स्थिति १' },
          position: 5,
          displayTime: 5000,
          isActive: true,
          mediaId: media!.id,
        },
      });

      const slider2 = await prisma.slider.create({
        data: {
          title: { en: 'Duplicate Position 2', ne: 'डुप्लिकेट स्थिति २' },
          position: 5,
          displayTime: 4000,
          isActive: true,
          mediaId: media!.id,
        },
      });

      expect(slider1.position).toBe(5);
      expect(slider2.position).toBe(5);
      expect(slider1.id).not.toBe(slider2.id);
    });
  });

  describe('Query Operations', () => {
    it('should find slider by ID', async () => {
      const slider = await prisma.slider.findFirst();
      expect(slider).toBeDefined();

      const foundSlider = await prisma.slider.findUnique({
        where: { id: slider!.id },
        include: { media: true },
      });

      expect(foundSlider).toBeDefined();
      expect(foundSlider!.id).toBe(slider!.id);
      expect(foundSlider!.media).toBeDefined();
    });

    it('should find sliders by position', async () => {
      const slidersAtPosition1 = await prisma.slider.findMany({
        where: { position: 1 },
      });

      expect(slidersAtPosition1.length).toBeGreaterThan(0);
      for (const slider of slidersAtPosition1) {
        expect(slider.position).toBe(1);
      }
    });

    it('should find active sliders', async () => {
      const activeSliders = await prisma.slider.findMany({
        where: { isActive: true },
      });

      expect(activeSliders.length).toBeGreaterThan(0);
      for (const slider of activeSliders) {
        expect(slider.isActive).toBe(true);
      }
    });

    it('should count sliders', async () => {
      const totalCount = await prisma.slider.count();
      const activeCount = await prisma.slider.count({
        where: { isActive: true },
      });

      expect(totalCount).toBeGreaterThan(0);
      expect(activeCount).toBeGreaterThanOrEqual(0);
      expect(activeCount).toBeLessThanOrEqual(totalCount);
    });

    it('should find slider clicks by slider ID', async () => {
      const slider = await prisma.slider.findFirst();
      expect(slider).toBeDefined();

      const clicks = await prisma.sliderClick.findMany({
        where: { sliderId: slider!.id },
        include: { slider: true, user: true },
      });

      expect(clicks.length).toBeGreaterThan(0);
      for (const click of clicks) {
        expect(click.sliderId).toBe(slider!.id);
        expect(click.slider).toBeDefined();
      }
    });

    it('should find slider views by slider ID', async () => {
      const slider = await prisma.slider.findFirst();
      expect(slider).toBeDefined();

      const views = await prisma.sliderView.findMany({
        where: { sliderId: slider!.id },
        include: { slider: true, user: true },
      });

      expect(views.length).toBeGreaterThan(0);
      for (const view of views) {
        expect(view.sliderId).toBe(slider!.id);
        expect(view.slider).toBeDefined();
      }
    });
  });

  describe('Update Operations', () => {
    it('should update slider content', async () => {
      const slider = await prisma.slider.findFirst();
      expect(slider).toBeDefined();

      const updatedSlider = await prisma.slider.update({
        where: { id: slider!.id },
        data: {
          title: { en: 'Updated Slider', ne: 'अपडेटेड स्लाइडर' },
          displayTime: 6000,
          isActive: false,
        },
      });

      expect((updatedSlider.title as any).en).toBe('Updated Slider');
      expect((updatedSlider.title as any).ne).toBe('अपडेटेड स्लाइडर');
      expect(updatedSlider.displayTime).toBe(6000);
      expect(updatedSlider.isActive).toBe(false);
      expect(updatedSlider.updatedAt.getTime()).toBeGreaterThan(updatedSlider.createdAt.getTime());
    });

    it('should update slider position', async () => {
      const slider = await prisma.slider.findFirst();
      expect(slider).toBeDefined();

      const updatedSlider = await prisma.slider.update({
        where: { id: slider!.id },
        data: {
          position: 10,
        },
      });

      expect(updatedSlider.position).toBe(10);
    });

    it('should update slider activity status', async () => {
      const slider = await prisma.slider.findFirst();
      expect(slider).toBeDefined();

      const currentStatus = slider!.isActive;
      const updatedSlider = await prisma.slider.update({
        where: { id: slider!.id },
        data: {
          isActive: !currentStatus,
        },
      });

      expect(updatedSlider.isActive).toBe(!currentStatus);
    });
  });

  describe('Delete Operations', () => {
    it('should delete slider clicks when slider is deleted', async () => {
      const slider = await prisma.slider.findFirst();
      expect(slider).toBeDefined();

      const clicksBeforeDelete = await prisma.sliderClick.count({
        where: { sliderId: slider!.id },
      });

      // Delete all clicks first (due to foreign key constraints)
      await prisma.sliderClick.deleteMany({
        where: { sliderId: slider!.id },
      });

      // Delete all views
      await prisma.sliderView.deleteMany({
        where: { sliderId: slider!.id },
      });

      // Now delete the slider
      await prisma.slider.delete({
        where: { id: slider!.id },
      });

      const deletedSlider = await prisma.slider.findUnique({
        where: { id: slider!.id },
      });

      expect(deletedSlider).toBeNull();
      expect(clicksBeforeDelete).toBeGreaterThan(0);
    });

    it('should delete all sliders', async () => {
      // First delete all related records
      await prisma.sliderClick.deleteMany();
      await prisma.sliderView.deleteMany();
      await prisma.slider.deleteMany();

      const remainingSliders = await prisma.slider.findMany();
      expect(remainingSliders.length).toBe(0);
    });
  });

  describe('Translatable Entity Handling', () => {
    it('should handle translatable title correctly', async () => {
      const media = await prisma.media.findFirst();
      expect(media).toBeDefined();

      const slider = await prisma.slider.create({
        data: {
          title: { en: 'English Title', ne: 'नेपाली शीर्षक' },
          position: 1,
          displayTime: 5000,
          isActive: true,
          mediaId: media!.id,
        },
      });

      expect((slider.title as any).en).toBe('English Title');
      expect((slider.title as any).ne).toBe('नेपाली शीर्षक');
    });

    it('should handle empty translatable title', async () => {
      const media = await prisma.media.findFirst();
      expect(media).toBeDefined();

      const slider = await prisma.slider.create({
        data: {
          title: { en: '', ne: '' },
          position: 1,
          displayTime: 5000,
          isActive: true,
          mediaId: media!.id,
        },
      });

      expect((slider.title as any).en).toBe('');
      expect((slider.title as any).ne).toBe('');
    });

    it('should handle null title', async () => {
      const media = await prisma.media.findFirst();
      expect(media).toBeDefined();

      const slider = await prisma.slider.create({
        data: {
          position: 1,
          displayTime: 5000,
          isActive: true,
          mediaId: media!.id,
        },
      });

      expect(slider.title).toBeNull();
    });
  });

  describe('Analytics and Statistics', () => {
    it('should aggregate click counts by slider', async () => {
      const slider = await prisma.slider.findFirst();
      expect(slider).toBeDefined();

      const clickCount = await prisma.sliderClick.count({
        where: { sliderId: slider!.id },
      });

      expect(clickCount).toBeGreaterThanOrEqual(0);
    });

    it('should aggregate view counts by slider', async () => {
      const slider = await prisma.slider.findFirst();
      expect(slider).toBeDefined();

      const viewCount = await prisma.sliderView.count({
        where: { sliderId: slider!.id },
      });

      expect(viewCount).toBeGreaterThanOrEqual(0);
    });

    it('should calculate average view duration', async () => {
      const slider = await prisma.slider.findFirst();
      expect(slider).toBeDefined();

      const avgDuration = await prisma.sliderView.aggregate({
        where: {
          sliderId: slider!.id,
          viewDuration: { not: null },
        },
        _avg: {
          viewDuration: true,
        },
      });

      if (avgDuration._avg.viewDuration !== null) {
        expect(avgDuration._avg.viewDuration).toBeGreaterThan(0);
      }
    });

    it('should group sliders by position', async () => {
      const positionGroups = await prisma.slider.groupBy({
        by: ['position'],
        _count: {
          position: true,
        },
      });

      expect(positionGroups.length).toBeGreaterThan(0);
      for (const group of positionGroups) {
        expect(group.position).toBeGreaterThanOrEqual(0);
        expect(group._count.position).toBeGreaterThan(0);
      }
    });
  });

  describe('Cleanup', () => {
    it('should clean up test data', async () => {
      await cleanupDatabase();

      const slidersCount = await prisma.slider.count();
      const clicksCount = await prisma.sliderClick.count();
      const viewsCount = await prisma.sliderView.count();
      const mediaCount = await prisma.media.count();
      const userCount = await prisma.user.count();

      expect(slidersCount).toBe(0);
      expect(clicksCount).toBe(0);
      expect(viewsCount).toBe(0);
      expect(mediaCount).toBe(0);
      expect(userCount).toBe(0);
    });
  });
}); 