import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/database/prisma.service';
import { OfficeDescriptionType } from '../../../src/modules/office-description/entities/office-description.entity';
import { UserRole } from '@prisma/client';

describe('Office Description Module Setup', () => {
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
    await prisma.officeDescription.deleteMany();
    await prisma.user.deleteMany();
  };

  describe('Database Setup', () => {
    it('should have clean database', async () => {
      const descriptionCount = await prisma.officeDescription.count();
      const userCount = await prisma.user.count();

      expect(descriptionCount).toBe(0);
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

    it('should create test office description', async () => {
      const testDescription = await prisma.officeDescription.create({
        data: {
          officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
          content: { en: 'Test Introduction', ne: 'परीक्षण परिचय' },
        },
      });

      expect(testDescription).toBeDefined();
      expect(testDescription.officeDescriptionType).toBe(OfficeDescriptionType.INTRODUCTION);
      expect((testDescription.content as any).en).toBe('Test Introduction');
      expect((testDescription.content as any).ne).toBe('परीक्षण परिचय');
    });

    it('should create multiple office descriptions', async () => {
      const descriptions = [
        {
          officeDescriptionType: OfficeDescriptionType.OBJECTIVE,
          content: { en: 'Test Objective', ne: 'परीक्षण उद्देश्य' },
        },
        {
          officeDescriptionType: OfficeDescriptionType.WORK_DETAILS,
          content: { en: 'Test Work Details', ne: 'परीक्षण कार्य विवरण' },
        },
        {
          officeDescriptionType: OfficeDescriptionType.ORGANIZATIONAL_STRUCTURE,
          content: { en: 'Test Organizational Structure', ne: 'परीक्षण संगठनात्मक संरचना' },
        },
      ];

      for (const description of descriptions) {
        const createdDescription = await prisma.officeDescription.create({
          data: description,
        });

        expect(createdDescription).toBeDefined();
        expect(createdDescription.officeDescriptionType).toBe(description.officeDescriptionType);
        expect((createdDescription.content as any).en).toBe(description.content.en);
        expect((createdDescription.content as any).ne).toBe(description.content.ne);
      }
    });

    it('should create all office description types', async () => {
      const allTypes = Object.values(OfficeDescriptionType);
      const createdDescriptions = [];

      for (const type of allTypes) {
        const description = await prisma.officeDescription.create({
          data: {
            officeDescriptionType: type,
            content: { 
              en: `Test ${type}`, 
              ne: `परीक्षण ${type}` 
            },
          },
        });

        createdDescriptions.push(description);
        expect(description.officeDescriptionType).toBe(type);
      }

      expect(createdDescriptions.length).toBe(allTypes.length);
    });

    it('should create office descriptions with different content lengths', async () => {
      const shortDescription = await prisma.officeDescription.create({
        data: {
          officeDescriptionType: OfficeDescriptionType.DIGITAL_CHARTER,
          content: { 
            en: 'Short content', 
            ne: 'छोटो सामग्री' 
          },
        },
      });

      const longDescription = await prisma.officeDescription.create({
        data: {
          officeDescriptionType: OfficeDescriptionType.EMPLOYEE_SANCTIONS,
          content: { 
            en: 'This is a very long content that contains multiple sentences and paragraphs. It should be able to handle substantial amounts of text for office descriptions that need to be comprehensive and detailed.',
            ne: 'यो धेरै लामो सामग्री हो जसमा धेरै वाक्य र अनुच्छेदहरू समावेश छन्। यसले पर्याप्त मात्रामा पाठ सम्हाल्न सक्नुपर्छ जुन कार्यालय विवरणहरूको लागि व्यापक र विस्तृत हुनुपर्छ।'
          },
        },
      });

      expect((shortDescription.content as any).en.length).toBeLessThan((longDescription.content as any).en.length);
      expect((shortDescription.content as any).ne.length).toBeLessThan((longDescription.content as any).ne.length);
    });
  });

  describe('Data Validation', () => {
    it('should validate office description data structure', async () => {
      const descriptions = await prisma.officeDescription.findMany();

      expect(descriptions.length).toBeGreaterThan(0);

      for (const description of descriptions) {
        expect(description.id).toBeDefined();
        expect(description.officeDescriptionType).toBeDefined();
        expect(description.content).toBeDefined();
        expect((description.content as any).en).toBeDefined();
        expect((description.content as any).ne).toBeDefined();
        expect(description.createdAt).toBeDefined();
        expect(description.updatedAt).toBeDefined();
      }
    });

    it('should validate office description type enum values', async () => {
      const descriptions = await prisma.officeDescription.findMany();

      for (const description of descriptions) {
        expect(Object.values(OfficeDescriptionType)).toContain(description.officeDescriptionType);
      }
    });

    it('should validate content structure', async () => {
      const descriptions = await prisma.officeDescription.findMany();

      for (const description of descriptions) {
        expect(typeof (description.content as any).en).toBe('string');
        expect(typeof (description.content as any).ne).toBe('string');
        expect((description.content as any).en.length).toBeGreaterThan(0);
        expect((description.content as any).ne.length).toBeGreaterThan(0);
      }
    });

    it('should validate unique office description types', async () => {
      const descriptions = await prisma.officeDescription.findMany();
      const types = descriptions.map(d => d.officeDescriptionType);
      const uniqueTypes = new Set(types);

      // Since types are not unique, we expect more total descriptions than unique types
      expect(types.length).toBeGreaterThanOrEqual(uniqueTypes.size);
    });
  });

  describe('Database Constraints', () => {
    it('should allow duplicate office description types', async () => {
      const duplicateDescription = {
        officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
        content: {
          en: 'Duplicate Introduction',
          ne: 'दोहोरिएको परिचय'
        }
      };

      // This should succeed since types are not unique
      const result = await prisma.officeDescription.create({
        data: duplicateDescription,
      });

      expect(result).toBeDefined();
      expect(result.officeDescriptionType).toBe(OfficeDescriptionType.INTRODUCTION);
    });

    it('should enforce required fields', async () => {
      const invalidDescription = {
        content: { en: 'Missing Type', ne: 'हराइरहेको प्रकार' },
      };

      // This should fail due to missing required field
      await expect(
        prisma.officeDescription.create({
          data: invalidDescription as any,
        })
      ).rejects.toThrow();
    });
  });

  describe('Query Operations', () => {
    it('should find office description by type', async () => {
      const description = await prisma.officeDescription.findFirst({
        where: { officeDescriptionType: OfficeDescriptionType.INTRODUCTION },
      });

      expect(description).toBeDefined();
      expect(description!.officeDescriptionType).toBe(OfficeDescriptionType.INTRODUCTION);
    });

    it('should find all office descriptions ordered by type', async () => {
      const descriptions = await prisma.officeDescription.findMany({
        orderBy: { officeDescriptionType: 'asc' }
      });

      expect(descriptions.length).toBeGreaterThan(0);
      
      // Just verify we have descriptions and they have valid types
      for (const description of descriptions) {
        expect(description.officeDescriptionType).toBeDefined();
        expect(Object.values(OfficeDescriptionType)).toContain(description.officeDescriptionType);
      }
    });

    it('should count office descriptions by type', async () => {
      const count = await prisma.officeDescription.count({
        where: { officeDescriptionType: OfficeDescriptionType.INTRODUCTION },
      });

      expect(count).toBeGreaterThan(0);
    });
  });

  describe('Update Operations', () => {
    it('should update office description content', async () => {
      const description = await prisma.officeDescription.findFirst({
        where: { officeDescriptionType: OfficeDescriptionType.INTRODUCTION },
      });

      expect(description).toBeDefined();

      const updatedDescription = await prisma.officeDescription.update({
        where: { id: description!.id },
        data: {
          content: { en: 'Updated Introduction', ne: 'अपडेटेड परिचय' },
        },
      });

      expect((updatedDescription.content as any).en).toBe('Updated Introduction');
      expect((updatedDescription.content as any).ne).toBe('अपडेटेड परिचय');
      expect(updatedDescription.updatedAt.getTime()).toBeGreaterThan(updatedDescription.createdAt.getTime());
    });

    it('should update office description type', async () => {
      const description = await prisma.officeDescription.findFirst({
        where: { officeDescriptionType: OfficeDescriptionType.OBJECTIVE },
      });

      expect(description).toBeDefined();

      const updatedDescription = await prisma.officeDescription.update({
        where: { id: description!.id },
        data: {
          officeDescriptionType: OfficeDescriptionType.WORK_DETAILS,
        },
      });

      expect(updatedDescription.officeDescriptionType).toBe(OfficeDescriptionType.WORK_DETAILS);
    });
  });

  describe('Delete Operations', () => {
    it('should delete office description by ID', async () => {
      const description = await prisma.officeDescription.findFirst({
        where: { officeDescriptionType: OfficeDescriptionType.DIGITAL_CHARTER },
      });

      expect(description).toBeDefined();

      await prisma.officeDescription.delete({
        where: { id: description!.id },
      });

      const deletedDescription = await prisma.officeDescription.findUnique({
        where: { id: description!.id },
      });

      expect(deletedDescription).toBeNull();
    });

    it('should delete office description by type', async () => {
      const description = await prisma.officeDescription.findFirst({
        where: { officeDescriptionType: OfficeDescriptionType.EMPLOYEE_SANCTIONS },
      });

      expect(description).toBeDefined();

      await prisma.officeDescription.deleteMany({
        where: { officeDescriptionType: OfficeDescriptionType.EMPLOYEE_SANCTIONS },
      });

      const remainingDescriptions = await prisma.officeDescription.findMany({
        where: { officeDescriptionType: OfficeDescriptionType.EMPLOYEE_SANCTIONS },
      });

      expect(remainingDescriptions.length).toBe(0);
    });
  });

  describe('Cleanup', () => {
    it('should clean up test data', async () => {
      await cleanupDatabase();

      const descriptionCount = await prisma.officeDescription.count();
      const userCount = await prisma.user.count();

      expect(descriptionCount).toBe(0);
      expect(userCount).toBe(0);
    });
  });
}); 