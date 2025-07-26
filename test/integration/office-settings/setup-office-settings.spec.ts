import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/database/prisma.service';
import { UserRole } from '@prisma/client';

describe('Office Settings Module Setup', () => {
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
    await prisma.officeSettings.deleteMany();
    await prisma.user.deleteMany();
  };

  describe('Database Setup', () => {
    it('should have clean database', async () => {
      const settingsCount = await prisma.officeSettings.count();
      const userCount = await prisma.user.count();

      expect(settingsCount).toBe(0);
      expect(userCount).toBe(0);
    });
  });

  describe('Test Data Creation', () => {
    it('should create test users', async () => {
      // Create regular user
      const testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: 'hashedPassword',
          role: 'VIEWER' as UserRole,
          firstName: 'Test',
          lastName: 'User',
        },
      });

      // Create admin user
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          password: '$2b$10$test',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          isActive: true,
        },
      });

      expect(testUser).toBeDefined();
      expect(testUser.email).toBe('test@example.com');
      expect(testUser.role).toBe('VIEWER');

      expect(adminUser).toBeDefined();
      expect(adminUser.email).toBe('admin@example.com');
      expect(adminUser.role).toBe('ADMIN');
    });

    it('should create test office settings', async () => {
      const testSettings = await prisma.officeSettings.create({
        data: {
          directorate: { en: 'Test Directorate', ne: 'परीक्षण निर्देशनालय' },
          officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
          officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
          email: 'test@example.gov.np',
          phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
        },
      });

      expect(testSettings).toBeDefined();
      expect((testSettings.directorate as any).en).toBe('Test Directorate');
      expect((testSettings.directorate as any).ne).toBe('परीक्षण निर्देशनालय');
      expect(testSettings.email).toBe('test@example.gov.np');
    });

    it('should create office settings with all fields', async () => {
      const fullSettings = await prisma.officeSettings.create({
        data: {
          directorate: { en: 'Full Directorate', ne: 'पूर्ण निर्देशनालय' },
          officeName: { en: 'Full Office', ne: 'पूर्ण कार्यालय' },
          officeAddress: { en: 'Full Address', ne: 'पूर्ण ठेगाना' },
          backgroundPhoto: 'test-photo.jpg',
          email: 'full@example.gov.np',
          phoneNumber: { en: '+977-987654321', ne: '+९७७-९८७६५४३२१' },
          xLink: 'https://x.com/test',
          mapIframe: '<iframe>test</iframe>',
          website: 'https://test.gov.np',
          youtube: 'https://youtube.com/test',
        },
      });

      expect(fullSettings).toBeDefined();
      expect(fullSettings.backgroundPhoto).toBe('test-photo.jpg');
      expect(fullSettings.xLink).toBe('https://x.com/test');
      expect(fullSettings.website).toBe('https://test.gov.np');
      expect(fullSettings.youtube).toBe('https://youtube.com/test');
    });

    it('should create office settings with optional fields as null', async () => {
      const minimalSettings = await prisma.officeSettings.create({
        data: {
          directorate: { en: 'Minimal Directorate', ne: 'न्यूनतम निर्देशनालय' },
          officeName: { en: 'Minimal Office', ne: 'न्यूनतम कार्यालय' },
          officeAddress: { en: 'Minimal Address', ne: 'न्यूनतम ठेगाना' },
          email: 'minimal@example.gov.np',
          phoneNumber: { en: '+977-111111111', ne: '+९७७-१११११११११' },
        },
      });

      expect(minimalSettings).toBeDefined();
      expect(minimalSettings.backgroundPhoto).toBeNull();
      expect(minimalSettings.xLink).toBeNull();
      expect(minimalSettings.mapIframe).toBeNull();
      expect(minimalSettings.website).toBeNull();
      expect(minimalSettings.youtube).toBeNull();
    });
  });

  describe('Data Validation', () => {
    it('should validate office settings data structure', async () => {
      const settings = await prisma.officeSettings.findMany();

      expect(settings.length).toBeGreaterThan(0);

      for (const setting of settings) {
        expect(setting.id).toBeDefined();
        expect(setting.directorate).toBeDefined();
        expect(setting.officeName).toBeDefined();
        expect(setting.officeAddress).toBeDefined();
        expect(setting.email).toBeDefined();
        expect(setting.phoneNumber).toBeDefined();
        expect(setting.createdAt).toBeDefined();
        expect(setting.updatedAt).toBeDefined();
      }
    });

    it('should validate translatable fields structure', async () => {
      const settings = await prisma.officeSettings.findMany();

      for (const setting of settings) {
        expect((setting.directorate as any).en).toBeDefined();
        expect((setting.directorate as any).ne).toBeDefined();
        expect((setting.officeName as any).en).toBeDefined();
        expect((setting.officeName as any).ne).toBeDefined();
        expect((setting.officeAddress as any).en).toBeDefined();
        expect((setting.officeAddress as any).ne).toBeDefined();
        expect((setting.phoneNumber as any).en).toBeDefined();
        expect((setting.phoneNumber as any).ne).toBeDefined();
      }
    });

    it('should validate email format', async () => {
      const settings = await prisma.officeSettings.findMany();

      for (const setting of settings) {
        expect(setting.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      }
    });

    it('should validate URL formats when provided', async () => {
      const settings = await prisma.officeSettings.findMany();

      for (const setting of settings) {
        if (setting.website) {
          expect(setting.website).toMatch(/^https?:\/\/.+/);
        }
        if (setting.xLink) {
          expect(setting.xLink).toMatch(/^https?:\/\/.+/);
        }
        if (setting.youtube) {
          expect(setting.youtube).toMatch(/^https?:\/\/.+/);
        }
      }
    });
  });

  describe('Database Constraints', () => {
    it('should enforce required fields', async () => {
      const invalidSettings = {
        email: 'test@example.gov.np',
        // Missing required fields
      };

      // This should fail due to missing required fields
      await expect(
        prisma.officeSettings.create({
          data: invalidSettings as any,
        })
      ).rejects.toThrow();
    });

    it('should allow multiple office settings records', async () => {
      const additionalSettings = {
        directorate: { en: 'Additional Directorate', ne: 'अतिरिक्त निर्देशनालय' },
        officeName: { en: 'Additional Office', ne: 'अतिरिक्त कार्यालय' },
        officeAddress: { en: 'Additional Address', ne: 'अतिरिक्त ठेगाना' },
        email: 'additional@example.gov.np',
        phoneNumber: { en: '+977-222222222', ne: '+९७७-२२२२२२२२२' },
      };

      // This should succeed
      const result = await prisma.officeSettings.create({
        data: additionalSettings,
      });

      expect(result).toBeDefined();
      expect(result.email).toBe('additional@example.gov.np');
    });
  });

  describe('Query Operations', () => {
    it('should find office settings by ID', async () => {
      const settings = await prisma.officeSettings.findFirst();
      expect(settings).toBeDefined();

      const foundSettings = await prisma.officeSettings.findUnique({
        where: { id: settings!.id },
      });

      expect(foundSettings).toBeDefined();
      expect(foundSettings!.id).toBe(settings!.id);
    });

    it('should find first office settings', async () => {
      const settings = await prisma.officeSettings.findFirst();
      expect(settings).toBeDefined();
      expect(settings!.id).toBeDefined();
    });

    it('should count office settings', async () => {
      const count = await prisma.officeSettings.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('Update Operations', () => {
    it('should update office settings content', async () => {
      const settings = await prisma.officeSettings.findFirst();
      expect(settings).toBeDefined();

      const updatedSettings = await prisma.officeSettings.update({
        where: { id: settings!.id },
        data: {
          email: 'updated@example.gov.np',
          website: 'https://updated.gov.np',
        },
      });

      expect(updatedSettings.email).toBe('updated@example.gov.np');
      expect(updatedSettings.website).toBe('https://updated.gov.np');
      expect(updatedSettings.updatedAt.getTime()).toBeGreaterThan(updatedSettings.createdAt.getTime());
    });

    it('should update translatable fields', async () => {
      const settings = await prisma.officeSettings.findFirst();
      expect(settings).toBeDefined();

      const updatedSettings = await prisma.officeSettings.update({
        where: { id: settings!.id },
        data: {
          directorate: { en: 'Updated Directorate', ne: 'अपडेटेड निर्देशनालय' },
          officeName: { en: 'Updated Office', ne: 'अपडेटेड कार्यालय' },
        },
      });

      expect((updatedSettings.directorate as any).en).toBe('Updated Directorate');
      expect((updatedSettings.directorate as any).ne).toBe('अपडेटेड निर्देशनालय');
      expect((updatedSettings.officeName as any).en).toBe('Updated Office');
      expect((updatedSettings.officeName as any).ne).toBe('अपडेटेड कार्यालय');
    });

    it('should update background photo', async () => {
      const settings = await prisma.officeSettings.findFirst();
      expect(settings).toBeDefined();

      const updatedSettings = await prisma.officeSettings.update({
        where: { id: settings!.id },
        data: {
          backgroundPhoto: 'updated-photo.jpg',
        },
      });

      expect(updatedSettings.backgroundPhoto).toBe('updated-photo.jpg');
    });
  });

  describe('Delete Operations', () => {
    it('should delete office settings by ID', async () => {
      const settings = await prisma.officeSettings.findFirst();
      expect(settings).toBeDefined();

      await prisma.officeSettings.delete({
        where: { id: settings!.id },
      });

      const deletedSettings = await prisma.officeSettings.findUnique({
        where: { id: settings!.id },
      });

      expect(deletedSettings).toBeNull();
    });

    it('should delete all office settings', async () => {
      await prisma.officeSettings.deleteMany();

      const remainingSettings = await prisma.officeSettings.findMany();
      expect(remainingSettings.length).toBe(0);
    });
  });

  describe('Translatable Entity Handling', () => {
    it('should handle translatable entities correctly', async () => {
      const settings = await prisma.officeSettings.create({
        data: {
          directorate: { en: 'English Directorate', ne: 'नेपाली निर्देशनालय' },
          officeName: { en: 'English Office', ne: 'नेपाली कार्यालय' },
          officeAddress: { en: 'English Address', ne: 'नेपाली ठेगाना' },
          email: 'translatable@example.gov.np',
          phoneNumber: { en: '+977-333333333', ne: '+९७७-३३३३३३३३३' },
        },
      });

      expect((settings.directorate as any).en).toBe('English Directorate');
      expect((settings.directorate as any).ne).toBe('नेपाली निर्देशनालय');
      expect((settings.officeName as any).en).toBe('English Office');
      expect((settings.officeName as any).ne).toBe('नेपाली कार्यालय');
    });

    it('should handle empty translatable fields', async () => {
      const settings = await prisma.officeSettings.create({
        data: {
          directorate: { en: '', ne: '' },
          officeName: { en: '', ne: '' },
          officeAddress: { en: '', ne: '' },
          email: 'empty@example.gov.np',
          phoneNumber: { en: '', ne: '' },
        },
      });

      expect((settings.directorate as any).en).toBe('');
      expect((settings.directorate as any).ne).toBe('');
      expect((settings.officeName as any).en).toBe('');
      expect((settings.officeName as any).ne).toBe('');
    });
  });

  describe('Cleanup', () => {
    it('should clean up test data', async () => {
      await cleanupDatabase();

      const settingsCount = await prisma.officeSettings.count();
      const userCount = await prisma.user.count();

      expect(settingsCount).toBe(0);
      expect(userCount).toBe(0);
    });
  });
}); 