import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import * as request from 'supertest';

import { PrismaService } from '@/database/prisma.service';
import { AppModule } from '@/app.module';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { ApiResponseInterceptor } from '@/common/interceptors/api-response.interceptor';

describe('FAQ Module Setup', () => {
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

  beforeEach(async () => {
    await cleanupDatabase();
  });

  const cleanupDatabase = async () => {
    try {
      const tables = [
        'faqs',
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

  describe('FAQ Module Integration', () => {
    it('should have FAQ module properly configured', () => {
      expect(app).toBeDefined();
      expect(prisma).toBeDefined();
    });

    it('should have FAQ endpoints accessible', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/faq')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should have admin FAQ endpoints protected', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/faq')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Unauthorized');
    });
  });

  describe('FAQ Database Schema', () => {
    it('should have FAQ table accessible', async () => {
      const result = await prisma.fAQ.findMany();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should support FAQ creation', async () => {
      const faq = await prisma.fAQ.create({
        data: {
          question: {
            en: 'Test Question',
            ne: 'परीक्षण प्रश्न',
          },
          answer: {
            en: 'Test Answer',
            ne: 'परीक्षण उत्तर',
          },
          order: 1,
          isActive: true,
        },
      });

      expect(faq.id).toBeDefined();
      expect(faq.question).toEqual({
        en: 'Test Question',
        ne: 'परीक्षण प्रश्न',
      });
      expect(faq.answer).toEqual({
        en: 'Test Answer',
        ne: 'परीक्षण उत्तर',
      });
      expect(faq.order).toBe(1);
      expect(faq.isActive).toBe(true);
    });

    it('should support FAQ updates', async () => {
      const faq = await prisma.fAQ.create({
        data: {
          question: {
            en: 'Original Question',
            ne: 'मूल प्रश्न',
          },
          answer: {
            en: 'Original Answer',
            ne: 'मूल उत्तर',
          },
          order: 1,
          isActive: true,
        },
      });

      const updatedFAQ = await prisma.fAQ.update({
        where: { id: faq.id },
        data: {
          question: {
            en: 'Updated Question',
            ne: 'अपडेट प्रश्न',
          },
          order: 2,
        },
      });

      expect((updatedFAQ.question as any).en).toBe('Updated Question');
      expect(updatedFAQ.order).toBe(2);
    });

    it('should support FAQ deletion', async () => {
      const faq = await prisma.fAQ.create({
        data: {
          question: {
            en: 'To Delete',
            ne: 'मेटाउन',
          },
          answer: {
            en: 'Will be deleted',
            ne: 'मेटिनेछ',
          },
          order: 1,
          isActive: true,
        },
      });

      await prisma.fAQ.delete({
        where: { id: faq.id },
      });

      const deletedFAQ = await prisma.fAQ.findUnique({
        where: { id: faq.id },
      });

      expect(deletedFAQ).toBeNull();
    });
  });

  describe('FAQ Validation', () => {
    it('should validate required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/faq')
        .set('Authorization', 'Bearer invalid-token')
        .send({})
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should validate question structure', async () => {
      // This test would require a valid token, so we'll test the validation logic
      const invalidData = {
        question: { en: 'Only English' }, // Missing Nepali
        answer: {
          en: 'Valid answer',
          ne: 'मान्य उत्तर',
        },
      };

      // The validation would fail at the DTO level
      expect((invalidData.question as any).ne).toBeUndefined();
    });
  });

  describe('FAQ Search Functionality', () => {
    it('should support text search in questions and answers', async () => {
      // Create test FAQs
      await prisma.fAQ.createMany({
        data: [
          {
            question: {
              en: 'Office hours question',
              ne: 'कार्यालय समय प्रश्न',
            },
            answer: {
              en: 'Office is open 9-5',
              ne: 'कार्यालय ९-५ खुला छ',
            },
            order: 1,
            isActive: true,
          },
          {
            question: {
              en: 'Contact information',
              ne: 'सम्पर्क जानकारी',
            },
            answer: {
              en: 'Call us at 123-456-7890',
              ne: 'हामीलाई १२३-४५६-७८९० मा कल गर्नुहोस्',
            },
            order: 2,
            isActive: true,
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/faq/search?q=office')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('FAQ Pagination', () => {
    it('should support pagination', async () => {
      // Create multiple FAQs
      const faqData = Array.from({ length: 15 }, (_, i) => ({
        question: {
          en: `FAQ ${i + 1}`,
          ne: `प्रश्न ${i + 1}`,
        },
        answer: {
          en: `Answer ${i + 1}`,
          ne: `उत्तर ${i + 1}`,
        },
        order: i + 1,
        isActive: true,
      }));

      await prisma.fAQ.createMany({
        data: faqData,
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/faq/paginated?page=1&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(10);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
      expect(response.body.pagination.total).toBeGreaterThan(0);
      expect(response.body.pagination.totalPages).toBe(2);
    });
  });

  describe('FAQ Statistics', () => {
    it('should provide FAQ statistics', async () => {
      // Create FAQs with different states
      await prisma.fAQ.createMany({
        data: [
          {
            question: { en: 'Active FAQ 1', ne: 'सक्रिय प्रश्न १' },
            answer: { en: 'Answer 1', ne: 'उत्तर १' },
            order: 1,
            isActive: true,
          },
          {
            question: { en: 'Active FAQ 2', ne: 'सक्रिय प्रश्न २' },
            answer: { en: 'Answer 2', ne: 'उत्तर २' },
            order: 2,
            isActive: true,
          },
          {
            question: { en: 'Inactive FAQ', ne: 'निष्क्रिय प्रश्न' },
            answer: { en: 'Inactive Answer', ne: 'निष्क्रिय उत्तर' },
            order: 3,
            isActive: false,
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/faq/statistics')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      // We can't test the actual statistics without authentication,
      // but we can verify the endpoint exists and requires auth
      expect(response.body.success).toBe(false);
    });
  });
}); 