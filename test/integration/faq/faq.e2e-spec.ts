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

describe('FAQ Management (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
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
    await createTestFAQs();
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

  const createTestFAQs = async () => {
    // Create test FAQs directly in database
    await prisma.fAQ.createMany({
      data: [
        {
          question: {
            en: 'What are the office hours?',
            ne: 'कार्यालयको समय के हो?',
          },
          answer: {
            en: 'Our office is open from 9 AM to 5 PM Monday to Friday.',
            ne: 'हाम्रो कार्यालय सोमबार देखि शुक्रबार सम्म बिहान ९ बजे देखि बेलुका ५ बजेसम्म खुला हुन्छ।',
          },
          order: 1,
          isActive: true,
        },
        {
          question: {
            en: 'How can I contact the office?',
            ne: 'म कसरी कार्यालयसँग सम्पर्क गर्न सक्छु?',
          },
          answer: {
            en: 'You can contact us by phone at +977-123456789 or by email at info@office.gov.np.',
            ne: 'तपाईंले फोन +९७७-१२३४५६७८९ मा वा इमेल info@office.gov.np मा हामीसँग सम्पर्क गर्न सक्नुहुन्छ।',
          },
          order: 2,
          isActive: true,
        },
        {
          question: {
            en: 'What documents do I need to bring?',
            ne: 'मले के के कागजातहरू ल्याउनुपर्छ?',
          },
          answer: {
            en: 'Please bring your citizenship certificate, passport size photos, and any relevant supporting documents.',
            ne: 'कृपया आफ्नो नागरिकता प्रमाणपत्र, पासपोर्ट साइजको फोटोहरू, र सम्बन्धित सहायक कागजातहरू ल्याउनुहोस्।',
          },
          order: 3,
          isActive: false,
        },
      ],
    });
  };

  describe('GET /api/v1/faq', () => {
    it('should get all active FAQs', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/faq')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Should only return active FAQs
      const activeFAQs = response.body.data.filter((faq: any) => faq.isActive);
      expect(activeFAQs.length).toBe(2);
    });

    it('should get all FAQs including inactive', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/faq?isActive=false')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter by language', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/faq?lang=en')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/faq/paginated', () => {
    it('should get FAQs with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/faq/paginated?page=1&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
      expect(response.body.pagination.total).toBeGreaterThan(0);
    });

    it('should handle pagination with custom parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/faq/paginated?page=2&limit=5&isActive=true')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/v1/faq/search', () => {
    it('should search FAQs by term', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/faq/search?q=office')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search with active filter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/faq/search?q=contact&isActive=true')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return empty array for non-matching search', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/faq/search?q=nonexistentterm')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/faq/random', () => {
    it('should get random FAQs', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/faq/random?limit=3')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(3);
    });

    it('should get random FAQs with language filter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/faq/random?limit=2&lang=en')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /api/v1/faq/popular', () => {
    it('should get popular FAQs', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/faq/popular?limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/faq/active', () => {
    it('should get only active FAQs', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/faq/active')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // All returned FAQs should be active
      const allActive = response.body.data.every((faq: any) => faq.isActive);
      expect(allActive).toBe(true);
    });
  });

  describe('GET /api/v1/faq/:id', () => {
    it('should get FAQ by ID', async () => {
      // First get a list to find an ID
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/faq')
        .expect(200);

      const firstFAQ = listResponse.body.data[0];
      const faqId = firstFAQ.id;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/faq/${faqId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(faqId);
      expect(response.body.data.question).toBeDefined();
      expect(response.body.data.answer).toBeDefined();
    });

    it('should return 404 for non-existent FAQ', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/faq/nonexistent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should handle invalid pagination parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/faq/paginated?page=-1&limit=0')
        .expect(200); // Should still return 200 but with default values

      expect(response.body.success).toBe(true);
    });

    it('should handle missing search query', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/faq/search')
        .expect(400); // Should return 400 for missing required query parameter

      expect(response.body.success).toBe(false);
    });
  });
}); 